import React, { useState } from "react";
import { TrendingUp, Lock, Mail, User as UserIcon, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isRegister) {
        if (!name.trim()) {
          throw new Error("Please enter your name.");
        }
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseDemoAccount = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login("demo@marketmate.local", "demopassword123");
    } catch {
      // If demo account wasn't seeded yet or password changed, register it
      try {
        await register("Demo Beginner", "demo@marketmate.local", "demopassword123");
      } catch (err: any) {
        setError(err.message || "Failed to log into demo account.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 shadow-lg mb-2">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            MarketMate
          </h1>
          <p className="text-sm text-zinc-400 font-medium">
            Learn the market before you risk your money.
          </p>
          <div className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
            ₹1,00,000 Virtual Balance • 6 Lessons • Smart Watchlist
          </div>
        </div>

        {/* 1-Click Demo Login for Evaluators */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-emerald-950/40 border border-zinc-700/80 p-4 text-center space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Hackathon Instant Evaluation</span>
          </div>
          <p className="text-xs text-zinc-400">
            Jump in immediately with our pre-configured demo account and ₹1,00,000 virtual balance.
          </p>
          <button
            id="btn-quick-demo-login"
            type="button"
            onClick={handleUseDemoAccount}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>1-Click Demo Login (demo@marketmate.local)</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 shadow-xl space-y-5">
          <div className="flex border-b border-zinc-800 pb-3">
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`flex-1 text-center py-2 text-sm font-semibold border-b-2 transition cursor-pointer ${
                !isRegister
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-auth-register"
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`flex-1 text-center py-2 text-sm font-semibold border-b-2 transition cursor-pointer ${
                isRegister
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div
              id="auth-error-alert"
              className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs leading-relaxed"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="input-auth-name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-auth-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-auth-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
            >
              <span>{submitting ? "Please wait..." : isRegister ? "Create Account & Start Learning" : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
