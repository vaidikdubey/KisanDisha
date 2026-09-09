import { getNearestMarkets } from "@/lib/queries/nearestMarkets";
import { CommodityNotFoundError } from "@/lib/queries/prices";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
    const searchParams = request.nextUrl.searchParams;
    const commodity = searchParams.get("commodity");
    const state = searchParams.get("state");

    if (!commodity)
        return Response.json(
            {
                success: false,
                error: "Commodity is required",
            },
            { status: 400 },
        );

    if (!state)
        return Response.json(
            {
                success: false,
                error: "State is required",
            },
            { status: 400 },
        );

    try {
        const markets = await getNearestMarkets({
            commodity,
            state,
            district: searchParams.get("district") ?? undefined,
            date: searchParams.get("date") ?? undefined,
        });

        return Response.json(
            {
                success: true,
                message:
                    markets.length === 0
                        ? `No prices found for ${commodity} in ${state}`
                        : `Nearest markets for ${commodity} fetched`,
                data: markets,
            },
            { status: 200 },
        );
    } catch (error) {
        if (error instanceof CommodityNotFoundError)
            return Response.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 404 },
            );
        throw error;
    }
}
