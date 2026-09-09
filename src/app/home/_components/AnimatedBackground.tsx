"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const nodeGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Smooth GSAP mouse spotlight tracking
    const xTo = gsap.quickTo(spotlightRef.current, "x", { duration: 0.8, ease: "power2.out" });
    const yTo = gsap.quickTo(spotlightRef.current, "y", { duration: 0.8, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // GSAP floating animation for background data nodes
    if (nodeGroupRef.current) {
      const nodes = Array.from(nodeGroupRef.current.children);
      nodes.forEach((node, i) => {
        gsap.to(node, {
          y: "random(-20, 20)",
          x: "random(-15, 15)",
          rotation: "random(-15, 15)",
          duration: 6 + i * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.5,
        });
      });
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-background"
    >
      {/* Dynamic Mouse Spotlight */}
      <div
        ref={spotlightRef}
        className="absolute -top-62.5 -left-62.5 w-125 h-125 rounded-full bg-primary/10 blur-[120px] transition-opacity duration-500"
      />

      {/* Ambient Radial Gradient glowing behind content */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-150 bg-linear-to-b from-primary/10 via-chart-1/5 to-transparent blur-3xl opacity-70" />

      {/* Modern Engineering Grid (Dot Matrix + Fine Lines) */}
      <div 
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15]" 
        style={{
          backgroundImage: `
            radial-gradient(circle, var(--color-primary) 1px, transparent 1px),
            linear-gradient(to right, var(--color-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px, 96px 96px, 96px 96px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 30%, #000 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 30%, #000 40%, transparent 100%)"
        }}
      />

      {/* Subtle Agri-Data Floating SVG Constellation */}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <g ref={nodeGroupRef}>
          {/* Node 1: Leaf Grid Element */}
          <g transform="translate(120, 180)">
            <circle r="3" className="fill-primary" />
            <circle r="12" className="stroke-primary/40 fill-none" strokeWidth="1" strokeDasharray="2 2" />
            <path d="M-6 6 C -6 -2, 2 -6, 6 -6 C 6 2, -2 6, -6 6 Z" className="fill-primary/20 stroke-primary/60" strokeWidth="1" />
          </g>

          {/* Node 2: Trend Graph Marker */}
          <g transform="translate(1100, 240)">
            <circle r="4" className="fill-chart-1" />
            <path d="M-15 10 L-5 0 L5 5 L15 -10" className="stroke-chart-1/60 fill-none" strokeWidth="1.5" />
          </g>

          {/* Node 3: Geographic Pin Sparkle */}
          <g transform="translate(850, 680)">
            <circle r="3" className="fill-primary" />
            <path d="M0 -10 L0 10 M-10 0 L10 0" className="stroke-primary/30 fill-none" strokeWidth="1" />
          </g>
        </g>
      </svg>
    </div>
  );
}