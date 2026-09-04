def test_register_success(client):
    res = client.post("/api/auth/register", json={
        "name": "Alice Investor",
        "email": "alice@marketmate.local",
        "password": "alicepassword123"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alice@marketmate.local"
    assert data["user"]["virtual_balance"] == 100000.0

def test_duplicate_registration_rejected(client):
    res = client.post("/api/auth/register", json={
        "name": "Alice Duplicate",
        "email": "alice@marketmate.local",
        "password": "anotherpassword"
    })
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]

def test_login_success(client):
    res = client.post("/api/auth/login", json={
        "email": "alice@marketmate.local",
        "password": "alicepassword123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data

def test_login_invalid_credentials(client):
    res = client.post("/api/auth/login", json={
        "email": "alice@marketmate.local",
        "password": "wrongpassword"
    })
    assert res.status_code == 401
    assert "Incorrect email or password" in res.json()["detail"]

def test_protected_route_unauthorized(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 403 or res.status_code == 401

def test_protected_route_authorized(client, auth_headers):
    res = client.get("/api/auth/me", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "testuser@marketmate.local"
    assert data["virtual_balance"] == 100000.0
