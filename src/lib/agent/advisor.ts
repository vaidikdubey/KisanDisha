import { GoogleGenAI } from "@google/genai";
import type { Content } from "@google/genai";
import { executeTool, toolDeclaration } from "./tools";

interface GeminiErrorInfo {
    is429: boolean;
    isDailyQuota: boolean;
    isPerMinute: boolean;
    retryDelaySeconds: number | null;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Intentional delay to respect rate limits and avoid 429 errors
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Gemini error messages parsing to determine type of error and also extract the retry delay provided by gemini in error message.
export function parsedGeminiError(error: unknown): GeminiErrorInfo {
    const message = error instanceof Error ? error.message : String(error);
    const is429 =
        message.includes(`"code":429`) ||
        message.includes("RESOURCE_EXHAUSTED");

    const retryMatch = message.match(/"retryDelay":"(\d+)s"/);

    return {
        is429,
        isDailyQuota: is429 && message.includes("PerDay"),
        isPerMinute: is429 && message.includes("PerMinute"),
        retryDelaySeconds: retryMatch ? Number(retryMatch[1]) : null,
    };
}

// Exponential reties: 12s, 24s, 48s...
async function sendMessageWithRetry(
    chat: ReturnType<typeof ai.chats.create>,
    message: Parameters<typeof chat.sendMessage>[0]["message"],
    retries = 5,
    baseDelayMs = 12000, //12 sec
) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await chat.sendMessage({ message });
        } catch (error: unknown) {
            const info = parsedGeminiError(error);

            if (info.isDailyQuota) {
                console.error(
                    "[Daily Quota Exhausted]. Resets at midnight PST.",
                );
                throw error;
            }

            if (info.isPerMinute && attempt < retries - 1) {
                const delay = info.retryDelaySeconds
                    ? info.retryDelaySeconds * 1000 + 500
                    : baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;

                console.warn(
                    `[Rate Limit Exceeded]. Retrying in ${(delay / 1000).toFixed(1)}s (attempt ${attempt + 1}/${retries})...`,
                );

                await sleep(delay);

                continue;
            }

            if (!info.is429 && attempt < retries - 1) {
                const delay = 2000 * (attempt + 1);

                console.warn(
                    `[Unidentified Error]. Retrying in ${(delay / 1000).toFixed(2)}s (attempt ${attempt + 1}/${retries})...`,
                );

                await sleep(delay);

                continue;
            }

            throw error;
        }
    }

    throw new Error("Max retires exceeded.");
}

const SYSTEM_INSTRUCTION = `You are KisanDisha's selling advisor - you help farmers decide where and when to sell their crops, using real market price data from Indian mandis, sourced from Agmarknet.

You have access to tools that give you real, current price and market data. Use them whenever a question involves prices, markets, trends, or selling decisions. Don't try answering based on your general knowledge or hallucinating data which might not be grounded as per the application's database and records. Always try to use tools and ground your responses with the actual data which the application contains. If asked how current or fresh the data is, use the get_data_freshness tool rather than guessing.

Stay strictly within this scope:
- Crop prices, market comparisons, selling recommendations, price trends.
- Basic, general farming/crop advice when it's directly relevant to a farmer's selling decision (e.g. what crops might suit their region, which regions are highly profitable, which crops have high revenues in a specified region, etc.)

If a question has nothing to do with farming, crops, or agricultural markets or the scope of the application - like math problems, general knowledge, coding, or anything unrelated - politely decline and redirect: explain that you're focused on helping with crop selling decisions, briefly describe the scope of the application, and ask if there's something in that space you can help with instead.

If the user asks about something the app can do but isn't part of your own tools — like viewing a detailed price comparison table, browsing the nearest-markets ranking, or managing their account — don't try to answer it yourself or decline it as out of scope. Instead, briefly explain that feature exists elsewhere in the app and point them to it. Only decline outright for genuinely unrelated topics that have nothing to do with KisanDisha at all.

Links to the current pages of the application:
- /chat — interact with you, the AI selling advisor.
- /nearby — table of nearest markets (mandis) for a given commodity, state, district, and date, ranked by proximity and price.
- /prices — price comparison (max/min/modal) across markets for a commodity, state, district, and date range, plus a price trend graph.
All these pages are within the scope of the application and can be used to make selling decisions. They can be accessed by returning to the home page (/home) and clicking on the cards there.

Never answer out-of-scope questions just because you technically can. Staying focused is more valuable than being generically helpful.`;

export async function runAdvisor(question: string, history: Content[] = []) {
    const chat = ai.chats.create({
        model: "gemini-3.5-flash-lite",
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: toolDeclaration }],
        },
        history,
    });

    let response = await sendMessageWithRetry(chat, question);

    while (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponseParts = [];

        for (const call of response.functionCalls) {
            const result = await executeTool(
                call.name!,
                call.args as Record<string, unknown>,
            );
            functionResponseParts.push({
                functionResponse: {
                    name: call.name,
                    response: { result },
                    id: call.id,
                },
            });
        }

        response = await sendMessageWithRetry(chat, functionResponseParts);
    }

    return {
        text: response.text,
        history: chat.getHistory() // full updated conversation, since API calls are stateless
    };
}
