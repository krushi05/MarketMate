from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, Transaction
from backend.app.schemas import (
    PortfolioSummaryResponse,
    TransactionResponse,
    BuySellRequest,
)
from backend.app.services.portfolio_service import PortfolioService
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])

@router.get("", response_model=PortfolioSummaryResponse)
def get_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PortfolioService.get_summary(db, current_user)

@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txns = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .all()
    )
    return txns

@router.post("/buy")
def buy_stock(
    req: BuySellRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PortfolioService.buy_stock(db, current_user, req.symbol, req.quantity)

@router.post("/sell")
def sell_stock(
    req: BuySellRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return PortfolioService.sell_stock(db, current_user, req.symbol, req.quantity)
