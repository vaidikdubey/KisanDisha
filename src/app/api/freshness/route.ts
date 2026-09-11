import { getDataFreshness } from "@/lib/queries/dataFreshness";

export async function GET(): Promise<Response> {
    const data = await getDataFreshness();

    return Response.json(
        {
            success: true,
            message: "Data freshness fetched",
            data,
        },
        { status: 200 },
    );
}
