import { test, expect } from '@playwright/test';

test.describe('PathForge Fallback Roadmap Verification', () => {
  const timestamp = Date.now();
  const fallbackUser = {
    name: 'Fallback Tester',
    email: `fallback.tester.${timestamp}@example.com`,
    password: 'Password123!'
  };

  test('verifies deterministic fallback template generation and template badge on dashboard', async ({
    page
  }) => {
    // 1. Signup
    await page.goto('/signup');
    await page.getByLabel(/full name/i).fill(fallbackUser.name);
    await page.getByLabel(/email address/i).fill(fallbackUser.email);
    await page.locator('input[type="password"]').first().fill(fallbackUser.password);
    await page.locator('input[type="password"]').nth(1).fill(fallbackUser.password);
    await page.getByRole('button', { name: /sign up/i }).click();

    // 2. Select Data Analyst role
    await expect(page).toHaveURL(/\/roles/, { timeout: 15000 });
    const dataAnalystRole = page.getByRole('radio', { name: /data analyst/i });
    await dataAnalystRole.click();
    await page.getByRole('button', { name: /continue to diagnostic/i }).click();

    // 3. Complete Diagnostic
    await expect(page).toHaveURL(/\/diagnostic/, { timeout: 15000 });

    for (let q = 1; q <= 12; q++) {
      await expect(page.getByText(new RegExp(`question ${q} of 12`, 'i'))).toBeVisible({ timeout: 10000 });
      await page.getByRole('radio').first().click();

      if (q < 12) {
        await page.getByRole('button', { name: /next/i }).click();
      } else {
        await page.getByRole('button', { name: /submit diagnostic/i }).click();
      }
    }

    // 4. Generating & Arrival on Dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 35000 });

    // 5. Verify Fallback Badge and Content
    // Without GEMINI_API_KEY configured (or with FORCE_LLM_FAILURE=true),
    // the system safely serves the deterministic template roadmap.
    const badge = page.getByText(/template roadmap/i);
    await expect(badge).toBeVisible();

    // Verify role badge displays Data Analyst
    await expect(page.getByText('Data Analyst', { exact: true })).toBeVisible();

    // Verify the 6 modules rendered in vertical stepper
    await expect(page.getByText(/0 of 6 modules completed/i)).toBeVisible();
    const activeModule = page.getByRole('button', { name: /active/i }).first();
    await expect(activeModule).toBeVisible();
  });
});
