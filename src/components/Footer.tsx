import React from "react";
import { ShieldAlert, BookOpen, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8 text-zinc-400">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Pitch and Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-between border-b border-zinc-850 pb-6">
          <div>
            <h4 className="text-sm font-semibold text-zinc-200">
              MarketMate — Learn the market before you risk your money.
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              "We don't tell beginners what to buy. We teach them how to understand what they're seeing."
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              6 Guided Beginner Lessons
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Deterministic Change Engine
            </span>
          </div>
        </div>

        {/* Mandatory Educational Disclaimer */}
        <div className="flex items-start gap-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70 p-3.5 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-medium text-zinc-200">
              Educational Simulator Disclaimer
            </p>
            <p className="text-zinc-400 leading-relaxed">
              MarketMate is strictly an educational demo and simulation platform. It does not provide financial advice, investment recommendations, or execute real-money trades. All transactions utilize virtual currency for educational purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
