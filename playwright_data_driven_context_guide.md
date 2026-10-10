# PLAYWRIGHT DATA-DRIVEN TESTING CONTEXT GUIDE (CSV + POM)

## PURPOSE
Guide Playwright MCP and AI Agent to generate, structure, and execute Data-Driven Playwright tests in TypeScript using external CSV files and the Page Object Model (POM) design pattern.

---

## PHASE 1: PREREQUISITES & DEPENDENCY CHECK

Before generating test scripts, verify/install the required CSV parsing package:
```bash
npm install csv-parse
```

Ensure the CSV file exists in the workspace (e.g., `login_credentials_v2.csv`) with clear column headers:
```csv
Username,Password,Result
Admin,admin123,Dashboard
Admin,admin12345678,Invalid credentials
```

---

## PHASE 2: PAGE OBJECT MODEL DESIGN

### 1. Page Object Class (`pages/LoginPage.ts`)
- Store locators as class properties (`getByRole`, `getByLabel`, `getByTestId`).
- Encapsulate user interaction workflows as methods.
- Keep assertions out of page classes (or limit to page state validations).

### Example LoginPage:
```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

---

## PHASE 3: DATA-DRIVEN TEST SPECIFICATION

### 1. Data-Driven Spec (`tests/login-data-driven.spec.ts`)
- Use `fs` and `csv-parse/sync` to load and parse the CSV data before or during test definition.
- Loop over records using a standard `for...of` loop so each row generates an individual Playwright test case.
- Map row headers (`record.Username`, `record.Password`, `record.Result`) dynamically into actions and assertions.

### Example Spec File:
```typescript
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { LoginPage } from '../pages/LoginPage';

// Read and parse CSV data dynamically
const csvPath = path.join(__dirname, '../login_credentials_v2.csv');
const records = parse(fs.readFileSync(csvPath), {
  columns: true,
  skip_empty_lines: true,
});

test.describe('OrangeHRM Data-Driven Login Suite', { tag: ['@datadriven', '@login'] }, () => {
  for (const record of records) {
    test(`Login attempt for user: ${record.Username} - Expected: ${record.Result}`, async ({ page }) => {
      const loginPage = new LoginPage(page);

      // Step 1: Navigate
      await loginPage.navigateTo('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');

      // Step 2 & 3: Perform login driven by CSV
      await loginPage.login(record.Username, record.Password);

      // Step 4: Validate outcome based on CSV Result column
      if (record.Result === 'Dashboard') {
        await expect(page).toHaveURL(/dashboard/i);
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      } else if (record.Result === 'Invalid credentials') {
        await expect(page.getByText('Invalid credentials')).toBeVisible();
      }
    });
  }
});
```

---

## PHASE 4: EXECUTION & ITERATIVE FIXING

1. Save the generated files into:
   - `/pages/LoginPage.ts`
   - `/tests/login-data-driven.spec.ts`

2. Run the test suite:
   ```bash
   npx playwright test tests/login-data-driven.spec.ts
   ```

3. Iterative Fixing Rules:
   - If a test fails due to missing selectors, use Playwright MCP tools to inspect real DOM elements and refine locators.
   - If `csv-parse` import fails, ensure `npm install csv-parse` was run.
   - Re-run tests until all parameterized cases pass cleanly without flakiness.