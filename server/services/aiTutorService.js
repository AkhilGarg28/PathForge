/**
 * PathForge Contextual AI Tutor & Learning Resource Generator
 * Answers student queries with deep context of their personal roadmap,
 * current week progress, identified weak topics, and previous assessment mistakes.
 */

import { getActiveAIProvider, GeminiProvider } from './llmService.js';

/**
 * Generates an intelligent, context-aware AI tutor response
 */
export async function getTutorResponse({
  userMessage,
  currentTopic = '',
  currentWeek = 1,
  targetRole = 'Full Stack Developer',
  weakTopics = [],
  recentQuizScore = null,
  chatHistory = []
}) {
  const systemContext = `You are the PathForge AI Mentor, a world-class, supportive, highly technical software engineering mentor.
You are tutoring a student targeting the career role of "${targetRole}".
STUDENT CONTEXT:
- Currently on Week ${currentWeek}
- Active Study Topic: "${currentTopic || 'Core Engineering Principles'}"
- Known Weak Topics Needing Reinforcement: [${weakTopics.join(', ') || 'None identified yet'}]
- Recent Weekly Quiz Score: ${recentQuizScore !== null ? `${recentQuizScore}%` : 'Not yet taken'}

MENTOR GUIDELINES:
1. Provide concise, clear, and actionable technical explanations with practical code examples.
2. If the student asks "Why did my roadmap change?", explain that PathForge dynamically adjusts future milestones based on their quiz performance (e.g. inserting remedial modules for scores <50% or fast-tracking for scores >90%).
3. If they ask for practice, provide a focused code problem with an explanation of edge cases.
4. Keep tone professional, encouraging, and pedagogically sound.`;

  try {
    const provider = getActiveAIProvider();
    if (provider) {
      const historyFormatted = chatHistory
        .slice(-6)
        .map((m) => `${m.role === 'user' ? 'Student' : 'Mentor'}: ${m.content}`)
        .join('\n');

      const fullPrompt = `${systemContext}\n\nCONVERSATION HISTORY:\n${historyFormatted}\n\nStudent: ${userMessage}\nMentor:`;

      const response = await provider.generateContent({
        prompt: fullPrompt,
        jsonMode: false,
        timeoutMs: 12000
      });

      if (response && response.trim().length > 0) {
        return response.trim();
      }
    }
  } catch (err) {
    console.warn(`[AITutorService] AI tutor call failed (${err.message}). Using contextual fallback response.`);
  }

  // Contextual fallback response
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes('why did my roadmap change') || lowerMsg.includes('roadmap change')) {
    return `Your roadmap dynamically updates after every weekly quiz. When your assessment reveals conceptual gaps (or conversely, advanced mastery), our AI engine adjusts upcoming weeks to either add targeted reinforcement or fast-track topics. This ensures your learning path is strictly tailored to your demonstrated ability!`;
  }

  if (lowerMsg.includes('practice') || lowerMsg.includes('challenge')) {
    return `Here is a targeted coding challenge on **${currentTopic || 'JavaScript Fundamentals'}**:\n\n**Challenge**: Implement a function \`deepClone(obj)\` that creates a full copy of an object, properly handling nested arrays and objects without keeping references.\n\n\`\`\`javascript\nfunction deepClone(obj) {\n  if (obj === null || typeof obj !== 'object') return obj;\n  if (Array.isArray(obj)) return obj.map(deepClone);\n  const clone = {};\n  for (const key in obj) {\n    if (Object.prototype.hasOwnProperty.call(obj, key)) {\n      clone[key] = deepClone(obj[key]);\n    }\n  }\n  return clone;\n}\n\`\`\`\n\nTry writing this yourself and test it with circular or deeply nested structures!`;
  }

  if (lowerMsg.includes('weak') || lowerMsg.includes('mistake')) {
    const list = weakTopics.length > 0 ? weakTopics.join(', ') : 'core foundational topics';
    return `Based on your recent assessment feedback, your primary focus areas are: **${list}**. I recommend reviewing the daily interactive exercises and MDN documentation links in your current milestone before taking the next quiz.`;
  }

  return `Great question! In **${currentTopic || targetRole}**, mastering foundational principles is essential. Focus on breaking complex problems into smaller, pure functions with clear inputs and outputs. Let me know if you would like a code snippet, an explanation of edge cases, or another practice problem!`;
}

/**
 * Generates comprehensive deep-dive topic explanation and learning resources (Phase 7)
 */
export async function generateTopicDeepDive({ topicTitle, skill, targetRole = 'MERN Developer' }) {
  try {
    const provider = getActiveAIProvider();
    if (provider) {
      const prompt = `You are an expert technical curriculum designer.
Generate an in-depth, structured learning guide for the topic: "${topicTitle}" in the context of "${skill}" for a "${targetRole}".

Return ONLY a valid JSON object matching this schema:
{
  "topicTitle": "${topicTitle}",
  "easyExplanation": "string (clear 2-3 paragraph explanation avoiding unnecessary jargon)",
  "coreConcepts": ["string (key concept 1)", "string (key concept 2)", "string (key concept 3)"],
  "codeExamples": [
    {
      "title": "string",
      "code": "string",
      "explanation": "string"
    }
  ],
  "realWorldUseCases": ["string 1", "string 2"],
  "commonPitfalls": ["string 1", "string 2"],
  "practiceQuestions": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "recommendedDocumentation": [
    {
      "title": "string",
      "url": "string (valid official docs URL, e.g. MDN or official site)",
      "type": "docs" | "article"
    }
  ]
}`;

      const raw = await provider.generateContent({ prompt, jsonMode: true, timeoutMs: 14000 });
      const parsed = JSON.parse(raw);
      if (parsed && parsed.easyExplanation) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`[AITutorService] Deep dive generation failed (${err.message}). Using curated guide.`);
  }

  // Fallback curated deep dive guide
  return {
    topicTitle,
    easyExplanation: `${topicTitle} is a foundational building block in modern ${skill} engineering. Understanding its mechanics allows you to write resilient, maintainable, and high-performance applications.`,
    coreConcepts: [
      'Execution mechanics and memory allocation',
      'Defensive error handling and boundary conditions',
      'Clean architectural separation of concerns'
    ],
    codeExamples: [
      {
        title: `Practical ${topicTitle} Pattern`,
        code: `// Practical implementation pattern for ${topicTitle}\nconst handleOperation = async (payload) => {\n  try {\n    const validated = validateInput(payload);\n    return await processData(validated);\n  } catch (error) {\n    console.error('Operation failed:', error.message);\n    throw error;\n  }\n};`,
        explanation: 'Enforces input validation and defensive error propagation.'
      }
    ],
    realWorldUseCases: [
      'Production API microservices handling user traffic',
      'Client-side state synchronization across reactive components'
    ],
    commonPitfalls: [
      'Mutating state references directly instead of creating new instances',
      'Omitting error recovery in asynchronous promise chains'
    ],
    practiceQuestions: [
      {
        question: `How does ${topicTitle} improve system reliability?`,
        answer: 'By isolating concerns, preventing unhandled exceptions, and ensuring predictable execution order.'
      }
    ],
    recommendedDocumentation: [
      {
        title: `${skill} Documentation on MDN`,
        url: 'https://developer.mozilla.org',
        type: 'docs'
      }
    ]
  };
}

export default {
  getTutorResponse,
  generateTopicDeepDive
};
