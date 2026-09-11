import { prisma } from "../prisma";

export async function getDataFreshness() {
    const latest = await prisma.marketPrice.findFirst({
        orderBy: { date: "desc" },
        select: { date: true },
    });

    return {
        mostRecentDataDate: latest?.date.toISOString().split("T")[0] ?? null,
    };
}
