import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { runIngestion } from "../runIngestion";

vi.mock("axios");

const fakeRecords = [
    {
        state: "Madhya Pradesh",
        district: "Bhopal",
        market: "Bhopal Mandi",
        commodity: "Tomato",
        variety: "Hybrid",
        grade: "FAQ",
        arrival_date: "10/09/2026",
        min_price: 1000,
        max_price: 1500,
        modal_price: 1200,
    },
];

beforeEach(async () => {
    vi.clearAllMocks();
    await prisma.marketPrice.deleteMany();
    await prisma.market.deleteMany();
    await prisma.commodity.deleteMany();
    await prisma.ingestionJob.deleteMany();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("runIngestion idempotency", () => {
    it("does not create duplicate rows when run twice with identical data", async () => {
        (axios.get as ReturnType<typeof vi.fn>) = vi
            .fn()
            .mockResolvedValueOnce({ data: { records: fakeRecords } })
            .mockResolvedValueOnce({ data: { records: [] } })
            .mockResolvedValueOnce({ data: { records: fakeRecords } })
            .mockResolvedValueOnce({ data: { records: [] } });

        await runIngestion(["Madhya Pradesh"]);
        await runIngestion(["Madhya Pradesh"]);

        const count = await prisma.marketPrice.count();

        expect(count).toBe(1);
    });
});
