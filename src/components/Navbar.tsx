import React from "react";
import { TrendingUp, BookOpen, Search, Eye, Wallet, LogOut, Sparkles, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSimulate: () => void;
  lessonCount?: { completed: number; total: number };
}

export const Navbar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  onOpenSimulate,
  lessonCount,
}) => {
  const { user, logout } = useAuth();

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-6">
            <button
              id="nav-brand-logo"
              onClick={() => onSelectTab("dashboard")}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 shadow-md group-hover:scale-105 transition">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-zinc-100">MarketMate</span>
                </div>
                <p className="text-[11px] text-zinc-400 hidden sm:block">Learn before you risk</p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                id="nav-link-dashboard"
                onClick={() => onSelectTab("dashboard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  currentTab === "dashboard"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                Dashboard
              </button>

              <button
                id="nav-link-learn"
                onClick={() => onSelectTab("learn")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  currentTab === "learn"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Learn</span>
                {lessonCount && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-700 text-zinc-300">
                    {lessonCount.completed}/{lessonCount.total}
                  </span>
                )}
              </button>

              <button
                id="nav-link-market"
                onClick={() => onSelectTab("market")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  currentTab === "market"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span>Demo Market</span>
              </button>

              <button
                id="nav-link-smart-watchlist"
                onClick={() => onSelectTab("smart-watchlist")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  currentTab === "smart-watchlist"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Smart Watchlist</span>
              </button>

              <button
                id="nav-link-portfolio"
                onClick={() => onSelectTab("portfolio")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  currentTab === "portfolio"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                <span>Portfolio</span>
              </button>

              <button
                id="nav-link-profile"
                onClick={() => onSelectTab("profile")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  currentTab === "profile"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Profile</span>
              </button>
            </nav>
          </div>

          {/* Right section: Balance & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Hackathon Simulation Trigger Button */}
            <button
              id="nav-btn-simulate-demo"
              onClick={onOpenSimulate}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-700/50 text-xs font-medium transition cursor-pointer shadow-xs"
              title="Simulate Market Movement (Judges Demo)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Simulate Change</span>
              <span className="sm:hidden">Simulate</span>
            </button>

            {/* Virtual Balance Pill */}
            {user && (
              <div
                id="nav-user-virtual-balance"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs"
                title="Your virtual cash balance for risk-free practice"
              >
                <span className="text-zinc-400 font-medium">Virtual Cash:</span>
                <span className="font-semibold text-emerald-400">
                  {formatINR(user.virtual_balance)}
                </span>
              </div>
            )}

            {/* User Greeting & Logout */}
            {user && (
              <div className="flex items-center gap-1.5 pl-1">
                <button
                  id="nav-profile-btn"
                  onClick={() => onSelectTab("profile")}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition cursor-pointer text-xs"
                  title="View Profile & Saved State"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-900/70 border border-purple-600/50 flex items-center justify-center text-[10px] font-bold text-purple-200">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                  <span className="font-medium hidden lg:inline truncate max-w-[110px]">
                    {user.name || user.email.split("@")[0]}
                  </span>
                </button>
                <button
                  id="nav-btn-logout"
                  onClick={logout}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-zinc-850 text-xs">
          <button
            onClick={() => onSelectTab("dashboard")}
            className={`px-2 py-1 rounded font-medium ${
              currentTab === "dashboard" ? "text-emerald-400 bg-zinc-900" : "text-zinc-400"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab("learn")}
            className={`px-2 py-1 rounded font-medium ${
              currentTab === "learn" ? "text-indigo-400 bg-zinc-900" : "text-zinc-400"
            }`}
          >
            Learn
          </button>
          <button
            onClick={() => onSelectTab("market")}
            className={`px-2 py-1 rounded font-medium ${
              currentTab === "market" ? "text-emerald-400 bg-zinc-900" : "text-zinc-400"
            }`}
          >
            Market
          </button>
          <button
            onClick={() => onSelectTab("smart-watchlist")}
            className={`px-2 py-1 rounded font-medium ${
              currentTab === "smart-watchlist" ? "text-amber-400 bg-zinc-900" : "text-zinc-400"
            }`}
          >
            Watchlist
          </button>
          <button
            onClick={() => onSelectTab("portfolio")}
            className={`px-2 py-1 rounded font-medium ${
              currentTab === "portfolio" ? "text-cyan-400 bg-zinc-900" : "text-zinc-400"
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => onSelectTab("profile")}
            className={`px-2 py-1 rounded font-medium ${
              currentTab === "profile" ? "text-purple-400 bg-zinc-900" : "text-zinc-400"
            }`}
          >
            Profile
          </button>
        </div>
      </div>
    </header>
  );
};
