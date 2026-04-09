import { Terminal, Check, Pencil, Download, Copy, Loader2 } from "lucide-react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface ScriptEditorProps {
  videoTitle: string;
  generatedScript: string;
  setGeneratedScript: (script: string) => void;
  isGenerating: boolean;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isCopied: boolean;
  handleDownload: () => void;
  handleCopy: () => void;
  hookStyle: string;
  HOOK_STYLES: { id: string; label: string }[];
  markdownComponents: Components;
}

export function ScriptEditor({
  videoTitle,
  generatedScript,
  setGeneratedScript,
  isGenerating,
  isEditing,
  setIsEditing,
  isCopied,
  handleDownload,
  handleCopy,
  hookStyle,
  HOOK_STYLES,
  markdownComponents
}: ScriptEditorProps) {
  return (
    <div className="flex flex-col gap-3 xl:sticky xl:top-24 h-fit">
      {/* Output header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
          <span className="hidden xs:inline">Generated Script</span>
        </div>
        {generatedScript && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                isEditing 
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" 
                  : "border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {isEditing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isEditing ? "Save" : "Edit"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
              title="Download as .txt"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
            >
              {isCopied ? (
                <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
              ) : (
                <><Copy className="w-3.5 h-3.5" /><span className="hidden sm:inline">Copy</span></>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Output Box */}
      <div className={`min-h-[500px] w-full rounded-xl border flex flex-col ${generatedScript
          ? "border-white/10 bg-[#111]"
          : "border-dashed border-white/10 bg-transparent"
        }`}>
        {isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-12 py-16">
            <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
            <div>
              <p className="text-base font-semibold text-white">Synthesizing</p>
              <p className="text-sm text-zinc-500 mt-1">Applying Tone & Hook...</p>
            </div>
          </div>
        ) : generatedScript ? (
          <div className={`overflow-y-auto max-h-[680px] font-sans text-base flex-1 flex flex-col ${isEditing ? 'p-0' : 'px-6 py-6'}`}>
            {isEditing ? (
              <textarea
                value={generatedScript}
                onChange={(e) => setGeneratedScript(e.target.value)}
                className="flex-1 w-full min-h-[400px] h-full bg-transparent text-zinc-200 resize-none outline-none p-6 leading-relaxed"
                autoFocus
              />
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {generatedScript}
              </ReactMarkdown>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8 opacity-40">
            <Terminal className="w-8 h-8 text-zinc-500" />
            <p className="text-sm font-medium text-zinc-500">Output will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
