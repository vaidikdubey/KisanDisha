import { prisma } from "../prisma";

export async function getAvailableCommodities() {
    return await prisma.commodity.findMany({
        distinct: ["name"],
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });
}
