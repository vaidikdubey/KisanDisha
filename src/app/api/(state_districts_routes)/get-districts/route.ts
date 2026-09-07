import { DistrictRecord, DistrictResponse } from "@/types/Districts";
import axios from "axios";
import { NextRequest } from "next/server";

const RESOURCE_ID = "37231365-78ba-44d5-ac22-3deec40b9197"

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const stateCode = req.nextUrl.searchParams.get("state");

        if (!stateCode)
            return Response.json(
                {
                    success: false,
                    error: "State code is required to fetch districts",
                },
                { status: 400 },
            );

        const districtsList = await axios.get(
            `https://api.data.gov.in/resource/${RESOURCE_ID}`,
            {
                params: {
                    "api-key": process.env.LGD_GOV_API_KEY,
                    format: "json",
                    limit: 100,
                    "filters[state_code]": stateCode,
                },
            }
        );

        const districts: DistrictRecord[] = districtsList.data?.records.map(
            (record: DistrictResponse) => {
                return {
                    state_code: record.state_code,
                    state_name_english: record.state_name_english,
                    state_name_local: record.state_name_local,
                    district_code: record.district_code,
                    district_name_english: record.district_name_english,
                    district_name_local: record.district_name_local,
                };
            },
        );

        const sortedDistricts = [...districts].sort((d1, d2) => {
            const nameComparison = d1.district_name_english?.localeCompare(
                d2.district_name_english,
            );

            if (nameComparison != 0) return nameComparison;

            return d1.district_code - d2.district_code;
        });

        return Response.json(
            {
                success: true,
                message: "Districts list fetched",
                data: {
                    districts: sortedDistricts,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error fetching districts list ", error);
        return Response.json(
            {
                success: false,
                error: "Error fetching districts list",
            },
            { status: 500 },
        );
    }
}
