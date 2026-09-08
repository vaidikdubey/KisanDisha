import { z } from "zod"

export const pricesFormSchema = z.object({
    commodity: z.string({ message: "Please select a commodity" }),
    state: z.string({ message: "Please select a state" }),
    district: z.string({ message: "Please select a district" }),
})