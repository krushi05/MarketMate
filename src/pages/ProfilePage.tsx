import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Award,
  Database,
  Coins,
  CheckCircle2,
  HardDrive,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Save,
  BookOpen,
  Eye,
  FileText,
  Video,
  Youtube,
  RotateCcw,
  Edit2,
  Activity,
  Flame,
  Check
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { safeStorage } from "../services/storage";
import type { UserProfileResponse, StorageInfoResponse } from "../types";

const DEFAULT_TUTORIAL_VIDEO = "https://www.youtube.com/watch?v=p7HKvqRI_Bo";

interface Props {
  onNavigate: (tab: string) => void;
}

export const ProfilePage: React.FC<Props> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "tutorial" | "storage" | "guide">("profile");

  // Tutorial Video State
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState<string>(() => {
    return safeStorage.getItem("marketmate_profile_tutorial_url") || DEFAULT_TUTORIAL_VIDEO;
  });
  const [editingVideoUrl, setEditingVideoUrl] = useState(false);
  const [tempVideoInput, setTempVideoInput] = useState(tutorialVideoUrl);
  const [videoSaveNotice, setVideoSaveNotice] = useState<string | null>(null);

  // Editable Form State
  const [name, setName] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");
  const [riskProfile, setRiskProfile] = useState("Moderate Growth");

  const extractYouTubeEmbed = (urlOrId: string): string => {
    const clean = urlOrId.trim();
    if (clean.includes("youtube.com/embed/")) return clean;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = clean.match(regExp);
    const id = match && match[2].length === 11 ? match[2] : clean;
    return `https://www.youtube.com/embed/${id}?rel=0`;
  };

  const handleSaveTutorialVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempVideoInput.trim()) return;
    const cleanUrl = tempVideoInput.trim();
    setTutorialVideoUrl(cleanUrl);
    safeStorage.setItem("marketmate_profile_tutorial_url", cleanUrl);
    setEditingVideoUrl(false);
    setVideoSaveNotice("Tutorial video saved and persisted successfully!");
    setTimeout(() => setVideoSaveNotice(null), 3500);
  };

  const handleResetDefaultVideo = () => {
    setTutorialVideoUrl(DEFAULT_TUTORIAL_VIDEO);
    setTempVideoInput(DEFAULT_TUTORIAL_VIDEO);
    safeStorage.removeItem("marketmate_profile_tutorial_url");
    setEditingVideoUrl(false);
    setVideoSaveNotice("Restored default MarketMate starter tutorial video.");
    setTimeout(() => setVideoSaveNotice(null), 3500);
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [pData, sData] = await Promise.all([
        api.getProfile(),
        api.getStorageInfo().catch(() => null),
      ]);
      setProfile(pData);
      setName(pData.name || "");
      setExperienceLevel(pData.experience_level || "Beginner");
      setRiskProfile(pData.risk_profile || "Moderate Growth");
      if (sData) setStorageInfo(sData);
    } catch (err) {
      console.error("Failed to load profile data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateProfile({
        name,
        experience_level: experienceLevel,
        risk_profile: riskProfile,
      });
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      loadProfileData();
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading && !profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-zinc-400">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>Loading your profile and storage records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-0.5 shadow-lg shadow-purple-950/50">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-purple-300">
                  {(name || user?.email || "U")[0].toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
                  {name || user?.name || "MarketMate Trader"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-950 text-purple-300 border border-purple-800/60">
                  {experienceLevel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">{user?.email}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Coins className="w-3.5 h-3.5" />
                  {formatINR(profile?.virtual_balance || 100000)} Virtual Cash
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab("tutorial")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <Youtube className="w-4 h-4 text-rose-400" />
              <span>Tutorial Video</span>
            </button>
            <button
              onClick={() => setActiveSubTab("guide")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>How to Spend Cash</span>
            </button>
            <button
              onClick={() => setActiveSubTab("storage")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 text-xs font-semibold transition cursor-pointer"
            >
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Where Profiles Saved</span>
            </button>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("profile")}
          className={`pb-3 text-sm font-semibold transition cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
            activeSubTab === "profile"
              ? "border-purple-500 text-purple-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Details</span>
        </button>
        <button
          onClick={() => setActiveSubTab("tutorial")}
          className={`pb-3 text-sm font-semibold transition cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
            activeSubTab === "tutorial"
              ? "border-rose-500 text-rose-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Tutorial</span>
        </button>
        <button
          onClick={() => setActiveSubTab("guide")}
          className={`pb-3 text-sm font-semibold transition cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
            activeSubTab === "guide"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>How to Spend Virtual Cash</span>
        </button>
        <button
          onClick={() => setActiveSubTab("storage")}
          className={`pb-3 text-sm font-semibold transition cursor-pointer flex items-center gap-2 border-b-2 shrink-0 ${
            activeSubTab === "storage"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Saved Profiles & Storage Inspector</span>
        </button>
      </div>

      {/* TAB 1: PERSONAL DETAILS & PROFILE FORM */}
      {activeSubTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Edit Form */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Personal Details
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Customize your trading profile, investment style, and experience settings.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Profile updated and persisted successfully to <code>marketmate_data.json</code>!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Full Name / Display Nickname
                </label>
                <input
                  id="input-profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Krushi Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Account Email Address
                </label>
                <input
                  type="email"
                  value={profile?.email || user?.email || ""}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/50 border border-zinc-850 text-zinc-400 text-sm cursor-not-allowed"
                />
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Email is your unique identifier used for authentication.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Experience Level
                  </label>
                  <select
                    id="select-profile-experience"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-purple-500 transition cursor-pointer"
                  >
                    <option value="Beginner">Beginner (First Time in Markets)</option>
                    <option value="Learning Trader">Learning Trader (Basic Concepts)</option>
                    <option value="Intermediate">Intermediate (Practicing Strategies)</option>
                    <option value="Advanced">Advanced (Testing Algorithms)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Investment Risk Profile
                  </label>
                  <select
                    id="select-profile-risk"
                    value={riskProfile}
                    onChange={(e) => setRiskProfile(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-purple-500 transition cursor-pointer"
                  >
                    <option value="Conservative Capital Preservation">Conservative (Low Risk)</option>
                    <option value="Moderate Growth">Moderate Growth (Balanced 4-5 Stocks)</option>
                    <option value="High Momentum & Growth">High Momentum (Active Breakouts)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-save-profile"
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wide transition cursor-pointer shadow-md shadow-purple-900/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving to Database..." : "Save Profile Details"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Lab Performance Overview
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Completed Lessons</span>
                  <span className="text-sm font-bold text-indigo-400">
                    {profile?.stats.completed_lessons || 0} / {profile?.stats.total_lessons || 6}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Active Positions</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {profile?.stats.open_positions_count || 0} stocks
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Trades Executed</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {profile?.stats.total_trades_count || 0} orders
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Smart Watchlist</span>
                  <span className="text-sm font-bold text-amber-400">
                    {profile?.stats.watchlist_count || 0} tracked
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs text-zinc-400">
                <span>Total Portfolio Worth</span>
                <span className="font-bold text-zinc-200">
                  {formatINR(profile?.stats.total_portfolio_value || 100000)}
                </span>
              </div>
            </div>

            {/* Storage quick link */}
            <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <span>Local Persistence Verified</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Your trades, baseline snapshots, quiz progress, and personal details are safely stored in <span className="text-indigo-300 font-mono">marketmate_data.json</span>.
              </p>
              <button
                onClick={() => setActiveSubTab("storage")}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Inspect storage file details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: TUTORIAL — GETTING STARTED & APP GUIDE */}
      {activeSubTab === "tutorial" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main Video Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 text-xs font-semibold mb-2">
                  <Youtube className="w-3.5 h-3.5" />
                  <span>Interactive App Walkthrough</span>
                </div>
                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <span>Getting Started on MarketMate</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Watch this video to learn how each function is used, how to spot volume anomalies, and how your simulated data is maintained.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setEditingVideoUrl(!editingVideoUrl)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{editingVideoUrl ? "Close URL Editor" : "Change / Add Video"}</span>
                </button>
                {tutorialVideoUrl !== DEFAULT_TUTORIAL_VIDEO && (
                  <button
                    onClick={handleResetDefaultVideo}
                    className="p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-750 text-xs transition cursor-pointer"
                    title="Reset to default video"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {videoSaveNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{videoSaveNotice}</span>
              </div>
            )}

            {/* Video URL Edit Form / Space for Adding 1 Video */}
            {editingVideoUrl && (
              <form onSubmit={handleSaveTutorialVideo} className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-rose-400" />
                    <span>Paste Tutorial Video URL or YouTube ID</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">Supports YouTube links or direct 11-character video IDs</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={tempVideoInput}
                    onChange={(e) => setTempVideoInput(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=p7HKvqRI_Bo or p7HKvqRI_Bo"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Tutorial Video</span>
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  This custom video will be saved directly into your browser storage and will automatically display in this tutorial section.
                </p>
              </form>
            )}

            {/* 16:9 Video Player Container */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-xl relative">
              <iframe
                src={extractYouTubeEmbed(tutorialVideoUrl)}
                title="MarketMate Getting Started & Feature Guide Tutorial Video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          {/* Detailed Function-by-Function & Maintenance Guide */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>How Each Function is Used & Maintained</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Reference guide summarizing the core mechanisms, trading rules, and persistence architecture of MarketMate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Function 1 */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                  <Coins className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-200">1. Virtual Cash & Allocation</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Start with <strong className="text-zinc-200">₹1,00,000</strong> virtual balance. Buy orders debit cash and credit holdings; sell orders credit proceeds instantly. Practice risk limits: risk no more than 5%–10% per position.
                </p>
                <div className="text-[11px] text-emerald-400 font-medium pt-1">
                  Location: Portfolio & Market Buy/Sell modal
                </div>
              </div>

              {/* Function 2 */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-800/50 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-200">2. Smart Watchlist Radar</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  When you add any ticker, MarketMate freezes a baseline snapshot of current price and 30-day average volume. If real-time volume surges to <strong className="text-zinc-200">≥1.5× baseline</strong>, an institutional anomaly is flagged.
                </p>
                <div className="text-[11px] text-amber-400 font-medium pt-1">
                  Location: Smart Watchlist page
                </div>
              </div>

              {/* Function 3 */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-200">3. Live Discovery & P/E</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Filter Indian equities by Tech, Finance, Auto, and Energy. Inspect fundamental metrics including P/E ratios, 52-week high/low boundaries, and intraday percentage moves before buying.
                </p>
                <div className="text-[11px] text-purple-400 font-medium pt-1">
                  Location: Market & Stock Detail view
                </div>
              </div>

              {/* Function 4 */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-200">4. Interactive Learning Lab</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Complete 6 structured beginner lessons on diversification, P/E ratio, market orders, and stop-loss rules. Pass the interactive Quick Check quizzes to track your progress percentage.
                </p>
                <div className="text-[11px] text-indigo-400 font-medium pt-1">
                  Location: Learn tab & Lesson details
                </div>
              </div>

              {/* Function 5 */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-rose-950/80 border border-rose-800/50 flex items-center justify-center text-rose-400">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-200">5. Evaluator Spike Simulator</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Built for judges and evaluators: trigger artificial +5% or +15% price jumps and 2.5× volume spikes on any stock to demonstrate how the Smart Watchlist triggers instant institutional warnings.
                </p>
                <div className="text-[11px] text-rose-400 font-medium pt-1">
                  Location: "Simulate Market Spike" in navbar
                </div>
              </div>

              {/* Function 6 */}
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-zinc-200">6. Maintaining Local Data</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  All accounts, trades, holdings, and watchlists are stored in <code className="text-indigo-300 font-mono text-[11px]">marketmate_data.json</code>. You can inspect database size and registered profiles or reset virtual balance anytime.
                </p>
                <div className="text-[11px] text-blue-400 font-medium pt-1">
                  Location: Profile &gt; Storage Inspector
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOW TO SPEND INITIAL VIRTUAL CASH */}
      {activeSubTab === "guide" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <Coins className="w-6 h-6 text-emerald-400" />
                  How to Spend Your ₹1,00,000 Initial Virtual Cash
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Master capital allocation before risking a single rupee of real-world money.
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-950/70 border border-emerald-800/80 flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-zinc-400">Available:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {formatINR(profile?.virtual_balance || 100000)}
                </span>
              </div>
            </div>

            {/* Strategy Blueprint Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  1
                </div>
                <h3 className="text-sm font-bold text-zinc-200">The 20% Position Rule</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Never put all ₹1,00,000 into a single stock. Instead, buy <strong>₹15,000 to ₹20,000</strong> worth of 4 to 5 different companies (e.g. INFY, TCS, AAPL, NVDA).
                </p>
                <div className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/50">
                  Benefit: If one stock drops 10%, your overall portfolio only declines ~2%.
                </div>
              </div>

              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 font-bold text-sm">
                  2
                </div>
                <h3 className="text-sm font-bold text-zinc-200">Keep a 20% Cash Reserve</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Hold at least <strong>₹20,000 in uninvested cash</strong>. When market dips occur, having dry powder lets you accumulate great companies at discount prices.
                </p>
                <div className="text-[11px] text-indigo-400 bg-indigo-950/40 p-2 rounded-lg border border-indigo-900/50">
                  Benefit: Prevents forced selling and emotional panic during market corrections.
                </div>
              </div>

              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400 font-bold text-sm">
                  3
                </div>
                <h3 className="text-sm font-bold text-zinc-200">Check Smart Watchlist First</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Before buying, add target tickers to your <strong>Smart Watchlist</strong>. Check if the stock has unusual volume (≥1.5×) or is near baseline support.
                </p>
                <div className="text-[11px] text-amber-400 bg-amber-950/40 p-2 rounded-lg border border-amber-900/50">
                  Benefit: Eliminates guessing. You only trade when there is high conviction.
                </div>
              </div>
            </div>

            {/* Step-by-Step Practical Execution Walkthrough */}
            <div className="p-6 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Step-by-Step: How to Place Your First Practice Trade
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-850 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-400">STEP 1</span>
                  <h4 className="text-xs font-semibold text-zinc-200">Navigate to Demo Market</h4>
                  <p className="text-[11px] text-zinc-400">
                    Click the <strong>Demo Market</strong> tab in the navigation bar to see real-time quotes.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-850 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-400">STEP 2</span>
                  <h4 className="text-xs font-semibold text-zinc-200">Select a Ticker</h4>
                  <p className="text-[11px] text-zinc-400">
                    Search or click a featured stock like <strong>INFY</strong>, <strong>TCS</strong>, or <strong>AAPL</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-850 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-400">STEP 3</span>
                  <h4 className="text-xs font-semibold text-zinc-200">Choose Quantity</h4>
                  <p className="text-[11px] text-zinc-400">
                    Type 5 or 10 shares. Inspect the live Total Cost in ₹ before confirming.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-850 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-400">STEP 4</span>
                  <h4 className="text-xs font-semibold text-zinc-200">Execute Order</h4>
                  <p className="text-[11px] text-zinc-400">
                    Click <strong>Buy Shares</strong>. The trade executes atomically and deducts from your virtual cash.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => onNavigate("market")}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Go to Demo Market to Trade</span>
                </button>
                <button
                  onClick={() => onNavigate("smart-watchlist")}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition cursor-pointer flex items-center gap-2"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Check Smart Watchlist</span>
                </button>
                <button
                  onClick={() => onNavigate("learn")}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition cursor-pointer flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Review Lesson 1</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHERE PROFILES ARE SAVED & STORAGE INSPECTOR */}
      {activeSubTab === "storage" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
            <div className="border-b border-zinc-800 pb-5">
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <HardDrive className="w-6 h-6 text-indigo-400" />
                Profile & State Storage Location
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Here is full transparency on where your profiles, transactions, and snapshots are stored on the server filesystem.
              </p>
            </div>

            {/* Storage File Badge Callout */}
            <div className="p-5 rounded-xl bg-zinc-950 border border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Primary Storage File
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-mono">
                  ACTIVE & PERSISTED
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-200 break-all select-all">
                {storageInfo?.storage_file || "/workspace/marketmate_data.json"}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                MarketMate persists all users, hashed passwords, atomic trade books, and deterministic snapshots into this JSON store. Every transaction and profile edit is synchronously written so state survives applet reloads and server restarts.
              </p>
            </div>

            {/* Storage Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-xs text-zinc-400 block mb-1">File Size</span>
                <span className="text-base font-bold text-zinc-200">
                  {storageInfo ? (storageInfo.storage_size_bytes / 1024).toFixed(1) : "0"} KB
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-xs text-zinc-400 block mb-1">Total Profiles</span>
                <span className="text-base font-bold text-purple-400">
                  {storageInfo?.total_users || 1} registered
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-xs text-zinc-400 block mb-1">Saved Snapshots</span>
                <span className="text-base font-bold text-amber-400">
                  {storageInfo?.total_snapshots || 0} recorded
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-xs text-zinc-400 block mb-1">Trade Records</span>
                <span className="text-base font-bold text-cyan-400">
                  {storageInfo?.total_transactions || 0} executed
                </span>
              </div>
            </div>

            {/* Profiles Saved on this Instance */}
            {storageInfo?.profiles && storageInfo.profiles.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  All Registered Profiles in Database ({storageInfo.profiles.length})
                </h3>

                <div className="overflow-x-auto rounded-xl border border-zinc-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 font-semibold">
                      <tr>
                        <th className="p-3">User ID</th>
                        <th className="p-3">Profile Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Experience</th>
                        <th className="p-3">Balance</th>
                        <th className="p-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 bg-zinc-900/60">
                      {storageInfo.profiles.map((p) => {
                        const isCurrent = p.id === user?.id;
                        return (
                          <tr key={p.id} className={isCurrent ? "bg-purple-950/20" : ""}>
                            <td className="p-3 font-mono text-zinc-400">#{p.id}</td>
                            <td className="p-3 font-semibold text-zinc-200">
                              {p.name || "Default Trader"}
                              {isCurrent && (
                                <span className="ml-2 px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] border border-purple-800/50">
                                  You
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-zinc-300">{p.email}</td>
                            <td className="p-3 text-zinc-400">{p.experience_level || "Beginner"}</td>
                            <td className="p-3 font-semibold text-emerald-400">
                              {formatINR(p.virtual_balance)}
                            </td>
                            <td className="p-3 text-zinc-400">
                              {new Date(p.created_at).toLocaleDateString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
