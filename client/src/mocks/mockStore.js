// In-memory mutable mock store for local development and offline mock mode.
import {
  INITIAL_USER,
  MOCK_ROLES,
  MOCK_DIAGNOSTIC_MERN,
  MOCK_DIAGNOSTIC_DATA_ANALYST,
  INITIAL_SAMPLE_ROADMAP,
  MOCK_CHECKPOINT_QUESTIONS,
} from './mockData.js';

function getStoredSession() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const explicitLogout = window.sessionStorage.getItem('pathforge_mock_logged_out');
      if (explicitLogout === 'true') return { hasSession: false, user: null };
      const raw = window.sessionStorage.getItem('pathforge_mock_session');
      if (raw) return { hasSession: true, user: JSON.parse(raw) };
    }
  } catch {
    // Ignore storage exceptions
  }
  return null;
}

function syncStoredSession(hasSession, user) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (hasSession && user) {
        window.sessionStorage.removeItem('pathforge_mock_logged_out');
        window.sessionStorage.setItem('pathforge_mock_session', JSON.stringify(user));
      } else {
        window.sessionStorage.setItem('pathforge_mock_logged_out', 'true');
        window.sessionStorage.removeItem('pathforge_mock_session');
      }
    }
  } catch {
    // Ignore storage exceptions
  }
}

class MockStore {
  constructor() {
    this.reset();
  }

  reset() {
    const stored = getStoredSession();
    if (stored) {
      this.hasActiveSession = stored.hasSession;
      this.currentUser = stored.user ? { ...stored.user } : null;
    } else {
      this.currentUser = { ...INITIAL_USER };
      this.hasActiveSession = true;
    }
    this.selectedRoleId = this.currentUser?.roleId || INITIAL_USER.roleId;
    this.hasRoadmap = true;
    this.roadmap = JSON.parse(JSON.stringify(INITIAL_SAMPLE_ROADMAP));
  }

  // --- Auth & Session ---
  getCurrentUser() {
    if (!this.hasActiveSession || !this.currentUser) {
      return null;
    }
    return { ...this.currentUser };
  }

  signup({ email, password: _password, name }) {
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (
      normalizedEmail === 'learner@pathforge.dev' ||
      normalizedEmail === 'duplicate@test.com' ||
      normalizedEmail === 'exists@pathforge.dev'
    ) {
      throw {
        status: 409,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists.',
      };
    }

    this.currentUser = {
      id: `usr-${Date.now()}`,
      email: normalizedEmail,
      name: name || email.split('@')[0],
      roleId: this.selectedRoleId || 'mern-developer',
    };
    this.hasActiveSession = true;
    syncStoredSession(true, this.currentUser);
    return { user: { ...this.currentUser } };
  }

  login({ email, password }) {
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (password === 'wrongpassword' || normalizedEmail === 'wrong@test.com') {
      throw {
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      };
    }

    this.currentUser = {
      id: this.currentUser?.id || `usr-${Date.now()}`,
      email: normalizedEmail,
      name: this.currentUser?.name || email.split('@')[0],
      roleId: this.currentUser?.roleId || this.selectedRoleId || 'mern-developer',
    };
    this.hasActiveSession = true;
    syncStoredSession(true, this.currentUser);
    return { user: { ...this.currentUser } };
  }

  logout() {
    this.hasActiveSession = false;
    syncStoredSession(false, null);
    return { success: true, message: 'Logged out successfully' };
  }

  updateProfile({ name, email }) {
    if (!this.hasActiveSession || !this.currentUser) {
      throw {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Must be logged in to update profile.',
      };
    }
    if (name) this.currentUser.name = name;
    if (email) this.currentUser.email = email;
    syncStoredSession(true, this.currentUser);
    return { user: { ...this.currentUser } };
  }

  updatePassword({ currentPassword, newPassword: _newPass }) {
    if (!this.hasActiveSession || !this.currentUser) {
      throw {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Must be logged in to update password.',
      };
    }
    if (currentPassword === 'wrongpassword' || currentPassword.startsWith('wrong')) {
      throw {
        status: 401,
        code: 'INVALID_PASSWORD',
        message: 'Current password is incorrect.',
      };
    }
    return { success: true, message: 'Password updated successfully' };
  }

  deleteUser({ password } = {}) {
    if (!this.hasActiveSession || !this.currentUser) {
      throw {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Must be logged in to delete user.',
      };
    }
    if (password === 'wrongpassword') {
      throw {
        status: 401,
        code: 'INVALID_PASSWORD',
        message: 'Incorrect password confirmation.',
      };
    }
    this.currentUser = null;
    this.hasActiveSession = false;
    this.roadmap = null;
    this.hasRoadmap = false;
    syncStoredSession(false, null);
    return { success: true, message: 'User account deleted' };
  }

  // --- Roles ---
  getRoles() {
    return { roles: MOCK_ROLES };
  }

  setUserRole(roleId) {
    const roleExists = MOCK_ROLES.some((r) => r.id === roleId);
    if (!roleExists) {
      throw {
        status: 400,
        code: 'INVALID_ROLE',
        message: `Role "${roleId}" is not recognized.`,
      };
    }
    this.selectedRoleId = roleId;
    if (this.currentUser) {
      this.currentUser.roleId = roleId;
    }
    return { success: true, roleId };
  }

  // --- Diagnostic Assessment ---
  getDiagnostic(roleId) {
    const targetRoleId = roleId || this.selectedRoleId || 'mern-developer';
    const roleExists = MOCK_ROLES.some((r) => r.id === targetRoleId);
    if (!roleExists) {
      throw {
        status: 404,
        code: 'ROLE_NOT_FOUND',
        message: `Role "${targetRoleId}" was not found.`,
      };
    }
    const questions =
      targetRoleId === 'data-analyst'
        ? MOCK_DIAGNOSTIC_DATA_ANALYST
        : MOCK_DIAGNOSTIC_MERN;

    return {
      roleId: targetRoleId,
      questions,
    };
  }

  submitDiagnostic({ roleId, answers = [] }) {
    const targetRoleId = roleId || this.selectedRoleId || 'mern-developer';
    this.setUserRole(targetRoleId);

    // Compute average score per dimension (Likert index: 0-4 mapped to 1-5 score)
    const questions =
      targetRoleId === 'data-analyst'
        ? MOCK_DIAGNOSTIC_DATA_ANALYST
        : MOCK_DIAGNOSTIC_MERN;

    const dimensionSums = {};
    const dimensionCounts = {};

    answers.forEach((ans) => {
      const q = questions.find((item) => item.id === ans.questionId);
      if (q) {
        const val = typeof ans.selectedIndex === 'number' ? ans.selectedIndex + 1 : 3;
        dimensionSums[q.dimension] = (dimensionSums[q.dimension] || 0) + val;
        dimensionCounts[q.dimension] = (dimensionCounts[q.dimension] || 0) + 1;
      }
    });

    const scores = {};
    let totalScore = 0;
    let countedDimensions = 0;

    Object.keys(dimensionSums).forEach((dim) => {
      const avg = Number((dimensionSums[dim] / dimensionCounts[dim]).toFixed(1));
      scores[dim] = avg;
      totalScore += avg;
      countedDimensions += 1;
    });

    // Overall readiness score scaled 0-100
    const rawAvg = countedDimensions > 0 ? totalScore / countedDimensions : 2.5;
    const readinessScore = Math.min(100, Math.max(0, Math.round((rawAvg / 5) * 100)));

    // Rebuild fresh roadmap: first module active, rest locked
    const baseModules = JSON.parse(JSON.stringify(INITIAL_SAMPLE_ROADMAP.modules));
    baseModules.forEach((m, idx) => {
      m.status = idx === 0 ? 'active' : 'locked';
      m.checkpointScore = null;
    });

    this.roadmap = {
      roleId: targetRoleId,
      generatedBy: 'llm',
      readinessScore,
      baseReadiness: readinessScore,
      modules: baseModules,
    };
    this.hasRoadmap = true;

    return {
      scores,
      readinessScore,
      roadmap: JSON.parse(JSON.stringify(this.roadmap)),
    };
  }

  // --- Roadmap & Module Progression ---
  getRoadmap() {
    if (!this.hasRoadmap || !this.roadmap) {
      throw {
        status: 404,
        code: 'NO_ROADMAP',
        message: 'No roadmap found. Please complete the role selection and diagnostic.',
      };
    }
    return { roadmap: JSON.parse(JSON.stringify(this.roadmap)) };
  }

  completeModule(moduleId) {
    if (!this.roadmap || !this.roadmap.modules) {
      throw {
        status: 404,
        code: 'NO_ROADMAP',
        message: 'No roadmap exists to complete module.',
      };
    }

    const modIndex = this.roadmap.modules.findIndex((m) => m.moduleId === moduleId);
    if (modIndex === -1) {
      throw {
        status: 404,
        code: 'MODULE_NOT_FOUND',
        message: `Module "${moduleId}" not found in current roadmap.`,
      };
    }

    // Mark completed
    this.roadmap.modules[modIndex].status = 'complete';

    // Unlock next module if one exists
    if (modIndex + 1 < this.roadmap.modules.length) {
      if (this.roadmap.modules[modIndex + 1].status === 'locked') {
        this.roadmap.modules[modIndex + 1].status = 'active';
      }
    }

    // Recompute readiness score based on progression
    const baseScore = this.roadmap.baseReadiness || 50;
    const completedCount = this.roadmap.modules.filter(
      (m) => m.status === 'complete',
    ).length;
    const remainingHeadroom = Math.max(10, 100 - baseScore);
    const progressBonus = Math.round(
      (completedCount / this.roadmap.modules.length) * remainingHeadroom,
    );
    this.roadmap.readinessScore = Math.min(100, baseScore + progressBonus);

    return { roadmap: JSON.parse(JSON.stringify(this.roadmap)) };
  }

  // --- Checkpoints & Dynamic Replanning ---
  getCheckpoint(moduleId) {
    const data = MOCK_CHECKPOINT_QUESTIONS[moduleId] || MOCK_CHECKPOINT_QUESTIONS.default;
    return {
      moduleId,
      title: data.title,
      questions: data.questions,
    };
  }

  submitCheckpoint(moduleId, answers = []) {
    if (!this.roadmap || !this.roadmap.modules) {
      throw {
        status: 404,
        code: 'NO_ROADMAP',
        message: 'Roadmap not found for checkpoint.',
      };
    }

    const modIndex = this.roadmap.modules.findIndex((m) => m.moduleId === moduleId);
    if (modIndex === -1) {
      throw {
        status: 404,
        code: 'MODULE_NOT_FOUND',
        message: `Module "${moduleId}" not found in roadmap.`,
      };
    }

    // Calculate score: answers length or selected index pattern (0-100)
    let score = 75;
    if (answers && answers.length > 0) {
      const sum = answers.reduce((acc, a) => acc + (a.selectedIndex ?? 2), 0);
      score = Math.min(100, Math.max(30, Math.round((sum / (answers.length * 3)) * 100)));
    }

    this.roadmap.modules[modIndex].checkpointScore = score;

    let replanned = false;
    let changeSummary = '';

    // Simulate dynamic replanning depending on high, mid, or low performance
    if (score >= 80) {
      replanned = true;
      changeSummary =
        'High mastery verified! Fast-tracked subsequent module topics and attached advanced architectural challenges.';
      // Enhance upcoming module tags
      if (modIndex + 1 < this.roadmap.modules.length) {
        const nextMod = this.roadmap.modules[modIndex + 1];
        if (!nextMod.resourceTags.includes('Advanced')) {
          nextMod.resourceTags.push('Advanced');
        }
      }
    } else if (score >= 50) {
      replanned = false;
      changeSummary =
        'Solid comprehension demonstrated. Proceeding with standard curriculum pace.';
    } else {
      replanned = true;
      changeSummary =
        'Additional foundational reinforcement recommended. Supplementary practice modules appended.';
      if (modIndex + 1 < this.roadmap.modules.length) {
        const nextMod = this.roadmap.modules[modIndex + 1];
        nextMod.resources.unshift({
          title: 'Remedial Foundations & Core Concept Review',
          url: 'https://pathforge.dev/remedial-review',
          type: 'documentation',
        });
      }
    }

    return {
      score,
      replanned,
      changeSummary,
      roadmap: JSON.parse(JSON.stringify(this.roadmap)),
    };
  }
}

export const mockStore = new MockStore();
