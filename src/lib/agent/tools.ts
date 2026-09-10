import { getPriceTrends, getPrices } from "@/lib/queries/prices";
import { getNearestMarkets } from "@/lib/queries/nearestMarkets";

export const toolDeclaration = [
    {
        type: "function",
        name: "get_prices",
        description:
            "Get recent market prices for a commodity, optionally filtered by state, district, and date range.",
        parameters: {
            type: "object",
            properties: {
                commodity: {
                    type: "string",
                    description: "Crop name. e.g. Tomato",
                },
                state: { type: "string", description: "State name, optional" },
                district: {
                    type: "string",
                    description: "District name, optional",
                },
                startDate: {
                    type: "string",
                    description:
                        "Start Date for price filter. YYYY-MM-DD, optional",
                },
                endDate: {
                    type: "string",
                    description:
                        "End date for price filter. YYYY-MM-DD, optional",
                },
            },
            required: ["commodity"],
        },
    },
    {
        type: "function",
        name: "get_price_trends",
        description:
            "Get the average daily price trend for a commodity over a date range, showing whether prices are rising or falling.",
        parameters: {
            type: "object",
            properties: {
                commodity: {
                    type: "string",
                    description: "Crop name. e.g. Tomato",
                },
                state: { type: "string", description: "State name, optional" },
                district: {
                    type: "string",
                    description: "District name, optional",
                },
                startDate: {
                    type: "string",
                    description:
                        "Start Date for price trends filter. YYYY-MM-DD, optional",
                },
                endDate: {
                    type: "string",
                    description:
                        "End date for price trends filter. YYYY-MM-DD, optional",
                },
            },
            required: ["commodity"],
        },
    },
    {
        type: "function",
        name: "get_nearest_market",
        description:
            "Get markets ranked by proximity (same district first, then rest of state) and price, to recommend the best place to sell a commodity.",
        parameters: {
            type: "object",
            properties: {
                commodity: {
                    type: "string",
                    description: "Crop name, e.g. Tomato",
                },
                state: { type: "string", description: "State name" },
                district: {
                    type: "string",
                    description: "District name, optional",
                },
                date: { type: "string", description: "YYYY-MM-DD, optional" },
            },
            required: ["commodity", "state"],
        },
    },
];

export async function executeTool(name: string, args: Record<string, unknown>) {
    if (typeof args.commodity !== "string")
        throw new Error(
            `Missing required parameter "commodity" for tool ${name}`,
        );

    switch (name) {
        case "get_prices":
            return getPrices(
                args as unknown as Parameters<typeof getPrices>[0],
            );
        case "get_price_trends":
            return getPriceTrends(
                args as unknown as Parameters<typeof getPriceTrends>[0],
            );
        case "get_nearest_market":
            return getNearestMarkets(
                args as Parameters<typeof getNearestMarkets>[0],
            );
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
