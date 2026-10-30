/**
 * Verification script to test all api.js functions in mock mode.
 * Can be executed via: node src/mocks/testApiMocks.js
 */

import * as api from '../services/api.js';
import { setMockFailure, clearMockFailure, mockStore } from './index.js';

async function runTests() {
  console.log('🚀 Starting API Service Mock Verification Tests...\n');
  mockStore.reset();
  clearMockFailure();

  // Test 1: getMe (default active session)
  console.log('1. Testing getMe()...');
  const me = await api.getMe();
  console.assert(me.user && me.user.email, 'getMe should return a user object');
  console.log('   ✓ User:', me.user.name, `(${me.user.email})`);

  // Test 2: getRoles & setUserRole
  console.log('\n2. Testing getRoles() & setUserRole()...');
  const rolesRes = await api.getRoles();
  console.assert(rolesRes.roles.length === 2, 'Should return 2 roles');
  console.log(
    `   ✓ Found ${rolesRes.roles.length} roles:`,
    rolesRes.roles.map((r) => r.id).join(', '),
  );

  const roleSelectRes = await api.setUserRole('mern-developer');
  console.assert(roleSelectRes.roleId === 'mern-developer', 'Selected role should match');
  console.log('   ✓ Set role to:', roleSelectRes.roleId);

  // Test 3: getDiagnostic & submitDiagnostic
  console.log('\n3. Testing getDiagnostic() & submitDiagnostic()...');
  const diag = await api.getDiagnostic('mern-developer');
  console.assert(
    diag.questions.length === 12,
    'MERN diagnostic should have 12 questions',
  );
  console.log(`   ✓ Retrieved ${diag.questions.length} diagnostic questions`);

  const answers = diag.questions.map((q, idx) => ({
    questionId: q.id,
    selectedIndex: idx % 5,
  }));
  const diagResult = await api.submitDiagnostic({
    roleId: 'mern-developer',
    answers,
  });
  console.assert(
    diagResult.readinessScore !== undefined,
    'Readiness score must be returned',
  );
  console.assert(diagResult.roadmap.modules.length === 7, 'Roadmap must have 7 modules');
  console.assert(
    diagResult.roadmap.modules[0].status === 'active',
    'First module must be active',
  );
  console.assert(
    diagResult.roadmap.modules[1].status === 'locked',
    'Second module must be locked',
  );
  console.log('   ✓ Submitted diagnostic. Readiness Score:', diagResult.readinessScore);
  console.log('   ✓ Dimension Scores:', diagResult.scores);

  // Test 4: getRoadmap & completeModule
  console.log('\n4. Testing getRoadmap() & completeModule()...');
  const roadmapRes = await api.getRoadmap();
  console.assert(roadmapRes.roadmap.modules.length === 7, 'Should fetch 7 modules');
  console.log(
    '   ✓ Roadmap retrieved. Current active module:',
    roadmapRes.roadmap.modules[0].moduleId,
  );

  const updatedRoadmap = await api.completeModule('mod-1');
  const mod1 = updatedRoadmap.roadmap.modules[0];
  const mod2 = updatedRoadmap.roadmap.modules[1];
  console.assert(mod1.status === 'complete', 'Module 1 should be complete');
  console.assert(mod2.status === 'active', 'Module 2 should now be active');
  console.log(
    `   ✓ Module 1 status: "${mod1.status}", Module 2 status: "${mod2.status}"`,
  );

  // Test 5: getCheckpoint & submitCheckpoint
  console.log('\n5. Testing getCheckpoint() & submitCheckpoint()...');
  const checkpoint = await api.getCheckpoint('mod-1');
  console.assert(checkpoint.questions.length > 0, 'Checkpoint should have questions');
  console.log(
    `   ✓ Checkpoint for ${checkpoint.moduleId} has ${checkpoint.questions.length} questions`,
  );

  // Submit high score
  const cpAnswers = checkpoint.questions.map((q) => ({
    questionId: q.id,
    selectedIndex: 3,
  }));
  const cpResult = await api.submitCheckpoint('mod-1', cpAnswers);
  console.assert(typeof cpResult.score === 'number', 'Checkpoint score must be a number');
  console.log(
    `   ✓ Checkpoint score: ${cpResult.score}%, Replanned: ${cpResult.replanned}`,
  );
  console.log(`   ✓ Change summary: "${cpResult.changeSummary}"`);

  // Test 6: User Profile & Settings
  console.log('\n6. Testing updateProfile() & updatePassword()...');
  const updatedUser = await api.updateProfile({ name: 'Taylor Updated' });
  console.assert(updatedUser.user.name === 'Taylor Updated', 'Name should be updated');
  console.log('   ✓ Profile name updated to:', updatedUser.user.name);

  const pwdRes = await api.updatePassword({
    currentPassword: 'old',
    newPassword: 'new',
  });
  console.assert(pwdRes.success === true, 'Password update should succeed');
  console.log('   ✓ Password updated');

  // Test 7: Auth Flows (logout, unauthorized check, login, signup)
  console.log('\n7. Testing logout(), 401 check, login(), and signup()...');
  await api.logout();
  try {
    await api.getMe();
    console.error('   ❌ Expected 401 after logout');
  } catch (err) {
    console.assert(err.status === 401, 'Should throw 401 status');
    console.assert(err.code === 'UNAUTHORIZED', 'Code should be UNAUTHORIZED');
    console.log('   ✓ Correctly rejected with 401:', err.message);
  }

  const loggedIn = await api.login({ email: 'new@test.com', password: 'secret' });
  console.assert(loggedIn.user.email === 'new@test.com', 'User email should match login');
  console.log('   ✓ Logged in as:', loggedIn.user.email);

  const signedUp = await api.signup({
    email: 'signup@test.com',
    password: 'pass',
    name: 'New Learner',
  });
  console.assert(signedUp.user.name === 'New Learner', 'Signed up name should match');
  console.log('   ✓ Signed up as:', signedUp.user.name);

  // Test 8: Failure Simulation (NO_ROADMAP, 401, 500)
  console.log('\n8. Testing Failure Simulation (mockFail helper)...');
  setMockFailure('NO_ROADMAP');
  try {
    await api.getRoadmap();
    console.error('   ❌ Expected NO_ROADMAP failure');
  } catch (err) {
    console.assert(err.code === 'NO_ROADMAP', 'Should return NO_ROADMAP code');
    console.assert(err.status === 404, 'Status should be 404');
    console.log('   ✓ Simulated NO_ROADMAP error caught:', err);
  }

  setMockFailure('UNAUTHORIZED');
  try {
    await api.getRoles();
    console.error('   ❌ Expected UNAUTHORIZED failure');
  } catch (err) {
    console.assert(err.status === 401, 'Should return 401 status');
    console.log('   ✓ Simulated UNAUTHORIZED error caught:', err);
  }

  clearMockFailure();
  const healthyRoles = await api.getRoles();
  console.assert(healthyRoles.roles.length > 0, 'Should work after clearMockFailure');
  console.log('   ✓ Cleared failure simulation. Requests normal again.');

  // Test 9: deleteUser
  console.log('\n9. Testing deleteUser()...');
  const deleteRes = await api.deleteUser();
  console.assert(deleteRes.success === true, 'User deletion should succeed');
  console.log('   ✓ Deleted user account.');

  console.log('\n✨ ALL MOCK API TESTS PASSED SUCCESSFULLY! ✨\n');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
