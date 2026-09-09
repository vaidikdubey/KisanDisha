import { Navigation, AlertCircle } from "lucide-react";
import { getNearestMarkets } from "@/lib/queries/nearestMarkets";
import { CommodityNotFoundError } from "@/lib/queries/prices";
import { NearestMarketFilterBar } from "./_components/NearestMarketFilterBar";
import { NearestMarketsTable } from "./_components/NearestMarketsTable";

export default async function NearestMarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;

  // Empty state if no commodity is provided
  if (!params.commodity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-full max-w-4xl p-6 rounded-xl border border-border/60 bg-background/60 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
            <h2 className="text-base font-semibold font-heading tracking-tight">
              Nearest Market Discovery
            </h2>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              District-First Tiering
            </span>
          </div>
          <NearestMarketFilterBar />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Select a commodity above to find local mandis prioritized by proximity to your district.
        </p>
      </div>
    );
  }

  let data: Awaited<ReturnType<typeof getNearestMarkets>> | null = null;
  let commodityMissing = false;

  const rawPage = parseInt(params.page || "1", 10);
  const rawLimit = parseInt(params.limit || "20", 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const limit = isNaN(rawLimit) || rawLimit < 1 ? 20 : rawLimit;

  try {
    data = await getNearestMarkets({
      commodity: params.commodity,
      state: params.state,
      district: params.district,
      date: params.date,
      page,
      limit,
    });
  } catch (error) {
    if (error instanceof CommodityNotFoundError) {
      commodityMissing = true;
    } else {
      throw error;
    }
  }

  // Not Found error state
  if (commodityMissing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-full max-w-4xl p-6 rounded-xl border border-border/60 bg-background/60 backdrop-blur-md shadow-sm">
          <NearestMarketFilterBar />
        </div>
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Commodity &ldquo;{params.commodity}&rdquo; not found. Please try searching for another crop.
          </span>
        </div>
      </div>
    );
  }

  const { sortedMarkets, total } = data!;

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <div className="flex flex-col items-center justify-center space-y-2 text-center pt-2">
        <h1 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight text-foreground flex items-center gap-2">
          <Navigation className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          Nearest Market Rates
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-mono">
          Locate mandi prices for your crop. Markets matching your local district are automatically prioritized at the top.
        </p>
      </div>

      {/* Search Filter Box Container */}
      <div className="p-5 sm:p-6 rounded-xl border border-border/60 bg-background/60 backdrop-blur-md shadow-sm space-y-4 relative">
        <span className="absolute -top-2 -left-2 text-xs font-mono text-muted-foreground/60 select-none">+</span>
        <span className="absolute -top-2 -right-2 text-xs font-mono text-muted-foreground/60 select-none">+</span>
        <span className="absolute -bottom-2 -left-2 text-xs font-mono text-muted-foreground/60 select-none">+</span>
        <span className="absolute -bottom-2 -right-2 text-xs font-mono text-muted-foreground/60 select-none">+</span>

        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <h2 className="text-base font-semibold font-heading text-foreground">
            Nearest Market Search
          </h2>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Proximity Search Active
            </span>
          </div>
        </div>

        <NearestMarketFilterBar />

        <div className="flex justify-end pt-1">
          <p className="text-[11px] font-mono text-muted-foreground">
            <span className="text-destructive font-bold mr-1">*</span>
            Defaults to your saved state/district if unselected.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="p-5 sm:p-6 rounded-xl border border-border/60 bg-background/60 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold font-heading">
              Proximity-Sorted Trading Mandis
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              Markets in your district are highlighted and listed first, sorted by modal price.
            </p>
          </div>
        </div>

        <NearestMarketsTable
          markets={sortedMarkets}
          userDistrict={params.district}
          total={total}
          page={page}
          limit={limit}
        />
      </div>
    </div>
  );
}