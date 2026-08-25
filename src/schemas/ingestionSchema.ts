import { z } from "zod";

export const ingestionSchema = z.object({
    state: z.string().min(1),
    district: z.string().min(1),
    market: z.string().min(1),
    commodity: z.string().min(1),
    variety: z.string().optional().default(""),
    arrival_date: z.string(),
    min_price: z.coerce.number(),
    max_price: z.coerce.number(),
    modal_price: z.coerce.number(),
});
