def test_initial_portfolio_balance(client, auth_headers):
    res = client.get("/api/portfolio", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["virtual_balance"] == 100000.0
    assert data["invested_value"] == 0.0
    assert data["positions"] == []

def test_buy_stock_zero_negative_quantity(client, auth_headers):
    res = client.post("/api/portfolio/buy", json={"symbol": "NVDA", "quantity": 0}, headers=auth_headers)
    assert res.status_code == 422 or res.status_code == 400

    res2 = client.post("/api/portfolio/buy", json={"symbol": "NVDA", "quantity": -5}, headers=auth_headers)
    assert res2.status_code == 422 or res2.status_code == 400

def test_buy_insufficient_balance(client, auth_headers):
    # Try buying 10,000 shares of NVDA (~₹12,50,000+) which exceeds ₹1,00,000
    res = client.post("/api/portfolio/buy", json={"symbol": "NVDA", "quantity": 10000}, headers=auth_headers)
    assert res.status_code == 400
    assert "Insufficient balance" in res.json()["detail"]

def test_successful_buy_and_atomic_updates(client, auth_headers):
    # Buy 10 shares of NVDA
    res = client.post("/api/portfolio/buy", json={"symbol": "NVDA", "quantity": 10}, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "Successfully bought 10 shares of NVDA" in data["message"]

    # Check portfolio state
    res_port = client.get("/api/portfolio", headers=auth_headers)
    assert res_port.status_code == 200
    port = res_port.json()
    assert port["virtual_balance"] < 100000.0
    assert len(port["positions"]) == 1
    nvda_pos = port["positions"][0]
    assert nvda_pos["symbol"] == "NVDA"
    assert nvda_pos["quantity"] == 10

    # Check transaction record
    res_txns = client.get("/api/portfolio/transactions", headers=auth_headers)
    assert res_txns.status_code == 200
    txns = res_txns.json()
    assert len(txns) >= 1
    assert txns[0]["symbol"] == "NVDA"
    assert txns[0]["type"] == "BUY"
    assert txns[0]["quantity"] == 10

def test_sell_oversell_rejection(client, auth_headers):
    # Currently user owns 10 shares. Try selling 15.
    res = client.post("/api/portfolio/sell", json={"symbol": "NVDA", "quantity": 15}, headers=auth_headers)
    assert res.status_code == 400
    assert "Cannot sell 15 shares" in res.json()["detail"]

def test_successful_sell(client, auth_headers):
    # Sell 4 shares of NVDA
    prev_port = client.get("/api/portfolio", headers=auth_headers).json()
    prev_balance = prev_port["virtual_balance"]

    res = client.post("/api/portfolio/sell", json={"symbol": "NVDA", "quantity": 4}, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "Successfully sold 4 shares" in data["message"]

    # Verify remaining quantity is 6
    new_port = client.get("/api/portfolio", headers=auth_headers).json()
    assert new_port["virtual_balance"] > prev_balance
    nvda_pos = next(p for p in new_port["positions"] if p["symbol"] == "NVDA")
    assert nvda_pos["quantity"] == 6
