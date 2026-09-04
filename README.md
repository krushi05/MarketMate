# MarketMate — Learn the market before you risk your money.

> *"We don't tell beginners what to buy. We teach them how to understand what they're seeing."*

MarketMate is an educational stock market simulator designed specifically for first-time investors. Instead of throwing beginners into complex charts and high-risk real money trades, MarketMate teaches foundational market mechanics through guided interactive lessons, risk-free demo trading with ₹1,00,000 virtual balance, and a **Smart Watchlist** that tracks what changed since the user's last visit.

---

## 🌟 Key Features

### 1. Interactive Beginner Curriculum (6 Lessons)
Each lesson follows an educational four-part structure:
- **Concept Explanation**: Clear, jargon-free description.
- **Real-World Analogy**: Relatable scenarios (bakery ownership, auctions, fruit markets, house rentals).
- **Why It Matters**: Practical takeaway before putting money at risk.
- **Quick Check Quiz**: Immediate interactive validation with persisted completion badges.

**Curriculum Topics:**
1. What Is a Stock? (Fractional ownership)
2. How Stock Prices Move (Supply & Demand)
3. What Is Trading Volume? (Institutional conviction vs. noise)
4. What Is an Order Book? (Bids, Asks & Spreads)
5. What Is a P/E Ratio? (Valuation vs. price)
6. Stock Market Indices (Nifty 50, S&P 500 benchmark thermometers)

### 2. Risk-Free Demo Trading Terminal
- **Starting Balance**: ₹1,00,000 in virtual capital.
- **Atomic Transaction Safety**: Buy/sell operations are atomic. Balance deduction, position creation, and transaction history logging succeed or roll back together.
- **Rigorous Portfolio Validation**:
  - Rejects zero quantity
  - Rejects negative quantity
  - Rejects buying when balance is insufficient
  - Rejects selling more shares than currently owned
  - Prevents double-click duplicate orders with disabled state handling during execution

### 3. Smart Watchlist: "Since You Last Checked"
Standard trading apps flood beginners with flashing green and red ticks every second. MarketMate's **Deterministic Snapshot Engine**:
- **First Visit Correctness**: On first visit, saves the current market state as a baseline and states *"Tracking started. We saved the current market state. When you return, we'll show you what changed."* It **never** fakes a comparison.
- **Meaningful Change Detection**: Evaluates price delta and volume ratio. Only flags movements when:
  - Absolute price change is $\ge 3\%$ OR
  - Trading volume is $\ge 1.5\times$ 30-day average
- **Factual Attribution**: Bullet points detailing exactly what changed (e.g., *"Price increased 4.2% since snapshot"*, *"Trading volume surged to 1.8× normal"*).
- **Beginner Interpretation**: Educational narratives explaining what institutional buying or volume surges mean for novice investors.
- **Attention Scoring**: 0–100 scale categorizing stocks into *Normal*, *Worth Watching*, *Important*, or *High Attention*.

### 4. Built-In Simulation Tool (For Judges & Evaluation)
Judges can test the Smart Watchlist at any time without waiting for real market hours:
- Click **"Simulate Spike (Judges Demo)"** in the top navigation or on any stock page.
- Choose a stock (e.g., `NVDA`) and apply a custom price delta (e.g., `+4.2%`) and volume multiplier (e.g., `1.8x`).
- Return to **Smart Watchlist** to see the deterministic comparison engine flag the meaningful movement instantly!

### 5. Resilient Market Data Architecture
- Integrates real ticker discovery (`NVDA`, `AAPL`, `MSFT`, `TSLA`, `RELIANCE.NS`, `TCS.NS`).
- Employs a reliable fallback strategy (`LIVE_DATA`, `DEMO_FALLBACK_STALE`, `SIMULATED`) ensuring user practice is never interrupted if third-party feeds are offline or rate-limited.

---

## 🚀 Quick Start & Demo Credentials

### Requirements

- Node.js 18 or newer (Node.js 20 LTS is recommended)
- npm 9 or newer
- A modern browser such as Chrome, Edge, Firefox, or Safari

The main application is self-contained. It does not require a database server,
Python, Docker, or any API keys for the core demo.

### Run from a downloaded ZIP

Open Terminal and run these commands from the extracted project directory:

```bash
cd /path/to/marketmate
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser. Keep
the terminal running while using the app. Stop the server with `Ctrl+C`.

On Windows PowerShell, use the same commands after changing into the extracted
folder, for example:

```powershell
cd C:\path\to\marketmate
npm install
npm run dev
```

The app creates or updates `marketmate_data.json` in the project directory.
This file is the local demo store, so no separate database setup is needed.

### Production-style local run

To build and run the app in production mode:

```bash
npm install
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) after `npm start` prints
the server URL.

### Verify the complete flow

With the development server running in one terminal, open a second terminal in
the project directory and run:

```bash
npm run verify
```

This checks authentication, lessons, market data, portfolio transactions,
watchlists, and the simulated market-change flow.

### Default Demo Account
You can register a new account or sign in with the pre-seeded credentials:
- **Email**: `demo@marketmate.local`
- **Password**: `demopassword123`
- **Starting Virtual Balance**: ₹1,00,000

---

## 🧪 Verification & Testing

MarketMate includes an automated end-to-end verification script testing the entire user flow:
```bash
npm run verify
```

**Automated Test Matrix:**
1. Authentication & JWT issuance
2. Lesson retrieval & progress summary
3. Quiz submission & grading
4. Market ticker search & quote inspection
5. Validation: Zero quantity & negative quantity rejection
6. Atomic Buy execution & balance deduction
7. Validation: Reject selling more shares than owned
8. Watchlist addition & persistence
9. Smart Watchlist first visit baseline capture
10. Simulation trigger (+4.2% price, 1.8x volume)
11. Smart Watchlist meaningful change detection & attention scoring
12. Atomic Sell execution & portfolio position update
13. Transaction ledger verification

---

## 🏗️ Technical Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend API**: Express / TypeScript monolithic server running on port 3000.
- **Persistence**: Transaction-safe data store (`marketmate_data.json`) managing users, watchlists, snapshots, positions, transactions, and lesson progress.
- **Security**: Password hashing with `bcryptjs`, stateless authentication with signed JWTs.

## 🐍 Optional FastAPI backend

The `backend/` directory contains a separate FastAPI implementation. It is not
needed to run the main React/Express app above. To run it independently:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
PYTHONPATH=.. python -m uvicorn app.main:app --reload --port 8000
```

On Windows PowerShell, activate the environment with
`.venv\Scripts\Activate.ps1` instead. The FastAPI health endpoint is
`http://localhost:8000/api/health`.

## Troubleshooting

- **`npm: command not found`**: install Node.js 18+ and reopen Terminal.
- **Port 3000 is already in use**: stop the other process using port 3000,
  then run the app again.
- **The browser shows a blank or stale page**: stop the server, remove
  `node_modules`, run `npm install`, and start it again with `npm run dev`.
- **The demo data needs resetting**: stop the server, back up or delete
  `marketmate_data.json`, then run `npm run dev` again. The demo account is
  recreated automatically when needed.
