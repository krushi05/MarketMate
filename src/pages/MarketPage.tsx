import React, { useState, useEffect } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Plus,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye
} from "lucide-react";
import { api } from "../services/api";
import { DataStatusBadge } from "../components/DataStatusBadge";
import type { StockSearchResult, WatchlistItem } from "../types";

interface Props {
  onSelectStock: (symbol: string) => void;
  onOpenSimulate: () => void;
  onNavigateWatchlist?: () => void;
}

export const MarketPage: React.FC<Props> = ({ onSelectStock, onOpenSimulate, onNavigateWatchlist }) => {
  const [query, setQuery] = useState("");
  const [stocks, setStocks] = useState<StockSearchResult[]>([]);
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [addingSymbol, setAddingSymbol] = useState<string | null>(null);
  const [watchlistAlert, setWatchlistAlert] = useState<{ symbol: string; text: string } | null>(null);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const loadData = async (searchQuery: string) => {
    setLoading(true);
    try {
      const [searchResults, watchlist] = await Promise.all([
        api.searchMarket(searchQuery),
        api.getWatchlist().catch(() => [] as WatchlistItem[]),
      ]);
      setStocks(searchResults);
      setWatchlistSymbols(new Set(watchlist.map((w) => w.symbol)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData("");
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(query);
  };

  const handleToggleWatchlist = async (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setAddingSymbol(symbol);
    try {
      if (watchlistSymbols.has(symbol)) {
        await api.removeFromWatchlist(symbol);
        setWatchlistSymbols((prev) => {
          const next = new Set(prev);
          next.delete(symbol);
          return next;
        });
        setWatchlistAlert({
          symbol,
          text: `Removed ${symbol} from watchlist.`,
        });
        setTimeout(() => setWatchlistAlert(null), 3500);
      } else {
        await api.addToWatchlist(symbol);
        setWatchlistSymbols((prev) => new Set(prev).add(symbol));
        setWatchlistAlert({
          symbol,
          text: `Added ${symbol} to Smart Watchlist! Baseline snapshot captured.`,
        });
        setTimeout(() => setWatchlistAlert(null), 4500);
      }
    } catch (err: any) {
      setWatchlistAlert({
        symbol,
        text: err.message || "Failed to update watchlist",
      });
      setTimeout(() => setWatchlistAlert(null), 4000);
    } finally {
      setAddingSymbol(null);
    }
  };

  return (
    <div className="space-y-6 py-6 relative">
      {/* Floating Smart Watchlist Notification Banner */}
      {watchlistAlert && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900/95 border border-amber-500/80 shadow-2xl shadow-black/80 flex items-center gap-3.5 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-100">{watchlistAlert.text}</p>
            <p className="text-[11px] text-zinc-400">Track volume ratios and percentage deviations in real time.</p>
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
      {/* Header & Search */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Demo Stock Market
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Search real market tickers or discover curated demo stocks. Practice trading with ₹1,00,000 virtual balance.
            </p>
          </div>
          <button
            id="btn-market-simulate"
            onClick={onOpenSimulate}
            className="self-start sm:self-auto py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/40 text-purple-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Simulate Market Spike</span>
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-market-search"
            type="text"
            placeholder="Search by ticker (NVDA, AAPL, RELIANCE) or company name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // live search on typing with slight debounce
            }}
            className="w-full pl-10 pr-24 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            id="btn-market-search-submit"
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Quick Ticker Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-zinc-500 font-medium">Quick Discovery:</span>
          {["NVDA", "AAPL", "MSFT", "TSLA", "RELIANCE.NS", "TCS.NS"].map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => {
                setQuery(sym);
                loadData(sym);
              }}
              className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition cursor-pointer"
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Resilience / Feed Guarantee Banner */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-850 p-3.5 text-xs text-zinc-400 flex items-center gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <p>
          <span className="text-zinc-300 font-semibold">Reliable Fallback Feed: </span>
          Quotes connect to live feeds and seamlessly transition to cached historical snapshots if market APIs are closed or rate-limited. Practice is always uninterrupted.
        </p>
      </div>

      {/* Stocks List / Table */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-sm overflow-hidden">
        <h2 className="text-sm font-semibold text-zinc-200 mb-4">
          {query ? `Search Results for "${query}"` : "Discover Featured Stocks"}
        </h2>

        {loading ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Fetching market data...
          </div>
        ) : stocks.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            No stocks matched your query. Try searching for "NVDA", "AAPL", "MSFT", or "TSLA".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="pb-3 font-medium">Symbol & Name</th>
                  <th className="pb-3 font-medium text-right">Price</th>
                  <th className="pb-3 font-medium text-right">Change</th>
                  <th className="pb-3 font-medium text-center">Feed Status</th>
                  <th className="pb-3 font-medium text-center">Watchlist</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {stocks.map((stock) => {
                  const isInWatchlist = watchlistSymbols.has(stock.symbol);
                  return (
                    <tr
                      key={stock.symbol}
                      id={`market-row-${stock.symbol}`}
                      onClick={() => onSelectStock(stock.symbol)}
                      className="hover:bg-zinc-850/50 transition cursor-pointer"
                    >
                      <td className="py-3.5">
                        <div className="font-bold text-zinc-100 text-sm">{stock.symbol}</div>
                        <div className="text-[11px] text-zinc-400">{stock.company_name}</div>
                      </td>
                      <td className="py-3.5 text-right font-semibold text-zinc-200 text-sm">
                        {formatINR(stock.current_price)}
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
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
                      <td className="py-3.5 text-center">
                        <button
                          id={`btn-watchlist-${stock.symbol}`}
                          onClick={(e) => handleToggleWatchlist(e, stock.symbol)}
                          disabled={addingSymbol === stock.symbol}
                          className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                            isInWatchlist
                              ? "bg-amber-950/70 text-amber-300 border border-amber-700/50 hover:bg-rose-950/70 hover:text-rose-300"
                              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                          }`}
                          title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                          {isInWatchlist ? (
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          id={`btn-inspect-${stock.symbol}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStock(stock.symbol);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Trade / Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
