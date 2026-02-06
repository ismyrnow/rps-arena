import { test, expect } from "@playwright/test";

const SERVER_URL = "http://localhost:3000";

test.describe("Matchmaking flow", () => {
  test("two players match and disconnect flow", async ({ browser }) => {
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();

    await pageA.goto(SERVER_URL);
    await expect(pageA.locator("text=Waiting for opponent")).toBeVisible();

    await pageB.goto(SERVER_URL);
    await expect(pageB.locator("text=Match found")).toBeVisible();
    await expect(pageA.locator("text=Match found")).toBeVisible();

    await contextB.close();
    await expect(pageA.locator("text=Opponent left")).toBeVisible();

    await contextA.close();
  });
});

test.describe("Gameplay flow", () => {
  test("two players select moves and see results", async ({ browser }) => {
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();

    // Match two players
    await pageA.goto(SERVER_URL);
    await expect(pageA.locator("text=Waiting for opponent")).toBeVisible();

    await pageB.goto(SERVER_URL);
    await expect(pageB.locator("text=Match found")).toBeVisible();
    await expect(pageA.locator("text=Match found")).toBeVisible();

    // Wait for playing state (move selection)
    await expect(pageA.locator("text=Choose your move")).toBeVisible({
      timeout: 10000,
    });
    await expect(pageB.locator("text=Choose your move")).toBeVisible({
      timeout: 10000,
    });

    // Both players select moves
    await pageA.locator('[data-testid="move-rock"]').click();
    await expect(pageA.locator("text=Waiting for opponent")).toBeVisible();

    await pageB.locator('[data-testid="move-scissors"]').click();

    // Both should see results
    await expect(pageA.locator('[data-testid="result-text"]')).toBeVisible({
      timeout: 10000,
    });
    await expect(pageB.locator('[data-testid="result-text"]')).toBeVisible({
      timeout: 10000,
    });

    // Player A (rock) beats Player B (scissors)
    await expect(pageA.locator('[data-testid="result-text"]')).toContainText(
      "You win!",
    );
    await expect(pageB.locator('[data-testid="result-text"]')).toContainText(
      "You lose!",
    );

    // Rematch and leave buttons should appear
    await expect(pageA.locator('[data-testid="rematch-btn"]')).toBeVisible({
      timeout: 10000,
    });
    await expect(pageA.locator('[data-testid="leave-btn"]')).toBeVisible();

    // Player A leaves — should go back to lobby
    await pageA.locator('[data-testid="leave-btn"]').click();
    await expect(pageA.locator("text=Waiting for opponent")).toBeVisible({
      timeout: 10000,
    });

    // Player B should see the abandoned screen
    await expect(pageB.locator("text=Opponent left")).toBeVisible({
      timeout: 10000,
    });

    await contextA.close();
    await contextB.close();
  });
});
