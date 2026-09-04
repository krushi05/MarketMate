import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export interface UserRecord {
  id: number;
  email: string;
  hashed_password: string;
  virtual_balance: number;
  created_at: string;
  name?: string;
  experience_level?: string;
  risk_profile?: string;
}

export interface WatchlistRecord {
  id: number;
  user_id: number;
  symbol: string;
  company_name: string;
  created_at: string;
}

export interface SnapshotRecord {
  id: number;
  user_id: number;
  symbol: string;
  price: number;
  volume: number;
  captured_at: string;
}

export interface PositionRecord {
  id: number;
  user_id: number;
  symbol: string;
  quantity: number;
  average_buy_price: number;
  updated_at: string;
}

export interface TransactionRecord {
  id: number;
  user_id: number;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  total: number;
  created_at: string;
}

export interface LessonProgressRecord {
  id: number;
  user_id: number;
  lesson_id: number;
  completed: boolean;
  quiz_correct: boolean;
  completed_at: string;
}

export interface SimulatedOverride {
  symbol: string;
  priceDeltaPercent: number;
  volumeMultiplier: number;
  timestamp: string;
}

const DATA_FILE = path.join(process.cwd(), "marketmate_data.json");

interface DataStoreSchema {
  users: UserRecord[];
  watchlist: WatchlistRecord[];
  snapshots: SnapshotRecord[];
  positions: PositionRecord[];
  transactions: TransactionRecord[];
  lessonProgress: LessonProgressRecord[];
  simulatedOverrides: Record<string, SimulatedOverride>;
}

class Store {
  private data: DataStoreSchema = {
    users: [],
    watchlist: [],
    snapshots: [],
    positions: [],
    transactions: [],
    lessonProgress: [],
    simulatedOverrides: {},
  };

  constructor() {
    this.load();
    this.initDemoUser();
  }

  private load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        this.data = { ...this.data, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn("Could not load data file, starting fresh:", e);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save data file:", e);
    }
  }

  private initDemoUser() {
    const existing = this.getUserByEmail("demo@marketmate.local");
    if (!existing) {
      const hashed = bcrypt.hashSync("demopassword123", 6);
      const user: UserRecord = {
        id: 1,
        email: "demo@marketmate.local",
        name: "Demo Investor",
        hashed_password: hashed,
        virtual_balance: 100000.0,
        experience_level: "Beginner",
        risk_profile: "Moderate Growth",
        created_at: new Date().toISOString(),
      };
      this.data.users.push(user);
      this.save();
    }
  }

  // Users
  getUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: number): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(email: string, passwordPlain: string, name?: string): UserRecord {
    const id = this.data.users.length > 0 ? Math.max(...this.data.users.map((u) => u.id)) + 1 : 1;
    const hashed = bcrypt.hashSync(passwordPlain, 6);
    const user: UserRecord = {
      id,
      email: email.toLowerCase(),
      name: name || email.split("@")[0],
      hashed_password: hashed,
      virtual_balance: 100000.0,
      experience_level: "Beginner",
      risk_profile: "Moderate Growth",
      created_at: new Date().toISOString(),
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUserProfile(
    userId: number,
    updates: { name?: string; experience_level?: string; risk_profile?: string }
  ): UserRecord | undefined {
    const u = this.getUserById(userId);
    if (u) {
      if (updates.name !== undefined) u.name = updates.name;
      if (updates.experience_level !== undefined) u.experience_level = updates.experience_level;
      if (updates.risk_profile !== undefined) u.risk_profile = updates.risk_profile;
      this.save();
    }
    return u;
  }

  updateUserBalance(userId: number, newBalance: number) {
    const u = this.getUserById(userId);
    if (u) {
      u.virtual_balance = Math.round(newBalance * 100) / 100;
      this.save();
    }
  }

  getAllProfilesSummary(): Array<{
    id: number;
    email: string;
    name: string;
    virtual_balance: number;
    experience_level: string;
    created_at: string;
  }> {
    return this.data.users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name || u.email.split("@")[0],
      virtual_balance: u.virtual_balance,
      experience_level: u.experience_level || "Beginner",
      created_at: u.created_at,
    }));
  }

  getStorageInfo() {
    let sizeBytes = 0;
    try {
      if (fs.existsSync(DATA_FILE)) {
        const stats = fs.statSync(DATA_FILE);
        sizeBytes = stats.size;
      }
    } catch {}

    return {
      storage_file: DATA_FILE,
      relative_path: "marketmate_data.json",
      storage_size_bytes: sizeBytes,
      total_users: this.data.users.length,
      total_watchlist_items: this.data.watchlist.length,
      total_snapshots: this.data.snapshots.length,
      total_positions: this.data.positions.length,
      total_transactions: this.data.transactions.length,
      total_lesson_progress: this.data.lessonProgress.length,
      last_saved_at: new Date().toISOString(),
    };
  }

  // Watchlist
  getWatchlist(userId: number): WatchlistRecord[] {
    return this.data.watchlist.filter((w) => w.user_id === userId);
  }

  addToWatchlist(userId: number, symbol: string, companyName: string): WatchlistRecord {
    const existing = this.data.watchlist.find((w) => w.user_id === userId && w.symbol === symbol);
    if (existing) return existing;
    const id = this.data.watchlist.length > 0 ? Math.max(...this.data.watchlist.map((w) => w.id)) + 1 : 1;
    const item: WatchlistRecord = {
      id,
      user_id: userId,
      symbol,
      company_name: companyName,
      created_at: new Date().toISOString(),
    };
    this.data.watchlist.push(item);
    this.save();
    return item;
  }

  removeFromWatchlist(userId: number, symbol: string): boolean {
    const initial = this.data.watchlist.length;
    this.data.watchlist = this.data.watchlist.filter((w) => !(w.user_id === userId && w.symbol === symbol));
    const removed = this.data.watchlist.length < initial;
    if (removed) this.save();
    return removed;
  }

  // Snapshots
  getLatestSnapshots(userId: number): Map<string, SnapshotRecord> {
    const userSnaps = this.data.snapshots.filter((s) => s.user_id === userId);
    const map = new Map<string, SnapshotRecord>();
    // Sort ascending by captured_at so last is latest
    userSnaps.sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime());
    for (const snap of userSnaps) {
      map.set(snap.symbol, snap);
    }
    return map;
  }

  saveSnapshot(userId: number, symbol: string, price: number, volume: number) {
    const id = this.data.snapshots.length > 0 ? Math.max(...this.data.snapshots.map((s) => s.id)) + 1 : 1;
    this.data.snapshots.push({
      id,
      user_id: userId,
      symbol,
      price,
      volume,
      captured_at: new Date().toISOString(),
    });
    this.save();
  }

  // Positions & Transactions
  getPositions(userId: number): PositionRecord[] {
    return this.data.positions.filter((p) => p.user_id === userId && p.quantity > 0);
  }

  getPosition(userId: number, symbol: string): PositionRecord | undefined {
    return this.data.positions.find((p) => p.user_id === userId && p.symbol === symbol);
  }

  getTransactions(userId: number): TransactionRecord[] {
    return this.data.transactions
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // ATOMIC BUY
  atomicBuy(userId: number, symbol: string, quantity: number, price: number): { success: boolean; error?: string } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: "User not found" };

    const totalCost = Math.round(price * quantity * 100) / 100;
    if (user.virtual_balance < totalCost) {
      return {
        success: false,
        error: `Insufficient balance. Required ₹${totalCost.toFixed(2)}, available ₹${user.virtual_balance.toFixed(2)}.`,
      };
    }

    // Deduct cash
    user.virtual_balance = Math.round((user.virtual_balance - totalCost) * 100) / 100;

    // Update position
    let pos = this.getPosition(userId, symbol);
    if (pos) {
      const currentTotalCost = pos.quantity * pos.average_buy_price;
      const newTotalCost = currentTotalCost + totalCost;
      pos.quantity += quantity;
      pos.average_buy_price = Math.round((newTotalCost / pos.quantity) * 100) / 100;
      pos.updated_at = new Date().toISOString();
    } else {
      const id = this.data.positions.length > 0 ? Math.max(...this.data.positions.map((p) => p.id)) + 1 : 1;
      pos = {
        id,
        user_id: userId,
        symbol,
        quantity,
        average_buy_price: price,
        updated_at: new Date().toISOString(),
      };
      this.data.positions.push(pos);
    }

    // Record transaction
    const txId = this.data.transactions.length > 0 ? Math.max(...this.data.transactions.map((t) => t.id)) + 1 : 1;
    this.data.transactions.push({
      id: txId,
      user_id: userId,
      symbol,
      type: "BUY",
      quantity,
      price,
      total: totalCost,
      created_at: new Date().toISOString(),
    });

    this.save();
    return { success: true };
  }

  // ATOMIC SELL
  atomicSell(userId: number, symbol: string, quantity: number, price: number): { success: boolean; error?: string } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: "User not found" };

    const pos = this.getPosition(userId, symbol);
    if (!pos || pos.quantity < quantity) {
      return {
        success: false,
        error: `Cannot sell ${quantity} shares. You currently own ${pos ? pos.quantity : 0} shares.`,
      };
    }

    const totalProceeds = Math.round(price * quantity * 100) / 100;

    // Add cash
    user.virtual_balance = Math.round((user.virtual_balance + totalProceeds) * 100) / 100;

    // Update position
    pos.quantity -= quantity;
    pos.updated_at = new Date().toISOString();
    if (pos.quantity === 0) {
      // Remove position or leave at 0
      this.data.positions = this.data.positions.filter((p) => p.id !== pos.id);
    }

    // Record transaction
    const txId = this.data.transactions.length > 0 ? Math.max(...this.data.transactions.map((t) => t.id)) + 1 : 1;
    this.data.transactions.push({
      id: txId,
      user_id: userId,
      symbol,
      type: "SELL",
      quantity,
      price,
      total: totalProceeds,
      created_at: new Date().toISOString(),
    });

    this.save();
    return { success: true };
  }

  // Lessons
  getLessonProgress(userId: number): LessonProgressRecord[] {
    return this.data.lessonProgress.filter((lp) => lp.user_id === userId);
  }

  completeLesson(userId: number, lessonId: number, quizCorrect: boolean): LessonProgressRecord {
    let rec = this.data.lessonProgress.find((lp) => lp.user_id === userId && lp.lesson_id === lessonId);
    if (rec) {
      rec.completed = true;
      rec.quiz_correct = quizCorrect;
      rec.completed_at = new Date().toISOString();
    } else {
      const id = this.data.lessonProgress.length > 0 ? Math.max(...this.data.lessonProgress.map((l) => l.id)) + 1 : 1;
      rec = {
        id,
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        quiz_correct: quizCorrect,
        completed_at: new Date().toISOString(),
      };
      this.data.lessonProgress.push(rec);
    }
    this.save();
    return rec;
  }

  // Simulation Overrides
  setSimulationOverride(symbol: string, priceDeltaPercent: number, volumeMultiplier: number) {
    this.data.simulatedOverrides[symbol] = {
      symbol,
      priceDeltaPercent,
      volumeMultiplier,
      timestamp: new Date().toISOString(),
    };
    this.save();
  }

  getSimulationOverride(symbol: string): SimulatedOverride | undefined {
    return this.data.simulatedOverrides[symbol];
  }

  clearSimulationOverride(symbol: string) {
    delete this.data.simulatedOverrides[symbol];
    this.save();
  }

  clearAllSimulationOverrides() {
    this.data.simulatedOverrides = {};
    this.save();
  }
}

export const store = new Store();
