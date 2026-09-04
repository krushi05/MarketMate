import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { SimulateChangeModal } from "./components/SimulateChangeModal";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LearnPage } from "./pages/LearnPage";
import { LessonDetailPage } from "./pages/LessonDetailPage";
import { MarketPage } from "./pages/MarketPage";
import { StockDetailPage } from "./pages/StockDetailPage";
import { SmartWatchlistPage } from "./pages/SmartWatchlistPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { ProfilePage } from "./pages/ProfilePage";
import { api } from "./services/api";

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [lessonProgress, setLessonProgress] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: 6,
  });

  // Load lesson progress for Navbar count
  const refreshProgress = () => {
    if (user) {
      api.getLessonProgress()
        .then((res) => {
          setLessonProgress({
            completed: res.completed_lessons,
            total: res.total_lessons,
          });
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    refreshProgress();
  }, [user, currentTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading MarketMate...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
        <LoginPage />
        <Footer />
      </div>
    );
  }

  const handleNavigate = (tab: string, param?: string) => {
    if (tab === "stock-detail" && param) {
      setSelectedStockSymbol(param);
      setCurrentTab("market");
    } else if (tab === "lesson-detail" && param) {
      setSelectedLessonId(parseInt(param, 10));
      setCurrentTab("learn");
    } else {
      if (tab === "learn") setSelectedLessonId(null);
      if (tab === "market") setSelectedStockSymbol(null);
      setCurrentTab(tab);
    }
  };

  const handleSelectStock = (symbol: string) => {
    setSelectedStockSymbol(symbol);
    setCurrentTab("market");
  };

  const handleSelectLesson = (id: number) => {
    setSelectedLessonId(id);
    setCurrentTab("learn");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === "learn") setSelectedLessonId(null);
          if (tab === "market") setSelectedStockSymbol(null);
          setCurrentTab(tab);
        }}
        onOpenSimulate={() => setIsSimulateOpen(true)}
        lessonCount={lessonProgress}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {currentTab === "dashboard" && (
          <DashboardPage
            onNavigate={handleNavigate}
            onOpenSimulate={() => setIsSimulateOpen(true)}
          />
        )}

        {currentTab === "learn" && (
          selectedLessonId ? (
            <LessonDetailPage
              lessonId={selectedLessonId}
              onBack={() => setSelectedLessonId(null)}
              onSelectLesson={(nextId) => setSelectedLessonId(nextId)}
              onNavigateToStock={(symbol) => {
                setSelectedStockSymbol(symbol);
                setCurrentTab("market");
              }}
            />
          ) : (
            <LearnPage
              onSelectLesson={handleSelectLesson}
              onNavigateMarketStock={handleSelectStock}
            />
          )
        )}

        {currentTab === "market" && (
          selectedStockSymbol ? (
            <StockDetailPage
              symbol={selectedStockSymbol}
              onBack={() => setSelectedStockSymbol(null)}
              onOpenSimulate={() => setIsSimulateOpen(true)}
              onNavigateWatchlist={() => setCurrentTab("smart-watchlist")}
            />
          ) : (
            <MarketPage
              onSelectStock={handleSelectStock}
              onOpenSimulate={() => setIsSimulateOpen(true)}
              onNavigateWatchlist={() => setCurrentTab("smart-watchlist")}
            />
          )
        )}

        {currentTab === "smart-watchlist" && (
          <SmartWatchlistPage
            onSelectStock={handleSelectStock}
            onOpenSimulate={() => setIsSimulateOpen(true)}
            onNavigateMarket={() => {
              setSelectedStockSymbol(null);
              setCurrentTab("market");
            }}
          />
        )}

        {currentTab === "portfolio" && (
          <PortfolioPage
            onSelectStock={handleSelectStock}
            onNavigateMarket={() => {
              setSelectedStockSymbol(null);
              setCurrentTab("market");
            }}
          />
        )}

        {currentTab === "profile" && (
          <ProfilePage
            onNavigate={(tab) => handleNavigate(tab)}
          />
        )}
      </main>

      <Footer />

      <SimulateChangeModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onSimulationApplied={() => {
          // If on smart watchlist or market, refresh will be triggered
          refreshProgress();
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
