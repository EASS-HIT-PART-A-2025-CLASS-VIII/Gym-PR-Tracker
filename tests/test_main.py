from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# Happy Path Tests

def test_create_pr():
    response = client.post(
        "/prs", json={"exercise": "Deadlift", "weight": 140.5, "reps": 3}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["exercise"] == "Deadlift"
    assert data["muscle_group"] == "Other"  
    assert "id" in data
    assert "performed_at" in data

# Read PRs Test
def test_read_prs():
    response = client.get("/prs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Update Weight Test
def test_update_weight_only():
    setup = client.post("/prs", json={"exercise": "Squat", "weight": 100, "reps": 5})
    pr_id = setup.json()["id"]

    response = client.put(f"/prs/{pr_id}", json={"weight": 120})
    assert response.status_code == 200
    data = response.json()
    assert data["weight"] == 120
    assert data["reps"] == 5

# Update Reps Test
def test_update_reps_only():
    setup = client.post("/prs", json={"exercise": "Pull Up", "weight": 10, "reps": 10})
    pr_id = setup.json()["id"]

    response = client.put(f"/prs/{pr_id}", json={"reps": 20})
    assert response.status_code == 200
    data = response.json()
    assert data["reps"] == 20

# Update Exercise Name Test
def test_update_exercise_name_only():
    setup = client.post(
        "/prs", json={"exercise": "Typo Name", "weight": 50, "reps": 10}
    )
    pr_id = setup.json()["id"]

    response = client.put(f"/prs/{pr_id}", json={"exercise": "Correct Name"})
    assert response.status_code == 200
    data = response.json()
    assert data["exercise"] == "Correct Name"

# Update Muscle Group Test
def test_update_muscle_group():
    setup = client.post(
        "/prs", json={"exercise": "Bench Press", "muscle_group": "Other", "weight": 60, "reps": 10}
    )
    pr_id = setup.json()["id"]

    response = client.put(f"/prs/{pr_id}", json={"muscle_group": "Chest"})
    assert response.status_code == 200
    assert response.json()["muscle_group"] == "Chest"

# Delete Test
def test_delete_pr():
    setup_response = client.post(
        "/prs", json={"exercise": "Run", "weight": 10, "reps": 1}
    )
    pr_id = setup_response.json()["id"]

    del_response = client.delete(f"/prs/{pr_id}")
    assert del_response.status_code == 204

    get_response = client.get(f"/prs/{pr_id}")
    assert get_response.status_code == 404

# Edge Cases & Error Handling Tests 

# Get Non-existent PR Test
def test_get_non_existent_pr():
    response = client.get("/prs/9999")
    assert response.status_code == 404

# Invalid PR Creation Test - Negative Weight
def test_create_invalid_pr_negative_weight():
    response = client.post("/prs", json={"exercise": "Bench", "weight": -50, "reps": 5})
    assert response.status_code == 422

# Invalid PR Creation Test - Short Name
def test_create_invalid_pr_short_name():
    response = client.post("/prs", json={"exercise": "A", "weight": 100, "reps": 5})
    assert response.status_code == 422

# Update Non-existent PR Test
def test_update_non_existent_pr():
    response = client.put("/prs/9999", json={"weight": 120})
    assert response.status_code == 404

# Integration Test
def test_create_and_list_pr():
    payload = {
        "exercise": "Military Press",
        "weight": 60.0,
        "reps": 8,
        "muscle_group": "Shoulders"
    }
    create_res = client.post("/prs", json=payload)
    assert create_res.status_code == 201
    data = create_res.json()
    new_id = data["id"]

    list_res = client.get("/prs")
    assert list_res.status_code == 200
    all_prs = list_res.json()

    found = any(pr["id"] == new_id for pr in all_prs)
    assert found is True

# Delete Workflow Test
def test_delete_pr_workflow():
    setup_res = client.post("/prs", json={"exercise": "To Delete", "weight": 10, "reps": 1})
    assert setup_res.status_code == 201
    pr_id = setup_res.json()["id"]

    del_res = client.delete(f"/prs/{pr_id}")
    assert del_res.status_code == 204 

    get_res = client.get(f"/prs/{pr_id}")
    assert get_res.status_code == 404 