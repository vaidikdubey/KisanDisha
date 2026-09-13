import { parsedGeminiError, runAdvisor } from "@/lib/agent/advisor";
import { chatRateLimit } from "@/lib/ratelimit";

export async function POST(request: Request): Promise<Response> {
    //Rate limiting logic
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const { success } = await chatRateLimit.limit(ip);

    if (!success)
        return Response.json(
            {
                success: false,
                error: "You're sending messages too quickly - please wait a moment.",
            },
            { status: 429 },
        );

    const { question, history = [] } = await request.json();

    if (!question)
        return Response.json(
            {
                success: false,
                error: "Question is required.",
            },
            { status: 400 },
        );

    try {
        const result = await runAdvisor(question, history);

        return Response.json(
            {
                success: true,
                message: "Advisor response successful",
                data: result,
            },
            { status: 200 },
        );
    } catch (error: unknown) {
        console.error("Advisor error: ", error);

        const info = parsedGeminiError(error);

        if (info.isDailyQuota) {
            return Response.json(
                {
                    success: false,
                    error: "The advisor has hit its daily usage limit and will be back tomorrow. Try the Prices or Nearby Markets pages in the meantime.",
                },
                { status: 503 },
            );
        }

        if (info.is429) {
            return Response.json(
                {
                    success: false,
                    error: "The advisor is a bit busy right now - please try again after some time.",
                },
                { status: 429 },
            );
        }

        return Response.json(
            {
                success: false,
                error: "Something went wrong getting a response. Please try again.",
            },
            { status: 500 },
        );
    }
}
