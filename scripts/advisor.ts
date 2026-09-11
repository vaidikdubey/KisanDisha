import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { executeTool, toolDeclaration } from "@/lib/agent/tools";

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
function parsedGeminiError(error: unknown): GeminiErrorInfo { 
    const message = error instanceof Error ? error.message : String(error)
    const is429 = message.includes(`"code":429`) || message.includes("RESOURCE_EXHAUSTED")

    const retryMatch = message.match(/"retryDelay":"(\d+)s"/)

    return {
        is429,
        isDailyQuota: is429 && message.includes("PerDay"),
        isPerMinute: is429 && message.includes("PerMinute"),
        retryDelaySeconds: retryMatch ? Number(retryMatch[1]) : null
    }
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
            const info = parsedGeminiError(error)

            if (info.isDailyQuota) { 
                console.error("[Daily Quota Exhausted]. Resets at midnight PST.")
                throw error
            }

            if (info.isPerMinute && attempt < retries - 1) { 
                const delay = info.retryDelaySeconds ? info.retryDelaySeconds * 1000 * 500 : baseDelayMs * Math.pow(2, attempt) + Math.random() * 500

                console.warn(`[Rate Limit Exceeded]. Retrying in ${(delay / 1000).toFixed(1)}s (attempt ${attempt + 1}/${retries})...`)

                await sleep(delay)

                continue;
            }

            if (!info.is429 && attempt < retries - 1) { 
                const delay = 2000 * (attempt + 1)

                console.warn(`[Unidentified Error]. Retrying in ${(delay / 1000).toFixed(2)}s (attempt ${attempt + 1}/${retries})...`)

                await sleep(delay)

                continue;
            }

            throw error
        }
    }

    throw new Error("Max retires exceeded.");
}


async function runAdvisor(question: string) {
    const chat = ai.chats.create({
        model: "gemini-3.5-flash-lite",
        config: {
            tools: [{ functionDeclarations: toolDeclaration }],
        },
    });

    let response = await sendMessageWithRetry(chat, question);

    while (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponseParts = [];

        for (const call of response.functionCalls) {
            console.log(
                `Tool call: ${call.name} (${JSON.stringify(call.args)})`,
            );

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
            console.log("Tool result: ", result);
        }

        response = await sendMessageWithRetry(chat, functionResponseParts);
    }

    console.log("\nFinal answer: ", response.text);
}

// Perfect result, all tool call are handled by the agent and the final answer is correct
// runAdvisor("I have 500kg of wheat near Indore, where should I sell").catch(console.error)

// Perfect result, since ambiguous question, safely asks for required info from user
// runAdvisor("Where should I sell my crop?").catch(console.error)

//Perfect result, since district was not mentioned it plotted for nearby states and mandis. Also, as UP doesn't have any mango mandis listed in DB it gave the proper suggestions and also asked to provide district for more precise results.
// runAdvisor(
//     "I have 500kg of mangoes. Can you advice me where to sell them? I am from UP",
// ).catch(console.error);

// Excellent response. Very gracefully handled the missing data for Goa from DB with providing exact reason and also advising for crops (as per what AI does) without just leaving the question un-answered.
// runAdvisor(
//     "I am from Goa, what are the top 3 crops which I can grow which provides me with the most revenue?",
// ).catch(console.error);

// Failed to answer this un-related question. Instead of gracefully declining the request, the ai model just went ahead and behaved like a normal model and answered the question.
runAdvisor("How can I compute the area of a triangle using a circle?").catch(console.error)
