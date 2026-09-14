import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { fetchWithRetry } from "@/lib/runIngestion";

vi.mock("axios");

describe("fetchWithRetry", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers(); // don't actually wait through real backoff delays
    });

    it("retries on failure and eventually succeeds", async () => {
        const mockGet = vi
            .fn()
            .mockRejectedValueOnce(new Error("Network error"))
            .mockRejectedValueOnce(new Error("Network error"))
            .mockResolvedValueOnce({ data: { records: [] } });

        (axios.get as ReturnType<typeof vi.fn>) = mockGet;

        const promise = fetchWithRetry("Madhya Pradesh", "10/09/2026", 0);
        await vi.runAllTimersAsync(); // fast-forward through the delays
        const result = await promise;

        expect(mockGet).toHaveBeenCalledTimes(3); // failed, failed, succeeded
        expect(result?.data.records).toEqual([]);
    });

    it("throws after exhausting all retries", async () => {
        const mockGet = vi
            .fn()
            .mockRejectedValue(new Error("Persistent failure"));
        (axios.get as ReturnType<typeof vi.fn>) = mockGet;

        const promise = fetchWithRetry("Madhya Pradesh", "10/09/2026", 0, 3);
        const assertion = expect(promise).rejects.toThrow("Persistent failure");

        await vi.runAllTimersAsync();
        await assertion;

        expect(mockGet).toHaveBeenCalledTimes(3);
    });
});
