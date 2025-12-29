import os
import httpx
import streamlit as st

API_URL = os.getenv("API_URL", "http://127.0.0.1:8000")

def get_prs():
    try:
        response = httpx.get(f"{API_URL}/prs")
        if response.status_code == 200:
            return response.json()
        return []
    except httpx.RequestError:
        st.error(f"Backend is offline. Trying to connect to: {API_URL}")
        return []

def create_pr(exercise, muscle_group, weight, reps):
    try:
        payload = {
            "exercise": exercise,
            "muscle_group": muscle_group,
            "weight": weight,
            "reps": reps
        }
        response = httpx.post(f"{API_URL}/prs", json=payload)
        return response
    except httpx.RequestError:
        st.error(f"Failed to connect to backend at: {API_URL}")
        return None

def delete_pr(pr_id):
    try:
        response = httpx.delete(f"{API_URL}/prs/{pr_id}")
        return response.status_code == 204
    except httpx.RequestError:
        return False

def update_pr(pr_id, pr_data):
    try:
        response = httpx.put(f"{API_URL}/prs/{pr_id}", json=pr_data)
        return response
    except httpx.RequestError:
        st.error(f"Failed to connect to backend at: {API_URL}")
        return None