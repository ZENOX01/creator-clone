"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Terminal, Zap, ShieldAlert, Cpu, Sparkles, Youtube, ArrowRight, Check } from "lucide-react";
import { Tweet } from "react-tweet";

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono selection:bg-cyan-500/30 overflow-x-hidden relative">

      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10"></div>

      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

      {/* ── HEADER ── */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-cyan-400" />
          <span className="text-xl md:text-2xl font-black tracking-tighter">
            CREATOR <span className="text-cyan-400">CLONE</span>
          </span>
        </div>
        <div>
          {isSignedIn ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-cyan-400 border border-cyan-500/40 px-4 py-2 rounded hover:bg-cyan-500/10 transition-all"
            >
              Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="[&>button]:bg-transparent [&>button]:border-0 [&>button]:text-sm [&>button]:font-bold [&>button]:uppercase [&>button]:tracking-widest [&>button]:text-[#888] hover:[&>button]:text-white [&>button]:transition-colors [&>button]:cursor-pointer">
              <SignInButton fallbackRedirectUrl="/dashboard" mode="modal">Sign In</SignInButton>
            </div>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <main className="container mx-auto px-6 pt-16 pb-24 md:pt-28 relative z-10 flex flex-col items-center text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-bold uppercase tracking-widest text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" /> Tired of sounding like every other creator?
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-[1.08]">
          Stop Writing Scripts.<br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
            Start Cloning Your Voice.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base md:text-lg text-[#888] max-w-xl mb-4 leading-relaxed">
          You already have a unique voice. Creator Clone extracts your exact personality DNA from any YouTube video and writes scripts that sound <span className="text-white font-bold">genuinely like you</span> — not like ChatGPT had a caffeine overdose.
        </p>
        <p className="text-sm text-[#555] max-w-lg mb-10 leading-relaxed">
          No templates. No corporate tone. No &quot;Welcome back to my channel.&quot; Just raw, retention-engineered scripts built around how <em>you</em> actually talk.
        </p>

        {/* CTA */}
        {isSignedIn ? (
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3 px-8 py-4 bg-[#eaff00] text-black font-black uppercase tracking-widest text-lg rounded-sm hover:-translate-y-1 transition-all duration-300 shadow-[0_0_30px_rgba(234,255,0,0.2)] hover:shadow-[0_0_50px_rgba(234,255,0,0.4)]"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="[&>button]:px-8 [&>button]:py-4 [&>button]:bg-[#eaff00] [&>button]:text-black [&>button]:font-black [&>button]:uppercase [&>button]:tracking-widest [&>button]:text-lg [&>button]:rounded-sm [&>button]:cursor-pointer [&>button]:border-0 [&>button]:outline-none [&>button]:transition-all [&>button]:duration-300 hover:[&>button]:-translate-y-1 [&>button]:shadow-[0_0_30px_rgba(234,255,0,0.2)] hover:[&>button]:shadow-[0_0_50px_rgba(234,255,0,0.4)]">
            <SignUpButton fallbackRedirectUrl="/dashboard" mode="modal">Clone Your Brain — Start Free ⚡</SignUpButton>
          </div>
        )}

        <p className="mt-4 text-xs text-[#444] uppercase tracking-widest">Free to start. No credit card required.</p>

        {/* ── SEE IT IN ACTION ── */}
        <div className="w-full max-w-lg mt-28 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-6">See it in action</p>
          <div className="w-full rounded-2xl overflow-hidden border border-[#1a1a1a] shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-transparent flex justify-center [&>div]:max-w-none">
            <div data-theme="dark" className="w-full flex justify-center">
              <Tweet id="2037355172679315688" />
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="w-full max-w-3xl mt-16 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#555] mb-10">How it works — 3 steps, 60 seconds</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">

            {/* Step 1 */}
            <div className="relative flex flex-col gap-3 p-6 border border-[#1a1a1a] rounded-xl bg-[#0a0a0a]">
              <span className="text-4xl font-black text-[#1a1a1a]">01</span>
              <Youtube className="w-5 h-5 text-cyan-400 -mt-2" />
              <h3 className="font-bold text-white text-base">Paste a YouTube link</h3>
              <p className="text-[#888] text-sm leading-relaxed">Drop in any video from your channel. We handle everything else.</p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col gap-3 p-6 border border-[#1a1a1a] rounded-xl bg-[#0a0a0a]">
              <span className="text-4xl font-black text-[#1a1a1a]">02</span>
              <Cpu className="w-5 h-5 text-purple-400 -mt-2" />
              <h3 className="font-bold text-white text-base">Extract your personality DNA</h3>
              <p className="text-[#888] text-sm leading-relaxed">Our AI dissects your tone, pacing, humor, and vocabulary into a precise profile.</p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col gap-3 p-6 border border-[#1a1a1a] rounded-xl bg-[#0a0a0a]">
              <span className="text-4xl font-black text-[#1a1a1a]">03</span>
              <Zap className="w-5 h-5 text-[#eaff00] -mt-2" />
              <h3 className="font-bold text-white text-base">Generate lethal scripts</h3>
              <p className="text-[#888] text-sm leading-relaxed">Enter your topic. Get a full, retention-optimized script — in your voice. Done.</p>
            </div>

          </div>
        </div>

        {/* ── FEATURES ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-20">

          {/* Feature 1 */}
          <div className="flex flex-col items-start text-left p-8 rounded-xl border border-[#1a1a1a] bg-[#090909] hover:border-cyan-500/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-cyan-500/10 transition-colors"></div>
            <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-5 border border-cyan-500/20 group-hover:scale-110 transition-transform relative z-10">
              <Youtube className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white relative z-10">1-Click Tone Extraction</h3>
            <p className="text-[#888] text-sm leading-relaxed relative z-10">
              Paste a URL, we do the rest. No manual prompting, no guesswork. Your exact style gets locked in automatically.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-start text-left p-8 rounded-xl border border-[#1a1a1a] bg-[#090909] hover:border-purple-500/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-purple-500/10 transition-colors"></div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-5 border border-purple-500/20 group-hover:scale-110 transition-transform relative z-10">
              <ShieldAlert className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white relative z-10">Zero Corporate Fluff</h3>
            <p className="text-[#888] text-sm leading-relaxed relative z-10">
              No stiff AI-speak. No filler intros. Only authentic, brutally direct scripts that actually match your energy.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-start text-left p-8 rounded-xl border border-[#1a1a1a] bg-[#090909] hover:border-[#eaff00]/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#eaff00]/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#eaff00]/10 transition-colors"></div>
            <div className="w-12 h-12 bg-[#eaff00]/10 rounded-lg flex items-center justify-center mb-5 border border-[#eaff00]/20 group-hover:scale-110 transition-transform relative z-10">
              <Cpu className="w-6 h-6 text-[#eaff00]" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-white relative z-10">Built for Retention</h3>
            <p className="text-[#888] text-sm leading-relaxed relative z-10">
              Optimized pacing and hooks for Shorts and Long-form. Every script is engineered to grab attention in the first 3 seconds.
            </p>
          </div>

        </div>

        {/* ── PROOF POINTS ── */}
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mt-16 text-sm text-[#555]">
          {["Works with any YouTube channel", "Shorts & Long-form support", "Powered by Gemini AI", "Free to get started"].map(point => (
            <div key={point} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-500" />
              <span>{point}</span>
            </div>
          ))}
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="mt-24 flex flex-col items-center gap-6 border-t border-[#111] pt-16 w-full max-w-xl">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">
            Ready to sound like <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">yourself?</span>
          </h2>
          <p className="text-[#888] text-sm text-center max-w-sm">Join creators who stopped sounding generic and started building real audiences.</p>
          {isSignedIn ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-8 py-4 bg-[#eaff00] text-black font-black uppercase tracking-widest text-base rounded-sm hover:-translate-y-1 transition-all duration-300 shadow-[0_0_30px_rgba(234,255,0,0.2)] hover:shadow-[0_0_50px_rgba(234,255,0,0.4)]"
            >
              Open Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="[&>button]:px-8 [&>button]:py-4 [&>button]:bg-[#eaff00] [&>button]:text-black [&>button]:font-black [&>button]:uppercase [&>button]:tracking-widest [&>button]:text-base [&>button]:rounded-sm [&>button]:cursor-pointer [&>button]:border-0 [&>button]:outline-none [&>button]:transition-all [&>button]:duration-300 hover:[&>button]:-translate-y-1 [&>button]:shadow-[0_0_30px_rgba(234,255,0,0.2)] hover:[&>button]:shadow-[0_0_50px_rgba(234,255,0,0.4)]">
              <SignUpButton fallbackRedirectUrl="/dashboard" mode="modal">Get Started Free ⚡</SignUpButton>
            </div>
          )}
        </div>

      </main>

      {/* ── FOOTER ── */}
      <footer className="container mx-auto px-6 py-8 flex items-center justify-between border-t border-[#111] relative z-10">
        <div className="flex items-center gap-2 text-[#333]">
          <Terminal className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest uppercase">Creator Clone</span>
        </div>
        <p className="text-xs text-[#333]">Built for creators who are serious about growth.</p>
      </footer>

    </div>
  );
}
