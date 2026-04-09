"use client";

import { useState, useEffect } from "react";
import type { Components } from "react-markdown";
import { Flame, Smile, BookOpen, TrendingUp, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

import { Navbar } from "@/components/dashboard/Navbar";
import { AmbientBackground } from "@/components/dashboard/AmbientBackground";
import { InputPanel } from "@/components/dashboard/InputPanel";
import { ScriptEditor } from "@/components/dashboard/ScriptEditor";

/** Splits a text string on [STAGE DIRECTION] patterns and renders them muted. */
function renderWithStageDirections(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) =>
    /^\[[^\]]+\]$/.test(part)
      ? <span key={i} className="text-zinc-500 italic font-medium">{part}</span>
      : <span key={i}>{part}</span>
  );
}

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

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-5 leading-[1.85] text-zinc-200 text-[15px]">
      {processChildren(children)}
    </p>
  ),
  strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
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
  const [videoTitle, setVideoTitle] = useState("");
  const [personalityDna, setPersonalityDna] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<"shorts" | "long-form">("shorts");
  const [isEditing, setIsEditing] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  type SavedDNA = { id: string; name: string; dna: string };
  const [savedDnas, setSavedDnas] = useState<SavedDNA[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSavingDna, setIsSavingDna] = useState(false);
  const [newDnaName, setNewDnaName] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [contentBlueprint, setContentBlueprint] = useState("");
  const [isExtractingOutline, setIsExtractingOutline] = useState(false);
  const { isSignedIn } = useAuth();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [isDnaLoaded, setIsDnaLoaded] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user-profile");
        if (!res.ok) return;
        const data = await res.json();
        if (data.credits !== null && data.credits !== undefined) {
          setCredits(data.credits);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    }
    async function loadSavedDnas() {
      try {
        const res = await fetch("/api/dna");
        if (!res.ok) return;
        const data = await res.json();
        setSavedDnas(data.dnas || []);
      } catch (err) {
        console.error("Failed to load saved DNAs", err);
      }
    }
    if (isSignedIn) {
      loadProfile();
      loadSavedDnas();
    }
  }, [isSignedIn]);

  const [showSettings, setShowSettings] = useState(false);
  const [toneLevel, setToneLevel] = useState(3);
  const [hookStyle, setHookStyle] = useState("bold-claim");

  const toneLabels: Record<number, string> = {
    1: "Chill & Laid-back",
    2: "Conversational",
    3: "Balanced",
    4: "High-Energy",
    5: "Savage Mode 🔥",
  };

  const handleGenerateOutline = async () => {
    if (!videoTitle.trim()) return;
    setIsExtractingOutline(true);
    try {
      const res = await fetch("/api/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: videoTitle, mode: activeMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContentBlueprint(data.outline);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtractingOutline(false);
    }
  };

  const handleSaveDna = async () => {
    if (!newDnaName.trim() || !personalityDna.trim()) return;
    setIsSavingDna(true);
    try {
      const res = await fetch("/api/dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDnaName, dna: personalityDna }),
      });
      const data = await res.json();
      if (res.ok && data.dna) {
        setSavedDnas(prev => [data.dna, ...prev]);
        setShowSaveModal(false);
        setNewDnaName("");
      }
    } catch (e) {
      console.error("Failed to save DNA", e);
    } finally {
      setIsSavingDna(false);
    }
  };

  const handleDeleteDna = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/dna?id=${id}`, { method: "DELETE" });
      setSavedDnas(prev => prev.filter(dna => dna.id !== id));
    } catch (e) {
      console.error("Failed to delete DNA", e);
    }
  };

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
    setIsEditing(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: videoTitle,
          outline: contentBlueprint,
          dna: personalityDna,
          mode: activeMode,
          settings: { toneLevel, hookStyle },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate script");
      setGeneratedScript(data.script);
      setCredits(prev => (prev !== null ? Math.max(0, prev - 1) : null));
    } catch (e) {
      setGeneratedScript(`ERROR: ${e instanceof Error ? e.message : "Connection failed"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = Boolean(videoTitle.trim().length > 0 && personalityDna.trim().length > 0 && !isGenerating);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans antialiased relative selection:bg-zinc-800 selection:text-white">
      <AmbientBackground />
      <Navbar credits={credits} />

      {/* ── SETTINGS MODAL ── */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-white">Generation Settings</h2>
              </div>
              <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white p-1 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-8 px-6 py-6 overflow-y-auto max-h-[80vh]">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-white">Tone Intensity</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
                    <span>Chill</span>
                    <span className="text-white bg-white/10 px-2 py-0.5 rounded-md">{toneLabels[toneLevel]}</span>
                    <span>Savage</span>
                  </div>
                  <input
                    type="range"
                    min={1} max={5} step={1}
                    value={toneLevel}
                    onChange={(e) => setToneLevel(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer transition-all"
                  />
                  <div className="flex justify-between px-0.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className={`w-1 h-1 rounded-full ${n <= toneLevel ? 'bg-white' : 'bg-transparent'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-medium text-white">Opening Hook Style</h3>
                <div className="grid grid-cols-1 gap-2">
                  {HOOK_STYLES.map(({ id, label, icon: Icon, desc }) => (
                    <button
                      key={id}
                      onClick={() => setHookStyle(id)}
                      className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${hookStyle === id
                          ? "border-zinc-500 bg-white/5"
                          : "border-transparent bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${hookStyle === id ? "text-white" : "text-zinc-500"}`} />
                      <div>
                        <p className={`text-sm font-semibold ${hookStyle === id ? "text-white" : "text-zinc-400"}`}>{label}</p>
                        <p className="text-xs text-zinc-500 mt-1">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-white text-black hover:bg-zinc-200 transition-colors"
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
        <div className="mb-10 text-left flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Script Studio
          </h1>
          <p className="text-sm text-zinc-400">Generate high-converting scripts matching your exact tone and style.</p>
        </div>

        {/* Modular Two-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[480px_1fr] gap-10 items-start">
          <InputPanel 
            activeMode={activeMode} setActiveMode={setActiveMode}
            videoTitle={videoTitle} setVideoTitle={setVideoTitle}
            contentBlueprint={contentBlueprint} setContentBlueprint={setContentBlueprint}
            isExtractingOutline={isExtractingOutline} handleGenerateOutline={handleGenerateOutline}
            personalityDna={personalityDna} setPersonalityDna={setPersonalityDna}
            isSheetOpen={isSheetOpen} setIsSheetOpen={setIsSheetOpen}
            savedDnas={savedDnas} handleDeleteDna={handleDeleteDna} isDnaLoaded={isDnaLoaded}
            youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl}
            handleAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} analyzeError={analyzeError}
            showSaveModal={showSaveModal} setShowSaveModal={setShowSaveModal}
            newDnaName={newDnaName} setNewDnaName={setNewDnaName} handleSaveDna={handleSaveDna} isSavingDna={isSavingDna}
            setShowSettings={setShowSettings} toneLevel={toneLevel} toneLabels={toneLabels} hookStyle={hookStyle} HOOK_STYLES={HOOK_STYLES}
            canGenerate={Boolean(canGenerate)} isGenerating={isGenerating} handleGenerate={handleGenerate}
          />
          <ScriptEditor 
            videoTitle={videoTitle}
            generatedScript={generatedScript}
            setGeneratedScript={setGeneratedScript}
            isGenerating={isGenerating}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isCopied={isCopied}
            handleDownload={handleDownload}
            handleCopy={handleCopy}
            hookStyle={hookStyle}
            HOOK_STYLES={HOOK_STYLES}
            markdownComponents={markdownComponents}
          />
        </div>
      </div>
    </div>
  );
}
