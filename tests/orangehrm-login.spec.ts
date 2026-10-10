import { test, expect } from "@playwright/test";

test.describe("OrangeHRM login", { tag: ["@smoke", "@e2e"] }, () => {
  test("user can log in and see the Dashboard", async ({ page }) => {
    await page.goto(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
    );

    await page.getByRole("textbox", { name: "Username" }).fill("Admin");
    await page.getByRole("textbox", { name: "Password" }).fill("admin123");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
  });
});
