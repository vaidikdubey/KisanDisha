"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

export type TableContent = {
    id: string;
    commodityId: string;
    marketId: string;
    market: {
        id: string;
        name: string;
        state: string;
        district: string;
    };
    variety: string | null;
    minPrice: number;
    maxPrice: number;
    modalPrice: number;
    date: Date;
};

interface PriceTableProp {
    prices: TableContent[];
    commodity?: string;
    total: number;
    limit: number;
    page: number;
}

export const PricesTable = ({
    prices,
    commodity,
    total,
    limit,
    page,
}: PriceTableProp) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const totalPages = Math.ceil(total / limit) || 1;

    const updateQueryParams = (
        updates: Record<string, string | number | null>,
    ) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "") params.delete(key);
            else params.set(key, String(value));
        });
        router.replace(`${pathname}?${params.toString()}`, {scroll: false});
    };

    const handlePageChange = (newPage: number) => {
        updateQueryParams({ page: newPage });
    };

    const handleLimitChange = (newLimit: string | null) => {
        if (!newLimit) return;
        // Reset to page 1 whenever page size changes to avoid out-of-bounds queries
        updateQueryParams({ page: 1, limit: newLimit });
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-border/60">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-15">S.No.</TableHead>
                            <TableHead>Commodity</TableHead>
                            <TableHead>Market</TableHead>
                            <TableHead>Variety</TableHead>
                            <TableHead>Maximum</TableHead>
                            <TableHead>Minimum</TableHead>
                            <TableHead>Average</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {prices && prices.length > 0 ? (
                            prices.map((price, idx) => (
                                <TableRow
                                    key={price.id}
                                    data-state={
                                        searchParams.get("marketId") ===
                                        price.marketId
                                            ? "selected"
                                            : undefined
                                    }
                                    onClick={() => {
                                        const nextMarketId =
                                            searchParams.get("marketId") ===
                                            price.marketId
                                                ? null
                                                : price.marketId;

                                        updateQueryParams({
                                            marketId: nextMarketId,
                                        });
                                    }}
                                    className="cursor-pointer"
                                >
                                    <TableCell className="font-mono text-muted-foreground">
                                        {(page - 1) * limit + idx + 1}.
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {commodity?.toLocaleUpperCase() ||
                                            "UNKNOWN"}
                                    </TableCell>
                                    <TableCell>
                                        {price.market.name.toLocaleUpperCase()}
                                    </TableCell>
                                    <TableCell>
                                        {price.variety?.toLocaleUpperCase() ??
                                            "-"}
                                    </TableCell>
                                    <TableCell>
                                        ₹
                                        {price.maxPrice.toLocaleString("en-IN")}
                                    </TableCell>
                                    <TableCell>
                                        ₹
                                        {price.minPrice.toLocaleString("en-IN")}
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        ₹
                                        {price.modalPrice.toLocaleString(
                                            "en-IN",
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(price.date)
                                            .toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "2-digit",
                                                year: "numeric",
                                            })
                                            .replace(/,(\s\d{4})$/, "$1")}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No market prices found for the selected
                                    filter.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="text-xs font-mono text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                        {prices.length > 0 ? (page - 1) * limit + 1 : 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-foreground">
                        {Math.min(page * limit, total)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    entries
                </div>

                <div className="flex items-center space-x-6 lg:space-x-8">
                    {/* Page Limit Dropdown */}
                    <div className="flex items-center space-x-2">
                        <p className="text-xs font-mono text-muted-foreground">
                            Rows per page
                        </p>
                        <Select
                            value={`${limit}`}
                            onValueChange={handleLimitChange}
                        >
                            <SelectTrigger className="h-8 w-17.5">
                                <SelectValue placeholder={`${limit}`} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 50, 100].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Current Page Indicator */}
                    <div className="flex items-center justify-center text-xs font-mono font-medium">
                        Page {page} of {totalPages}
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => handlePageChange(1)}
                            disabled={page <= 1}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={page >= totalPages}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
