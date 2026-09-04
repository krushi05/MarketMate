import json
from sqlalchemy.orm import Session
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import User, Lesson
from backend.app.auth import get_password_hash

LESSONS_DATA = [
    {
        "title": "What is a Stock?",
        "slug": "what-is-a-stock",
        "description": "Discover what owning a share in a business actually means.",
        "content": "A stock represents a small ownership share in a company. If you own one share of a company, you own a tiny fraction of that business. Companies issue stock to raise capital to build products, hire people, and expand operations. As a shareholder, you participate in the company's long-term financial journey.",
        "example": "If a pizza company has 100 total slices (shares) and you buy 5 slices, you own 5% of that entire pizza restaurant.",
        "why_matters": "When the company thrives, increases profits, or pays dividends, your shares can grow in value. But if the company struggles, the share price may fall.",
        "key_takeaway": "Stocks are fractional ownership in real operating businesses, not just random ticker symbols on a screen.",
        "quiz_question": "When you purchase one share of Apple, what have you acquired?",
        "quiz_options": json.dumps([
            "A loan that Apple must pay back to you tomorrow",
            "A tiny fractional ownership share of Apple Inc.",
            "Free lifetime Apple hardware and software products",
            "A guarantee that the share price will double every year"
        ]),
        "correct_answer": 1,
        "order": 1,
    },
    {
        "title": "Why Do Stock Prices Move?",
        "slug": "why-do-stock-prices-move",
        "description": "Understand supply, demand, and how market expectations drive price shifts.",
        "content": "Stock prices move continuously based on supply and demand. If more investors want to buy a stock (demand) than sell it (supply), the price ticks upward. If more investors want to sell than buy, the price ticks downward. This balance reflects investor expectations about the company's future profits, management decisions, and broader economic conditions.",
        "example": "Imagine an auction with 10 vintage concert posters. If 50 people desperately want one, bidders will bid higher and higher. If nobody wants them, sellers must lower prices to find buyers.",
        "why_matters": "Prices don't move randomly; they respond to collective buyer and seller enthusiasm and news about business fundamentals.",
        "key_takeaway": "Price changes are the direct result of buyers and sellers negotiating at every second. High buyer demand pushes prices up; heavy selling pressure pushes them down.",
        "quiz_question": "What primary force causes a stock price to rise during market hours?",
        "quiz_options": json.dumps([
            "More buyers wanting shares than sellers willing to sell (high demand)",
            "The government mandating a higher price at the end of the day",
            "The CEO manually typing a new price into their website",
            "Random computer clock oscillations"
        ]),
        "correct_answer": 0,
        "order": 2,
    },
    {
        "title": "What is an Index?",
        "slug": "what-is-an-index",
        "description": "Learn how stock baskets like Nifty 50 or S&P 500 measure overall market health.",
        "content": "A stock market index is a curated basket of stocks used to measure the performance of an entire market or specific sector. Instead of checking hundreds of individual companies, investors check the index to understand how the broad market is trending today.",
        "example": "A student's GPA is an index. Rather than listing grades in history, chemistry, math, and literature separately, the GPA gives a single composite score of academic progress.",
        "why_matters": "Indexes help you gauge whether the whole market is bullish (optimistic) or bearish (cautious) without getting lost in individual stock noise.",
        "key_takeaway": "An index is a market thermometer. It tracks the health of a representative group of companies as a single benchmark.",
        "quiz_question": "What is the primary role of a market index like the Nifty 50 or S&P 500?",
        "quiz_options": json.dumps([
            "To guarantee that no investor loses money in a downturn",
            "To provide a single benchmark score tracking a basket of representative stocks",
            "To replace human traders with a single computer server",
            "To set the interest rates on personal bank savings accounts"
        ]),
        "correct_answer": 1,
        "order": 3,
    },
    {
        "title": "Risk & Diversification",
        "slug": "risk-and-diversification",
        "description": "Never put all your eggs in one basket. How spreading your bets protects your capital.",
        "content": "Investing involves risk: the real possibility that an investment loses money or fails entirely. Diversification is the strategy of spreading your money across different companies, industries, and asset classes so that a failure in one does not wipe out your total wealth.",
        "example": "If a farmer only plants strawberries and a frost destroys the crop, the farmer is ruined. If the farmer plants wheat, corn, apples, and strawberries, one bad harvest won't destroy the farm.",
        "why_matters": "A concentrated portfolio with only one or two stocks exposes you to catastrophic single-company disasters. Diversification cushions your portfolio against shocks.",
        "key_takeaway": "Don't put all your eggs in one basket. Holding a mix of distinct companies reduces severe losses without eliminating your upside.",
        "quiz_question": "Why do prudent investors diversify their stock portfolios?",
        "quiz_options": json.dumps([
            "To ensure they only pay taxes in foreign countries",
            "To reduce the risk of massive losses if one specific company struggles",
            "To guarantee that their portfolio doubles in value every single week",
            "Because stock brokers forbid owning only one company"
        ]),
        "correct_answer": 1,
        "order": 4,
    },
    {
        "title": "Trading Volume",
        "slug": "trading-volume",
        "description": "Why volume is the secret fingerprint of market conviction and institutional activity.",
        "content": "Trading volume is the total number of shares bought and sold during a given period. While price tells you what the market paid, volume tells you how much conviction was behind that move. High volume during a price jump indicates heavy institutional interest, while price moves on low volume can be misleading and fragile.",
        "example": "Think of a restaurant review. A 5-star rating based on 2 reviews is far less reliable than a 4.7-star rating backed by 5,000 customers. Volume provides statistical credibility.",
        "why_matters": "Smart Watchlist actively monitors volume. When volume is 1.5× or 2× its daily average, it highlights unusual attention from major institutional players.",
        "key_takeaway": "Price shows direction; volume shows conviction. Always check trading volume relative to its 30-day average before trusting a rapid price movement.",
        "quiz_question": "What does unusually high trading volume accompanying a price increase suggest?",
        "quiz_options": json.dumps([
            "The stock exchange is experiencing a technical outage",
            "Strong market conviction and heavy participation from numerous buyers",
            "That only one person traded the stock that day",
            "The company is shutting down operations immediately"
        ]),
        "correct_answer": 1,
        "order": 5,
    },
    {
        "title": "Market Orders vs Limit Orders",
        "slug": "market-orders-vs-limit-orders",
        "description": "Master the difference between buying right now versus waiting for your exact target price.",
        "content": "When placing an order, you have two primary choices: Market Order and Limit Order. A Market Order prioritizes speed: it executes immediately at whatever the best available current market price is. A Limit Order prioritizes price control: you name the maximum price you are willing to pay (or minimum price you will sell for), and the order only executes if the market reaches that price.",
        "example": "Calling a taxi and saying 'take me home right away at the standard meter rate' is like a Market Order. Saying 'I will only get into this cab if you agree to take me for exactly ₹200' is like a Limit Order.",
        "why_matters": "In fast-moving markets, a market order could fill at a price higher than you expected. In liquid demo trading, Market Orders give instant fills, while limit orders provide patient defense.",
        "key_takeaway": "Market orders prioritize execution speed; Limit orders prioritize price certainty.",
        "quiz_question": "If you want to buy a stock immediately regardless of slight price fluctuations, which order type do you use?",
        "quiz_options": json.dumps([
            "Limit Order",
            "Market Order",
            "Stop-Loss Guarantee Order",
            "Post-Dated Certificate Order"
        ]),
        "correct_answer": 1,
        "order": 6,
    },
]

def seed_database(db: Session = None):
    """
    Idempotent database seeding.
    Initializes tables, inserts lessons, and creates demo user if not present.
    """
    Base.metadata.create_all(bind=engine)
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        # 1. Seed or update lessons
        for lesson_info in LESSONS_DATA:
            existing = db.query(Lesson).filter(Lesson.slug == lesson_info["slug"]).first()
            if existing:
                existing.title = lesson_info["title"]
                existing.description = lesson_info["description"]
                existing.content = lesson_info["content"]
                existing.example = lesson_info["example"]
                existing.why_matters = lesson_info["why_matters"]
                existing.key_takeaway = lesson_info["key_takeaway"]
                existing.quiz_question = lesson_info["quiz_question"]
                existing.quiz_options = lesson_info["quiz_options"]
                existing.correct_answer = lesson_info["correct_answer"]
                existing.order = lesson_info["order"]
            else:
                db.add(Lesson(**lesson_info))

        # 2. Seed demo user
        demo_email = "demo@marketmate.local"
        demo_user = db.query(User).filter(User.email == demo_email).first()
        if not demo_user:
            demo_user = User(
                name="Demo Beginner",
                email=demo_email,
                password_hash=get_password_hash("demopassword123"),
                virtual_balance=100000.0,
            )
            db.add(demo_user)

        db.commit()
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()
    print("Database seeding completed successfully.")
