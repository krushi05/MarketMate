def test_watchlist_add_and_persistence(client, auth_headers):
    # Ensure clean state for NVDA
    client.delete("/api/watchlist/NVDA", headers=auth_headers)
    # Add NVDA
    res = client.post("/api/watchlist", json={"symbol": "NVDA"}, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["symbol"] == "NVDA"
    assert "company_name" in data

    # Verify persistence via GET /api/watchlist
    res2 = client.get("/api/watchlist", headers=auth_headers)
    assert res2.status_code == 200
    items = res2.json()
    assert any(i["symbol"] == "NVDA" for i in items)

def test_watchlist_duplicate_rejection(client, auth_headers):
    # Trying to add NVDA again should be rejected
    res = client.post("/api/watchlist", json={"symbol": "NVDA"}, headers=auth_headers)
    assert res.status_code == 400
    assert "already in your watchlist" in res.json()["detail"]

def test_watchlist_invalid_symbol(client, auth_headers):
    res = client.post("/api/watchlist", json={"symbol": "NONEXISTENTXYZ"}, headers=auth_headers)
    assert res.status_code == 400

def test_watchlist_user_isolation(client, auth_headers, user2_auth_headers):
    # User 1 has NVDA in watchlist. User 2 should NOT see it in their watchlist.
    res = client.get("/api/watchlist", headers=user2_auth_headers)
    assert res.status_code == 200
    items = res.json()
    assert not any(i["symbol"] == "NVDA" for i in items)

def test_watchlist_remove(client, auth_headers):
    # Add AAPL then remove it
    client.post("/api/watchlist", json={"symbol": "AAPL"}, headers=auth_headers)
    res_del = client.delete("/api/watchlist/AAPL", headers=auth_headers)
    assert res_del.status_code == 200

    # Verify AAPL is gone
    res_list = client.get("/api/watchlist", headers=auth_headers)
    assert not any(i["symbol"] == "AAPL" for i in res_list.json())
