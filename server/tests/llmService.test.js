import { jest } from '@jest/globals';
import {
  buildPrompt,
  cleanAndParseLLMResponse,
  createLLMProvider,
  getActiveAIProvider,
  generateRoadmapModules,
  GroqProvider,
  GeminiProvider,
  OpenAIProvider,
  LLMError,
  LLMTimeoutError,
  LLMApiError,
  LLMParseError,
  redactSecrets
} from '../services/llmService.js';

describe('LLM Service Suite (Mocked HTTP)', () => {
  const allowedTags = ['javascript', 'react', 'node', 'express', 'mongodb', 'git'];
  const sampleScores = {
    javascript: 3.5,
    react: 1.0,
    'node-express': 2.0,
    'databases-git': 4.5
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1. buildPrompt
  // -------------------------------------------------------------------------
  describe('buildPrompt', () => {
    test('throws if roleName is missing or invalid', () => {
      expect(() => buildPrompt({ roleName: '' })).toThrow('roleName is required');
      expect(() => buildPrompt({ roleName: null })).toThrow('roleName is required');
    });

    test('orders dimensions strictly from weakest (lowest) to strongest (highest)', () => {
      const prompt = buildPrompt({
        roleName: 'MERN Developer',
        dimensionScores: sampleScores,
        allowedTags
      });

      // react (1.0) must appear before node-express (2.0)
      const reactIndex = prompt.indexOf('react: 1.0');
      const nodeIndex = prompt.indexOf('node-express: 2.0');
      const jsIndex = prompt.indexOf('javascript: 3.5');
      const dbIndex = prompt.indexOf('databases-git: 4.5');

      expect(reactIndex).toBeGreaterThan(-1);
      expect(nodeIndex).toBeGreaterThan(reactIndex);
      expect(jsIndex).toBeGreaterThan(nodeIndex);
      expect(dbIndex).toBeGreaterThan(jsIndex);
    });

    test('marks dimensions with score < 3.0 as priority skill gaps', () => {
      const prompt = buildPrompt({
        roleName: 'MERN Developer',
        dimensionScores: sampleScores,
        allowedTags
      });

      expect(prompt).toContain('react: 1.0 / 5.0 (PRIORITY SKILL GAP - NEEDS REMEDIATION)');
      expect(prompt).toContain('node-express: 2.0 / 5.0 (PRIORITY SKILL GAP - NEEDS REMEDIATION)');
      expect(prompt).toContain('javascript: 3.5 / 5.0 (COMPETENT)');
    });

    test('embeds allowed tags whitelist and strict instructions', () => {
      const prompt = buildPrompt({
        roleName: 'MERN Developer',
        dimensionScores: sampleScores,
        allowedTags
      });

      expect(prompt).toContain('"javascript"');
      expect(prompt).toContain('"react"');
      expect(prompt).toContain('NEVER WRITE URLS OR SPECIFIC LINKS');
      expect(prompt).toContain('kebab-case');
      expect(prompt).toContain('Generate between 5 and 8 learning modules total');
      expect(prompt).toContain('NEVER include personal identifiable information');
    });
  });

  // -------------------------------------------------------------------------
  // 2. cleanAndParseLLMResponse
  // -------------------------------------------------------------------------
  describe('cleanAndParseLLMResponse', () => {
    const validModules = [
      {
        moduleId: 'react-fundamentals',
        title: 'React Fundamentals',
        description: 'Learn JSX, props, and components.',
        resourceTags: ['react', 'javascript'],
        estimatedHours: 12
      },
      {
        moduleId: 'node-apis',
        title: 'Node & Express APIs',
        description: 'Build robust REST endpoints.',
        resourceTags: ['node', 'express'],
        estimatedHours: 15
      }
    ];

    test('successfully parses clean JSON object with modules array', () => {
      const raw = JSON.stringify({ modules: validModules });
      const result = cleanAndParseLLMResponse(raw, allowedTags);

      expect(result).toHaveLength(2);
      expect(result[0].moduleId).toBe('react-fundamentals');
      expect(result[0].resourceTags).toEqual(['react', 'javascript']);
      expect(result[0].estimatedHours).toBe(12);
    });

    test('successfully parses bare JSON array of modules', () => {
      const raw = JSON.stringify(validModules);
      const result = cleanAndParseLLMResponse(raw, allowedTags);

      expect(result).toHaveLength(2);
      expect(result[1].moduleId).toBe('node-apis');
    });

    test('strips markdown code fences (```json ... ```)', () => {
      const fenced = `\`\`\`json\n${JSON.stringify({ modules: validModules })}\n\`\`\``;
      const result = cleanAndParseLLMResponse(fenced, allowedTags);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('React Fundamentals');
    });

    test('normalizes dirty moduleId into lowercase kebab-case', () => {
      const dirty = JSON.stringify({
        modules: [
          {
            moduleId: '  React Hooks & State Management!!  ',
            title: 'Hooks',
            description: 'State management',
            resourceTags: ['react'],
            estimatedHours: 10
          }
        ]
      });

      const result = cleanAndParseLLMResponse(dirty, allowedTags);
      expect(result[0].moduleId).toBe('react-hooks-state-management');
    });

    test('filters resourceTags to ONLY whitelisted allowedTags', () => {
      const withUnallowedTags = JSON.stringify({
        modules: [
          {
            moduleId: 'react-mod',
            title: 'React Module',
            description: 'Description',
            resourceTags: ['react', 'unauthorized-tag', 'vuejs', 'mongodb'],
            estimatedHours: 10
          }
        ]
      });

      const result = cleanAndParseLLMResponse(withUnallowedTags, allowedTags);
      expect(result[0].resourceTags).toEqual(['react', 'mongodb']);
    });

    test('falls back to default allowed tag if no tags matched whitelist', () => {
      const noValidTags = JSON.stringify({
        modules: [
          {
            moduleId: 'react-mod',
            title: 'React Module',
            description: 'Description',
            resourceTags: ['unauthorized-tag'],
            estimatedHours: 10
          }
        ]
      });

      const result = cleanAndParseLLMResponse(noValidTags, allowedTags);
      expect(result[0].resourceTags).toEqual(['javascript']);
    });

    test('constrains estimatedHours to realistic bounds (5-40)', () => {
      const extremeHours = JSON.stringify({
        modules: [
          {
            moduleId: 'm-1',
            title: 'M1',
            description: 'D1',
            resourceTags: ['react'],
            estimatedHours: 2
          },
          {
            moduleId: 'm-2',
            title: 'M2',
            description: 'D2',
            resourceTags: ['react'],
            estimatedHours: 999
          }
        ]
      });

      const result = cleanAndParseLLMResponse(extremeHours, allowedTags);
      expect(result[0].estimatedHours).toBe(5);
      expect(result[1].estimatedHours).toBe(40);
    });

    test('throws LLMParseError on malformed JSON', () => {
      expect(() => cleanAndParseLLMResponse('{ invalid json string', allowedTags)).toThrow(
        LLMParseError
      );
    });

    test('throws LLMParseError on empty or non-string response', () => {
      expect(() => cleanAndParseLLMResponse('', allowedTags)).toThrow(LLMParseError);
      expect(() => cleanAndParseLLMResponse(null, allowedTags)).toThrow(LLMParseError);
    });

    test('throws LLMParseError when modules key is missing or empty', () => {
      expect(() =>
        cleanAndParseLLMResponse(JSON.stringify({ notModules: [] }), allowedTags)
      ).toThrow(LLMParseError);
      expect(() => cleanAndParseLLMResponse(JSON.stringify({ modules: [] }), allowedTags)).toThrow(
        LLMParseError
      );
    });
  });

  // -------------------------------------------------------------------------
  // 3. GroqProvider
  // -------------------------------------------------------------------------
  describe('GroqProvider', () => {
    test('throws LLMApiError if GROQ_API_KEY is missing', async () => {
      const provider = new GroqProvider({ apiKey: '' });
      await expect(provider.generateContent({ prompt: 'test' })).rejects.toThrow(LLMApiError);
    });

    test('makes POST request with Authorization Bearer and json_object response format', async () => {
      const mockContent = JSON.stringify({ modules: [{ moduleId: 'm-1', title: 'T1' }] });
      const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: mockContent } }]
        })
      });

      const provider = new GroqProvider({
        apiKey: 'groq-test-key-12345',
        model: 'openai/gpt-oss-120b'
      });
      const text = await provider.generateContent({ prompt: 'test prompt' });

      expect(text).toBe(mockContent);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [calledUrl, calledInit] = mockFetch.mock.calls[0];
      expect(calledUrl).toBe('https://api.groq.com/openai/v1/chat/completions');
      expect(calledInit.headers.Authorization).toBe('Bearer groq-test-key-12345');
      expect(calledInit.headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(calledInit.body);
      expect(body.response_format).toEqual({ type: 'json_object' });
    });

    test('throws LLMApiError with status code on non-ok HTTP response', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API Key' } })
      });

      const provider = new GroqProvider({ apiKey: 'invalid-key' });
      await expect(provider.generateContent({ prompt: 'test' })).rejects.toThrow(LLMApiError);
    });
  });

  // -------------------------------------------------------------------------
  // 4. GeminiProvider
  // -------------------------------------------------------------------------
  describe('GeminiProvider', () => {
    test('throws LLMApiError if GEMINI_API_KEY is missing', async () => {
      const provider = new GeminiProvider({ apiKey: '' });
      await expect(provider.generateContent({ prompt: 'test' })).rejects.toThrow(LLMApiError);
    });

    test('makes POST request with x-goog-api-key header and json responseMimeType', async () => {
      const mockCandidateText = JSON.stringify({ modules: [{ moduleId: 'm-1', title: 'T1' }] });
      const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: mockCandidateText }]
              }
            }
          ]
        })
      });

      const provider = new GeminiProvider({
        apiKey: 'fake-test-key-12345',
        model: 'gemini-1.5-flash'
      });
      const text = await provider.generateContent({ prompt: 'Hello Gemini', timeoutMs: 5000 });

      expect(text).toBe(mockCandidateText);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [calledUrl, calledInit] = mockFetch.mock.calls[0];
      // URL must NOT contain API key in query params
      expect(calledUrl).not.toContain('fake-test-key-12345');
      expect(calledInit.headers['x-goog-api-key']).toBe('fake-test-key-12345');
      expect(calledInit.headers['Content-Type']).toBe('application/json');

      const body = JSON.parse(calledInit.body);
      expect(body.generationConfig.responseMimeType).toBe('application/json');
    });

    test('throws LLMApiError with status code on non-ok HTTP response', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Invalid argument for key=fake-test-key-12345' } })
      });

      const provider = new GeminiProvider({ apiKey: 'fake-test-key-12345' });
      const promise = provider.generateContent({ prompt: 'test' });

      await expect(promise).rejects.toThrow(LLMApiError);
      await expect(promise).rejects.toMatchObject({ statusCode: 400 });
      // Error message must redact secret key
      await expect(promise).rejects.toThrow('...[REDACTED]');
    });

    test('throws LLMTimeoutError when request is aborted via timeout', async () => {
      jest.spyOn(global, 'fetch').mockImplementation((_url, init) => {
        return new Promise((_, reject) => {
          init.signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      });

      const provider = new GeminiProvider({ apiKey: 'fake-key' });
      await expect(provider.generateContent({ prompt: 'test', timeoutMs: 50 })).rejects.toThrow(
        LLMTimeoutError
      );
    });

    test('throws LLMApiError if candidates array is empty', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ candidates: [] })
      });

      const provider = new GeminiProvider({ apiKey: 'fake-key' });
      await expect(provider.generateContent({ prompt: 'test' })).rejects.toThrow(
        'Gemini API returned empty candidate content'
      );
    });
  });

  // -------------------------------------------------------------------------
  // 5. OpenAIProvider
  // -------------------------------------------------------------------------
  describe('OpenAIProvider', () => {
    test('throws LLMApiError if OPENAI_API_KEY is missing', async () => {
      const provider = new OpenAIProvider({ apiKey: '' });
      await expect(provider.generateContent({ prompt: 'test' })).rejects.toThrow(LLMApiError);
    });

    test('makes POST request with Authorization Bearer and json_object response format', async () => {
      const mockContent = JSON.stringify({ modules: [{ moduleId: 'm-1', title: 'T1' }] });
      const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: mockContent } }]
        })
      });

      const provider = new OpenAIProvider({
        apiKey: 'openai-secret-key-12345',
        model: 'gpt-4o-mini'
      });
      const text = await provider.generateContent({ prompt: 'test prompt' });

      expect(text).toBe(mockContent);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [calledUrl, calledInit] = mockFetch.mock.calls[0];
      expect(calledUrl).toBe('https://api.openai.com/v1/chat/completions');
      expect(calledInit.headers.Authorization).toBe('Bearer openai-secret-key-12345');

      const body = JSON.parse(calledInit.body);
      expect(body.response_format).toEqual({ type: 'json_object' });
    });
  });

  // -------------------------------------------------------------------------
  // 6. createLLMProvider & getActiveAIProvider & generateRoadmapModules
  // -------------------------------------------------------------------------
  describe('Provider Factory & Orchestrator', () => {
    test('createLLMProvider instantiates correct provider class', () => {
      expect(createLLMProvider('groq')).toBeInstanceOf(GroqProvider);
      expect(createLLMProvider('gemini')).toBeInstanceOf(GeminiProvider);
      expect(createLLMProvider('openai')).toBeInstanceOf(OpenAIProvider);
      expect(createLLMProvider('default')).toBeInstanceOf(GeminiProvider);
    });

    test('getActiveAIProvider resolves provider by priority', () => {
      const origGroq = process.env.GROQ_API_KEY;
      const origGemini = process.env.GEMINI_API_KEY;
      const origOpenAI = process.env.OPENAI_API_KEY;

      delete process.env.GROQ_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      expect(getActiveAIProvider()).toBeNull();

      process.env.OPENAI_API_KEY = 'test-openai';
      expect(getActiveAIProvider()).toBeInstanceOf(OpenAIProvider);

      process.env.GEMINI_API_KEY = 'test-gemini';
      expect(getActiveAIProvider()).toBeInstanceOf(GeminiProvider);

      process.env.GROQ_API_KEY = 'test-groq';
      expect(getActiveAIProvider()).toBeInstanceOf(GroqProvider);

      // Restore
      if (origGroq) process.env.GROQ_API_KEY = origGroq; else delete process.env.GROQ_API_KEY;
      if (origGemini) process.env.GEMINI_API_KEY = origGemini; else delete process.env.GEMINI_API_KEY;
      if (origOpenAI) process.env.OPENAI_API_KEY = origOpenAI; else delete process.env.OPENAI_API_KEY;
    });

    test('generateRoadmapModules orchestrates prompt, mock provider, and defensive parsing', async () => {
      const mockModulesJson = JSON.stringify({
        modules: [
          {
            moduleId: 'react-state',
            title: 'React State Management',
            description: 'Redux and Context API deep dive.',
            resourceTags: ['react'],
            estimatedHours: 15
          },
          {
            moduleId: 'node-microservices',
            title: 'Node Microservices',
            description: 'Express microservices pattern.',
            resourceTags: ['node', 'express'],
            estimatedHours: 20
          }
        ]
      });

      const mockProvider = {
        generateContent: jest.fn().mockResolvedValue(mockModulesJson)
      };

      const result = await generateRoadmapModules({
        roleName: 'MERN Developer',
        dimensionScores: sampleScores,
        allowedTags,
        provider: mockProvider
      });

      expect(mockProvider.generateContent).toHaveBeenCalledTimes(1);
      expect(result.modules).toHaveLength(2);
      expect(result.modules[0].moduleId).toBe('react-state');
      expect(result.modules[0].resourceTags).toEqual(['react']);
      expect(result.modules[1].moduleId).toBe('node-microservices');
      expect(result.rawText).toBe(mockModulesJson);
    });
  });

  // -------------------------------------------------------------------------
  // 7. Secret Redaction & Typed Error Shapes
  // -------------------------------------------------------------------------
  describe('Security & Error Shapes', () => {
    test('redactSecrets sanitizes API keys from error messages', () => {
      const rawError = 'Failed to connect to https://api.com?key=AIzaSyD-1234567890abcdefgh';
      const redacted = redactSecrets(rawError);
      expect(redacted).not.toContain('AIzaSyD-1234567890abcdefgh');
      expect(redacted).toContain('...[REDACTED]');
    });

    test('typed errors inherit from LLMError and retain expected properties', () => {
      const timeoutErr = new LLMTimeoutError('Timed out');
      expect(timeoutErr).toBeInstanceOf(LLMError);
      expect(timeoutErr.name).toBe('LLMTimeoutError');
      expect(timeoutErr.type).toBe('TIMEOUT');

      const apiErr = new LLMApiError('Bad Request', { statusCode: 400 });
      expect(apiErr).toBeInstanceOf(LLMError);
      expect(apiErr.name).toBe('LLMApiError');
      expect(apiErr.statusCode).toBe(400);

      const parseErr = new LLMParseError('Bad JSON', { rawText: '{ invalid }' });
      expect(parseErr).toBeInstanceOf(LLMError);
      expect(parseErr.name).toBe('LLMParseError');
      expect(parseErr.rawText).toBe('{ invalid }');
    });
  });
});
