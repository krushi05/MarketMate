import os
import datetime
from typing import Dict, Any, List, Optional
import yfinance as yf

# Fallback dataset with realistic values for supported symbols
FALLBACK_DATA: Dict[str, Dict[str, Any]] = {
    "NVDA": {
        "symbol": "NVDA",
        "company_name": "NVIDIA Corporation",
        "current_price": 125.40,
        "previous_close": 120.30,
        "change": 5.10,
        "change_percent": 4.24,
        "volume": 48500000.0,
        "average_volume": 42000000.0,
        "history": [
            {"date": "2025-02-25", "price": 118.20, "volume": 39000000},
            {"date": "2025-02-26", "price": 119.50, "volume": 41000000},
            {"date": "2025-02-27", "price": 120.10, "volume": 40500000},
            {"date": "2025-02-28", "price": 120.30, "volume": 42000000},
            {"date": "2025-03-01", "price": 122.80, "volume": 45000000},
            {"date": "2025-03-02", "price": 124.00, "volume": 46500000},
            {"date": "2025-03-03", "price": 125.40, "volume": 48500000},
        ],
    },
    "AAPL": {
        "symbol": "AAPL",
        "company_name": "Apple Inc.",
        "current_price": 224.50,
        "previous_close": 223.10,
        "change": 1.40,
        "change_percent": 0.63,
        "volume": 52000000.0,
        "average_volume": 55000000.0,
        "history": [
            {"date": "2025-02-25", "price": 220.00, "volume": 51000000},
            {"date": "2025-02-26", "price": 221.40, "volume": 53000000},
            {"date": "2025-02-27", "price": 222.00, "volume": 54000000},
            {"date": "2025-02-28", "price": 223.10, "volume": 52000000},
            {"date": "2025-03-01", "price": 223.80, "volume": 50000000},
            {"date": "2025-03-02", "price": 224.10, "volume": 51500000},
            {"date": "2025-03-03", "price": 224.50, "volume": 52000000},
        ],
    },
    "MSFT": {
        "symbol": "MSFT",
        "company_name": "Microsoft Corporation",
        "current_price": 415.80,
        "previous_close": 412.50,
        "change": 3.30,
        "change_percent": 0.80,
        "volume": 21000000.0,
        "average_volume": 22000000.0,
        "history": [
            {"date": "2025-02-25", "price": 408.00, "volume": 20000000},
            {"date": "2025-02-26", "price": 410.20, "volume": 21500000},
            {"date": "2025-02-27", "price": 411.00, "volume": 21000000},
            {"date": "2025-02-28", "price": 412.50, "volume": 22000000},
            {"date": "2025-03-01", "price": 413.50, "volume": 20500000},
            {"date": "2025-03-02", "price": 414.20, "volume": 21200000},
            {"date": "2025-03-03", "price": 415.80, "volume": 21000000},
        ],
    },
    "TSLA": {
        "symbol": "TSLA",
        "company_name": "Tesla, Inc.",
        "current_price": 248.20,
        "previous_close": 240.00,
        "change": 8.20,
        "change_percent": 3.42,
        "volume": 78000000.0,
        "average_volume": 65000000.0,
        "history": [
            {"date": "2025-02-25", "price": 232.00, "volume": 62000000},
            {"date": "2025-02-26", "price": 235.50, "volume": 64000000},
            {"date": "2025-02-27", "price": 238.00, "volume": 66000000},
            {"date": "2025-02-28", "price": 240.00, "volume": 65000000},
            {"date": "2025-03-01", "price": 242.50, "volume": 70000000},
            {"date": "2025-03-02", "price": 245.00, "volume": 73000000},
            {"date": "2025-03-03", "price": 248.20, "volume": 78000000},
        ],
    },
    "AMZN": {
        "symbol": "AMZN",
        "company_name": "Amazon.com, Inc.",
        "current_price": 186.50,
        "previous_close": 184.20,
        "change": 2.30,
        "change_percent": 1.25,
        "volume": 35000000.0,
        "average_volume": 38000000.0,
        "history": [
            {"date": "2025-02-25", "price": 180.50, "volume": 36000000},
            {"date": "2025-02-26", "price": 182.00, "volume": 37000000},
            {"date": "2025-02-27", "price": 183.10, "volume": 36500000},
            {"date": "2025-02-28", "price": 184.20, "volume": 38000000},
            {"date": "2025-03-01", "price": 185.00, "volume": 35000000},
            {"date": "2025-03-02", "price": 185.80, "volume": 35500000},
            {"date": "2025-03-03", "price": 186.50, "volume": 35000000},
        ],
    },
    "GOOGL": {
        "symbol": "GOOGL",
        "company_name": "Alphabet Inc.",
        "current_price": 172.30,
        "previous_close": 171.10,
        "change": 1.20,
        "change_percent": 0.70,
        "volume": 24000000.0,
        "average_volume": 26000000.0,
        "history": [
            {"date": "2025-02-25", "price": 168.00, "volume": 25000000},
            {"date": "2025-02-26", "price": 169.50, "volume": 25500000},
            {"date": "2025-02-27", "price": 170.20, "volume": 26000000},
            {"date": "2025-02-28", "price": 171.10, "volume": 26000000},
            {"date": "2025-03-01", "price": 171.50, "volume": 24500000},
            {"date": "2025-03-02", "price": 171.90, "volume": 24200000},
            {"date": "2025-03-03", "price": 172.30, "volume": 24000000},
        ],
    },
    "META": {
        "symbol": "META",
        "company_name": "Meta Platforms, Inc.",
        "current_price": 580.40,
        "previous_close": 575.00,
        "change": 5.40,
        "change_percent": 0.94,
        "volume": 14000000.0,
        "average_volume": 15500000.0,
        "history": [
            {"date": "2025-02-25", "price": 565.00, "volume": 15000000},
            {"date": "2025-02-26", "price": 568.50, "volume": 15200000},
            {"date": "2025-02-27", "price": 571.00, "volume": 15000000},
            {"date": "2025-02-28", "price": 575.00, "volume": 15500000},
            {"date": "2025-03-01", "price": 577.00, "volume": 14500000},
            {"date": "2025-03-02", "price": 578.50, "volume": 14200000},
            {"date": "2025-03-03", "price": 580.40, "volume": 14000000},
        ],
    },
    "RELIANCE.NS": {
        "symbol": "RELIANCE.NS",
        "company_name": "Reliance Industries Limited",
        "current_price": 1285.50,
        "previous_close": 1270.00,
        "change": 15.50,
        "change_percent": 1.22,
        "volume": 6800000.0,
        "average_volume": 6500000.0,
        "history": [
            {"date": "2025-02-25", "price": 1250.00, "volume": 6200000},
            {"date": "2025-02-26", "price": 1258.00, "volume": 6400000},
            {"date": "2025-02-27", "price": 1265.00, "volume": 6300000},
            {"date": "2025-02-28", "price": 1270.00, "volume": 6500000},
            {"date": "2025-03-01", "price": 1275.00, "volume": 6600000},
            {"date": "2025-03-02", "price": 1280.00, "volume": 6700000},
            {"date": "2025-03-03", "price": 1285.50, "volume": 6800000},
        ],
    },
    "TCS.NS": {
        "symbol": "TCS.NS",
        "company_name": "Tata Consultancy Services Limited",
        "current_price": 3890.00,
        "previous_close": 3875.00,
        "change": 15.00,
        "change_percent": 0.39,
        "volume": 2100000.0,
        "average_volume": 2300000.0,
        "history": [
            {"date": "2025-02-25", "price": 3840.00, "volume": 2200000},
            {"date": "2025-02-26", "price": 3855.00, "volume": 2250000},
            {"date": "2025-02-27", "price": 3865.00, "volume": 2100000},
            {"date": "2025-02-28", "price": 3875.00, "volume": 2300000},
            {"date": "2025-03-01", "price": 3880.00, "volume": 2150000},
            {"date": "2025-03-02", "price": 3885.00, "volume": 2120000},
            {"date": "2025-03-03", "price": 3890.00, "volume": 2100000},
        ],
    },
    "INFY.NS": {
        "symbol": "INFY.NS",
        "company_name": "Infosys Limited",
        "current_price": 1780.20,
        "previous_close": 1765.00,
        "change": 15.20,
        "change_percent": 0.86,
        "volume": 4900000.0,
        "average_volume": 5200000.0,
        "history": [
            {"date": "2025-02-25", "price": 1740.00, "volume": 5000000},
            {"date": "2025-02-26", "price": 1750.00, "volume": 5100000},
            {"date": "2025-02-27", "price": 1758.00, "volume": 4950000},
            {"date": "2025-02-28", "price": 1765.00, "volume": 5200000},
            {"date": "2025-03-01", "price": 1770.00, "volume": 5050000},
            {"date": "2025-03-02", "price": 1775.00, "volume": 4980000},
            {"date": "2025-03-03", "price": 1780.20, "volume": 4900000},
        ],
    },
}

# In-memory store for simulated market changes in demo mode
_SIMULATED_OVERRIDES: Dict[str, Dict[str, Any]] = {}

def normalize_symbol(symbol: str) -> str:
    cleaned = symbol.strip().upper()
    return cleaned

class MarketService:
    @staticmethod
    def get_supported_symbols() -> List[str]:
        return list(FALLBACK_DATA.keys())

    @staticmethod
    def set_simulation(symbol: str, price_multiplier: float, volume_ratio: float):
        sym = normalize_symbol(symbol)
        base = FALLBACK_DATA.get(sym)
        base_price = base["current_price"] if base else 100.0
        base_avg_vol = base["average_volume"] if base else 1000000.0

        new_price = round(base_price * price_multiplier, 2)
        new_vol = round(base_avg_vol * volume_ratio, 0)
        chg = round(new_price - base_price, 2)
        chg_pct = round(((new_price - base_price) / base_price) * 100.0, 2)

        _SIMULATED_OVERRIDES[sym] = {
            "current_price": new_price,
            "previous_close": base_price,
            "change": chg,
            "change_percent": chg_pct,
            "volume": new_vol,
            "average_volume": base_avg_vol,
            "data_status": "simulated",
            "timestamp": datetime.datetime.utcnow().isoformat(),
        }

    @staticmethod
    def clear_simulations():
        _SIMULATED_OVERRIDES.clear()

    @staticmethod
    def get_quote(symbol: str) -> Dict[str, Any]:
        sym = normalize_symbol(symbol)

        # 1. Check if an active simulation override exists for this symbol
        if sym in _SIMULATED_OVERRIDES:
            sim = _SIMULATED_OVERRIDES[sym]
            company_name = FALLBACK_DATA.get(sym, {}).get("company_name", f"{sym} Corporation")
            avg_vol = sim["average_volume"]
            vol_ratio = round(sim["volume"] / avg_vol, 2) if avg_vol > 0 else 1.0
            return {
                "symbol": sym,
                "company_name": company_name,
                "current_price": sim["current_price"],
                "previous_close": sim["previous_close"],
                "change": sim["change"],
                "change_percent": sim["change_percent"],
                "volume": sim["volume"],
                "average_volume": avg_vol,
                "volume_ratio": vol_ratio,
                "data_status": "simulated",
                "timestamp": sim["timestamp"],
            }

        # 2. Try fetching from yfinance (Live)
        try:
            ticker = yf.Ticker(sym)
            fast_info = getattr(ticker, "fast_info", None)
            info = getattr(ticker, "info", None) or {}

            price = None
            prev_close = None
            vol = None
            avg_vol = None
            name = None

            if fast_info:
                try:
                    price = fast_info.last_price
                    prev_close = fast_info.previous_close
                    vol = fast_info.last_volume
                    avg_vol = fast_info.three_month_average_volume
                except Exception:
                    pass

            if price is None and info:
                price = info.get("currentPrice") or info.get("regularMarketPrice")
                prev_close = info.get("previousClose")
                vol = info.get("volume") or info.get("regularMarketVolume")
                avg_vol = info.get("averageVolume")
                name = info.get("shortName") or info.get("longName")

            if price is not None and price > 0:
                prev_close = prev_close or price
                change = round(price - prev_close, 2)
                change_pct = round((change / prev_close) * 100.0, 2) if prev_close else 0.0
                vol = float(vol or 1000000.0)
                avg_vol = float(avg_vol or vol or 1000000.0)
                vol_ratio = round(vol / avg_vol, 2) if avg_vol > 0 else 1.0

                if not name:
                    name = FALLBACK_DATA.get(sym, {}).get("company_name", f"{sym} Corporation")

                return {
                    "symbol": sym,
                    "company_name": name,
                    "current_price": round(float(price), 2),
                    "previous_close": round(float(prev_close), 2),
                    "change": change,
                    "change_percent": change_pct,
                    "volume": vol,
                    "average_volume": avg_vol,
                    "volume_ratio": vol_ratio,
                    "data_status": "live",
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                }
        except Exception:
            # Fallback path if yfinance fails
            pass

        # 3. Fallback dataset
        if sym in FALLBACK_DATA:
            fb = FALLBACK_DATA[sym]
            avg_vol = fb["average_volume"]
            vol_ratio = round(fb["volume"] / avg_vol, 2) if avg_vol > 0 else 1.0
            return {
                "symbol": sym,
                "company_name": fb["company_name"],
                "current_price": fb["current_price"],
                "previous_close": fb["previous_close"],
                "change": fb["change"],
                "change_percent": fb["change_percent"],
                "volume": fb["volume"],
                "average_volume": avg_vol,
                "volume_ratio": vol_ratio,
                "data_status": "fallback",
                "timestamp": datetime.datetime.utcnow().isoformat(),
            }

        # Unknown or invalid symbol
        raise ValueError(f"Stock symbol '{sym}' not found.")

    @staticmethod
    def get_history(symbol: str) -> List[Dict[str, Any]]:
        sym = normalize_symbol(symbol)
        # Check if fallback dataset has history
        if sym in FALLBACK_DATA:
            history = list(FALLBACK_DATA[sym]["history"])
            # If simulated, update the last point
            if sym in _SIMULATED_OVERRIDES:
                sim = _SIMULATED_OVERRIDES[sym]
                history[-1] = {
                    "date": datetime.datetime.utcnow().strftime("%Y-%m-%d"),
                    "price": sim["current_price"],
                    "volume": sim["volume"],
                }
            return history

        # Try yfinance history
        try:
            ticker = yf.Ticker(sym)
            hist = ticker.history(period="7d")
            if not hist.empty:
                result = []
                for index, row in hist.iterrows():
                    d_str = index.strftime("%Y-%m-%d")
                    result.append({
                        "date": d_str,
                        "price": round(float(row["Close"]), 2),
                        "volume": float(row["Volume"]),
                    })
                return result
        except Exception:
            pass

        raise ValueError(f"History for symbol '{sym}' not available.")

    @staticmethod
    def search(query: str) -> List[Dict[str, Any]]:
        q = query.strip().upper()
        if not q:
            # Return popular top stocks
            results = []
            for s in ["NVDA", "AAPL", "MSFT", "TSLA", "RELIANCE.NS"]:
                try:
                    quote = MarketService.get_quote(s)
                    results.append({
                        "symbol": quote["symbol"],
                        "company_name": quote["company_name"],
                        "current_price": quote["current_price"],
                        "change_percent": quote["change_percent"],
                        "data_status": quote["data_status"],
                    })
                except Exception:
                    pass
            return results

        results = []
        for sym, data in FALLBACK_DATA.items():
            if q in sym or q in data["company_name"].upper():
                try:
                    quote = MarketService.get_quote(sym)
                    results.append({
                        "symbol": quote["symbol"],
                        "company_name": quote["company_name"],
                        "current_price": quote["current_price"],
                        "change_percent": quote["change_percent"],
                        "data_status": quote["data_status"],
                    })
                except Exception:
                    pass
        return results
