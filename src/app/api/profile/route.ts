import { getServerSession, User } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";
import { informPasswordResetEmail } from "@/helpers/informPasswordResetEmail";

export async function GET(): Promise<Response> {
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

    try {
        const dbUser = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                mobileNumber: true,
                provider: true,
                emailVerified: true,
                state: true,
                district: true,
                cropPreferences: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return Response.json(
            {
                success: true,
                message: "Profile fetched successfully",
                data: dbUser,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error fetching profile:", error);
        return Response.json(
            {
                success: false,
                error: "Error fetching profile",
            },
            { status: 500 },
        );
    }
}

export async function PATCH(request: NextRequest): Promise<Response> {
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

    try {
        const {
            name,
            email,
            newPassword,
            mobileNumber,
            currentPassword,
            state,
            district,
            cropPreferences,
        } = await request.json();

        const updateData: Prisma.UserUpdateInput = {};

        if (name) updateData["name"] = name;
        if (mobileNumber) updateData["mobileNumber"] = mobileNumber;
        if (state) updateData["state"] = state;
        if (district) updateData["district"] = district;
        if (cropPreferences) updateData["cropPreferences"] = cropPreferences;

        const existingUser = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
        });

        if (email) {
            const existingEmailUser = await prisma.user.findUnique({
                where: {
                    email,
                },
                select: {
                    id: true,
                    provider: true,
                },
            });

            if (existingEmailUser && existingEmailUser.id !== user.id)
                return Response.json(
                    {
                        success: false,
                        error: "Email already exists",
                    },
                    { status: 400 },
                );

            if (existingUser && existingUser.provider === "GOOGLE")
                return Response.json(
                    {
                        success: false,
                        error: "Google signup users cannot change email",
                    },
                    { status: 400 },
                );

            updateData["email"] = email;
            updateData["emailVerified"] = null;
        }

        if (newPassword) {
            if (!currentPassword)
                return Response.json(
                    {
                        success: false,
                        error: "Current password is required to change password",
                    },
                    { status: 400 },
                );

            if (!existingUser)
                return Response.json(
                    {
                        success: false,
                        error: "User not found",
                    },
                    { status: 404 },
                );

            if (existingUser.provider === "GOOGLE")
                return Response.json(
                    {
                        success: false,
                        error: "Google signup users cannot change password",
                    },
                    { status: 400 },
                );

            const passwordMatch = await bcrypt.compare(
                currentPassword,
                existingUser.password!,
            );

            if (!passwordMatch)
                return Response.json(
                    {
                        success: false,
                        error: "Current password is incorrect",
                    },
                    { status: 400 },
                );

            updateData["password"] = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: updateData,
            select: {
                name: true,
                email: true,
                mobileNumber: true,
                provider: true,
                emailVerified: true,
                state: true,
                district: true,
                cropPreferences: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (newPassword) {
            const passwordUpdateDate: string = new Intl.DateTimeFormat(
                "en-US",
                {
                    dateStyle: "full",
                    timeStyle: "short",
                    timeZone: "Asia/Kolkata",
                },
            ).format(Date.now());

            await informPasswordResetEmail(
                updatedUser.name,
                updatedUser.email,
                passwordUpdateDate,
            );
        }

        return Response.json(
            {
                success: true,
                message: "Profile updated successfully",
                data: updatedUser,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error updating profile:", error);

        return Response.json(
            {
                success: false,
                error: "Error updating profile",
            },
            { status: 500 },
        );
    }
}
