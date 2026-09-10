import { getAvailableCommodities } from "@/lib/queries/availableCommodities";

export async function GET(): Promise<Response> {
    const commodities = await getAvailableCommodities();

    return Response.json(
        {
            success: true,
            message: "Commodities fetched",
            data: commodities,
        },
        { status: 200 },
    );
}
