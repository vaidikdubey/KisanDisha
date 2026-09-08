import { NextRequest } from "next/server";
import { getPrices, CommodityNotFoundError } from "@/lib/queries/prices";

export async function GET(request: NextRequest): Promise<Response> {
    try {
        const searchParams = request.nextUrl.searchParams;

        const commodity = searchParams.get("commodity");

        if (!commodity)
            return Response.json(
                {
                    success: false,
                    error: "Commodity is required",
                },
                { status: 400 },
            );

        const { prices, total, page, limit } = await getPrices({
            commodity,
            state: searchParams.get("state") ?? undefined,
            district: searchParams.get("district") ?? undefined,
            startDate: searchParams.get("startDate") ?? undefined,
            endDate: searchParams.get("endDate") ?? undefined,
            page: Number(searchParams.get("page")) || 1,
            limit: Number(searchParams.get("limit")) || 20,
        });

        return Response.json(
            {
                success: true,
                message:
                    prices.length === 0
                        ? `No price details found for ${commodity}`
                        : `Prices for ${commodity} fetched`,
                data: prices,
                pagination: {
                    totalRecords: total,
                    page,
                    limit,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error fetching prices ", error);
        if (error instanceof CommodityNotFoundError)
            return Response.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 500 },
            );
        throw error;
    }
}
