import { UserButton } from "@clerk/nextjs";
import { Terminal, Zap } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  credits: number | null;
}

export function Navbar({ credits }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-950 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden group-hover:border-white/20 transition-all duration-300">
            {/* Subtle inner animated glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Terminal className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors relative z-10" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white hidden sm:block">
            Creator Clone
          </span>
        </Link>
        
        {/* Right side nav items */}
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="https://x.com/ZenoBuildsAI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden md:block"
          >
            Feedback
          </a>
          <a
            href="https://x.com/ZenoBuildsAI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex md:hidden items-center justify-center p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <Zap className="w-4 h-4 text-zinc-400" />
          </a>

          {/* Premium Credits Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <div className={`w-1.5 h-1.5 rounded-full ${credits && credits > 0 ? 'bg-zinc-300' : 'bg-red-500'}`} />
            <span className="text-xs font-semibold text-zinc-300">
              {credits !== null ? credits : "..."} <span className="text-zinc-500 font-medium">Credits</span>
            </span>
          </div>
          
          {/* Clerk Profile */}
          <div className="rounded-full">
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 border border-white/10" } }} />
          </div>
        </div>
      </div>
    </nav>
  );
}
