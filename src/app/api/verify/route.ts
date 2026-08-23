import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function GET(request: Request): Promise<Response> {
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user)
        return Response.json(
            {
                success: false,
                error: "Not Authenticated",
            },
            { status: 401 },
        );

    try {
        const verificationCode = Math.floor(
            100000 + Math.random() * 900000,
        ).toString();

        const updatedUser = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                verificationCode,
                verificationCodeExpiry: new Date(Date.now() + 20 * 60 * 1000),
            },
            select: {
                name: true,
                email: true,
            },
        });

        await sendVerificationEmail(
            updatedUser.name,
            updatedUser.email,
            verificationCode,
        );

        return Response.json(
            {
                success: true,
                message: "Verification code created and sent on email",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error generating verification code ", error);
        return Response.json(
            {
                success: false,
                error: "Error generating verification code",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: Request): Promise<Response> {
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user)
        return Response.json(
            {
                success: false,
                error: "Not Authenticated",
            },
            { status: 401 },
        );

    try {
        const { code } = await request.json();

        const existingUser = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
            select: {
                verificationCode: true,
                verificationCodeExpiry: true,
            },
        });

        if (!existingUser)
            return Response.json(
                {
                    success: false,
                    error: "User not found",
                },
                { status: 404 },
            );

        if (
            code.toString() !== existingUser.verificationCode ||
            new Date(Date.now()) > existingUser.verificationCodeExpiry!
        )
            return Response.json(
                {
                    success: false,
                    error: "Invalid or expired code",
                },
                { status: 400 },
            );

        const updatedUser = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                verificationCode: null,
                verificationCodeExpiry: new Date(0),
                emailVerified: new Date(Date.now()),
            },
        });

        return Response.json(
            {
                success: true,
                message: "Email verified successfully",
                data: {
                    updatedUser,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error verifying user email ", error);
        return Response.json(
            {
                success: false,
                error: "Error verifying email",
            },
            { status: 500 },
        );
    }
}
