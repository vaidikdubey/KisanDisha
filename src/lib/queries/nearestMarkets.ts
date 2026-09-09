import { prisma } from "../prisma";
import { CommodityNotFoundError } from "./prices";

function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split("/").map(Number);

    return new Date(year, month - 1, day);
}

export async function getNearestMarkets({
    commodity,
    state,
    district,
    date,
    page,
    limit,
}: {
    commodity: string;
    state?: string;
    district?: string;
    date?: string;
    page: number;
    limit: number;
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
                      market: { state: { equals: state, mode: "insensitive" } },
                  },
                  orderBy: { date: "desc" },
                  select: { date: true },
              })
          )?.date;

    if (!targetDate) return { sortedMarkets: [], total: 0, page, limit };

    const [markets, total] = await Promise.all([
        await prisma.marketPrice.findMany({
            where: {
                commodityId: commodityRecord.id,
                date: targetDate,
                market: { state: { equals: state, mode: "insensitive" } },
            },
            include: { market: true },
            orderBy: { modalPrice: "desc" },
        }),
        await prisma.marketPrice.count({
            where: {
                commodityId: commodityRecord.id,
                date: targetDate,
                market: { state: { equals: state, mode: "insensitive" } },
            },
        }),
    ]);

    // tier: same district first, then rest of state — sorted by price within each tier
    const sortedMarkets = markets.sort((a, b) => {
        const aDistrictMatch =
            district &&
            a.market.district.toLowerCase() === district.toLowerCase();
        const bDistrictMatch =
            district &&
            b.market.district.toLowerCase() === district.toLowerCase();

        if (aDistrictMatch && !bDistrictMatch) return -1;
        if (!aDistrictMatch && bDistrictMatch) return 1;

        return b.modalPrice - a.modalPrice;
    });

    const startIndex = (page - 1) * limit;
    const paginatedMarkets = sortedMarkets.slice(
        startIndex,
        startIndex + limit,
    );

    return { sortedMarkets: paginatedMarkets, total, page, limit };
}
