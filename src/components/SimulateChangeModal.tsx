import React, { useState } from "react";
import { Sparkles, RefreshCw, X, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSimulationApplied: () => void;
}

export const SimulateChangeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSimulationApplied,
}) => {
  const [symbol, setSymbol] = useState("NVDA");
  const [priceChange, setPriceChange] = useState(4.2);
  const [volumeRatio, setVolumeRatio] = useState(1.8);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await api.simulateChange(symbol, priceChange, volumeRatio);
      setSuccessMsg(`Simulated ${symbol} moving +${priceChange}% with ${volumeRatio}× volume!`);
      onSimulationApplied();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await api.resetSimulation();
      setSuccessMsg("Reset all simulations back to baseline market data.");
      onSimulationApplied();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="modal-simulate-market-change"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-6 text-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-zinc-100">Simulate Market Change</h3>
              <p className="text-xs text-zinc-400">Hackathon Demo Tool for Judges</p>
            </div>
          </div>
          <button
            id="btn-close-simulate-modal"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-xl bg-purple-950/40 border border-purple-800/40 p-3 mb-5 text-xs text-purple-200">
          <p className="font-medium text-purple-300 mb-1">Judges Demonstration Flow:</p>
          <p>
            Markets move slowly in real time. Use this tool to instantly simulate a realistic price and volume spike so the Smart Watchlist can demonstrate how it detects meaningful changes.
          </p>
          <p className="mt-1 font-semibold text-purple-400">
            Demo simulation — not real market data.
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-700/50 text-red-300 text-xs mb-4">
            <X className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Target Stock</label>
            <select
              id="select-simulate-symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500"
            >
              <option value="NVDA">NVDA (NVIDIA Corporation)</option>
              <option value="AAPL">AAPL (Apple Inc.)</option>
              <option value="MSFT">MSFT (Microsoft Corporation)</option>
              <option value="TSLA">TSLA (Tesla, Inc.)</option>
              <option value="RELIANCE.NS">RELIANCE.NS (Reliance Industries)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Simulated Price Movement: <span className="text-purple-400 font-bold">+{priceChange}%</span>
            </label>
            <input
              id="slider-simulate-price"
              type="range"
              min="1.0"
              max="12.0"
              step="0.2"
              value={priceChange}
              onChange={(e) => setPriceChange(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5">
              <span>+1.0% (Minor)</span>
              <span className="text-purple-400 font-semibold">+3.0%+ (Meaningful)</span>
              <span>+12.0% (Extreme)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Simulated Volume Surge: <span className="text-purple-400 font-bold">{volumeRatio}× normal</span>
            </label>
            <input
              id="slider-simulate-volume"
              type="range"
              min="0.8"
              max="3.0"
              step="0.1"
              value={volumeRatio}
              onChange={(e) => setVolumeRatio(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-0.5">
              <span>0.8× (Low)</span>
              <span className="text-purple-400 font-semibold">1.5×+ (Unusual Surge)</span>
              <span>3.0× (Massive)</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            id="btn-trigger-simulate"
            onClick={handleSimulate}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Simulating..." : "Simulate Change"}
          </button>
          <button
            id="btn-reset-simulate"
            onClick={handleReset}
            disabled={loading}
            className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium border border-zinc-700 transition disabled:opacity-50 flex items-center gap-1.5"
            title="Revert back to normal baseline market quotes"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
