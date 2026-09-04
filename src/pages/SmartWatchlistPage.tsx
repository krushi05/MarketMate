import React, { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Sparkles,
  RefreshCw,
  Camera,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Trash2,
  ExternalLink,
  Info,
} from "lucide-react";
import { api } from "../services/api";
import { DataStatusBadge } from "../components/DataStatusBadge";
import type { SmartWatchlistResponse, SmartChangeItem } from "../types";

interface Props {
  onSelectStock: (symbol: string) => void;
  onOpenSimulate: () => void;
  onNavigateMarket: () => void;
}

export const SmartWatchlistPage: React.FC<Props> = ({
  onSelectStock,
  onOpenSimulate,
  onNavigateMarket,
}) => {
  const [data, setData] = useState<SmartWatchlistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [filterMeaningfulOnly, setFilterMeaningfulOnly] = useState(false);
  const [quickAddSymbol, setQuickAddSymbol] = useState("");
  const [quickAdding, setQuickAdding] = useState(false);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const loadChanges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getSmartWatchlistChanges();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChanges();
  }, [loadChanges]);

  const handleQuickAdd = async (sym: string) => {
    if (!sym) return;
    setQuickAdding(true);
    try {
      await api.addToWatchlist(sym.toUpperCase().trim());
      setStatusNotice(`Added ${sym.toUpperCase()} to Smart Watchlist! Baseline snapshot captured.`);
      setQuickAddSymbol("");
      await loadChanges();
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err: any) {
      setStatusNotice(err.message || "Failed to add to watchlist");
      setTimeout(() => setStatusNotice(null), 4000);
    } finally {
      setQuickAdding(false);
    }
  };

  const handleCaptureSnapshot = async () => {
    setCapturing(true);
    setStatusNotice(null);
    try {
      const res = await api.captureSnapshot();
      setStatusNotice(res.message);
      await loadChanges();
      setTimeout(() => setStatusNotice(null), 3000);
    } catch (err: any) {
      setStatusNotice(err.message || "Failed to capture snapshot");
      setTimeout(() => setStatusNotice(null), 4000);
    } finally {
      setCapturing(false);
    }
  };

  const handleRemoveStock = async (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    try {
      await api.removeFromWatchlist(symbol);
      await loadChanges();
    } catch (err: any) {
      setStatusNotice(err.message || "Failed to remove stock");
      setTimeout(() => setStatusNotice(null), 4000);
    }
  };

  const getAttentionBadgeClass = (level: string) => {
    switch (level) {
      case "HIGH ATTENTION":
        return "bg-rose-950/80 text-rose-300 border-rose-700/60";
      case "IMPORTANT":
        return "bg-orange-950/80 text-orange-300 border-orange-700/60";
      case "WORTH WATCHING":
        return "bg-amber-950/80 text-amber-300 border-amber-700/60";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const itemsToShow = data?.items
    ? filterMeaningfulOnly
      ? data.items.filter((i) => i.meaningful)
      : data.items
    : [];

  return (
    <div className="space-y-6 py-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/50 text-xs font-semibold mb-2">
              <Eye className="w-3.5 h-3.5" />
              <span>Deterministic Snapshot Comparison Engine</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Smart Watchlist: "Since You Last Checked"
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              We never show overwhelming, noisy price ticks. MarketMate saves clean snapshots and highlights genuine, meaningful movements—flagging price spikes (≥3%) or unusual volume surges (≥1.5×).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-smart-simulate-change"
              onClick={onOpenSimulate}
              className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Trigger a simulated price or volume spike"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Spike (Judges Demo)</span>
            </button>

            <button
              id="btn-smart-capture-snapshot"
              onClick={handleCaptureSnapshot}
              disabled={capturing}
              className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Save current market quotes as the new baseline snapshot"
            >
              <Camera className="w-3.5 h-3.5 text-zinc-400" />
              <span>{capturing ? "Saving..." : "Take Snapshot Now"}</span>
            </button>
          </div>
        </div>

        {/* Quick Add Ticker Form */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              id="input-quick-add-watchlist"
              type="text"
              value={quickAddSymbol}
              onChange={(e) => setQuickAddSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleQuickAdd(quickAddSymbol)}
              placeholder="Add ticker to watchlist (e.g. NVDA, TCS.NS)..."
              className="flex-1 px-3.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono uppercase transition"
            />
            <button
              id="btn-quick-add-submit"
              onClick={() => handleQuickAdd(quickAddSymbol)}
              disabled={!quickAddSymbol || quickAdding}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold text-xs transition cursor-pointer"
            >
              {quickAdding ? "Adding..." : "+ Add"}
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-xs text-zinc-400">
            <span className="text-[11px] text-zinc-500">Quick Track:</span>
            {["NVDA", "AAPL", "MSFT", "TSLA", "RELIANCE.NS"].map((sym) => (
              <button
                key={sym}
                onClick={() => handleQuickAdd(sym)}
                className="px-2 py-0.5 rounded-md bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-300 hover:text-zinc-100 text-[11px] transition cursor-pointer font-mono"
              >
                +{sym}
              </button>
            ))}
          </div>
        </div>

        {statusNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}
      </div>

      {/* First Visit Condition Banner */}
      {data?.tracking_started && (
        <div
          id="banner-tracking-started"
          className="rounded-2xl bg-amber-950/30 border border-amber-800/50 p-6 space-y-3"
        >
          <div className="flex items-center gap-2 text-amber-300">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="font-semibold text-sm">Tracking Started</h3>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
            We have captured your baseline market snapshot for your watchlist. As prices evolve or when you click "Simulate Spike", our engine calculates the exact price delta and volume ratio.
          </p>
          <div className="pt-2">
            <button
              id="btn-test-simulation-now"
              onClick={onOpenSimulate}
              className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Spike (Judges Demo)</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty Watchlist Case */}
      {data && !data.tracking_started && data.items.length === 0 && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-12 text-center space-y-5">
          <Eye className="w-10 h-10 text-zinc-600 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-zinc-200">
              Your Smart Watchlist Is Empty
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Add any ticker to start tracking meaningful changes without the noise of minute-by-minute ticks.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2 max-w-md mx-auto">
            {["NVDA", "AAPL", "TSLA", "MSFT", "RELIANCE.NS"].map((sym) => (
              <button
                key={sym}
                onClick={() => handleQuickAdd(sym)}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-amber-950/50 border border-zinc-800 hover:border-amber-700/60 text-zinc-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <span>+ Track {sym}</span>
              </button>
            ))}
          </div>

          <div>
            <button
              id="btn-empty-goto-market"
              onClick={onNavigateMarket}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-sm"
            >
              Search All Stocks in Demo Market
            </button>
          </div>
        </div>
      )}

      {/* Tracked Stocks Items */}
      {data && data.items.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div className="text-xs text-zinc-400">
              Tracking <span className="text-zinc-200 font-semibold">{data.items.length} stocks</span> in your watchlist
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-400 flex items-center gap-1.5 cursor-pointer">
                <input
                  id="checkbox-filter-meaningful"
                  type="checkbox"
                  checked={filterMeaningfulOnly}
                  onChange={(e) => setFilterMeaningfulOnly(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>Show Meaningful Changes Only (≥3% or ≥1.5× volume)</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {itemsToShow.map((item) => (
              <div
                key={item.symbol}
                id={`smart-card-${item.symbol}`}
                className={`rounded-2xl bg-zinc-900 border transition p-5 space-y-4 ${
                  item.meaningful
                    ? "border-amber-700/50 shadow-md shadow-amber-950/20"
                    : "border-zinc-800 shadow-sm"
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-zinc-100">
                          {item.symbol}
                        </span>
                        <DataStatusBadge status={item.data_status} size="sm" />
                      </div>
                      <span className="text-xs text-zinc-400">{item.company_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Attention Level Badge */}
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${getAttentionBadgeClass(
                        item.attention_level
                      )}`}
                    >
                      {item.attention_level} ({item.attention_score}/100)
                    </span>

                    {/* Remove button */}
                    <button
                      id={`btn-remove-smart-${item.symbol}`}
                      onClick={(e) => handleRemoveStock(e, item.symbol)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-850 text-xs">
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Current Price</span>
                    <span className="font-bold text-zinc-100 text-sm">
                      {formatINR(item.current_price)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-zinc-500 block">Since Snapshot</span>
                    <span
                      className={`font-bold text-sm flex items-center gap-0.5 ${
                        item.change_percent >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {item.change_percent >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {item.change_percent >= 0 ? "+" : ""}
                      {item.change_percent}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-zinc-500 block">Current Volume</span>
                    <span className="font-semibold text-zinc-200">
                      {(item.current_volume / 1000000).toFixed(2)}M
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-zinc-500 block">Volume Ratio</span>
                    <span
                      className={`font-bold ${
                        item.volume_ratio >= 1.5 ? "text-amber-400" : "text-zinc-300"
                      }`}
                    >
                      {item.volume_ratio}× normal
                    </span>
                  </div>
                </div>

                {/* Factual Bullet Points: What Changed */}
                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                    What Changed Since Snapshot:
                  </span>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {item.reasons.map((r, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Beginner Explanation */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-zinc-200">Beginner Interpretation: </strong>
                    {item.beginner_explanation}
                  </div>
                </div>

                {/* Action button */}
                <div className="flex justify-end pt-1">
                  <button
                    id={`btn-trade-from-smart-${item.symbol}`}
                    onClick={() => onSelectStock(item.symbol)}
                    className="py-1.5 px-3.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Trade {item.symbol} in Demo Market</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
