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

    try {
        const markets = await getNearestMarkets({
            commodity,
            state:
                searchParams.get("state") ??
                (dbUser?.state ? dbUser.state : undefined),
            district:
                searchParams.get("district") ??
                (dbUser?.district ? dbUser.district : undefined),
            date: searchParams.get("date") ?? undefined,
        });

        return Response.json(
            {
                success: true,
                message:
                    markets.length === 0
                        ? `No prices found for ${commodity}`
                        : `Nearest markets for ${commodity} fetched`,
                data: markets,
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
