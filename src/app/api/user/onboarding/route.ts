import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function POST(req: Request): Promise<Response> {
    try {
        //Verify user session
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id)
            return Response.json(
                {
                    success: false,
                    error: "Unauthorized. Please sign in first",
                },
                { status: 401 },
            );

        const { state, district, cropPreferences, mobileNumber } =
            await req.json();

        if (!state || !district)
            return Response.json(
                {
                    success: false,
                    error: "State and District are required",
                },
                { status: 400 },
            );

        const updatedUser = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                state,
                district,
                cropPreferences: cropPreferences || [],
                mobileNumber: mobileNumber || null,
                isOnboarding: true,
                provider: "GOOGLE",
            },
        });

        return Response.json(
            {
                success: true,
                message: "Profile onboarding completed",
                data: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    state: updatedUser.state,
                    district: updatedUser.district,
                    isOnboarded: updatedUser.isOnboarding,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error onboarding user", error);
        return Response.json(
            {
                success: false,
                error: "Error updating profile details",
            },
            { status: 500 },
        );
    }
}
