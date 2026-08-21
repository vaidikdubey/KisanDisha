import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().email({message: "Please enter a valid email"}),
    password: z.string(),
})