import { Zap, FileText, Wand2, Loader2, ShieldAlert, Users, Check, ChevronRight, Save, X, Settings, Youtube, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dispatch, SetStateAction } from "react";

interface InputPanelProps {
  activeMode: "shorts" | "long-form";
  setActiveMode: (mode: "shorts" | "long-form") => void;
  videoTitle: string;
  setVideoTitle: (t: string) => void;
  contentBlueprint: string;
  setContentBlueprint: (c: string) => void;
  isExtractingOutline: boolean;
  handleGenerateOutline: () => void;
  personalityDna: string;
  setPersonalityDna: (d: string) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (v: boolean) => void;
  savedDnas: any[];
  handleDeleteDna: (id: string, e: any) => void;
  isDnaLoaded: boolean;
  youtubeUrl: string;
  setYoutubeUrl: (u: string) => void;
  handleAnalyze: () => void;
  isAnalyzing: boolean;
  analyzeError: string;
  showSaveModal: boolean;
  setShowSaveModal: (v: boolean) => void;
  newDnaName: string;
  setNewDnaName: (n: string) => void;
  handleSaveDna: () => void;
  isSavingDna: boolean;
  setShowSettings: (v: boolean) => void;
  toneLevel: number;
  toneLabels: Record<number, string>;
  hookStyle: string;
  HOOK_STYLES: { id: string; label: string }[];
  canGenerate: boolean;
  isGenerating: boolean;
  handleGenerate: () => void;
}

export function InputPanel({
  activeMode, setActiveMode,
  videoTitle, setVideoTitle,
  contentBlueprint, setContentBlueprint,
  isExtractingOutline, handleGenerateOutline,
  personalityDna, setPersonalityDna,
  isSheetOpen, setIsSheetOpen,
  savedDnas, handleDeleteDna, isDnaLoaded,
  youtubeUrl, setYoutubeUrl,
  handleAnalyze, isAnalyzing, analyzeError,
  showSaveModal, setShowSaveModal,
  newDnaName, setNewDnaName, handleSaveDna, isSavingDna,
  setShowSettings, toneLevel, toneLabels, hookStyle, HOOK_STYLES,
  canGenerate, isGenerating, handleGenerate
}: InputPanelProps) {
  return (
    <div className="flex flex-col gap-6 relative z-10 w-full">

      {/* Mode Selector */}
      <div className="flex p-1 bg-[#111] border border-white/10 rounded-xl gap-1">
        {(["shorts", "long-form"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
              activeMode === mode
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
          >
            {mode === "shorts" ? <Zap className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            {mode === "shorts" ? "Shorts / Reels" : "Long Form"}
          </button>
        ))}
      </div>

      {/* Topic Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="videoTitle" className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
          {activeMode === "shorts" ? "Hook / Short Idea" : "Video Topic"}
        </label>
        <input
          id="videoTitle"
          type="text"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          placeholder={activeMode === "shorts" ? "e.g. Why 99% of devs never go viral..." : "e.g. The complete guide to building a SaaS"}
          className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
        />
      </div>

      {/* Brain Dump & Outline */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            Brain Dump & Context
          </label>
          <button
            onClick={handleGenerateOutline}
            disabled={Boolean(videoTitle.trim().length === 0 || isExtractingOutline)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            title="Auto-generate an outline from the topic"
          >
            {isExtractingOutline ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            Auto-Outline
          </button>
        </div>
        <textarea
          value={contentBlueprint}
          onChange={(e) => setContentBlueprint(e.target.value)}
          placeholder="What exactly do you want to say? Drop your messy bullet points, stories, or jokes here."
          rows={5}
          className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-none leading-relaxed"
        />
      </div>

      {/* Personality DNA */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              Personality DNA
            </label>
            
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <button className="text-xs font-medium flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-md transition-colors text-zinc-300">
                  <Users className="w-3.5 h-3.5" /> Profiles ({savedDnas.length})
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#111] border-r border-white/10 w-[400px] sm:w-[500px] max-w-full overflow-y-auto">
                <SheetHeader className="mb-6 pt-4">
                  <SheetTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-zinc-400" /> Saved Profiles
                  </SheetTitle>
                  <p className="text-sm text-zinc-500">Select a profile to load its DNA instantly.</p>
                </SheetHeader>
                <div className="flex flex-col gap-3 pb-8">
                  {savedDnas.length === 0 ? (
                     <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                       <Users className="w-8 h-8 text-zinc-600 mb-2" />
                       <p className="text-sm text-zinc-400">No saved profiles yet.</p>
                     </div>
                  ) : (
                    savedDnas.map(sd => (
                      <div key={sd.id} className="group relative flex flex-col p-4 rounded-xl border border-white/10 bg-[#111] hover:bg-[#1a1a1a] transition-all">
                        <h4 className="text-sm font-semibold text-white mb-1.5">{sd.name}</h4>
                        <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed mb-4">{sd.dna}</p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
                          <button 
                            className="text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                            onClick={() => { setPersonalityDna(sd.dna); setIsSheetOpen(false); }}
                          >
                            Load <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => handleDeleteDna(sd.id, e)} className="text-zinc-600 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {isDnaLoaded && (
              <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-500" /> Loaded
              </span>
            )}
            <span className={`text-xs font-medium tabular-nums ${personalityDna.length > 850 ? "text-red-400" : "text-zinc-500"}`}>
              {personalityDna.length}/1000
            </span>
          </div>
        </div>

        {/* Auto-Extract Row */}
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="Paste YouTube URL to auto-extract tone..."
            disabled={isAnalyzing}
            className="flex-1 bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleAnalyze}
            disabled={Boolean(isAnalyzing || youtubeUrl.trim().length === 0)}
            className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold border border-white/10 text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4 text-zinc-400" />}
            {isAnalyzing ? "Scanning..." : "Extract"}
          </button>
        </div>

        {analyzeError && (
          <p className="text-sm text-red-500 mt-1">{analyzeError}</p>
        )}
        {personalityDna && !analyzeError && (
          <div className="flex items-center justify-between px-1 mt-1">
            <p className="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Ready
            </p>
            {showSaveModal ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={newDnaName}
                  onChange={e => setNewDnaName(e.target.value)}
                  placeholder="Name"
                  className="bg-[#111] border border-white/10 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-zinc-500 w-32"
                  autoFocus
                />
                <button 
                  onClick={handleSaveDna}
                  disabled={Boolean(isSavingDna || newDnaName.trim().length === 0)}
                  className="px-2 py-1 text-xs font-medium bg-white text-black hover:bg-zinc-200 rounded-md transition-all disabled:opacity-50"
                >
                  {isSavingDna ? <Loader2 className="w-3 h-3 animate-spin"/> : "Save"}
                </button>
                <button onClick={() => setShowSaveModal(false)} className="p-1 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveModal(true)}
                className="text-xs font-medium flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            )}
          </div>
        )}

        <textarea
          id="personalityDna"
          value={personalityDna}
          onChange={(e) => setPersonalityDna(e.target.value)}
          maxLength={1000}
          rows={5}
          placeholder="Or describe your style manually — aggressive, uses 'bro' a lot, never says 'Welcome back'..."
          className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-none leading-relaxed mt-1"
        />
      </div>

      {/* Settings preview strip */}
      <button
        onClick={() => setShowSettings(true)}
        className="flex items-center justify-between px-4 py-3 bg-[#111] border border-white/10 rounded-xl hover:bg-[#1a1a1a] transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
             <Settings className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">Generation Settings</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Tone: {toneLabels[toneLevel]} <span className="mx-1">•</span> Hook: {HOOK_STYLES.find(h => h.id === hookStyle)?.label}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
      </button>

      {/* Vercel-style Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className={`relative w-full py-4 rounded-xl font-semibold text-sm transition-all mt-4 ${canGenerate
            ? "bg-white text-black hover:bg-zinc-200 cursor-pointer shadow-sm"
            : "bg-[#111] border border-white/10 text-zinc-600 cursor-not-allowed"
          }`}
      >
        <span className="flex items-center justify-center gap-2">
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Synthesizing...</>
          ) : canGenerate ? (
            <>Generate Script <ChevronRight className="w-4 h-4" /></>
          ) : (
            "Complete inputs above to generate"
          )}
        </span>
      </button>

    </div>
  );
}
