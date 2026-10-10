import { test, expect } from "@playwright/test";
import { EmployeeListPage } from "../pages/EmployeeListPage";
import { LoginPage } from "../pages/LoginPage";

test.describe(
  "OrangeHRM employment status and logout",
  { tag: ["@smoke", "@e2e"] },
  () => {
    test("user can verify an employee and log out", async ({ page }) => {
      const loginPage = new LoginPage(page);
      const employeeListPage = new EmployeeListPage(page);

      await loginPage.goto();
      await loginPage.login("Admin", "admin123");

      await expect(employeeListPage.pimLink).toBeVisible();
      await employeeListPage.open();
      await expect(employeeListPage.employeeInformationHeading).toBeVisible();

      await employeeListPage.filterByEmploymentStatus("Full-Time Contract");

      const harmonyRow = employeeListPage.employeeRow("Harmony");
      await expect(
        harmonyRow.getByRole("cell", { name: "Harmony", exact: true }),
      ).toBeVisible();
      await expect(
        harmonyRow.getByRole("cell", {
          name: "Quality Assurance",
          exact: true,
        }),
      ).toBeVisible();

      await employeeListPage.logout();
      await expect(loginPage.loginHeading).toBeVisible();
    });
  },
);
