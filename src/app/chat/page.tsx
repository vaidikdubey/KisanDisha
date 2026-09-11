"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Send,
    Bot,
    User,
    RefreshCw,
    AlertCircle,
    Loader2,
    Sprout,
    TrendingUp,
    MapPin,
    HelpCircle,
    LineChart,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

interface GeminiPart {
    text: string;
}

interface GeminiContent {
    role: "user" | "model";
    parts: GeminiPart[];
}

interface DisplayMessage {
    id: string;
    role: "user" | "model" | "error";
    text: string;
    timestamp: string;
}

const STARTER_QUESTIONS = [
    {
        icon: TrendingUp,
        title: "Market Price Trajectory",
        query: "Should I sell my Wheat crop now in Uttar Pradesh or wait 2 weeks for higher prices?",
    },
    {
        icon: MapPin,
        title: "District Comparison",
        query: "Where can I get the highest modal price for Potato near Bhopal?",
    },
    {
        icon: Sprout,
        title: "Crop Selling Advice",
        query: "What are the current market trends and price forecasts for Paddy in MP?",
    },
    {
        icon: HelpCircle,
        title: "Logistics vs Profit",
        query: "Is it worth transporting my Mustard yield from Indore to a neighboring district for higher rates?",
    },
];

export default function ChatPage() {
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [history, setHistory] = useState<GeminiContent[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [freshnessDate, setFreshnessDate] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Fetch Data Freshness once on initial load
    const fetchFreshness = useCallback(async () => {
        const response = await axios.get("/api/freshness");

        if (response.data.success && response.data.data?.mostRecentDataDate)
            setFreshnessDate(response.data.data?.mostRecentDataDate);
    }, []);

    useEffect(() => {
        //eslint-disable-next-line
        fetchFreshness();
    }, [fetchFreshness]);

    const handleSubmit = async (
        e?: React.SyntheticEvent,
        customQuery?: string,
    ) => {
        if (e) e.preventDefault();

        const query = (customQuery || input).trim();
        if (!query || loading) return;

        const timeString = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        const userMessage: DisplayMessage = {
            id: crypto.randomUUID(),
            role: "user",
            text: query,
            timestamp: timeString,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("/api/chat", {
                question: query,
                history: history,
            });

            if (res.status !== 200) {
                throw new Error(`Server returned status code ${res.status}`);
            }

            if (res.data.error) {
                throw new Error(res.data.error);
            }

            const advisorText =
                res.data.data.text || "No response text received from advisor.";

            const modelMessage: DisplayMessage = {
                id: crypto.randomUUID(),
                role: "model",
                text: advisorText,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };

            setMessages((prev) => [...prev, modelMessage]);

            if (
                res.data.data?.history &&
                Array.isArray(res.data.data?.history)
            ) {
                setHistory(res.data.data?.history);
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;

            const errorMessage: DisplayMessage = {
                id: crypto.randomUUID(),
                role: "error",
                text:
                    axiosError.response?.data.error ||
                    "Unable to process request. Please try again later.",
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleResetChat = () => {
        setMessages([]);
        setHistory([]);
        setInput("");
    };

    return (
        <div className="w-full max-w-[98%] lg:max-w-[92%] mx-auto px-2 sm:px-4 py-2 sm:py-3 flex-1 flex flex-col min-h-0 h-full gap-3 sm:gap-4">
            {/* Utility Header */}
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-4">
                    <h1 className="font-heading font-semibold text-base sm:text-lg flex items-center gap-2">
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                        AI Advisor
                    </h1>
                    <div className="flex items-center gap-2 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-muted/40 border border-border/60 text-[10px] font-mono text-muted-foreground cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>
                            {freshnessDate
                                ? `Data: ${freshnessDate}`
                                : "Agmarknet Sync"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium">
                    <Link
                        href="/prices"
                        className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <LineChart className="w-4 h-4" />
                        <span>Prices</span>
                    </Link>
                    <Link
                        href="/nearby"
                        className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <MapPin className="w-4 h-4" />
                        <span>Nearby Mandis</span>
                    </Link>
                    {messages.length > 0 && (
                        <button
                            onClick={handleResetChat}
                            disabled={loading}
                            className="flex items-center gap-1.5 text-destructive hover:text-foreground transition-colors disabled:opacity-50 sm:border-l sm:border-border/40 sm:pl-4 ml-1 cursor-pointer"
                            title="Reset Chat"
                        >
                            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Message Feed / Starter Screen */}
            <div className="flex-1 min-h-0 w-full rounded-xl border border-border/60 bg-background/40 backdrop-blur-md p-3 sm:p-5">
                {messages.length === 0 ? (
                    <div className="min-h-full flex flex-col justify-center items-center py-4 sm:py-6 text-center w-full max-w-4xl mx-auto gap-4 sm:gap-6">
                        <div className="space-y-1.5 sm:space-y-2">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold tracking-tight text-foreground/90">
                                How can KisanDisha assist your crop sale today?
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto px-2">
                                Select a starter question below or type a custom
                                query to consult real-time Agmarknet market
                                data.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 w-full text-left pt-1 sm:pt-2">
                            {STARTER_QUESTIONS.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() =>
                                            handleSubmit(undefined, item.query)
                                        }
                                        className="p-3.5 sm:p-4 md:p-5 rounded-xl border border-border/60 bg-background/60 hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all duration-200 group text-left flex flex-col justify-between space-y-2 sm:space-y-3 shadow-xs hover:shadow-md cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 text-emerald-500">
                                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs sm:text-sm font-mono font-semibold text-foreground/90">
                                                {item.title}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 line-clamp-3">
                                            &ldquo;{item.query}&rdquo;
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 sm:space-y-6 w-full">
                        {messages.map((msg) => {
                            if (msg.role === "user") {
                                return (
                                    <div
                                        key={msg.id}
                                        className="flex justify-end items-start gap-2.5 sm:gap-3"
                                    >
                                        <div className="max-w-[88%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-emerald-600 text-white px-3.5 sm:px-5 py-2.5 sm:py-3.5 shadow-md space-y-1">
                                            <p className="text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-wrap wrap-break-words">
                                                {msg.text}
                                            </p>
                                            <span className="block text-[9px] sm:text-[10px] text-emerald-200/80 text-right font-mono">
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </div>
                                    </div>
                                );
                            }

                            if (msg.role === "error") {
                                return (
                                    <div
                                        key={msg.id}
                                        className="flex justify-start items-start gap-2.5 sm:gap-3"
                                    >
                                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive shrink-0 mt-0.5">
                                            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </div>
                                        <div className="max-w-[88%] sm:max-w-[75%] rounded-2xl rounded-tl-sm border border-destructive/40 bg-destructive/10 text-destructive-foreground px-3.5 sm:px-5 py-2.5 sm:py-3.5 shadow-xs space-y-1">
                                            <div className="flex items-center gap-1.5 text-destructive font-mono text-[11px] sm:text-xs font-bold">
                                                <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                <span>Request Error</span>
                                            </div>
                                            <p className="text-xs sm:text-sm leading-relaxed wrap-break-words">
                                                {msg.text}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={msg.id}
                                    className="flex justify-start items-start gap-2.5 sm:gap-3"
                                >
                                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5 shadow-xs">
                                        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </div>
                                    <div className="max-w-[92%] sm:max-w-[85%] min-w-0 rounded-2xl rounded-tl-sm border border-border/80 bg-background/80 backdrop-blur-md px-3.5 sm:px-5 py-2.5 sm:py-3.5 shadow-sm text-foreground space-y-2">
                                        <div className="prose prose-invert prose-xs sm:prose-sm md:prose-base max-w-none leading-relaxed wrap-break-words overflow-x-auto">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    table: ({ ...props }) => (
                                                        <div className="overflow-x-auto my-2 rounded-lg border border-border/60">
                                                            <table
                                                                className="w-full text-xs text-left border-collapse"
                                                                {...props}
                                                            />
                                                        </div>
                                                    ),
                                                    th: ({ ...props }) => (
                                                        <th
                                                            className="bg-muted/60 px-3 py-1.5 font-mono font-semibold border-b border-border/60"
                                                            {...props}
                                                        />
                                                    ),
                                                    td: ({ ...props }) => (
                                                        <td
                                                            className="px-3 py-1.5 border-b border-border/40 text-xs"
                                                            {...props}
                                                        />
                                                    ),
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                        <span className="block text-[9px] sm:text-[10px] text-muted-foreground/60 font-mono">
                                            {msg.timestamp}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Loading / Thinking Indicator */}
                        {loading && (
                            <div className="flex justify-start items-start gap-2.5 sm:gap-3">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5 animate-pulse">
                                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div className="rounded-2xl rounded-tl-sm border border-emerald-500/30 bg-background/80 backdrop-blur-md px-3.5 sm:px-5 py-2.5 sm:py-3 shadow-xs flex items-center gap-2.5">
                                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 animate-spin" />
                                    <span className="text-xs sm:text-sm font-mono text-muted-foreground animate-pulse">
                                        Analyzing market trends & prices...
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Container */}
            <div className="w-full shrink-0">
                <form
                    onSubmit={(e) => handleSubmit(e)}
                    className="space-y-1.5 sm:space-y-2"
                >
                    <div className="relative flex items-center shadow-sm w-full rounded-xl">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            placeholder={
                                loading
                                    ? "Advisor is thinking..."
                                    : "Ask your crop selling question (e.g., Best mandi for Wheat in MP?)..."
                            }
                            className="w-full bg-background border border-border/80 rounded-xl px-3.5 sm:px-5 py-3 sm:py-3.5 pr-12 sm:pr-14 text-xs sm:text-sm md:text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all min-w-0 border-animate-pulse"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="absolute right-1.5 sm:right-2 p-2 sm:p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
                            title="Send Message"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono text-muted-foreground/70 px-1">
                        <span>
                            KisanDisha AI •{" "}
                            <Link
                                href="https://gemini.google.com"
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-emerald-500 underline decoration-emerald-500/30 transition-colors"
                            >
                                Powered by Gemini
                            </Link>
                        </span>
                        <span className="hidden sm:inline">
                            Press Enter to send
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}
