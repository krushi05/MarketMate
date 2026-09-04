import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Plus,
  Check,
  HelpCircle,
  Sparkles,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { DataStatusBadge } from "../components/DataStatusBadge";
import type {
  StockQuote,
  StockHistoryPoint,
  PortfolioSummary,
  Transaction,
} from "../types";

interface Props {
  symbol: string;
  onBack: () => void;
  onOpenSimulate: () => void;
  onNavigateWatchlist?: () => void;
}

export const StockDetailPage: React.FC<Props> = ({
  symbol,
  onBack,
  onOpenSimulate,
  onNavigateWatchlist,
}) => {
  const { user, refreshUser } = useAuth();
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<StockHistoryPoint[]>([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistAlert, setWatchlistAlert] = useState<{ text: string; added: boolean } | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Trade form state
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState<number>(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const loadStockData = useCallback(async () => {
    try {
      const [q, hist, wl, port, txns] = await Promise.all([
        api.getQuote(symbol),
        api.getHistory(symbol).catch(() => []),
        api.getWatchlist().catch(() => []),
        api.getPortfolio().catch(() => null),
        api.getTransactions().catch(() => []),
      ]);

      setQuote(q);
      setHistory(hist);
      setIsInWatchlist(wl.some((w) => w.symbol === symbol));
      if (port) setPortfolio(port);
      setTransactions(txns.filter((t) => t.symbol === symbol));
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    loadStockData();
  }, [loadStockData]);

  const handleToggleWatchlist = async () => {
    try {
      if (isInWatchlist) {
        await api.removeFromWatchlist(symbol);
        setIsInWatchlist(false);
        setWatchlistAlert({ text: `Removed ${symbol} from watchlist.`, added: false });
        setTimeout(() => setWatchlistAlert(null), 3500);
      } else {
        await api.addToWatchlist(symbol);
        setIsInWatchlist(true);
        setWatchlistAlert({ text: `Added ${symbol} to Smart Watchlist! Baseline captured.`, added: true });
        setTimeout(() => setWatchlistAlert(null), 4500);
      }
    } catch (err: any) {
      setWatchlistAlert({ text: err.message || "Failed to update watchlist", added: false });
      setTimeout(() => setWatchlistAlert(null), 4000);
    }
  };

  const handleExecuteTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setTradeError(null);
    setTradeSuccess(null);

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      setTradeError("Please enter a valid positive whole number of shares.");
      return;
    }

    setTradeLoading(true);
    try {
      if (tradeType === "BUY") {
        const res = await api.buyStock(symbol, quantity);
        setTradeSuccess(res.message);
      } else {
        const res = await api.sellStock(symbol, quantity);
        setTradeSuccess(res.message);
      }
      // Refresh user balance and portfolio data atomically
      await Promise.all([refreshUser(), loadStockData()]);
      setQuantity(1);
    } catch (err: any) {
      setTradeError(err.message || "Trade operation failed.");
    } finally {
      setTradeLoading(false);
    }
  };

  if (loading || !quote) {
    return (
      <div className="py-16 text-center text-zinc-400 text-sm">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading stock quotes and order book...
      </div>
    );
  }

  const currentPosition = portfolio?.positions.find((p) => p.symbol === symbol);
  const sharesOwned = currentPosition ? currentPosition.quantity : 0;
  const totalCost = quote.current_price * (quantity || 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6 relative">
      {/* Floating Smart Watchlist Notification Banner */}
      {watchlistAlert && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900/95 border border-amber-500/80 shadow-2xl shadow-black/80 flex items-center gap-3.5 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-100">{watchlistAlert.text}</p>
            <p className="text-[11px] text-zinc-400">Baseline recorded. Ready for volume & price spike tracking.</p>
          </div>
          {onNavigateWatchlist && (
            <button
              onClick={onNavigateWatchlist}
              className="ml-2 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <span>View Watchlist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Back button */}
      <button
        id="btn-back-to-market"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Market Search</span>
      </button>

      {/* Stock Header Banner */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
                {quote.symbol}
              </h1>
              <DataStatusBadge status={quote.data_status} />
            </div>
            <p className="text-sm text-zinc-400 mt-1 font-medium">
              {quote.company_name}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="btn-stock-toggle-watchlist"
              onClick={handleToggleWatchlist}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isInWatchlist
                  ? "bg-amber-950/70 text-amber-300 border border-amber-700/60 hover:bg-rose-950/70 hover:text-rose-300"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
              }`}
            >
              {isInWatchlist ? (
                <>
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>
            <button
              id="btn-stock-simulate"
              onClick={onOpenSimulate}
              className="py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/40 text-purple-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Simulate a price and volume spike for this stock"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Simulate</span>
            </button>
          </div>
        </div>

        {/* Big Price and Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-zinc-800/80">
          <div>
            <span className="text-[11px] text-zinc-500 font-medium block">Current Price</span>
            <span className="text-xl sm:text-2xl font-bold text-zinc-100">
              {formatINR(quote.current_price)}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 font-medium block">Day Change</span>
            <span
              className={`text-lg font-bold flex items-center gap-1 ${
                quote.change_percent >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {quote.change_percent >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {quote.change_percent >= 0 ? "+" : ""}
              {quote.change_percent}% ({formatINR(quote.change)})
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 font-medium block">Trading Volume</span>
            <span className="text-sm font-semibold text-zinc-200 block mt-1">
              {(quote.volume / 1000000).toFixed(2)}M shares
            </span>
            <span className="text-[10px] text-zinc-400">
              Avg: {(quote.average_volume / 1000000).toFixed(2)}M
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 font-medium block">Volume Ratio</span>
            <span
              className={`text-base font-bold block mt-1 ${
                quote.volume_ratio >= 1.5
                  ? "text-amber-400"
                  : quote.volume_ratio < 0.8
                  ? "text-zinc-400"
                  : "text-zinc-200"
              }`}
            >
              {quote.volume_ratio}× normal
            </span>
            <span className="text-[10px] text-zinc-400">
              {quote.volume_ratio >= 1.5 ? "Surge detected" : "Normal activity"}
            </span>
          </div>
        </div>
      </div>

      {/* Educational Explanation Box: "Why Does This Matter?" */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Educational Insight: Understanding What You're Seeing</span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {quote.volume_ratio >= 1.5 ? (
            <>
              <strong>High Volume Detected ({quote.volume_ratio}× normal): </strong>
              When trading volume surges well above average alongside a price move ({quote.change_percent >= 0 ? "+" : ""}{quote.change_percent}%), it indicates strong institutional participation or high-conviction news. Beginners should check if the move is sustained before reacting.
            </>
          ) : (
            <>
              <strong>Normal Trading Activity ({quote.volume_ratio}× average): </strong>
              Price changes on normal volume represent standard market fluctuations without unusual buying or selling pressure.
            </>
          )}
        </p>
      </div>

      {/* Chart & Trading Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>7-Day Price History</span>
            </h3>
            <span className="text-[11px] text-zinc-400">Trend & Historical closes</span>
          </div>

          <div className="h-64 w-full">
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={["dataMin - 2", "dataMax + 2"]}
                    tickFormatter={(val) => `₹${Math.round(val)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f4f4f5",
                    }}
                    formatter={(val: any) => [formatINR(Number(val)), "Price"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                Chart history updating...
              </div>
            )}
          </div>
        </div>

        {/* Demo Trading Box */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Demo Trading</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              Virtual Cash
            </span>
          </div>

          {/* Buy / Sell Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              id="tab-trade-buy"
              type="button"
              onClick={() => {
                setTradeType("BUY");
                setTradeError(null);
                setTradeSuccess(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                tradeType === "BUY"
                  ? "bg-emerald-600 text-zinc-950 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Buy {symbol}
            </button>
            <button
              id="tab-trade-sell"
              type="button"
              onClick={() => {
                setTradeType("SELL");
                setTradeError(null);
                setTradeSuccess(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                tradeType === "SELL"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sell {symbol}
            </button>
          </div>

          {/* Status Details */}
          <div className="space-y-1.5 text-xs bg-zinc-950/60 p-3 rounded-xl border border-zinc-850">
            <div className="flex justify-between">
              <span className="text-zinc-400">Available Cash:</span>
              <span className="font-semibold text-zinc-200">
                {formatINR(user?.virtual_balance ?? 100000)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Shares Owned:</span>
              <span className="font-semibold text-zinc-200">{sharesOwned} shares</span>
            </div>
          </div>

          {/* Messages */}
          {tradeError && (
            <div
              id="trade-error-msg"
              className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs leading-relaxed flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{tradeError}</span>
            </div>
          )}

          {tradeSuccess && (
            <div
              id="trade-success-msg"
              className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs leading-relaxed flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{tradeSuccess}</span>
            </div>
          )}

          {/* Trade Form */}
          <form onSubmit={handleExecuteTrade} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Number of Shares
              </label>
              <input
                id="input-trade-quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 font-semibold"
              />

              {/* Quick Quantity Chips */}
              <div className="flex items-center gap-1.5 mt-2">
                {[1, 5, 10, 25].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-750 text-[11px] font-medium text-zinc-300 transition cursor-pointer"
                  >
                    +{q}
                  </button>
                ))}
                {tradeType === "SELL" && sharesOwned > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuantity(sharesOwned)}
                    className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-[11px] font-medium text-rose-300 hover:bg-rose-900/60 transition cursor-pointer"
                  >
                    Max ({sharesOwned})
                  </button>
                )}
              </div>
            </div>

            {/* Total calculation */}
            <div className="pt-2 border-t border-zinc-800/70 flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-medium">Estimated Total:</span>
              <span className="text-sm font-bold text-zinc-100">
                {formatINR(totalCost)}
              </span>
            </div>

            <button
              id="btn-execute-trade"
              type="submit"
              disabled={tradeLoading || quantity <= 0}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 ${
                tradeType === "BUY"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-zinc-950"
                  : "bg-rose-600 hover:bg-rose-500 text-white"
              }`}
            >
              {tradeLoading ? (
                <span>Executing atomically...</span>
              ) : (
                <span>
                  Confirm {tradeType === "BUY" ? "Buy" : "Sell"} {quantity} Share{quantity > 1 ? "s" : ""}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Past Transactions for this stock */}
      {transactions.length > 0 && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-zinc-200">
            Your Trades in {symbol}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2 text-right">Shares</th>
                  <th className="pb-2 text-right">Executed Price</th>
                  <th className="pb-2 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-2.5 text-zinc-400">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          tx.type === "BUY"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800/50"
                            : "bg-rose-950 text-rose-300 border border-rose-800/50"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium text-zinc-200">
                      {tx.quantity}
                    </td>
                    <td className="py-2.5 text-right font-medium text-zinc-200">
                      {formatINR(tx.price)}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-zinc-100">
                      {formatINR(tx.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
