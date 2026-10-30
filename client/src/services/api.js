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
  },

  // --- AI Personalized Learning & Adaptive Assessment Endpoints ---
  async saveProfile(profileData) {
    if (USE_MOCK) {
      await mockDelay(150);
      return { success: true, message: 'Profile saved', data: { profile: profileData } };
    }
    return request('/onboarding/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  },

  async getProfile() {
    if (USE_MOCK) {
      await mockDelay(150);
      return { success: true, data: { profile: null } };
    }
    return request('/onboarding/profile', { method: 'GET' });
  },

  async analyzeResume({ resumeText }) {
    if (USE_MOCK) {
      await mockDelay(400);
      return {
        success: true,
        message: 'Resume analyzed successfully',
        data: {
          skills: [
            { skill: 'JavaScript', claimedLevel: 'Advanced', confidenceScore: 90 },
            { skill: 'React', claimedLevel: 'Intermediate', confidenceScore: 85 },
            { skill: 'Node.js', claimedLevel: 'Intermediate', confidenceScore: 80 }
          ],
          missingSkillsForTarget: ['System Design', 'Redis', 'Docker'],
          summary: 'Demonstrated front-end and full-stack fundamentals with potential backend gaps.'
        }
      };
    }
    return request('/onboarding/analyze-resume', {
      method: 'POST',
      body: JSON.stringify({ resumeText })
    });
  },

  async analyzeGitHub({ githubUrl, repoUrls }) {
    if (USE_MOCK) {
      await mockDelay(400);
      return {
        success: true,
        message: 'GitHub profile analyzed successfully',
        data: {
          username: githubUrl ? githubUrl.split('/').pop() : 'developer',
          languages: ['JavaScript', 'HTML', 'CSS', 'TypeScript'],
          codeQualityScore: 82,
          demonstratedSkills: [
            { skill: 'JavaScript', evidenceLevel: 'Intermediate', repoCount: 4 },
            { skill: 'React', evidenceLevel: 'Intermediate', repoCount: 3 }
          ]
        }
      };
    }
    return request('/onboarding/analyze-github', {
      method: 'POST',
      body: JSON.stringify({ githubUrl, repoUrls })
    });
  },

  async getSkillMatrix() {
    if (USE_MOCK) {
      await mockDelay(200);
      return {
        success: true,
        data: {
          skills: [
            { skill: 'JavaScript', resumeClaim: 'Advanced', githubEvidence: 'Intermediate', verifiedLevel: 'Intermediate', proficiencyScore: 68 },
            { skill: 'React', resumeClaim: 'Intermediate', githubEvidence: 'Intermediate', verifiedLevel: 'Intermediate', proficiencyScore: 72 },
            { skill: 'Node.js', resumeClaim: 'Intermediate', githubEvidence: 'Beginner', verifiedLevel: 'Beginner', proficiencyScore: 50 },
            { skill: 'MongoDB', resumeClaim: 'Beginner', githubEvidence: 'None', verifiedLevel: 'Beginner', proficiencyScore: 40 }
          ]
        }
      };
    }
    return request('/onboarding/skill-matrix', { method: 'GET' });
  },

  async getReadinessQuestions() {
    if (USE_MOCK) {
      await mockDelay(250);
      return {
        success: true,
        data: {
          totalQuestions: 6,
          questions: [
            {
              id: 'q-js-1',
              question: 'What is the output of typeof NaN in JavaScript?',
              type: 'mcq',
              options: ['"number"', '"nan"', '"undefined"', '"object"'],
              skill: 'JavaScript',
              topic: 'Type Coercion'
            },
            {
              id: 'q-js-2',
              question: 'Which of the following creates a block-scoped variable?',
              type: 'mcq',
              options: ['let and const', 'var and let', 'var only', 'function declarations'],
              skill: 'JavaScript',
              topic: 'Scope'
            }
          ]
        }
      };
    }
    return request('/readiness/questions', { method: 'GET' });
  },

  async submitReadinessAssessment({ answers }) {
    if (USE_MOCK) {
      await mockDelay(500);
      return {
        success: true,
        message: 'Assessment submitted successfully',
        data: {
          overallScore: 65,
          totalQuestions: 6,
          correctAnswersCount: 4,
          claimDiscrepancies: [
            {
              skill: 'JavaScript',
              claimedLevel: 'Advanced',
              observedScore: 50,
              observation: 'Claimed Advanced on resume, but struggled with asynchronous event loop semantics. Calibrated to Intermediate.'
            }
          ],
          strongSkills: ['React', 'HTML/CSS'],
          weakSkills: ['Asynchronous JavaScript', 'Databases'],
          recommendation: 'Targeted focus on event loop concurrency and database indexing.'
        }
      };
    }
    return request('/readiness/submit', {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  },

  async getReadinessReport() {
    if (USE_MOCK) {
      await mockDelay(200);
      return {
        success: true,
        data: {
          assessment: {
            overallScore: 65,
            claimDiscrepancies: [
              {
                skill: 'JavaScript',
                claimedLevel: 'Advanced',
                observedScore: 50,
                observation: 'Claimed Advanced on resume, but struggled with asynchronous event loop semantics.'
              }
            ],
            strongSkills: ['React', 'CSS'],
            weakSkills: ['Node.js Event Loop', 'MongoDB Aggregation'],
            recommendation: 'Targeted focus on event loop concurrency.'
          }
        }
      };
    }
    return request('/readiness/report', { method: 'GET' });
  },

  async generatePersonalizedRoadmap() {
    if (USE_MOCK) {
      await mockDelay(600);
      return {
        success: true,
        message: 'Personalized 12-week roadmap generated successfully',
        data: {
          roadmap: {
            title: '12-Week Master Software Engineer Roadmap',
            targetRole: 'MERN Developer',
            version: 1,
            totalWeeks: 12,
            currentWeekNumber: 1,
            weeks: [
              {
                weekNumber: 1,
                title: 'Modern JavaScript Deep Dive & Asynchronous Mechanics',
                focusSkills: ['JavaScript', 'Async/Await'],
                difficulty: 'Intermediate',
                isCompleted: false,
                dailyTasks: [
                  { dayNumber: 1, title: 'Execution Context & Call Stack', topic: 'Execution Context', explanation: 'Understand Call Stack and Memory Heap.', practicalExercise: 'Trace stack frames in Chrome DevTools.', isCompleted: false },
                  { dayNumber: 2, title: 'Event Loop & Microtasks', topic: 'Event Loop', explanation: 'Macrotasks vs Promises.', practicalExercise: 'Predict order of console.log, setTimeout, and Promise.resolve.', isCompleted: false },
                  { dayNumber: 3, title: 'Closures & Scope Chain', topic: 'Closures', explanation: 'Lexical scoping and data privacy.', practicalExercise: 'Implement a memoize wrapper.', isCompleted: false },
                  { dayNumber: 4, title: 'Prototypes & Classes', topic: 'OOP in JS', explanation: 'Prototype delegation vs syntactic sugar.', practicalExercise: 'Implement class inheritance hierarchy.', isCompleted: false },
                  { dayNumber: 5, title: 'Modern Async Patterns', topic: 'Async/Await', explanation: 'Handling concurrent promises safely.', practicalExercise: 'Use Promise.allSettled with retries.', isCompleted: false },
                  { dayNumber: 6, title: 'Weekly Mini-Project', topic: 'CLI Task Manager', explanation: 'Synthesize week 1 concepts.', practicalExercise: 'Build an async queue with rate limits.', isCompleted: false },
                  { dayNumber: 7, title: 'Weekly Assessment Quiz', topic: 'Week 1 Review', explanation: 'Test mastery to calibrate week 2.', practicalExercise: 'Complete the adaptive 6-question quiz.', isCompleted: false }
                ]
              }
            ]
          }
        }
      };
    }
    return request('/personalized-roadmap/generate', { method: 'POST' });
  },

  async getPersonalizedRoadmap() {
    if (USE_MOCK) {
      await mockDelay(200);
      return {
        success: true,
        data: {
          roadmap: {
            title: '12-Week Master Software Engineer Roadmap',
            targetRole: 'MERN Developer',
            version: 1,
            totalWeeks: 12,
            currentWeekNumber: 1,
            progressPercent: 14,
            weeks: [
              {
                weekNumber: 1,
                title: 'Modern JavaScript Deep Dive & Asynchronous Mechanics',
                focusSkills: ['JavaScript', 'Async/Await'],
                difficulty: 'Intermediate',
                isCompleted: false,
                dailyTasks: [
                  { dayNumber: 1, title: 'Execution Context & Call Stack', topic: 'Execution Context', explanation: 'Understand Call Stack and Memory Heap.', practicalExercise: 'Trace stack frames in Chrome DevTools.', isCompleted: true },
                  { dayNumber: 2, title: 'Event Loop & Microtasks', topic: 'Event Loop', explanation: 'Macrotasks vs Promises.', practicalExercise: 'Predict order of console.log, setTimeout, and Promise.resolve.', isCompleted: false }
                ]
              }
            ]
          }
        }
      };
    }
    return request('/personalized-roadmap', { method: 'GET' });
  },

  async toggleDailyTask({ weekNumber, dayIndex }) {
    if (USE_MOCK) {
      await mockDelay(150);
      return { success: true, message: 'Task toggled', data: { weekNumber, dayIndex, isCompleted: true } };
    }
    return request('/personalized-roadmap/task/' + weekNumber + '/' + dayIndex + '/toggle', { method: 'PATCH' });
  },

  async getTopicGuide({ topicTitle, skill }) {
    if (USE_MOCK) {
      await mockDelay(300);
      return {
        success: true,
        data: {
          guide: {
            topicTitle: topicTitle || 'Event Loop & Microtasks',
            easyExplanation: 'The event loop continuously monitors call stack and callback queue to execute async events in non-blocking fashion.',
            coreConcepts: ['Call Stack', 'Microtask Queue (Promises)', 'Macrotask Queue (setTimeout)'],
            codeExamples: [
              {
                title: 'Microtask vs Macrotask Order',
                code: 'console.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");',
                explanation: 'Microtasks are processed before the next macrotask runs.'
              }
            ],
            realWorldUseCases: ['Managing responsive user interfaces', 'Handling high-throughput Node.js API servers'],
            commonPitfalls: ['Blocking the main thread with CPU-intensive synchronous loops'],
            practiceQuestions: [{ question: 'When do microtasks run?', answer: 'Immediately after the active call stack empties and before the next rendering/macrotask cycle.' }],
            recommendedDocumentation: [{ title: 'MDN: Concurrency model and the event loop', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop', type: 'docs' }]
          }
        }
      };
    }
    const params = new URLSearchParams({ topicTitle: topicTitle || '', skill: skill || '' });
    return request('/personalized-roadmap/topic-guide?' + params.toString(), { method: 'GET' });
  },

  async getWeeklyQuiz(weekNumber) {
    if (USE_MOCK) {
      await mockDelay(200);
      return {
        success: true,
        data: {
          weekNumber,
          title: 'Week ' + weekNumber + ' Comprehensive Assessment',
          difficulty: 'Intermediate',
          isCompleted: false,
          questions: [
            {
              id: 'wq-1',
              question: 'In Node.js, what executes in the check phase of the event loop?',
              type: 'mcq',
              options: ['setImmediate callbacks', 'setTimeout timers', 'I/O polling', 'close callbacks'],
              skill: 'Node.js',
              topic: 'Event Loop Phases'
            },
            {
              id: 'wq-2',
              question: 'Which method runs microtasks in Node.js before any other queued phase?',
              type: 'mcq',
              options: ['process.nextTick()', 'setImmediate()', 'setTimeout(fn, 0)', 'requestAnimationFrame()'],
              skill: 'Node.js',
              topic: 'Microtasks'
            }
          ]
        }
      };
    }
    return request('/weekly-quiz/' + weekNumber, { method: 'GET' });
  },

  async submitWeeklyQuiz({ weekNumber, answers }) {
    if (USE_MOCK) {
      await mockDelay(400);
      return {
        success: true,
        message: 'Quiz evaluated and roadmap adapted successfully',
        data: {
          scorePercent: 85,
          passed: true,
          correctCount: 5,
          totalQuestions: 6,
          performanceCategory: 'Good Progress (75-89%)',
          feedbackMessage: 'Great work! You have strong grasp of core concepts. Advancing to the next curriculum level.',
          roadmapActionTaken: 'Preserved forward progression to next milestone with advanced topics.',
          weakTopics: ['Microtask timing'],
          strongTopics: ['Event Loop Phases', 'Closures'],
          reviewQuestions: []
        }
      };
    }
    return request('/weekly-quiz/' + weekNumber + '/submit', {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  },

  async getQuizHistory() {
    if (USE_MOCK) {
      await mockDelay(150);
      return { success: true, data: { quizzes: [] } };
    }
    return request('/weekly-quiz/history', { method: 'GET' });
  },

  async sendTutorMessage({ message, topic, weekNumber, skill }) {
    if (USE_MOCK) {
      await mockDelay(350);
      return {
        success: true,
        data: {
          reply: 'Here to help with ' + (topic || 'your studies') + '! In modern software engineering, clean code and modular design patterns ensure high maintainability and testability. Let me know if you would like an interactive exercise!',
          message: {
            role: 'assistant',
            content: 'Here to help with ' + (topic || 'your studies') + '!',
            timestamp: new Date().toISOString()
          }
        }
      };
    }
    return request('/ai-tutor/message', {
      method: 'POST',
      body: JSON.stringify({ message, topic, weekNumber, skill })
    });
  },

  async getTutorConversation() {
    if (USE_MOCK) {
      await mockDelay(150);
      return {
        success: true,
        data: {
          messages: [
            {
              role: 'assistant',
              content: 'Hello! I am your PathForge AI Mentor. How can I support your software engineering journey today?',
              timestamp: new Date().toISOString()
            }
          ]
        }
      };
    }
    return request('/ai-tutor', { method: 'GET' });
  },

  async clearTutorConversation() {
    if (USE_MOCK) {
      await mockDelay(100);
      return { success: true, message: 'Conversation cleared' };
    }
    return request('/ai-tutor/clear', { method: 'DELETE' });
  },

  async getAnalyticsOverview() {
    if (USE_MOCK) {
      await mockDelay(250);
      return {
        success: true,
        data: {
          initialScore: 45,
          currentReadinessScore: 78,
          totalQuizzesTaken: 3,
          completionPercent: 35,
          completedTasks: 14,
          totalTasks: 40,
          activeWeek: 2,
          roadmapVersion: 2,
          quizTrends: [
            { weekNumber: 1, title: 'Week 1', score: 65, passed: true },
            { weekNumber: 2, title: 'Week 2', score: 85, passed: true }
          ],
          skillMatrix: [
            { skill: 'JavaScript', category: 'Language', resumeClaim: 'Advanced', githubEvidence: 'Intermediate', verifiedLevel: 'Intermediate', proficiencyScore: 75 },
            { skill: 'React', category: 'Frontend', resumeClaim: 'Intermediate', githubEvidence: 'Intermediate', verifiedLevel: 'Intermediate', proficiencyScore: 80 }
          ],
          weakTopics: ['Event loop microtasks'],
          strongTopics: ['React Hooks', 'JSX', 'Async/Await']
        }
      };
    }
    return request('/analytics/overview', { method: 'GET' });
  }
};

export default api;
