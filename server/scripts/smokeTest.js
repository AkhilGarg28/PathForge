/**
 * PathForge Post-Deployment Smoke Test
 *
 * Verifies core server functionality:
 * 1. Health check (GET /api/health)
 * 2. User registration (POST /api/auth/signup)
 * 3. User login (POST /api/auth/login)
 * 4. Roles catalog retrieval (GET /api/roles)
 * 5. User logout (POST /api/auth/logout)
 *
 * Usage:
 *   node server/scripts/smokeTest.js [baseUrl]
 *   Example: node server/scripts/smokeTest.js http://localhost:5000
 *   Example: node server/scripts/smokeTest.js https://pathforge-api.onrender.com
 */

const rawArg = process.argv[2] || process.env.BASE_URL || 'http://localhost:5000';
let normalizedBase = rawArg.trim().replace(/\/+$/, '');
if (normalizedBase.endsWith('/api')) {
  normalizedBase = normalizedBase.slice(0, -4);
}
const API_URL = `${normalizedBase}/api`;

const testTimestamp = Date.now();
const testUser = {
  name: 'Smoke Test User',
  email: `smoke_test_${testTimestamp}@example.com`,
  password: 'Password123!',
};

let activeCookie = '';

// Helper to extract session token from Set-Cookie header
function extractCookie(response) {
  let cookieHeader = null;
  if (typeof response.headers.getSetCookie === 'function') {
    const cookies = response.headers.getSetCookie();
    if (cookies && cookies.length > 0) {
      cookieHeader = cookies[0];
    }
  }
  if (!cookieHeader) {
    cookieHeader = response.headers.get('set-cookie');
  }

  if (cookieHeader) {
    // Extract token=<value> part
    const match = cookieHeader.match(/token=[^;]+/);
    if (match) {
      return match[0];
    }
  }
  return '';
}

async function runStep(stepNumber, title, fn) {
  process.stdout.write(`[Step ${stepNumber}/5] ${title}... `);
  try {
    const result = await fn();
    console.log('✓ PASS');
    if (result && typeof result === 'string') {
      console.log(`    ↳ ${result}`);
    }
    return true;
  } catch (error) {
    console.log('✗ FAILED');
    console.error(`    ↳ Error: ${error.message}`);
    return false;
  }
}

async function runSmokeTests() {
  console.log('\n============================================================');
  console.log('  PathForge Post-Deployment Smoke Test');
  console.log('============================================================');
  console.log(`Target Base URL: ${normalizedBase}`);
  console.log(`API Base URL:    ${API_URL}`);
  console.log(`Timestamp:       ${new Date().toISOString()}\n`);

  let allPassed = true;

  // 1. Health check
  const healthPassed = await runStep(1, 'Checking API health status (GET /api/health)', async () => {
    const res = await fetch(`${API_URL}/health`);
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200, received ${res.status}`);
    }
    const data = await res.json();
    if (data?.status !== 'ok') {
      throw new Error(`Expected { status: 'ok' }, received ${JSON.stringify(data)}`);
    }
    return `Server healthy: ${JSON.stringify(data)}`;
  });

  if (!healthPassed) allPassed = false;

  // 2. User Signup
  const signupPassed = await runStep(2, `Registering test user (POST /api/auth/signup)`, async () => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    if (res.status !== 201) {
      const errText = await res.text();
      throw new Error(`Expected HTTP 201, received ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (!data?.user?.email || data.user.email !== testUser.email) {
      throw new Error(`User email mismatch in response: ${JSON.stringify(data)}`);
    }

    const cookie = extractCookie(res);
    if (cookie) {
      activeCookie = cookie;
    }

    return `Registered user ID: ${data.user.id || data.user._id} (${data.user.email})`;
  });

  if (!signupPassed) allPassed = false;

  // 3. User Login
  const loginPassed = await runStep(3, `Logging in test user (POST /api/auth/login)`, async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`Expected HTTP 200, received ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (!data?.user?.email) {
      throw new Error(`Invalid login response: ${JSON.stringify(data)}`);
    }

    const cookie = extractCookie(res);
    if (cookie) {
      activeCookie = cookie;
    }

    return `Login successful, auth session established`;
  });

  if (!loginPassed) allPassed = false;

  // 4. Roles Catalog
  const rolesPassed = await runStep(4, 'Fetching role catalog (GET /api/roles)', async () => {
    const headers = {};
    if (activeCookie) {
      headers['Cookie'] = activeCookie;
    }

    const res = await fetch(`${API_URL}/roles`, { headers });
    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`Expected HTTP 200, received ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.roles)) {
      throw new Error(`Expected roles array, received: ${JSON.stringify(data)}`);
    }

    if (data.roles.length === 0) {
      return `Roles endpoint reached (0 roles found - ensure seed script has been run)`;
    }

    const roleNames = data.roles.map((r) => r.name).join(', ');
    return `Retrieved ${data.roles.length} role(s): [${roleNames}]`;
  });

  if (!rolesPassed) allPassed = false;

  // 5. User Logout
  const logoutPassed = await runStep(5, 'Logging out test user (POST /api/auth/logout)', async () => {
    const headers = { 'Content-Type': 'application/json' };
    if (activeCookie) {
      headers['Cookie'] = activeCookie;
    }

    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers,
    });

    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`Expected HTTP 200, received ${res.status}: ${errText}`);
    }

    const data = await res.json();
    activeCookie = '';
    return `Logout successful: ${data?.message || 'Logged out'}`;
  });

  if (!logoutPassed) allPassed = false;

  console.log('\n------------------------------------------------------------');
  if (allPassed) {
    console.log('✓ ALL SMOKE TESTS PASSED! Target service is fully operational.');
    console.log('------------------------------------------------------------\n');
    process.exit(0);
  } else {
    console.error('✗ SMOKE TEST FAILED! One or more checks encountered errors.');
    console.log('------------------------------------------------------------\n');
    process.exit(1);
  }
}

runSmokeTests().catch((err) => {
  console.error('\nFatal smoke test error:', err);
  process.exit(1);
});
