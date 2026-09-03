//Handler function as per AWS Lambda requirements
import { runIngestion } from "../src/lib/runIngestion"

export const handler = async() => { 
    const result = await runIngestion(["Madhya Pradesh"])

    return {
        statusCode: 200,
        body: JSON.stringify(result)
    }
}