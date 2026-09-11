import "dotenv/config";
import { runAdvisor } from "@/lib/agent/advisor";

runAdvisor("I have 500kg of wheat near Indore, where should I sell", [])
    .then((result) => {
        console.log(
            "Intermediate result: ",
            result.text,
            "\nIntermediate history: ",
            result.history,
        );
        runAdvisor(
            "So does batching my wheat into 2 parts and selling to Indore APMC and Sanwer APMC benificial or should I sell all of it to Indore APMC",
            result.history,
        ).then((result) =>
            console.log(
                "Final result: ",
                result.text,
                "\nHistory: ",
                result.history,
            ),
        );
    })
    .catch((error) => {
        console.error("AI Agent failed to answer:", error);
        process.exit(1);
    });

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

// Attempt 1 (without system istruction): Failed to answer this un-related question. Instead of gracefully declining the request, the ai model just went ahead and behaved like a normal model and answered the question.
// runAdvisor("How can I compute the area of a triangle using a circle?").catch(
//     console.error,
// );

// Attempt 2 (with system istruction): Excellent response. Graciously declined the question and advised about what the application is and how can the chatbot help.
// runAdvisor("How can I compute the area of a triangle using a circle?").catch(
//     console.error,
// );

// Excellent response. Used the tool to get the actual freshness of data and properly answered.
// runAdvisor("how up to date is this data?").catch(
//     console.error,
// );
