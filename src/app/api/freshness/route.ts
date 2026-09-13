import { withCache } from "@/lib/cache";
import { getDataFreshness } from "@/lib/queries/dataFreshness";

export async function GET(): Promise<Response> {
    const data = withCache("data:freshness", 60 * 60, () => getDataFreshness());

    return Response.json(
        {
            success: true,
            message: "Data freshness fetched",
            data,
        },
        { status: 200 },
    );
}
