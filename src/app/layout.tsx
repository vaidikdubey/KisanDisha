import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
