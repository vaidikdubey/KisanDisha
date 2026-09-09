import { getNearestMarkets } from "@/lib/queries/nearestMarkets";
import { CommodityNotFoundError } from "@/lib/queries/prices";
import { getServerSession, User } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<Response> {
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !user)
        return Response.json(
            {
                success: false,
                error: "Not Authenticated",
            },
            { status: 401 },
        );

    const userId = user.id;

    const searchParams = request.nextUrl.searchParams;
    const commodity = searchParams.get("commodity");

    if (!commodity)
        return Response.json(
            {
                success: false,
                error: "Commodity is required",
            },
            { status: 400 },
        );

    const dbUser = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            state: true,
            district: true,
        },
    });

    if (!searchParams.get("state") && !dbUser?.state)
        return Response.json(
            {
                success: false,
                error: "State is required",
            },
            { status: 400 },
        );

    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const rawLimit = parseInt(searchParams.get("limit") || "20", 10);

    try {
        const { sortedMarkets, total, page, limit } = await getNearestMarkets({
            commodity,
            state:
                searchParams.get("state") ??
                (dbUser?.state ? dbUser.state : undefined),
            district:
                searchParams.get("district") ??
                (dbUser?.district ? dbUser.district : undefined),
            date: searchParams.get("date") ?? undefined,
            page: isNaN(rawPage) || rawPage < 1 ? 1 : rawPage,
            limit: isNaN(rawLimit) || rawLimit < 1 ? 20 : rawLimit,
        });

        return Response.json(
            {
                success: true,
                message:
                    sortedMarkets.length === 0
                        ? `No prices found for ${commodity}`
                        : `Nearest markets for ${commodity} fetched`,
                data: sortedMarkets,
                pagination: {
                    totalRecords: total,
                    page,
                    limit,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        if (error instanceof CommodityNotFoundError)
            return Response.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 404 },
            );
        throw error;
    }
}
