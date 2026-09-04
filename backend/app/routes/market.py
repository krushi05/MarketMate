from typing import List
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.schemas import StockQuote, StockHistoryPoint, StockSearchResult
from backend.app.services.market_service import MarketService, normalize_symbol

router = APIRouter(prefix="/api/market", tags=["Market Data"])

@router.get("/search", response_model=List[StockSearchResult])
def search_stocks(q: str = Query("", description="Symbol or company name")):
    return MarketService.search(q)

@router.get("/quote/{symbol}", response_model=StockQuote)
def get_quote(symbol: str):
    sym = normalize_symbol(symbol)
    try:
        quote = MarketService.get_quote(sym)
        return StockQuote(**quote)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to retrieve quote for {sym}: {str(e)}",
        )

@router.get("/history/{symbol}", response_model=List[StockHistoryPoint])
def get_history(symbol: str):
    sym = normalize_symbol(symbol)
    try:
        history = MarketService.get_history(sym)
        return [StockHistoryPoint(**h) for h in history]
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to retrieve history for {sym}: {str(e)}",
        )

@router.get("/supported", response_model=List[str])
def get_supported():
    return MarketService.get_supported_symbols()
