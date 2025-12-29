import streamlit as st
import pandas as pd
import plotly.express as px

from consts import MUSCLE_OPTIONS, EXERCISE_MAP, EXERCISE_OPTIONS
from api_client import get_prs, create_pr, delete_pr, update_pr

# Configuration 
st.set_page_config(page_title="Gym PR Tracker", page_icon="💪", layout="centered")

# Callbacks 

def update_muscle_on_change():

    selected = st.session_state.ex_select
    if selected in EXERCISE_MAP:
        st.session_state.muscle_select = EXERCISE_MAP[selected]
    else:
        st.session_state.muscle_select = "Other"

def save_pr_callback():
    selected_ex = st.session_state.ex_select
    muscle_group = st.session_state.muscle_select
    weight = st.session_state.weight_input
    reps = st.session_state.reps_input
    
    if selected_ex == "Other...":
        exercise_name = st.session_state.get("custom_ex_input", "")
    else:
        exercise_name = selected_ex

    if not exercise_name or len(exercise_name) < 2:
        st.warning("Exercise name must be at least 2 characters.")
        return

    res = create_pr(exercise_name, muscle_group, weight, reps)
    
    if res and res.status_code == 201:
        st.success(f"Added {exercise_name} ({muscle_group})!")
        
        # Reset Logic
        st.session_state.weight_input = 0.0
        st.session_state.reps_input = 1
        if "custom_ex_input" in st.session_state:
            st.session_state.custom_ex_input = ""
            
        st.session_state.ex_select = EXERCISE_OPTIONS[0]
        
        first_exercise = EXERCISE_OPTIONS[0]
        if first_exercise in EXERCISE_MAP:
            st.session_state.muscle_select = EXERCISE_MAP[first_exercise]
        else:
             st.session_state.muscle_select = "Other"
            
    else:
        st.error("Error saving data.")

# UI Header 
st.title("💪 Gym PR Tracker")
st.markdown("Track your personal records, visualize progress, and analyze muscle balance.")

# Add New PR 
with st.expander("➕ Log a New Record", expanded=True):
    col1, col2 = st.columns(2)
    with col1:
        selected_ex = st.selectbox(
            "Choose Exercise", 
            EXERCISE_OPTIONS, 
            key="ex_select", 
            on_change=update_muscle_on_change 
        )
        
        if selected_ex == "Other...":
            st.text_input("Type Custom Exercise Name", placeholder="e.g. Bulgarian Split Squat", key="custom_ex_input")

    with col2:
        st.selectbox("Muscle Group", MUSCLE_OPTIONS, key="muscle_select")

    col3, col4 = st.columns(2)
    with col3:
        st.number_input("Weight (kg)", min_value=0.0, step=0.5, format="%.1f", key="weight_input")
    with col4:
        st.number_input("Reps", min_value=1, step=1, key="reps_input")
    
    st.button("Save PR", type="primary", on_click=save_pr_callback)

st.divider()
st.subheader("📊 Your Stats")

data = get_prs()

if data:
    df = pd.DataFrame(data)
    if 'performed_at' in df.columns:
        df['performed_at'] = pd.to_datetime(df['performed_at'])
        df = df.sort_values(by='performed_at')

    tab1, tab2 = st.tabs(["📈 Charts & Analysis", "📋 Raw Data"])

    with tab1:
        col_charts_1, col_charts_2 = st.columns(2)
        
        with col_charts_1:
            st.caption("Muscle Group Distribution")
            if 'muscle_group' in df.columns:
                 fig_pie = px.pie(df, names='muscle_group', title='Workouts by Muscle Group', hole=0.3)
                 fig_pie.update_traces(textinfo='label+percent', textposition='inside')
                 fig_pie.update_layout(showlegend=False, margin=dict(t=30, b=0, l=0, r=0), height=250)
                 st.plotly_chart(fig_pie, use_container_width=True)
            else:
                st.warning("No muscle data available.")

        with col_charts_2:
            st.caption("Strength Progress")
            all_exercises = ["Select Exercise..."] + sorted(list(set(df['exercise'])))
            selected_exercise = st.selectbox("Select to see progress:", all_exercises)
            
            if selected_exercise != "Select Exercise...":
                filtered_df = df[df['exercise'] == selected_exercise]
                st.line_chart(filtered_df, x='performed_at', y='weight', color="#FF4B4B")
            else:
                st.info("Select an exercise to view chart.")

    with tab2:
        if 'muscle_group' in df.columns:
            filter_muscle = st.multiselect("Filter by Muscle Group:", options=list(set(df['muscle_group'])))
            df_display = df
            if filter_muscle:
                df_display = df[df['muscle_group'].isin(filter_muscle)]
            
            st.dataframe(
                df_display[['exercise', 'muscle_group', 'weight', 'reps', 'performed_at']],
                use_container_width=True,
                hide_index=True,
                column_config={
                    "performed_at": st.column_config.DatetimeColumn("Date", format="D MMM YYYY, HH:mm"),
                    "weight": st.column_config.NumberColumn("Weight (kg)"),
                }
            )
        else:
             st.dataframe(df)

        st.divider()
        st.subheader("✏️ Manage Records")
        
        if data:
            pr_options = {
                f"{pr['exercise']} | {pr['weight']}kg | {pr.get('performed_at', '')[:10]}": pr 
                for pr in data
            }
            
            selected_key = st.selectbox("Select a record to edit or remove:", options=list(pr_options.keys()), key="manage_pr_select")
            selected_pr = pr_options[selected_key]
            
            action = st.radio("Action", ["Edit", "Delete"], horizontal=True)

            if action == "Delete":
                if st.button("Delete Selected", type="primary"):
                    success = delete_pr(selected_pr['id'])
                    
                    if success:
                        st.success("Record deleted successfully!")
                        import time
                        time.sleep(1) 
                        st.rerun()
                    else:
                        st.error("Failed to delete record. Check server connection.")
            
            elif action == "Edit":
                with st.form(key="edit_pr_form"):
                    col_edit_1, col_edit_2 = st.columns(2)
                    with col_edit_1:
                        new_weight = st.number_input("Weight (kg)", value=float(selected_pr['weight']), step=0.5)
                    with col_edit_2:
                        new_reps = st.number_input("Reps", value=int(selected_pr['reps']), step=1)
                    
                    if st.form_submit_button("Update PR"):
                        update_data = {
                            "weight": new_weight,
                            "reps": new_reps
                        }
                        res = update_pr(selected_pr['id'], update_data)
                        if res and res.status_code == 200:
                            st.success("PR updated successfully!")
                            import time
                            time.sleep(1)
                            st.rerun()
                        else:
                            st.error(f"Update failed. Status: {res.status_code if res else 'ConnErr'} Detail: {res.text if res else 'Check backend'}")