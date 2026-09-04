import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  BookOpen,
  Video,
  Youtube,
  Edit3,
  Check,
  RotateCcw
} from "lucide-react";
import { api } from "../services/api";
import { safeStorage } from "../services/storage";
import type { Lesson } from "../types";

interface Props {
  lessonId: number;
  onBack: () => void;
  onSelectLesson: (id: number) => void;
  onNavigateToStock: (symbol: string) => void;
}

export const LessonDetailPage: React.FC<Props> = ({
  lessonId,
  onBack,
  onSelectLesson,
  onNavigateToStock,
}) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [loading, setLoading] = useState(true);

  // Associated stock for "Try in Demo Market"
  const stockSuggestions: Record<number, { symbol: string; label: string }> = {
    1: { symbol: "AAPL", label: "Inspect Apple (AAPL) ownership & shares" },
    2: { symbol: "TSLA", label: "Inspect Tesla (TSLA) price movement" },
    3: { symbol: "NVDA", label: "Inspect NVIDIA (NVDA) trading volume surge" },
    4: { symbol: "MSFT", label: "Inspect Microsoft (MSFT) market price" },
    5: { symbol: "RELIANCE.NS", label: "Inspect Reliance Industries valuation" },
    6: { symbol: "AAPL", label: "Inspect Index constituent stock" },
  };

  // Default curated educational YouTube videos per lesson
  const defaultYouTubeVideos: Record<number, { videoId: string; title: string }> = {
    1: { videoId: "p7HKvqRI_Bo", title: "How the Stock Market Works & What is a Share" },
    2: { videoId: "Xn7KWR9EOGQ", title: "Stock Prices, Bid-Ask Spreads & Fluctuation Explained" },
    3: { videoId: "bipNghUuUHE", title: "Why Trading Volume Matters: Institutional vs Retail" },
    4: { videoId: "F3QpgXBtDeo", title: "Market Orders vs Limit Orders for Beginners" },
    5: { videoId: "ZCFkWDdmXG8", title: "Dividends & Growth: How Companies Return Capital" },
    6: { videoId: "8Ij7A1VCB7I", title: "Stock Indices Explained (Nifty 50, S&P 500, Sensex)" },
  };

  const [customYtInput, setCustomYtInput] = useState("");
  const [editingYt, setEditingYt] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState("");
  const [ytSavedNotice, setYtSavedNotice] = useState(false);

  const extractYouTubeId = (input: string): string => {
    if (!input) return "";
    const clean = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = clean.match(regExp);
    return match && match[2].length === 11 ? match[2] : clean;
  };

  useEffect(() => {
    setLoading(true);
    setSelectedOption(null);
    setQuizResult(null);

    // Initialize YouTube Video
    const savedCustomYt = safeStorage.getItem(`marketmate_yt_lesson_${lessonId}`);
    if (savedCustomYt) {
      setActiveVideoId(savedCustomYt);
      setCustomYtInput(`https://www.youtube.com/watch?v=${savedCustomYt}`);
    } else {
      const def = defaultYouTubeVideos[lessonId] || defaultYouTubeVideos[1];
      setActiveVideoId(def.videoId);
      setCustomYtInput(`https://www.youtube.com/watch?v=${def.videoId}`);
    }

    api
      .getLesson(lessonId)
      .then((l) => {
        setLesson(l);
        if (l.completed && l.quiz_correct) {
          setQuizResult({
            correct: true,
            explanation: "You have previously mastered and completed this quiz!",
          });
        }
      })
      .catch((err) => {
        console.warn("Could not load lesson details:", err);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleSaveCustomYt = () => {
    const extractedId = extractYouTubeId(customYtInput);
    if (!extractedId) return;
    setActiveVideoId(extractedId);
    safeStorage.setItem(`marketmate_yt_lesson_${lessonId}`, extractedId);
    setEditingYt(false);
    setYtSavedNotice(true);
    setTimeout(() => setYtSavedNotice(false), 2500);
  };

  const handleResetDefaultYt = () => {
    safeStorage.removeItem(`marketmate_yt_lesson_${lessonId}`);
    const def = defaultYouTubeVideos[lessonId] || defaultYouTubeVideos[1];
    setActiveVideoId(def.videoId);
    setCustomYtInput(`https://www.youtube.com/watch?v=${def.videoId}`);
    setEditingYt(false);
  };

  const handleQuizSubmit = async () => {
    if (selectedOption === null || !lesson) return;
    setSubmittingQuiz(true);
    try {
      const res = await api.completeLesson(lesson.id, selectedOption);
      setQuizResult({
        correct: res.quiz_correct,
        explanation: res.explanation,
      });
      if (res.completed) {
        setLesson((prev) => (prev ? { ...prev, completed: true, quiz_correct: res.quiz_correct } : null));
      }
    } catch (err: any) {
      setQuizResult({
        correct: false,
        explanation: err.message || "Failed to submit quiz. Please try again.",
      });
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loading || !lesson) {
    return (
      <div className="py-12 text-center text-zinc-400 text-sm">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Lesson Content...
      </div>
    );
  }

  const suggestedStock = stockSuggestions[lesson.id] || { symbol: "NVDA", label: "Inspect stock" };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      {/* Back Button */}
      <button
        id="btn-back-to-lessons"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Lessons</span>
      </button>

      {/* Lesson Header Card */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/50">
            Lesson #{lesson.order} of 6
          </span>
          {lesson.completed && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Lesson Completed
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          {lesson.title}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
          {lesson.description}
        </p>
      </div>

      {/* Section 1: Concept Explanation */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 space-y-3">
        <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>What Is It?</span>
        </h3>
        <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
          {lesson.content}
        </p>
      </div>

      {/* Section 2: Real-World Example */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 space-y-3">
        <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Real-World Example</span>
        </h3>
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 text-sm text-zinc-300 leading-relaxed">
          {lesson.example}
        </div>
      </div>

      {/* Section 3: Why Does This Matter? */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 space-y-3">
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          <span>Why Does This Matter?</span>
        </h3>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {lesson.why_matters}
        </p>
      </div>

      {/* Section 4: Key Takeaway Box */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-zinc-900 border border-indigo-800/60 p-5 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block mb-1">
          Key Takeaway
        </span>
        <p className="text-sm font-medium text-zinc-100 leading-relaxed">
          {lesson.key_takeaway}
        </p>
      </div>

      {/* Section: YouTube Video Tutorial & Lab Walkthrough */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-950 border border-rose-800/60 flex items-center justify-center">
                <Youtube className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">
                YouTube Video Tutorial
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Watch an educational breakdown of {lesson.title}. You can also paste your own YouTube tutorial!
            </p>
          </div>

          <div className="flex items-center gap-2">
            {ytSavedNotice && (
              <span className="text-[11px] text-emerald-400 font-semibold animate-in fade-in">
                Saved!
              </span>
            )}
            <button
              onClick={() => setEditingYt(!editingYt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition cursor-pointer border border-zinc-700"
            >
              <Edit3 className="w-3.5 h-3.5 text-rose-400" />
              <span>{editingYt ? "Cancel Edit" : "Change / Put YT URL"}</span>
            </button>
          </div>
        </div>

        {/* Custom YouTube URL Editor Form */}
        {editingYt && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <label className="block text-xs font-semibold text-zinc-300">
              Paste any YouTube Video Link or ID:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customYtInput}
                onChange={(e) => setCustomYtInput(e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=p7HKvqRI_Bo"
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-750 text-zinc-100 text-xs focus:outline-none focus:border-rose-500 font-mono"
              />
              <button
                onClick={handleSaveCustomYt}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Video</span>
              </button>
              <button
                onClick={handleResetDefaultYt}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                title="Reset to default MarketMate tutorial"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              Supports standard YouTube URLs (<code>youtube.com/watch?v=...</code>, <code>youtu.be/...</code>, or raw 11-char ID). Your custom link is saved locally for this lesson.
            </p>
          </div>
        )}

        {/* Embedded YouTube Player */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-md">
          {activeVideoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?rel=0&modestbranding=1`}
              title={`YouTube tutorial for ${lesson.title}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-xs space-y-2">
              <Youtube className="w-8 h-8 text-zinc-600" />
              <p>No video ID specified. Click "Change / Put YT URL" above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 5: Interactive Quiz ("Quick Check") */}
      <div
        id="lesson-quiz-section"
        className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Quick Check Quiz</span>
          </h3>
          <span className="text-xs text-zinc-400">Test Your Understanding</span>
        </div>

        <p className="text-sm font-medium text-zinc-200">
          {lesson.quiz_question}
        </p>

        {/* Options */}
        <div className="space-y-2.5">
          {lesson.quiz_options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                id={`quiz-option-${idx}`}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-3.5 rounded-xl text-xs sm:text-sm font-medium border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-indigo-950/70 border-indigo-500 text-indigo-200 shadow-xs"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                <span>{option}</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                    isSelected ? "border-indigo-400 bg-indigo-500 text-white" : "border-zinc-700"
                  }`}
                >
                  {isSelected && "✓"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quiz Result Banner */}
        {quizResult && (
          <div
            id="quiz-result-banner"
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
              quizResult.correct
                ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-200"
                : "bg-rose-950/60 border-rose-700/60 text-rose-200"
            }`}
          >
            {quizResult.correct ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-semibold block">
                {quizResult.correct ? "Great Job! Correct." : "Not Quite. Try Again!"}
              </span>
              <p className="leading-relaxed text-zinc-300">{quizResult.explanation}</p>
            </div>
          </div>
        )}

        <button
          id="btn-submit-quiz"
          onClick={handleQuizSubmit}
          disabled={selectedOption === null || submittingQuiz}
          className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {submittingQuiz ? "Checking..." : "Submit Answer"}
        </button>
      </div>

      {/* Next Actions & Try In Demo Market */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-semibold text-zinc-300">
            Apply What You Just Learned
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            {suggestedStock.label} in the Demo Market.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            id="btn-try-in-demo-market"
            onClick={() => onNavigateToStock(suggestedStock.symbol)}
            className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Try in Demo Market</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          {lesson.id < 6 && (
            <button
              id="btn-next-lesson"
              onClick={() => onSelectLesson(lesson.id + 1)}
              className="py-2 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Next Lesson</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
