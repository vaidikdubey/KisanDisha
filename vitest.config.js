import { defineConfig } from "vitest/config";
import path from "path";

//Defining config file to specify environment, setup files and resolve with alisa to support @
export default defineConfig({
    test: {
        environment: "node",
        setupFiles: ["./vitest.setup.ts"],
        restoreMocks: true,
        mockReset: true,
        fileParallelism: false, // tests share a real Postgres DB - must run one file at a time
    },
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
