import { test, expect } from "@playwright/test";
import { parse } from "csv-parse/sync";
import * as fs from "node:fs";
import * as path from "node:path";
import { LoginPage } from "../pages/LoginPage";

interface LoginCredentials {
  Username: string;
  Password: string;
  Result: string;
}

const csvPath = path.join(__dirname, "..", "login_credentials_v2.csv");
const loginCredentials = parse<LoginCredentials>(
  fs.readFileSync(csvPath, "utf8"),
  {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  },
);

test.describe(
  "OrangeHRM data-driven login",
  { tag: ["@datadriven", "@login", "@smoke"] },
  () => {
    for (const credentials of loginCredentials) {
      test(`login for ${credentials.Username}: ${credentials.Result}`, async ({
        page,
      }) => {
        const loginPage = new LoginPage(page);

        await loginPage.goto();
        await loginPage.login(credentials.Username, credentials.Password);

        if (credentials.Result === "Dashboard") {
          await expect(page).toHaveURL(/\/dashboard/i);
          await expect(
            page.getByRole("heading", { name: "Dashboard" }),
          ).toBeVisible();
          await page.waitForTimeout(5000);
        } else if (credentials.Result === "Invalid credentials") {
          await expect(page.getByRole("alert")).toContainText(
            credentials.Result,
          );
          await expect(loginPage.loginHeading).toBeVisible();
          await page.waitForTimeout(5000);
        } else {
          throw new Error(
            `Unsupported expected login result: ${credentials.Result}`,
          );
        }
      });
    }
  },
);
