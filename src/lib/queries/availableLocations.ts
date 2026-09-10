import { prisma } from "../prisma";

export async function getAvailableLocations() {
    return await prisma.market.findMany({
        distinct: ["state", "district"],
        select: {
            state: true,
            district: true,
        },
        orderBy: [{ state: "asc" }, { district: "asc" }],
    });
}
