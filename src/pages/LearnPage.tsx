import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Video,
  Youtube
} from "lucide-react";
import { api } from "../services/api";
import type { Lesson, LessonProgressSummary } from "../types";

interface Props {
  onSelectLesson: (id: number) => void;
  onNavigateMarketStock?: (symbol: string) => void;
}

export const LearnPage: React.FC<Props> = ({ onSelectLesson, onNavigateMarketStock }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getLessons(), api.getLessonProgress()])
      .then(([ls, prog]) => {
        setLessons(ls);
        setProgress(prog);
      })
      .catch((err) => {
        console.warn("Failed to load lessons or progress", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-zinc-400 text-sm">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading Market Fundamentals...
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 border border-zinc-800 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50 text-xs font-semibold mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Interactive Learning Curriculum</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Market Fundamentals for Beginners
            </h1>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Every lesson includes real-world analogies, embedded YouTube video tutorials (with custom video link support), and interactive concept quizzes.
            </p>
          </div>
        </div>

        {/* Progress summary */}
        {progress && (
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-400 font-medium">
                Overall Course Progress
              </div>
              <div className="text-lg font-bold text-zinc-100">
                {progress.completed_lessons} of {progress.total_lessons} Lessons Completed ({Math.round(progress.completion_percentage)}%)
              </div>
            </div>
            <div className="w-full sm:w-64 bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress.completion_percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            id={`lesson-card-${lesson.id}`}
            className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 flex flex-col justify-between hover:border-zinc-700 transition shadow-sm group"
          >
            <div>
              {/* Card top badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Lesson #{lesson.order}
                </span>
                {lesson.completed ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Completed
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-zinc-500">
                    Not Started
                  </span>
                )}
              </div>

              <h3 className="text-base font-semibold text-zinc-100 group-hover:text-indigo-400 transition">
                {lesson.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {lesson.description}
              </p>

              {/* Video indicator */}
              <div className="flex items-center gap-2 mt-3 pt-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-900/40 font-medium">
                  <Youtube className="w-3 h-3 text-rose-400" />
                  <span>Video Lesson & Quiz</span>
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-800/60">
              <button
                id={`btn-open-lesson-${lesson.id}`}
                onClick={() => onSelectLesson(lesson.id)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  lesson.completed
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                }`}
              >
                <span>{lesson.completed ? "Review Lesson" : "Start Lesson"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
