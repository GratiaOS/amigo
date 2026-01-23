import path from "node:path";
import { defineConfig } from "@playwright/test";

const rootDir = path.resolve(__dirname, "..", "..");

export default defineConfig({
  testDir: path.join(__dirname, "tests"),
  timeout: 60_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev",
    cwd: rootDir,
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
