from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models import User, PortfolioPosition, Transaction
from backend.app.services.market_service import MarketService, normalize_symbol

class PortfolioService:
    @staticmethod
    def buy_stock(db: Session, user: User, symbol: str, quantity: int) -> dict:
        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than zero.",
            )

        sym = normalize_symbol(symbol)
        try:
            quote = MarketService.get_quote(sym)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid stock symbol '{sym}'.",
            )

        current_price = float(quote["current_price"])
        total_cost = round(current_price * quantity, 2)

        # Atomic transaction execution
        try:
            # Refresh user with lock
            user_in_db = db.query(User).filter(User.id == user.id).with_for_update().first()
            if not user_in_db:
                raise HTTPException(status_code=404, detail="User not found.")

            if user_in_db.virtual_balance < total_cost:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient balance. Required: ₹{total_cost:,.2f}, Available: ₹{user_in_db.virtual_balance:,.2f}.",
                )

            # Deduct balance
            user_in_db.virtual_balance = round(user_in_db.virtual_balance - total_cost, 2)

            # Update or create portfolio position
            position = (
                db.query(PortfolioPosition)
                .filter(PortfolioPosition.user_id == user.id, PortfolioPosition.symbol == sym)
                .first()
            )

            if position:
                total_existing_cost = position.quantity * position.average_buy_price
                new_quantity = position.quantity + quantity
                new_avg_price = round((total_existing_cost + total_cost) / new_quantity, 2)
                position.quantity = new_quantity
                position.average_buy_price = new_avg_price
            else:
                position = PortfolioPosition(
                    user_id=user.id,
                    symbol=sym,
                    quantity=quantity,
                    average_buy_price=current_price,
                )
                db.add(position)

            # Record transaction
            txn = Transaction(
                user_id=user.id,
                symbol=sym,
                type="BUY",
                quantity=quantity,
                price=current_price,
                total=total_cost,
            )
            db.add(txn)

            db.commit()
            db.refresh(user_in_db)
            db.refresh(txn)

            return {
                "message": f"Successfully bought {quantity} shares of {sym} at ₹{current_price:,.2f}",
                "virtual_balance": user_in_db.virtual_balance,
                "transaction_id": txn.id,
            }
        except HTTPException:
            db.rollback()
            raise
        except Exception as ex:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Transaction failed: {str(ex)}",
            )

    @staticmethod
    def sell_stock(db: Session, user: User, symbol: str, quantity: int) -> dict:
        if quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than zero.",
            )

        sym = normalize_symbol(symbol)
        try:
            quote = MarketService.get_quote(sym)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid stock symbol '{sym}'.",
            )

        current_price = float(quote["current_price"])
        total_payout = round(current_price * quantity, 2)

        try:
            user_in_db = db.query(User).filter(User.id == user.id).with_for_update().first()
            if not user_in_db:
                raise HTTPException(status_code=404, detail="User not found.")

            position = (
                db.query(PortfolioPosition)
                .filter(PortfolioPosition.user_id == user.id, PortfolioPosition.symbol == sym)
                .first()
            )

            if not position or position.quantity < quantity:
                owned = position.quantity if position else 0
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot sell {quantity} shares. You only own {owned} shares of {sym}.",
                )

            # Credit balance
            user_in_db.virtual_balance = round(user_in_db.virtual_balance + total_payout, 2)

            # Update position
            position.quantity -= quantity
            if position.quantity == 0:
                db.delete(position)

            # Record transaction
            txn = Transaction(
                user_id=user.id,
                symbol=sym,
                type="SELL",
                quantity=quantity,
                price=current_price,
                total=total_payout,
            )
            db.add(txn)

            db.commit()
            db.refresh(user_in_db)

            return {
                "message": f"Successfully sold {quantity} shares of {sym} at ₹{current_price:,.2f}",
                "virtual_balance": user_in_db.virtual_balance,
                "transaction_id": txn.id,
            }
        except HTTPException:
            db.rollback()
            raise
        except Exception as ex:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Transaction failed: {str(ex)}",
            )

    @staticmethod
    def get_summary(db: Session, user: User) -> dict:
        positions = db.query(PortfolioPosition).filter(PortfolioPosition.user_id == user.id).all()
        user_in_db = db.query(User).filter(User.id == user.id).first()
        virtual_balance = user_in_db.virtual_balance if user_in_db else user.virtual_balance

        position_responses = []
        total_invested = 0.0
        total_current_value = 0.0

        for pos in positions:
            try:
                quote = MarketService.get_quote(pos.symbol)
                curr_price = float(quote["current_price"])
                data_status = quote["data_status"]
                company_name = quote["company_name"]
            except Exception:
                curr_price = pos.average_buy_price
                data_status = "fallback"
                company_name = pos.symbol

            invested = round(pos.quantity * pos.average_buy_price, 2)
            cur_val = round(pos.quantity * curr_price, 2)
            pnl = round(cur_val - invested, 2)
            pnl_pct = round((pnl / invested) * 100.0, 2) if invested > 0 else 0.0

            total_invested += invested
            total_current_value += cur_val

            position_responses.append({
                "id": pos.id,
                "symbol": pos.symbol,
                "company_name": company_name,
                "quantity": pos.quantity,
                "average_buy_price": pos.average_buy_price,
                "current_price": curr_price,
                "current_value": cur_val,
                "invested_value": invested,
                "unrealized_pnl": pnl,
                "unrealized_pnl_percent": pnl_pct,
                "data_status": data_status,
            })

        total_pnl = round(total_current_value - total_invested, 2)
        total_pnl_pct = round((total_pnl / total_invested) * 100.0, 2) if total_invested > 0 else 0.0
        total_portfolio_value = round(virtual_balance + total_current_value, 2)

        return {
            "virtual_balance": virtual_balance,
            "invested_value": round(total_invested, 2),
            "total_portfolio_value": total_portfolio_value,
            "total_unrealized_pnl": total_pnl,
            "total_unrealized_pnl_percent": total_pnl_pct,
            "positions": position_responses,
        }
