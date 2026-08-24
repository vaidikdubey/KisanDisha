import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto_Slab } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import AnimatedBackground from "@/components/AnimatedBackground";

const robotoSlabHeading = Roboto_Slab({
    subsets: ["latin"],
    variable: "--font-heading",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "KisanDisha - AI-Powered Market Intelligence for Farmers",
    description:
        "AI-powered market price intelligence platform for Indian farmers using real government mandi data, price comparison, and a Gemini-powered selling advisor.",
    keywords: [
        "Agritech",
        "Mandi Prices",
        "Gemini AI",
        "Market Intelligence",
        "AI Agent",
        "Farmers India",
        "TypeScript",
    ],
    authors: [{ name: "Vaidik Dubey" }],
    openGraph: {
        title: "KisanDisha - AI-Powered Market Intelligence for Farmers",
        description:
            "Compare real mandi prices across markets and ask an AI advisor where to sell your crop, grounded in live government data.",
        type: "website",
        siteName: "KisanDisha",
    },
    twitter: {
        card: "summary_large_image",
        title: "KisanDisha - AI-Powered Market Intelligence for Farmers",
        description:
            "AI-powered mandi price comparison and selling advisor for Indian farmers, built with Gemini and real market data.",
    },
    icons: {
        icon: "/favicon.svg",
    },
};

export default function RootLayout({ children }: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={cn(
                "h-full",
                "antialiased",
                geistSans.variable,
                geistMono.variable,
                "font-sans",
                inter.variable,
                robotoSlabHeading.variable,
            )}
        >
            <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary overflow-x-hidden relative">
                {/* Dynamic GSAP & SVG Background */}
                <AnimatedBackground />

                {/* Top Status & System Bar */}
                <header className="w-full border-b border-border/60 bg-background/60 backdrop-blur-md sticky top-0 z-50 transition-all">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                        {/* Brand Logo & Name */}
                        <div className="flex items-center gap-2.5 cursor-default">
                            <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shadow-sm">
                                🧭
                            </div>
                            <span className="font-heading font-bold text-lg tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground via-foreground/90 to-foreground/70">
                                KisanDisha
                            </span>
                        </div>

                        {/* System Live Indicators (Recruiter / Tech Polish) */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/60 border border-border/80 text-xs font-mono text-muted-foreground hover:bg-emerald-400/25 cursor-default">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span>Agmarknet Live Sync</span>
                            </div>
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

                {/* Subtitle Grounding Footer Shell */}
                <footer className="w-full border-t border-border/40 py-4 bg-background/40 backdrop-blur-sm text-xs text-muted-foreground">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <p>
                            &copy; {new Date().getFullYear()} KisanDisha - AI
                            Market Intelligence for Indian Farmers
                        </p>
                        <p className="font-mono text-[11px] hover:text-primary cursor-default">
                            Grounded in Official Agmarknet Government Data
                        </p>
                    </div>
                </footer>

                <Toaster />
            </body>
        </html>
    );
}
