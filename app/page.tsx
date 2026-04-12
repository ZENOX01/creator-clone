"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Terminal, Zap, ShieldAlert, Cpu, Sparkles, Youtube, ArrowRight, Check } from "lucide-react";
import { motion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

// Framer animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Use springs for ultra-smooth cursor tracking
  const springX = useSpring(0, { stiffness: 50, damping: 20, mass: 0.5 });
  const springY = useSpring(0, { stiffness: 50, damping: 20, mass: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      springX.set(e.clientX - 400); // 400 is half the width of the spotlight
      springY.set(e.clientY - 400);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [springX, springY]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#050505]">
      
      {/* Interactive Cursor Spotlight */}
      <motion.div
        style={{ x: springX, y: springY }}
        className="absolute top-0 left-0 w-[800px] h-[800px] bg-white/[0.04] rounded-full blur-[120px] mix-blend-screen"
      />

      {/* Deep Space Animated Orbs (Background ambient) */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-zinc-600/[0.05] blur-[120px] rounded-full mix-blend-screen"
      />
      
      <motion.div
        animate={{
          x: [0, -150, 50, 0],
          y: [0, 50, -150, 0],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-indigo-600/[0.03] blur-[150px] rounded-full mix-blend-screen"
      />

      {/* Panning Grid - Very subtle but creates forward motion */}
      <motion.div
        animate={{ y: [0, 24] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-100%] h-[300%] bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:24px_24px]"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 30%, #000 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 30%, #000 30%, transparent 100%)',
        }}
      />
    </div>
  );
};

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-white overflow-x-hidden relative">

      <AnimatedBackground />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden group-hover:border-white/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Terminal className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors relative z-10" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white hidden sm:block">
              Creator Clone
            </span>
          </div>
          <div>
            {isSignedIn ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="[&>button]:bg-transparent [&>button]:border-0 [&>button]:text-sm [&>button]:font-medium [&>button]:text-zinc-400 hover:[&>button]:text-white [&>button]:transition-colors [&>button]:cursor-pointer">
                <SignInButton fallbackRedirectUrl="/dashboard" mode="modal">Sign In</SignInButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <main className="container mx-auto px-6 pt-24 pb-32 md:pt-32 relative z-10 flex flex-col items-center text-center">
        
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center max-w-4xl">
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 mb-8 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-zinc-300 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" /> Stop sounding like every other creator.
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 leading-[1.1] text-white">
            Stop Formulating Scripts.<br className="hidden md:block" />
            <span className="text-zinc-400">
              Start Cloning Your Voice.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p variants={fadeUp} className="text-base md:text-lg text-zinc-400 max-w-2xl mb-12 leading-relaxed">
            You already have a unique voice. Creator Clone extracts your exact personality DNA from any YouTube video and writes scripts that sound <span className="text-white font-medium">genuinely like you</span> — skipping the corporate AI filler entirely.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp}>
            {isSignedIn ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-col items-center">
                <div className="[&>button]:px-6 [&>button]:py-3 [&>button]:bg-white [&>button]:text-black [&>button]:text-sm [&>button]:font-semibold [&>button]:rounded-lg [&>button]:cursor-pointer [&>button]:border-0 [&>button]:outline-none [&>button]:transition-colors hover:[&>button]:bg-zinc-200 [&>button]:shadow-sm">
                  <SignUpButton fallbackRedirectUrl="/dashboard" mode="modal">Start For Free</SignUpButton>
                </div>
                <p className="mt-4 text-xs text-zinc-500 font-medium">No credit card required.</p>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* ── SEE IT IN ACTION ── */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl mt-32 mb-12"
        >
          <p className="text-xs font-semibold text-zinc-500 mb-6 uppercase tracking-widest text-center">See it in action</p>
          <div className="w-full relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.05)] bg-[#050505] flex justify-center group">
            {/* Native Video Embed inside sleek framer wrapper */}
            <video 
              src="https://cmrhykhdgykmvsfeqdho.supabase.co/storage/v1/object/public/media/website%20video.mp4" 
              controls
              playsInline 
              className="w-full h-auto object-cover outline-none" 
            />
            {/* Sleek Vercel-style Inner Gradient Edge Highlight */}
            <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none mix-blend-overlay shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" />
          </div>
        </motion.div>

        {/* ── HOW IT WORKS ── */}
        <div className="w-full max-w-4xl mt-24 mb-16">
          <motion.p 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-sm font-semibold text-zinc-400 mb-10 text-center"
          >
            How it works
          </motion.p>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
          >
            {/* Step 1 */}
            <motion.div variants={fadeUp} className="relative flex flex-col gap-3 p-6 border border-white/10 rounded-2xl bg-[#111] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <span className="text-sm font-bold text-zinc-300">1</span>
                </div>
                <Youtube className="w-5 h-5 text-zinc-500" />
              </div>
              <h3 className="font-semibold text-white text-base">Paste a YouTube link</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Drop in any video from your channel. We handle the heavy lifting of parsing up to hours of audio.</p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeUp} className="relative flex flex-col gap-3 p-6 border border-white/10 rounded-2xl bg-[#111] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <span className="text-sm font-bold text-zinc-300">2</span>
                </div>
                <Cpu className="w-5 h-5 text-zinc-500" />
              </div>
              <h3 className="font-semibold text-white text-base">Extract your DNA</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Our AI dissects your exact tone, pacing, humor, and vocabulary into a precise, reusable profile.</p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeUp} className="relative flex flex-col gap-3 p-6 border border-white/10 rounded-2xl bg-[#111] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <span className="text-sm font-bold text-zinc-300">3</span>
                </div>
                <Zap className="w-5 h-5 text-zinc-500" />
              </div>
              <h3 className="font-semibold text-white text-base">Generate lethal scripts</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Enter your next topic. Get a full, retention-optimized script that completely matches your brand.</p>
            </motion.div>
          </motion.div>
        </div>

        {/* ── FEATURES ── */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mt-20"
        >
          {/* Feature 1 */}
          <motion.div variants={fadeUp} className="flex flex-col items-start text-left p-8 rounded-2xl border border-white/10 bg-[#111] hover:bg-[#151515] hover:border-white/20 transition-all">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center mb-6 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] group-hover:border-zinc-400/50 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Youtube className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors relative z-10" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">1-Click Tone Extraction</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Paste a URL, we do the rest. No manual prompting required. Your exact style gets locked in automatically.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={fadeUp} className="flex flex-col items-start text-left p-8 rounded-2xl border border-white/10 bg-[#111] hover:bg-[#151515] hover:border-white/20 transition-all">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center mb-6 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] group-hover:border-zinc-400/50 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <ShieldAlert className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors relative z-10" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Zero Corporate Fluff</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              No stiff AI-speak. No filler intros. Only authentic, brutally direct scripts that match your actual energy.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={fadeUp} className="flex flex-col items-start text-left p-8 rounded-2xl border border-white/10 bg-[#111] hover:bg-[#151515] hover:border-white/20 transition-all md:col-span-2 lg:col-span-1">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 flex items-center justify-center mb-6 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] group-hover:border-zinc-400/50 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Cpu className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors relative z-10" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Built for Retention</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Optimized pacing and hooks for Shorts and Long-form. Engineered to grab maximum attention.
            </p>
          </motion.div>
        </motion.div>

        {/* ── PROOF POINTS ── */}
        <motion.div 
           initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
           className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-20 text-sm font-medium text-zinc-500"
        >
          {["Works with any YouTube channel", "Shorts & Long-form support", "Powered by Gemini 2.5 Flash", "Free to get started"].map(point => (
            <div key={point} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-zinc-400" />
              <span>{point}</span>
            </div>
          ))}
        </motion.div>

        {/* ── BOTTOM CTA ── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="mt-32 flex flex-col items-center gap-6 border-t border-white/10 pt-16 w-full max-w-xl"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center text-white">
            Ready to sound like <span className="text-zinc-400">yourself?</span>
          </h2>
          <p className="text-zinc-500 text-sm text-center max-w-sm mb-2">Join creators who stopped sounding generic and started building real audiences.</p>
          {isSignedIn ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="[&>button]:px-6 [&>button]:py-3 [&>button]:bg-white [&>button]:text-black [&>button]:text-sm [&>button]:font-semibold [&>button]:rounded-lg [&>button]:cursor-pointer [&>button]:border-0 [&>button]:outline-none [&>button]:transition-colors hover:[&>button]:bg-zinc-200 [&>button]:shadow-sm">
              <SignUpButton fallbackRedirectUrl="/dashboard" mode="modal">Start For Free ⚡</SignUpButton>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
