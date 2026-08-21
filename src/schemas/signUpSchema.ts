import { z } from "zod";

export const signUpSchema = z
    .object({
        name: z
            .string()
            .min(2, { message: "Name must be atleast 2 characters" }),
        email: z.string().email("Enter a valid email").toLowerCase(),
        password: z
            .string()
            .min(8, { message: "Password must be atleast 8 characters" }),
        confirmPassword: z.string(),
        mobileNumber: z.string().optional(),
        state: z.string({ message: "State is required" }),
        district: z.string({ message: "District is required" }),
        cropPreferences: z
            .array(z.string())
            .min(1, "Atleast one preferred crop is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
