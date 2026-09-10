import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { executeTool, toolDeclaration } from "@/lib/agent/tools";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function runAdvisor(question: string) {
    const chat = ai.chats.create({
        model: "gemini-3.6-flash",
        config: {
            tools: [{ functionDeclarations: toolDeclaration }],
        },
    });

    let response = await chat.sendMessage({ message: question })

    while (response.functionCalls && response.functionCalls.length > 0) { 
        const call = response.functionCalls[0]
        console.log(`Tool call: ${call.name} (${JSON.stringify(call.args)})`)

        const result = await executeTool(call.name!, call.args as Record<string, unknown>)
        console.log("Tool result: ", result)

        response = await chat.sendMessage({
            message: [
                {
                    functionResponse: {
                        name: call.name,
                        response: { result },
                        id: call.id
                    }
                }
            ]
        })
    }

    console.log("\nFinal answer: ", response.text)
}

// Perfect result, all tool call are handled by the agent and the final answer is correct
// runAdvisor("I have 500kg of wheat near Indore, where should I sell").catch(console.error)
// Perfect result, since ambiguous question, safely asks for required info from user
// runAdvisor("Where should I sell my crop?").catch(console.error)

runAdvisor("Where should I sell my crop?").catch(console.error)

// runAdvisor("Where should I sell my crop?").catch(console.error)

// runAdvisor("Where should I sell my crop?").catch(console.error)

