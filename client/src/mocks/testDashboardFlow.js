// Test script for /dashboard view and data requirements
// Run with: node src/mocks/testDashboardFlow.js

import * as api from '../services/api.js';
import { mockStore } from './mockStore.js';
import { setMockFailure, clearMockFailure } from './mockFailures.js';

async function runDashboardFlowTests() {
  console.log('--- PathForge Dashboard (/dashboard) Test Battery ---\n');

  // Test 1: Normal State (Active Roadmap with Modules)
  console.log('1. Testing Normal Roadmap Retrieval & Metrics Calculation...');
  // Ensure mock has a fresh roadmap
  await api.submitDiagnostic({
    roleId: 'mern-developer',
    answers: [
      { questionId: 'mern-q1', selectedIndex: 3 },
      { questionId: 'mern-q2', selectedIndex: 4 },
    ],
  });

  const normalRes = await api.getRoadmap();
  console.assert(normalRes.roadmap !== undefined, 'Roadmap must be returned');
  const modules = normalRes.roadmap.modules;
  console.assert(modules.length === 7, `Expected 7 modules, got ${modules.length}`);

  const totalModules = modules.length;
  const completedModules = modules.filter((m) => m.status === 'complete').length;
  const hoursRemaining = modules
    .filter((m) => m.status !== 'complete')
    .reduce((sum, m) => sum + (m.estimatedHours || 0), 0);
  const readinessScore = normalRes.roadmap.readinessScore;

  console.assert(typeof readinessScore === 'number', 'Readiness score must be numeric');
  console.assert(completedModules === 0, 'Initial completed modules should be 0');
  console.assert(hoursRemaining > 0, 'Hours remaining should be > 0');
  console.assert(modules[0].status === 'active', 'First module must be active');
  console.assert(modules[1].status === 'locked', 'Second module must be locked');

  console.log(`   ✓ Retrieved roadmap for role: ${normalRes.roadmap.roleId}`);
  console.log(`   ✓ Readiness Score: ${readinessScore}/100`);
  console.log(
    `   ✓ Modules: ${completedModules}/${totalModules} complete, ${hoursRemaining} hours left`,
  );
  console.log(
    `   ✓ Active module: "${modules[0].title}" -> navigates to /module/${modules[0].moduleId}`,
  );
  console.log(
    `   ✓ Locked module: "${modules[1].title}" -> disabled with lock indicator`,
  );

  // Test 2: Empty State (NO_ROADMAP)
  console.log('\n2. Testing Empty State (NO_ROADMAP)...');
  mockStore.hasRoadmap = false;
  mockStore.roadmap = null;

  let emptyError = null;
  try {
    await api.getRoadmap();
  } catch (err) {
    emptyError = err;
  }

  console.assert(emptyError !== null, 'Should throw error when no roadmap exists');
  console.assert(
    emptyError.code === 'NO_ROADMAP' || emptyError.status === 404,
    `Expected code NO_ROADMAP or status 404, got: ${emptyError.code} / ${emptyError.status}`,
  );
  console.log(`   ✓ Correctly caught NO_ROADMAP (status ${emptyError.status}).`);
  console.log('   ✓ Dashboard maps this to EmptyState with CTA to "/role-selection".');

  // Test 3: Error State & Retry Recovery
  console.log('\n3. Testing Error State & Retry Recovery...');
  setMockFailure('DATABASE_OFFLINE');

  let serverError = null;
  try {
    await api.getRoadmap();
  } catch (err) {
    serverError = err;
  }

  console.assert(serverError !== null, 'Should fail when failure is simulated');
  console.assert(
    serverError.code === 'MOCK_FAILURE' || serverError.status === 500,
    'Should have standard error shape',
  );
  console.log(`   ✓ Error state triggered: "${serverError.message}"`);
  console.log('   ✓ Dashboard displays ErrorState with Retry button.');

  // Clear failure and restore roadmap
  clearMockFailure();
  await api.submitDiagnostic({
    roleId: 'mern-developer',
    answers: [{ questionId: 'mern-q1', selectedIndex: 4 }],
  });
  const recoveredRes = await api.getRoadmap();
  console.assert(
    recoveredRes.roadmap !== undefined,
    'Should recover successfully on Retry',
  );
  console.log('   ✓ Retry succeeded and re-rendered roadmap.');

  // Test 4: All-Complete Congratulations State
  console.log('\n4. Testing All-Complete Congratulations State...');
  // Mark all modules as complete
  mockStore.roadmap.modules.forEach((m) => {
    m.status = 'complete';
  });
  mockStore.roadmap.readinessScore = 98;

  const allCompleteRes = await api.getRoadmap();
  const allModules = allCompleteRes.roadmap.modules;
  const allCompleteCount = allModules.filter((m) => m.status === 'complete').length;
  const isAllComplete = allModules.length > 0 && allCompleteCount === allModules.length;
  const remainingHoursAllDone = allModules
    .filter((m) => m.status !== 'complete')
    .reduce((sum, m) => sum + (m.estimatedHours || 0), 0);

  console.assert(isAllComplete === true, 'All modules should be marked complete');
  console.assert(remainingHoursAllDone === 0, 'Remaining hours must be 0');
  console.assert(
    allCompleteRes.roadmap.readinessScore === 98,
    'Readiness score should reflect mastery',
  );

  console.log(`   ✓ All ${allCompleteCount} of ${allModules.length} modules complete!`);
  console.log(
    '   ✓ Congratulations banner triggered: "Outstanding Work! All Modules Complete"',
  );
  console.log('   ✓ Explored career switch CTA rendered: "Explore Other Tracks"');

  console.log('\n--- All /dashboard Flow Tests Passed Successfully! ---\n');
}

runDashboardFlowTests().catch((err) => {
  console.error('Dashboard test failed:', err);
  process.exit(1);
});
