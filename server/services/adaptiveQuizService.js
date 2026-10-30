/**
 * PathForge AI-Powered Dynamic Weekly Assessment Engine
 * Generates dynamic, non-repetitive weekly quizzes tailored to the student's
 * current week curriculum, past mistakes, and weak topics.
 */

import { GeminiProvider } from './llmService.js';

// Curated question pools by week number for deterministic fallback
const CURATED_WEEKLY_QUESTIONS = {
  1: [
    {
      id: 'w1-q1',
      question: 'What is the main difference between var, let, and const in JavaScript?',
      type: 'mcq',
      codeSnippet: '',
      options: [
        'var is block-scoped, while let and const are function-scoped.',
        'var is function-scoped and hoisted, while let and const are block-scoped and temporal-dead-zone protected.',
        'const variables can be reassigned anywhere in the program.',
        'let and const do not support primitive numbers or strings.'
      ],
      correctIndex: 1,
      explanation: 'var is scoped to the nearest function context and hoisted with an initial value of undefined. let and const are block-scoped ({}) and remain uninitialized until execution reaches their declaration.',
      skill: 'JavaScript',
      topic: 'Variable Scoping & TDZ'
    },
    {
      id: 'w1-q2',
      question: 'What will be output by the following console.log statements?',
      type: 'output_prediction',
      codeSnippet: `const a = [1, 2, 3];\nconst b = a;\nb.push(4);\nconsole.log(a.length, b.length);`,
      options: ['3 4', '4 4', '4 3', 'Throws TypeError: Assignment to constant variable'],
      correctIndex: 1,
      explanation: 'Arrays in JavaScript are reference types. const b = a copies the memory pointer, not the array itself. Mutating b directly mutates the underlying array referenced by a.',
      skill: 'JavaScript',
      topic: 'Object References vs Primitives'
    },
    {
      id: 'w1-q3',
      question: 'Which array method transforms an array by applying a function and returning a single accumulated value without mutating the original?',
      type: 'mcq',
      codeSnippet: '',
      options: ['Array.prototype.forEach()', 'Array.prototype.splice()', 'Array.prototype.reduce()', 'Array.prototype.push()'],
      correctIndex: 2,
      explanation: 'Array.prototype.reduce() processes each element with an accumulator function to yield a single aggregated value (number, object, array, etc.) purely without mutating the source array.',
      skill: 'JavaScript',
      topic: 'Functional Array Methods'
    },
    {
      id: 'w1-q4',
      question: 'What does this Promise chain return when executed?',
      type: 'debugging',
      codeSnippet: `Promise.resolve(10)\n  .then(x => x * 2)\n  .then(x => { throw new Error('Failed'); })\n  .catch(err => 5)\n  .then(x => x + 1);`,
      options: ['Throws unhandled error', 'Resolves to 6', 'Resolves to 20', 'Resolves to undefined'],
      correctIndex: 1,
      explanation: 'The .catch() block intercepts the thrown error and recovers by returning 5. The following .then() receives 5 and computes 5 + 1 = 6.',
      skill: 'JavaScript',
      topic: 'Promise Chaining & Error Recovery'
    },
    {
      id: 'w1-q5',
      question: 'How do you handle rejection in an async/await function cleanly?',
      type: 'practical_scenario',
      codeSnippet: '',
      options: [
        'By wrapping the awaited expressions in a try/catch block or chaining a .catch() to the promise.',
        'Async functions cannot throw errors; rejection is impossible.',
        'By calling process.exit(1) inside the function.',
        'By declaring the function with async* instead.'
      ],
      correctIndex: 0,
      explanation: 'A rejected promise inside an async function throws an exception that can be caught using a standard try/catch block or caught at invocation with .catch().',
      skill: 'JavaScript',
      topic: 'Async/Await Exception Handling'
    }
  ],
  2: [
    {
      id: 'w2-q1',
      question: 'Why does an inner function retain access to its outer function variables even after the outer function has returned?',
      type: 'mcq',
      codeSnippet: '',
      options: [
        'Because JavaScript keeps all variables in global memory forever.',
        'Due to closures: the function retains a permanent reference to its parent Lexical Environment scope.',
        'Because variables are copied into local DOM storage automatically.',
        'This only happens if the variable is declared with window.'
      ],
      correctIndex: 1,
      explanation: 'A closure is the combination of a function bundled together with references to its surrounding lexical state (lexical environment), allowing it to access outer variables after return.',
      skill: 'JavaScript',
      topic: 'Closures & Lexical Scope'
    },
    {
      id: 'w2-q2',
      question: 'In the JavaScript event loop, in what order do microtasks and macrotasks execute when the call stack clears?',
      type: 'output_prediction',
      codeSnippet: `setTimeout(() => console.log('Timeout'), 0);\nPromise.resolve().then(() => console.log('Promise'));`,
      options: ['Timeout then Promise', 'Promise then Timeout', 'Both simultaneously', 'Order is non-deterministic'],
      correctIndex: 1,
      explanation: 'The microtask queue (Promises, queueMicrotask) is drained completely after the current execution context before any macrotask (setTimeout, setInterval, I/O) is processed.',
      skill: 'JavaScript',
      topic: 'Event Loop & Task Queues'
    },
    {
      id: 'w2-q3',
      question: 'What is the purpose of Object.freeze() in JavaScript?',
      type: 'mcq',
      codeSnippet: '',
      options: [
        'It prevents existing properties from being modified, added, or deleted (shallow immutability).',
        'It serializes the object to JSON.',
        'It performs a deep freeze of all nested object references recursively.',
        'It converts object methods into pure functions.'
      ],
      correctIndex: 0,
      explanation: 'Object.freeze() makes an object shallowly immutable: existing properties cannot be changed or removed, and new properties cannot be added.',
      skill: 'JavaScript',
      topic: 'Object Mutability & Security'
    }
  ],
  3: [
    {
      id: 'w3-q1',
      question: 'In React, why must you never mutate state directly (e.g. state.push(item))?',
      type: 'mcq',
      codeSnippet: '',
      options: [
        'React prohibits array push syntax with a compiler syntax error.',
        'Direct mutation does not trigger a re-render because React performs a shallow reference comparison to detect state changes.',
        'Mutating state alters the browser history stack unexpectedly.',
        'Direct mutations cause CSS styles to disappear.'
      ],
      correctIndex: 1,
      explanation: 'React compares state by reference (Object.is). If you mutate the existing object or array directly without changing its reference, React assumes nothing changed and skips re-rendering.',
      skill: 'React',
      topic: 'State Immutability'
    },
    {
      id: 'w3-q2',
      question: 'What is the purpose of the cleanup function returned from a useEffect hook?',
      type: 'practical_scenario',
      codeSnippet: `useEffect(() => {\n  const id = setInterval(poll, 1000);\n  return () => clearInterval(id);\n}, []);`,
      options: [
        'It runs before the component unmounts and before subsequent effect re-executions to clean up resources like timers or subscriptions.',
        'It deletes the component from localStorage.',
        'It formats the returned JSX before painting to screen.',
        'It restarts the entire React application.'
      ],
      correctIndex: 0,
      explanation: 'The cleanup function is called when the component unmounts or before the effect runs again (if dependencies change), preventing resource and memory leaks.',
      skill: 'React',
      topic: 'useEffect Lifecycle & Cleanup'
    },
    {
      id: 'w3-q3',
      question: 'Why should you avoid using array index as the key prop when rendering dynamic lists in React?',
      type: 'debugging',
      codeSnippet: '',
      options: [
        'React throws a runtime fatal crash if index is used as a key.',
        'If the list is re-ordered, filtered, or items inserted, index keys cause component state bugs and inefficient DOM re-renders.',
        'Keys must always be alphanumeric strings longer than 10 characters.',
        'Index keys disable CSS flexbox and grid styling.'
      ],
      correctIndex: 1,
      explanation: 'Keys provide identity to elements across renders. Using array indices when items can be inserted, sorted, or removed causes state and DOM identity mismatches.',
      skill: 'React',
      topic: 'List Keys & Reconciliation'
    }
  ]
};

/**
 * Generates an adaptive weekly quiz
 */
export async function generateWeeklyQuiz({ weekNumber, weekTitle, focusSkills = [], weakTopics = [], difficulty = 'Intermediate' }) {
  try {
    if (process.env.GEMINI_API_KEY) {
      const provider = new GeminiProvider();
      const prompt = `You are a curriculum assessment expert.
Generate a dynamic, rigorous 8-question weekly assessment for Week ${weekNumber}: "${weekTitle}".
Target focus skills: ${focusSkills.join(', ')}.
Target difficulty level: ${difficulty}.
${weakTopics.length > 0 ? `Include at least 2 targeted reinforcement questions addressing previous weak topics: ${weakTopics.join(', ')}.` : ''}

Include diverse question formats:
- 3 Conceptual multiple-choice questions
- 2 Output prediction questions with concise code snippets
- 2 Practical scenario / debugging questions
- 1 Edge case / optimization question

Return ONLY a valid JSON array of question objects matching this schema:
[
  {
    "id": "w${weekNumber}-q1",
    "question": "string (the question prompt)",
    "type": "mcq" | "output_prediction" | "debugging" | "practical_scenario",
    "codeSnippet": "string (code snippet or empty string)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0 | 1 | 2 | 3,
    "explanation": "string (clear technical explanation of why correct option is right)",
    "skill": "string",
    "topic": "string"
  }
]`;

      const raw = await provider.generateContent({ prompt, jsonMode: true, timeoutMs: 14000 });
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 5) {
        return {
          weekNumber,
          title: `Week ${weekNumber} Comprehensive Assessment: ${weekTitle}`,
          difficulty,
          questions: parsed.map((q, idx) => ({
            ...q,
            id: `w${weekNumber}-q${idx + 1}`
          }))
        };
      }
    }
  } catch (err) {
    console.warn(`[AdaptiveQuizService] AI dynamic quiz generation failed (${err.message}). Using curated week ${weekNumber} question pool.`);
  }

  // Fallback to curated pool
  const fallbackQuestions = CURATED_WEEKLY_QUESTIONS[weekNumber] || CURATED_WEEKLY_QUESTIONS[1];
  return {
    weekNumber,
    title: `Week ${weekNumber} Mastery Assessment: ${weekTitle}`,
    difficulty,
    questions: fallbackQuestions
  };
}

/**
 * Evaluates weekly quiz submission and determines the Adaptive Difficulty decision
 */
export function evaluateWeeklyQuizSubmission({ questions = [], userAnswers = {} }) {
  let correctCount = 0;
  const weakTopics = [];
  const strongTopics = [];
  const attemptAnswers = [];

  questions.forEach((q) => {
    const selected = userAnswers[q.id];
    const isCorrect = selected !== undefined && Number(selected) === q.correctIndex;

    if (isCorrect) {
      correctCount++;
      if (q.topic && !strongTopics.includes(q.topic)) strongTopics.push(q.topic);
    } else {
      if (q.topic && !weakTopics.includes(q.topic)) weakTopics.push(q.topic);
    }

    attemptAnswers.push({
      questionId: q.id,
      userSelectedIndex: selected !== undefined ? Number(selected) : -1,
      isCorrect
    });
  });

  const totalQuestions = questions.length || 1;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercent >= 75;

  let performanceCategory = 'Needs Practice (50-74%)';
  let feedbackMessage = '';
  let roadmapActionTaken = '';

  if (scorePercent >= 90) {
    performanceCategory = 'Mastery (90-100%)';
    feedbackMessage = `Outstanding achievement! You demonstrated complete conceptual mastery (${scorePercent}%) of this week's curriculum.`;
    roadmapActionTaken = 'Next week difficulty elevated to Advanced with accelerated topic sequencing.';
  } else if (scorePercent >= 75) {
    performanceCategory = 'Competent (75-89%)';
    feedbackMessage = `Great work! You scored ${scorePercent}% and satisfied all core milestone requirements.`;
    roadmapActionTaken = 'Unlocking next curriculum week at standard difficulty.';
  } else if (scorePercent >= 50) {
    performanceCategory = 'Needs Practice (50-74%)';
    feedbackMessage = `You scored ${scorePercent}%. You have good baseline understanding, but several key concepts require reinforcement.`;
    roadmapActionTaken = `Identified weak topics [${weakTopics.slice(0, 2).join(', ')}]. Targeted review tasks inserted into your upcoming schedule.`;
  } else {
    performanceCategory = 'Remedial Required (<50%)';
    feedbackMessage = `You scored ${scorePercent}%. Critical conceptual gaps were identified in prerequisite topics.`;
    roadmapActionTaken = `AI Mentor decision: inserted an intensive remedial review module on [${weakTopics.join(', ') || 'fundamentals'}] before moving forward.`;
  }

  return {
    scorePercent,
    passed,
    correctCount,
    totalQuestions,
    performanceCategory,
    feedbackMessage,
    roadmapActionTaken,
    weakTopics,
    strongTopics,
    attemptAnswers
  };
}

export default {
  generateWeeklyQuiz,
  evaluateWeeklyQuizSubmission
};
