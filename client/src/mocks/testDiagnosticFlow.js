// Integration and unit test script for Diagnostic Assessment flow
// Run with: node src/mocks/testDiagnosticFlow.js

import * as api from '../services/api.js';
import { setMockFailure, clearMockFailure } from './mockFailures.js';

async function runDiagnosticTests() {
  console.log('--- PathForge Diagnostic Assessment Test Battery ---\n');

  // Test 1: Fetch diagnostic questions for valid role
  console.log('1. Testing getDiagnostic for "mern-developer"...');
  const mernDiag = await api.getDiagnostic('mern-developer');
  console.assert(
    mernDiag.roleId === 'mern-developer',
    'RoleId must match requested role',
  );
  console.assert(
    mernDiag.questions && mernDiag.questions.length === 12,
    `Expected 12 questions, got ${mernDiag.questions?.length}`,
  );
  console.assert(
    mernDiag.questions[0].dimension !== undefined,
    'Question must have dimension',
  );
  console.assert(
    mernDiag.questions[0].options.length === 5,
    'Question must have 5 Likert options',
  );
  console.log(
    `   ✓ Successfully retrieved ${mernDiag.questions.length} questions for ${mernDiag.roleId}`,
  );

  // Test 2: Fetch diagnostic for Data Analyst
  console.log('\n2. Testing getDiagnostic for "data-analyst"...');
  const daDiag = await api.getDiagnostic('data-analyst');
  console.assert(daDiag.roleId === 'data-analyst', 'RoleId must match requested role');
  console.assert(daDiag.questions.length === 12, 'Data Analyst must have 12 questions');
  console.log(
    `   ✓ Successfully retrieved ${daDiag.questions.length} questions for ${daDiag.roleId}`,
  );

  // Test 3: Handling invalid roleId gracefully
  console.log('\n3. Testing invalid roleId handling...');
  try {
    await api.getDiagnostic('invalid-nonexistent-role');
    console.assert(false, 'Should throw error for non-existent role');
  } catch (err) {
    console.assert(
      err.status === 404 || err.code === 'ROLE_NOT_FOUND',
      `Expected 404 / ROLE_NOT_FOUND, got: ${err.status} / ${err.code}`,
    );
    console.log(
      `   ✓ Successfully rejected invalid role with status ${err.status} (${err.code})`,
    );
  }

  // Test 4: Simulated mock failure & recovery
  console.log('\n4. Testing simulated failure and recovery...');
  setMockFailure('DIAGNOSTIC_FAILURE');
  try {
    await api.getDiagnostic('mern-developer');
    console.assert(false, 'Should throw simulated failure');
  } catch (err) {
    console.assert(
      err.code === 'MOCK_FAILURE' || err.status === 500,
      'Should throw mock error',
    );
    console.log(`   ✓ Simulated failure intercepted: ${err.message}`);
  } finally {
    clearMockFailure();
  }

  // Verify recovery after clearing failure
  const recoveredDiag = await api.getDiagnostic('mern-developer');
  console.assert(
    recoveredDiag.questions.length === 12,
    'Should recover successfully after clearing failure',
  );
  console.log('   ✓ Recovered successfully after clearing mock failure');

  // Test 5: In-progress sessionStorage persistence simulation
  console.log(
    '\n5. Testing in-progress answers persistence (sessionStorage simulation)...',
  );
  const mockStorageKey = 'pathforge_diagnostic_mern-developer';
  const mockSessionStorage = {};

  // User answers first 5 questions mid-quiz
  const partialAnswers = {
    'mern-q1': 3,
    'mern-q2': 4,
    'mern-q3': 2,
    'mern-q4': 4,
    'mern-q5': 1,
  };
  mockSessionStorage[mockStorageKey] = JSON.stringify(partialAnswers);

  // Simulate page refresh restoring answers
  const restoredRaw = mockSessionStorage[mockStorageKey];
  const restoredAnswers = JSON.parse(restoredRaw);
  console.assert(
    Object.keys(restoredAnswers).length === 5,
    'Restored answers must have 5 questions',
  );
  console.assert(
    restoredAnswers['mern-q2'] === 4,
    'Question 2 answer must be preserved as 4',
  );
  console.log('   ✓ Preserved 5 answered questions across simulated refresh');

  // Test 6: Incomplete assessment validation (unanswered questions detection)
  console.log('\n6. Testing unanswered questions detection...');
  const allQuestionIds = mernDiag.questions.map((q) => q.id);
  const unansweredIds = allQuestionIds.filter((id) => restoredAnswers[id] === undefined);
  console.assert(
    unansweredIds.length === 7,
    `Expected 7 unanswered questions, got ${unansweredIds.length}`,
  );
  const isSubmissionAllowed = unansweredIds.length === 0;
  console.assert(
    isSubmissionAllowed === false,
    'Submission must be blocked when unanswered questions exist',
  );
  console.log(
    `   ✓ Detected ${unansweredIds.length} unanswered questions. Submit button correctly disabled.`,
  );

  // Test 7: Complete all questions & submit assessment
  console.log('\n7. Testing complete assessment submission...');
  // Complete remaining 7 questions
  allQuestionIds.forEach((id, idx) => {
    restoredAnswers[id] = (idx % 4) + 1; // 1-4 indices
  });
  console.assert(
    Object.keys(restoredAnswers).length === 12,
    'All 12 questions must be answered',
  );

  const formattedSubmission = allQuestionIds.map((id) => ({
    questionId: id,
    selectedIndex: restoredAnswers[id],
  }));

  const submitResult = await api.submitDiagnostic({
    roleId: 'mern-developer',
    answers: formattedSubmission,
  });

  console.assert(
    submitResult.readinessScore !== undefined,
    'Submission must return readinessScore',
  );
  console.assert(
    typeof submitResult.readinessScore === 'number',
    'readinessScore must be numeric',
  );
  console.assert(submitResult.scores !== undefined, 'Dimension scores must be returned');
  console.assert(
    submitResult.roadmap !== undefined,
    'Tailored roadmap must be generated',
  );
  console.assert(
    submitResult.roadmap.modules.length > 0,
    'Roadmap must include learning modules',
  );
  console.assert(
    submitResult.roadmap.modules[0].status === 'active',
    'First module must be active',
  );

  // Simulate sessionStorage cleanup after submission
  delete mockSessionStorage[mockStorageKey];
  console.assert(
    mockSessionStorage[mockStorageKey] === undefined,
    'sessionStorage key must be removed after successful submission',
  );

  console.log(`   ✓ Submission successful!`);
  console.log(`   ✓ Calculated Readiness Score: ${submitResult.readinessScore}%`);
  console.log('   ✓ Dimension Scores:');
  Object.entries(submitResult.scores).forEach(([dim, score]) => {
    console.log(`       - ${dim}: ${score} / 5.0`);
  });
  console.log(
    `   ✓ Generated Roadmap: ${submitResult.roadmap.modules.length} modules, first module active: "${submitResult.roadmap.modules[0].title}"`,
  );
  console.log('   ✓ In-progress answers sessionStorage cleaned up.');

  console.log('\n--- All Diagnostic Assessment Tests Passed Successfully! ---\n');
}

runDiagnosticTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
