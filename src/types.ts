export interface User {
  id: number;
  name: string;
  email: string;
  virtual_balance: number;
  created_at: string;
  last_checked_at?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Lesson {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  example: string;
  why_matters: string;
  key_takeaway: string;
  quiz_question: string;
  quiz_options: string[];
  order: number;
  completed: boolean;
  quiz_correct: boolean;
}

export interface LessonCompleteResult {
  completed: boolean;
  quiz_correct: boolean;
  correct_answer: number;
  explanation: string;
}

export interface LessonProgressSummary {
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
}

export interface StockQuote {
  symbol: string;
  company_name: string;
  current_price: number;
  previous_close: number;
  change: number;
  change_percent: number;
  volume: number;
  average_volume: number;
  volume_ratio: number;
  data_status: "live" | "fallback" | "simulated";
  timestamp: string;
}

export interface StockHistoryPoint {
  date: string;
  price: number;
  volume: number;
}

export interface StockSearchResult {
  symbol: string;
  company_name: string;
  current_price: number;
  change_percent: number;
  data_status: "live" | "fallback" | "simulated";
}

export interface WatchlistItem {
  id: number;
  symbol: string;
  company_name: string;
  current_price: number;
  change_percent: number;
  volume: number;
  average_volume: number;
  volume_ratio: number;
  data_status: "live" | "fallback" | "simulated";
  created_at: string;
}

export interface SmartChangeItem {
  symbol: string;
  company_name: string;
  current_price: number;
  previous_price: number;
  change_percent: number;
  current_volume: number;
  average_volume: number;
  volume_ratio: number;
  attention_score: number;
  attention_level: "NORMAL" | "WORTH WATCHING" | "IMPORTANT" | "HIGH ATTENTION";
  meaningful: boolean;
  reasons: string[];
  beginner_explanation: string;
  timestamp: string;
  data_status: string;
}

export interface SmartWatchlistResponse {
  tracking_started: boolean;
  message: string;
  items: SmartChangeItem[];
  captured_at: string;
}

export interface PortfolioPosition {
  id: number;
  symbol: string;
  company_name: string;
  quantity: number;
  average_buy_price: number;
  current_price: number;
  current_value: number;
  invested_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  data_status: string;
}

export interface Transaction {
  id: number;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  total: number;
  created_at: string;
}

export interface PortfolioSummary {
  virtual_balance: number;
  invested_value: number;
  total_portfolio_value: number;
  total_unrealized_pnl: number;
  total_unrealized_pnl_percent: number;
  positions: PortfolioPosition[];
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  virtual_balance: number;
  experience_level: string;
  risk_profile: string;
  created_at: string;
  stats: {
    completed_lessons: number;
    total_lessons: number;
    open_positions_count: number;
    total_trades_count: number;
    watchlist_count: number;
    invested_value: number;
    total_portfolio_value: number;
  };
  storage: {
    location: string;
    relative_path: string;
    size_bytes: number;
    total_saved_profiles: number;
  };
}

export interface SavedProfileSummary {
  id: number;
  email: string;
  name: string;
  virtual_balance: number;
  experience_level: string;
  created_at: string;
}

export interface StorageInfoResponse {
  storage_file: string;
  relative_path: string;
  storage_size_bytes: number;
  total_users: number;
  total_watchlist_items: number;
  total_snapshots: number;
  total_positions: number;
  total_transactions: number;
  total_lesson_progress: number;
  last_saved_at: string;
  profiles: SavedProfileSummary[];
  description: string;
}

export interface GeminiScene {
  timestamp: string;
  scene_title: string;
  visual_cue: string;
  narration: string;
  key_points: string[];
}

export interface GeminiFeatureGuide {
  feature_name: string;
  how_it_works: string;
  beginner_tip: string;
}

export interface GeminiTutorialResponse {
  title: string;
  duration: string;
  hook: string;
  scenes: GeminiScene[];
  lab_feature_guide: GeminiFeatureGuide[];
  source?: string;
}
