import "dotenv/config" //For DB connection
import { IngestionStatus } from "@/lib/enum";
import { prisma } from "../src/lib/prisma";
import axios from "axios";
import { ingestionSchema } from "@/schemas/ingestionSchema";

function parseDate(date: string): Date {
    const [day, month, year] = date.split("/").map(Number);

    return new Date(year, month - 1, day);
}

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

async function ingest(state: string) {
    console.log("Ingestion started...")

    const job = await prisma.ingestionJob.create({
        data: {
            status: IngestionStatus["processing"],
        },
    });

    let processed = 0,
        failed = 0;

    const res = await axios.get(
        `https://api.data.gov.in/resource/${RESOURCE_ID}`,
        {
            params: {
                "api-key": process.env.LGD_GOV_API_KEY,
                format: "json",
                limit: 500,
                "filters[state]": state,
            },
        },
    );

    const raw = res.data;

    for (const row of raw.records) {
        const parsed = ingestionSchema.safeParse(row);
        if (!parsed.success) {
            failed++;
            continue;
        }

        const r = parsed.data;

        const commodity = await prisma.commodity.upsert({
            where: {
                name: r.commodity,
            },
            update: {},
            create: {
                name: r.commodity,
            },
        });

        const market = await prisma.market.upsert({
            where: {
                name_state_district: {
                    name: r.market,
                    state: r.state,
                    district: r.district,
                },
            },
            update: {},
            create: {
                name: r.market,
                state: r.state,
                district: r.district,
            },
        });

        await prisma.marketPrice.upsert({
            where: {
                commodityId_marketId_date_variety: {
                    commodityId: commodity.id,
                    marketId: market.id,
                    date: parseDate(r.arrival_date),
                    variety: r.variety
                }
            },
            update: {
                minPrice: r.min_price,
                maxPrice: r.max_price,
                modalPrice: r.modal_price,
            },
            create: {
                commodityId: commodity.id,
                marketId: market.id,
                date: parseDate(r.arrival_date),
                variety: r.variety,
                minPrice: r.min_price,
                maxPrice: r.max_price,
                modalPrice: r.modal_price,
            }
        })

        processed++
    }

    await prisma.ingestionJob.update({
        where: {
            id: job.id
        },
        data: {
            status: failed > 0 ? IngestionStatus.partial : IngestionStatus.completed,
            completedAt: new Date(),
            recordsProcessed: processed,
            recordsFailed: failed,
        }
    })

    console.log("Ingestion finished...")
}

ingest("Madhya Pradesh").finally(() => prisma.$disconnect())
