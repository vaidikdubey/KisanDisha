import { prisma } from "@/lib/prisma";

export async function GET(): Promise<Response> {
    const commodities = await prisma.commodity.findMany({
        distinct: ["name"],
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });

    return Response.json({
        success: true,
        message: "Commodities fetched",
        data: commodities        
    }, {})
}
