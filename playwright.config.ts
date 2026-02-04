import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
