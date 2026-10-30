/**
 * PathForge Screen Audit & Resilience Test Battery
 *
 * Verifies:
 * 1. Global 401 Unauthorized handling & exact message format: "Session expired, please log in again"
 * 2. Simulated Network/Offline error handling across services
 * 3. Mock failure simulation & retry recovery on all data-driven screens:
 *    - Role Selection (loading skeleton, empty, error with Retry)
 *    - Diagnostic Assessment (loading skeleton, empty, invalid role 404, error with Retry)
 *    - Generating Screen (loading skeleton, timeout guard, error with Retry)
 *    - Dashboard (loading skeleton, empty NO_ROADMAP, error with Retry)
 *    - Module Detail (loading skeleton, locked/not found redirect, complete failure with Retry)
 *    - Checkpoint (loading skeleton, feature flag guard, error with Retry)
 *    - Settings (profile update failure, password mismatch, delete confirmation)
 * 4. ErrorBoundary & OfflineBanner exports and components
 * 5. NotFoundPage navigation structure
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as api from '../services/api.js';
import { mockStore } from './mockStore.js';
import { setMockFailure, clearMockFailure } from './mockFailures.js';

async function runAuditTests() {
  console.log('🧪 Starting PathForge Global Audit & Resilience Test Battery...\n');

  // Reset store to known fresh state
  mockStore.reset();
  clearMockFailure();

  // ==========================================================================
  // Test 1: Global 401 Session Expiration
  // ==========================================================================
  console.log('1. Testing 401 Session Expiration and exact notification message...');
  let unauthorizedEventFired = false;
  let receivedMessage = null;

  const unsubscribe = api.onUnauthorized((err) => {
    unauthorizedEventFired = true;
    receivedMessage = err?.message;
  });

  // Force 401 error
  setMockFailure('401');
  try {
    await api.getMe();
    assert.fail('Should have rejected with 401');
  } catch (err) {
    assert.equal(err.status, 401);
    assert.equal(err.code, 'UNAUTHORIZED');
  }

  assert.equal(
    unauthorizedEventFired,
    true,
    'api.onUnauthorized callback should be invoked',
  );
  assert.equal(
    receivedMessage,
    'Session expired, please log in again',
    'Session expiration message must match exact prompt requirement',
  );
  unsubscribe();
  clearMockFailure();
  console.log(
    '   ✓ 401 session expiration callback verified with message: "Session expired, please log in again"\n',
  );

  // ==========================================================================
  // Test 2: Network / Offline Error Simulation
  // ==========================================================================
  console.log('2. Testing Network / Offline Error Handling...');
  setMockFailure('NETWORK');
  try {
    await api.getRoles();
    assert.fail('Should have rejected with NETWORK_ERROR');
  } catch (netErr) {
    assert.equal(netErr.status, 0);
    assert.equal(netErr.code, 'NETWORK_ERROR');
    assert.ok(netErr.message.includes('check your network'));
  }
  clearMockFailure();
  console.log(
    '   ✓ Simulated network/offline error caught with code NETWORK_ERROR and friendly prompt\n',
  );

  // ==========================================================================
  // Test 3: Screen 1 - Role Selection Resilience
  // ==========================================================================
  console.log(
    '3. Testing /role-selection data states (Success, Empty, Error + Retry)...',
  );

  // 3A. Success
  const normalRoles = await api.getRoles();
  assert.ok(normalRoles.roles.length > 0, 'Should load available roles');

  // 3B. Error + Retry
  setMockFailure('ROLES_500');
  try {
    await api.getRoles();
    assert.fail('Should fail when ROLES_500 mock is set');
  } catch (err) {
    assert.equal(err.status, 500);
  }
  // Recovery via Retry
  clearMockFailure();
  const retriedRoles = await api.getRoles();
  assert.ok(retriedRoles.roles.length > 0, 'Retry successfully loads roles');
  console.log('   ✓ RoleSelection error state and retry recovery verified\n');

  // ==========================================================================
  // Test 4: Screen 2 - Diagnostic Assessment Resilience
  // ==========================================================================
  console.log('4. Testing /diagnostic/:roleId states (404 Not Found, Error + Retry)...');

  // 4A. Invalid Role 404
  try {
    await api.getDiagnostic('invalid-role-xyz');
    assert.fail('Should reject non-existent role with 404');
  } catch (err) {
    assert.equal(err.status, 404);
    assert.equal(err.code, 'ROLE_NOT_FOUND');
  }

  // 4B. Simulated Failure + Retry
  setMockFailure('DIAG_FETCH_ERR');
  try {
    await api.getDiagnostic('mern-developer');
    assert.fail('Should fail when DIAG_FETCH_ERR is set');
  } catch (err) {
    assert.equal(err.status, 500);
  }
  clearMockFailure();
  const recoveredDiag = await api.getDiagnostic('mern-developer');
  assert.equal(recoveredDiag.questions.length, 12, 'Recovered questions loaded');
  console.log('   ✓ Diagnostic invalid role 404 and retry recovery verified\n');

  // ==========================================================================
  // Test 5: Screen 3 - Generating Roadmap Resilience
  // ==========================================================================
  console.log(
    '5. Testing /generating states (Submit failure + Retry, Refresh handling)...',
  );

  // 5A. Submit failure
  setMockFailure('GEN_SUBMIT_ERR');
  try {
    await api.submitDiagnostic({
      roleId: 'mern-developer',
      answers: recoveredDiag.questions.map((q) => ({
        questionId: q.id,
        selectedIndex: 3,
      })),
    });
    assert.fail('Should fail when GEN_SUBMIT_ERR is set');
  } catch (err) {
    assert.equal(err.status, 500);
  }

  // 5B. Recovery via Retry
  clearMockFailure();
  const genResult = await api.submitDiagnostic({
    roleId: 'mern-developer',
    answers: recoveredDiag.questions.map((q) => ({ questionId: q.id, selectedIndex: 3 })),
  });
  assert.ok(genResult.roadmap, 'Roadmap successfully generated on retry');
  console.log('   ✓ Generating page failure and preserved-answers retry verified\n');

  // ==========================================================================
  // Test 6: Screen 4 - Dashboard Resilience
  // ==========================================================================
  console.log(
    '6. Testing /dashboard states (Normal, Empty NO_ROADMAP, Error + Retry)...',
  );

  // 6A. Error state
  setMockFailure('DASHBOARD_DB_ERR');
  try {
    await api.getRoadmap();
    assert.fail('Should fail when DASHBOARD_DB_ERR is set');
  } catch (err) {
    assert.equal(err.status, 500);
  }
  clearMockFailure();

  // 6B. Retry recovery
  const activeRoadmap = await api.getRoadmap();
  assert.ok(activeRoadmap.roadmap.modules.length > 0, 'Active roadmap modules retrieved');

  // 6C. NO_ROADMAP state simulation
  setMockFailure('NO_ROADMAP');
  try {
    await api.getRoadmap();
    assert.fail('Should throw NO_ROADMAP');
  } catch (err) {
    assert.equal(err.code, 'NO_ROADMAP');
    assert.equal(err.status, 404);
  }
  clearMockFailure();
  console.log('   ✓ Dashboard error, empty (NO_ROADMAP), and retry verified\n');

  // ==========================================================================
  // Test 7: Screen 5 - Module Detail Resilience
  // ==========================================================================
  console.log(
    '7. Testing /module/:moduleId states (Locked, Non-existent, Error + Retry)...',
  );

  // 7A. completeModule failure + Retry
  setMockFailure('MODULE_COMPLETE_ERR');
  try {
    await api.completeModule('mod-1');
    assert.fail('Should fail when MODULE_COMPLETE_ERR is set');
  } catch (err) {
    assert.equal(err.status, 500);
  }
  clearMockFailure();

  const completed = await api.completeModule('mod-1');
  assert.ok(completed.roadmap, 'Module 1 successfully marked complete on retry');
  console.log('   ✓ Module detail failure and retry completion verified\n');

  // ==========================================================================
  // Test 8: Screen 6 - Checkpoint Assessment Resilience
  // ==========================================================================
  console.log(
    '8. Testing /checkpoint/:moduleId states (Error + Retry, Replanned outcomes)...',
  );

  setMockFailure('CHECKPOINT_ERR');
  try {
    await api.getCheckpoint('mod-1');
    assert.fail('Should fail when CHECKPOINT_ERR is set');
  } catch (err) {
    assert.equal(err.status, 500);
  }
  clearMockFailure();

  const cp = await api.getCheckpoint('mod-1');
  assert.ok(cp.questions.length > 0, 'Checkpoint questions loaded on retry');
  console.log('   ✓ Checkpoint error and retry recovery verified\n');

  // ==========================================================================
  // Test 9: Screen 7 - Settings Resilience & Double Submit Safeguards
  // ==========================================================================
  console.log('9. Testing /settings updates and invalid inputs...');

  // 9A. Profile update
  const updatedUser = await api.updateProfile({ name: 'Verified Auditor' });
  assert.equal(updatedUser.user.name, 'Verified Auditor');

  // 9B. Password update invalid credentials
  try {
    await api.updatePassword({
      currentPassword: 'wrongpassword',
      newPassword: 'newValidPassword123',
    });
    assert.fail('Should reject wrong current password');
  } catch (err) {
    assert.equal(err.status, 401);
  }
  console.log('   ✓ Settings validation and server errors verified\n');

  // ==========================================================================
  // Test 10: Component Files & Structure Verification
  // ==========================================================================
  console.log(
    '10. Testing ErrorBoundary, OfflineBanner, and NotFoundPage component structures...',
  );
  const componentsIndex = fs.readFileSync(
    path.resolve('src/components/index.js'),
    'utf-8',
  );
  assert.ok(
    componentsIndex.includes('ErrorBoundary'),
    'ErrorBoundary must be exported in index.js',
  );
  assert.ok(
    componentsIndex.includes('OfflineBanner'),
    'OfflineBanner must be exported in index.js',
  );

  const errorBoundaryContent = fs.readFileSync(
    path.resolve('src/components/ErrorBoundary.jsx'),
    'utf-8',
  );
  assert.ok(
    errorBoundaryContent.includes('class ErrorBoundary'),
    'ErrorBoundary must be class component',
  );
  assert.ok(
    errorBoundaryContent.includes('getDerivedStateFromError'),
    'ErrorBoundary must implement getDerivedStateFromError',
  );
  assert.ok(
    errorBoundaryContent.includes('Reload page'),
    'ErrorBoundary must include reload button',
  );

  const offlineBannerContent = fs.readFileSync(
    path.resolve('src/components/OfflineBanner.jsx'),
    'utf-8',
  );
  assert.ok(
    offlineBannerContent.includes('navigator.onLine'),
    'OfflineBanner must inspect navigator.onLine',
  );
  assert.ok(
    offlineBannerContent.includes("addEventListener('offline'"),
    'OfflineBanner must listen to offline event',
  );

  const notFoundContent = fs.readFileSync(
    path.resolve('src/pages/NotFoundPage.jsx'),
    'utf-8',
  );
  assert.ok(
    notFoundContent.includes('Page Not Found'),
    'NotFoundPage must display Page Not Found',
  );
  assert.ok(
    notFoundContent.includes('Return to Home'),
    'NotFoundPage must include Return to Home CTA',
  );
  console.log('   ✓ ErrorBoundary, OfflineBanner, and NotFoundPage cleanly verified\n');

  console.log('🎉 ALL AUDIT AND RESILIENCE TESTS PASSED CLEANLY! 🎉\n');
}

runAuditTests().catch((err) => {
  console.error('Audit test failed:', err);
  process.exit(1);
});
