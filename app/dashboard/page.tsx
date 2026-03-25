"use client";

import { useState } from "react";
import { Loader2, Terminal, Zap, ShieldAlert, Copy, Check, Youtube } from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function Home() {
  const [videoTitle, setVideoTitle] = useState("");
  const [personalityDna, setPersonalityDna] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<'shorts' | 'long-form'>('shorts');
  const {isSignedIn} = useAuth();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");

  const handleAnalyze = async () => {
    if (!youtubeUrl.trim()) return;
    setIsAnalyzing(true);
    setAnalyzeError("");
    try {
      const response = await fetch("/api/analyze-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze video");
      }

      setPersonalityDna(data.dna);
    } catch (error) {
      console.error("[ANALYZE_ERROR]", error);
      setAnalyzeError(error instanceof Error ? error.message : "Failed to analyze video");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!videoTitle.trim() || !personalityDna.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: videoTitle,
          dna: personalityDna,
          mode: activeMode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate script");
      }

      setGeneratedScript(data.script);
    } catch (error) {
      console.error("[GENERATE_ERROR]", error);
      setGeneratedScript(`[SYSTEM ERROR]: ${error instanceof Error ? error.message : "Connection failed"}\n\n[CONNECTION TERMINATED]`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen font-mono selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col items-center">
      {/* Grid background for hacker vibe */}
      <div className="hacker-bg"></div>

      <main className="relative z-10 w-full max-w-4xl px-4 py-12 md:py-20 flex flex-col gap-6 md:gap-10">
        {/* Header */}
        <header className="flex flex-col gap-5 border-b border-[#1f1f1f] pb-8 md:pb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-cyan-400">
              <Terminal className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xs md:text-sm font-bold tracking-widest uppercase">System Core v1.0.0</span>
            </div>
            
            {/* Auth Area */}
            <div className="flex flex-shrink-0 items-center gap-4">
              {isSignedIn ? (
                <div className="p-0.5 rounded-full aspect-square flex-shrink-0 flex items-center justify-center ring-2 ring-cyan-500/30 hover:ring-cyan-400/60 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 md:w-12 md:h-12 aspect-square flex-shrink-0" } }} />
                </div>
              ) : (
                <div className="bg-transparent border border-cyan-500/50 text-cyan-400 px-4 py-2 text-xs md:text-sm rounded font-bold uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                  <SignInButton mode="modal" />
                </div>
              )}
            </div>
          </div>
          <h1 className="creator-title">
            The Creator <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Clone</span>
          </h1>
          <p className="text-[#888] text-base md:text-lg max-w-2xl leading-relaxed mt-2">
            AI scriptwriter matching your exact personality vector. Input your parameters. Generate lethal content. No corporate fluff.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex w-full border-b border-[#222]">
          <button
            onClick={() => setActiveMode('shorts')}
            className={`flex-1 py-4 text-xs md:text-sm font-bold tracking-widest uppercase transition-all duration-300 relative ${activeMode === 'shorts'
                ? 'text-white'
                : 'text-[#555] hover:text-[#888]'
              }`}
          >
            Shorts
            {activeMode === 'shorts' && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveMode('long-form')}
            className={`flex-1 py-4 text-xs md:text-sm font-bold tracking-widest uppercase transition-all duration-300 relative ${activeMode === 'long-form'
                ? 'text-white'
                : 'text-[#555] hover:text-[#888]'
              }`}
          >
            Long Form
            {activeMode === 'long-form' && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            )}
          </button>
        </div>

        {/* Form Container */}
        <div className="flex flex-col gap-8 md:gap-10 mt-2">
          {/* Video Title */}
          <div className="flex flex-col gap-3">
            <label htmlFor="videoTitle" className="text-xs md:text-sm font-bold uppercase tracking-widest text-cyan-500 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {activeMode === 'shorts' ? 'Short Idea / Hook Target' : 'Deep Dive Topic'}
            </label>
            <input
              id="videoTitle"
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="e.g. Why 99% of Developers Fail..."
              className="creator-input"
            />
          </div>

          {/* YouTube Auto-Analyzer */}
          <div className="flex flex-col gap-3">
            <label htmlFor="youtubeUrl" className="text-xs md:text-sm font-bold uppercase tracking-widest text-cyan-500 flex items-center gap-2">
              <Youtube className="w-4 h-4" />
              Auto-Extract Tone
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="youtubeUrl"
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Optional: Paste a YouTube link to auto-extract tone"
                className="creator-input flex-1"
                disabled={isAnalyzing}
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !youtubeUrl.trim()}
                className="bg-transparent border border-cyan-500/50 text-cyan-400 px-4 py-3 sm:py-2 text-xs md:text-sm rounded font-bold uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Tone"
                )}
              </button>
            </div>
            {analyzeError && (
              <span className="text-xs font-bold text-red-500 animate-pulse mt-1">
                {analyzeError}
              </span>
            )}
          </div>

          {/* Personality DNA */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label htmlFor="personalityDna" className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#eab308] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Personality DNA
              </label>
              <span className={`text-xs font-bold ${personalityDna.length > 900 ? 'text-red-500 animate-pulse' : 'text-[#555]'}`}>
                {personalityDna.length} / 1000 MAX
              </span>
            </div>
            <textarea
              id="personalityDna"
              value={personalityDna}
              onChange={(e) => setPersonalityDna(e.target.value)}
              maxLength={1000}
              placeholder="Describe the pacing, the tone, the exact phrasing. Are you aggressive? Analytical? Do you use analogies? Be brutally honest about how you sound."
              className="creator-textarea"
            />
          </div>

          {/* Generate Button */}
          {isSignedIn && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !videoTitle.trim() || !personalityDna.trim()}
            className="creator-button group"
          >
            <div className="creator-button-sweep"></div>
            <span className="relative flex items-center justify-center gap-3">
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
                  Compiling Sequence...
                </>
              ) : (
                "Generate Script"
              )}
            </span>
          </button>
          )}
        </div>

        {/* Output Area */}
        {generatedScript && (
          <div className="mt-4 md:mt-8 flex flex-col gap-4 fade-in-anim">
            <div className="flex items-center justify-between border-b border-[#222] pb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-500 flex items-center gap-2">
                <Terminal className="w-3 h-3 md:w-4 md:h-4" />
                Output_Stream
              </span>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#555] hidden sm:block">
                  Status: Rendered
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-transparent hover:bg-white/5 transition-colors px-2 py-1 rounded cursor-pointer group"
                  title="Copy to clipboard"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 md:w-4 md:h-4 text-[#39ff14]" />
                      <span className="text-[#39ff14]">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 md:w-4 md:h-4 text-[#555]" />
                      <span className="text-[#555] group-hover:text-[#888] transition-colors">COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="output-box">
              <div className="output-border"></div>
              <pre className="whitespace-pre-wrap text-[#d1d5db] font-mono text-xs md:text-sm leading-relaxed overflow-x-auto">
                {generatedScript}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
