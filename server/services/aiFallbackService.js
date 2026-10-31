/**
 * PathForge Centralized AI Fallback & System Mode Orchestrator
 * Unifies all AI operations with automatic, resilient fallback to mock systems.
 * Tracks operational modes: 'ai_mode', 'mock_mode', or 'fallback_mode'.
 */

import mongoose from 'mongoose';
import { getActiveAIProvider, LLMError } from './llmService.js';
import { selectQuizQuestions } from './questionSelector.js';
import { analyzeResumeMock } from '../mockData/mockResumeAnalysis.js';
import { analyzeGithubMock } from '../mockData/mockGithubAnalysis.js';
import { getRecommendationsMock } from '../mockData/mockRecommendations.js';
import { mernLearningPath, dataAnalystLearningPath } from '../mockData/learningPaths.js';

// In-memory system settings state (can be adjusted via /api/system/settings)
export const systemSettings = {
  // 'auto' | 'ai_only' | 'mock_only'
  preferredMode: 'auto',
  // 'ai_mode' | 'fallback_mode' | 'mock_mode'
  currentStatus: 'ai_mode',
  lastAiCheck: {
    status: 'unknown',
    latencyMs: null,
    provider: null,
    testedAt: null,
    error: null
  },
  lastDbCheck: {
    status: 'unknown',
    latencyMs: null,
    testedAt: null,
    error: null
  },
  recentFailures: 0
};

/**
 * Returns the currently active operational mode
 */
export function getSystemMode() {
  if (systemSettings.preferredMode === 'mock_only') {
    return 'mock_mode';
  }
  const provider = getActiveAIProvider();
  if (!provider) {
    return 'fallback_mode';
  }
  return systemSettings.currentStatus;
}

/**
 * Updates system settings
 */
export function updateSystemSettings(updates = {}) {
  if (updates.preferredMode && ['auto', 'ai_only', 'mock_only'].includes(updates.preferredMode)) {
    systemSettings.preferredMode = updates.preferredMode;
  }
  return { ...systemSettings, activeMode: getSystemMode() };
}

/**
 * Actively tests AI API connectivity and response speed
 */
export async function testAiConnection() {
  const provider = getActiveAIProvider();
  const startTime = Date.now();

  if (!provider) {
    systemSettings.lastAiCheck = {
      status: 'unavailable',
      latencyMs: null,
      provider: 'none',
      testedAt: new Date().toISOString(),
      error: 'No AI API keys configured (GROQ_API_KEY or GEMINI_API_KEY missing)'
    };
    systemSettings.currentStatus = 'fallback_mode';
    return systemSettings.lastAiCheck;
  }

  try {
    const raw = await provider.generateContent({
      prompt: 'Respond in JSON format: {"ping": "pong", "status": "ok"}',
      timeoutMs: 8000,
      jsonMode: true
    });

    const parsed = JSON.parse(raw);
    const latency = Date.now() - startTime;

    if (parsed && (parsed.ping === 'pong' || parsed.status === 'ok')) {
      systemSettings.lastAiCheck = {
        status: 'healthy',
        latencyMs: latency,
        provider: provider.name,
        model: provider.model,
        testedAt: new Date().toISOString(),
        error: null
      };
      systemSettings.currentStatus = 'ai_mode';
      systemSettings.recentFailures = 0;
      return systemSettings.lastAiCheck;
    }

    throw new Error('Unexpected response format from AI');
  } catch (err) {
    const latency = Date.now() - startTime;
    systemSettings.lastAiCheck = {
      status: 'error',
      latencyMs: latency,
      provider: provider.name,
      testedAt: new Date().toISOString(),
      error: err.message
    };
    systemSettings.currentStatus = 'fallback_mode';
    systemSettings.recentFailures += 1;
    return systemSettings.lastAiCheck;
  }
}

/**
 * Actively tests MongoDB connectivity and database latency
 */
export async function testDatabaseConnection() {
  const startTime = Date.now();
  try {
    const state = mongoose.connection.readyState;
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    if (state === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      const latency = Date.now() - startTime;
      systemSettings.lastDbCheck = {
        status: 'connected',
        state: 'ready',
        host: mongoose.connection.host,
        dbName: mongoose.connection.name,
        latencyMs: latency,
        testedAt: new Date().toISOString(),
        error: null
      };
      return systemSettings.lastDbCheck;
    }

    throw new Error(`MongoDB not ready (state code: ${state})`);
  } catch (err) {
    const latency = Date.now() - startTime;
    systemSettings.lastDbCheck = {
      status: 'disconnected',
      latencyMs: latency,
      testedAt: new Date().toISOString(),
      error: err.message
    };
    return systemSettings.lastDbCheck;
  }
}

/**
 * Wraps an AI generation task with automatic fallback execution
 *
 * @param {Object} options
 * @param {Function} options.aiTask - Asynchronous AI function to try
 * @param {Function} options.fallbackTask - Deterministic/mock fallback function
 * @param {string} options.taskName - Identifier for logging and telemetry
 * @returns {Promise<{ result: any, source: 'ai'|'mock'|'fallback', mode: string }>}
 */
export async function executeWithFallback({ aiTask, fallbackTask, taskName = 'AI Task' }) {
  // If user forced mock mode, execute fallback immediately without calling AI
  if (systemSettings.preferredMode === 'mock_only') {
    const result = await fallbackTask();
    return {
      result,
      source: 'mock',
      mode: 'mock_mode'
    };
  }

  const provider = getActiveAIProvider();
  if (provider) {
    try {
      const aiResult = await aiTask(provider);
      if (aiResult) {
        systemSettings.currentStatus = 'ai_mode';
        return {
          result: aiResult,
          source: 'ai',
          mode: 'ai_mode'
        };
      }
    } catch (err) {
      console.warn(`[AIFallbackService] ${taskName} failed (${err.message}). Seamlessly engaging mock fallback.`);
      systemSettings.currentStatus = 'fallback_mode';
      systemSettings.recentFailures += 1;
    }
  } else {
    systemSettings.currentStatus = 'fallback_mode';
  }

  // Execute high-quality mock alternative
  const fallbackResult = await fallbackTask();
  return {
    result: fallbackResult,
    source: 'fallback',
    mode: 'fallback_mode'
  };
}

export default {
  systemSettings,
  getSystemMode,
  updateSystemSettings,
  testAiConnection,
  testDatabaseConnection,
  executeWithFallback
};
