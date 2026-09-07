import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
    try {
        const searchParams = request.nextUrl.searchParams;

        const commodity = searchParams.get("commodity");
        const state = searchParams.get("state");
        const district = searchParams.get("district");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 20;

        if (!commodity)
            return Response.json(
                {
                    success: false,
                    error: "Commodity is required",
                },
                { status: 400 },
            );

        const commodityRecord = await prisma.commodity.findUnique({
            where: {
                name: commodity,
            },
        });

        if (!commodityRecord)
            return Response.json(
                {
                    success: false,
                    error: "Commodity not found",
                },
                { status: 404 },
            );

        const [prices, total] = await Promise.all([
            await prisma.marketPrice.findMany({
                where: {
                    commodityId: commodityRecord.id,
                    market: {
                        ...(state && { state }),
                        ...(district && { district }),
                    },
                    ...(startDate || endDate
                        ? {
                              date: {
                                  ...(startDate && {
                                      gte: new Date(startDate),
                                  }),
                                  ...(endDate && { lte: new Date(endDate) }),
                              },
                          }
                        : {}),
                },
                include: {
                    market: true,
                },
                orderBy: { date: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            await prisma.marketPrice.count({
                where: {
                    commodityId: commodityRecord.id,
                    market: {
                        ...(state && { state }),
                        ...(district && { district }),
                    },
                    ...(startDate || endDate
                        ? {
                              date: {
                                  ...(startDate && {
                                      gte: new Date(startDate),
                                  }),
                                  ...(endDate && { lte: new Date(endDate) }),
                              },
                          }
                        : {}),
                },
            }),
        ]);

        if (prices.length === 0)
            return Response.json(
                {
                    success: true,
                    message: `No price details found for the ${commodity} at the moment`,
                    data: prices,
                    pagination: {
                        totalRecords: total,
                        page,
                        limit,
                    },
                },
                { status: 200 },
            );

        console.log("Prices fetched: ", prices);

        return Response.json(
            {
                success: true,
                message: `Prices for ${commodity} fetched`,
                data: prices,
                pagination: {
                    totalRecords: total,
                    page,
                    limit,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error fetching prices ", error);
        return Response.json(
            {
                success: false,
                error: "Error fetching prices",
            },
            { status: 500 },
        );
    }
}
