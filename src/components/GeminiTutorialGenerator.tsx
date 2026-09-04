import React, { useState } from "react";
import {
  Sparkles,
  Video,
  Play,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Clapperboard,
  BookOpen,
  ChevronRight,
  Send,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { api } from "../services/api";
import type { GeminiTutorialResponse } from "../types";

interface Props {
  lessonId?: number;
  lessonTitle?: string;
  defaultPrompt?: string;
}

export const GeminiTutorialGenerator: React.FC<Props> = ({
  lessonId = 1,
  lessonTitle = "Stock Market Fundamentals",
  defaultPrompt = "",
}) => {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [loading, setLoading] = useState(false);
  const [tutorial, setTutorial] = useState<GeminiTutorialResponse | null>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const samplePrompts = [
    `Create a beginner video walkthrough for running the MarketMate lab on ${lessonTitle}`,
    "Explain how to use the ₹1,00,000 virtual cash and execute atomic trades safely",
    "Show how Smart Watchlist spots institutional buying surges (≥1.5× volume)",
    "Explain what to look for before placing your first demo trade",
  ];

  const handleGenerate = async (customText?: string) => {
    const textToUse = customText || prompt || samplePrompts[0];
    setLoading(true);
    // Stop any ongoing speech
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const res = await api.generateGeminiTutorial(lessonId, textToUse, lessonTitle);
      setTutorial(res);
      setActiveSceneIndex(0);
    } catch (err) {
      console.error("Failed to generate Gemini tutorial", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    try {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !window.speechSynthesis) return;

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } catch (err) {
      console.warn("Speech synthesis unavailable:", err);
      setIsSpeaking(false);
    }
  };

  const handleCopyScript = () => {
    if (!tutorial) return;
    const fullText = `TUTORIAL VIDEO: ${tutorial.title}\nDuration: ${tutorial.duration}\nHook: ${tutorial.hook}\n\nSCENES:\n` +
      tutorial.scenes.map((s, i) => `[${s.timestamp}] Scene ${i + 1}: ${s.scene_title}\nVisual: ${s.visual_cue}\nNarration: ${s.narration}\nKey Points:\n${s.key_points.map(p => ` - ${p}`).join("\n")}`).join("\n\n") +
      `\n\nLAB FEATURE GUIDE:\n` +
      tutorial.lab_feature_guide.map(f => `• ${f.feature_name}: ${f.how_it_works}\n  Beginner Tip: ${f.beginner_tip}`).join("\n\n");

    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch((err) => {
          console.warn("Clipboard write denied:", err);
        });
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 text-xs font-semibold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Gemini AI Lab Video Director</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-purple-400" />
            Prompt Gemini to Generate a Lab Tutorial Video
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Generate an engaging video script and lab feature explanation to master this topic risk-free.
          </p>
        </div>

        {tutorial && (
          <button
            onClick={handleCopyScript}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer self-start sm:self-auto border border-zinc-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{copied ? "Copied Script!" : "Copy Full Script"}</span>
          </button>
        )}
      </div>

      {/* Prompt Input Form */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            id="input-gemini-tutorial-prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask Gemini: e.g. "Create a video explaining how to use the lab for ${lessonTitle}..."`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition"
          />
          <button
            id="btn-gemini-generate"
            onClick={() => handleGenerate()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-purple-900/30"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Directing Video...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Video Guide</span>
              </>
            )}
          </button>
        </div>

        {/* Prompt Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            Try prompting:
          </span>
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(sp);
                handleGenerate(sp);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-850 transition cursor-pointer"
            >
              {sp.slice(0, 42)}...
            </button>
          ))}
        </div>
      </div>

      {/* Generated Tutorial Display */}
      {tutorial && (
        <div className="space-y-6 pt-2 animate-in fade-in">
          {/* Video Meta Card */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-purple-900/40 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-4 h-4" />
                {tutorial.title}
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono">
                  ⏱ {tutorial.duration}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-mono text-[10px]">
                  {tutorial.source || "gemini-3.8-flash"}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic border-l-2 border-purple-500 pl-3 py-0.5 mt-2">
              "{tutorial.hook}"
            </p>
          </div>

          {/* Interactive Teleprompter / Scene Player */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-zinc-850 pb-3">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-indigo-400" />
                Scene Teleprompter & Visual Cues
              </h3>
              <div className="flex items-center gap-1.5">
                {tutorial.scenes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSceneIndex(i)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      activeSceneIndex === i
                        ? "bg-purple-600 text-white"
                        : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Scene {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Scene Content */}
            {tutorial.scenes[activeSceneIndex] && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono">
                      {tutorial.scenes[activeSceneIndex].timestamp}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100">
                      {tutorial.scenes[activeSceneIndex].scene_title}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleSpeak(tutorial.scenes[activeSceneIndex].narration)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                      isSpeaking
                        ? "bg-rose-950 text-rose-300 border-rose-800"
                        : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-850"
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{isSpeaking ? "Stop Voiceover" : "Read Narration Aloud"}</span>
                  </button>
                </div>

                {/* Visual Cue */}
                <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    🎬 Screen Visual Action / What to Click in Lab
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {tutorial.scenes[activeSceneIndex].visual_cue}
                  </p>
                </div>

                {/* Narration Script */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1.5">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                    🎙 Voiceover Narration Script
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                    {tutorial.scenes[activeSceneIndex].narration}
                  </p>
                </div>

                {/* Key Overlay Points */}
                {tutorial.scenes[activeSceneIndex].key_points && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      📌 On-Screen Key Takeaway Bullet Points
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {tutorial.scenes[activeSceneIndex].key_points.map((pt, pIdx) => (
                        <div key={pIdx} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                          {pt}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lab Feature Breakdown Guide */}
          {tutorial.lab_feature_guide && tutorial.lab_feature_guide.length > 0 && (
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Featured MarketMate Lab Capabilities Explained
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {tutorial.lab_feature_guide.map((feat, fIdx) => (
                  <div key={fIdx} className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400">{feat.feature_name}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{feat.how_it_works}</p>
                    <div className="text-[10px] text-indigo-300 bg-indigo-950/40 p-2 rounded-lg border border-indigo-900/40">
                      <strong>Tip:</strong> {feat.beginner_tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
