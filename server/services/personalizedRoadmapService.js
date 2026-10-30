/**
 * PathForge Personalized Roadmap Generator & Adaptive Re-Planning Engine
 * Constructs personalized multi-week learning roadmaps with daily task breakdowns,
 * and dynamically adapts future weeks based on weekly quiz performance.
 */

import { GeminiProvider } from './llmService.js';

/**
 * Standard 12-Week Curriculum Template for Deterministic Fallback
 */
export function buildDeterministicRoadmap({ targetRole = 'MERN Developer', verifiedSkills = [], claimVerifications = [] }) {
  // Check if JavaScript or React had claim discrepancies requiring foundational remediation
  const jsVerification = claimVerifications.find((c) => c.skill.toLowerCase().includes('javascript'));
  const needsJsRemediation = jsVerification?.isDiscrepancy || jsVerification?.demonstratedLevel === 'Needs Remediation';

  const reactVerification = claimVerifications.find((c) => c.skill.toLowerCase().includes('react'));
  const needsReactRemediation = reactVerification?.isDiscrepancy || reactVerification?.demonstratedLevel === 'Needs Remediation';

  return {
    targetRole,
    version: 1,
    totalWeeks: 12,
    currentWeek: 1,
    readinessScore: 28,
    phases: [
      {
        phaseNumber: 1,
        title: 'Foundations & Deep JavaScript Mastery',
        startWeek: 1,
        endWeek: 3,
        description: 'Core language semantics, asynchronous architecture, DOM interactions, and execution contexts.'
      },
      {
        phaseNumber: 2,
        title: 'Modern Reactive Frontend Architecture',
        startWeek: 4,
        endWeek: 6,
        description: 'React component lifecycles, hooks, state management, routing, and performance optimization.'
      },
      {
        phaseNumber: 3,
        title: 'Scalable Backend APIs & Database Modeling',
        startWeek: 7,
        endWeek: 9,
        description: 'Node.js, Express REST conventions, MongoDB document schemas, authentication, and validation.'
      },
      {
        phaseNumber: 4,
        title: 'Production Engineering & Capstone Project',
        startWeek: 10,
        endWeek: 12,
        description: 'CI/CD deployment, comprehensive integration testing, system design, and portfolio showcase.'
      }
    ],
    weeks: [
      // Week 1
      {
        weekNumber: 1,
        phase: 1,
        title: needsJsRemediation ? 'JavaScript Foundations & Execution Fundamentals (Remedial Focus)' : 'JavaScript Core Fundamentals & Async Semantics',
        focusSkills: ['JavaScript', 'ES6+'],
        difficulty: needsJsRemediation ? 'Remedial' : 'Beginner',
        status: 'active',
        learningObjectives: [
          'Master variable scoping (let, const vs var) and temporal dead zone',
          'Understand memory references, primitives vs object reference types',
          'Execute array transformation methods (map, filter, reduce)',
          'Implement asynchronous control flow using Promises and async/await'
        ],
        dailyTasks: [
          {
            day: 1,
            title: 'Variables, Primitive Types & Scoping',
            estimatedMinutes: 90,
            objectives: ['Differentiate let/const from var', 'Avoid variable hoisting pitfalls'],
            explanation: 'JavaScript uses lexical scoping. let and const provide block scoping and stay in a temporal dead zone until declared.',
            codeSnippet: `const greeting = "Hello";\nlet count = 1;\nif (true) {\n  let blockScoped = "isolated";\n}`,
            practicalExercise: 'Refactor a script using var declarations to strict block-scoped let/const without memory leaks.',
            resources: [
              { title: 'MDN: JavaScript data types and data structures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures', type: 'docs' },
              { title: 'JavaScript.info: Variables and Types', url: 'https://javascript.info/variables', type: 'article' }
            ],
            completed: false
          },
          {
            day: 2,
            title: 'Functions, Arrow Functions & this Binding',
            estimatedMinutes: 90,
            objectives: ['Master function declarations vs expressions', 'Understand lexical this in arrow functions'],
            explanation: 'Arrow functions do not bind their own this, arguments, or super; they retain the lexical scope of the enclosing execution context.',
            codeSnippet: `const sum = (a, b) => a + b;\nconst obj = { val: 10, print() { setTimeout(() => console.log(this.val), 50); } };`,
            practicalExercise: 'Build a calculator utility object implementing functional chaining and arrow callbacks.',
            resources: [
              { title: 'MDN: Arrow function expressions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions', type: 'docs' }
            ],
            completed: false
          },
          {
            day: 3,
            title: 'Arrays, Objects & Destructuring',
            estimatedMinutes: 90,
            objectives: ['Perform object destructuring with default values', 'Use rest/spread syntax effectively'],
            explanation: 'Destructuring unpacks values from arrays or properties from objects into distinct variables in a clean, declarative syntax.',
            codeSnippet: `const user = { id: 1, name: "Dev" };\nconst { id, name, role = "student" } = user;`,
            practicalExercise: 'Write a deep merge utility function using rest/spread operators for nested configuration objects.',
            resources: [
              { title: 'MDN: Destructuring assignment', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment', type: 'docs' }
            ],
            completed: false
          },
          {
            day: 4,
            title: 'Functional Array Iteration (map, filter, reduce)',
            estimatedMinutes: 90,
            objectives: ['Solve data aggregation tasks using reduce', 'Perform multi-stage array pipelines without side effects'],
            explanation: 'Pure array methods avoid mutating the original array, returning newly derived arrays or accumulated values.',
            codeSnippet: `const scores = [80, 95, 60, 90];\nconst avg = scores.reduce((acc, curr) => acc + curr, 0) / scores.length;`,
            practicalExercise: 'Transform an array of raw e-commerce orders into a grouped customer summary using reduce.',
            resources: [
              { title: 'MDN: Array.prototype.reduce()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce', type: 'docs' }
            ],
            completed: false
          },
          {
            day: 5,
            title: 'Promises & Asynchronous Event Loop',
            estimatedMinutes: 100,
            objectives: ['Understand microtasks vs macrotasks', 'Handle Promise states (pending, fulfilled, rejected)'],
            explanation: 'Promises represent eventual completion or failure of an asynchronous operation, scheduling callbacks to the microtask queue.',
            codeSnippet: `const loadData = () => new Promise((resolve, reject) => setTimeout(() => resolve("Loaded!"), 500));`,
            practicalExercise: 'Write an async retry wrapper that attempts an asynchronous operation up to 3 times before failing.',
            resources: [
              { title: 'JavaScript.info: Promises and Async/Await', url: 'https://javascript.info/async', type: 'article' }
            ],
            completed: false
          },
          {
            day: 6,
            title: 'Async/Await & Defensive Error Handling',
            estimatedMinutes: 90,
            objectives: ['Refactor Promise chains to async/await', 'Implement try/catch/finally error boundaries'],
            explanation: 'async/await provides clean, synchronous-looking syntax for working with Promise-based asynchronous logic.',
            codeSnippet: `async function fetchData() {\n  try {\n    const res = await fetch('/api/items');\n    return await res.json();\n  } catch (err) {\n    console.error('Fetch error:', err);\n  }\n}`,
            practicalExercise: 'Create a resilient weather API client that handles network failures and validates response schemas.',
            resources: [
              { title: 'MDN: async function', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function', type: 'docs' }
            ],
            completed: false
          },
          {
            day: 7,
            title: 'Weekly Revision, Coding Challenge & Quiz Preparation',
            estimatedMinutes: 120,
            objectives: ['Consolidate Week 1 JavaScript skills', 'Complete practical mini-project before taking Weekly Quiz'],
            explanation: 'Comprehensive review synthesizing all foundational JavaScript concepts studied throughout the week.',
            codeSnippet: `// Mini-Project Challenge: Async Task Pipeline with Queue Concurrency`,
            practicalExercise: 'Implement an asynchronous task queue that limits concurrency to 2 active tasks at a time.',
            resources: [
              { title: 'MDN: JavaScript Guide Overview', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'docs' }
            ],
            completed: false
          }
        ],
        weeklyProject: {
          title: 'Asynchronous Task Scheduler CLI',
          description: 'A modular asynchronous queue in JavaScript featuring retry logic, timeout control, and promise resolution.',
          completed: false
        },
        weeklyQuizScore: null,
        isRemedial: needsJsRemediation,
        remedialReason: needsJsRemediation ? 'Identified foundational gaps in resume claim verification for JavaScript.' : ''
      },
      // Week 2: Advanced JavaScript
      {
        weekNumber: 2,
        phase: 1,
        title: 'Advanced JavaScript: Closures, Event Loop & Object Oriented Patterns',
        focusSkills: ['JavaScript', 'Execution Context'],
        difficulty: 'Intermediate',
        status: 'locked',
        learningObjectives: [
          'Understand closures and scope chains in deep execution contexts',
          'Explore prototypes and prototype inheritance',
          'Master event loop scheduling, call stack, and task queues',
          'Apply currying, memoization, and functional programming patterns'
        ],
        dailyTasks: [
          { day: 1, title: 'Lexical Environment & Closures', estimatedMinutes: 90, objectives: ['Create private variables using closures'], explanation: 'Closures retain access to their outer scope variables even after the outer function has completed execution.', codeSnippet: 'function counter() { let c = 0; return () => ++c; }', practicalExercise: 'Implement a memoization cache decorator using closures.', resources: [{ title: 'MDN: Closures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures', type: 'docs' }], completed: false },
          { day: 2, title: 'Prototypes & Class Syntax', estimatedMinutes: 90, objectives: ['Understand [[Prototype]] links', 'Use ES6 class inheritance'], explanation: 'JavaScript uses prototypal inheritance under the syntactic sugar of ES6 classes.', codeSnippet: 'class Person { constructor(name) { this.name = name; } }', practicalExercise: 'Build an event emitter class with on, off, and emit methods.', resources: [{ title: 'MDN: Inheritance and the prototype chain', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain', type: 'docs' }], completed: false },
          { day: 3, title: 'The Event Loop Deep-Dive', estimatedMinutes: 90, objectives: ['Predict execution order across microtasks & macrotasks'], explanation: 'Microtasks (Promises, queueMicrotask) take strict priority over macrotasks (setTimeout, setInterval).', codeSnippet: 'console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3));', practicalExercise: 'Predict and document the execution order of complex nested asynchronous snippets.', resources: [{ title: 'JavaScript.info: Event loop', url: 'https://javascript.info/event-loop', type: 'article' }], completed: false },
          { day: 4, title: 'Currying & Composition', estimatedMinutes: 90, objectives: ['Write functional pipe and compose utilities'], explanation: 'Currying transforms a multi-argument function into a sequence of unary functions.', codeSnippet: 'const add = a => b => a + b;', practicalExercise: 'Write a compose utility that combines multiple data transformations into one.', resources: [{ title: 'Functional Programming in JS', url: 'https://developer.mozilla.org', type: 'docs' }], completed: false },
          { day: 5, title: 'Memory Management & Garbage Collection', estimatedMinutes: 90, objectives: ['Identify memory leaks in DOM events and timers'], explanation: 'V8 uses mark-and-sweep garbage collection; uncleared intervals or detached DOM nodes retain references.', codeSnippet: 'const cleanup = () => window.removeEventListener("scroll", onScroll);', practicalExercise: 'Inspect and fix memory leaks in an event-heavy JavaScript script.', resources: [{ title: 'MDN: Memory Management', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management', type: 'docs' }], completed: false },
          { day: 6, title: 'Modules (ESM vs CommonJS)', estimatedMinutes: 90, objectives: ['Master import/export syntax and bundling basics'], explanation: 'ES Modules are statically analyzed at compile-time, enabling tree-shaking.', codeSnippet: 'import { sum } from "./math.js"; export default sum;', practicalExercise: 'Configure an ESM-based multi-file JavaScript project with export variations.', resources: [{ title: 'MDN: JavaScript modules', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules', type: 'docs' }], completed: false },
          { day: 7, title: 'Weekly Review & Advanced Challenge', estimatedMinutes: 120, objectives: ['Complete Week 2 project and take Weekly Assessment'], explanation: 'Synthesize advanced closures, event loop, and classes into an interactive state engine.', codeSnippet: '', practicalExercise: 'Build an observable state store inspired by Redux using pure JavaScript closures.', resources: [{ title: 'Modern JavaScript Guide', url: 'https://javascript.info', type: 'article' }], completed: false }
        ],
        weeklyProject: {
          title: 'Custom Event Emitter & State Store',
          description: 'A pure JavaScript state container with subscriber listeners and middleware support.',
          completed: false
        },
        weeklyQuizScore: null,
        isRemedial: false
      },
      // Week 3: React Fundamentals
      {
        weekNumber: 3,
        phase: 2,
        title: needsReactRemediation ? 'React Fundamentals & Component Architecture (Remedial Focus)' : 'React Component Architecture & State Management',
        focusSkills: ['React', 'Frontend'],
        difficulty: needsReactRemediation ? 'Remedial' : 'Beginner',
        status: 'locked',
        learningObjectives: [
          'Deconstruct UI into reusable, composable React components',
          'Manage local state with useState and pass immutable props',
          'Handle user input and controlled form elements',
          'Execute side-effects and data loading with useEffect'
        ],
        dailyTasks: [
          { day: 1, title: 'JSX & Component Composition', estimatedMinutes: 90, objectives: ['Render dynamic JSX safely'], explanation: 'JSX compiles to React.createElement calls creating the Virtual DOM representation.', codeSnippet: 'function Card({ title, children }) { return <div className="card"><h3>{title}</h3>{children}</div>; }', practicalExercise: 'Build a component library with Card, Button, and Badge.', resources: [{ title: 'React Documentation: Describing the UI', url: 'https://react.dev/learn/describing-the-ui', type: 'docs' }], completed: false },
          { day: 2, title: 'State vs Props & Event Handling', estimatedMinutes: 90, objectives: ['Update state immutably'], explanation: 'Never mutate state directly; always pass fresh object references to state setters.', codeSnippet: 'const [items, setItems] = useState([]);\nconst addItem = item => setItems(prev => [...prev, item]);', practicalExercise: 'Build an interactive todo checklist with add, toggle, and delete actions.', resources: [{ title: 'React Documentation: State: A Component\'s Memory', url: 'https://react.dev/learn/state-a-components-memory', type: 'docs' }], completed: false },
          { day: 3, title: 'Controlled Form Inputs & Validation', estimatedMinutes: 90, objectives: ['Build controlled form inputs with error handling'], explanation: 'Controlled inputs tie DOM input values directly to React component state.', codeSnippet: '<input value={query} onChange={e => setQuery(e.target.value)} />', practicalExercise: 'Create a registration form with real-time field validation.', resources: [{ title: 'React Documentation: Responding to Events', url: 'https://react.dev/learn/responding-to-events', type: 'docs' }], completed: false },
          { day: 4, title: 'useEffect & Component Lifecycle', estimatedMinutes: 100, objectives: ['Fetch API data on mount', 'Clean up timers and subscriptions'], explanation: 'useEffect synchronizes components with external systems like APIs and window listeners.', codeSnippet: 'useEffect(() => {\n  const timer = setInterval(tick, 1000);\n  return () => clearInterval(timer);\n}, []);', practicalExercise: 'Build a live crypto price tracker fetching data every 10 seconds with cleanup.', resources: [{ title: 'React Documentation: Synchronizing with Effects', url: 'https://react.dev/learn/synchronizing-with-effects', type: 'docs' }], completed: false },
          { day: 5, title: 'Conditional Rendering & List Keys', estimatedMinutes: 90, objectives: ['Use stable unique keys for list items'], explanation: 'Keys help React identify which items have changed, added, or removed in reconciliation.', codeSnippet: '{items.map(item => <li key={item.id}>{item.title}</li>)}', practicalExercise: 'Render a paginated product catalog with loading skeletons and empty states.', resources: [{ title: 'React Documentation: Rendering Lists', url: 'https://react.dev/learn/rendering-lists', type: 'docs' }], completed: false },
          { day: 6, title: 'Lifting State Up & Component Communication', estimatedMinutes: 90, objectives: ['Share state across sibling components'], explanation: 'Lift state to the closest common parent to coordinate updates between siblings.', codeSnippet: '// Pass state down via props, updates up via callback props', practicalExercise: 'Create a synchronized search bar and filtered list component.', resources: [{ title: 'React Documentation: Sharing State Between Components', url: 'https://react.dev/learn/sharing-state-between-components', type: 'docs' }], completed: false },
          { day: 7, title: 'Weekly Review & Mini-App Project', estimatedMinutes: 120, objectives: ['Complete interactive React Mini-App'], explanation: 'Consolidate JSX, props, state, and effects into a production-grade mini app.', codeSnippet: '', practicalExercise: 'Build a movie search application with favorites list and detail view.', resources: [{ title: 'React Official Tutorial', url: 'https://react.dev/learn', type: 'docs' }], completed: false }
        ],
        weeklyProject: {
          title: 'Interactive Task & Habit Tracker',
          description: 'A responsive React application featuring controlled forms, localStorage sync, and analytics.',
          completed: false
        },
        weeklyQuizScore: null,
        isRemedial: needsReactRemediation
      },
      // Week 4: Advanced React & Routing
      {
        weekNumber: 4,
        phase: 2,
        title: 'Advanced React: Custom Hooks, Context API & React Router',
        focusSkills: ['React', 'State Management'],
        difficulty: 'Intermediate',
        status: 'locked',
        learningObjectives: [
          'Extract reusable business logic into Custom Hooks',
          'Eliminate prop drilling using React Context API',
          'Implement client-side SPA routing with React Router v6',
          'Optimize component renders using useMemo and useCallback'
        ],
        dailyTasks: [
          { day: 1, title: 'Building Custom Hooks', estimatedMinutes: 90, objectives: ['Extract useLocalStorage and useFetch hooks'], explanation: 'Custom hooks share stateful logic between components without sharing state instances.', codeSnippet: 'function useDebounce(value, delay) { /* timer logic */ }', practicalExercise: 'Create a useDebounce hook and connect it to a search input.', resources: [{ title: 'React Documentation: Reusing Logic with Custom Hooks', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks', type: 'docs' }], completed: false },
          { day: 2, title: 'Global State with Context API & useReducer', estimatedMinutes: 90, objectives: ['Build global Auth and Theme contexts'], explanation: 'Context provides a way to pass data through the component tree without prop drilling.', codeSnippet: 'const AuthContext = createContext(null);\nexport const useAuth = () => useContext(AuthContext);', practicalExercise: 'Build a shopping cart context with dispatch actions for add, remove, and clear.', resources: [{ title: 'React Documentation: Passing Data Deeply with Context', url: 'https://react.dev/learn/passing-data-deeply-with-context', type: 'docs' }], completed: false },
          { day: 3, title: 'Client-side Routing with React Router v6', estimatedMinutes: 90, objectives: ['Configure BrowserRouter, Routes, Route, and ProtectedRoute'], explanation: 'React Router enables dynamic client-side transitions without full-page browser reloads.', codeSnippet: '<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />', practicalExercise: 'Set up multi-page routing with protected member dashboards and 404 fallbacks.', resources: [{ title: 'React Router v6 Official Docs', url: 'https://reactrouter.com', type: 'docs' }], completed: false },
          { day: 4, title: 'Performance Optimization: useMemo & useCallback', estimatedMinutes: 90, objectives: ['Prevent unnecessary renders with memoization'], explanation: 'useMemo caches expensive computations; useCallback caches function references across renders.', codeSnippet: 'const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);', practicalExercise: 'Optimize a virtualized list filtering 10,000 items with useMemo.', resources: [{ title: 'React Documentation: useMemo', url: 'https://react.dev/reference/react/useMemo', type: 'docs' }], completed: false },
          { day: 5, title: 'Code Splitting with React.lazy & Suspense', estimatedMinutes: 90, objectives: ['Reduce initial bundle size through route-level lazy loading'], explanation: 'React.lazy dynamically imports components on demand, loaded inside Suspense boundaries.', codeSnippet: 'const Dashboard = lazy(() => import("./Dashboard"));\n<Suspense fallback={<Spinner />}><Dashboard /></Suspense>', practicalExercise: 'Implement route-level code splitting across all application pages.', resources: [{ title: 'React Documentation: Suspense', url: 'https://react.dev/reference/react/Suspense', type: 'docs' }], completed: false },
          { day: 6, title: 'Component Error Boundaries', estimatedMinutes: 90, objectives: ['Catch client render crashes gracefully'], explanation: 'Error boundaries catch JavaScript errors in their child component tree and display fallback UI.', codeSnippet: 'class ErrorBoundary extends React.Component { componentDidCatch(error, info) { /* log */ } }', practicalExercise: 'Build a global ErrorBoundary component with a friendly retry UI.', resources: [{ title: 'React Error Boundaries Guide', url: 'https://react.dev', type: 'docs' }], completed: false },
          { day: 7, title: 'Weekly Review & Full SPA Project', estimatedMinutes: 120, objectives: ['Complete production-ready multi-route React application'], explanation: 'Integrate custom hooks, context, routing, and lazy loading into a cohesive app.', codeSnippet: '', practicalExercise: 'Build a full-featured dashboard with authentication, theme toggle, and route protection.', resources: [{ title: 'React Best Practices Guide', url: 'https://react.dev', type: 'docs' }], completed: false }
        ],
        weeklyProject: {
          title: 'Full-Stack SPA Dashboard with Context & Routing',
          description: 'A multi-page React application with client-side routing, protected auth routes, and theme context.',
          completed: false
        },
        weeklyQuizScore: null,
        isRemedial: false
      }
,
      // Week 5: State Management & Advanced Data Fetching
      {
        weekNumber: 5,
        phase: 2,
        title: 'State Management & Asynchronous Data Synchronization',
        focusSkills: ['React', 'State Management', 'Data Fetching'],
        difficulty: 'Intermediate',
        status: 'locked',
        learningObjectives: [
          'Master centralized state with Redux Toolkit or Zustand',
          'Implement server-state synchronization with caching and revalidation',
          'Handle optimistic UI updates and background refreshes'
        ],
        dailyTasks: [
          { day: 1, title: 'Centralized State Stores & Slices', estimatedMinutes: 90, objectives: ['Set up store and reducers'], explanation: 'Centralized stores decouple global state management from component trees.', codeSnippet: 'const store = configureStore({ reducer: { auth: authReducer } });', practicalExercise: 'Create a state slice for notification management.', resources: [{ title: 'Redux Toolkit Quick Start', url: 'https://redux-toolkit.js.org', type: 'docs' }], completed: false },
          { day: 2, title: 'Asynchronous Thunks & Middleware', estimatedMinutes: 90, objectives: ['Handle async API actions with createAsyncThunk'], explanation: 'Thunks manage pending, fulfilled, and rejected promise lifecycles.', codeSnippet: 'export const fetchUser = createAsyncThunk("user/fetch", async () => api.getMe());', practicalExercise: 'Build an async thunk that fetches and normalizes paginated API data.', resources: [{ title: 'Redux Async Logic', url: 'https://redux.js.org', type: 'docs' }], completed: false },
          { day: 3, title: 'Query Caching & Auto-Refetching', estimatedMinutes: 90, objectives: ['Implement stale-while-revalidate pattern'], explanation: 'Server-state libraries automatically deduplicate requests and cache data.', codeSnippet: 'const { data, isLoading } = useQuery(["todos"], fetchTodos);', practicalExercise: 'Build an auto-polling status widget that refetches every 10 seconds.', resources: [{ title: 'TanStack Query Overview', url: 'https://tanstack.com/query', type: 'docs' }], completed: false },
          { day: 4, title: 'Optimistic UI Updates', estimatedMinutes: 90, objectives: ['Update client UI before server acknowledgment'], explanation: 'Optimistic updates render immediate UI feedback and rollback on failure.', codeSnippet: 'onMutate: async (newTodo) => { queryClient.setQueryData(["todos"], (old) => [...old, newTodo]); }', practicalExercise: 'Implement an instant like button with automatic error rollback.', resources: [{ title: 'Optimistic Updates Guide', url: 'https://tanstack.com', type: 'docs' }], completed: false },
          { day: 5, title: 'Form State & Schema Validation with Zod', estimatedMinutes: 90, objectives: ['Validate complex form inputs type-safely'], explanation: 'Schema validation prevents corrupt client payloads from reaching the backend.', codeSnippet: 'const schema = z.object({ email: z.string().email() });', practicalExercise: 'Create a multi-step checkout form with real-time field validation.', resources: [{ title: 'Zod Documentation', url: 'https://zod.dev', type: 'docs' }], completed: false },
          { day: 6, title: 'Offline Storage & IndexedDB', estimatedMinutes: 90, objectives: ['Persist client data across browser sessions'], explanation: 'IndexedDB offers large-scale client-side structured storage.', codeSnippet: '', practicalExercise: 'Persist draft user posts locally so unsubmitted changes are never lost.', resources: [{ title: 'MDN: IndexedDB API', url: 'https://developer.mozilla.org', type: 'docs' }], completed: false },
          { day: 7, title: 'Weekly Assessment & State Architecture Review', estimatedMinutes: 120, objectives: ['Validate state management competencies'], explanation: 'Synthesize global state patterns and review edge cases.', codeSnippet: '', practicalExercise: 'Complete the adaptive Week 5 quiz.', resources: [], completed: false }
        ],
        weeklyProject: { title: 'Real-time Feed with Optimistic Mutations', description: 'Interactive social feed with instant likes, infinite scroll, and offline caching.', completed: false },
        weeklyQuizScore: null,
        isRemedial: false
      },
      // Week 6: Frontend Testing & Accessibility
      {
        weekNumber: 6,
        phase: 2,
        title: 'Frontend Testing, Accessibility (a11y) & Design Systems',
        focusSkills: ['Testing', 'Accessibility', 'Component Systems'],
        difficulty: 'Intermediate',
        status: 'locked',
        learningObjectives: ['Write robust unit and integration tests with Vitest', 'Ensure WCAG AA accessibility compliance', 'Build accessible design system tokens'],
        dailyTasks: [
          { day: 1, title: 'Component Testing with React Testing Library', estimatedMinutes: 90, objectives: ['Test user interactions rather than implementation details'], explanation: 'RTL simulates real user behaviors using accessibility role queries.', codeSnippet: 'expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();', practicalExercise: 'Write unit tests for a custom modal dialog.', resources: [], completed: false },
          { day: 2, title: 'Mocking APIs & Asynchronous Testing', estimatedMinutes: 90, objectives: ['Mock network requests cleanly'], explanation: 'Mock service workers and spy functions allow testing loading and error states.', codeSnippet: 'vi.spyOn(api, "fetchData").mockResolvedValue({ items: [] });', practicalExercise: 'Test loading, empty, and network error states for an async component.', resources: [], completed: false },
          { day: 3, title: 'Keyboard Navigation & Focus Traps', estimatedMinutes: 90, objectives: ['Implement roving tabindex and focus management'], explanation: 'Accessible web applications must be completely operable with keyboard only.', codeSnippet: '', practicalExercise: 'Build an accessible dropdown menu navigable via arrow, tab, and enter keys.', resources: [], completed: false },
          { day: 4, title: 'ARIA Roles, States & Live Regions', estimatedMinutes: 90, objectives: ['Communicate dynamic state to screen readers'], explanation: 'Aria-live announces dynamic DOM updates to assistive technologies.', codeSnippet: '<div role="status" aria-live="polite">Roadmap updated</div>', practicalExercise: 'Add aria-expanded, aria-selected, and live notifications to toast messages.', resources: [], completed: false },
          { day: 5, title: 'Color Contrast & Responsive Media Queries', estimatedMinutes: 90, objectives: ['Verify 4.5:1 text contrast ratios'], explanation: 'Ensuring readability across varying lighting and mobile viewport dimensions.', codeSnippet: '', practicalExercise: 'Audit and fix contrast issues across mobile 360px and desktop 1280px.', resources: [], completed: false },
          { day: 6, title: 'End-to-End Testing with Playwright', estimatedMinutes: 90, objectives: ['Automate full browser user journeys'], explanation: 'E2E tests verify cross-system workflows in real Chromium and WebKit instances.', codeSnippet: 'await page.getByRole("button", { name: "Login" }).click();', practicalExercise: 'Write an E2E test covering registration to dashboard roadmap display.', resources: [], completed: false },
          { day: 7, title: 'Weekly Assessment & Phase 2 Capstone', estimatedMinutes: 120, objectives: ['Evaluate full frontend mastery'], explanation: 'Complete the adaptive Phase 2 milestone assessment.', codeSnippet: '', practicalExercise: 'Take the adaptive Week 6 quiz.', resources: [], completed: false }
        ],
        weeklyProject: { title: 'Accessible Component Library with 100% Test Coverage', description: 'Reusable buttons, inputs, modals, and toasts with zero accessibility violations.', completed: false },
        weeklyQuizScore: null,
        isRemedial: false
      },
      // Week 7: Node.js Internals & Express Architecture
      {
        weekNumber: 7,
        phase: 3,
        title: 'Node.js Architecture, Streams, Event Loop & Express REST APIs',
        focusSkills: ['Node.js', 'Express', 'Backend Architecture'],
        difficulty: 'Advanced',
        status: 'locked',
        learningObjectives: ['Deep dive into libuv, event loop phases, and thread pools', 'Handle high-throughput I/O with streams and buffers', 'Structure enterprise-grade Express APIs with clean layered architecture'],
        dailyTasks: [
          { day: 1, title: 'Node.js Event Loop Phases & process.nextTick', estimatedMinutes: 90, objectives: ['Master timers, pending I/O, idle, poll, check, and close phases'], explanation: 'libuv handles async non-blocking operations across distinct phases.', codeSnippet: 'process.nextTick(() => console.log("Microtask prioritized"));', practicalExercise: 'Trace execution order across nextTick, Promise, setTimeout, and setImmediate.', resources: [], completed: false },
          { day: 2, title: 'Buffers & Streams for High-Throughput I/O', estimatedMinutes: 90, objectives: ['Stream large files without memory exhaustion'], explanation: 'Streams process chunked data incrementally instead of buffering full files in RAM.', codeSnippet: 'readableStream.pipe(transformStream).pipe(writableStream);', practicalExercise: 'Build a streaming CSV parser that handles 100MB files under 20MB memory.', resources: [], completed: false },
          { day: 3, title: 'Layered Express Architecture: Controller-Service-Repository', estimatedMinutes: 90, objectives: ['Separate routing, business logic, and database operations'], explanation: 'Layered architecture keeps controllers thin and business services unit-testable.', codeSnippet: '', practicalExercise: 'Refactor monolithic route handlers into controller, service, and data layers.', resources: [], completed: false },
          { day: 4, title: 'Centralized Error Handling & Async Wrappers', estimatedMinutes: 90, objectives: ['Prevent unhandled rejections and crashes'], explanation: 'Async middleware wrappers catch promise errors and route them to central handlers.', codeSnippet: 'const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);', practicalExercise: 'Implement a custom AppError class with HTTP status codes and operational flags.', resources: [], completed: false },
          { day: 5, title: 'Middleware Pipeline: Helmet, Compression & Rate Limiting', estimatedMinutes: 90, objectives: ['Harden Express against common web vulnerabilities'], explanation: 'Middleware handles cross-cutting security, compression, and traffic limiting.', codeSnippet: 'app.use(helmet()); app.use(compression());', practicalExercise: 'Configure IP rate-limiting with express-rate-limit and reverse proxy trust.', resources: [], completed: false },
          { day: 6, title: 'Cluster Module & Worker Threads', estimatedMinutes: 90, objectives: ['Scale Node.js across multi-core CPUs'], explanation: 'Clusters fork multiple Node processes sharing server ports for load balancing.', codeSnippet: 'if (cluster.isPrimary) { for (let i = 0; i < cpus; i++) cluster.fork(); }', practicalExercise: 'Benchmark a single-threaded server vs a 4-core cluster under load.', resources: [], completed: false },
          { day: 7, title: 'Weekly Assessment & Backend Benchmark', estimatedMinutes: 120, objectives: ['Test backend core competencies'], explanation: 'Evaluate Node.js runtime mechanics and REST API patterns.', codeSnippet: '', practicalExercise: 'Complete the adaptive Week 7 quiz.', resources: [], completed: false }
        ],
        weeklyProject: { title: 'High-Throughput Streaming File Server', description: 'Express backend supporting resumable multipart uploads, streaming transforms, and rate limiting.', completed: false },
        weeklyQuizScore: null,
        isRemedial: false
      },
      // Week 8: MongoDB & Advanced Database Modeling
      {
        weekNumber: 8,
        phase: 3,
        title: 'MongoDB Schema Design, Indexing Strategies & Aggregation Pipelines',
        focusSkills: ['MongoDB', 'Databases', 'Performance'],
        difficulty: 'Advanced',
        status: 'locked',
        learningObjectives: ['Design high-performance document schemas', 'Optimize query latency using compound and multikey indexes', 'Construct multi-stage aggregation pipelines and ACID transactions'],
        dailyTasks: [
          { day: 1, title: 'Document Schema Design: Embedding vs Referencing', estimatedMinutes: 90, objectives: ['Determine 1:1, 1:N, and N:M relationship models'], explanation: 'Embed data accessed together; reference data with high cardinality or unbounded growth.', codeSnippet: '', practicalExercise: 'Model an e-commerce schema with users, orders, items, and reviews.', resources: [], completed: false },
          { day: 2, title: 'Indexing Strategies: Single Field, Compound & TTL', estimatedMinutes: 90, objectives: ['Eliminate full collection scans (COLLSCAN)'], explanation: 'Compound indexes follow the Equality, Sort, Range (ESR) rule.', codeSnippet: 'schema.index({ userId: 1, createdAt: -1 });', practicalExercise: 'Analyze query execution plans with explain("executionStats") to verify index usage.', resources: [], completed: false },
          { day: 3, title: 'Aggregation Pipelines: $match, $group, $project & $lookup', estimatedMinutes: 90, objectives: ['Transform and aggregate complex datasets in database'], explanation: 'Pipelines process documents through sequential analytical stages on the engine.', codeSnippet: 'db.orders.aggregate([{ $match: { status: "completed" } }, { $group: { _id: "$userId", total: { $sum: "$amount" } } }]);', practicalExercise: 'Construct an analytics pipeline calculating monthly user retention rates.', resources: [], completed: false },
          { day: 4, title: 'ACID Transactions & Two-Phase Commits', estimatedMinutes: 90, objectives: ['Execute multi-document atomic operations safely'], explanation: 'Sessions guarantee all-or-nothing atomicity across document mutations.', codeSnippet: 'const session = await mongoose.startSession(); session.startTransaction();', practicalExercise: 'Implement a fund transfer between accounts with atomic commit and rollback.', resources: [], completed: false },
          { day: 5, title: 'Mongoose Middleware: Pre/Post Hooks & Virtuals', estimatedMinutes: 90, objectives: ['Automate hashing and cascade operations with hooks'], explanation: 'Document and query middleware execute lifecycle logic before saving or deleting.', codeSnippet: 'userSchema.pre("save", async function(next) { if (this.isModified("password")) this.password = await bcrypt.hash(...); });', practicalExercise: 'Add soft-delete virtuals and cascade cleanup hooks.', resources: [], completed: false },
          { day: 6, title: 'Database Security & NoSQL Injection Prevention', estimatedMinutes: 90, objectives: ['Sanitize query selectors against dollar and dot operators'], explanation: 'Express-mongo-sanitize strips operator keys from client inputs to prevent injection.', codeSnippet: '', practicalExercise: 'Test penetration attacks using { "$gt": "" } and verify middleware defenses.', resources: [], completed: false },
          { day: 7, title: 'Weekly Assessment & Database Tuning', estimatedMinutes: 120, objectives: ['Evaluate database modeling mastery'], explanation: 'Assess schema optimization and indexing knowledge.', codeSnippet: '', practicalExercise: 'Complete the adaptive Week 8 quiz.', resources: [], completed: false }
        ],
        weeklyProject: { title: 'Analytics Dashboard Backend Engine', description: 'Aggregation pipeline server computing real-time user metrics, sales stats, and index execution reports.', completed: false },
        weeklyQuizScore: null,
        isRemedial: false
      },
      // Week 9: API Security & Authentication
      {
        weekNumber: 9,
        phase: 3,
        title: 'Authentication, Authorization, JWT Security & Cryptography',
        focusSkills: ['Security', 'JWT', 'Authentication'],
        difficulty: 'Advanced',
        status: 'locked',
        learningObjectives: ['Implement secure httpOnly cookie authentication', 'Enforce Role-Based Access Control (RBAC)', 'Protect against CSRF, XSS, and session hijacking'],
        dailyTasks: [
          { day: 1, title: 'Password Hashing with Bcrypt & Salt Rounds', estimatedMinutes: 90, objectives: ['Protect user passwords against rainbow table and brute-force attacks'], explanation: 'Bcrypt uses key derivation with configurable computational cost.', codeSnippet: 'const hash = await bcrypt.hash(password, 12);', practicalExercise: 'Implement secure password registration with strength validation.', resources: [], completed: false },
          { day: 2, title: 'JWT Architecture: Signing, Verifying & httpOnly Cookies', estimatedMinutes: 90, objectives: ['Eliminate token theft via localStorage XSS'], explanation: 'httpOnly, secure, sameSite cookies prevent JavaScript access to session tokens.', codeSnippet: 'res.cookie("token", jwt, { httpOnly: true, secure: true, sameSite: "strict" });', practicalExercise: 'Build stateless authentication with automated token validation middleware.', resources: [], completed: false },
          { day: 3, title: 'Role-Based Access Control (RBAC) & Ownership Guards', estimatedMinutes: 90, objectives: ['Prevent unauthorized resource access (BOLA/IDOR)'], explanation: 'Ownership checks ensure users can only modify their own resources.', codeSnippet: 'if (resource.userId.toString() !== req.user._id.toString()) return res.status(403);', practicalExercise: 'Create RBAC middleware with Admin, Manager, and Student permissions.', resources: [], completed: false },
          { day: 4, title: 'Cross-Site Scripting (XSS) & Content Security Policy (CSP)', estimatedMinutes: 90, objectives: ['Sanitize untrusted input and configure strict headers'], explanation: 'CSP headers restrict sources of executable scripts, stylesheets, and fonts.', codeSnippet: '', practicalExercise: 'Configure Helmet with strict CSP rules blocking inline script execution.', resources: [], completed: false },
          { day: 5, title: 'Cross-Origin Resource Sharing (CORS) & Credentials', estimatedMinutes: 90, objectives: ['Safely share resources across origins without wildcards'], explanation: 'CORS requires explicit origin matching when credentials: true is enabled.', codeSnippet: 'cors({ origin: process.env.CLIENT_URL, credentials: true });', practicalExercise: 'Configure production-ready CORS between client and server domains.', resources: [], completed: false },
          { day: 6, title: 'Refresh Tokens & Session Invalidation', estimatedMinutes: 90, objectives: ['Handle silent token refreshes and account revocations'], explanation: 'Refresh token rotation allows revoking compromised tokens immediately.', codeSnippet: '', practicalExercise: 'Implement refresh token rotation with database blacklist verification.', resources: [], completed: false },
          { day: 7, title: 'Weekly Assessment & Security Audit', estimatedMinutes: 120, objectives: ['Evaluate full-stack security competence'], explanation: 'Test authentication concepts and common vulnerability remediation.', codeSnippet: '', practicalExercise: 'Complete the adaptive Week 9 quiz.', resources: [], completed: false }
        ],
        weeklyProject: { title: 'Enterprise Auth Microservice', description: 'Production-ready authentication system featuring httpOnly cookies, RBAC, password resets, and session revocation.', completed: false },
        weeklyQuizScore: null,
        isRemedial: false
      },
      // Week 10: Caching with Redis & System Design
      {
        weekNumber: 10,
        phase: 4,
        title: 'Redis In-Memory Caching, Message Queues & System Design',
        focusSkills: ['Redis', 'System Design', 'Caching'],
        difficulty: 'Advanced',
        status: 'locked',
        learningObjectives: ['Accelerate response times using Redis caching strategies', 'Manage background workers and message queues with BullMQ', 'Design distributed, scalable web systems for 100k+ active users'],
        dailyTasks: [
          { day: 1, title: 'In-Memory Data Structures with Redis', estimatedMinutes: 90, objectives: ['Master Strings, Hashes, Lists, Sets, and Sorted Sets'], explanation: 'Redis delivers sub-millisecond in-memory data lookups.', codeSnippet: 'await redis.set("user:123", JSON.stringify(userData), "EX", 3600);', practicalExercise: 'Build a leaderboard using Redis Sorted Sets with instant rank lookups.', resources: [], completed: false },
          { day: 2, title: 'Caching Strategies: Cache-Aside & Write-Through', estimatedMinutes: 90, objectives: ['Implement cache invalidation and TTL expiration'], explanation: 'Cache-aside checks Redis first and falls back to MongoDB on cache misses.', codeSnippet: '', practicalExercise: 'Build a cache middleware that reduces database queries by 80%.', resources: [], completed: false },
          { day: 3, title: 'Distributed Rate Limiting with Redis Leaky Bucket', estimatedMinutes: 90, objectives: ['Synchronize rate limits across clustered server instances'], explanation: 'Redis sliding window counters track request counts atomically across multiple API servers.', codeSnippet: '', practicalExercise: 'Implement a distributed API limiter using Redis transactions.', resources: [], completed: false },
          { day: 4, title: 'Background Job Queues with BullMQ', estimatedMinutes: 90, objectives: ['Offload CPU-intensive operations from the HTTP event loop'], explanation: 'Queues process email dispatches, reports, and image resizing in background workers.', codeSnippet: 'const queue = new Queue("emailQueue", { connection: redis });', practicalExercise: 'Create a background worker that generates weekly learning summary reports.', resources: [], completed: false },
          { day: 5, title: 'System Design: Load Balancers, CDN & Horizontal Scaling', estimatedMinutes: 90, objectives: ['Architect stateless application tiers with NGINX'], explanation: 'Load balancers distribute traffic across multiple stateless instances.', codeSnippet: '', practicalExercise: 'Diagram a scalable web application handling 50k requests per second.', resources: [], completed: false },
          { day: 6, title: 'Database Sharding, Replication & CAP Theorem', estimatedMinutes: 90, objectives: ['Understand replica sets, failover, and eventual consistency'], explanation: 'Replica sets provide high availability and automatic failover.', codeSnippet: '', practicalExercise: 'Design a partitioned database architecture for a global social platform.', resources: [], completed: false },
          { day: 7, title: 'Weekly Assessment & System Design Review', estimatedMinutes: 120, objectives: ['Validate caching and architectural design knowledge'], explanation: 'Complete the adaptive Week 10 quiz.', codeSnippet: '', practicalExercise: 'Take the adaptive Week 10 quiz.', resources: [], completed: false }
        ],
        weeklyProject: { title: 'High-Volume Notification Engine with Redis & Workers', description: 'Distributed messaging system using Redis queues, background workers, and email delivery retries.', completed: false },
        weeklyQuizScore: null,
        isRemedial: false
      },
      // Week 11: Docker, CI/CD & Cloud Deployment
      {
        weekNumber: 11,
        phase: 4,
        title: 'Docker Containerization, CI/CD Automation & Production Deployment',
        focusSkills: ['Docker', 'DevOps', 'CI/CD', 'Cloud'],
        difficulty: 'Advanced',
        status: 'locked',
        learningObjectives: ['Containerize full-stack applications with multi-stage Dockerfiles', 'Orchestrate multi-service environments with Docker Compose', 'Automate linting, testing, and deployment with GitHub Actions'],
        dailyTasks: [
          { day: 1, title: 'Multi-stage Dockerfiles for Client & Server', estimatedMinutes: 90, objectives: ['Create minimal, secure production container images'], explanation: 'Multi-stage builds separate build tools from the final runtime image.', codeSnippet: 'FROM node:20-alpine AS builder\n...\nFROM node:20-alpine AS runner', practicalExercise: 'Dockerize the Express backend reducing image size below 150MB.', resources: [], completed: false },
          { day: 2, title: 'Local Orchestration with Docker Compose', estimatedMinutes: 90, objectives: ['Spin up client, server, mongo, and redis in one command'], explanation: 'Compose manages interconnected service networks, volumes, and environment variables.', codeSnippet: '', practicalExercise: 'Write a docker-compose.yml file linking web, api, and database containers.', resources: [], completed: false },
          { day: 3, title: 'GitHub Actions: Automated Linting & Unit Testing', estimatedMinutes: 90, objectives: ['Run CI pipelines on every pull request'], explanation: 'Automated CI gates prevent broken code from merging to main.', codeSnippet: '', practicalExercise: 'Set up a GitHub Actions workflow running tests on Node 18, 20, and 22.', resources: [], completed: false },
          { day: 4, title: 'Cloud Deployments: Render, Vercel & Container Registries', estimatedMinutes: 90, objectives: ['Deploy production client and web services'], explanation: 'Deploying frontend SPAs to edge CDNs and backend APIs to managed cloud instances.', codeSnippet: '', practicalExercise: 'Deploy the client to Vercel and server to Render with SSL certificates.', resources: [], completed: false },
          { day: 5, title: 'Environment Configurations, Secrets & Health Checks', estimatedMinutes: 90, objectives: ['Secure production credentials and monitor uptime'], explanation: 'Secrets must never be committed to Git; health endpoints allow load balancer probes.', codeSnippet: 'app.get("/api/health", (req, res) => res.json({ status: "ok" }));', practicalExercise: 'Implement zero-downtime health check probes and automated alerts.', resources: [], completed: false },
          { day: 6, title: 'Monitoring & Structured Telemetry Logging', estimatedMinutes: 90, objectives: ['Track application exceptions and performance metrics'], explanation: 'Structured JSON logs enable searching error events in production monitoring tools.', codeSnippet: '', practicalExercise: 'Integrate Winston structured logging without logging credentials or secrets.', resources: [], completed: false },
          { day: 7, title: 'Weekly Assessment & DevOps Certification', estimatedMinutes: 120, objectives: ['Evaluate cloud deployment readiness'], explanation: 'Complete the adaptive Week 11 assessment.', codeSnippet: '', practicalExercise: 'Take the adaptive Week 11 quiz.', resources: [], completed: false }
        ],
        weeklyProject: { title: 'Automated Cloud CI/CD Deployment Pipeline', description: 'Fully automated pipeline building Docker images, running tests, and deploying to production cloud.', completed: false },
        weeklyQuizScore: null,
        isRemedial: false
      },
      // Week 12: Production Capstone Project & Placement Showcase
      {
        weekNumber: 12,
        phase: 4,
        title: 'Master Capstone Showcase, Code Portfolio & Technical Interview Prep',
        focusSkills: ['Full Stack', 'System Design', 'Employability'],
        difficulty: 'Advanced',
        status: 'locked',
        learningObjectives: ['Deliver an enterprise-grade full-stack capstone project', 'Showcase authentic GitHub commits and clean architecture', 'Excel in live technical assessments and system design interviews'],
        dailyTasks: [
          { day: 1, title: 'Capstone Architecture Blueprint & Entity Modeling', estimatedMinutes: 90, objectives: ['Define core user stories, data schemas, and API contracts'], explanation: 'Thorough upfront design guarantees clean execution and modular delivery.', codeSnippet: '', practicalExercise: 'Write complete API contract specifications and database ER diagrams.', resources: [], completed: false },
          { day: 2, title: 'Full-Stack Implementation: Backend APIs & Database', estimatedMinutes: 120, objectives: ['Build authenticated RESTful endpoints with indexes and validation'], explanation: 'Implement business logic with thorough defensive error handling.', codeSnippet: '', practicalExercise: 'Deliver the core backend service with unit test coverage.', resources: [], completed: false },
          { day: 3, title: 'Full-Stack Implementation: Interactive Client UI', estimatedMinutes: 120, objectives: ['Build responsive, accessible frontend with state management'], explanation: 'Create clean, intuitive UI components adhering to design system tokens.', codeSnippet: '', practicalExercise: 'Build client views with loading states, error boundaries, and optimistic updates.', resources: [], completed: false },
          { day: 4, title: 'Production Security & Performance Audit', estimatedMinutes: 90, objectives: ['Audit bundle size, Lighthouse score, and security checklist'], explanation: 'Verify zero vulnerabilities, 90+ Lighthouse score, and sub-100kb chunks.', codeSnippet: '', practicalExercise: 'Execute npm audit, Lighthouse checks, and security checklist audits.', resources: [], completed: false },
          { day: 5, title: 'GitHub Portfolio Curation & Technical Documentation', estimatedMinutes: 90, objectives: ['Craft comprehensive README with architectural diagrams'], explanation: 'High-quality READMEs demonstrate engineering professionalism to hiring managers.', codeSnippet: '', practicalExercise: 'Write detailed architecture documentation, setup instructions, and live demo links.', resources: [], completed: false },
          { day: 6, title: 'Mock Technical Interview & Code Review', estimatedMinutes: 90, objectives: ['Practice live coding and behavioral engineering questions'], explanation: 'Articulating technical trade-offs clearly distinguishes top software engineers.', codeSnippet: '', practicalExercise: 'Practice explaining asynchronous event loops, database indexes, and React reconciler.', resources: [], completed: false },
          { day: 7, title: 'Final Program Assessment & PathForge Certification', estimatedMinutes: 120, objectives: ['Complete final comprehensive assessment and graduate!'], explanation: 'Celebrate completing your personalized 12-week software engineering curriculum!', codeSnippet: '', practicalExercise: 'Take the final comprehensive graduation assessment.', resources: [], completed: false }
        ],
        weeklyProject: { title: 'Enterprise Full-Stack Capstone Project', description: 'Production-ready, deployed full-stack application featuring authentication, caching, testing, and CI/CD.', completed: false },
        weeklyQuizScore: null,
        isRemedial: false
      }
    ],
    changeHistory: [
      {
        date: new Date(),
        version: 1,
        triggerWeek: 1,
        action: 'INITIAL_GENERATION',
        reason: 'Personalized roadmap forged from initial AI readiness assessment, resume claim verification, and GitHub code analysis.',
        score: null
      }
    ]
  };
}

/**
 * Dynamically updates the roadmap after every weekly quiz assessment!
 * Adapts difficulty, inserts remedial modules, or fast-tracks concepts based on performance.
 */
export function adaptRoadmapAfterQuiz({ roadmap, weekNumber, quizScore, weakTopics = [] }) {
  if (!roadmap || !Array.isArray(roadmap.weeks)) {
    return roadmap;
  }

  const updatedWeeks = JSON.parse(JSON.stringify(roadmap.weeks));
  const weekIdx = updatedWeeks.findIndex((w) => w.weekNumber === weekNumber);

  if (weekIdx === -1) {
    return roadmap;
  }

  const currentWeek = updatedWeeks[weekIdx];
  currentWeek.status = 'completed';
  currentWeek.weeklyQuizScore = quizScore;

  let action = 'TOPIC_REINFORCEMENT';
  let reason = '';

  // 1. Mastery: 90–100% -> Increase difficulty and fast-track
  if (quizScore >= 90) {
    action = 'ADVANCED_DIFFICULTY';
    reason = `Demonstrated outstanding mastery (${quizScore}%) in Week ${weekNumber}. Increased upcoming difficulty to Advanced and accelerated curriculum pace.`;

    // Unlock next week with Advanced difficulty
    if (weekIdx + 1 < updatedWeeks.length) {
      updatedWeeks[weekIdx + 1].status = 'active';
      updatedWeeks[weekIdx + 1].difficulty = 'Advanced';
    }
  }
  // 2. Competent: 75–89% -> Continue with next level smoothly
  else if (quizScore >= 75) {
    action = 'TOPIC_REINFORCEMENT';
    reason = `Demonstrated solid competency (${quizScore}%) in Week ${weekNumber}. Progressing to next milestone with recommended practice on ${weakTopics.slice(0, 2).join(', ') || 'core topics'}.`;

    if (weekIdx + 1 < updatedWeeks.length) {
      updatedWeeks[weekIdx + 1].status = 'active';
    }
  }
  // 3. Needs Practice: 50–74% -> Identify weak topics and insert reinforcement practice
  else if (quizScore >= 50) {
    action = 'TOPIC_REINFORCEMENT';
    reason = `Scored ${quizScore}% in Week ${weekNumber}. Identified conceptual weaknesses in [${weakTopics.join(', ') || 'key topics'}]. Inserted targeted daily exercises in upcoming tasks.`;

    if (weekIdx + 1 < updatedWeeks.length) {
      const nextWeek = updatedWeeks[weekIdx + 1];
      nextWeek.status = 'active';

      // Insert focused reinforcement tasks into Day 1 and Day 2 of next week
      if (weakTopics.length > 0 && Array.isArray(nextWeek.dailyTasks)) {
        nextWeek.dailyTasks.unshift({
          day: 0,
          title: `Reinforcement Practice: ${weakTopics[0]} Fundamentals`,
          estimatedMinutes: 60,
          objectives: [`Strengthen core concepts in ${weakTopics[0]} based on recent assessment feedback`],
          explanation: `Targeted review session addressing specific questions missed during the Week ${weekNumber} quiz.`,
          codeSnippet: `// Focus on mastering ${weakTopics[0]} implementation patterns`,
          practicalExercise: `Solve 3 targeted practical exercises focusing on ${weakTopics[0]}.`,
          resources: [
            { title: `${weakTopics[0]} Official Documentation`, url: 'https://developer.mozilla.org', type: 'docs' }
          ],
          completed: false
        });
      }
    }
  }
  // 4. Below 50%: Insert Remedial Learning Module
  else {
    action = 'REMEDIAL_LESSONS_INSERTED';
    reason = `Scored ${quizScore}% in Week ${weekNumber}. AI Mentor decision: inserted an intensive 3-day remedial review module to solidify prerequisite concepts before advancing to complex milestones.`;

    // Insert remedial week or tasks
    if (weekIdx + 1 < updatedWeeks.length) {
      const nextWeek = updatedWeeks[weekIdx + 1];
      nextWeek.isRemedial = true;
      nextWeek.difficulty = 'Remedial';
      nextWeek.remedialReason = `Targeted remediation on ${weakTopics.join(', ') || 'essential prerequisite skills'}.`;
      nextWeek.status = 'active';
    }
  }

  // Recalculate student overall readiness score
  const completedCount = updatedWeeks.filter((w) => w.status === 'completed').length;
  const newReadiness = Math.min(100, Math.round(roadmap.readinessScore + (quizScore >= 75 ? 8 : 4)));

  const newVersion = (roadmap.version || 1) + 1;

  const historyEntry = {
    date: new Date(),
    version: newVersion,
    triggerWeek: weekNumber,
    action,
    reason,
    score: quizScore
  };

  return {
    ...roadmap,
    version: newVersion,
    currentWeek: Math.min(updatedWeeks.length, weekNumber + 1),
    readinessScore: newReadiness,
    weeks: updatedWeeks,
    changeHistory: [historyEntry, ...(roadmap.changeHistory || [])]
  };
}

export default {
  buildDeterministicRoadmap,
  adaptRoadmapAfterQuiz
};
