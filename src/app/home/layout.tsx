'use client'

import AnimatedBackground from "@/app/home/_components/AnimatedBackground";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col text-foreground antialiased selection:bg-primary/20 selection:text-primary overflow-x-hidden relative">
      {/* Dynamic GSAP & SVG Background */}
      <AnimatedBackground />

      {/* Top Status & System Bar */}
      <header className="w-full border-b border-border/60 bg-background/60 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div
              className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shadow-sm group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              🧭
            </div>
            <span className="font-heading font-bold text-lg tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground via-foreground/90 to-foreground/70">
              KisanDisha
            </span>
          </Link>

          {/* System Live Indicators + User Navigation */}
          <div className="flex items-center gap-3">
            {/* Live Indicator Badge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/60 border border-border/80 text-xs font-mono text-muted-foreground cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Agmarknet Live Sync</span>
            </div>

            <div className="h-4 w-px bg-border/60 hidden sm:block" />

            {/* User Profile Button */}
            <Link
              href="/home/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border/60 text-xs font-medium text-foreground transition-colors"
              title="View Profile"
            >
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Profile</span>
            </Link>

            {/* Logout Action Button */}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
          </div>
        </div>
      </header>

      {/* Main Content Area framed with layout crosshairs */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 flex flex-col">
        {/* Decorative Technical Crosshairs on Corners */}
        <div className="hidden md:block absolute top-0 left-6 text-border/80 font-mono text-xs select-none pointer-events-none">
          +
        </div>
        <div className="hidden md:block absolute top-0 right-6 text-border/80 font-mono text-xs select-none pointer-events-none">
          +
        </div>

        <main className="flex-1 flex flex-col">{children}</main>

        <div className="hidden md:block absolute bottom-0 left-6 text-border/80 font-mono text-xs select-none pointer-events-none">
          +
        </div>
        <div className="hidden md:block absolute bottom-0 right-6 text-border/80 font-mono text-xs select-none pointer-events-none">
          +
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-4 bg-background/40 backdrop-blur-sm text-xs text-muted-foreground mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            &copy; {new Date().getFullYear()} KisanDisha - AI Market Intelligence for Indian Farmers
          </p>
          <p className="font-mono text-[11px] hover:text-primary cursor-default">
            Grounded in Official Agmarknet Government Data
          </p>
        </div>
      </footer>
    </div>
  );
}