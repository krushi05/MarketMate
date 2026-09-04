import type {
  User,
  AuthResponse,
  Lesson,
  LessonCompleteResult,
  LessonProgressSummary,
  StockQuote,
  StockHistoryPoint,
  StockSearchResult,
  WatchlistItem,
  SmartWatchlistResponse,
  PortfolioSummary,
  Transaction,
  UserProfileResponse,
  StorageInfoResponse,
  GeminiTutorialResponse,
} from "../types";

import { safeStorage } from "./storage";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function getToken(): string | null {
  return safeStorage.getItem("marketmate_token");
}

export function setToken(token: string) {
  safeStorage.setItem("marketmate_token", token);
}

export function removeToken() {
  safeStorage.removeItem("marketmate_token");
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.error || errorJson.message || errorDetail;
    } catch {
      errorDetail = `Request failed with status ${response.status}`;
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (email: string, password: string): Promise<AuthResponse> =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string): Promise<AuthResponse> =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  getMe: (): Promise<User> => apiFetch<User>("/auth/me"),

  // Lessons
  getLessons: (): Promise<Lesson[]> => apiFetch<Lesson[]>("/lessons"),

  getLesson: (id: number): Promise<Lesson> => apiFetch<Lesson>(`/lessons/${id}`),

  completeLesson: (id: number, selected_option: number): Promise<LessonCompleteResult> =>
    apiFetch<LessonCompleteResult>(`/lessons/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({ selected_option }),
    }),

  getLessonProgress: (): Promise<LessonProgressSummary> =>
    apiFetch<LessonProgressSummary>("/lessons/progress"),

  // Market
  searchMarket: (query: string): Promise<StockSearchResult[]> =>
    apiFetch<StockSearchResult[]>(`/market/search?q=${encodeURIComponent(query)}`),

  getQuote: (symbol: string): Promise<StockQuote> =>
    apiFetch<StockQuote>(`/market/quote/${symbol}`),

  getHistory: (symbol: string): Promise<StockHistoryPoint[]> =>
    apiFetch<StockHistoryPoint[]>(`/market/history/${symbol}`),

  // Watchlist & Smart Watchlist
  getWatchlist: (): Promise<WatchlistItem[]> => apiFetch<WatchlistItem[]>("/watchlist"),

  addToWatchlist: (symbol: string): Promise<WatchlistItem> =>
    apiFetch<WatchlistItem>("/watchlist", {
      method: "POST",
      body: JSON.stringify({ symbol }),
    }),

  removeFromWatchlist: (symbol: string): Promise<{ message: string }> =>
    apiFetch<{ message: string }>(`/watchlist/${symbol}`, {
      method: "DELETE",
    }),

  getSmartWatchlistChanges: (): Promise<SmartWatchlistResponse> =>
    apiFetch<SmartWatchlistResponse>("/watchlist/changes"),

  captureSnapshot: (): Promise<{ message: string; captured_at: string }> =>
    apiFetch<{ message: string; captured_at: string }>("/watchlist/snapshot", {
      method: "POST",
    }),

  // Portfolio
  getPortfolio: (): Promise<PortfolioSummary> => apiFetch<PortfolioSummary>("/portfolio"),

  getTransactions: (): Promise<Transaction[]> => apiFetch<Transaction[]>("/portfolio/transactions"),

  buyStock: (symbol: string, quantity: number): Promise<{ message: string; virtual_balance: number; transaction_id: number }> =>
    apiFetch("/portfolio/buy", {
      method: "POST",
      body: JSON.stringify({ symbol, quantity }),
    }),

  sellStock: (symbol: string, quantity: number): Promise<{ message: string; virtual_balance: number; transaction_id: number }> =>
    apiFetch("/portfolio/sell", {
      method: "POST",
      body: JSON.stringify({ symbol, quantity }),
    }),

  // Demo simulation
  simulateChange: (symbol: string = "NVDA", price_change_pct: number = 4.2, volume_ratio: number = 1.8): Promise<any> =>
    apiFetch("/demo/simulate-change", {
      method: "POST",
      body: JSON.stringify({ symbol, price_change_pct, volume_ratio }),
    }),

  resetSimulation: (): Promise<{ message: string }> =>
    apiFetch<{ message: string }>("/demo/reset-simulation", {
      method: "POST",
    }),

  // User Profile & Storage Inspector
  getProfile: (): Promise<UserProfileResponse> => apiFetch<UserProfileResponse>("/profile"),

  updateProfile: (data: { name?: string; experience_level?: string; risk_profile?: string }): Promise<{ success: boolean; user: any }> =>
    apiFetch<{ success: boolean; user: any }>("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getStorageInfo: (): Promise<StorageInfoResponse> => apiFetch<StorageInfoResponse>("/profile/storage-info"),

  getAllProfiles: (): Promise<{ profiles: any[]; storage_file: string; total_profiles: number }> =>
    apiFetch<{ profiles: any[]; storage_file: string; total_profiles: number }>("/profiles"),

  // Gemini AI Lab Tutorial Generator
  generateGeminiTutorial: (lessonId?: number, customPrompt?: string, topic?: string): Promise<GeminiTutorialResponse> =>
    apiFetch<GeminiTutorialResponse>("/gemini/generate-tutorial", {
      method: "POST",
      body: JSON.stringify({ lessonId, customPrompt, topic }),
    }),
};
