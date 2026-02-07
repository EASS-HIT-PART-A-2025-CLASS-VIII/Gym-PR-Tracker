import pytest
import time
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def auth_header(client):
    # Register and login with a unique user for this session
    username = f"testuser_{int(time.time() * 1000)}"
    password = "testpassword"
    await client.post("/auth/register", json={"username": username, "password": password})
    response = await client.post("/auth/token", data={"username": username, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
