import {
  mockUser,
  mockRoles,
  mockDiagnosticQuestions,
  mockRoadmap,
  mockCheckpoint
} from '../mocks/mockData.js';

function resolveBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '') {
    return 'http://localhost:5000/api';
  }
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

const BASE_URL = resolveBaseUrl();
let USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export function setMockMode(enabled) {
  USE_MOCK = Boolean(enabled);
}

export function isMockMode() {
  return USE_MOCK;
}

let forceDiagnosticFailure = false;

export function setForceDiagnosticFailure(enabled) {
  forceDiagnosticFailure = Boolean(enabled);
}

export function isForceDiagnosticFailure() {
  return forceDiagnosticFailure;
}

let onUnauthorizedHandler = null;

/**
 * Register a listener to execute when any request returns 401 Unauthorized.
 * Typically connected to AuthContext to wipe logged-in state.
 */
export function setUnauthorizedHandler(fn) {
  onUnauthorizedHandler = fn;
}

/**
 * Simulates network latency when running in mock mode.
 */
function mockDelay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Core unified fetch wrapper.
 * Enforces credentials: 'include', JSON headers, unified error propagation,
 * and 401 logout triggers.
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    credentials: 'include',
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);

    // Trigger global unauthorized state on 401
    if (response.status === 401) {
      if (typeof onUnauthorizedHandler === 'function') {
        onUnauthorizedHandler();
      }
    }

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error = new Error(data?.message || `Request failed with status ${response.status}`);
      error.statusCode = response.status;
      error.errors = data?.errors;
      throw error;
    }

    return data;
  } catch (err) {
    // Re-throw handled errors directly
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Contract API Functions
// ---------------------------------------------------------------------------

export const api = {
  // --- Auth Endpoints ---
  async signup({ name, email, password }) {
    if (USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        message: 'User registered successfully',
        data: { user: { ...mockUser, name, email } }
      };
    }
    return request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  },

  async login({ email, password }) {
    if (USE_MOCK) {
      await mockDelay();
      return { success: true, message: 'Login successful', data: { user: { ...mockUser, email } } };
    }
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async logout() {
    if (USE_MOCK) {
      await mockDelay(100);
      return { success: true, message: 'Logged out successfully' };
    }
    return request('/auth/logout', { method: 'POST' });
  },

  async getMe() {
    if (USE_MOCK) {
      await mockDelay(150);
      return { success: true, data: { user: mockUser } };
    }
    return request('/auth/me', { method: 'GET' });
  },

  // --- Roles Endpoints ---
  async getRoles() {
    if (USE_MOCK) {
      await mockDelay(150);
      return { success: true, data: { roles: mockRoles } };
    }
    return request('/roles', { method: 'GET' });
  },

  async setUserRole({ roleId }) {
    if (USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        message: 'Role assigned successfully',
        data: { user: { ...mockUser, roleId } }
      };
    }
    return request('/user/role', {
      method: 'POST',
      body: JSON.stringify({ roleId })
    });
  },

  // --- Diagnostic Endpoints ---
  async getDiagnostic(roleId) {
    if (USE_MOCK) {
      await mockDelay(200);
      return { success: true, data: { ...mockDiagnosticQuestions, roleId } };
    }
    return request(`/diagnostic/${roleId}`, { method: 'GET' });
  },

  async submitDiagnostic({ roleId, answers }) {
    if (USE_MOCK) {
      await mockDelay(300);
      if (forceDiagnosticFailure) {
        throw new Error('AI roadmap generation service timed out. Please retry.');
      }
      return {
        success: true,
        message: 'Diagnostic submitted successfully',
        data: {
          roleId,
          dimensionScores: {
            javascript: 3.5,
            react: 2.0,
            'node-express': 3.0,
            'databases-git': 4.0
          },
          avgDimensionScore: 3.1,
          readinessScore: 25,
          roadmap: mockRoadmap
        }
      };
    }
    return request('/diagnostic/submit', {
      method: 'POST',
      body: JSON.stringify({ roleId, answers })
    });
  },

  // --- Roadmap Endpoints ---
  async getRoadmap() {
    if (USE_MOCK) {
      await mockDelay(200);
      return { success: true, data: { roadmap: mockRoadmap } };
    }
    return request('/roadmap', { method: 'GET' });
  },

  async completeModule(moduleId) {
    if (USE_MOCK) {
      await mockDelay(250);
      const updatedModules = mockRoadmap.modules.map((m, idx) => {
        if (m.moduleId === moduleId) return { ...m, status: 'complete' };
        if (idx === 1) return { ...m, status: 'active' };
        return m;
      });
      return {
        success: true,
        message: 'Module marked as complete',
        data: {
          completedModuleId: moduleId,
          nextActiveModuleId: 'mern-mod-2',
          readinessScore: 36,
          roadmap: { ...mockRoadmap, modules: updatedModules, readinessScore: 36 }
        }
      };
    }
    return request(`/roadmap/module/${moduleId}/complete`, { method: 'PATCH' });
  },

  // --- Account Endpoints ---
  async updateProfile({ name }) {
    if (USE_MOCK) {
      await mockDelay();
      return {
        success: true,
        message: 'Profile updated successfully',
        data: { user: { ...mockUser, name } }
      };
    }
    return request('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name })
    });
  },

  async updatePassword({ currentPassword, newPassword }) {
    if (USE_MOCK) {
      await mockDelay();
      return { success: true, message: 'Password updated successfully' };
    }
    return request('/user/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  async deleteAccount({ password }) {
    if (USE_MOCK) {
      await mockDelay();
      return { success: true, message: 'Account deleted successfully' };
    }
    return request('/user', {
      method: 'DELETE',
      body: JSON.stringify({ password })
    });
  },

  // --- Stretch Checkpoint Endpoints ---
  async getCheckpoint(moduleId) {
    if (USE_MOCK) {
      await mockDelay(200);
      return { success: true, data: { ...mockCheckpoint, moduleId } };
    }
    return request(`/checkpoint/${moduleId}`, { method: 'GET' });
  },

  async submitCheckpoint({ moduleId, answers }) {
    if (USE_MOCK) {
      await mockDelay(300);
      return {
        success: true,
        message: 'Checkpoint completed successfully',
        data: {
          checkpointScore: 80,
          readinessScore: 42,
          roadmap: mockRoadmap,
          changeSummary: 'Demonstrated mastery in core module competencies.'
        }
      };
    }
    return request('/checkpoint/submit', {
      method: 'POST',
      body: JSON.stringify({ moduleId, answers })
    });
  }
};

export default api;
