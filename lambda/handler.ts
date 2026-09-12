//Handler function as per AWS Lambda requirements
import { runIngestion } from "../src/lib/runIngestion";

export const handler = async () => {
    const result = await runIngestion([
        "Madhya Pradesh",
        "Uttar Pradesh",
        "Maharashtra",
        "Punjab",
        "Rajasthan",
        "Andhra Pradesh",
        "Himachal Pradesh"
    ]);

    return {
        statusCode: 200,
        body: JSON.stringify(result),
    };
};
