import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  ArrowRight,
  Eye,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { DataStatusBadge } from "../components/DataStatusBadge";
import type {
  LessonProgressSummary,
  PortfolioSummary,
  SmartWatchlistResponse,
  StockSearchResult,
} from "../types";

interface Props {
  onNavigate: (tab: string, param?: string) => void;
  onOpenSimulate: () => void;
}

export const DashboardPage: React.FC<Props> = ({ onNavigate, onOpenSimulate }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LessonProgressSummary | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [smartWatchlist, setSmartWatchlist] = useState<SmartWatchlistResponse | null>(null);
  const [popularStocks, setPopularStocks] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const loadData = useCallback(async () => {
    try {
      const [progData, portData, smartData, searchData] = await Promise.all([
        api.getLessonProgress().catch(() => null),
        api.getPortfolio().catch(() => null),
        api.getSmartWatchlistChanges().catch(() => null),
        api.searchMarket("").catch(() => []),
      ]);

      if (progData) setProgress(progData);
      if (portData) setPortfolio(portData);
      if (smartData) setSmartWatchlist(smartData);
      if (searchData) setPopularStocks(searchData.slice(0, 5));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <div className="space-y-8 py-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Welcome, {user?.name || "Investor"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            "Learn the market before you risk your money." — Virtual practice environment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-dashboard"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh market & portfolio data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            id="btn-dash-simulate-quick"
            onClick={onOpenSimulate}
            className="py-2 px-3.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>Simulate Market Movement</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Learning Journey Card */}
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Lesson Progress
              </span>
              <span className="text-xs font-medium text-zinc-400">
                {progress?.completed_lessons || 0} / {progress?.total_lessons || 6} Completed
              </span>
            </div>
            <h3 className="text-base font-semibold text-zinc-100">
              {progress?.completed_lessons === 6
                ? "All Lessons Mastered!"
                : "Market Fundamentals"}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Understand stock prices, trading volume, order books, and P/E ratios.
            </p>
            {/* Progress Bar */}
            <div className="w-full bg-zinc-800 h-2 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress ? progress.completion_percentage : 0}%`,
                }}
              />
            </div>
          </div>
          <button
            id="btn-dash-continue-learning"
            onClick={() => onNavigate("learn")}
            className="mt-5 w-full py-2 px-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/40 text-indigo-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{progress?.completed_lessons === 0 ? "Start Lesson 1" : "Continue Learning"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Virtual Portfolio Card */}
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Virtual Portfolio
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                Risk-Free
              </span>
            </div>
            <div className="text-2xl font-bold text-zinc-100 tracking-tight">
              {formatINR(portfolio?.total_portfolio_value ?? 100000)}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800/60 text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">Available Cash:</span>
                <span className="font-semibold text-zinc-200">
                  {formatINR(portfolio?.virtual_balance ?? 100000)}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Invested Value:</span>
                <span className="font-semibold text-zinc-200">
                  {formatINR(portfolio?.invested_value ?? 0)}
                </span>
              </div>
            </div>
            {portfolio && portfolio.invested_value > 0 && (
              <div className="mt-2 text-xs flex items-center gap-1.5">
                <span className="text-zinc-400 text-[11px]">Unrealized P&L:</span>
                <span
                  className={`font-semibold flex items-center ${
                    portfolio.total_unrealized_pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {portfolio.total_unrealized_pnl >= 0 ? "+" : ""}
                  {formatINR(portfolio.total_unrealized_pnl)} ({portfolio.total_unrealized_pnl_percent}%)
                </span>
              </div>
            )}
          </div>
          <div className="mt-5 flex items-center gap-2">
            <button
              id="btn-dash-view-portfolio"
              onClick={() => onNavigate("portfolio")}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/40 text-emerald-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Holdings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-dash-cash-guide"
              onClick={() => onNavigate("profile")}
              className="py-2 px-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[11px] font-medium transition cursor-pointer shrink-0"
              title="Learn how to spend your virtual cash safely"
            >
              Cash Guide
            </button>
          </div>
        </div>

        {/* Smart Watchlist Highlight Card */}
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 flex flex-col justify-between shadow-sm md:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Since You Last Checked
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/40">
                Change Engine
              </span>
            </div>
            {smartWatchlist?.items && smartWatchlist.items.length > 0 ? (
              <div className="space-y-2">
                {(() => {
                  const topMover = smartWatchlist.items[0];
                  return (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-100">{topMover.symbol}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-900/40 text-amber-300 border border-amber-700/50">
                          {topMover.attention_level}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1">
                        Score {topMover.attention_score}/100 • {topMover.change_percent >= 0 ? "+" : ""}
                        {topMover.change_percent}% • {topMover.volume_ratio}× Volume
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                        {topMover.beginner_explanation}
                      </p>
                      {smartWatchlist.items.length > 1 && (
                        <p className="text-[10px] text-amber-400/80 mt-1.5 font-medium">
                          +{smartWatchlist.items.length - 1} more stocks in your watchlist
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : smartWatchlist?.tracking_started ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-amber-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold">Tracking Started</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We saved your baseline market snapshot. Use the "Simulate Market Movement" button above to test how our engine flags meaningful changes!
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-zinc-300">No Tracked Stocks Yet</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Add stocks like NVDA to your watchlist to track price and volume changes.
                </p>
              </div>
            )}
          </div>
          <button
            id="btn-dash-view-smart-watchlist"
            onClick={() => onNavigate("smart-watchlist")}
            className="mt-5 w-full py-2 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/40 text-amber-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open Smart Watchlist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Discover / Market Overview Section */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Popular Stocks in Demo Market
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live quotes with instant static fallback guarantee. Practice buying and tracking.
            </p>
          </div>
          <button
            id="btn-dash-see-all-market"
            onClick={() => onNavigate("market")}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer"
          >
            <span>Search All Stocks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="pb-3 font-medium">Symbol & Company</th>
                <th className="pb-3 font-medium text-right">Price</th>
                <th className="pb-3 font-medium text-right">Day Change</th>
                <th className="pb-3 font-medium text-center">Data Feed</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {popularStocks.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-zinc-850/40 transition">
                  <td className="py-3.5">
                    <div className="font-semibold text-zinc-200">{stock.symbol}</div>
                    <div className="text-[11px] text-zinc-400">{stock.company_name}</div>
                  </td>
                  <td className="py-3.5 text-right font-medium text-zinc-200">
                    {formatINR(stock.current_price)}
                  </td>
                  <td className="py-3.5 text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 font-medium ${
                        stock.change_percent >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {stock.change_percent >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {stock.change_percent >= 0 ? "+" : ""}
                      {stock.change_percent}%
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <DataStatusBadge status={stock.data_status} size="sm" />
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      id={`btn-dash-view-${stock.symbol}`}
                      onClick={() => onNavigate("stock-detail", stock.symbol)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition cursor-pointer"
                    >
                      Trade / Learn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
