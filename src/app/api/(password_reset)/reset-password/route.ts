import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {informPasswordResetEmail} from "@/helpers/informPasswordResetEmail"

export async function POST(request: Request): Promise<Response> {
    const { password, token } = await request.json();

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    try {
        const userToken = await prisma.passwordReset.findUnique({
            where: {
                token: hashedToken,
                expiresAt: {
                    gt: new Date(Date.now()),
                },
            },
            select: {
                userId: true,
                previousPasswords: true,
            },
        });

        if (!userToken) {
            return Response.json(
                {
                    success: false,
                    error: "Invalid or expired token",
                },
                {
                    status: 400,
                },
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userToken.userId,
            },
            select: {
                password: true,
            },
        });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    error: "User not found",
                },
                {
                    status: 404,
                },
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const recentPasswords = userToken.previousPasswords.slice(-3);

        const checkResults = await Promise.all(
            recentPasswords.map((oldHash) => bcrypt.compare(password, oldHash)),
        );

        const isRecentlyUsed = checkResults.some((isMatch) => isMatch);

        if (isRecentlyUsed) {
            return Response.json(
                {
                    success: false,
                    error: "Password cannot be same as last 3 passwords. Please choose a different password.",
                },
                {
                    status: 400,
                },
            );
        }

        const updatedPreviousPasswords = [
            ...userToken.previousPasswords,
            hashedPassword,
        ].slice(-3);

        const [updatedUser, updatedTokenPasswordList] = await Promise.all([
            prisma.user.update({
                where: {
                    id: userToken.userId,
                },
                data: {
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            }),
            prisma.passwordReset.update({
                where: {
                    token: hashedToken,
                },
                data: {
                    token: undefined,
                    expiresAt: new Date(0),
                    previousPasswords: updatedPreviousPasswords,
                },
            }),
        ]);

        const passwordUpdateDate: string = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'full',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata'
        }).format(Date.now())

        await informPasswordResetEmail(updatedUser.name, updatedUser.email, passwordUpdateDate)

        return Response.json(
            {
                success: true,
                message: "Password reset successful",
                data: updatedUser,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error resetting password:", error);
        return Response.json(
            {
                success: false,
                error: "Error resetting password",
            },
            { status: 500 },
        );
    }
}
