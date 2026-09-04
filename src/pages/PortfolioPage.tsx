import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { api } from "../services/api";
import { DataStatusBadge } from "../components/DataStatusBadge";
import type { PortfolioSummary, Transaction } from "../types";

interface Props {
  onSelectStock: (symbol: string) => void;
  onNavigateMarket: () => void;
}

export const PortfolioPage: React.FC<Props> = ({ onSelectStock, onNavigateMarket }) => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  useEffect(() => {
    Promise.all([api.getPortfolio(), api.getTransactions()])
      .then(([port, txns]) => {
        setPortfolio(port);
        setTransactions(txns);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-zinc-400 text-sm">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Calculating portfolio positions and profit & loss...
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50 text-xs font-semibold mb-2">
              <Wallet className="w-3.5 h-3.5" />
              <span>Virtual Portfolio • Risk-Free Simulator</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Your Demo Portfolio
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Practice managing real stock positions with atomic transaction safety.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-zinc-400 block font-medium">Total Portfolio Value</span>
            <span className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              {formatINR(portfolio?.total_portfolio_value ?? 100000)}
            </span>
          </div>
        </div>

        {/* 4-Stat Metric Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-zinc-800/80 text-xs">
          <div>
            <span className="text-[11px] text-zinc-500 block">Available Cash</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">
              {formatINR(portfolio?.virtual_balance ?? 100000)}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 block">Invested Capital</span>
            <span className="text-base font-bold text-zinc-200 mt-0.5 block">
              {formatINR(portfolio?.invested_value ?? 0)}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 block">Unrealized P&L</span>
            <span
              className={`text-base font-bold flex items-center gap-0.5 mt-0.5 ${
                (portfolio?.total_unrealized_pnl ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {(portfolio?.total_unrealized_pnl ?? 0) >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {formatINR(portfolio?.total_unrealized_pnl ?? 0)}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-500 block">Return on Investment</span>
            <span
              className={`text-base font-bold mt-0.5 block ${
                (portfolio?.total_unrealized_pnl_percent ?? 0) >= 0
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {(portfolio?.total_unrealized_pnl_percent ?? 0) >= 0 ? "+" : ""}
              {portfolio?.total_unrealized_pnl_percent ?? 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">
            Open Positions ({portfolio?.positions.length ?? 0})
          </h2>
          <button
            id="btn-portfolio-buy-more"
            onClick={onNavigateMarket}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer"
          >
            <span>+ Buy New Stock</span>
          </button>
        </div>

        {portfolio?.positions.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <p className="text-xs text-zinc-400">
              You don't own any stock positions yet. Visit the Demo Market to place your first risk-free trade!
            </p>
            <button
              id="btn-goto-market-first-trade"
              onClick={onNavigateMarket}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-xs"
            >
              Explore Demo Market
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium text-right">Shares</th>
                  <th className="pb-3 font-medium text-right">Avg Price</th>
                  <th className="pb-3 font-medium text-right">Current Price</th>
                  <th className="pb-3 font-medium text-right">Market Value</th>
                  <th className="pb-3 font-medium text-right">Unrealized P&L</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {portfolio?.positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-zinc-850/40 transition">
                    <td className="py-3.5">
                      <div className="font-bold text-zinc-100">{pos.symbol}</div>
                      <div className="text-[11px] text-zinc-400">{pos.company_name}</div>
                    </td>
                    <td className="py-3.5 text-right font-medium text-zinc-200">
                      {pos.quantity}
                    </td>
                    <td className="py-3.5 text-right text-zinc-300">
                      {formatINR(pos.average_buy_price)}
                    </td>
                    <td className="py-3.5 text-right font-semibold text-zinc-100">
                      {formatINR(pos.current_price)}
                    </td>
                    <td className="py-3.5 text-right font-semibold text-zinc-100">
                      {formatINR(pos.current_value)}
                    </td>
                    <td className="py-3.5 text-right">
                      <span
                        className={`font-semibold flex items-center justify-end gap-0.5 ${
                          pos.unrealized_pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {pos.unrealized_pnl >= 0 ? "+" : ""}
                        {formatINR(pos.unrealized_pnl)} ({pos.unrealized_pnl_percent}%)
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        id={`btn-manage-pos-${pos.symbol}`}
                        onClick={() => onSelectStock(pos.symbol)}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Trade</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction History Log */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span>Transaction Ledger ({transactions.length})</span>
          </h2>
          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Atomic ACID Operations
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No transactions executed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-2.5">Date & Time</th>
                  <th className="pb-2.5">Action</th>
                  <th className="pb-2.5">Symbol</th>
                  <th className="pb-2.5 text-right">Shares</th>
                  <th className="pb-2.5 text-right">Executed Price</th>
                  <th className="pb-2.5 text-right">Total Transacted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-850/30 transition">
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
                    <td className="py-2.5 font-bold text-zinc-200">{tx.symbol}</td>
                    <td className="py-2.5 text-right font-medium text-zinc-200">
                      {tx.quantity}
                    </td>
                    <td className="py-2.5 text-right text-zinc-300">
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
        )}
      </div>
    </div>
  );
};
