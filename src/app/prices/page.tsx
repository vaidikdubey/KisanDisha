import {
    CommodityNotFoundError,
    getPrices,
    getPriceTrends,
} from "@/lib/queries/prices";
import { PriceFilterBar } from "./_components/PriceFilterBar";
import { PricesTable } from "./_components/PricesTable";

export default async function PricesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;

    if (!params.commodity)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
                <div className="w-full max-w-4xl p-6 rounded-xl border border-border/60 bg-background/60 backdrop-blur-md shadow-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
                        <h2 className="text-lg font-semibold font-heading tracking-tight">
                            Search Mandi Prices
                        </h2>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                            Live Ingestion Active
                        </span>
                    </div>
                    <PriceFilterBar />
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    Select a commodity above to view market prices and trend
                    insights.
                </p>
            </div>
        );

    let data: Awaited<ReturnType<typeof getPrices>> | null = null;
    let trends: Awaited<ReturnType<typeof getPriceTrends>> | null = null;
    let commodityMissing = false;

    try {
        data = await getPrices({
            commodity: params.commodity,
            state: params.state,
            district: params.district,
            startDate: params.startDate,
            endDate: params.endDate,
            page: Number(params.page) || 1,
            limit: Number(params.limit) || 20,
        });

        trends = await getPriceTrends({
            commodity: params.commodity,
            state: params.state,
            district: params.district,
            startDate: params.startDate,
            endDate: params.endDate,
        });
    } catch (error) {
        if (error instanceof CommodityNotFoundError) {
            commodityMissing = true;
        }
        throw error;
    }

    if (commodityMissing)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
                <div className="w-full max-w-4xl p-6 rounded-xl border border-border/60 bg-background/60 backdrop-blur-md shadow-sm">
                    <PriceFilterBar />
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    Commodity not found. Please try searching for another crop.
                </div>
            </div>
        );

    const { prices, total, limit, page } = data;

    // --- Summary Metric Calculations ---
    // Calculates overall average from trend data
    const overallAvg =
        trends && trends.length > 0
            ? Math.round(
                  trends.reduce((acc, curr) => acc + curr.avgModalPrice, 0) /
                      trends.length,
              )
            : 0;

    // Calculates peak price across current table rows
    const peakPrice =
        prices && prices.length > 0
            ? Math.max(...prices.map((p) => p.maxPrice ?? p.modalPrice ?? 0))
            : 0;

    // Calculates percentage change over the returned trend period
    const firstTrendPrice = trends?.[0]?.avgModalPrice ?? 0;
    const lastTrendPrice = trends?.[trends.length - 1]?.avgModalPrice ?? 0;
    const trendDiff = lastTrendPrice - firstTrendPrice;
    const trendPercentage =
        firstTrendPrice > 0
            ? ((trendDiff / firstTrendPrice) * 100).toFixed(1)
            : "0.0";
    const isPositiveTrend = trendDiff >= 0;

    return (
        <div className="space-y-8 pb-10">
            {/* Header Banner */}
            <div className="flex flex-col items-center justify-center space-y-2 text-center pt-2">
                <h1 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight text-foreground">
                    Market Price Analytics & Trends
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-mono">
                    Filter live daily Agmarknet rates across Indian mandis,
                    review recent price movements, and analyze historical
                    trends.
                </p>
            </div>

            {/* Filter Section Container */}
            <div className="p-5 sm:p-6 rounded-xl border border-border/60 bg-background/60 backdrop-blur-md shadow-sm space-y-4 relative">
                <span className="absolute -top-2 -left-2 text-xs font-mono text-muted-foreground/60 select-none">
                    +
                </span>
                <span className="absolute -top-2 -right-2 text-xs font-mono text-muted-foreground/60 select-none">
                    +
                </span>
                <span className="absolute -bottom-2 -left-2 text-xs font-mono text-muted-foreground/60 select-none">
                    +
                </span>
                <span className="absolute -bottom-2 -right-2 text-xs font-mono text-muted-foreground/60 select-none">
                    +
                </span>

                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <h2 className="text-base font-semibold font-heading text-foreground">
                        Search Mandi Prices
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                            Agmarknet Data
                        </span>
                    </div>
                </div>

                <PriceFilterBar />

                <div className="flex justify-end pt-1">
                    <p className="text-[11px] font-mono text-muted-foreground">
                        <span className="text-destructive font-bold mr-1">
                            *
                        </span>
                        Select a commodity and region to view price
                        distributions.
                    </p>
                </div>
            </div>

            {/* Dynamic Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card 1: Average Modal Price */}
                <div className="p-4 rounded-xl border border-border/60 bg-background/60 backdrop-blur-md shadow-sm flex flex-col justify-between space-y-1">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        Avg. Modal Price
                    </span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold font-heading text-foreground">
                            ₹{overallAvg.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                            / Quintal
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/80 font-mono">
                        Weighted average across selected period
                    </span>
                </div>

                {/* Card 2: Peak Rate */}
                <div className="p-4 rounded-xl border border-border/60 bg-background/60 backdrop-blur-md shadow-sm flex flex-col justify-between space-y-1">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        Peak Traded Rate
                    </span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold font-heading text-emerald-500">
                            ₹{peakPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                            / Quintal
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/80 font-mono">
                        Highest price recorded in search bounds
                    </span>
                </div>

                {/* Card 3: Price Momentum */}
                <div className="p-4 rounded-xl border border-border/60 bg-background/60 backdrop-blur-md shadow-sm flex flex-col justify-between space-y-1">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        Price Momentum
                    </span>
                    <div className="flex items-baseline justify-between">
                        <span
                            className={`text-2xl font-bold font-heading ${
                                isPositiveTrend
                                    ? "text-emerald-500"
                                    : "text-destructive"
                            }`}
                        >
                            {isPositiveTrend
                                ? `+${trendPercentage}%`
                                : `${trendPercentage}%`}
                        </span>
                        <span
                            className={`text-[10px] font-mono ${
                                isPositiveTrend
                                    ? "text-emerald-500"
                                    : "text-destructive"
                            }`}
                        >
                            {isPositiveTrend ? "▲ Rising" : "▼ Falling"}
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/80 font-mono">
                        Trend variation over available timeframe
                    </span>
                </div>
            </div>

            {/* Table Section */}
            <div className="p-5 sm:p-6 rounded-xl border border-border/60 bg-background/60 backdrop-blur-md shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold font-heading">
                            Mandi-wise Arrival & Price List
                        </h2>
                        <p className="text-xs text-muted-foreground font-mono">
                            Daily reported arrival volumes and minimum, maximum,
                            and modal trading prices.
                        </p>
                    </div>
                </div>

                <PricesTable
                    prices={prices}
                    commodity={params.commodity ?? ""}
                    total={total}
                    limit={limit}
                    page={page}
                />
            </div>
        </div>
    );
}
