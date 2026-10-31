import { test, expect } from '@playwright/test';

test.describe('PathForge Core User Journey', () => {
  test.beforeEach(async ({ request }) => {
    // Reset test database and reset LLM failure flag before test
    await request.post('http://localhost:5000/api/test/reset');
    await request.post('http://localhost:5000/api/test/llm-flag', {
      data: { forceFailure: false },
    });
  });

  test('complete end-to-end user journey: signup -> role -> diagnostic -> dashboard -> complete module -> checkpoint with low score replan -> change role -> logout', async ({
    page,
  }) => {
    test.setTimeout(90000);
    const timestamp = Date.now();
    const userEmail = `alex_${timestamp}@example.com`;
    const userPassword = 'Password123';

    // 1. Landing page & Signup
    await page.goto('/');
    await expect(page.locator('.hero-title')).toBeVisible();
    await page.click('text=Find Your Path');
    await expect(page).toHaveURL(/\/signup/);

    await page.fill('#signup-name', 'Alex Mercer');
    await page.fill('#signup-email', userEmail);
    await page.fill('#signup-password', userPassword);
    await page.click('button[type="submit"]');

    // 2. Role Selection (/roles)
    await expect(page).toHaveURL(/\/roles/);
    await expect(page.locator('.page-title')).toContainText('Choose Your Target Role');

    // Select "MERN Developer" role card
    const mernCard = page.locator('.role-selection-card', { hasText: 'MERN Developer' });
    await expect(mernCard).toBeVisible();
    await mernCard.click();
    await expect(mernCard).toHaveClass(/role-card-selected/);

    // Continue to Diagnostic
    const continueBtn = page.locator('.btn-continue-roles');
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // 3. Diagnostic Quiz (/diagnostic)
    await expect(page).toHaveURL(/\/diagnostic/);
    await expect(page.locator('.diagnostic-header')).toBeVisible();

    // Answer questions one by one
    let isLast = false;
    while (!isLast) {
      // Pick first option
      const firstOption = page.locator('.diagnostic-option-card').first();
      await firstOption.click();
      await expect(firstOption).toHaveClass(/selected/);

      const submitBtn = page.locator('.btn-submit-diagnostic');
      if (await submitBtn.isVisible()) {
        isLast = true;
        await submitBtn.click();
      } else {
        const nextBtn = page.locator('button:has-text("Next")');
        await nextBtn.click();
        await page.waitForTimeout(200);
      }
    }

    // Confirmation Modal
    await expect(page.locator('#confirm-modal-title')).toBeVisible();
    await page.click('button:has-text("Confirm & Submit")');

    // 4. Generating page (/generating) & Dashboard (/dashboard)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 25000 });
    await expect(page.locator('.dashboard-main-title')).toContainText('MERN Developer');

    // Readiness score and module list visible
    const readinessScore = page.locator('.readiness-number');
    await expect(readinessScore).toBeVisible();
    const initialScoreText = await readinessScore.innerText();

    const stepperItems = page.locator('.stepper-item');
    await expect(stepperItems).toHaveCount(6);

    // Module 1 is active and clickable
    await expect(stepperItems.first().locator('.stepper-node-active')).toBeVisible();

    // Module 2 is locked and unclickable
    await expect(stepperItems.nth(1).locator('.stepper-node-locked')).toBeVisible();

    // 5. Complete Active Module (/module/:moduleId)
    await stepperItems.first().locator('.stepper-card-wrapper').click();
    await expect(page).toHaveURL(/\/module\/mod-1/);
    await expect(page.locator('.module-hero-title')).toBeVisible();

    // Check all checklist items
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThan(0);

    for (let i = 0; i < checkboxCount; i++) {
      await checkboxes.nth(i).check();
    }

    // Both "Take Checkpoint" and "Mark as Complete" become enabled
    const markCompleteBtn = page.locator('.btn-mark-complete');
    await expect(markCompleteBtn).toBeEnabled();
    await markCompleteBtn.click();

    // Successfully returns to dashboard with next module unlocked
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('.toast').first()).toContainText(/completed/i);

    // Module 1 is now marked complete, Module 2 is active
    await expect(stepperItems.first().locator('.stepper-node-complete')).toBeVisible();
    await expect(stepperItems.nth(1).locator('.stepper-node-active')).toBeVisible();

    // Readiness score has increased
    const newScoreText = await readinessScore.innerText();
    expect(parseInt(newScoreText, 10)).toBeGreaterThan(parseInt(initialScoreText, 10));

    // 6. Checkpoint Quiz with Low Score -> Inserts Remedial Module
    // Click active Module 2
    await stepperItems.nth(1).locator('.stepper-card-wrapper').click();
    await expect(page).toHaveURL(/\/module\/mod-2/);

    // Check all checklist items on Module 2
    const mod2Checkboxes = page.locator('input[type="checkbox"]');
    const mod2CheckCount = await mod2Checkboxes.count();
    for (let i = 0; i < mod2CheckCount; i++) {
      await mod2Checkboxes.nth(i).check();
    }

    // Click "Take Checkpoint"
    const takeCheckpointBtn = page.locator('.btn-take-checkpoint').first();
    await expect(takeCheckpointBtn).toBeEnabled();
    await takeCheckpointBtn.click();

    // Checkpoint Quiz page (/module/:moduleId/checkpoint)
    await expect(page).toHaveURL(/\/module\/mod-2.*\/checkpoint/);
    await expect(page.locator('.checkpoint-quiz-header')).toBeVisible();

    // Answer checkpoint questions
    let checkpointDone = false;
    while (!checkpointDone) {
      // Intentionally select option 3 to trigger a low score (< 40)
      const options = page.locator('.diagnostic-option-card');
      const optCount = await options.count();
      if (optCount > 0) {
        await options.nth(optCount - 1).click();
      }

      const submitCheckpointBtn = page.locator('.btn-submit-checkpoint');
      if (await submitCheckpointBtn.isVisible()) {
        checkpointDone = true;
        await submitCheckpointBtn.click();
      } else {
        const nextQBtn = page.locator('button:has-text("Next Question")');
        await nextQBtn.click();
        await page.waitForTimeout(200);
      }
    }

    // Checkpoint Results Screen shows low score and remedial module summary
    await expect(page.locator('.checkpoint-result-card')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.checkpoint-result-card')).toContainText(/review|remedial/i);

    // Click "View Updated Dashboard"
    await page.click('button:has-text("View Updated Dashboard")');
    await expect(page).toHaveURL(/\/dashboard/);

    // Dashboard now has 7 modules (remedial module inserted)
    const updatedModules = page.locator('.stepper-card-wrapper');
    await expect(updatedModules).toHaveCount(7);
    await expect(page.locator('text=Remedial:')).toBeVisible();

    // 7. Change Target Role via Settings (/settings)
    await page.click('a[href="/settings"]');
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.locator('#settings-name')).toHaveValue('Alex Mercer');
    await expect(page.locator('.role-active-badge')).toContainText('MERN Developer');

    // Select "Data Analyst" in Danger Zone
    const roleSelect = page.locator('#new-role-select');
    await roleSelect.selectOption({ label: 'Data Analyst' });

    const changeRoleBtn = page.locator('button:has-text("Change Target Role")');
    await expect(changeRoleBtn).toBeEnabled();
    await changeRoleBtn.click();

    // Accessible modal opens
    const modal = page.locator('.modal-backdrop');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/switch your career path/i);

    // Confirm role change
    await page.locator('.btn-danger-confirm').click();

    // Redirects to /diagnostic for Data Analyst!
    await expect(page).toHaveURL(/\/diagnostic/);
    await expect(page.locator('.badge-active')).toContainText('Data Analyst');

    // 8. Logout
    await page.goto('/settings');
    const logoutBtn = page.locator('.btn-logout-settings');
    await logoutBtn.click();

    // Redirects to Landing Page and session is cleared
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.locator('.hero-title')).toBeVisible();
  });

  test('failure case: when LLM is unavailable, fallback roadmap still appears via FORCE_LLM_FAILURE', async ({
    page,
    request,
  }) => {
    test.setTimeout(60000);

    // Stub LLM failure via environment flag on server
    await request.post('http://localhost:5000/api/test/llm-flag', {
      data: { forceFailure: true },
    });

    const timestamp = Date.now();
    const userEmail = `offline_llm_${timestamp}@example.com`;

    // Signup
    await page.goto('/signup');
    await page.fill('#signup-name', 'Offline Fallback User');
    await page.fill('#signup-email', userEmail);
    await page.fill('#signup-password', 'Password123');
    await page.click('button[type="submit"]');

    // Select role
    await expect(page).toHaveURL(/\/roles/);
    await page.locator('.role-selection-card', { hasText: 'MERN Developer' }).click();
    await page.click('.btn-continue-roles');

    // Take diagnostic
    await expect(page).toHaveURL(/\/diagnostic/);
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

    // Fallback generation gracefully completes and lands on Dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 25000 });
    await expect(page.locator('.dashboard-main-title')).toContainText('MERN Developer');

    // Fallback roadmap has 6 modules
    const modules = page.locator('.stepper-card-wrapper');
    await expect(modules).toHaveCount(6);

    // Reset flag
    await request.post('http://localhost:5000/api/test/llm-flag', {
      data: { forceFailure: false },
    });
  });
});
