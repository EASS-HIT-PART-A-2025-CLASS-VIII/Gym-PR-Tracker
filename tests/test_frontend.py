import pytest
import threading
import time
import uvicorn
import re
from playwright.sync_api import Page, expect
from backend.main import app

# --- Fixture to run FastAPI server in background ---
@pytest.fixture(scope="session", autouse=True)
def run_server():
    """Starts the Uvicorn server in a separate thread for the testing session."""
    def start_server():
        uvicorn.run(app, host="127.0.0.1", port=8001, log_level="info") # Changed to info to see requests

    thread = threading.Thread(target=start_server, daemon=True)
    thread.start()
    time.sleep(2)
    yield

BASE_URL = "http://localhost:8001"

# --- Frontend Tests ---

def test_homepage_loads(page: Page):
    page.goto(BASE_URL)
    expect(page).to_have_title("Gym PR Tracker")
    expect(page.locator("#dashboard-view")).to_be_visible()

def test_navigation(page: Page):
    page.goto(BASE_URL)
    page.click("#nav-history")
    expect(page.locator("#history-view")).not_to_have_class(re.compile("hidden"))
    page.click("#nav-dashboard")
    expect(page.locator("#dashboard-view")).not_to_have_class(re.compile("hidden"))

def test_crud_flow_and_filter(page: Page):
    """
    Full flow with debug logging
    """
    page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))

    unique_weight = "999.9"
    exercise_name = "Squat"

    page.goto(BASE_URL)

    # 1. CREATE
    page.click("#btn-log-pr")
    modal = page.locator("#log-pr-modal")
    expect(modal).not_to_have_class(re.compile("hidden"))
    
    # Wait for animation to settle roughly
    page.wait_for_timeout(500)

    # Fill Form
    page.select_option("#exercise", label=exercise_name)
    page.select_option("#muscle_group", label="Legs")
    page.fill("#weight", unique_weight)
    page.fill("#reps", "1")
    
    # Save and Wait for API Response
    # Dispatch submit event directly to avoid click interception issues
    with page.expect_response(lambda response: "/prs" in response.url and response.request.method == "POST") as response_info:
        page.locator("#log-pr-form").dispatch_event("submit")
    
    response = response_info.value
    assert response.ok
    
    # Wait for close
    expect(modal).to_have_class(re.compile("hidden"))

    # 2. VERIFY IN HISTORY
    page.click("#nav-history")
    
    # 3. FILTER
    page.fill("#history-search", exercise_name)
    
    # Find card
    target_card = page.locator("#history-list-container .glass-card").filter(has_text=f"{unique_weight}kg")
    expect(target_card).to_be_visible()

    # 4. DELETE
    # Click delete button
    target_card.locator("button[title='Delete']").click()
    
    # Confirm
    delete_modal = page.locator("#delete-modal")
    expect(delete_modal).not_to_have_class(re.compile("hidden"))
    page.wait_for_timeout(500) # Wait for animation
    
    with page.expect_response(lambda response: "/prs" in response.url and response.request.method == "DELETE") as delete_response_info:
        page.click("#btn-confirm-delete")
        
    assert delete_response_info.value.ok

    # 5. VERIFY DELETION
    expect(delete_modal).to_have_class(re.compile("hidden"))
    expect(target_card).to_have_count(0)
