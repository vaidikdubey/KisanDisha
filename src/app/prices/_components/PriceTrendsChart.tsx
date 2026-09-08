"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

interface TrendData {
    date: string;
    avgModalPrice: number;
}

interface PriceTrendsChartProps {
    trends: TrendData[];
    commodity: string;
}

const chartConfig = {
    avgModalPrice: {
        label: "Avg Modal Price",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

export function PriceTrendsChart({ trends }: PriceTrendsChartProps) {
    if (!trends || trends.length === 0) {
        return (
            <div className="p-6 text-center text-xs font-mono text-muted-foreground">
                No trend data available for the selected parameters.
            </div>
        );
    }

    // Format dates for display on XAxis (e.g. "08 Sep")
    const formattedTrends = trends.map((t) => {
        const [year, month, day] = t.date.split("-");
        const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
        return {
            ...t,
            formattedDate: dateObj.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
            }),
        };
    });

    return (
        <ChartContainer config={chartConfig} className="min-h-70 w-full pt-4">
            <AreaChart
                data={formattedTrends}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient
                        id="fillAvgModalPrice"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="5%"
                            stopColor="var(--color-avgModalPrice)"
                            stopOpacity={0.35}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-avgModalPrice)"
                            stopOpacity={0.0}
                        />
                    </linearGradient>
                </defs>

                <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-border/40"
                />

                <XAxis
                    dataKey="formattedDate"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    className="text-[11px] font-mono fill-muted-foreground"
                />

                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-[11px] font-mono fill-muted-foreground"
                    tickFormatter={(value) => `₹${value}`}
                    domain={["auto", "auto"]}
                />

                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            labelFormatter={(label, payload) => {
                                if (payload && payload.length > 0) {
                                    return `Date: ${payload[0].payload.date}`;
                                }
                                return label;
                            }}
                            formatter={(value) => [
                                `₹${Number(value).toLocaleString("en-IN")} / Qtl`,
                                "Avg Price",
                            ]}
                        />
                    }
                />

                <Area
                    dataKey="avgModalPrice"
                    type="monotone"
                    stroke="var(--color-avgModalPrice)"
                    strokeWidth={2.5}
                    fill="url(#fillAvgModalPrice)"
                    dot={false}
                    activeDot={{
                        r: 5,
                        className: "fill-primary stroke-background stroke-2",
                    }}
                />
            </AreaChart>
        </ChartContainer>
    );
}
