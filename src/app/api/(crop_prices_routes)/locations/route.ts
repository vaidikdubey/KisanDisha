import { getAvailableLocations } from "@/lib/queries/availableLocations";

export async function GET(): Promise<Response> {
    const markets = await getAvailableLocations();

    return Response.json(
        {
            success: true,
            message: "Markets (states/districts) fetched",
            data: markets,
        },
        { status: 200 },
    );
}
