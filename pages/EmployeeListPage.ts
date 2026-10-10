import { Locator, Page } from "@playwright/test";

export class EmployeeListPage {
  readonly page: Page;
  readonly pimLink: Locator;
  readonly employeeInformationHeading: Locator;
  readonly employmentStatusDropdown: Locator;
  readonly searchButton: Locator;
  readonly profilePicture: Locator;
  readonly logoutMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pimLink = page.getByRole("link", { name: "PIM" });
    this.employeeInformationHeading = page.getByRole("heading", {
      name: "Employee Information",
    });
    this.employmentStatusDropdown = page
      .locator(".oxd-input-group")
      .filter({ has: page.getByText("Employment Status", { exact: true }) })
      .getByText("-- Select --", { exact: true });
    this.searchButton = page.getByRole("button", { name: "Search" });
    this.profilePicture = page.getByRole("img", {
      name: "profile picture",
    });
    this.logoutMenuItem = page.getByRole("menuitem", { name: "Logout" });
  }

  async open() {
    await this.pimLink.click();
  }

  async filterByEmploymentStatus(status: string) {
    await this.employmentStatusDropdown.click();
    await this.page.getByRole("option", { name: status, exact: true }).click();
    await this.searchButton.click();
  }

  employeeRow(lastName: string) {
    return this.page
      .getByRole("row")
      .filter({ has: this.page.getByRole("cell", { name: lastName, exact: true }) });
  }

  async logout() {
    await this.profilePicture.click();
    await this.logoutMenuItem.click();
  }
}
