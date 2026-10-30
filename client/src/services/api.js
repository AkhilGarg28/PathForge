/**
 * PathForge API Service
 *
 * The ONLY file in the client application that performs HTTP calls.
 * All functions normalize responses and errors according to the API contract.
 *
 * Errors thrown will always be formatted as:
 * {
 *   status: number,
 *   code: string,
 *   message: string
 * }
 */

import { mockStore, checkMockFailure } from '../mocks/index.js';

const ENV =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : typeof process !== 'undefined' && process.env
      ? process.env
      : {};

const BASE_URL = ENV.VITE_API_URL || 'http://localhost:5000';
const isProd = ENV.PROD === true || ENV.MODE === 'production';
const USE_MOCK = ENV.VITE_USE_MOCK !== undefined ? ENV.VITE_USE_MOCK === 'true' : !isProd;

let unauthorizedHandler = null;

/**
 * Register a global callback invoked whenever an API call returns 401 Unauthorized.
 * Used by AuthContext to reset state and navigate to /login with a flash message.
 */
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

function handleUnauthorized(err) {
  if (typeof unauthorizedHandler === 'function') {
    try {
      unauthorizedHandler(err);
    } catch {
      // Ignore handler error
    }
  }

  if (typeof window !== 'undefined' && window.dispatchEvent) {
    try {
      window.dispatchEvent(
        new CustomEvent('pathforge:unauthorized', {
          detail: {
            code: err?.code || 'UNAUTHORIZED',
            message: err?.message || 'Session expired, please log in again',
          },
        }),
      );
    } catch {
      // Ignore event dispatch error
    }
  }
}

/**
 * Generates an artificial delay between min and max milliseconds in mock mode.
 */
function mockDelay(min = 300, max = 800) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to run mock functions with realistic delay and 401 error notifications.
 */
async function runMock(fn, notifyOn401 = true) {
  await mockDelay();
  try {
    return await fn();
  } catch (err) {
    if (notifyOn401 && err?.status === 401) {
      handleUnauthorized(err);
    }
    throw err;
  }
}

/**
 * Helper normalizers ensuring contract uniformity regardless of whether the
 * backend emits Mongoose fields (name, targetRole, question) or API contract fields (title, roleId, text).
 */
export function normalizeUser(user) {
  if (!user) return null;
  const roleId = user.roleId || user.targetRole || null;
  return {
    ...user,
    id: user.id || user._id,
    roleId,
    targetRole: user.targetRole || roleId,
  };
}

export function normalizeRole(role) {
  if (!role) return role;
  return {
    ...role,
    title: role.title || role.name || '',
    name: role.name || role.title || '',
  };
}

export function normalizeQuestion(q) {
  if (!q) return q;
  return {
    ...q,
    text: q.text || q.question || '',
    question: q.question || q.text || '',
  };
}

/**
 * Core HTTP client wrapper with credentials, error normalization, and JSON handling.
 */
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (netErr) {
    throw {
      status: 0,
      code: 'NETWORK_ERROR',
      message:
        netErr?.message ||
        'Unable to connect to PathForge server. Please check your network.',
    };
  }

  let body = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const errorPayload =
      body?.error || (typeof body === 'object' && body !== null ? body : {});
    const message =
      errorPayload.message ||
      body?.message ||
      response.statusText ||
      'An error occurred while processing your request.';
    const code =
      errorPayload.code ||
      body?.code ||
      (response.status === 404 && path.includes('/roadmap')
        ? 'NO_ROADMAP'
        : `HTTP_${response.status}`);

    const normalized = {
      status: response.status,
      code,
      message,
    };
    if (
      response.status === 401 &&
      !path.includes('/auth/login') &&
      !path.includes('/auth/signup') &&
      !path.includes('/auth/me')
    ) {
      handleUnauthorized(normalized);
    }
    throw normalized;
  }

  return body;
}

// ============================================================================
// 1. Authentication
// ============================================================================

export async function signup({ email, password, name }) {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure('auth/signup');
      return mockStore.signup({ email, password, name });
    }, false);
  }

  const data = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  if (data?.user) {
    data.user = normalizeUser(data.user);
  }
  return data;
}

export async function login({ email, password }) {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure('auth/login');
      return mockStore.login({ email, password });
    }, false);
  }

  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.user) {
    data.user = normalizeUser(data.user);
  }
  return data;
}

export async function logout() {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure('auth/logout');
      return mockStore.logout();
    });
  }

  return request('/api/auth/logout', {
    method: 'POST',
  });
}

export async function getMe() {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure('auth/me');
      const user = mockStore.getCurrentUser();
      if (!user) {
        throw {
          status: 401,
          code: 'UNAUTHORIZED',
          message: 'Not logged in',
        };
      }
      return { user };
    });
  }

  const data = await request('/api/auth/me');
  if (data?.user) {
    data.user = normalizeUser(data.user);
  }
  return data;
}

// ============================================================================
// 2. Roles
// ============================================================================

export async function getRoles() {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure('roles');
      return mockStore.getRoles();
    });
  }

  const data = await request('/api/roles');
  if (data?.roles && Array.isArray(data.roles)) {
    data.roles = data.roles.map(normalizeRole);
  }
  return data;
}

export async function setUserRole(roleId) {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure('user/role');
      return mockStore.setUserRole(roleId);
    });
  }

  const data = await request('/api/user/role', {
    method: 'POST',
    body: JSON.stringify({ roleId }),
  });
  if (data?.user) {
    data.user = normalizeUser(data.user);
  }
  return data;
}

// ============================================================================
// 3. Diagnostic Assessment
// ============================================================================

export async function getDiagnostic(roleId) {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure(`diagnostic/${roleId}`);
      return mockStore.getDiagnostic(roleId);
    });
  }

  const data = await request(`/api/diagnostic/${encodeURIComponent(roleId)}`);
  if (data?.questions && Array.isArray(data.questions)) {
    data.questions = data.questions.map(normalizeQuestion);
  }
  return data;
}

export async function submitDiagnostic({ roleId, answers }) {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure('diagnostic/submit');
      return mockStore.submitDiagnostic({ roleId, answers });
    });
  }

  const data = await request('/api/diagnostic/submit', {
    method: 'POST',
    body: JSON.stringify({ roleId, answers }),
  });
  return {
    ...data,
    roadmap: data?.roadmap || null,
  };
}

// ============================================================================
// 4. Roadmap & Modules
// ============================================================================

export async function getRoadmap() {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure('roadmap');
      return mockStore.getRoadmap();
    });
  }

  return request('/api/roadmap');
}

export async function completeModule(moduleId) {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure(`roadmap/module/${moduleId}/complete`);
      return mockStore.completeModule(moduleId);
    });
  }

  return request(`/api/roadmap/module/${encodeURIComponent(moduleId)}/complete`, {
    method: 'PATCH',
  });
}

// ============================================================================
// 5. Checkpoints
// ============================================================================

export async function getCheckpoint(moduleId) {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure(`checkpoint/${moduleId}`);
      return mockStore.getCheckpoint(moduleId);
    });
  }

  return request(`/api/checkpoint/${encodeURIComponent(moduleId)}`);
}

export async function submitCheckpoint(moduleId, answers) {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure(`checkpoint/${moduleId}/submit`);
      return mockStore.submitCheckpoint(moduleId, answers);
    });
  }

  return request(`/api/checkpoint/${encodeURIComponent(moduleId)}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

// ============================================================================
// 6. User Profile & Settings
// ============================================================================

export async function updateProfile(profileData) {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure('user/profile');
      return mockStore.updateProfile(profileData);
    });
  }

  const data = await request('/api/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  });
  if (data?.user) {
    data.user = normalizeUser(data.user);
  }
  return data;
}

export async function updatePassword({ currentPassword, newPassword }) {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure('user/password');
      return mockStore.updatePassword({ currentPassword, newPassword });
    });
  }

  return request('/api/user/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function deleteUser(payload) {
  if (USE_MOCK) {
    return runMock(() => {
      checkMockFailure('user');
      return mockStore.deleteUser(payload);
    });
  }

  return request('/api/user', {
    method: 'DELETE',
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
}
