import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
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
            return NextResponse.json(
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
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Server error creating new user. Please try again later",
                },
                { status: 500 },
            );

        return NextResponse.json(
            {
                success: true,
                message: "User registered",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error registering user", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error registering user",
            },
            { status: 500 },
        );
    }
}
