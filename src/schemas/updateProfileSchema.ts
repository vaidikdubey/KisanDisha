import { z } from "zod";

export const updateProfileSchema = z
    .object({
        name: z
            .string()
            .min(2, { message: "Name must be at least 2 characters" }),
        email: z.string().email(),
        mobileNumber: z.string().optional(),
        state: z
            .string({ message: "State is required" })
            .min(1, "State is required"),
        district: z
            .string({ message: "District is required" })
            .min(1, "District is required"),
        cropPreferences: z
            .array(z.string())
            .min(1, "At least one preferred crop is required"),
        currentPassword: z.string().optional(),
        newPassword: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.newPassword && data.newPassword.length > 0) {
                return (
                    !!data.currentPassword && data.currentPassword.length > 0
                );
            }
            return true;
        },
        {
            message: "Current password is required to set a new password",
            path: ["currentPassword"],
        },
    )
    .refine(
        (data) => {
            if (data.newPassword && data.newPassword.length > 0) {
                return data.newPassword.length >= 6;
            }
            return true;
        },
        {
            message: "New password must be at least 6 characters",
            path: ["newPassword"],
        },
    );
