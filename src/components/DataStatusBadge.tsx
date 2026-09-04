import React from "react";
import { Radio, AlertTriangle, Sparkles } from "lucide-react";

interface Props {
  status: "live" | "fallback" | "simulated" | string;
  size?: "sm" | "md";
}

export const DataStatusBadge: React.FC<Props> = ({ status, size = "md" }) => {
  if (status === "simulated") {
    return (
      <span
        id="badge-status-simulated"
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/50 ${
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
        }`}
        title="Demo simulation — not real market data."
      >
        <Sparkles className="w-3 h-3 text-purple-400" />
        <span>Demo simulation</span>
      </span>
    );
  }

  if (status === "live") {
    return (
      <span
        id="badge-status-live"
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 ${
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
        }`}
        title="Real-time or delayed live market feed."
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Live market data</span>
      </span>
    );
  }

  // Fallback status
  return (
    <span
      id="badge-status-fallback"
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-900/40 text-amber-300 border border-amber-700/50 ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      }`}
      title="Live feed unreachable. Showing latest available verified demo snapshot."
    >
      <AlertTriangle className="w-3 h-3 text-amber-400" />
      <span>Demo data — latest available fallback</span>
    </span>
  );
};
