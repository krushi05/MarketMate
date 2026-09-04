from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import engine, Base
from backend.app.seed import seed_database
from backend.app.routes import auth, lessons, market, watchlist, portfolio, demo

# Create database tables and run idempotent seed
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="MarketMate API",
    description="Educational stock market simulator with Smart Watchlists and guided lessons.",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(auth.router)
app.include_router(lessons.router)
app.include_router(market.router)
app.include_router(watchlist.router)
app.include_router(portfolio.router)
app.include_router(demo.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": "MarketMate API",
        "disclaimer": "MarketMate is an educational demo. It does not provide financial advice or execute real-money trades.",
    }
