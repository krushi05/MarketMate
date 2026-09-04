import os
from fastapi import APIRouter, HTTPException, status
from backend.app.schemas import SimulateChangeRequest
from backend.app.services.market_service import MarketService, normalize_symbol

router = APIRouter(prefix="/api/demo", tags=["Demo Simulation"])

def is_demo_mode() -> bool:
    return os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")

@router.post("/simulate-change")
def simulate_change(req: SimulateChangeRequest):
    if not is_demo_mode():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo simulation is only permitted when DEMO_MODE=true",
        )

    sym = normalize_symbol(req.symbol or "NVDA")
    # Compute price multiplier: e.g. 4.2% -> 1.042
    pct = req.price_change_pct if req.price_change_pct is not None else 4.2
    vol_ratio = req.volume_ratio if req.volume_ratio is not None else 1.8
    price_multiplier = 1.0 + (pct / 100.0)

    MarketService.set_simulation(sym, price_multiplier=price_multiplier, volume_ratio=vol_ratio)
    simulated_quote = MarketService.get_quote(sym)

    return {
        "message": f"Demo market simulation applied for {sym}.",
        "disclaimer": "Demo simulation — not real market data.",
        "simulated_quote": simulated_quote,
    }

@router.post("/reset-simulation")
def reset_simulation():
    if not is_demo_mode():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo simulation is only permitted when DEMO_MODE=true",
        )
    MarketService.clear_simulations()
    return {"message": "All demo simulations reset to default baseline market data."}

@router.get("/status")
def get_demo_status():
    return {
        "demo_mode": is_demo_mode(),
        "disclaimer": "MarketMate is an educational demo. It does not provide financial advice or execute real-money trades.",
    }
