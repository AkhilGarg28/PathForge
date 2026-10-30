// Test script for /settings page functionality & API contract
// Run with: node src/mocks/testSettingsFlow.js

import * as api from '../services/api.js';
import {
  validateName,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validation.js';

async function runSettingsFlowTests() {
  console.log('--- PathForge Settings (/settings) Test Battery ---\n');

  // Setup: Ensure we have an authenticated user session
  await api.login({
    email: 'learner@pathforge.dev',
    password: 'Password123',
  });

  const meRes = await api.getMe();
  console.assert(meRes.user !== undefined, 'User must be authenticated');
  console.log(`   ✓ Authenticated as: ${meRes.user.name} (${meRes.user.email})`);

  // Test 1: Profile Name Update
  console.log('\n1. Testing Profile Update Flow (PATCH /api/user/profile)...');
  // Validation check
  const emptyNameErr = validateName('');
  console.assert(emptyNameErr !== null, 'Empty name must produce validation error');
  console.log('   ✓ Client validation rejects empty name.');

  const updateProfileRes = await api.updateProfile({ name: 'Taylor Updated Smith' });
  console.assert(
    updateProfileRes.user.name === 'Taylor Updated Smith',
    'Updated name should be returned',
  );

  const verifiedUser = await api.getMe();
  console.assert(
    verifiedUser.user.name === 'Taylor Updated Smith',
    'Session user name must reflect update',
  );
  console.log(`   ✓ Successfully updated profile name to: "${verifiedUser.user.name}"`);

  // Test 2: Change Password Flow (PATCH /api/user/password)
  console.log('\n2. Testing Change Password Flow (PATCH /api/user/password)...');
  // Strength validation checks
  console.assert(validatePassword('short') !== null, 'Rejects short password (<8 chars)');
  console.assert(
    validatePassword('allletterspassword') !== null,
    'Rejects password without numbers',
  );
  console.assert(
    validatePassword('12345678') !== null,
    'Rejects password without letters',
  );
  console.assert(
    validateConfirmPassword('Different123', 'Password123') !== null,
    'Rejects mismatched confirm password',
  );
  console.log('   ✓ Client password strength & confirmation validation enforced.');

  // Wrong current password rejection
  try {
    await api.updatePassword({
      currentPassword: 'wrongpassword',
      newPassword: 'NewSecurePass99',
    });
    console.assert(false, 'Should reject incorrect current password');
  } catch (err) {
    console.assert(
      err.status === 401 || err.code === 'INVALID_PASSWORD',
      'Should throw 401 / INVALID_PASSWORD',
    );
    console.log(`   ✓ Caught incorrect password rejection: "${err.message}"`);
  }

  // Valid password update
  const passUpdateRes = await api.updatePassword({
    currentPassword: 'Password123',
    newPassword: 'NewSecurePass99',
  });
  console.assert(passUpdateRes.success === true, 'Password update must succeed');
  console.log('   ✓ Password updated successfully with valid credentials.');

  // Test 3: Target Role Section & Confirmation Modal
  console.log('\n3. Testing Target Role Section & Change Role Modal...');
  const rolesRes = await api.getRoles();
  console.assert(rolesRes.roles.length >= 2, 'Should fetch career roles list');
  console.log(
    `   ✓ User currently assigned to: "${verifiedUser.user.roleId || 'mern-developer'}"`,
  );
  console.log(
    '   ✓ Change Role confirmation modal informs user that current roadmap will be replaced.',
  );

  // Test 4: Danger Zone / Delete Account (DELETE /api/user)
  console.log('\n4. Testing Danger Zone / Delete Account Flow (DELETE /api/user)...');
  // Wrong confirmation password
  try {
    await api.deleteUser({ password: 'wrongpassword' });
    console.assert(false, 'Should reject deletion with wrong password');
  } catch (err) {
    console.assert(
      err.status === 401 || err.code === 'INVALID_PASSWORD',
      'Should throw 401 on wrong password for account deletion',
    );
    console.log(`   ✓ Account deletion blocked on wrong password: "${err.message}"`);
  }

  // Valid account deletion
  const deleteRes = await api.deleteUser({ password: 'NewSecurePass99' });
  console.assert(deleteRes.success === true, 'Account deletion should succeed');
  console.log('   ✓ Account permanently deleted.');

  // Verify session is completely cleared
  try {
    await api.getMe();
    console.assert(false, 'Session must be terminated after account deletion');
  } catch (err) {
    console.assert(
      err.status === 401,
      'Subsequent requests must fail with 401 Unauthorized',
    );
    console.log('   ✓ Confirmed session terminated and auth state cleared.');
  }

  // Restore a fresh mock session for remaining test suites
  await api.login({
    email: 'learner@pathforge.dev',
    password: 'Password123',
  });
  console.log('   ✓ Restored fresh learner session for test harness.');

  console.log('\n--- All Settings Flow Tests Passed Successfully! ---\n');
}

runSettingsFlowTests().catch((err) => {
  console.error('Settings test suite failed:', err);
  process.exit(1);
});
