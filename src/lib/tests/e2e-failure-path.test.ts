import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { prisma } from "../prisma";
import axios from "axios";
import { runIngestion } from "../runIngestion";

vi.mock("axios");

const fakeRecords = [
    {
        state: "Madhya Pradesh",
        district: "Ujjain",
        market: "Ujjain Mandi",
        commodity: "Onion",
        variety: "Local",
        grade: "FAQ",
        arrival_date: "10/09/2026",
        min_price: 800,
        max_price: 1000,
        modal_price: 900,
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

describe("E2E: failure and recovery", () => {
    it("does not duplicate data when a failed run is followed by a successful retry", async () => {
        // Arrange — first "run" fails outright (simulates a crash mid-ingestion,
        // e.g. the government API going down entirely for that state)
        (axios.get as ReturnType<typeof vi.fn>) = vi
            .fn()
            .mockRejectedValueOnce(new Error("Simulated total failure"))
            .mockRejectedValueOnce(new Error("Simulated total failure"))
            .mockRejectedValueOnce(new Error("Simulated total failure"))
            // second run — first date: one page of data, then empty to stop pagination
            .mockResolvedValueOnce({ data: { records: fakeRecords } })
            .mockResolvedValueOnce({ data: { records: [] } })
            // second run — second date: nothing to report
            .mockResolvedValueOnce({ data: { records: [] } });

        // Act — first run fails, second run (simulating the next scheduled trigger) succeeds
        const firstRun = await runIngestion(["Madhya Pradesh"]);
        const secondRun = await runIngestion(["Madhya Pradesh"]);

        //Assert
        expect(firstRun.failedStates).toContain("Madhya Pradesh");
        expect(firstRun.totalFailed).toBe(0);

        expect(secondRun.failedStates).toHaveLength(0);
        expect(secondRun.totalProcessed).toBe(1);

        // The real point of this test: exactly one row exists, not zero, not two
        const count = await prisma.marketPrice.count();
        expect(count).toBe(1);

        const job = await prisma.ingestionJob.findFirst({
            orderBy: { completedAt: "desc" },
        });
        expect(job?.status).toBe("COMPLETED");
    }, 15000);
});
