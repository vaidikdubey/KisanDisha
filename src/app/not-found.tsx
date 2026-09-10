import Link from "next/link";
import { Home, Bot, Compass, LineChart, Navigation } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8">
            {/* Decorative Technical Grid Background Highlights */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-xl w-full text-center space-y-8">
                {/* Error Status Code Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                    <Compass
                        className="w-3.5 h-3.5 animate-spin"
                        style={{ animationDuration: "6s" }}
                    />
                    <span>Error 404 • Route Uncharted</span>
                </div>

                {/* Big Heading & Narrative Graphic Text */}
                <div className="space-y-3">
                    <h1 className="text-7xl sm:text-8xl font-extrabold font-mono tracking-tighter text-foreground/20">
                        404
                    </h1>
                    <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
                        Lost in the Fields?
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        The route or resource you are searching for doesn&apos;t
                        exist or has been relocated in our registry.
                    </p>
                </div>

                {/* Core Actions Card Container */}
                <div className="p-6 rounded-2xl border border-border/60 bg-background/60 backdrop-blur-md shadow-sm space-y-4">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        Re-orient your navigation
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* CTA 1: Back to Home Page */}
                        <Link
                            href="/home"
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-xs shadow-md hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            replace={true}
                        >
                            <Home className="w-4 h-4" />
                            <span>Back to Home</span>
                        </Link>

                        {/* CTA 2: Consult AI Advisor / Chat */}
                        <Link
                            href="/chat"
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                            replace={true}
                        >
                            <Bot className="w-4 h-4" />
                            <span>Ask AI Advisor</span>
                        </Link>
                    </div>

                    {/* Quick Deep Link Row */}
                    <div className="pt-4 border-t border-border/40 flex items-center justify-center gap-4 text-xs font-mono text-muted-foreground">
                        <span>Or explore:</span>
                        <Link
                            href="/prices"
                            className="hover:text-primary transition-colors flex items-center gap-1"
                            replace={true}
                        >
                            <LineChart className="w-3.5 h-3.5" /> Prices
                        </Link>
                        <span>•</span>
                        <Link
                            href="/nearby"
                            className="hover:text-primary transition-colors flex items-center gap-1"
                            replace={true}
                        >
                            <Navigation className="w-3.5 h-3.5" /> Nearby
                        </Link>
                    </div>
                </div>

                {/* Technical Footer / Disclaimer */}
                <p className="text-[11px] font-mono text-muted-foreground/70">
                    KisanDisha Decision Support System • Grounded Agmarknet Data
                </p>
            </div>
        </div>
    );
}
