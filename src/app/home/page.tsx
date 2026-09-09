import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  LineChart, 
  Navigation,
  CheckCircle2,
  TrendingUp,
  Store,
  MessageSquareText,
  MapPin,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8 py-2 sm:py-4 max-w-7xl mx-auto w-full">
      
      {/* 1. Header Welcome & Context Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-border/60 bg-background/50 backdrop-blur-md relative overflow-hidden shadow-sm">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Intelligence Active
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              • Decision Support System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-foreground">
            Market Intelligence Dashboard
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Select a module below to analyze historical mandi prices, find nearby high-value markets, or consult our AI selling advisor.
          </p>
        </div>

        {/* Tech Polish & Profile Shortcut */}
        <div className="flex items-center gap-3 shrink-0 z-10">
          <Link
            href="/home/profile"
            className="group flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 hover:border-primary/40 transition-all shadow-sm"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-left space-y-0.5">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                Your Preferences
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">
                Set home district & crops
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 2. Main Endpoints Grid (The 3 Core Modules) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* FEATURED CARD: AI Advisor (/chat) */}
        <Link 
          href="/chat"
          className="group relative rounded-2xl border border-emerald-500/30 bg-linear-to-b from-emerald-500/5 via-background/60 to-background/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                <Sparkles className="w-3 h-3" /> AI Powered
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold font-heading group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                AI Selling Advisor
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ask plain-language questions like <em>&ldquo;Where should I sell 500kg tomatoes for maximum profit?&rdquo;</em> and get grounded reasoning powered by Gemini API.
              </p>
            </div>

            {/* Natural Prompt Snippet */}
            <div className="space-y-1.5 pt-3 border-t border-border/40">
              <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                <MessageSquareText className="w-3 h-3" /> Sample Prompt:
              </p>
              <div className="p-2.5 rounded-xl bg-muted/50 border border-border/40 text-[11px] text-foreground/80 italic font-sans">
                &ldquo;Is it better to sell wheat in Bhopal today or transport it to Indore?&rdquo;
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between font-medium text-xs text-emerald-600 dark:text-emerald-400 group-hover:underline">
            <span>Launch Advisor</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* CARD 2: Nearby Mandis (/nearby) */}
        <Link 
          href="/nearby" 
          className="group relative rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Navigation className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Store className="w-3 h-3 text-primary" /> Proximity
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold font-heading group-hover:text-primary transition-colors">
                Nearby Market Discovery
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Find local and neighboring mandis prioritized by district proximity. Modal prices are ranked highest-first to help maximize net return.
              </p>
            </div>

            {/* Feature Highlights */}
            <ul className="space-y-1.5 pt-3 border-t border-border/40 text-xs text-muted-foreground font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>District-First Tiering</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Modal Price Ranking</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 flex items-center justify-between font-medium text-xs text-foreground group-hover:text-primary group-hover:underline">
            <span>Find Nearby Rates</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* CARD 3: Price Analytics (/prices) */}
        <Link 
          href="/prices" 
          className="group relative rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <LineChart className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-primary" /> Analytics
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold font-heading group-hover:text-primary transition-colors">
                Mandi Price Analytics
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Filter daily Agmarknet data by crop, state, district, and date range. View min, max, and average prices alongside interactive historical charts.
              </p>
            </div>

            {/* Feature Highlights */}
            <ul className="space-y-1.5 pt-3 border-t border-border/40 text-xs text-muted-foreground font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Mininum, Maximum and Average Prices</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Historical Price Trajectories</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 flex items-center justify-between font-medium text-xs text-foreground group-hover:text-primary group-hover:underline">
            <span>Explore Price Data</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 3. Quick Commodity Navigation Bar */}
      <div className="p-5 rounded-xl border border-border/60 bg-background/40 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold font-heading text-foreground">
            Quick Commodity Analytics
          </p>
          <p className="text-[11px] text-muted-foreground font-mono">
            Jump directly into price trajectories for major agricultural crops:
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["Wheat", "Rice", "Tomato", "Potato", "Onion", "Soyabean"].map((crop) => (
            <Link
              key={crop}
              href={`/prices?commodity=${encodeURIComponent(crop)}`}
              className="px-3 py-1 rounded-lg bg-muted/60 hover:bg-primary/10 hover:border-primary/30 hover:text-primary border border-border/60 text-xs font-mono transition-colors text-foreground/90"
            >
              {crop}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}