import { withCache } from "@/lib/cache";
import { getAvailableCommodities } from "@/lib/queries/availableCommodities";

export async function GET(): Promise<Response> {
    const commodities = withCache("commodities:list", 24 * 60 * 60, () =>
        getAvailableCommodities(),
    );

    return Response.json(
        {
            success: true,
            message: "Commodities fetched",
            data: commodities,
        },
        { status: 200 },
    );
}
