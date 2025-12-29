import sys
import os
from streamlit.testing.v1 import AppTest

# Path Setup 
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend')))

# Basic Startup Test
def test_app_starts_correctly():

    at = AppTest.from_file("frontend/app.py", default_timeout=10)
    at.run()
    
    if at.exception:
        print(at.exception)
    
    assert not at.exception
    assert "Gym PR Tracker" in at.title[0].value

# Validation Test for short exercise name
def test_frontend_validation_short_name():

    at = AppTest.from_file("frontend/app.py", default_timeout=10)
    at.run()

    at.selectbox(key="ex_select").set_value("Other...")
    at.run() 

    at.text_input(key="custom_ex_input").set_value("A")
    at.button[0].click()
    at.run()

    assert len(at.warning) > 0
    assert "at least 2 characters" in at.warning[0].value

# Happy Path Test
def test_frontend_happy_path_selection():

    at = AppTest.from_file("frontend/app.py", default_timeout=10)
    at.run()

    at.selectbox(key="ex_select").set_value("Squat")
    at.number_input(key="weight_input").set_value(100.0)
    
    at.button[0].click()
    at.run()

    assert len(at.error) == 0

# Success message check
def test_muscle_group_auto_select():

    at = AppTest.from_file("frontend/app.py", default_timeout=10)
    at.run()

    at.selectbox(key="ex_select").set_value("Deadlift")
    at.run()
    assert at.selectbox(key="muscle_select").value == "Back"
    
    at.selectbox(key="ex_select").set_value("Bench Press")
    at.run()
    assert at.selectbox(key="muscle_select").value == "Chest"

# Delete Flow Test
def test_frontend_delete_flow():

    at = AppTest.from_file("frontend/app.py", default_timeout=10)
    at.run()

    # Create a record to delete
    at.selectbox(key="ex_select").set_value("Squat")
    at.number_input(key="weight_input").set_value(999.0)
    at.button[0].click()
    at.run()

    # Find the record in the delete dropdown using the key
    delete_box = at.selectbox(key="manage_pr_select")
    
    found_option = None
    for option in delete_box.options:
        if "Squat" in option and "999.0kg" in option:
            found_option = option
            break
            
    assert found_option is not None, "Created record not found in delete list"

    # Select and Delete
    delete_box.set_value(found_option)
    
    # Select "Delete" action
    radio_btn = [r for r in at.radio if r.label == "Action"][0]
    radio_btn.set_value("Delete")
    
    at.run()
    
    # Find the delete button and click it
    delete_btn = [b for b in at.button if b.label == "Delete Selected"][0]
    delete_btn.click()
    at.run()

    # Verify Success
    assert len(at.success) > 0
    assert "deleted successfully" in at.success[0].value