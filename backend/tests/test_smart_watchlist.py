def test_smart_watchlist_first_snapshot(client, user2_auth_headers):
    # User 2 adds TSLA to watchlist
    client.post("/api/watchlist", json={"symbol": "TSLA"}, headers=user2_auth_headers)

    # First check of changes without prior snapshots
    res = client.get("/api/watchlist/changes", headers=user2_auth_headers)
    assert res.status_code == 200
    data = res.json()
    # If first visit, tracking started is true or items are captured
    assert "tracking_started" in data or "items" in data
    assert "message" in data

def test_smart_watchlist_meaningful_change_simulation(client, auth_headers):
    # Ensure NVDA is in watchlist for User 1
    client.post("/api/watchlist", json={"symbol": "NVDA"}, headers=auth_headers)
    # Ensure baseline snapshot exists
    client.post("/api/watchlist/snapshot", headers=auth_headers)

    # Trigger demo simulation: NVDA price +4.2%, volume 1.8x
    sim_res = client.post("/api/demo/simulate-change", json={
        "symbol": "NVDA",
        "price_change_pct": 4.2,
        "volume_ratio": 1.8
    })
    assert sim_res.status_code == 200
    assert sim_res.json()["disclaimer"] == "Demo simulation — not real market data."

    # Now get smart watchlist changes
    res = client.get("/api/watchlist/changes", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) >= 1

    nvda_item = next((i for i in data["items"] if i["symbol"] == "NVDA"), None)
    assert nvda_item is not None
    # Price changed >= 3% and volume ratio >= 1.5 -> meaningful is True!
    assert nvda_item["meaningful"] is True
    assert nvda_item["attention_score"] >= 31
    assert nvda_item["attention_level"] in ["WORTH WATCHING", "IMPORTANT", "HIGH ATTENTION"]
    assert len(nvda_item["reasons"]) >= 1
    assert "NVDA" in nvda_item["beginner_explanation"]
    assert nvda_item["data_status"] == "simulated"

    # Reset simulation
    client.post("/api/demo/reset-simulation")
