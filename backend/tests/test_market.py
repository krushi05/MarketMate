def test_market_quote_supported(client):
    res = client.get("/api/market/quote/AAPL")
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "AAPL"
    assert data["current_price"] > 0
    assert data["data_status"] in ["live", "fallback", "simulated"]
    assert "company_name" in data

def test_market_quote_case_insensitive(client):
    res = client.get("/api/market/quote/msft")
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "MSFT"

def test_market_quote_invalid_symbol(client):
    res = client.get("/api/market/quote/INVALIDTICKER123")
    assert res.status_code == 404

def test_market_history(client):
    res = client.get("/api/market/history/NVDA")
    assert res.status_code == 200
    history = res.json()
    assert isinstance(history, list)
    assert len(history) >= 5
    assert "date" in history[0]
    assert "price" in history[0]

def test_market_search(client):
    res = client.get("/api/market/search?q=NVIDIA")
    assert res.status_code == 200
    results = res.json()
    assert any(r["symbol"] == "NVDA" for r in results)

    # Empty search returns top discover stocks
    res_empty = client.get("/api/market/search?q=")
    assert res_empty.status_code == 200
    assert len(res_empty.json()) >= 3
