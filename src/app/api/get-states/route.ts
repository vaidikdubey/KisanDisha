import { StateRecord, StatesResponse } from "@/types/States";
import axios from "axios";

export async function GET(req: Request): Promise<Response> {
    try {
        const statesList = await axios.get(
            `https://api.data.gov.in/resource/a71e60f0-a21d-43de-a6c5-fa5d21600cdb?api-key=${process.env.LGD_GOV_API_KEY}&format=json`,
            { headers: { Accept: "application/json" } },
        );

        const states: StateRecord[] = statesList.data?.records.map(
            (record: StatesResponse) => {
                return {
                    state_code: record.state_code,
                    state_name_english: record.state_name_english,
                    state_name_local: record.state_name_local,
                    state_or_ut: record.state_or_ut,
                };
            },
        );

        const sortedStates = [...states].sort((s1, s2) => {
            const nameComparison = s1.state_name_english?.localeCompare(
                s2.state_name_english,
            );

            if (nameComparison != 0) return nameComparison;

            return s1.state_code - s2.state_code;
        });

        return Response.json(
            {
                success: true,
                message: "States list fetched",
                data: {
                    states: sortedStates,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error fetching states list ", error);
        return Response.json(
            {
                success: false,
                error: "Error fetching states list",
            },
            { status: 500 },
        );
    }
}
