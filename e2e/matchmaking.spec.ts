import { test, expect } from "@playwright/test";

const SERVER_URL = "http://localhost:3000";

test.describe("Matchmaking flow", () => {
  // Server is started by the npm script (`start-server-and-test dev ...`) before Playwright runs.

  test("two players match and disconnect flow", async ({ browser }) => {
    // create two independent contexts (simulate two browsers)
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();

    // Open app pages
    await pageA.goto(SERVER_URL);

    // Wait for connected and waiting state in first client
    await expect(pageA.locator("text=Waiting for opponent")).toBeVisible();

    // Open second client and assert match made in both
    await pageB.goto(SERVER_URL);
    await expect(pageB.locator("text=Match found")).toBeVisible();
    await expect(pageA.locator("text=Match found")).toBeVisible();

    // Close second client and assert first shows opponent disconnected
    await contextB.close();
    await expect(pageA.locator("text=Opponent disconnected")).toBeVisible();

    await contextA.close();
  });
});
