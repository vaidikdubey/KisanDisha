import { prisma } from "../prisma";
import { CommodityNotFoundError } from "./prices";

export async function getNearestMarkets({
    commodity,
    state,
    district,
    date,
}: {
    commodity: string;
    state: string;
    district?: string;
    date?: string;
}) {
    const commodityRecord = await prisma.commodity.findUnique({
        where: {
            name: commodity,
        },
    });

    if (!commodityRecord)
        throw new CommodityNotFoundError(`Commodity ${commodity} not found.`);

    // Most recent date with data for this commodity+state, if none given
    const targetDate = date
        ? new Date(date)
        : (
              await prisma.marketPrice.findFirst({
                  where: {
                      commodityId: commodityRecord.id,
                      market: { state },
                  },
                  orderBy: { date: "desc" },
                  select: { date: true },
              })
          )?.date;

    if (!targetDate) return [];

    const result = await prisma.marketPrice.findMany({
        where: {
            commodityId: commodityRecord.id,
            date: targetDate,
            market: { state },
        },
        include: { market: true },
        orderBy: { modalPrice: "desc" },
    });

    // tier: same district first, then rest of state — sorted by price within each tier
    return result.sort((a, b) => {
        const aMatch = district ? a.market.district === district : false;
        const bMatch = district ? b.market.district === district : false;

        if (aMatch !== bMatch) return aMatch ? -1 : 1;

        return b.modalPrice - a.modalPrice;
    });
}
