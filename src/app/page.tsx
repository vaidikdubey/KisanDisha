"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TrendingUp, Bot, MapPin, Sun, ArrowRight } from "lucide-react";
import {FaGithub} from "react-icons/fa"

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      //0. Navbar Slide In Animation
      gsap.from(navRef.current, {
        y: -60,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });

      // 1. The Sunrise Reveal (Hero Section)
      gsap.from(".hero-element", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.2,
      });

      // 2. Sprouting Feature Cards (Scroll Animation)
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
        y: 80,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.2)",
      });

      // 3. Continuous Floating Icons
      gsap.to(".icon-float", {
        y: -6,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.3, // Offsets the floating so they don't move exactly together
      });

      // 4. Interactive Card Hover Effects
      const cards = gsap.utils.toArray<HTMLElement>(".feature-card");
      cards.forEach((card) => {
        const glow = card.querySelector(".card-bg-glow");
        
        card.addEventListener("mouseenter", () => {
          gsap.to(card, { scale: 1.03, duration: 0.4, ease: "power2.out", overwrite: "auto" });
          if (glow) gsap.to(glow, { opacity: 1, scale: 1.5, duration: 0.4, ease: "power2.out" });
        });
        
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { scale: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" });
          if (glow) gsap.to(glow, { opacity: 0, scale: 1, duration: 0.4, ease: "power2.out" });
        });
      });
    }, containerRef);

    return () => ctx.revert(); // Cleanup on unmount
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* Navigation */}
      <nav ref={navRef} className="flex flex-col gap-2 md:flex-row items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2 text-2xl font-bold text-primary">
          <Sun className="w-8 h-8 text-yellow-500" />
          <span>KisanDisha 🧭</span>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/sign-in"
            className="block text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Login / प्रवेश करें
          </Link>
          <Link
            href="/sign-up"
            className="group relative overflow-hidden rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground shadow-lg transition-all hover:scale-105"
          >
            <span className="block transition-transform duration-300 group-hover:-translate-y-full group-hover:opacity-0">
              Join for Free
            </span>
            <span className="absolute left-0 top-full block w-full text-center transition-transform duration-300 group-hover:translate-y-[-135%]">
              खाता बनाएँ
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative pt-20 pb-32 px-6 flex flex-col items-center justify-center text-center max-w-5xl mx-auto grow"
      >
        <div className="hero-element inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-sm mb-8 hover:bg-primary/10">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          Powered by Government Agmarknet Data
        </div>

        <h1 className="hero-element text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Find the Best Market <br className="hidden md:block" />
          <span className="text-primary">for Your Harvest.</span>
          <br />
          <span className="text-3xl md:text-5xl text-muted-foreground font-semibold mt-4 block">
            सही मंडी, सही दाम।
          </span>
        </h1>

        <p className="hero-element text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          KisanDisha turns raw government data into clear selling decisions using AI. Know exactly where your crop pays best, right now. No guesswork, just real trends.
        </p>

        <div className="hero-element flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/sign-up"
            className="group relative w-full sm:w-auto overflow-hidden rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground shadow-xl transition-all hover:shadow-primary/25 hover:scale-105 text-lg"
          >
            <span className="block transition-transform duration-300 group-hover:-translate-y-full group-hover:opacity-0">
              Start Selling Smarter
            </span>
            <span className="absolute left-0 top-full block w-full text-center transition-transform duration-300 group-hover:translate-y-[-150%]">
              बेहतर शुरुआत करें
            </span>
          </Link>
          <Link
            href="/sign-in"
            className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-border font-bold text-foreground hover:bg-muted transition-colors text-lg"
          >
            Browse Prices
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-24 px-6 bg-muted/30 border-t border-border relative"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to <span className="text-primary">grow</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Built for reliability, speed, and real-world farming needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card relative z-10 bg-card border border-border p-8 rounded-3xl shadow-sm cursor-default">
              <div className="card-bg-glow absolute inset-0 bg-primary/5 rounded-3xl opacity-0 -z-10 pointer-events-none"></div>
              <div className="icon-float w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 flex items-center justify-between">
                Live Market Data 
                <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">ताज़ा भाव</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Daily, automated updates directly from the government&apos;s Agmarknet API. Compare historical trends back to 2023.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card relative z-10 bg-card border border-primary/20 p-8 rounded-3xl shadow-md cursor-default">
              <div className="card-bg-glow absolute inset-0 bg-primary/10 rounded-3xl opacity-0 -z-10 pointer-events-none"></div>
              <div className="icon-float w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6 text-primary-foreground shadow-lg">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 flex items-center justify-between">
                AI Selling Advisor
                <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">सलाहकार</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Powered by Google Gemini. Just ask: <em>&ldquo;500kg tomatoes near Bhopal, where do I sell?&rdquo;</em> and get a grounded recommendation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card relative z-10 bg-card border border-border p-8 rounded-3xl shadow-sm cursor-default">
              <div className="card-bg-glow absolute inset-0 bg-primary/5 rounded-3xl opacity-0 -z-10 pointer-events-none"></div>
              <div className="icon-float w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 flex items-center justify-between">
                Smart Comparison
                <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">मंडी तुलना</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Find the nearest markets with the best prices, ranked by your home region and crop preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-background py-8 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-3">
          <div className="flex flex-col space-y-1">
            <span className="font-bold text-lg text-foreground flex items-center justify-center md:justify-start gap-2">
              KisanDisha 🧭
            </span>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} KisanDisha. All rights reserved.
            </p>
          </div>

          {/* Recruiter / GitHub Callout */}
          <a
            href="https://github.com/vaidikdubey/KisanDisha"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-5 py-2.5 rounded-full border border-border bg-muted/40 hover:bg-muted hover:border-primary/50 transition-all duration-300 shadow-sm"
          >
            <div className="p-1.5 rounded-full bg-background text-foreground group-hover:text-primary transition-colors">
              <FaGithub className="w-4 h-4" />
            </div>
            <div className="text-left text-xs">
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                Curious how it works under the hood?
              </span>
              <span className="text-muted-foreground">Explore the source code on GitHub</span>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:text-primary transition-colors group-hover:translate-x-1 group-hover:scale-150" />
          </a>
        </div>
      </footer>
    </div>
  );
}
