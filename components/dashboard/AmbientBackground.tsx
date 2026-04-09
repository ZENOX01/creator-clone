export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0a0a0a]">
      {/* Vercel-style 1px Grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem]"
        style={{
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 10%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 10%, transparent 100%)',
        }}
      />
      
      {/* Slow Moving Abstract Glows - Pro colors (Slate / Indigo / Purple) but very faint */}
      <div className="absolute top-[-20%] left-[10%] w-[600px] h-[500px] bg-indigo-500/[0.04] blur-[120px] rounded-[100%] mix-blend-screen animate-pulse duration-[10000ms]" />
      <div className="absolute bottom-[0%] right-[10%] w-[500px] h-[400px] bg-slate-500/[0.05] blur-[100px] rounded-[100%] mix-blend-screen animate-pulse duration-[8000ms]" />
      
      {/* Central subtle highlight for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-zinc-600/[0.02] blur-[100px] rounded-full" />
    </div>
  );
}
