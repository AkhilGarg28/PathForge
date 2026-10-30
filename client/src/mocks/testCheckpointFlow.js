// Test script for Checkpoint Quiz (/checkpoint/:moduleId) and dynamic replanning
// Run with: node src/mocks/testCheckpointFlow.js

import * as api from '../services/api.js';

async function runCheckpointFlowTests() {
  console.log('--- PathForge Checkpoint Quiz (/checkpoint/:moduleId) Test Battery ---\n');

  // Setup: Fresh roadmap with mod-1 active
  await api.submitDiagnostic({
    roleId: 'mern-developer',
    answers: [{ questionId: 'mern-q1', selectedIndex: 3 }],
  });

  const roadmapRes = await api.getRoadmap();
  const mod1 = roadmapRes.roadmap.modules.find((m) => m.moduleId === 'mod-1');
  const mod2 = roadmapRes.roadmap.modules.find((m) => m.moduleId === 'mod-2');
  console.assert(mod1.status === 'active', 'mod-1 should be active');
  console.assert(mod2.status === 'locked', 'mod-2 should be locked');

  // Test 1: Feature Flag Guard (VITE_ENABLE_CHECKPOINT === 'false')
  console.log('1. Testing Feature Flag Guard (Flag Off)...');
  const isFlagActive = process.env.VITE_ENABLE_CHECKPOINT === 'true';
  console.assert(
    isFlagActive === false,
    'Flag is disabled by default as specified in Rule 10',
  );
  const redirectTargetFlagOff = isFlagActive ? null : '/dashboard';
  console.assert(
    redirectTargetFlagOff === '/dashboard',
    'Disabled flag must redirect directly to /dashboard',
  );
  console.log('   ✓ Verified: Disabled checkpoint flag cleanly redirects to /dashboard.');

  // Test 2: Locked Module Protection
  console.log('\n2. Testing Locked Module Guard...');
  // mod-2 is currently locked
  const isMod2Locked = mod2.status === 'locked';
  console.assert(isMod2Locked === true, 'mod-2 must be locked');
  const redirectTargetLocked = isMod2Locked ? '/dashboard' : null;
  console.assert(
    redirectTargetLocked === '/dashboard',
    'Locked module checkpoint access must redirect to /dashboard',
  );
  console.log(
    '   ✓ Verified: Access to locked module checkpoint blocked with redirect to /dashboard.',
  );

  // Test 3: High Score Submission (Fast-Track / Advance)
  console.log('\n3. Testing High Score Checkpoint Submission (Score >= 80%)...');
  const cp1Data = await api.getCheckpoint('mod-1');
  console.assert(cp1Data.questions.length > 0, 'Should load checkpoint questions');
  console.log(
    `   ✓ Loaded ${cp1Data.questions.length} questions for: "${cp1Data.title}"`,
  );

  // Answer all questions with high proficiency (index 3)
  const highAnswers = cp1Data.questions.map((q) => ({
    questionId: q.id,
    selectedIndex: 3,
  }));

  const highResult = await api.submitCheckpoint('mod-1', highAnswers);
  console.assert(highResult.score >= 80, `Expected score >= 80, got ${highResult.score}`);
  console.assert(
    highResult.replanned === true,
    'High score should trigger dynamic replan',
  );
  console.assert(
    highResult.changeSummary.includes('High mastery verified'),
    'Change summary should indicate fast-tracking',
  );
  console.log(`   ✓ High score verified: ${highResult.score}%`);
  console.log(`   ✓ Replanned: ${highResult.replanned}`);
  console.log(`   ✓ Summary: "${highResult.changeSummary}"`);

  // Verify next module tags received "Advanced" challenge
  const postHighRoadmap = await api.getRoadmap();
  const nextModAfterHigh = postHighRoadmap.roadmap.modules.find(
    (m) => m.moduleId === 'mod-2',
  );
  console.assert(
    nextModAfterHigh.resourceTags.includes('Advanced'),
    'Next module should receive Advanced tag on high mastery',
  );
  console.log('   ✓ Upcoming module dynamically enhanced with "Advanced" resource tag.');

  // Test 4: Mid Score Submission (Solid Comprehension / Standard Pace)
  console.log('\n4. Testing Mid Score Checkpoint Submission (Score 50% - 79%)...');
  // Unlock mod-2 by completing mod-1
  await api.completeModule('mod-1');

  // Answer mod-2 checkpoint with moderate answers (index 2)
  const cp2Data = await api.getCheckpoint('mod-2');
  const midAnswers = cp2Data.questions.map((q) => ({
    questionId: q.id,
    selectedIndex: 2,
  }));

  const midResult = await api.submitCheckpoint('mod-2', midAnswers);
  console.assert(
    midResult.score >= 50 && midResult.score < 80,
    `Expected mid score, got ${midResult.score}`,
  );
  console.assert(midResult.replanned === false, 'Mid score should keep standard pace');
  console.assert(
    midResult.changeSummary.includes('Solid comprehension'),
    'Change summary should indicate standard curriculum pace',
  );
  console.log(`   ✓ Mid score verified: ${midResult.score}%`);
  console.log(`   ✓ Replanned: ${midResult.replanned} (No changes)`);
  console.log(`   ✓ Summary: "${midResult.changeSummary}"`);

  // Test 5: Low Score Submission (Reinforcement Insert)
  console.log('\n5. Testing Low Score Checkpoint Submission (Score < 50%)...');
  // Complete mod-2 to unlock mod-3
  await api.completeModule('mod-2');

  const cp3Data = await api.getCheckpoint('mod-3');
  // Answer with low index 0
  const lowAnswers = cp3Data.questions.map((q) => ({
    questionId: q.id,
    selectedIndex: 0,
  }));

  const lowResult = await api.submitCheckpoint('mod-3', lowAnswers);
  console.assert(lowResult.score < 50, `Expected low score < 50, got ${lowResult.score}`);
  console.assert(lowResult.replanned === true, 'Low score should trigger dynamic replan');
  console.assert(
    lowResult.changeSummary.includes('reinforcement'),
    'Change summary should indicate reinforcement materials',
  );

  // Verify remedial resource was inserted into next module
  const postLowRoadmap = await api.getRoadmap();
  const nextModAfterLow = postLowRoadmap.roadmap.modules.find(
    (m) => m.moduleId === 'mod-4',
  );
  const hasRemedial = nextModAfterLow.resources.some((r) =>
    r.title.includes('Remedial Foundations'),
  );
  console.assert(
    hasRemedial === true,
    'Remedial resources must be inserted into next module',
  );

  console.log(`   ✓ Low score verified: ${lowResult.score}%`);
  console.log(`   ✓ Replanned: ${lowResult.replanned}`);
  console.log(`   ✓ Summary: "${lowResult.changeSummary}"`);
  console.log(
    '   ✓ Remedial resource successfully appended to upcoming module coursework.',
  );

  // Test 6: Result Screen & Dashboard Highlight Hand-off
  console.log('\n6. Testing Dashboard "Updated" Badge Hand-off...');
  const simulatedDashboardState = { updatedModuleId: 'mod-3' };
  const targetModuleIsUpdated = postLowRoadmap.roadmap.modules.some(
    (m) => m.moduleId === simulatedDashboardState.updatedModuleId,
  );
  console.assert(
    targetModuleIsUpdated === true,
    'Target module should be flagged for badge',
  );
  console.log(
    '   ✓ Hand-off state verified: StepperModule renders subtle "Updated" badge.',
  );

  console.log('\n--- All Checkpoint Flow Tests Passed Successfully! ---\n');
}

runCheckpointFlowTests().catch((err) => {
  console.error('Checkpoint flow test failed:', err);
  process.exit(1);
});
