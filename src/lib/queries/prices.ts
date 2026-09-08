import { prisma } from "../prisma";

export interface PriceQueryParams { 
    commodity: string;
    state?: string;
    district?: string;
    startDate?: string;
    endDate?: string;
    page?: number,
    limit?: number
}

export class CommodityNotFoundError extends Error { }

export async function getPrices({ 
    commodity,
    state,
    district,
    startDate,
    endDate,
    page = 1,
    limit = 20,
}: PriceQueryParams) { 
    const commodityRecord = await prisma.commodity.findUnique({
        where: {
            name: commodity
        }
    })

    if (!commodityRecord) throw new CommodityNotFoundError(`Commodity "${commodity}" not found`)

        const whereClause = {
            commodityId: commodityRecord.id,
            market: {
                ...(state && { state }),
                ...(district && { district }),
            },
            ...(startDate || endDate
                ? {
                      date: {
                          ...(startDate && { gte: new Date(startDate) }),
                          ...(endDate && { lte: new Date(endDate) }),
                      },
                  }
                : {}),
    };

    const [prices, total] = await Promise.all([
            await prisma.marketPrice.findMany({
                where: whereClause,
                include: {
                    market: true,
                },
                orderBy: { date: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            await prisma.marketPrice.count({ where: whereClause }),
    ]);

    return {prices, total, page, limit}
}