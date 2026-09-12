import { sendResetPasswordEmail } from "@/helpers/sendResetPasswordEmail";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request): Promise<Response> {
    const { email } = await request.json();

    if (!email)
        return Response.json(
            {
                success: false,
                error: "Email is required",
            },
            { status: 400 },
        );

    try {
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                name: true,
            }
        });

        if (!user)
            return Response.json(
                {
                    success: false,
                    error: "User not found",
                },
                { status: 404 },
            );

        const unHashedToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(unHashedToken)
            .digest("hex");

        const tokenExpiry = new Date(Date.now() + 20 * 60 * 60); //20 mins

        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                token: hashedToken,
                expiresAt: tokenExpiry,
            },
        })

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${unHashedToken}`

        await sendResetPasswordEmail(
            user.name,
            email,
            resetLink
        )

        return Response.json(
            {
                success: true,
                message: "Password reset link sent",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error in password reset", error);
        return Response.json(
            {
                success: false,
                error: "Error in password reset",
            },
            { status: 500 },
        );
    }
}
