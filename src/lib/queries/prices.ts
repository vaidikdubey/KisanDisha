import { Prisma } from "@/generated/prisma/client";
import { prisma } from "../prisma";

export interface PriceQueryParams {
    commodity: string;
    state?: string;
    district?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface TrendsQueryParams {
    commodity: string;
    state?: string;
    district?: string;
    startDate?: string;
    endDate?: string;
    marketId?: string,
}

export class CommodityNotFoundError extends Error {}

export async function getPrices({
    commodity,
    state,
    district,
    startDate,
    endDate,
    page = 1,
    limit = 20,
}: PriceQueryParams) {
    const commodityRecord = await prisma.commodity.findFirst({
        where: {
            name: { equals: commodity, mode: "insensitive" },
        },
    });

    if (!commodityRecord)
        throw new CommodityNotFoundError(`Commodity "${commodity}" not found`);

    const whereClause: Prisma.MarketPriceWhereInput = {
        commodityId: commodityRecord.id,
        market: {
            ...(state && { state: {equals: state, mode: "insensitive"} }),
            ...(district && { district: {equals: district, mode: "insensitive"} }),
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
        prisma.marketPrice.findMany({
            where: whereClause,
            include: {
                market: true,
            },
            orderBy: { date: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.marketPrice.count({ where: whereClause }),
    ]);

    return { prices, total, page, limit };
}

export async function getPriceTrends({
    commodity,
    state,
    district,
    startDate,
    endDate,
    marketId,
}: TrendsQueryParams) {
    const commodityRecord = await prisma.commodity.findFirst({
        where: {
            name: { equals: commodity, mode: "insensitive" },
        },
    });

    if (!commodityRecord)
        throw new CommodityNotFoundError(`Commodity "${commodity}" not found`);

    const grouped = await prisma.marketPrice.groupBy({
        by: ["date"],
        where: {
            commodityId: commodityRecord.id,
            ...(marketId && { marketId }),
            market: {
                ...(state && { state: {equals: state, mode: "insensitive"} }),
                ...(district && { district: {equals: district, mode: "insensitive"} }),
            },
            ...(startDate || endDate
                ? {
                      date: {
                          ...(startDate && { gte: new Date(startDate) }),
                          ...(endDate && { lte: new Date(endDate) }),
                      },
                  }
                : {}),
        },
        _avg: { modalPrice: true },
        orderBy: { date: "asc" },
    });

    return grouped.map((g) => ({
        date: g.date.toISOString().split("T")[0],
        avgModalPrice: Math.round(g._avg.modalPrice ?? 0),
    }));
}
