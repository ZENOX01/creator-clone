"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import {
  Loader2, Terminal, Zap, ShieldAlert, Copy, Check,
  Youtube, FileText, ChevronRight, Settings, X,
  Flame, Smile, BookOpen, TrendingUp, Download
} from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

/** Splits a text string on [STAGE DIRECTION] patterns and renders them muted. */
function renderWithStageDirections(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) =>
    /^\[[^\]]+\]$/.test(part)
      ? <span key={i} className="text-zinc-500 italic font-medium">{part}</span>
      : <span key={i}>{part}</span>
  );
}

/**
 * Recursively processes react-markdown children:
 * - Strings get stage-direction highlighting
 * - React elements (e.g. <strong>) pass through unchanged
 * - Arrays are mapped recursively
 */
function processChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === "string") return renderWithStageDirections(children);
  if (Array.isArray(children)) {
    return children.map((child, i) =>
      typeof child === "string"
        ? <span key={i}>{renderWithStageDirections(child)}</span>
        : child
    );
  }
  return children;
}

/** react-markdown custom components — renders markdown beautifully and colorises stage directions. */
const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-5 leading-[1.85] text-zinc-200 text-[15px]">
      {processChildren(children)}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-white">{children}</strong>
  ),
  h1: ({ children }) => <h1 className="text-2xl font-black text-white mb-3 mt-6">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-bold text-white mb-2 mt-5">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-semibold text-zinc-100 mb-2 mt-4">{children}</h3>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="text-zinc-200 leading-relaxed">{processChildren(children)}</li>,
  em: ({ children }) => <em className="italic text-zinc-400">{children}</em>,
  hr: () => <hr className="border-zinc-700 my-6" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-zinc-600 pl-4 my-4 text-zinc-400 italic">{children}</blockquote>
  ),
};

const HOOK_STYLES = [
  { id: "bold-claim", label: "Bold Claim", icon: Flame, desc: "Outrageous opener that stops the scroll" },
  { id: "question", label: "Question", icon: Smile, desc: "Hook the viewer with their own curiosity" },
  { id: "story", label: "Story", icon: BookOpen, desc: "Drop them into a scene instantly" },
  { id: "data", label: "Data Drop", icon: TrendingUp, desc: "Shocking stat that reframes everything" },
];

export default function Dashboard() {
  // Core state
  const [videoTitle, setVideoTitle] = useState("");
  const [personalityDna, setPersonalityDna] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<"shorts" | "long-form">("shorts");
  const { isSignedIn } = useAuth();

  // Tone extractor state
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [isDnaLoaded, setIsDnaLoaded] = useState(false);

  // Load user's saved Supabase profile
  useEffect(() => {
    async function loadSavedDna() {
      try {
        const res = await fetch("/api/user-profile");
        if (!res.ok) return;
        const data = await res.json();
        if (data.saved_dna) {
          setPersonalityDna(data.saved_dna);
          setIsDnaLoaded(true);
          // Auto-hide the success indicator after 5 seconds to keep the UI sleek
          setTimeout(() => setIsDnaLoaded(false), 5000);
        }
      } catch (err) {
        console.error("Failed to load saved DNA", err);
      }
    }
    if (isSignedIn) {
      loadSavedDna();
    }
  }, [isSignedIn]);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [toneLevel, setToneLevel] = useState(3);   // 1-5
  const [hookStyle, setHookStyle] = useState("bold-claim");

  const toneLabels: Record<number, string> = {
    1: "Chill & Laid-back",
    2: "Conversational",
    3: "Balanced",
    4: "High-Energy",
    5: "Savage Mode 🔥",
  };

  // Handlers
  const handleAnalyze = async () => {
    if (!youtubeUrl.trim()) return;
    setIsAnalyzing(true);
    setAnalyzeError("");
    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze video");
      setPersonalityDna(data.dna);
      setYoutubeUrl("");
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : "Failed to analyze video");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!generatedScript) return;
    const filename = (videoTitle.trim().replace(/[^a-z0-9\s]/gi, "").replace(/\s+/g, "_").toLowerCase() || "script") + ".txt";
    const blob = new Blob([generatedScript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (!videoTitle.trim() || !personalityDna.trim()) return;
    setIsGenerating(true);
    setGeneratedScript("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: videoTitle,
          dna: personalityDna,
          mode: activeMode,
          settings: { toneLevel, hookStyle },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate script");
      setGeneratedScript(data.script);
    } catch (e) {
      setGeneratedScript(`ERROR: ${e instanceof Error ? e.message : "Connection failed"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = videoTitle.trim() && personalityDna.trim() && !isGenerating;

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans antialiased">
      {/* Subtle grid overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080808]/95 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span className="text-sm sm:text-base font-black tracking-tight hidden xs:block sm:block">
              CREATOR <span className="text-cyan-400">CLONE</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <a 
              href="https://x.com/ZenoBuildsAI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-semibold text-[#666] hover:text-[#1da1f2] transition-colors hidden md:block"
            >
              DM me on X with feature requests
            </a>
            <a 
              href="https://x.com/ZenoBuildsAI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#666] hover:text-[#1da1f2] md:hidden p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.873 11.633Z"/></svg>
            </a>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-[#666] hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <div className="w-px h-6 bg-white/[0.08]" />
            {isSignedIn && (
              <div className="ring-1 ring-white/10 rounded-full hover:ring-cyan-500/40 transition-all">
                <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }} />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── SETTINGS DRAWER ── */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="relative ml-auto w-full max-w-md h-full bg-[#0f0f0f] border-l border-white/[0.08] flex flex-col shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.07]">
              <div>
                <h2 className="text-xl font-bold">Generation Settings</h2>
                <p className="text-sm text-[#666] mt-0.5">Tweak how your scripts are written</p>
              </div>
              <button onClick={() => setShowSettings(false)} className="text-[#666] hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-10 px-8 py-8">

              {/* Tone Level */}
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-bold text-white">Tone Intensity</h3>
                  <p className="text-sm text-[#666] mt-1">How aggressive and in-your-face the script should sound</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#555]">Chill</span>
                    <span className="font-bold text-cyan-400">{toneLabels[toneLevel]}</span>
                    <span className="text-[#555]">Savage</span>
                  </div>
                  <input
                    type="range"
                    min={1} max={5} step={1}
                    value={toneLevel}
                    onChange={(e) => setToneLevel(Number(e.target.value))}
                    className="w-full h-2 bg-white/[0.08] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className={`w-1.5 h-1.5 rounded-full ${n <= toneLevel ? 'bg-cyan-400' : 'bg-white/[0.12]'}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Hook Style */}
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-bold text-white">Opening Hook Style</h3>
                  <p className="text-sm text-[#666] mt-1">How the script grabs attention in the first 3 seconds</p>
                </div>
                <div className="flex flex-col gap-3">
                  {HOOK_STYLES.map(({ id, label, icon: Icon, desc }) => (
                    <button
                      key={id}
                      onClick={() => setHookStyle(id)}
                      className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${hookStyle === id
                          ? "border-cyan-500/60 bg-cyan-500/10"
                          : "border-white/[0.07] bg-white/[0.03] hover:border-white/20"
                        }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${hookStyle === id ? "text-cyan-400" : "text-[#555]"}`} />
                      <div>
                        <p className={`text-sm font-bold ${hookStyle === id ? "text-white" : "text-[#888]"}`}>{label}</p>
                        <p className="text-xs text-[#555] mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply */}
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-4 bg-white text-black font-black text-sm uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-all"
              >
                Apply Settings
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ── PAGE CONTENT ── */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 relative z-10">

        {/* Page Heading */}
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Script <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Studio</span>
          </h1>
          <p className="text-sm sm:text-base text-[#666] mt-2">Generate scripts that sound exactly like you. Input → DNA → Fire.</p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[520px_1fr] gap-8 items-start">

          {/* ── LEFT: INPUTS ── */}
          <div className="flex flex-col gap-6">

            {/* Mode Selector */}
            <div className="flex p-1.5 bg-white/[0.04] border border-white/[0.07] rounded-2xl gap-1.5">
              {(["shorts", "long-form"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 text-sm font-bold uppercase tracking-widest rounded-xl transition-all duration-200 ${activeMode === mode
                      ? "bg-white/[0.1] text-white shadow-inner"
                      : "text-[#555] hover:text-[#888]"
                    }`}
                >
                  {mode === "shorts" ? <Zap className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  {mode === "shorts" ? "Shorts / Reels" : "Long Form"}
                </button>
              ))}
            </div>

            {/* Topic Input */}
            <div className="flex flex-col gap-2.5">
              <label htmlFor="videoTitle" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#888]">
                <Zap className="w-4 h-4 text-cyan-500" />
                {activeMode === "shorts" ? "Hook / Short Idea" : "Video Topic"}
              </label>
              <input
                id="videoTitle"
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder={activeMode === "shorts" ? "e.g. Why 99% of devs never go viral..." : "e.g. The complete guide to building a SaaS"}
                className="w-full bg-white/[0.05] border border-white/[0.09] rounded-2xl px-5 py-4 text-base text-white placeholder:text-[#555] focus:outline-none focus:border-cyan-500/60 focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Personality DNA */}
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#888]">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Personality DNA
                </label>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {isDnaLoaded && (
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-500">
                      <Check className="w-3.5 h-3.5" />
                      Loaded
                    </span>
                  )}
                  <span className={`text-xs sm:text-sm font-bold tabular-nums ${personalityDna.length > 850 ? "text-red-400" : "text-[#555]"}`}>
                    {personalityDna.length}/1000
                  </span>
                </div>
              </div>

              {/* Auto-Extract Row */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  placeholder="Paste YouTube URL to auto-extract tone..."
                  disabled={isAnalyzing}
                  className="flex-1 bg-white/[0.05] border border-white/[0.09] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-cyan-500/40 transition-all disabled:opacity-40"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !youtubeUrl.trim()}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider border border-cyan-500/30 text-cyan-400 rounded-2xl hover:bg-cyan-500/10 hover:border-cyan-400/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4" />}
                  {isAnalyzing ? "Scanning..." : "Extract"}
                </button>
              </div>

              {analyzeError && (
                <p className="text-sm text-red-400 leading-relaxed">{analyzeError}</p>
              )}
              {personalityDna && !analyzeError && (
                <p className="text-sm text-emerald-500 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> DNA profile ready
                </p>
              )}

              <textarea
                id="personalityDna"
                value={personalityDna}
                onChange={(e) => setPersonalityDna(e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="Or describe your style manually — aggressive, uses 'bro' a lot, dry humor, never says 'Welcome back to my channel'..."
                className="w-full bg-white/[0.05] border border-white/[0.09] rounded-2xl px-5 py-4 text-base text-white placeholder:text-[#454545] focus:outline-none focus:border-amber-500/50 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Settings preview strip */}
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-[#555] group-hover:text-[#888] transition-colors" />
                <div className="text-left">
                  <p className="text-sm font-bold text-[#777] group-hover:text-[#999] transition-colors">Generation Settings</p>
                  <p className="text-xs text-[#444] mt-0.5">
                    Tone: <span className="text-[#666]">{toneLabels[toneLevel]}</span> · Hook: <span className="text-[#666]">{HOOK_STYLES.find(h => h.id === hookStyle)?.label}</span>
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#444] group-hover:text-[#666] transition-colors" />
            </button>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`relative w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest overflow-hidden transition-all duration-300 ${canGenerate
                  ? "bg-[#eaff00] text-black hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(234,255,0,0.3)] cursor-pointer"
                  : "bg-white/[0.05] text-[#444] border border-white/[0.07] cursor-not-allowed"
                }`}
            >
              <span className="flex items-center justify-center gap-3">
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generating Script...</>
                ) : canGenerate ? (
                  <>Generate Script <ChevronRight className="w-5 h-5" /></>
                ) : (
                  "Fill in topic + DNA above"
                )}
              </span>
            </button>

          </div>

          {/* ── RIGHT: OUTPUT ── */}
          <div className="flex flex-col gap-4">
            {/* Output header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#555]">
                <Terminal className="w-4 h-4" />
                <span className="hidden xs:inline">Generated Script</span>
              </div>
              {generatedScript && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-bold uppercase tracking-widest px-3 sm:px-4 py-2 rounded-xl border border-white/[0.09] hover:border-white/25 hover:bg-white/[0.05] transition-all"
                    title="Download as .txt"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 text-[#666]" />
                    <span className="text-[#666] hidden sm:inline">Download</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm font-bold uppercase tracking-widest px-3 sm:px-4 py-2 rounded-xl border border-white/[0.09] hover:border-white/25 hover:bg-white/[0.05] transition-all"
                  >
                    {isCopied ? (
                      <><Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
                    ) : (
                      <><Copy className="w-3 h-3 sm:w-4 sm:h-4 text-[#666]" /><span className="text-[#666] hidden sm:inline">Copy</span></>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Output Box */}
            <div className={`min-h-[500px] sm:min-h-[540px] w-full max-w-[100vw] sm:max-w-none rounded-xl border transition-all duration-300 overflow-hidden flex flex-col ${generatedScript
                ? "border-zinc-800 bg-[#111111]"
                : "border-dashed border-zinc-800/60 bg-transparent"
              }`}>
              {isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-12 py-16">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                    <div className="absolute inset-0 blur-2xl bg-cyan-500/20 rounded-full" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">Generating your script...</p>
                    <p className="text-sm text-zinc-500 mt-1.5">Matching your tone · Hook: {HOOK_STYLES.find(h => h.id === hookStyle)?.label}</p>
                  </div>
                </div>
              ) : generatedScript ? (
                <div className="overflow-y-auto max-h-[680px] px-8 py-7 font-sans text-base">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {generatedScript}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-12 py-16">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800/40 border border-zinc-800 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-zinc-700" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-zinc-600">Your script will appear here</p>
                    <p className="text-sm text-zinc-700 mt-1.5 max-w-xs mx-auto leading-relaxed">Enter a topic and your personality DNA on the left, then hit Generate</p>
                  </div>
                </div>
              )}
            </div>

            {/* Mode badge */}
            {generatedScript && (
              <div className="flex items-center gap-2 text-sm text-[#555]">
                {activeMode === "shorts" ? <Zap className="w-3.5 h-3.5 text-cyan-500" /> : <FileText className="w-3.5 h-3.5 text-purple-400" />}
                Generated as <span className="text-[#777] font-bold">{activeMode === "shorts" ? "Short-form" : "Long-form"}</span>
                <span className="text-[#333]">·</span>
                <span className="text-[#555]">Tone: {toneLabels[toneLevel]}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
