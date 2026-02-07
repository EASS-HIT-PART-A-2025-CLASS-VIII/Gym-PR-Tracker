import pytest
from httpx import AsyncClient
from datetime import timedelta
from app.auth import create_access_token

@pytest.mark.anyio
async def test_prs_unauthorized(client: AsyncClient):
    # No auth header
    response = await client.get("/prs")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

@pytest.mark.anyio
async def test_admin_route_forbidden(client: AsyncClient, auth_header: dict):
    # Standard user trying to access admin route
    response = await client.get("/admin/users", headers=auth_header)
    assert response.status_code == 403
    assert "privileges" in response.json()["detail"]

@pytest.mark.anyio
async def test_expired_token(client: AsyncClient):
    # Create an already expired token
    token = create_access_token(
        data={"sub": "testuser"}, 
        expires_delta=timedelta(seconds=-1)
    )
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.get("/prs", headers=headers)
    assert response.status_code == 401
    assert "validate" in response.json()["detail"]

@pytest.mark.anyio
async def test_invalid_claims(client: AsyncClient):
    # Create token with wrong audience/issuer manually if needed, 
    # but jose.jwt.encode with our default SECRET_KEY and wrong claims 
    # should be rejected by decode_access_token.
    from jose import jwt
    from app.auth import SECRET_KEY, ALGORITHM
    
    payload = {"sub": "test", "iss": "evil-hacker", "exp": 9999999999}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = await client.get("/prs", headers=headers)
    assert response.status_code == 401
