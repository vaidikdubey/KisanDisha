import { z } from "zod";

export const onboardingSchema = z.object({
    mobileNumber: z.string().optional(),
    state: z.string({ message: "State is required" }),
    district: z.string({ message: "District is required" }),
    cropPreferences: z
        .array(z.string())
        .min(1, "Atleast one preferred crop is required"),
});
