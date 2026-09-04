from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: str = Field(..., pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    virtual_balance: float
    created_at: datetime.datetime
    last_checked_at: Optional[datetime.datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Lesson Schemas ---
class LessonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    description: str
    content: str
    example: str
    why_matters: str
    key_takeaway: str
    quiz_question: str
    quiz_options: List[str]
    order: int
    completed: bool = False
    quiz_correct: bool = False

class LessonCompleteRequest(BaseModel):
    selected_option: int

class LessonCompleteResponse(BaseModel):
    completed: bool
    quiz_correct: bool
    correct_answer: int
    explanation: str

class LessonProgressSummary(BaseModel):
    total_lessons: int
    completed_lessons: int
    completion_percentage: float


# --- Market Schemas ---
class StockQuote(BaseModel):
    symbol: str
    company_name: str
    current_price: float
    previous_close: float
    change: float
    change_percent: float
    volume: float
    average_volume: float
    volume_ratio: float
    data_status: str  # "live" | "fallback" | "simulated"
    timestamp: str

class StockHistoryPoint(BaseModel):
    date: str
    price: float
    volume: float

class StockSearchResult(BaseModel):
    symbol: str
    company_name: str
    current_price: float
    change_percent: float
    data_status: str


# --- Watchlist & Smart Watchlist ---
class WatchlistAddRequest(BaseModel):
    symbol: str

class WatchlistItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    symbol: str
    company_name: str
    current_price: float
    change_percent: float
    volume: float
    average_volume: float
    volume_ratio: float
    data_status: str
    created_at: datetime.datetime

class SmartChangeItem(BaseModel):
    symbol: str
    company_name: str
    current_price: float
    previous_price: float
    change_percent: float
    current_volume: float
    average_volume: float
    volume_ratio: float
    attention_score: int
    attention_level: str  # NORMAL, WORTH WATCHING, IMPORTANT, HIGH ATTENTION
    meaningful: bool
    reasons: List[str]
    beginner_explanation: str
    timestamp: str
    data_status: str

class SmartWatchlistResponse(BaseModel):
    tracking_started: bool
    message: str
    items: List[SmartChangeItem]
    captured_at: str


# --- Portfolio Schemas ---
class PortfolioPositionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    symbol: str
    company_name: str
    quantity: int
    average_buy_price: float
    current_price: float
    current_value: float
    invested_value: float
    unrealized_pnl: float
    unrealized_pnl_percent: float
    data_status: str

class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    symbol: str
    type: str  # BUY or SELL
    quantity: int
    price: float
    total: float
    created_at: datetime.datetime

class PortfolioSummaryResponse(BaseModel):
    virtual_balance: float
    invested_value: float
    total_portfolio_value: float
    total_unrealized_pnl: float
    total_unrealized_pnl_percent: float
    positions: List[PortfolioPositionResponse]


class BuySellRequest(BaseModel):
    symbol: str
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")


# --- Demo Simulation Schemas ---
class SimulateChangeRequest(BaseModel):
    symbol: Optional[str] = "NVDA"
    price_change_pct: Optional[float] = 4.2
    volume_ratio: Optional[float] = 1.8
