import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request): Promise<Response> {
    try {
        const {
            name,
            email,
            password,
            mobileNumber,
            state,
            district,
            cropPreferences,
        } = await req.json();

        if (!name || !email || !password || !state || !district)
            throw new Error("All details are required.");

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return Response.json(
                {
                    success: false,
                    message: "User already exists with this email.",
                },
                { status: 400 },
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                mobileNumber,
                state,
                district,
                cropPreferences,
                isOnboarding: true,
            },
        });

        if (!user)
            return Response.json(
                {
                    success: false,
                    error: "Server error creating new user. Please try again later",
                },
                { status: 500 },
            );

        return Response.json(
            {
                success: true,
                message: "User registered",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error registering user", error);
        return Response.json(
            {
                success: false,
                error: "Error registering user",
            },
            { status: 500 },
        );
    }
}
