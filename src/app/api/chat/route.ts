import { parsedGeminiError, runAdvisor } from "@/lib/agent/advisor";

export async function POST(request: Request): Promise<Response> {
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
                result,
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
