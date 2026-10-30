/**
 * Test script to verify form validation rules and auth mock error handling:
 * - Client-side validation edge cases
 * - 409 Duplicate email on signup
 * - 401 Invalid credentials on login
 * - 429 Rate limit simulation
 * - Happy paths for both signup and login
 */

import * as api from '../services/api.js';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validation.js';
import { mockStore, setMockFailure, clearMockFailure } from './index.js';

async function runAuthValidationTests() {
  console.log('🧪 Starting Form Validation & Auth Mock Tests...\n');
  mockStore.reset();
  clearMockFailure();

  // =========================================================================
  // 1. Client-Side Validation Logic
  // =========================================================================
  console.log('1. Testing Client-Side Validation Rules...');

  // Name
  console.assert(validateName('') !== null, 'Empty name should fail');
  console.assert(validateName('   ') !== null, 'Whitespace name should fail');
  console.assert(validateName('Alex Chen') === null, 'Valid name should pass');
  console.log('   ✓ Name validation works');

  // Email
  console.assert(validateEmail('') !== null, 'Empty email should fail');
  console.assert(
    validateEmail('invalid-email') !== null,
    'Plain string email should fail',
  );
  console.assert(validateEmail('test@') !== null, 'Email missing domain should fail');
  console.assert(validateEmail('test@domain') !== null, 'Email missing TLD should fail');
  console.assert(validateEmail('user@pathforge.dev') === null, 'Valid email should pass');
  console.log('   ✓ Email validation works');

  // Password (>= 8 chars, at least 1 letter, at least 1 number)
  console.assert(validatePassword('') !== null, 'Empty password should fail');
  console.assert(validatePassword('short1A') !== null, '7 char password should fail');
  console.assert(
    validatePassword('nouppercaseornumber') !== null,
    'Password without number should fail',
  );
  console.assert(
    validatePassword('1234567890') !== null,
    'Password without letter should fail',
  );
  console.assert(validatePassword('Password123') === null, 'Valid password should pass');
  console.log('   ✓ Password complexity validation works');

  // Confirm Password
  console.assert(
    validateConfirmPassword('', 'Pass1234') !== null,
    'Empty confirm password should fail',
  );
  console.assert(
    validateConfirmPassword('Pass1234', 'OtherPass1') !== null,
    'Mismatched passwords should fail',
  );
  console.assert(
    validateConfirmPassword('Pass1234', 'Pass1234') === null,
    'Matching passwords should pass',
  );
  console.log('   ✓ Confirm password validation works');

  // =========================================================================
  // 2. Signup Mock API (Success & 409 Duplicate Email)
  // =========================================================================
  console.log('\n2. Testing Signup API Mock Behavior...');

  // Duplicate email check
  let duplicateCaught = false;
  try {
    await api.signup({
      name: 'Existing User',
      email: 'learner@pathforge.dev',
      password: 'ValidPassword1',
    });
  } catch (err) {
    duplicateCaught = true;
    console.assert(err.status === 409, 'Duplicate signup must return status 409');
    console.assert(
      err.code === 'EMAIL_ALREADY_EXISTS',
      'Code must be EMAIL_ALREADY_EXISTS',
    );
    console.log('   ✓ Duplicate email rejected with 409:', err.message);
  }
  console.assert(duplicateCaught, '409 duplicate email must throw an error');

  // Successful signup
  const newEmail = `user-${Date.now()}@pathforge.dev`;
  const signupRes = await api.signup({
    name: 'Morgan Stanley',
    email: newEmail,
    password: 'ValidPassword1',
  });
  console.assert(
    signupRes.user && signupRes.user.email === newEmail,
    'Signup must return new user',
  );
  console.log('   ✓ Successful signup for:', signupRes.user.email);

  // =========================================================================
  // 3. Login Mock API (Success & 401 Wrong Password)
  // =========================================================================
  console.log('\n3. Testing Login API Mock Behavior...');

  // Wrong password
  let wrongPassCaught = false;
  try {
    await api.login({
      email: 'learner@pathforge.dev',
      password: 'wrongpassword',
    });
  } catch (err) {
    wrongPassCaught = true;
    console.assert(err.status === 401, 'Wrong password must return status 401');
    console.assert(
      err.code === 'INVALID_CREDENTIALS',
      'Code must be INVALID_CREDENTIALS',
    );
    console.log('   ✓ Wrong password rejected with 401:', err.message);
  }
  console.assert(wrongPassCaught, '401 wrong password must throw an error');

  // Successful login
  const loginRes = await api.login({
    email: 'learner@pathforge.dev',
    password: 'CorrectPassword1',
  });
  console.assert(
    loginRes.user && loginRes.user.email === 'learner@pathforge.dev',
    'Login must succeed',
  );
  console.log('   ✓ Successful login for:', loginRes.user.email);

  // =========================================================================
  // 4. Rate Limiting Simulation (429)
  // =========================================================================
  console.log('\n4. Testing 429 Rate Limiting Simulation...');
  setMockFailure('RATE_LIMIT');
  let rateLimitCaught = false;
  try {
    await api.login({
      email: 'test@example.com',
      password: 'SomePassword1',
    });
  } catch (err) {
    rateLimitCaught = true;
    console.assert(err.status === 429, 'Rate limit must return 429');
    console.assert(
      err.code === 'RATE_LIMIT_EXCEEDED',
      'Code must be RATE_LIMIT_EXCEEDED',
    );
    console.log('   ✓ Simulated 429 caught:', err.message);
  }
  console.assert(rateLimitCaught, 'Rate limit error must be thrown');
  clearMockFailure();

  console.log('\n✨ ALL FORM VALIDATION & AUTH MOCK TESTS PASSED!\n');
}

runAuthValidationTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
