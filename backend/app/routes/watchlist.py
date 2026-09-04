import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, WatchlistItem, MarketSnapshot
from backend.app.schemas import (
    WatchlistAddRequest,
    WatchlistItemResponse,
    SmartWatchlistResponse,
    SmartChangeItem,
)
from backend.app.services.market_service import MarketService, normalize_symbol
from backend.app.services.change_engine import ChangeEngine
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/watchlist", tags=["Watchlist"])

@router.get("", response_model=List[WatchlistItemResponse])
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == current_user.id)
        .order_by(WatchlistItem.created_at.desc())
        .all()
    )

    results = []
    for item in items:
        try:
            quote = MarketService.get_quote(item.symbol)
            curr_price = quote["current_price"]
            chg_pct = quote["change_percent"]
            vol = quote["volume"]
            avg_vol = quote["average_volume"]
            vol_ratio = quote["volume_ratio"]
            status_str = quote["data_status"]
            comp_name = quote["company_name"]
        except Exception:
            curr_price = 0.0
            chg_pct = 0.0
            vol = 0.0
            avg_vol = 0.0
            vol_ratio = 1.0
            status_str = "fallback"
            comp_name = item.company_name

        results.append(
            WatchlistItemResponse(
                id=item.id,
                symbol=item.symbol,
                company_name=comp_name,
                current_price=curr_price,
                change_percent=chg_pct,
                volume=vol,
                average_volume=avg_vol,
                volume_ratio=vol_ratio,
                data_status=status_str,
                created_at=item.created_at,
            )
        )
    return results

@router.post("", response_model=WatchlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    req: WatchlistAddRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sym = normalize_symbol(req.symbol)
    try:
        quote = MarketService.get_quote(sym)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid symbol '{sym}'.")

    # Check for duplicate
    existing = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == current_user.id, WatchlistItem.symbol == sym)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{sym} is already in your watchlist.",
        )

    item = WatchlistItem(
        user_id=current_user.id,
        symbol=sym,
        company_name=quote["company_name"],
        created_at=datetime.datetime.utcnow(),
    )
    db.add(item)

    # If no snapshot exists yet for this user and symbol, create one
    existing_snapshot = (
        db.query(MarketSnapshot)
        .filter(MarketSnapshot.user_id == current_user.id, MarketSnapshot.symbol == sym)
        .first()
    )
    if not existing_snapshot:
        snap = MarketSnapshot(
            user_id=current_user.id,
            symbol=sym,
            price=quote["current_price"],
            volume=quote["volume"],
            average_volume=quote["average_volume"],
            captured_at=datetime.datetime.utcnow(),
        )
        db.add(snap)

    db.commit()
    db.refresh(item)

    return WatchlistItemResponse(
        id=item.id,
        symbol=item.symbol,
        company_name=quote["company_name"],
        current_price=quote["current_price"],
        change_percent=quote["change_percent"],
        volume=quote["volume"],
        average_volume=quote["average_volume"],
        volume_ratio=quote["volume_ratio"],
        data_status=quote["data_status"],
        created_at=item.created_at,
    )

@router.delete("/{symbol}")
def remove_from_watchlist(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sym = normalize_symbol(symbol)
    item = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == current_user.id, WatchlistItem.symbol == sym)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{sym} not found in watchlist.")

    db.delete(item)
    db.commit()
    return {"message": f"Successfully removed {sym} from watchlist."}

@router.get("/changes", response_model=SmartWatchlistResponse)
def get_smart_watchlist_changes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    CRITICAL ORDER:
    1. Load previous snapshot
    2. Fetch current data
    3. Compare
    4. Calculate meaningful change
    5. Save current snapshot (NEVER save new snapshot before comparison)
    """
    watchlist_items = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == current_user.id)
        .all()
    )

    if not watchlist_items:
        return SmartWatchlistResponse(
            tracking_started=False,
            message="Your watchlist is empty. Search and add stocks to track what changes.",
            items=[],
            captured_at=datetime.datetime.utcnow().isoformat(),
        )

    # 1. Fetch previous snapshots for these items
    # We want the most recent snapshot prior to right now
    symbols = [w.symbol for w in watchlist_items]

    previous_snapshots = {}
    for sym in symbols:
        snap = (
            db.query(MarketSnapshot)
            .filter(MarketSnapshot.user_id == current_user.id, MarketSnapshot.symbol == sym)
            .order_by(MarketSnapshot.captured_at.desc())
            .first()
        )
        if snap:
            previous_snapshots[sym] = {
                "price": snap.price,
                "volume": snap.volume,
                "average_volume": snap.average_volume,
                "captured_at": snap.captured_at,
            }

    # 2. If NO snapshots exist at all for the user's watchlist: FIRST VISIT
    if not previous_snapshots:
        # Save initial baseline snapshot
        now = datetime.datetime.utcnow()
        for w in watchlist_items:
            try:
                q = MarketService.get_quote(w.symbol)
                new_snap = MarketSnapshot(
                    user_id=current_user.id,
                    symbol=w.symbol,
                    price=q["current_price"],
                    volume=q["volume"],
                    average_volume=q["average_volume"],
                    captured_at=now,
                )
                db.add(new_snap)
            except Exception:
                pass
        db.commit()

        return SmartWatchlistResponse(
            tracking_started=True,
            message="Tracking started. We saved the current market state. When you return, we'll show you what changed.",
            items=[],
            captured_at=now.isoformat(),
        )

    # 3. We have snapshots! Fetch current data and compare
    current_data_map = {}
    for w in watchlist_items:
        try:
            q = MarketService.get_quote(w.symbol)
            current_data_map[w.symbol] = q
        except Exception:
            pass

    change_items: List[SmartChangeItem] = []
    now = datetime.datetime.utcnow()
    new_snapshots_to_save = []

    for w in watchlist_items:
        sym = w.symbol
        if sym not in current_data_map:
            continue
        curr_q = current_data_map[sym]

        prev_snap = previous_snapshots.get(sym)
        if prev_snap:
            # Calculate meaningful change using deterministic engine
            diff = ChangeEngine.calculate_change(
                symbol=sym,
                company_name=w.company_name or curr_q.get("company_name", sym),
                previous_snapshot=prev_snap,
                current_data=curr_q,
            )
            change_items.append(SmartChangeItem(**diff))
        else:
            # Stock was added without prior snapshot
            pass

        # Prepare new snapshot to be saved AFTER comparison
        new_snapshots_to_save.append(
            MarketSnapshot(
                user_id=current_user.id,
                symbol=sym,
                price=curr_q["current_price"],
                volume=curr_q["volume"],
                average_volume=curr_q["average_volume"],
                captured_at=now,
            )
        )

    # Sort items by attention_score descending (most important change first)
    change_items.sort(key=lambda x: x.attention_score, reverse=True)

    # 4. Now save the new snapshots to DB (after comparison complete)
    for s in new_snapshots_to_save:
        db.add(s)
    db.commit()

    has_meaningful = any(i.meaningful for i in change_items)
    summary_message = (
        "Meaningful market activity detected since your last check."
        if has_meaningful
        else "Nothing meaningful changed since your last check."
    )

    return SmartWatchlistResponse(
        tracking_started=False,
        message=summary_message,
        items=change_items,
        captured_at=now.isoformat(),
    )

@router.post("/snapshot")
def capture_snapshot(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually force capture of baseline snapshot for all watchlist items."""
    watchlist_items = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.user_id == current_user.id)
        .all()
    )
    now = datetime.datetime.utcnow()
    count = 0
    for w in watchlist_items:
        try:
            q = MarketService.get_quote(w.symbol)
            snap = MarketSnapshot(
                user_id=current_user.id,
                symbol=w.symbol,
                price=q["current_price"],
                volume=q["volume"],
                average_volume=q["average_volume"],
                captured_at=now,
            )
            db.add(snap)
            count += 1
        except Exception:
            pass
    db.commit()
    return {"message": f"Captured snapshot for {count} watchlist items.", "captured_at": now.isoformat()}
