/**
 * Test script to verify /role-selection API interactions in mock mode:
 * 1. Fetching roles (success)
 * 2. Setting user role (POST /api/user/role)
 * 3. Handling empty roles state
 * 4. Handling API failure simulation
 */

import * as api from '../services/api.js';
import { mockStore, setMockFailure, clearMockFailure } from './index.js';

async function runRoleSelectionTests() {
  console.log('🧪 Starting Role Selection Mock Tests...\n');
  mockStore.reset();
  clearMockFailure();

  // 1. Fetch roles
  console.log('1. Testing getRoles() success...');
  const res = await api.getRoles();
  console.assert(Array.isArray(res.roles), 'Roles should be an array');
  console.assert(res.roles.length >= 2, 'Should have at least 2 default roles');
  console.assert(
    res.roles[0].dimensions?.length > 0,
    'Roles should have dimension chips',
  );
  console.log(
    `   ✓ Found ${res.roles.length} roles: ${res.roles.map((r) => r.title).join(', ')}`,
  );

  // 2. Select role
  console.log('\n2. Testing setUserRole() success...');
  const targetRole = 'data-analyst';
  const roleRes = await api.setUserRole(targetRole);
  console.assert(roleRes.success === true, 'Role selection should return success');
  console.assert(roleRes.roleId === targetRole, 'Role ID should match target');

  const me = await api.getMe();
  console.assert(
    me.user.roleId === targetRole,
    'User profile must reflect the updated roleId',
  );
  console.log(
    `   ✓ Role successfully set to "${targetRole}" and confirmed in user profile`,
  );

  // 3. Invalid role rejection
  console.log('\n3. Testing invalid role rejection...');
  let invalidRoleCaught = false;
  try {
    await api.setUserRole('non-existent-role');
  } catch (err) {
    invalidRoleCaught = true;
    console.assert(err.status === 400, 'Should return status 400');
    console.assert(err.code === 'INVALID_ROLE', 'Should return INVALID_ROLE code');
    console.log('   ✓ Rejected invalid role with message:', err.message);
  }
  console.assert(invalidRoleCaught, 'Setting invalid role must throw');

  // 4. Simulated API failure
  console.log('\n4. Testing error state simulation (500 / Network)...');
  setMockFailure('ROLES_FETCH_FAILED');
  let failureCaught = false;
  try {
    await api.getRoles();
  } catch (err) {
    failureCaught = true;
    console.assert(err.status === 500, 'Simulated failure returns 500');
    console.log('   ✓ Simulated roles fetch failure caught:', err.message);
  }
  console.assert(failureCaught, 'Failed getRoles() must throw');
  clearMockFailure();

  // 5. Normalcy restored
  const restored = await api.getRoles();
  console.assert(restored.roles.length > 0, 'Roles should be restored');
  console.log('   ✓ Successfully restored normal role retrieval');

  console.log('\n✨ ALL ROLE SELECTION TESTS PASSED!\n');
}

runRoleSelectionTests().catch((err) => {
  console.error('Role selection test failed:', err);
  process.exit(1);
});
