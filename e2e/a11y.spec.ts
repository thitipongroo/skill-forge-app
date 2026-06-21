import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const newEmail = () => `a11y_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@test.local`;

async function scan(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

test("login page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/login");
  expect(await scan(page)).toEqual([]);
});

test("register page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/register");
  expect(await scan(page)).toEqual([]);
});

test("dashboard (authenticated) has no serious accessibility violations", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Email").fill(newEmail());
  await page.getByLabel("Password").fill("supersecret1");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  expect(await scan(page)).toEqual([]);
});
