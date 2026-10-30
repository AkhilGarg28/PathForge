import { test, expect } from '@playwright/test';

test.describe('PathForge End-to-End Happy Path Workflow', () => {
  test('walks through signup -> role selection -> diagnostic -> loading -> dashboard -> module detail -> mark complete -> settings -> logout -> login', async ({
    page,
  }) => {
    let currentUser = null;
    let currentRoadmap = null;

    const sampleRoles = [
      {
        id: 'role-mern',
        name: 'MERN Developer',
        title: 'MERN Developer',
        description: 'Full-stack engineering with MongoDB, Express, React, and Node.js.',
        dimensions: ['Frontend React', 'Backend Node'],
      },
      {
        id: 'role-data',
        name: 'Data Analyst',
        title: 'Data Analyst',
        description: 'Translate raw business data into actionable analytics.',
        dimensions: ['SQL & Warehousing', 'Python Analytics'],
      },
    ];

    const sampleQuestions = [
      {
        id: 'q1',
        text: 'What is React JSX syntax?',
        dimension: 'Frontend React',
        options: [
          'A syntax extension for JavaScript',
          'A database query language',
          'A CSS preprocessor',
          'A build bundler',
        ],
      },
      {
        id: 'q2',
        text: 'What is Node.js?',
        dimension: 'Backend Node',
        options: [
          'A JavaScript runtime built on Chrome V8',
          'A relational database',
          'A web browser',
          'A CSS framework',
        ],
      },
    ];

    // Intercept network requests to test full contract round-trips in real browser
    await page.route('**/api/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname;
      const method = request.method();

      // Auth me
      if (path === '/api/auth/me' && method === 'GET') {
        if (!currentUser) {
          return route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Authentication required' }),
          });
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: currentUser }),
        });
      }

      // Signup
      if (path === '/api/auth/signup' && method === 'POST') {
        const body = JSON.parse(request.postData() || '{}');
        currentUser = {
          id: 'u-101',
          name: body.name || 'Alex Rivera',
          email: body.email,
          targetRole: null,
          roleId: null,
        };
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ user: currentUser }),
        });
      }

      // Login
      if (path === '/api/auth/login' && method === 'POST') {
        const body = JSON.parse(request.postData() || '{}');
        currentUser = {
          id: 'u-101',
          name: 'Alex Rivera',
          email: body.email,
          targetRole: 'MERN Developer',
          roleId: 'role-mern',
        };
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: currentUser }),
        });
      }

      // Logout
      if (path === '/api/auth/logout' && method === 'POST') {
        currentUser = null;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'Logged out successfully' }),
        });
      }

      // Roles
      if (path === '/api/roles' && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ roles: sampleRoles }),
        });
      }

      // Set Role
      if (path === '/api/user/role' && method === 'POST') {
        const body = JSON.parse(request.postData() || '{}');
        if (currentUser) {
          currentUser.targetRole = 'MERN Developer';
          currentUser.roleId = body.roleId;
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: currentUser }),
        });
      }

      // Diagnostic questions
      if (path.startsWith('/api/diagnostic/') && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            roleId: 'role-mern',
            questions: sampleQuestions,
          }),
        });
      }

      // Diagnostic submit
      if (path === '/api/diagnostic/submit' && method === 'POST') {
        currentRoadmap = {
          roleId: 'role-mern',
          readinessScore: 35,
          generatedBy: 'llm',
          modules: [
            {
              moduleId: 'mod-1-react-basics',
              title: 'React Core Foundations & Hooks Lifecycle',
              description: 'Component architecture and state management.',
              estimatedHours: 10,
              status: 'active',
              resources: [
                {
                  title: 'React Documentation: Quick Start',
                  url: 'https://react.dev/learn',
                  type: 'documentation',
                },
              ],
            },
            {
              moduleId: 'mod-2-node-backend',
              title: 'Node.js & Express RESTful Architecture',
              description: 'Backend services and middleware routing.',
              estimatedHours: 15,
              status: 'locked',
              resources: [
                {
                  title: 'Express Routing Guide',
                  url: 'https://expressjs.com',
                  type: 'documentation',
                },
              ],
            },
          ],
        };

        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            dimensionScores: { 'Frontend React': 5, 'Backend Node': 4 },
            readinessScore: 35,
            roadmap: currentRoadmap,
          }),
        });
      }

      // Roadmap GET
      if (path === '/api/roadmap' && method === 'GET') {
        if (!currentRoadmap) {
          return route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'No roadmap yet' }),
          });
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ roadmap: currentRoadmap }),
        });
      }

      // Complete module
      if (path.includes('/complete') && method === 'PATCH') {
        currentRoadmap.modules[0].status = 'complete';
        currentRoadmap.modules[1].status = 'active';
        currentRoadmap.readinessScore = 65;

        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            roadmap: currentRoadmap,
            message: 'Module completed successfully',
          }),
        });
      }

      return route.continue();
    });

    // 1. Visit signup screen
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();

    // Fill registration form
    await page.getByLabel(/Full Name/i).fill('Alex Rivera');
    await page.getByLabel(/^Email/i).fill('alex.rivera@example.com');
    await page.getByLabel(/^Password/i).fill('StrongPass123!');
    await page.getByLabel(/Confirm Password/i).fill('StrongPass123!');

    // Submit signup
    await page.getByRole('button', { name: /^Sign up$/i }).click();

    // 2. Role Selection Screen
    await expect(page).toHaveURL(/.*\/role-selection/);
    await expect(page.getByRole('heading', { name: /Choose Your Career Target/i })).toBeVisible();

    // Select "MERN Developer" role
    const roleCard = page.locator('.pf-role-card', { hasText: 'MERN Developer' });
    await roleCard.click();

    // Continue to diagnostic
    const continueBtn = page.getByRole('button', { name: /Continue to Diagnostic/i });
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // 3. Diagnostic Quiz Screen
    await expect(page).toHaveURL(/.*\/diagnostic\/.*/);
    await expect(page.getByText('Question 1 of 2')).toBeVisible();

    // Answer Q1
    await page.getByRole('radio', { name: /syntax extension for javascript/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();

    // Answer Q2
    await expect(page.getByText('Question 2 of 2')).toBeVisible();
    await page.getByRole('radio', { name: /javascript runtime/i }).click();

    // Submit assessment
    const submitBtn = page.locator('button', { hasText: 'Submit Assessment' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Confirmation modal
    await expect(page.getByRole('heading', { name: /Ready to Submit\?/i })).toBeVisible();
    await page.locator('button', { hasText: 'Yes, Generate Roadmap' }).click();

    // 4. Generating & 5. Dashboard Transition
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(
      page.getByRole('heading', { name: /Your Learning Dashboard/i }),
    ).toBeVisible();

    // Verify initial ReadinessScore
    await expect(page.getByText('35%')).toBeVisible();

    // Verify Stepper Modules: Module 1 active, Module 2 locked
    const activeModule = page.locator('.pf-stepper-module--active');
    await expect(activeModule).toContainText('React Core Foundations');

    const lockedModule = page.locator('.pf-stepper-module--locked');
    await expect(lockedModule).toContainText('Node.js & Express RESTful Architecture');

    // 6. Navigate to active module detail
    await activeModule.click();
    await expect(page).toHaveURL(/.*\/module\/mod-1-react-basics/);
    await expect(
      page.getByRole('heading', { name: /React Core Foundations & Hooks Lifecycle/i }),
    ).toBeVisible();

    // Verify "Mark as Complete" button is present and active
    const completeBtn = page.locator('button', { hasText: 'Mark as Complete' });
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();

    // 7. Verify return to Dashboard with updated progression
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Readiness score should have risen from 35% to 65%
    await expect(page.getByText('65%')).toBeVisible();

    // Next module should now be active, first module complete
    await expect(page.locator('.pf-stepper-module--complete')).toContainText(
      'React Core Foundations',
    );
    await expect(page.locator('.pf-stepper-module--active')).toContainText(
      'Node.js & Express RESTful Architecture',
    );

    // 8. Navigate to Settings
    await page.locator('.pf-navbar__links-desktop .pf-navbar__link', { hasText: 'Settings' }).click();
    await expect(page).toHaveURL(/.*\/settings/);
    await expect(page.getByRole('heading', { name: /Account Settings/i })).toBeVisible();
    await expect(page.getByText('MERN Developer')).toBeVisible();

    // 9. Logout
    await page.locator('.pf-navbar__links-desktop button', { hasText: 'Log out' }).click();
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /Log in to PathForge/i })).toBeVisible();

    // 10. Login back
    await page.getByLabel(/^Email/i).fill('alex.rivera@example.com');
    await page.getByLabel(/^Password/i).fill('StrongPass123!');
    await page.getByRole('button', { name: /^Log in$/i }).click();

    // Redirected back to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { name: /Your Learning Dashboard/i })).toBeVisible();
    await expect(page.getByText('65%')).toBeVisible();
  });
});
