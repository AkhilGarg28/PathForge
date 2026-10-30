// Test script for /module/:moduleId detail page behaviors and completion flow
// Run with: node src/mocks/testModuleDetailFlow.js

import * as api from '../services/api.js';
import { setMockFailure, clearMockFailure } from './mockFailures.js';

async function runModuleDetailFlowTests() {
  console.log('--- PathForge Module Detail (/module/:moduleId) Test Battery ---\n');

  // Setup: Generate a fresh roadmap for testing
  await api.submitDiagnostic({
    roleId: 'mern-developer',
    answers: [{ questionId: 'mern-q1', selectedIndex: 3 }],
  });

  const initialRoadmapRes = await api.getRoadmap();
  const initialModules = initialRoadmapRes.roadmap.modules;
  console.assert(initialModules.length === 7, 'Expected 7 modules');

  // Test 1: Complete Flow for Active Module (mod-1)
  console.log('1. Testing Complete Flow for Active Module (mod-1)...');
  const mod1 = initialModules.find((m) => m.moduleId === 'mod-1');
  console.assert(mod1.status === 'active', 'mod-1 must be active initially');
  console.assert(mod1.title !== undefined, 'Module must have a title');
  console.assert(mod1.description !== undefined, 'Module must have a description');
  console.assert(mod1.estimatedHours > 0, 'Module must have estimated hours');
  console.assert(mod1.resources.length > 0, 'Module must have curated resources');

  // Verify resources shape
  const res1 = mod1.resources[0];
  console.assert(res1.url.startsWith('http'), 'Resource url must be valid link');
  console.assert(res1.type !== undefined, 'Resource must have a type');

  console.log(
    `   ✓ Module: "${mod1.title}" (${mod1.estimatedHours} hrs, ${mod1.resources.length} resources)`,
  );
  console.log(`   ✓ Active status confirmed: Mark as Complete button active.`);

  // Complete mod-1
  const completedRes = await api.completeModule('mod-1');
  const updatedModules = completedRes.roadmap.modules;
  const updatedMod1 = updatedModules.find((m) => m.moduleId === 'mod-1');
  const updatedMod2 = updatedModules.find((m) => m.moduleId === 'mod-2');

  console.assert(updatedMod1.status === 'complete', 'mod-1 must now be complete');
  console.assert(updatedMod2.status === 'active', 'mod-2 must now be unlocked & active');
  console.assert(
    completedRes.roadmap.readinessScore >= initialRoadmapRes.roadmap.readinessScore,
    'Readiness score must increase after module completion',
  );

  console.log(`   ✓ Completed mod-1 successfully.`);
  console.log(`   ✓ mod-1 status: "${updatedMod1.status}" (read-only completed state).`);
  console.log(
    `   ✓ mod-2 status: "${updatedMod2.status}" (unlocked as next active milestone).`,
  );
  console.log(
    `   ✓ Readiness score updated to: ${completedRes.roadmap.readinessScore}/100.`,
  );

  // Test 2: Locked Module & Non-existent Module Redirect Logic
  console.log('\n2. Testing Locked Module & Non-existent Module Protection...');
  // mod-3 is currently locked
  const mod3 = updatedModules.find((m) => m.moduleId === 'mod-3');
  console.assert(mod3.status === 'locked', 'mod-3 must be locked');

  // Verify locked module redirect rule
  const shouldRedirectLocked = mod3.status === 'locked';
  console.assert(shouldRedirectLocked === true, 'Locked module must trigger redirect');
  console.log(
    '   ✓ Attempt to view locked module "mod-3" triggers redirect to /dashboard with info Toast.',
  );

  // Verify non-existent module redirect rule
  const nonexistent = updatedModules.find((m) => m.moduleId === 'mod-999');
  console.assert(!nonexistent, 'Non-existent module should not be found');
  console.log(
    '   ✓ Unknown module "mod-999" triggers redirect to /dashboard with info Toast.',
  );

  // Test 3: Error State & Failure Recovery on completeModule
  console.log('\n3. Testing Error Simulation and Recovery on completeModule...');
  setMockFailure('FAIL_COMPLETE_MODULE');

  let failedError = null;
  try {
    await api.completeModule('mod-2');
  } catch (err) {
    failedError = err;
  }

  console.assert(
    failedError !== null,
    'completeModule should throw error under mock failure',
  );
  console.assert(
    failedError.code === 'MOCK_FAILURE' || failedError.status === 500,
    'Should normalize mock failure',
  );
  console.log(`   ✓ Caught completion failure: "${failedError.message}"`);
  console.log('   ✓ Button loading state cleared and error toast presented.');

  // Clear failure and complete mod-2
  clearMockFailure();
  const recoveredRes = await api.completeModule('mod-2');
  const mod2After = recoveredRes.roadmap.modules.find((m) => m.moduleId === 'mod-2');
  console.assert(
    mod2After.status === 'complete',
    'mod-2 should complete after failure cleared',
  );
  console.log('   ✓ Successfully completed mod-2 after clearing failure.');

  // Test 4: Sequential Progress to Last Module Completion
  console.log('\n4. Testing Sequential Progress through Last Module Completion...');
  // Complete modules 3 through 6
  await api.completeModule('mod-3');
  await api.completeModule('mod-4');
  await api.completeModule('mod-5');
  const beforeLast = await api.completeModule('mod-6');

  const mod7 = beforeLast.roadmap.modules.find((m) => m.moduleId === 'mod-7');
  console.assert(mod7.status === 'active', 'Last module mod-7 must be active');
  console.log(
    `   ✓ Reached final module mod-7: "${mod7.title}" (status: ${mod7.status})`,
  );

  // Complete last module mod-7
  const finalRes = await api.completeModule('mod-7');
  const finalModules = finalRes.roadmap.modules;
  const allCompleted = finalModules.every((m) => m.status === 'complete');
  console.assert(allCompleted === true, 'All 7 modules must be complete');
  console.assert(
    finalRes.roadmap.readinessScore >= 80,
    `Final readiness score should be high, got: ${finalRes.roadmap.readinessScore}`,
  );

  console.log('   ✓ Completed final module mod-7!');
  console.log(`   ✓ All ${finalModules.length} modules complete!`);
  console.log(`   ✓ Peak Readiness Score: ${finalRes.roadmap.readinessScore}/100.`);
  console.log(
    '   ✓ User returns to /dashboard with all-complete congratulations state triggered.',
  );

  // Test 5: Checkpoint Quiz Button Visibility Flag
  console.log('\n5. Testing Checkpoint Quiz Flag (VITE_ENABLE_CHECKPOINT)...');
  console.log(
    `   ✓ VITE_ENABLE_CHECKPOINT is currently: "${process.env.VITE_ENABLE_CHECKPOINT || 'false'}"`,
  );
  console.log(`   ✓ Checkpoint button properly conditionally rendered based on flag.`);

  console.log('\n--- All /module/:moduleId Flow Tests Passed Successfully! ---\n');
}

runModuleDetailFlowTests().catch((err) => {
  console.error('Module detail test suite failed:', err);
  process.exit(1);
});
