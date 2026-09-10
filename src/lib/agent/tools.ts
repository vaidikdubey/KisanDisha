import { getPriceTrends, getPrices } from "@/lib/queries/prices";
import {FunctionDeclaration, Type} from "@google/genai"
import { getNearestMarkets } from "@/lib/queries/nearestMarkets";
import { getAvailableCommodities } from "../queries/availableCommodities";

export const toolDeclaration: FunctionDeclaration[] = [
    {
        name: "get_available_commodities",
        description:
            "Get a list of all available commodities in the database.",
        parameters: {
            type: Type.OBJECT,
            properties: {},
            required: [],
        },
    },
    {},
    {
        name: "get_prices",
        description:
            "Get recent market prices for a commodity, optionally filtered by state, district, and date range.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                commodity: {
                    type: Type.STRING,
                    description: "Crop name. e.g. Tomato",
                },
                state: { type: Type.STRING, description: "State name, optional" },
                district: {
                    type: Type.STRING,
                    description: "District name, optional",
                },
                startDate: {
                    type: Type.STRING,
                    description:
                        "Start Date for price filter. YYYY-MM-DD, optional",
                },
                endDate: {
                    type: Type.STRING,
                    description:
                        "End date for price filter. YYYY-MM-DD, optional",
                },
            },
            required: ["commodity"],
        },
    },
    {
        name: "get_price_trends",
        description:
            "Get the average daily price trend for a commodity over a date range, showing whether prices are rising or falling.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                commodity: {
                    type: Type.STRING,
                    description: "Crop name. e.g. Tomato",
                },
                state: { type: Type.STRING, description: "State name, optional" },
                district: {
                    type: Type.STRING,
                    description: "District name, optional",
                },
                startDate: {
                    type: Type.STRING,
                    description:
                        "Start Date for price trends filter. YYYY-MM-DD, optional",
                },
                endDate: {
                    type: Type.STRING,
                    description:
                        "End date for price trends filter. YYYY-MM-DD, optional",
                },
            },
            required: ["commodity"],
        },
    },
    {
        name: "get_nearest_market",
        description:
            "Get markets ranked by proximity (same district first, then rest of state) and price, to recommend the best place to sell a commodity.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                commodity: {
                    type: Type.STRING,
                    description: "Crop name, e.g. Tomato",
                },
                state: { type: Type.STRING, description: "State name" },
                district: {
                    type: Type.STRING,
                    description: "District name, optional",
                },
                date: { type: Type.STRING, description: "YYYY-MM-DD, optional" },
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
        case "get_available_commodities":
            return getAvailableCommodities();
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
