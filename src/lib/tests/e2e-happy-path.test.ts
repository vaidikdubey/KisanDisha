import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { prisma } from "../prisma";
import axios from "axios";
import { runIngestion } from "../runIngestion";
import { getPrices } from "../queries/prices";

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
    {
        state: "Madhya Pradesh",
        district: "Indore",
        market: "Indore Mandi",
        commodity: "Tomato",
        variety: "Hybrid",
        grade: "FAQ",
        arrival_date: "10/09/2026",
        min_price: 1100,
        max_price: 1600,
        modal_price: 1300,
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

describe("E2E: ingestion to query happy path", () => {
    it("ingests real records and getPrices returns them correctly", async () => {
        //Arrange
        (axios.get as ReturnType<typeof vi.fn>) = vi
            .fn()
            .mockResolvedValueOnce({ data: { records: fakeRecords } })
            .mockResolvedValueOnce({ data: { records: [] } });

        //Act
        await runIngestion(["Madhya Pradesh"]);
        const result = await getPrices({
            commodity: "Tomato",
            state: "Madhya Pradesh",
        });

        //Assert
        expect(result.total).toBe(2);
        expect(result.prices).toHaveLength(2);

        const bhopalRow = result.prices.find(
            (p) => p.market.name === "Bhopal Mandi",
        );
        expect(bhopalRow).toBeDefined();
        expect(bhopalRow?.modalPrice).toBe(1200);
        expect(bhopalRow?.market.district).toBe("Bhopal");
    });
});
