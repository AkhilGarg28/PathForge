/**
 * PathForge AI Readiness Assessment & Resume Claim Verification Engine
 * Generates personalized multi-type questions across identified skills,
 * tests theoretical & practical ability, verifies resume claims, and highlights gaps.
 */

import { getActiveAIProvider, GeminiProvider } from './llmService.js';
import { selectQuizQuestions } from './questionSelector.js';

// Comprehensive question repository for deterministic fallback across core engineering skills
const CURATED_READINESS_QUESTIONS = [
  // JavaScript - Beginner (Conceptual / Output)
  {
    id: 'js-b1',
    skill: 'JavaScript',
    level: 'Beginner',
    type: 'output_prediction',
    question: 'What is logged to the console when the following code runs in JavaScript?',
    codeSnippet: `console.log(typeof null);\nconsole.log(typeof undefined);`,
    options: ['"null" then "undefined"', '"object" then "undefined"', '"undefined" then "undefined"', '"object" then "object"'],
    correctIndex: 1,
    explanation: 'In JavaScript, typeof null returns "object" due to a historical legacy implementation quirk, whereas typeof undefined returns "undefined".',
    topic: 'Data Types & Primitives'
  },
  // JavaScript - Intermediate (Promises / Async)
  {
    id: 'js-i1',
    skill: 'JavaScript',
    level: 'Intermediate',
    type: 'find_error',
    question: 'Identify why the following asynchronous function fails to return the resolved user data:',
    codeSnippet: `function fetchUserData(userId) {\n  let result;\n  fetch('/api/user/' + userId).then(res => res.json()).then(data => {\n    result = data;\n  });\n  return result;\n}`,
    options: [
      'The function returns result synchronously before the asynchronous promise callbacks execute.',
      'Template literals must be used instead of string concatenation.',
      'fetch() is not a valid browser or Node.js native API.',
      'let result must be declared with const instead.'
    ],
    correctIndex: 0,
    explanation: 'Asynchronous fetch() promises resolve in the event loop queue. Returning result immediately returns undefined because the callback has not yet run.',
    topic: 'Asynchronous JavaScript & Promises'
  },
  // JavaScript - Advanced (Closures & Scopes)
  {
    id: 'js-a1',
    skill: 'JavaScript',
    level: 'Advanced',
    type: 'debugging',
    question: 'What is the root cause and output of this classic loop closure problem?',
    codeSnippet: `for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}`,
    options: [
      'Logs 0, 1, 2 because setTimeout copies current loop state.',
      'Logs 3, 3, 3 because var is function-scoped and by the time timers fire, i has incremented to 3.',
      'Throws a ReferenceError because i is out of scope in the callback.',
      'Logs 0, 0, 0 because var resets to 0.'
    ],
    correctIndex: 1,
    explanation: 'var declares a function-scoped or global variable shared across all iterations. Using let creates a block-scoped binding per loop iteration.',
    topic: 'Closures & Execution Context'
  },
  // React - Beginner (Components & Props)
  {
    id: 'react-b1',
    skill: 'React',
    level: 'Beginner',
    type: 'mcq',
    question: 'In React, what is the core difference between state and props?',
    codeSnippet: '',
    options: [
      'State is immutable and read-only, whereas props can be modified by the child component.',
      'Props are passed into a component from its parent, whereas state is managed internally by the component itself.',
      'Props only hold strings and numbers, whereas state holds objects and arrays.',
      'There is no functional difference; they are interchangeable terms in JSX.'
    ],
    correctIndex: 1,
    explanation: 'Props allow a parent component to configure child components (read-only), while state holds internal reactive data that triggers re-renders when mutated via state setters.',
    topic: 'React Fundamentals'
  },
  // React - Intermediate (Hooks & Lifecycle)
  {
    id: 'react-i1',
    skill: 'React',
    level: 'Intermediate',
    type: 'practical_scenario',
    question: 'In a React application, an infinite re-render loop occurs in this component. What causes it?',
    codeSnippet: `function UserCard({ userId }) {\n  const [user, setUser] = useState(null);\n  useEffect(() => {\n    fetchUser(userId).then(data => setUser(data));\n  }); // missing dependency array\n  return <div>{user?.name}</div>;\n}`,
    options: [
      'useEffect without a dependency array executes after EVERY render; calling setUser triggers another render, causing an infinite loop.',
      'useState cannot hold null as an initial value.',
      'fetchUser must be wrapped inside a useMemo hook.',
      'React prohibits calling asynchronous promises inside useEffect.'
    ],
    correctIndex: 0,
    explanation: 'Without a dependency array, useEffect runs after every render. Calling setUser updates state, which triggers a re-render, creating an infinite loop.',
    topic: 'Hooks & Dependency Arrays'
  },
  // React - Advanced (Performance & State Management)
  {
    id: 'react-a1',
    skill: 'React',
    level: 'Advanced',
    type: 'code_problem',
    question: 'When optimizing a large list item component passed callback props, how do you prevent unnecessary child re-renders?',
    codeSnippet: '',
    options: [
      'Wrap the child component in React.memo and memoize the callback using useCallback in the parent.',
      'Replace all useState calls with global window variables.',
      'Always call forceUpdate() inside the child component.',
      'Convert the functional component to an inline SVG.'
    ],
    correctIndex: 0,
    explanation: 'React.memo skips rendering if props have shallow equality, and useCallback ensures function reference stability between parent re-renders.',
    topic: 'React Performance Optimization'
  },
  // Node.js / Express - Intermediate
  {
    id: 'node-i1',
    skill: 'Node.js',
    level: 'Intermediate',
    type: 'practical_scenario',
    question: 'In Express middleware, what happens if neither next() is called nor a response (res.send/res.json) is returned?',
    codeSnippet: `app.use((req, res, next) => {\n  console.log('Incoming request: ' + req.path);\n  // forgotten next() call\n});`,
    options: [
      'Express automatically advances to the next route after 100ms.',
      'The client request hangs indefinitely until a browser or client timeout occurs.',
      'Express throws an UnhandledMiddlewareException.',
      'The server immediately shuts down.'
    ],
    correctIndex: 1,
    explanation: 'Express middleware requires invoking next() to pass control to subsequent handlers or sending a response. Omitting both leaves the HTTP socket hanging.',
    topic: 'Express Middleware & Routing'
  },
  // Databases / MongoDB - Intermediate
  {
    id: 'mongo-i1',
    skill: 'MongoDB',
    level: 'Intermediate',
    type: 'practical_scenario',
    question: 'What is the primary benefit of creating an index on { email: 1 } in a MongoDB User collection?',
    codeSnippet: `userSchema.index({ email: 1 });`,
    options: [
      'It encrypts email addresses at rest.',
      'It changes the lookup time from an O(N) collection scan to an efficient O(log N) B-Tree index scan.',
      'It automatically validates that the email string contains an @ character.',
      'It backs up the collection to cloud storage on every write.'
    ],
    correctIndex: 1,
    explanation: 'Indexes create an ordered B-Tree data structure enabling logarithmic search and preventing slow collection scans across millions of documents.',
    topic: 'Database Indexing & Query Performance'
  },
  // Data Structures & Algorithms - Intermediate
  {
    id: 'dsa-i1',
    skill: 'Data Structures & Algorithms',
    level: 'Intermediate',
    type: 'code_problem',
    question: 'What is the time complexity of looking up a key in a Hash Map / JavaScript Object on average vs worst-case?',
    codeSnippet: '',
    options: [
      'Average O(1), Worst-case O(N) due to hash collisions.',
      'Average O(log N), Worst-case O(N^2).',
      'Average O(N), Worst-case O(1).',
      'Always strictly O(1) in all scenarios without exception.'
    ],
    correctIndex: 0,
    explanation: 'Hash tables achieve average O(1) constant-time access via hash distribution, but degrade to O(N) if many keys collide in the same hash bucket.',
    topic: 'Hash Maps & Complexity Analysis'
  }
];

/**
 * Generates personalized readiness test questions based on student profile, resume claims, and GitHub
 */
export async function generateReadinessQuestions({ targetRole, resumeSkills = [], githubLanguages = [] }) {
  const isDataAnalyst = String(targetRole || '').toLowerCase().includes('data') || String(targetRole || '').toLowerCase().includes('analyst');
  const track = isDataAnalyst ? 'data-analyst' : 'mern';
  const roleDefaultSkills = isDataAnalyst
    ? ['SQL', 'Python', 'Excel', 'Pandas', 'Statistics', 'Power BI']
    : ['JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs'];

  // If AI API is available, generate dynamically tailored questions
  try {
    const provider = getActiveAIProvider();
    if (provider) {
      const skillsToTest = [
        ...new Set([
          ...resumeSkills.map((s) => s.skill || s),
          ...githubLanguages,
          ...roleDefaultSkills
        ])
      ].slice(0, 5);

      const prompt = `You are a chief technical examiner at a top tech company.
Generate a personalized, rigorous 9-question technical readiness assessment for a candidate targeting "${targetRole || (isDataAnalyst ? 'Data Analyst' : 'MERN Developer')}".
Test these skills across Beginner, Intermediate, and Advanced levels: ${skillsToTest.join(', ')}.

Include:
- 3 Beginner questions (definitions, basic syntax, output prediction)
- 3 Intermediate questions (practical scenarios, asynchronous/query logic, debugging)
- 3 Advanced questions (real-world problem solving, architecture/analytics, performance, edge cases)

Return ONLY a valid JSON array of 9 question objects matching this exact schema:
[
  {
    "id": "q-1",
    "skill": "${isDataAnalyst ? 'SQL' : 'JavaScript'}" | "${isDataAnalyst ? 'Python' : 'React'}" | "${isDataAnalyst ? 'Excel' : 'Node.js'}" | etc.,
    "level": "Beginner" | "Intermediate" | "Advanced",
    "type": "mcq" | "output_prediction" | "find_error" | "code_problem" | "debugging" | "practical_scenario",
    "question": "string (the question prompt)",
    "codeSnippet": "string (optional code block or empty string)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0 | 1 | 2 | 3,
    "explanation": "string (clear technical explanation of why correct option is right)",
    "topic": "string (e.g. Asynchronous JS, SQL Joins, Indexing, Data Normalization)"
  }
]`;

      const raw = await provider.generateContent({ prompt, jsonMode: true, timeoutMs: 14000 });
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 6) {
        return parsed.map((q, idx) => ({
          ...q,
          id: `q-${idx + 1}`
        }));
      }
    }
  } catch (err) {
    console.warn(`[AssessmentService] Dynamic question generation failed (${err.message}). Using curated question bank for track: ${track}`);
  }

  // Return track-specific randomized and shuffled questions from the comprehensive mock bank
  const selected = selectQuizQuestions({
    track,
    difficulty: 'Adaptive',
    count: 9
  });
  return selected.questions;
}

/**
 * Evaluates candidate submission and executes the RESUME CLAIM VERIFICATION
 * Detects discrepancies between self-reported resume claims and actual assessment results.
 */
export function evaluateAssessmentAndVerifyClaims({ questions = [], userAnswers = {}, resumeSkills = [] }) {
  let correctCount = 0;
  const skillScores = {};
  const evaluatedQuestions = [];

  questions.forEach((q) => {
    const selected = userAnswers[q.id];
    const isCorrect = selected !== undefined && Number(selected) === q.correctIndex;

    if (isCorrect) correctCount++;

    if (!skillScores[q.skill]) {
      skillScores[q.skill] = {
        total: 0,
        correct: 0,
        levels: { Beginner: 0, Intermediate: 0, Advanced: 0 },
        levelsCorrect: { Beginner: 0, Intermediate: 0, Advanced: 0 },
        topicsCorrect: [],
        topicsIncorrect: []
      };
    }

    skillScores[q.skill].total++;
    skillScores[q.skill].levels[q.level] = (skillScores[q.skill].levels[q.level] || 0) + 1;

    if (isCorrect) {
      skillScores[q.skill].correct++;
      skillScores[q.skill].levelsCorrect[q.level] = (skillScores[q.skill].levelsCorrect[q.level] || 0) + 1;
      if (q.topic) skillScores[q.skill].topicsCorrect.push(q.topic);
    } else {
      if (q.topic) skillScores[q.skill].topicsIncorrect.push(q.topic);
    }

    evaluatedQuestions.push({
      ...q,
      userSelectedIndex: selected !== undefined ? Number(selected) : null,
      isCorrect
    });
  });

  const totalQuestions = questions.length || 1;
  const overallScorePercent = Math.round((correctCount / totalQuestions) * 100);

  // Resume Claim Verification Engine
  const claimVerifications = [];
  const strongAreas = [];
  const weakAreas = [];

  Object.entries(skillScores).forEach(([skillName, data]) => {
    const scorePct = Math.round((data.correct / (data.total || 1)) * 100);

    // Find claimed level from resume
    const matchedClaim = resumeSkills.find((s) => s.skill?.toLowerCase() === skillName.toLowerCase());
    const claimedLevel = matchedClaim?.claimedLevel || 'Intermediate';

    let demonstratedLevel = 'Beginner';
    if (scorePct >= 80) demonstratedLevel = 'Advanced';
    else if (scorePct >= 50) demonstratedLevel = 'Intermediate';
    else demonstratedLevel = 'Needs Remediation';

    // Discrepancy Detection: Claimed Advanced/Intermediate but scored < 50%
    const isDiscrepancy =
      (claimedLevel === 'Advanced' && scorePct < 60) ||
      (claimedLevel === 'Intermediate' && scorePct < 40);

    let discrepancyMessage = '';
    let recommendedStartingLevel = demonstratedLevel === 'Needs Remediation' ? 'Foundational Remediation' : demonstratedLevel;

    if (isDiscrepancy) {
      discrepancyMessage = `Your resume mentions ${claimedLevel} ${skillName}, but your assessment performance currently indicates that some foundational concepts (${data.topicsIncorrect.join(', ') || 'core principles'}) need reinforcement.`;
      recommendedStartingLevel = 'Foundational Remediation';
      weakAreas.push(`${skillName} Fundamentals`);
    } else if (scorePct >= 75) {
      strongAreas.push(skillName);
    } else {
      weakAreas.push(skillName);
    }

    claimVerifications.push({
      skill: skillName,
      claimedLevel,
      demonstratedLevel,
      scorePercent: scorePct,
      isDiscrepancy,
      discrepancyMessage,
      topicsCorrect: data.topicsCorrect,
      topicsIncorrect: data.topicsIncorrect,
      conceptsToImprove: data.topicsIncorrect.length > 0 ? data.topicsIncorrect : ['Advanced Optimization & Architecture'],
      recommendedStartingLevel
    });
  });

  // Calculate Employability Readiness Score (0 to 100)
  const readinessScore = Math.min(100, Math.max(15, Math.round(overallScorePercent * 0.7 + (strongAreas.length >= 2 ? 20 : 10))));

  const recommendedLearningPriorities = [
    ...weakAreas.map((w) => `Priority 1: Reinforce ${w}`),
    ...strongAreas.map((s) => `Priority 2: Advance to complex practical projects in ${s}`)
  ];

  return {
    evaluatedQuestions,
    totalQuestions,
    correctAnswersCount: correctCount,
    overallScorePercent,
    readinessScore,
    claimVerifications,
    strongAreas,
    weakAreas,
    recommendedLearningPriorities
  };
}

export default {
  generateReadinessQuestions,
  evaluateAssessmentAndVerifyClaims
};
