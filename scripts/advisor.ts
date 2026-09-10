import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { executeTool, toolDeclaration } from "@/lib/agent/tools";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Intentional delay to respect rate limits and avoid 429 errors
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRateLimitError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
        return false;
    }

    const err = error as Record<string, unknown>;

    const has429Status = err.status === 429 || err.statusCode === 429;
    const hasRateLimitMessage =
        typeof err.message === "string" &&
        (err.message.includes("429") ||
            err.message.includes("RESOURCE_EXHAUSTED"));

    return has429Status || hasRateLimitMessage;
}

async function sendMessageWithRetry(
    chat: ReturnType<typeof ai.chats.create>,
    message: Parameters<typeof chat.sendMessage>[0]["message"],
    retries = 5,
    baseDelayMs = 2000,
) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await chat.sendMessage({ message });
        } catch (error: unknown) {
            if (isRateLimitError(error) && attempt < retries - 1) {
                const delay =
                    baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
                console.warn(
                    `[Rate Limit 429] Retrying request in ${(delay / 1000).toFixed(1)}s (Attempt ${attempt + 1}/${retries})...`,
                );
                await sleep(delay);
            } else throw error;
        }
    }

    throw new Error("Max retires exceeded.");
}

async function runAdvisor(question: string) {
    const chat = ai.chats.create({
        model: "gemini-3.6-flash",
        config: {
            tools: [{ functionDeclarations: toolDeclaration }],
        },
    });

    let response = await sendMessageWithRetry(chat, question);

    while (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        console.log(`Tool call: ${call.name} (${JSON.stringify(call.args)})`);

        const result = await executeTool(
            call.name!,
            call.args as Record<string, unknown>,
        );
        console.log("Tool result: ", result);

        response = await sendMessageWithRetry(chat, [
            {
                functionResponse: {
                    name: call.name,
                    response: { result },
                    id: call.id,
                },
            },
        ]);
    }

    console.log("\nFinal answer: ", response.text);
}

// Perfect result, all tool call are handled by the agent and the final answer is correct
// runAdvisor("I have 500kg of wheat near Indore, where should I sell").catch(console.error)
// Perfect result, since ambiguous question, safely asks for required info from user
// runAdvisor("Where should I sell my crop?").catch(console.error)

runAdvisor(
    "I have 500kg of mangoes. Can you advice me where to sell them? I am from UP",
).catch(console.error);

// runAdvisor("Where should I sell my crop?").catch(console.error)

// runAdvisor("Where should I sell my crop?").catch(console.error)
