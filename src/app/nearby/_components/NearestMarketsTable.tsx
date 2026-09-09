"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MarketItem {
  id: string;
  modalPrice: number;
  date: Date | string;
  market: {
    id: string;
    name: string;
    district: string;
    state: string;
  };
}

interface NearestMarketsTableProps {
  markets: MarketItem[];
  userDistrict?: string;
  total: number;
  page: number;
  limit: number;
}

export function NearestMarketsTable({
  markets,
  userDistrict,
  total,
  page,
  limit,
}: NearestMarketsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / limit) || 1;

  const navigateToPage = (newPage: number, newLimit?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    if (newLimit) params.set("limit", String(newLimit));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">S.No.</TableHead>
              <TableHead>Market</TableHead>
              <TableHead>District</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Modal Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-xs font-mono text-muted-foreground">
                  No market prices found matching your selection.
                </TableCell>
              </TableRow>
            ) : (
              markets.map((item, idx) => {
                const isNearby =
                  Boolean(userDistrict) &&
                  item.market.district.toLowerCase() === userDistrict?.toLowerCase();

                return (
                  <TableRow
                    key={item.id}
                    className={
                      isNearby
                        ? "bg-emerald-500/10 hover:bg-emerald-500/15 font-semibold text-emerald-950 dark:text-emerald-100"
                        : ""
                    }
                  >
                    <TableCell className="font-mono text-muted-foreground text-xs">
                      {(page - 1) * limit + idx + 1}.
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{item.market.name.toUpperCase()}</span>
                        {isNearby && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <MapPin className="w-3 h-3" />
                            Nearby
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.market.district.toUpperCase()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.market.state.toUpperCase()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      ₹{item.modalPrice.toLocaleString("en-IN")}
                      <span className="text-[10px] font-normal text-muted-foreground ml-1">
                        / quintal
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-2">
        <div className="text-xs font-mono text-muted-foreground">
          Showing <span className="font-medium text-foreground">{markets.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{" "}
          <span className="font-medium text-foreground">{Math.min(page * limit, total)}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span> entries
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-mono text-muted-foreground">Rows per page</p>
            <Select value={`${limit}`} onValueChange={(val) => navigateToPage(1, Number(val))}>
              <SelectTrigger className="h-8 w-16">
                <SelectValue placeholder={`${limit}`} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center text-xs font-mono font-medium">
            Page {page} of {totalPages}
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => navigateToPage(1)}
              disabled={page <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => navigateToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => navigateToPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => navigateToPage(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}