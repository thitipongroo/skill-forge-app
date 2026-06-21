import { test, expect } from "@playwright/test";

const newEmail = () => `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@test.local`;

test("open a skill and log a focus session", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Email").fill(newEmail());
  await page.getByLabel("Password").fill("supersecret1");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.locator("input").first().fill("E2E Piano");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByText("E2E Piano").click();
  await expect(page).toHaveURL(/\/skill\//);

  // run the focus timer briefly, then log the session
  await page.getByRole("button", { name: "Start" }).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /Log this focus session/i }).click();
  await expect(page.getByText("Focus session")).toBeVisible();
});
