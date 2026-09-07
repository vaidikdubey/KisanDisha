import { prisma } from "@/lib/prisma";

export async function GET(): Promise<Response> {
    const markets = await prisma.market.findMany({
        distinct: ["state", "district"],
        select: {
            state: true,
            district: true,
        },
        orderBy: [{ state: "asc" }, { district: "asc" }],
    });

    return Response.json(
        {
            success: true,
            message: "Markets (states/districts) fetched",
            data: markets,
        },
        { status: 200 },
    );
}
