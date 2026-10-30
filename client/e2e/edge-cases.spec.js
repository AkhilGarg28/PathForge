import { test, expect } from '@playwright/test';

test.describe('PathForge Edge Cases', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://localhost:5000/api/test/reset');
    await request.post('http://localhost:5000/api/test/llm-flag', {
      data: { forceFailure: false },
    });
  });

  test('refresh at every page preserves session and state', async ({ page }) => {
    const timestamp = Date.now();
    const userEmail = `refresh_user_${timestamp}@example.com`;

    // 1. Signup & navigate to /roles
    await page.goto('/signup');
    await page.fill('#signup-name', 'Refresh User');
    await page.fill('#signup-email', userEmail);
    await page.fill('#signup-password', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/roles/);

    // Refresh on /roles
    await page.reload();
    await expect(page).toHaveURL(/\/roles/);
    await expect(page.locator('.page-title')).toContainText('Choose Your Target Role');

    // 2. Select role & navigate to /diagnostic
    await page.locator('.role-selection-card', { hasText: 'MERN Developer' }).click();
    await page.click('.btn-continue-roles');
    await expect(page).toHaveURL(/\/diagnostic/);

    // Answer first question
    await page.locator('.diagnostic-option-card').first().click();
    // Refresh on /diagnostic
    await page.reload();
    await expect(page).toHaveURL(/\/diagnostic/);
    // Answer is preserved from sessionStorage
    await expect(page.locator('.diagnostic-option-card').first()).toHaveClass(/selected/);

    // Finish quiz and reach /dashboard
    let isLast = false;
    while (!isLast) {
      await page.locator('.diagnostic-option-card').first().click();
      const submitBtn = page.locator('.btn-submit-diagnostic');
      if (await submitBtn.isVisible()) {
        isLast = true;
        await submitBtn.click();
      } else {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(200);
      }
    }
    await page.click('button:has-text("Confirm & Submit")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 25000 });

    // Refresh on /dashboard
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('.dashboard-main-title')).toContainText('MERN Developer');

    // 3. Open active module & refresh on /module/:id
    await page.locator('.stepper-card-wrapper').first().click();
    await expect(page).toHaveURL(/\/module\/mod-1/);
    await page.reload();
    await expect(page).toHaveURL(/\/module\/mod-1/);
    await expect(page.locator('.module-hero-title')).toBeVisible();

    // 4. Open Settings & refresh on /settings
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/);
    await page.reload();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.locator('#settings-name')).toHaveValue('Refresh User');
  });

  test('back button during the diagnostic quiz restores previous question and answers', async ({
    page,
  }) => {
    const timestamp = Date.now();
    await page.goto('/signup');
    await page.fill('#signup-name', 'Quiz Back User');
    await page.fill('#signup-email', `back_user_${timestamp}@example.com`);
    await page.fill('#signup-password', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/roles/);
    await page.locator('.role-selection-card', { hasText: 'MERN Developer' }).click();
    await page.click('.btn-continue-roles');
    await expect(page).toHaveURL(/\/diagnostic/);

    // Question 1: Select Option B (index 1)
    const optionsQ1 = page.locator('.diagnostic-option-card');
    await optionsQ1.nth(1).click();
    await expect(optionsQ1.nth(1)).toHaveClass(/selected/);

    // Click Next
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(300);

    // Question 2: Verify on Question 2
    await expect(page.locator('.diagnostic-step-counter')).toContainText('Question 2');

    // Click Back
    await page.click('button:has-text("Back")');
    await page.waitForTimeout(300);

    // Verify returned to Question 1 and Option B is still selected
    await expect(page.locator('.diagnostic-step-counter')).toContainText('Question 1');
    await expect(page.locator('.diagnostic-option-card').nth(1)).toHaveClass(/selected/);
  });

  test('double-click on submit disables button to prevent duplicate requests', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('#signup-name', 'Submit DoubleClick User');
    await page.fill('#signup-email', `doubleclick_${Date.now()}@example.com`);
    await page.fill('#signup-password', 'Password123');

    const submitBtn = page.locator('button[type="submit"]');
    // First click initiates submission
    await submitBtn.click();
    // Verify button gets disabled during submit
    await expect(submitBtn).toBeDisabled();
  });

  test('expired / missing cookie redirects away from protected routes to /login', async ({
    page,
    context,
  }) => {
    // Attempting to visit /dashboard directly without authentication
    await context.clearCookies();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);

    // Attempting to visit /settings directly without authentication
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login/);
  });

  test('submitting diagnostic twice in rapid succession enforces rate limit (429)', async ({
    page,
  }) => {
    test.setTimeout(60000);
    const timestamp = Date.now();
    const userEmail = `ratelimit_${timestamp}@example.com`;

    // 1. Sign up user
    await page.goto('/signup');
    await page.fill('#signup-name', 'Rate Limit User');
    await page.fill('#signup-email', userEmail);
    await page.fill('#signup-password', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/roles/);
    await page.locator('.role-selection-card', { hasText: 'MERN Developer' }).click();
    await page.click('.btn-continue-roles');
    await expect(page).toHaveURL(/\/diagnostic/);

    // Complete diagnostic first time
    let isLast = false;
    while (!isLast) {
      await page.locator('.diagnostic-option-card').first().click();
      const submitBtn = page.locator('.btn-submit-diagnostic');
      if (await submitBtn.isVisible()) {
        isLast = true;
        await submitBtn.click();
      } else {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(150);
      }
    }
    await page.click('button:has-text("Confirm & Submit")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 25000 });

    // 2. Immediately switch role and submit a second diagnostic within 2 minutes
    await page.goto('/settings');
    await page.locator('#new-role-select').selectOption({ label: 'Data Analyst' });
    await page.click('button:has-text("Change Target Role")');
    await page.locator('.btn-danger-confirm').click();

    await expect(page).toHaveURL(/\/diagnostic/);
    isLast = false;
    while (!isLast) {
      await page.locator('.diagnostic-option-card').first().click();
      const submitBtn = page.locator('.btn-submit-diagnostic');
      if (await submitBtn.isVisible()) {
        isLast = true;
        await submitBtn.click();
      } else {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(150);
      }
    }
    await page.click('button:has-text("Confirm & Submit")');

    // Generating page catches 429 rate limit and shows reassuring error message
    await expect(page.locator('.generating-error-view')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.generating-error-view')).toContainText(
      /Too many roadmap generation requests|rate limit|every 2 minutes/i
    );
  });

  test('user with no roadmap opening /dashboard renders empty state with prompt to start', async ({
    page,
  }) => {
    const timestamp = Date.now();
    await page.goto('/signup');
    await page.fill('#signup-name', 'No Roadmap User');
    await page.fill('#signup-email', `noroadmap_${timestamp}@example.com`);
    await page.fill('#signup-password', 'Password123');
    await page.click('button[type="submit"]');

    // User is on /roles but manually types /dashboard
    await expect(page).toHaveURL(/\/roles/);
    await page.goto('/dashboard');

    // Empty state card is rendered
    await expect(page.locator('.dashboard-empty-card')).toBeVisible();
    await expect(page.locator('.empty-card-title')).toBeVisible();
    await expect(page.locator('.empty-card-actions')).toBeVisible();
  });

  test('direct URL navigation to a locked module redirects back to /dashboard with toast warning', async ({
    page,
  }) => {
    const timestamp = Date.now();
    await page.goto('/signup');
    await page.fill('#signup-name', 'Locked Module User');
    await page.fill('#signup-email', `locked_${timestamp}@example.com`);
    await page.fill('#signup-password', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/roles/);
    await page.locator('.role-selection-card', { hasText: 'MERN Developer' }).click();
    await page.click('.btn-continue-roles');

    // Complete quiz to get roadmap
    let isLast = false;
    while (!isLast) {
      await page.locator('.diagnostic-option-card').first().click();
      const submitBtn = page.locator('.btn-submit-diagnostic');
      if (await submitBtn.isVisible()) {
        isLast = true;
        await submitBtn.click();
      } else {
        await page.locator('button:has-text("Next")').click();
        await page.waitForTimeout(150);
      }
    }
    await page.click('button:has-text("Confirm & Submit")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 25000 });

    // Module 2 is locked. Navigate directly to module 2
    const lockedModule = page.locator('.stepper-item[data-status="locked"]').first();
    const lockedModuleId = await lockedModule.getAttribute('data-module-id');

    await page.goto(`/module/${lockedModuleId}`);

    // Should redirect back to /dashboard and show warning toast
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('.toast').first()).toContainText(/locked/i);
  });
});
