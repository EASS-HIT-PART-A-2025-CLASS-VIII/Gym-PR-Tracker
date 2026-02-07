from httpx import AsyncClient
import pytest
from app.main import app

# Happy Path Tests

@pytest.mark.anyio
async def test_create_pr(client, auth_header):
    response = await client.post(
        "/prs", 
        json={"exercise": "Deadlift", "weight": 140.5, "reps": 3},
        headers=auth_header
    )
    assert response.status_code == 201
    data = response.json()
    assert data["exercise"] == "Deadlift"
    assert "id" in data


@pytest.mark.anyio
async def test_read_prs(client, auth_header):
    response = await client.get("/prs", headers=auth_header)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# Update Tests

@pytest.mark.anyio
async def test_update_weight_only(client, auth_header):
    # Setup
    setup = await client.post("/prs", json={"exercise": "Squat", "weight": 100, "reps": 5}, headers=auth_header)
    pr_id = setup.json()["id"]

    # Update Weight
    response = await client.put(f"/prs/{pr_id}", json={"weight": 120}, headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert data["weight"] == 120
    assert data["reps"] == 5
    assert data["exercise"] == "Squat"


@pytest.mark.anyio
async def test_update_reps_only(client, auth_header):
    # Setup
    setup = await client.post("/prs", json={"exercise": "Pull Up", "weight": 10, "reps": 10}, headers=auth_header)
    pr_id = setup.json()["id"]

    # Update Reps
    response = await client.put(f"/prs/{pr_id}", json={"reps": 20}, headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert data["reps"] == 20
    assert data["exercise"] == "Pull Up"


@pytest.mark.anyio
async def test_update_exercise_name_only(client, auth_header):
    # Setup
    setup = await client.post(
        "/prs", json={"exercise": "Typo Name", "weight": 50, "reps": 10}, headers=auth_header
    )
    pr_id = setup.json()["id"]

    # Update Name
    response = await client.put(f"/prs/{pr_id}", json={"exercise": "Correct Name"}, headers=auth_header)
    assert response.status_code == 200
    data = response.json()
    assert data["exercise"] == "Correct Name"
    assert data["weight"] == 50


# Delete Test

@pytest.mark.anyio
async def test_delete_pr(client, auth_header):
    setup_response = await client.post(
        "/prs", json={"exercise": "Run", "weight": 10, "reps": 1}, headers=auth_header
    )
    pr_id = setup_response.json()["id"]

    del_response = await client.delete(f"/prs/{pr_id}", headers=auth_header)
    assert del_response.status_code == 204

    get_response = await client.get(f"/prs/{pr_id}", headers=auth_header)
    assert get_response.status_code == 404


# Edge Cases & Error Handling Tests

@pytest.mark.anyio
async def test_get_non_existent_pr(client, auth_header):
    response = await client.get("/prs/9999", headers=auth_header)
    assert response.status_code == 404


@pytest.mark.anyio
async def test_create_invalid_pr_negative_weight(client, auth_header):
    response = await client.post("/prs", json={"exercise": "Bench", "weight": -50, "reps": 5}, headers=auth_header)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_create_invalid_pr_short_name(client, auth_header):
    response = await client.post("/prs", json={"exercise": "A", "weight": 100, "reps": 5}, headers=auth_header)
    assert response.status_code == 422


@pytest.mark.anyio
async def test_update_non_existent_pr(client, auth_header):
    response = await client.put("/prs/9999", json={"weight": 120}, headers=auth_header)
    assert response.status_code == 404
