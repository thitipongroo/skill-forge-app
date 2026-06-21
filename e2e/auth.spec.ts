import { test, expect } from "@playwright/test";

const newEmail = () => `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@test.local`;

test("register, create a skill, then sign out", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Email").fill(newEmail());
  await page.getByLabel("Password").fill("supersecret1");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByLabel(/.*/).first(); // dashboard loaded
  await page.locator('input').first().fill("E2E Guitar");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByText("E2E Guitar")).toBeVisible();

  await page.goto("/settings");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("unauthenticated visits are redirected to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
