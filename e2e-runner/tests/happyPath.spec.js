import { test, expect } from '@playwright/test';

test.describe('PathForge Full Happy Path & Fallback Path E2E Suite', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Jane Doe',
    updatedName: 'Jane Senior Engineer',
    email: `jane.doe.${timestamp}@example.com`,
    password: 'Password123!'
  };

  test('walks the full user journey: signup -> role selection -> quiz -> generating -> dashboard -> complete module -> settings update -> logout -> login data persistence', async ({
    page
  }) => {
    page.on('console', (msg) => console.log(`[BROWSER ${msg.type()}]`, msg.text()));
    page.on('pageerror', (err) => console.log('[BROWSER UNCAUGHT]', err.message));
    page.on('response', (res) => {
      if (res.status() >= 400) console.log('[HTTP ERROR]', res.status(), res.url());
    });

    // 1. Visit Landing Page
    await page.goto('/');
    await expect(page).toHaveTitle(/PathForge/i);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // 2. Click Sign Up / Get Started
    const getStartedBtn = page.getByRole('button', { name: /start free assessment/i });
    await getStartedBtn.click();
    await expect(page).toHaveURL(/\/signup/);

    // 3. Complete Signup Form
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    await page.getByLabel(/full name/i).fill(testUser.name);
    await page.getByLabel(/email address/i).fill(testUser.email);
    await page.locator('input[type="password"]').first().fill(testUser.password);
    await page.locator('input[type="password"]').nth(1).fill(testUser.password);

    await page.getByRole('button', { name: /sign up/i }).click();

    // 4. Role Selection Screen
    await expect(page).toHaveURL(/\/roles/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /choose your career trajectory/i })).toBeVisible();

    // Select "MERN Developer" role
    const mernRoleCard = page.getByRole('radio', { name: /mern developer/i });
    await mernRoleCard.click();
    await expect(mernRoleCard).toHaveAttribute('aria-checked', 'true');

    // Confirm role selection
    await page.getByRole('button', { name: /continue to diagnostic/i }).click();

    // 5. Diagnostic Quiz
    await expect(page).toHaveURL(/\/diagnostic/, { timeout: 15000 });
    await expect(page.getByText(/question 1 of/i)).toBeVisible();

    // Iterate through all 12 questions and select an answer for each
    for (let q = 1; q <= 12; q++) {
      // Ensure current question is displayed
      await expect(page.getByText(new RegExp(`question ${q} of 12`, 'i'))).toBeVisible({ timeout: 10000 });

      // Select the first radio option
      const firstOption = page.getByRole('radio').first();
      await firstOption.click();

      if (q < 12) {
        // Click Next Question
        const nextBtn = page.getByRole('button', { name: /next/i });
        await nextBtn.click();
      } else {
        // On last question, click Submit Diagnostic
        const submitBtn = page.getByRole('button', { name: /submit diagnostic/i });
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();
      }
    }

    // 6. Generating & Dashboard Screen
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 35000 });
    await expect(page.getByRole('heading', { name: new RegExp(`${testUser.name}'s Roadmap`, 'i') })).toBeVisible();

    // Verify pinned Readiness Score card exists
    await expect(page.getByText(/readiness/i).first()).toBeVisible();

    // Verify roadmap badge (either AI generated or Template fallback)
    const badgeText = page.locator('text=/(AI generated roadmap|Template roadmap)/i').first();
    await expect(badgeText).toBeVisible();

    // Check initial modules summary
    await expect(page.getByText(/0 of 6 modules completed/i)).toBeVisible();

    // 7. Open Active Module Detail
    const activeModuleCard = page.getByRole('button', { name: /active/i }).first();
    await expect(activeModuleCard).toBeVisible();
    await activeModuleCard.click();

    // 8. Module Detail Screen
    await expect(page).toHaveURL(/\/module\//, { timeout: 10000 });
    await expect(page.getByText(/active module/i)).toBeVisible();
    await expect(page.getByText(/curated learning resources/i)).toBeVisible();

    // Check Mark as Complete button
    const completeBtn = page.getByRole('button', { name: /mark as complete/i });
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();

    // Verify completion badge appears
    await expect(page.getByText(/completed ✓/i)).toBeVisible();

    // Click Back to Dashboard
    await page.getByRole('link', { name: /back to dashboard/i }).first().click();

    // 9. Verify Return to Dashboard with Updated Progress
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText(/1 of 6 modules completed/i)).toBeVisible();

    // Verify second module is now active
    const activeModulesNow = page.getByRole('button', { name: /active/i });
    await expect(activeModulesNow).toBeVisible();

    // 10. Settings Page & Profile Update
    await page.getByRole('link', { name: /settings/i }).click();
    await expect(page).toHaveURL(/\/settings/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /account settings/i })).toBeVisible();

    // Check current name and update it
    const nameInput = page.getByLabel(/display name/i);
    await expect(nameInput).toHaveValue(testUser.name);
    await nameInput.fill(testUser.updatedName);
    await page.getByRole('button', { name: /save name/i }).click();

    // Verify toast confirmation
    await expect(page.getByText(/display name updated successfully/i)).toBeVisible();

    // 11. Sign Out
    const signOutBtn = page.getByRole('button', { name: /sign out/i }).first();
    await signOutBtn.click();

    // Verify login page redirect
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // 12. Re-login & Verify Persistence
    await expect(page.getByRole('heading', { name: /sign in to pathforge/i })).toBeVisible();
    await page.getByLabel(/email address/i).fill(testUser.email);
    await page.locator('input[type="password"]').fill(testUser.password);
    await page.locator('button[type="submit"]').click();

    // Should redirect directly to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Verify updated name and persistent 1 of 6 modules completed
    await expect(
      page.getByRole('heading', { name: new RegExp(`${testUser.updatedName}'s Roadmap`, 'i') })
    ).toBeVisible();
    await expect(page.getByText(/1 of 6 modules completed/i)).toBeVisible();
  });
});
