import { withCache } from "@/lib/cache";
import { getAvailableLocations } from "@/lib/queries/availableLocations";

export async function GET(): Promise<Response> {
    const markets = await withCache("locations:list", 24 * 60 * 60, () =>
        getAvailableLocations(),
    );

    return Response.json(
        {
            success: true,
            message: "Markets (states/districts) fetched",
            data: markets,
        },
        { status: 200 },
    );
}
