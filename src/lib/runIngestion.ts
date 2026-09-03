import { IngestionStatus } from "../helpers/enum";
import { prisma } from "./prisma";
import axios from "axios";
import { ingestionSchema } from "../schemas/ingestionSchema";

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const LIMIT = 500;

function parseDate(date: string): Date {
  const [day, month, year] = date.split("/").map(Number);
  return new Date(year, month - 1, day);
}

async function fetchWithRetry(state: string, offset: number, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(`https://api.data.gov.in/resource/${RESOURCE_ID}`, {
        params: {
          "api-key": process.env.LGD_GOV_API_KEY,
          format: "json",
          limit: LIMIT,
          offset,
          "filters[state]": state, // no space — this was the bug
        },
        timeout: 15000,
      });
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retrying ${state} (offset ${offset}) in ${2000 * (i + 1)}ms`);
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

async function ingestState(state: string): Promise<{ processed: number; failed: number }> {
  let processed = 0, failed = 0, offset = 0;

  while (true) {
    const res = await fetchWithRetry(state, offset);
    const records = res?.data?.records ?? [];
    if (records.length === 0) break;

    for (const row of records) {
      const parsed = ingestionSchema.safeParse(row);
      if (!parsed.success) {
        failed++;
        console.error(`Validation failed in ${state}:`, parsed.error.flatten());
        continue;
      }
      const r = parsed.data;

      const commodity = await prisma.commodity.upsert({
        where: { name: r.commodity }, update: {}, create: { name: r.commodity },
      });
      const market = await prisma.market.upsert({
        where: { name_state_district: { name: r.market, state: r.state, district: r.district } },
        update: {},
        create: { name: r.market, state: r.state, district: r.district },
      });
      await prisma.marketPrice.upsert({
        where: {
          commodityId_marketId_date_variety: {
            commodityId: commodity.id, marketId: market.id,
            date: parseDate(r.arrival_date), variety: r.variety,
          },
        },
        update: { minPrice: r.min_price, maxPrice: r.max_price, modalPrice: r.modal_price },
        create: {
          commodityId: commodity.id, marketId: market.id, date: parseDate(r.arrival_date),
          variety: r.variety, minPrice: r.min_price, maxPrice: r.max_price, modalPrice: r.modal_price,
        },
      });
      processed++;
    }

    if (records.length < LIMIT) break;
    offset += LIMIT;
  }
  return { processed, failed };
}

export async function runIngestion(states: string[]) {
  console.log("Ingestion started...");
  const job = await prisma.ingestionJob.create({ data: { status: IngestionStatus.processing } });

  let totalProcessed = 0, totalFailed = 0;
  const failedStates: string[] = [];

  for (const state of states) {
    try {
      const { processed, failed } = await ingestState(state);
      totalProcessed += processed;
      totalFailed += failed;
    } catch (error) {
      console.error(`State "${state}" failed completely:`, error);
      failedStates.push(state);
    }
  }

  const allFailed = failedStates.length === states.length;
  await prisma.ingestionJob.update({
    where: { id: job.id },
    data: {
      status: allFailed ? IngestionStatus.failed
        : (totalFailed > 0 || failedStates.length > 0) ? IngestionStatus.partial
        : IngestionStatus.completed,
      completedAt: new Date(),
      recordsProcessed: totalProcessed,
      recordsFailed: totalFailed,
    },
  });

  console.log("Ingestion finished:", { totalProcessed, totalFailed, failedStates });
  return { totalProcessed, totalFailed, failedStates };
}