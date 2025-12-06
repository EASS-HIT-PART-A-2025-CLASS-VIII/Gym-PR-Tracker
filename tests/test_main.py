from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Happy Path Tests


def test_create_pr():
    response = client.post(
        "/prs", json={"exercise": "Deadlift", "weight": 140.5, "reps": 3}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["exercise"] == "Deadlift"
    assert "id" in data


def test_read_prs():
    response = client.get("/prs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# Update Tests


def test_update_weight_only():
    # Setup
    setup = client.post("/prs", json={"exercise": "Squat", "weight": 100, "reps": 5})
    pr_id = setup.json()["id"]

    # Update Weight
    response = client.put(f"/prs/{pr_id}", json={"weight": 120})
    assert response.status_code == 200
    data = response.json()
    assert data["weight"] == 120
    assert data["reps"] == 5
    assert data["exercise"] == "Squat"


def test_update_reps_only():
    # Setup
    setup = client.post("/prs", json={"exercise": "Pull Up", "weight": 10, "reps": 10})
    pr_id = setup.json()["id"]

    # Update Reps
    response = client.put(f"/prs/{pr_id}", json={"reps": 20})
    assert response.status_code == 200
    data = response.json()
    assert data["reps"] == 20
    assert data["exercise"] == "Pull Up"


def test_update_exercise_name_only():
    # Setup
    setup = client.post(
        "/prs", json={"exercise": "Typo Name", "weight": 50, "reps": 10}
    )
    pr_id = setup.json()["id"]

    # Update Name
    response = client.put(f"/prs/{pr_id}", json={"exercise": "Correct Name"})
    assert response.status_code == 200
    data = response.json()
    assert data["exercise"] == "Correct Name"
    assert data["weight"] == 50


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


def test_get_non_existent_pr():
    response = client.get("/prs/9999")
    assert response.status_code == 404


def test_create_invalid_pr_negative_weight():
    response = client.post("/prs", json={"exercise": "Bench", "weight": -50, "reps": 5})
    assert response.status_code == 422


def test_create_invalid_pr_short_name():
    response = client.post("/prs", json={"exercise": "A", "weight": 100, "reps": 5})
    assert response.status_code == 422


def test_update_non_existent_pr():
    response = client.put("/prs/9999", json={"weight": 120})
    assert response.status_code == 404
