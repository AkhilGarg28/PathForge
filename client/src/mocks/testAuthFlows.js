/**
 * Verification test for Auth flows and session lifecycle in mock mode:
 * 1. Logged out state handling
 * 2. Login, signup, and logout transitions
 * 3. Session preservation across page refreshes (sessionStorage simulation)
 * 4. Global 401 interceptor trigger
 */

import * as api from '../services/api.js';
import { mockStore, setMockFailure, clearMockFailure } from './index.js';

// Setup minimal window and sessionStorage polyfill for Node.js test environment
const mockSessionStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

globalThis.window = {
  sessionStorage: mockSessionStorage,
  dispatchEvent: () => true,
};

async function testAuthLifecycle() {
  console.log('🧪 Starting Auth Lifecycle & State Verification Tests...\n');

  // Step 1: Start logged out
  console.log('1. Testing Logged Out state...');
  mockSessionStorage.clear();
  mockStore.reset();
  await api.logout();

  let unauthCaught = false;
  try {
    await api.getMe();
  } catch (err) {
    unauthCaught = true;
    console.assert(err.status === 401, 'Expected 401 status when logged out');
    console.assert(err.code === 'UNAUTHORIZED', 'Expected UNAUTHORIZED code');
  }
  console.assert(unauthCaught, 'Unauthenticated getMe() must throw');
  console.log('   ✓ Unauthenticated request rejected with 401 UNAUTHORIZED');

  // Step 2: Login flow
  console.log('\n2. Testing login flow...');
  const loginRes = await api.login({
    email: 'learner@pathforge.dev',
    password: 'securepassword',
  });
  console.assert(
    loginRes.user.email === 'learner@pathforge.dev',
    'Login must return user',
  );
  console.log('   ✓ Logged in as:', loginRes.user.name, `(${loginRes.user.email})`);

  const meAfterLogin = await api.getMe();
  console.assert(meAfterLogin.user.id === loginRes.user.id, 'Session must be active');
  console.log('   ✓ getMe() confirms active session');

  // Step 3: Simulate Page Refresh (Reload)
  console.log('\n3. Testing Page Refresh (session persistence)...');
  // Re-instantiate store as if browser reloaded the page and bundle
  mockStore.reset();
  const meAfterRefresh = await api.getMe();
  console.assert(
    meAfterRefresh.user.email === 'learner@pathforge.dev',
    'Session must survive page refresh',
  );
  console.log(
    '   ✓ Session successfully restored after page reload simulation:',
    meAfterRefresh.user.name,
  );

  // Step 4: Logout flow & refresh verification
  console.log('\n4. Testing logout flow and persistence...');
  await api.logout();
  let unauthAfterLogout = false;
  try {
    await api.getMe();
  } catch (err) {
    unauthAfterLogout = true;
    console.assert(err.status === 401, 'Must reject with 401 after logout');
  }
  console.assert(unauthAfterLogout, 'Logged out request must fail');
  console.log('   ✓ Logged out successfully');

  // Simulate refresh after logout
  mockStore.reset();
  let unauthAfterReload = false;
  try {
    await api.getMe();
  } catch {
    unauthAfterReload = true;
  }
  console.assert(unauthAfterReload, 'Logged out state must persist across refresh');
  console.log('   ✓ Logged out state persists after page reload simulation');

  // Step 5: Global 401 Interceptor Callback
  console.log('\n5. Testing global onUnauthorized() callback...');
  let callbackInvoked = false;
  let receivedError = null;

  const unsubscribe = api.onUnauthorized((err) => {
    callbackInvoked = true;
    receivedError = err;
  });

  setMockFailure('401');
  try {
    await api.getMe();
  } catch {
    // Expected to throw
  }

  console.assert(callbackInvoked, 'onUnauthorized callback must be invoked on 401');
  console.assert(receivedError?.status === 401, 'Callback receives 401 error object');
  console.log('   ✓ Global 401 callback triggered with message:', receivedError?.message);

  unsubscribe();
  clearMockFailure();

  console.log('\n🎉 ALL AUTH STATE AND LIFECYCLE TESTS PASSED!\n');
}

testAuthLifecycle().catch((err) => {
  console.error('Auth test failed:', err);
  process.exit(1);
});
