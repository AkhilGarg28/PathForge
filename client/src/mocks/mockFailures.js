// Development-only failure simulation helper for testing error and edge-case states.
// Can be activated via localStorage.setItem("mockFail", "CODE") or setMockFailure("CODE").

let memoryMockFail = null;

export function setMockFailure(code = 'SERVER_ERROR') {
  memoryMockFail = code;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('mockFail', code);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function clearMockFailure() {
  memoryMockFail = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('mockFail');
    }
  } catch {
    // Ignore storage errors
  }
}

export function getMockFailure() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('mockFail');
      if (stored) return stored;
    }
  } catch {
    // Fall back to memory
  }
  return memoryMockFail;
}

/**
 * Checks if a mock failure is triggered. Throws normalized error object if active.
 */
export function checkMockFailure(context = '') {
  const failure = getMockFailure();
  if (!failure) return;

  if (failure === '401' || failure === 'UNAUTHORIZED') {
    throw {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Session expired, please log in again',
    };
  }

  if (failure === 'NO_ROADMAP') {
    throw {
      status: 404,
      code: 'NO_ROADMAP',
      message: 'No roadmap found for the requested profile.',
    };
  }

  if (failure === '404' || failure === 'NOT_FOUND') {
    throw {
      status: 404,
      code: 'NOT_FOUND',
      message: `Resource not found at ${context || 'endpoint'}.`,
    };
  }

  if (failure === 'RATE_LIMIT') {
    throw {
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait a moment.',
    };
  }

  if (failure === 'NETWORK' || failure === 'OFFLINE' || failure === 'NETWORK_ERROR') {
    throw {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to PathForge server. Please check your network.',
    };
  }

  // Default simulated failure
  throw {
    status: 500,
    code: failure || 'INTERNAL_ERROR',
    message: `Simulated mock failure: ${failure} at ${context || 'endpoint'}.`,
  };
}
