/**
 * PathForge Mock Learning Paths: 12-Week Curriculum Templates
 * Comprehensive, production-grade 12-week roadmaps for both MERN Developer and Data Analyst tracks.
 */

export const mernLearningPath = {
  roleSlug: 'mern-developer',
  roleName: 'MERN Developer',
  totalWeeks: 12,
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
    {
      weekNumber: 1,
      phase: 1,
      title: 'JavaScript Core Fundamentals & Async Semantics',
      focusSkills: ['JavaScript', 'ES6+'],
      difficulty: 'Beginner',
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
          practicalExercise: 'Refactor legacy code using var to block-scoped let/const without memory leaks.',
          resources: [
            { title: 'MDN: JavaScript data types and structures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures', type: 'docs' },
            { title: 'JavaScript.info: Variables', url: 'https://javascript.info/variables', type: 'article' }
          ],
          completed: false
        },
        {
          day: 2,
          title: 'Functions, Arrow Functions & Lexical this',
          estimatedMinutes: 90,
          objectives: ['Master function declarations vs expressions', 'Understand lexical this binding in arrow functions'],
          explanation: 'Arrow functions retain the this context of the enclosing scope, making them ideal for callbacks and class methods.',
          codeSnippet: `const numbers = [1, 2, 3];\nconst doubled = numbers.map((n) => n * 2);`,
          practicalExercise: 'Write an event listener using an arrow function to preserve class instance context.',
          resources: [
            { title: 'MDN: Arrow functions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions', type: 'docs' }
          ],
          completed: false
        },
        {
          day: 3,
          title: 'Functional Array Methods: Map, Filter, Reduce',
          estimatedMinutes: 90,
          objectives: ['Transform datasets immutably', 'Aggregate metrics with reduce'],
          explanation: 'Chaining array methods allows declarative data manipulation without mutating original data structures.',
          codeSnippet: `const total = orders.filter(o => o.active).reduce((sum, o) => sum + o.price, 0);`,
          practicalExercise: 'Aggregate a nested transactions array into categorized totals using reduce.',
          resources: [
            { title: 'JavaScript.info: Array methods', url: 'https://javascript.info/array-methods', type: 'article' }
          ],
          completed: false
        },
        {
          day: 4,
          title: 'Closures & Lexical Environments',
          estimatedMinutes: 90,
          objectives: ['Implement data privacy using closures', 'Build memoization function caches'],
          explanation: 'A closure is the combination of a function bundled together with references to its surrounding lexical state.',
          codeSnippet: `function memoize(fn) {\n  const cache = {};\n  return (...args) => cache[args] ??= fn(...args);\n}`,
          practicalExercise: 'Implement a memoized Fibonacci calculator utilizing closures.',
          resources: [
            { title: 'MDN: Closures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures', type: 'docs' }
          ],
          completed: false
        },
        {
          day: 5,
          title: 'Promises, Microtasks & Async/Await',
          estimatedMinutes: 120,
          objectives: ['Chain promises with clean error handling', 'Utilize Promise.all and Promise.allSettled'],
          explanation: 'Promises represent eventual completion of asynchronous operations. Async/await provides clean synchronous syntax.',
          codeSnippet: `const [user, posts] = await Promise.all([fetchUser(id), fetchPosts(id)]);`,
          practicalExercise: 'Write an asynchronous retry wrapper with exponential backoff.',
          resources: [
            { title: 'MDN: Using Promises', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises', type: 'docs' }
          ],
          completed: false
        },
        {
          day: 6,
          title: 'Weekly Project: Asynchronous Task Runner',
          estimatedMinutes: 120,
          objectives: ['Build a concurrency-limited queue manager for promises'],
          explanation: 'Managing concurrent asynchronous tasks prevents overwhelming backend APIs with excessive parallel requests.',
          codeSnippet: `class AsyncQueue {\n  constructor(concurrency = 2) { this.concurrency = concurrency; }\n}`,
          practicalExercise: 'Implement a queue that executes tasks with a maximum concurrency limit of 3.',
          resources: [],
          completed: false
        },
        {
          day: 7,
          title: 'Weekly Knowledge Check & Reflection',
          estimatedMinutes: 60,
          objectives: ['Assess core JavaScript mastery with the dynamic weekly quiz'],
          explanation: 'Validate knowledge retention across scoping, functional programming, and asynchronous semantics.',
          codeSnippet: '',
          practicalExercise: 'Complete the Week 1 adaptive quiz.',
          resources: [],
          completed: false
        }
      ],
      weeklyProject: {
        title: 'Asynchronous Concurrency Queue Manager',
        description: 'Lightweight JavaScript library orchestrating async promises with rate limiting, retries, and concurrency limits.',
        completed: false
      },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 2,
      phase: 1,
      title: 'Advanced JavaScript: Event Loop, Prototypes & Modules',
      focusSkills: ['JavaScript', 'Prototypes', 'Event Loop'],
      difficulty: 'Intermediate',
      status: 'locked',
      learningObjectives: ['Demystify the Node & Browser Event Loop', 'Understand prototype chains and inheritance', 'Master ES Modules and CommonJS interop'],
      dailyTasks: [
        { day: 1, title: 'Event Loop Deep Dive: Microtasks vs Macrotasks', estimatedMinutes: 90, objectives: ['Differentiate process.nextTick, Promise.then, and setTimeout'], explanation: 'Microtasks are processed after every call stack frame, before the next macrotask.', codeSnippet: '', practicalExercise: 'Predict log outputs for nested event loop callbacks.', resources: [], completed: false },
        { day: 2, title: 'Prototype Inheritance & Object.create', estimatedMinutes: 90, objectives: ['Trace prototype chains', 'Implement subclassing without ES6 classes'], explanation: 'JavaScript uses prototype delegation where objects inherit directly from other objects.', codeSnippet: 'function Dog(name) { Animal.call(this, name); }', practicalExercise: 'Implement an inheritance hierarchy using prototype chaining.', resources: [], completed: false },
        { day: 3, title: 'Modern ES6+ Classes & Private Class Fields', estimatedMinutes: 90, objectives: ['Utilize #private properties', 'Master static methods and getters/setters'], explanation: 'ES2022 private fields (#property) enforce true hard runtime encapsulation.', codeSnippet: 'class BankAccount { #balance = 0; }', practicalExercise: 'Build a secure BankAccount class using private fields.', resources: [], completed: false },
        { day: 4, title: 'ES Modules vs CommonJS Interop', estimatedMinutes: 90, objectives: ['Manage import/export across environments', 'Resolve module resolution errors'], explanation: 'ESM is static and asynchronous; CommonJS is dynamic and synchronous.', codeSnippet: 'import { readFile } from "fs/promises";', practicalExercise: 'Migrate a CommonJS module to pure ES Modules.', resources: [], completed: false },
        { day: 5, title: 'Error Handling: Custom Error Hierarchies', estimatedMinutes: 90, objectives: ['Extend Error class for typed application exceptions'], explanation: 'Custom error classes enable centralized HTTP status code mapping.', codeSnippet: 'class AppError extends Error { constructor(msg, status) { super(msg); this.status = status; } }', practicalExercise: 'Build an API error hierarchy with BadRequest, Unauthorized, and NotFound classes.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Event Emitter Implementation', estimatedMinutes: 120, objectives: ['Code a full-featured pub/sub EventEmitter from scratch'], explanation: 'The EventEmitter pattern underpins Node.js streams and asynchronous architectures.', codeSnippet: 'class MyEmitter { on(event, fn) {} emit(event, ...args) {} }', practicalExercise: 'Implement MyEmitter with on, emit, once, and off methods.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check & Reflection', estimatedMinutes: 60, objectives: ['Complete Week 2 adaptive quiz'], explanation: 'Review event loop and prototype questions.', codeSnippet: '', practicalExercise: 'Take the Week 2 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Custom EventEmitter Library', description: 'Zero-dependency Event Emitter supporting once listeners, regex event matching, and error isolation.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 3,
      phase: 1,
      title: 'DOM Manipulation, Web APIs & Browser Storage',
      focusSkills: ['DOM', 'Web APIs', 'Storage'],
      difficulty: 'Intermediate',
      status: 'locked',
      learningObjectives: ['Manipulate the DOM efficiently with document fragments', 'Master Fetch API with AbortController', 'Understand cookies, localStorage, and sessionStorage'],
      dailyTasks: [
        { day: 1, title: 'DOM Querying & Event Delegation', estimatedMinutes: 90, objectives: ['Attach single listeners to parent containers to handle dynamic children'], explanation: 'Event delegation leverages event bubbling to handle hundreds of child elements efficiently.', codeSnippet: 'parent.addEventListener("click", e => { if (e.target.matches(".btn")) {} });', practicalExercise: 'Build a dynamic list where items can be deleted using event delegation.', resources: [], completed: false },
        { day: 2, title: 'DOM Performance: DocumentFragments & Repaints', estimatedMinutes: 90, objectives: ['Batch DOM modifications to avoid layout thrashing'], explanation: 'DocumentFragments exist in memory and append all children in a single DOM repaint.', codeSnippet: 'const frag = document.createDocumentFragment();', practicalExercise: 'Insert 5,000 DOM elements smoothly using DocumentFragment.', resources: [], completed: false },
        { day: 3, title: 'Fetch API, AbortController & Request Timeouts', estimatedMinutes: 90, objectives: ['Cancel in-flight network requests on component unmount or rapid input'], explanation: 'AbortController provides signals to cancel fetch requests and prevent memory leaks.', codeSnippet: 'const controller = new AbortController();\nfetch(url, { signal: controller.signal });', practicalExercise: 'Implement a typeahead search box that aborts previous pending requests.', resources: [], completed: false },
        { day: 4, title: 'Browser Storage: Cookies, LocalStorage & IndexedDB', estimatedMinutes: 90, objectives: ['Evaluate storage limits and security trade-offs (XSS vs CSRF)'], explanation: 'Cookies carry authentication; localStorage is synchronous; IndexedDB stores structured client data.', codeSnippet: '', practicalExercise: 'Build an offline shopping cart backed by localStorage.', resources: [], completed: false },
        { day: 5, title: 'Web Workers & Off-Main-Thread Processing', estimatedMinutes: 90, objectives: ['Offload CPU-heavy computation from the UI thread'], explanation: 'Web Workers run in background threads without blocking user clicks or animations.', codeSnippet: 'const worker = new Worker("worker.js");\nworker.postMessage(data);', practicalExercise: 'Perform image filter calculations in a Web Worker.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Interactive Kanban Board', estimatedMinutes: 120, objectives: ['Build a pure JavaScript Drag-and-Drop Kanban board'], explanation: 'HTML5 Drag and Drop API with state persistence in browser storage.', codeSnippet: '', practicalExercise: 'Create a 3-column Kanban board with persistent task reordering.', resources: [], completed: false },
        { day: 7, title: 'Weekly Assessment: Phase 1 Mastery', estimatedMinutes: 60, objectives: ['Complete Phase 1 graduation assessment'], explanation: 'Comprehensive review of JavaScript foundations.', codeSnippet: '', practicalExercise: 'Take Week 3 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Vanilla JS Drag-and-Drop Kanban Board', description: 'Fully interactive Kanban board with HTML5 drag-and-drop, task filters, and localStorage persistence.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 4,
      phase: 2,
      title: 'React Fundamentals: JSX, Props & Reactive State',
      focusSkills: ['React', 'JSX', 'useState'],
      difficulty: 'Beginner',
      status: 'locked',
      learningObjectives: ['Grasp declarative component modeling', 'Master unidirectional data flow and props', 'Manage reactive state with useState'],
      dailyTasks: [
        { day: 1, title: 'Component Architecture & JSX Compilation', estimatedMinutes: 90, objectives: ['Decompose complex UIs into reusable component atoms'], explanation: 'JSX compiles into React.createElement calls creating lightweight Virtual DOM representations.', codeSnippet: 'function UserCard({ name, role }) { return <div><h3>{name}</h3><p>{role}</p></div>; }', practicalExercise: 'Decompose a social media post into 4 modular React components.', resources: [], completed: false },
        { day: 2, title: 'State Mechanics & Batching Updates', estimatedMinutes: 90, objectives: ['Update state immutably and utilize functional updaters'], explanation: 'React 18 automatically batches state updates across event handlers and promises.', codeSnippet: 'setCount(prev => prev + 1);', practicalExercise: 'Build a multi-step wizard form managing state across steps.', resources: [], completed: false },
        { day: 3, title: 'Handling Events & Controlled Form Inputs', estimatedMinutes: 90, objectives: ['Synchronize React state with form controls'], explanation: 'Controlled components treat React state as the single source of truth for input values.', codeSnippet: '<input value={email} onChange={e => setEmail(e.target.value)} />', practicalExercise: 'Create an interactive signup form with live client-side validation.', resources: [], completed: false },
        { day: 4, title: 'Conditional Rendering & Dynamic List Rendering', estimatedMinutes: 90, objectives: ['Render components conditionally using ternaries and short-circuit evaluation'], explanation: 'Use stable unique IDs as keys when mapping over lists to preserve element identity.', codeSnippet: '{items.map(item => <Item key={item.id} {...item} />)}', practicalExercise: 'Render a searchable filterable product catalog.', resources: [], completed: false },
        { day: 5, title: 'Lifting State Up & Component Composition', estimatedMinutes: 90, objectives: ['Share state between sibling components via common parent'], explanation: 'Move state to the closest common ancestor and pass callbacks down as props.', codeSnippet: '<Parent><Child count={count} onIncrement={increment} /></Parent>', practicalExercise: 'Refactor two sibling widgets to synchronize through their parent component.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Expense Tracker Application', estimatedMinutes: 120, objectives: ['Build an expense tracking dashboard with category filters and balance calculations'], explanation: 'Practice state manipulation, filtering, and component composition.', codeSnippet: '', practicalExercise: 'Complete the Expense Tracker project.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take the Week 4 adaptive quiz'], explanation: 'Validate React fundamentals.', codeSnippet: '', practicalExercise: 'Complete Week 4 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'React Expense Tracker & Analytics Widget', description: 'Interactive personal budgeting application with category filtering, monthly charts, and local persistence.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 5,
      phase: 2,
      title: 'Advanced React Hooks: Lifecycle, Refs & Reducers',
      focusSkills: ['React Hooks', 'useEffect', 'useReducer'],
      difficulty: 'Intermediate',
      status: 'locked',
      learningObjectives: ['Master useEffect dependency array rules and cleanup', 'Harness useRef for DOM access and mutable instance storage', 'Model state machines with useReducer'],
      dailyTasks: [
        { day: 1, title: 'useEffect Lifecycle Mechanics & Synchronization', estimatedMinutes: 90, objectives: ['Synchronize components with external systems safely'], explanation: 'Effects run after render; always specify accurate dependency arrays to prevent stale closures.', codeSnippet: 'useEffect(() => { const id = subscribe(val); return () => unsubscribe(id); }, [val]);', practicalExercise: 'Implement a window resize listener with automated cleanup.', resources: [], completed: false },
        { day: 2, title: 'Fetching Data in Effects & Race Condition Guards', estimatedMinutes: 90, objectives: ['Prevent stale response overwrites during rapid parameter changes'], explanation: 'Use an ignore boolean flag or AbortController inside effect cleanup to ignore stale responses.', codeSnippet: 'useEffect(() => { let ignore = false; fetchUser().then(u => { if (!ignore) setUser(u); }); return () => { ignore = true; }; }, [userId]);', practicalExercise: 'Build a user profile view that never displays mismatched data during rapid switching.', resources: [], completed: false },
        { day: 3, title: 'useRef: DOM Access & Persistent Values', estimatedMinutes: 90, objectives: ['Focus inputs imperatively and store timer IDs without re-rendering'], explanation: 'useRef returns a persistent mutable object whose .current mutation does not trigger a re-render.', codeSnippet: 'const inputRef = useRef(); inputRef.current.focus();', practicalExercise: 'Build a stopwatch component with start, pause, and lap features using useRef.', resources: [], completed: false },
        { day: 4, title: 'Complex State Management with useReducer', estimatedMinutes: 90, objectives: ['Decouple complex state transitions into pure reducer functions'], explanation: 'useReducer models state transitions deterministically via dispatched actions.', codeSnippet: 'const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });', practicalExercise: 'Build a full shopping cart state machine with add, remove, and coupon actions.', resources: [], completed: false },
        { day: 5, title: 'Custom Hooks: Extracting Reusable Logic', estimatedMinutes: 90, objectives: ['Package data fetching, local storage, and media queries into custom hooks'], explanation: 'Custom hooks share stateful logic between components without duplicating code.', codeSnippet: 'function useLocalStorage(key, initialVal) { ... }', practicalExercise: 'Build useFetch and useLocalStorage hooks.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Real-Time Weather Dashboard', estimatedMinutes: 120, objectives: ['Build a weather dashboard utilizing custom hooks, abortable fetch, and useReducer'], explanation: 'Combine useEffect data fetching, error boundaries, and state management.', codeSnippet: '', practicalExercise: 'Complete Weather Dashboard application.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take Week 5 adaptive quiz'], explanation: 'Assess hooks knowledge.', codeSnippet: '', practicalExercise: 'Complete Week 5 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'React Weather App with Custom Hooks', description: 'Weather analytics dashboard with debounced city search, geolocation lookup, and temperature unit switching.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 6,
      phase: 2,
      title: 'Context API, Routing & Performance Optimization',
      focusSkills: ['React Router', 'Context API', 'Performance'],
      difficulty: 'Advanced',
      status: 'locked',
      learningObjectives: ['Architect multi-page SPAs with React Router v6', 'Design global state with Context API', 'Optimize re-renders with useMemo, useCallback, and React.memo'],
      dailyTasks: [
        { day: 1, title: 'Client-Side Routing with React Router v6', estimatedMinutes: 90, objectives: ['Configure declarative route hierarchies and nested layouts'], explanation: 'React Router intercepts URL changes and renders matched components without full page reloads.', codeSnippet: '<Routes><Route path="/" element={<Layout />}><Route index element={<Home />} /></Route></Routes>', practicalExercise: 'Set up an application shell with navbar, nested dashboard routes, and 404 page.', resources: [], completed: false },
        { day: 2, title: 'Protected Routes & Authentication Guards', estimatedMinutes: 90, objectives: ['Redirect unauthenticated users to login while preserving target URL'], explanation: 'Wrapper route components check auth state and conditionally render children or Navigate to /login.', codeSnippet: 'const ProtectedRoute = ({ children }) => user ? children : <Navigate to="/login" replace />;', practicalExercise: 'Build a ProtectedRoute wrapper guarding authenticated dashboards.', resources: [], completed: false },
        { day: 3, title: 'Context API: Global Authentication & Theme State', estimatedMinutes: 90, objectives: ['Eliminate prop drilling without heavy third-party state libraries'], explanation: 'Context broadcast updates to all listening components anywhere in the tree.', codeSnippet: 'const AuthContext = createContext(); export const useAuth = () => useContext(AuthContext);', practicalExercise: 'Build an AuthProvider providing user, login, and logout state across the app.', resources: [], completed: false },
        { day: 4, title: 'Performance Optimization: useMemo, useCallback & React.memo', estimatedMinutes: 90, objectives: ['Diagnose unnecessary component re-renders with React DevTools Profiler'], explanation: 'Memoize expensive computations and stable function references to preserve shallow prop equality.', codeSnippet: 'const cached = useMemo(() => heavyMath(val), [val]);', practicalExercise: 'Profile a sluggish table view and optimize it to eliminate redundant child renders.', resources: [], completed: false },
        { day: 5, title: 'Code Splitting with React.lazy & Suspense', estimatedMinutes: 90, objectives: ['Break bundle size into on-demand chunks with dynamic imports'], explanation: 'React.lazy delays loading route component scripts until the user actually navigates to them.', codeSnippet: 'const Dashboard = lazy(() => import("./pages/Dashboard")); <Suspense fallback={<Spinner />}>', practicalExercise: 'Implement route-level code splitting reducing initial bundle size by 60%.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: E-Commerce Storefront SPA', estimatedMinutes: 120, objectives: ['Build an e-commerce storefront with cart context, route guards, and code splitting'], explanation: 'Integrate React Router, Context API, and performance optimization in a complete app.', codeSnippet: '', practicalExercise: 'Complete E-Commerce Storefront project.', resources: [], completed: false },
        { day: 7, title: 'Phase 2 Graduation Assessment', estimatedMinutes: 60, objectives: ['Take Week 6 adaptive quiz'], explanation: 'Review React routing and optimization.', codeSnippet: '', practicalExercise: 'Complete Week 6 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'E-Commerce Storefront SPA', description: 'Full-featured online shop with product catalog, cart context, checkout authentication guards, and code splitting.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 7,
      phase: 3,
      title: 'Node.js Core Architecture, Streams & Express REST APIs',
      focusSkills: ['Node.js', 'Express', 'REST APIs'],
      difficulty: 'Intermediate',
      status: 'locked',
      learningObjectives: ['Master Node runtime internals and asynchronous file I/O', 'Design clean RESTful routing architecture with Express', 'Implement defensive validation and centralized error handling'],
      dailyTasks: [
        { day: 1, title: 'Node.js Runtime: Buffer, FS & Stream Piping', estimatedMinutes: 90, objectives: ['Stream large files without memory exhaustion'], explanation: 'Streams process data piece by piece rather than buffering all contents in memory.', codeSnippet: 'createReadStream(path).pipe(res);', practicalExercise: 'Build a streaming file download endpoint handling 500MB files.', resources: [], completed: false },
        { day: 2, title: 'Express Routing & Modular Controller Architecture', estimatedMinutes: 90, objectives: ['Separate routes, controllers, and services clean MVC style'], explanation: 'Controllers contain HTTP request/response logic; services hold domain business logic.', codeSnippet: 'router.route("/users").get(getUsers).post(createUser);', practicalExercise: 'Structure an Express API into routes, controllers, and service layers.', resources: [], completed: false },
        { day: 3, title: 'Request Validation with Zod / Joi', estimatedMinutes: 90, objectives: ['Validate request schemas before business logic executes'], explanation: 'Defensive validation rejects malformed payloads early with 400 Bad Request.', codeSnippet: 'const schema = z.object({ email: z.string().email(), password: z.string().min(8) });', practicalExercise: 'Write middleware validating incoming JSON against Zod schemas.', resources: [], completed: false },
        { day: 4, title: 'Centralized Error Handling Middleware', estimatedMinutes: 90, objectives: ['Catch synchronous and asynchronous exceptions in a unified error pipeline'], explanation: 'A four-argument middleware (err, req, res, next) formats errors without leaking stack traces.', codeSnippet: 'app.use((err, req, res, next) => res.status(err.status || 500).json({ error: err.message }));', practicalExercise: 'Implement a global error handler that formats validation, auth, and database errors.', resources: [], completed: false },
        { day: 5, title: 'CORS Configuration & Security Headers (Helmet)', estimatedMinutes: 90, objectives: ['Safely permit credentials across cross-origin domains'], explanation: 'Configure CORS without wildcards and enable Helmet HTTP headers to guard against common web vulnerabilities.', codeSnippet: 'app.use(helmet()); app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));', practicalExercise: 'Set up production-ready CORS and Helmet policies.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: RESTful Content Management API', estimatedMinutes: 120, objectives: ['Deliver a fully documented REST API with CRUD operations, filtering, and pagination'], explanation: 'Build a complete Express backend following RESTful conventions.', codeSnippet: '', practicalExercise: 'Complete CMS API project.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take Week 7 adaptive quiz'], explanation: 'Test Express routing and middleware.', codeSnippet: '', practicalExercise: 'Complete Week 7 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'RESTful Article Publishing API', description: 'Production Express API featuring pagination, search query filtering, input validation, and centralized error handling.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 8,
      phase: 3,
      title: 'MongoDB Schema Design, Indexing & Aggregations',
      focusSkills: ['MongoDB', 'Mongoose', 'Database Modeling'],
      difficulty: 'Intermediate',
      status: 'locked',
      learningObjectives: ['Design high-performance Mongoose schemas', 'Index collections for sub-10ms query execution', 'Construct multi-stage Aggregation pipelines'],
      dailyTasks: [
        { day: 1, title: 'Mongoose Schemas, Validations & Hooks', estimatedMinutes: 90, objectives: ['Define data models with custom schema validators and pre/post hooks'], explanation: 'Mongoose provides schema enforcement, casting, and query helpers over MongoDB.', codeSnippet: 'const userSchema = new Schema({ email: { type: String, required: true, lowercase: true } });', practicalExercise: 'Create a User and Product schema with custom price and email validators.', resources: [], completed: false },
        { day: 2, title: 'Relationships: Embedding vs Referencing (.populate)', estimatedMinutes: 90, objectives: ['Determine when to embed documents vs reference via ObjectIds'], explanation: 'Embed data accessed together with high locality; reference data with high cardinality (1 to thousands).', codeSnippet: 'author: { type: Schema.Types.ObjectId, ref: "User" }', practicalExercise: 'Model an Order containing embedded items and a referenced customer.', resources: [], completed: false },
        { day: 3, title: 'Compound Indexes & Query Optimization (explain)', estimatedMinutes: 90, objectives: ['Eliminate COLLSCANs and ensure queries use index scans (IXSCAN)'], explanation: 'Order compound indexes by Equality, Sort, and Range (ESR rule).', codeSnippet: 'schema.index({ status: 1, createdAt: -1 });', practicalExercise: 'Run .explain("executionStats") on an unindexed query, add a compound index, and verify speedup.', resources: [], completed: false },
        { day: 4, title: 'MongoDB Aggregation Pipeline: $match, $group, $project', estimatedMinutes: 90, objectives: ['Calculate complex business metrics using aggregation stages'], explanation: 'Aggregation processes documents through an assembly line of filtering, grouping, and projection.', codeSnippet: 'Order.aggregate([{ $match: { paid: true } }, { $group: { _id: "$userId", total: { $sum: "$amount" } } }]);', practicalExercise: 'Write an aggregation query generating monthly sales revenue reports.', resources: [], completed: false },
        { day: 5, title: 'Advanced Aggregations: $lookup, $unwind & Facets', estimatedMinutes: 90, objectives: ['Perform cross-collection joins and multi-dimensional analytics in a single database roundtrip'], explanation: '$lookup performs left outer joins; $facet runs parallel independent aggregations.', codeSnippet: '{ $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } }', practicalExercise: 'Build an analytics endpoint calculating total revenue, average order value, and top users.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Analytics Data Service', estimatedMinutes: 120, objectives: ['Create an analytics API service aggregating user activities and business KPIs'], explanation: 'Combine Mongoose models and complex aggregation pipelines.', codeSnippet: '', practicalExercise: 'Deliver the Analytics service project.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take Week 8 adaptive quiz'], explanation: 'Validate MongoDB and Mongoose knowledge.', codeSnippet: '', practicalExercise: 'Complete Week 8 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Real-Time Business Analytics Engine', description: 'Backend service using MongoDB aggregation pipelines to calculate revenue trends, churn, and cohort metrics.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 9,
      phase: 3,
      title: 'Production Authentication, JWT Cookies & RBAC Security',
      focusSkills: ['Authentication', 'JWT', 'Security', 'RBAC'],
      difficulty: 'Advanced',
      status: 'locked',
      learningObjectives: ['Implement secure user registration with bcrypt password hashing', 'Manage stateless JWT sessions via httpOnly secure cookies', 'Enforce Role-Based Access Control and ownership verification'],
      dailyTasks: [
        { day: 1, title: 'Password Hashing with Bcrypt & Salt Rounds', estimatedMinutes: 90, objectives: ['Protect passwords against rainbow table and brute-force attacks'], explanation: 'Bcrypt uses adaptive work factor hashing that resists GPU cracking.', codeSnippet: 'const hash = await bcrypt.hash(password, 12);', practicalExercise: 'Implement user registration with password strength verification and hashing.', resources: [], completed: false },
        { day: 2, title: 'JWT Architecture: Signing, Verifying & httpOnly Cookies', estimatedMinutes: 90, objectives: ['Eliminate token theft via localStorage XSS'], explanation: 'httpOnly, secure cookies prevent client-side JavaScript access to authentication tokens.', codeSnippet: 'res.cookie("token", jwt, { httpOnly: true, secure: true, sameSite: "lax" });', practicalExercise: 'Build stateless authentication with automated cookie validation middleware.', resources: [], completed: false },
        { day: 3, title: 'Role-Based Access Control (RBAC) & Ownership Guards', estimatedMinutes: 90, objectives: ['Prevent unauthorized resource access (BOLA/IDOR vulnerabilities)'], explanation: 'Ownership checks ensure users can only modify their own resources.', codeSnippet: 'if (doc.userId.toString() !== req.user._id.toString()) return res.status(403);', practicalExercise: 'Create RBAC middleware with Admin, Manager, and Student permissions.', resources: [], completed: false },
        { day: 4, title: 'NoSQL Injection & XSS Sanitization', estimatedMinutes: 90, objectives: ['Sanitize untrusted input and strip malicious MongoDB query operators'], explanation: 'Strip keys starting with $ or containing dots to prevent query injection.', codeSnippet: 'app.use(mongoSanitize());', practicalExercise: 'Implement NoSQL injection tests proving security against malicious payloads.', resources: [], completed: false },
        { day: 5, title: 'Rate Limiting & Brute-Force Defense', estimatedMinutes: 90, objectives: ['Protect auth routes from credential stuffing attacks'], explanation: 'Express rate limiters restrict requests per IP address over sliding windows.', codeSnippet: 'const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });', practicalExercise: 'Apply rate limiting to login and diagnostic submission endpoints.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Enterprise Auth Microservice', estimatedMinutes: 120, objectives: ['Deliver production-grade authentication with cookies, RBAC, and rate limiting'], explanation: 'Integrate full auth flow into an isolated service.', codeSnippet: '', practicalExercise: 'Complete Auth Microservice.', resources: [], completed: false },
        { day: 7, title: 'Phase 3 Graduation Assessment', estimatedMinutes: 60, objectives: ['Take Week 9 adaptive quiz'], explanation: 'Review security and authentication.', codeSnippet: '', practicalExercise: 'Complete Week 9 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Enterprise Auth Microservice', description: 'Production-ready authentication system featuring httpOnly cookies, RBAC, password resets, and session revocation.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 10,
      phase: 4,
      title: 'Redis In-Memory Caching & Distributed System Design',
      focusSkills: ['Redis', 'System Design', 'Caching'],
      difficulty: 'Advanced',
      status: 'locked',
      learningObjectives: ['Accelerate response times using Redis caching strategies', 'Manage background workers and message queues', 'Design distributed, scalable web systems for 100k+ active users'],
      dailyTasks: [
        { day: 1, title: 'In-Memory Data Structures with Redis', estimatedMinutes: 90, objectives: ['Master Strings, Hashes, Lists, and Sorted Sets'], explanation: 'Redis delivers sub-millisecond in-memory data lookups.', codeSnippet: 'await redis.set("key", JSON.stringify(val), "EX", 3600);', practicalExercise: 'Build a leaderboard using Redis Sorted Sets with instant rank lookups.', resources: [], completed: false },
        { day: 2, title: 'Caching Strategies: Cache-Aside & Invalidation', estimatedMinutes: 90, objectives: ['Implement cache invalidation and TTL expiration'], explanation: 'Cache-aside checks Redis first and falls back to MongoDB on cache misses.', codeSnippet: '', practicalExercise: 'Build a cache middleware that reduces database queries by 80%.', resources: [], completed: false },
        { day: 3, title: 'Distributed Rate Limiting with Redis', estimatedMinutes: 90, objectives: ['Synchronize rate limits across clustered server instances'], explanation: 'Redis sliding window counters track request counts atomically across multiple API servers.', codeSnippet: '', practicalExercise: 'Implement a distributed API limiter using Redis transactions.', resources: [], completed: false },
        { day: 4, title: 'Background Job Queues with BullMQ', estimatedMinutes: 90, objectives: ['Offload CPU-intensive operations from the HTTP event loop'], explanation: 'Queues process email dispatches, reports, and image resizing in background workers.', codeSnippet: '', practicalExercise: 'Create a background worker that generates weekly learning summary reports.', resources: [], completed: false },
        { day: 5, title: 'System Design: Load Balancers, CDN & Horizontal Scaling', estimatedMinutes: 90, objectives: ['Architect stateless application tiers with NGINX'], explanation: 'Load balancers distribute traffic across multiple stateless instances.', codeSnippet: '', practicalExercise: 'Diagram a scalable web application handling 50k requests per second.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: High-Volume Notification Engine', estimatedMinutes: 120, objectives: ['Build a distributed messaging system using Redis queues and background workers'], explanation: 'Practice async job processing with retries and dead-letter queues.', codeSnippet: '', practicalExercise: 'Complete Notification Engine project.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take Week 10 adaptive quiz'], explanation: 'Validate caching and system design knowledge.', codeSnippet: '', practicalExercise: 'Complete Week 10 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'High-Volume Notification Engine with Redis', description: 'Distributed messaging system using Redis queues, background workers, and email delivery retries.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 11,
      phase: 4,
      title: 'Docker Containerization, CI/CD Automation & Cloud Deployment',
      focusSkills: ['Docker', 'DevOps', 'CI/CD', 'Cloud'],
      difficulty: 'Advanced',
      status: 'locked',
      learningObjectives: ['Containerize full-stack applications with multi-stage Dockerfiles', 'Orchestrate multi-service environments with Docker Compose', 'Automate linting, testing, and deployment with GitHub Actions'],
      dailyTasks: [
        { day: 1, title: 'Multi-stage Dockerfiles for Client & Server', estimatedMinutes: 90, objectives: ['Create minimal, secure production container images'], explanation: 'Multi-stage builds separate build tools from the final runtime image.', codeSnippet: 'FROM node:20-alpine AS builder', practicalExercise: 'Dockerize the Express backend reducing image size below 150MB.', resources: [], completed: false },
        { day: 2, title: 'Local Orchestration with Docker Compose', estimatedMinutes: 90, objectives: ['Spin up client, server, mongo, and redis in one command'], explanation: 'Compose manages interconnected service networks, volumes, and environment variables.', codeSnippet: 'version: "3.8"\nservices: ...', practicalExercise: 'Write a docker-compose.yml file linking web, api, and database containers.', resources: [], completed: false },
        { day: 3, title: 'GitHub Actions: Automated Linting & Unit Testing', estimatedMinutes: 90, objectives: ['Run CI pipelines on every pull request'], explanation: 'Automated CI gates prevent broken code from merging to main.', codeSnippet: '', practicalExercise: 'Set up a GitHub Actions workflow running tests on Node 18, 20, and 22.', resources: [], completed: false },
        { day: 4, title: 'Cloud Deployments: Render, Vercel & Atlas', estimatedMinutes: 90, objectives: ['Deploy production client and web services with SSL'], explanation: 'Deploying frontend SPAs to edge CDNs and backend APIs to managed cloud instances.', codeSnippet: '', practicalExercise: 'Deploy the client to Vercel and server to Render with live Atlas database.', resources: [], completed: false },
        { day: 5, title: 'Environment Configurations, Secrets & Health Checks', estimatedMinutes: 90, objectives: ['Secure production credentials and monitor uptime'], explanation: 'Secrets must never be committed to Git; health endpoints allow load balancer probes.', codeSnippet: 'app.get("/api/health", ...);', practicalExercise: 'Implement zero-downtime health check probes and automated alerts.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Automated Cloud CI/CD Pipeline', estimatedMinutes: 120, objectives: ['Deliver an automated GitHub Actions pipeline building and deploying on push'], explanation: 'Complete CI/CD workflow.', codeSnippet: '', practicalExercise: 'Complete CI/CD Pipeline project.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take Week 11 adaptive quiz'], explanation: 'Evaluate cloud deployment readiness.', codeSnippet: '', practicalExercise: 'Complete Week 11 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Automated Cloud CI/CD Deployment Pipeline', description: 'Fully automated pipeline building Docker images, running tests, and deploying to production cloud.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 12,
      phase: 4,
      title: 'Master Capstone Showcase, Code Portfolio & Placement Prep',
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
  ]
};

export const dataAnalystLearningPath = {
  roleSlug: 'data-analyst',
  roleName: 'Data Analyst',
  totalWeeks: 12,
  phases: [
    {
      phaseNumber: 1,
      title: 'Spreadsheet Analytics & Relational SQL Foundations',
      startWeek: 1,
      endWeek: 3,
      description: 'Advanced Excel modeling, Power Query transformations, relational SQL querying, filtering, and joins.'
    },
    {
      phaseNumber: 2,
      title: 'Advanced SQL, Window Functions & Business Intelligence',
      startWeek: 4,
      endWeek: 6,
      description: 'Complex SQL window functions, CTEs, Power BI data modeling, DAX measures, and interactive dashboards.'
    },
    {
      phaseNumber: 3,
      title: 'Python for Data Analysis: Pandas, NumPy & Visualization',
      startWeek: 7,
      endWeek: 9,
      description: 'Data wrangling with Pandas, numerical computing with NumPy, EDA visualizations (Seaborn, Matplotlib), and data cleaning.'
    },
    {
      phaseNumber: 4,
      title: 'Statistical Inference, Business Analytics & Capstone Showcase',
      startWeek: 10,
      endWeek: 12,
      description: 'Hypothesis testing, A/B experiment design, business KPIs (churn, CLV, cohorts), and placement portfolio.'
    }
  ],
  weeks: [
    {
      weekNumber: 1,
      phase: 1,
      title: 'Advanced Excel: Formulas, Lookups & Data Cleansing',
      focusSkills: ['Excel', 'Data Cleaning'],
      difficulty: 'Beginner',
      status: 'active',
      learningObjectives: ['Master XLOOKUP, INDEX/MATCH, and nested logical conditions', 'Clean messy data with text and date functions', 'Construct structured tables and dynamic named ranges'],
      dailyTasks: [
        { day: 1, title: 'Mastering XLOOKUP & Modern Lookup Paradigms', estimatedMinutes: 90, objectives: ['Replace fragile VLOOKUPs with two-way XLOOKUP lookups'], explanation: 'XLOOKUP searches any orientation and defaults to exact match.', codeSnippet: '=XLOOKUP(A2, Products[ID], Products[Price], "Not Found")', practicalExercise: 'Build an automated price calculation sheet using XLOOKUP.', resources: [], completed: false },
        { day: 2, title: 'Two-Dimensional Grid Lookups with INDEX & MATCH', estimatedMinutes: 90, objectives: ['Perform flexible matrix lookups across rows and columns'], explanation: 'MATCH computes array offsets; INDEX retrieves the intersecting cell.', codeSnippet: '=INDEX(Matrix, MATCH(rowVal, Rows, 0), MATCH(colVal, Cols, 0))', practicalExercise: 'Create a shipping fee matrix lookup based on weight and destination zone.', resources: [], completed: false },
        { day: 3, title: 'Data Cleaning: Text Functions & Handling Inconsistencies', estimatedMinutes: 90, objectives: ['Cleanse messy customer records using TRIM, CLEAN, and TEXTJOIN'], explanation: 'Standardizing casing, whitespace, and formatting prevents calculation errors.', codeSnippet: '=PROPER(TRIM(CLEAN(A2)))', practicalExercise: 'Standardize a messy 5,000-row contact list.', resources: [], completed: false },
        { day: 4, title: 'Logical Formulas & Error Handling: IFS, SWITCH & IFERROR', estimatedMinutes: 90, objectives: ['Build resilient conditional category assignments without deep IF nesting'], explanation: 'IFS and SWITCH evaluate multi-tier business rules cleanly.', codeSnippet: '=IFERROR(VLOOKUP(A1, B:C, 2, FALSE), "Manual Review")', practicalExercise: 'Categorize sales accounts into Bronze, Silver, Gold, and Platinum tiers.', resources: [], completed: false },
        { day: 5, title: 'Conditional Formatting & Data Validation', estimatedMinutes: 90, objectives: ['Implement automated quality alerts and restricted dropdown entry'], explanation: 'Validation prevents bad data entry at ingestion.', codeSnippet: '', practicalExercise: 'Build an expense submission template with input validation and duplicate alerts.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Financial Modeling & KPI Dashboard', estimatedMinutes: 120, objectives: ['Construct a clean financial summary model with dynamic scenario toggles'], explanation: 'Apply advanced lookups and validation to business finance modeling.', codeSnippet: '', practicalExercise: 'Deliver the Financial Modeling workbook.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Complete Week 1 Data Analyst quiz'], explanation: 'Test Excel formula mastery.', codeSnippet: '', practicalExercise: 'Take Week 1 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Dynamic Financial Modeling Dashboard in Excel', description: 'Interactive multi-scenario financial model featuring dynamic lookups, input validation, and variance analysis.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 2,
      phase: 1,
      title: 'Excel Pivot Tables, Slicers & Power Query ETL',
      focusSkills: ['Excel', 'Power Query', 'Pivot Tables'],
      difficulty: 'Beginner',
      status: 'locked',
      learningObjectives: ['Aggregate multi-dimensional data with Pivot Tables', 'Automate data cleaning and reshaping using Power Query ETL', 'Design interactive executive reporting sheets with slicers'],
      dailyTasks: [
        { day: 1, title: 'Pivot Table Architecture & Aggregation Types', estimatedMinutes: 90, objectives: ['Summarize transaction logs by region, category, and month'], explanation: 'Pivot tables summarize large tabular data without writing formulas.', codeSnippet: '', practicalExercise: 'Build a sales breakdown by product line and quarterly trends.', resources: [], completed: false },
        { day: 2, title: 'Calculated Fields, Items & Grouping', estimatedMinutes: 90, objectives: ['Calculate profit margins directly inside Pivot Tables'], explanation: 'Calculated fields compute custom formulas on aggregated metrics.', codeSnippet: '=Profit / Revenue', practicalExercise: 'Group timestamps into custom fiscal quarters and compute conversion percentages.', resources: [], completed: false },
        { day: 3, title: 'Introduction to Power Query ETL: Extract & Transform', estimatedMinutes: 90, objectives: ['Import, clean, and combine data from multiple CSV files automatically'], explanation: 'Power Query records transformation steps (ETL) that re-run on fresh data.', codeSnippet: '', practicalExercise: 'Combine 12 monthly sales CSV files into a unified clean table with one click.', resources: [], completed: false },
        { day: 4, title: 'Power Query: Unpivoting Columns & Merges', estimatedMinutes: 90, objectives: ['Convert wide crosstab spreadsheets into normalized tall tables'], explanation: 'Unpivoting transforms repeated attribute headers into normalized relational rows.', codeSnippet: '', practicalExercise: 'Unpivot a multi-year budget spreadsheet for downstream BI analysis.', resources: [], completed: false },
        { day: 5, title: 'Interactive Dashboard Design with Slicers & Timelines', estimatedMinutes: 90, objectives: ['Connect multiple Pivot Tables to synchronized interactive slicers'], explanation: 'Slicers provide visually intuitive filtering across multiple dashboard charts.', codeSnippet: '', practicalExercise: 'Design an executive sales overview dashboard with linked slicers.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Automated Sales ETL & Reporting Pipeline', estimatedMinutes: 120, objectives: ['Deliver an automated Excel reporting pipeline utilizing Power Query and Pivot Tables'], explanation: 'End-to-end spreadsheet automation project.', codeSnippet: '', practicalExercise: 'Complete Sales ETL project.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take Week 2 adaptive quiz'], explanation: 'Review Pivot Tables and Power Query.', codeSnippet: '', practicalExercise: 'Complete Week 2 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Automated Sales ETL & Reporting Pipeline', description: 'Automated workbook combining monthly raw CSV exports via Power Query into dynamic executive Pivot dashboards.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 3,
      phase: 1,
      title: 'Relational Database Fundamentals & SQL Querying',
      focusSkills: ['SQL', 'Relational Databases'],
      difficulty: 'Beginner',
      status: 'locked',
      learningObjectives: ['Understand relational database schemas and foreign keys', 'Write performant SELECT, WHERE, and ORDER BY queries', 'Aggregate data with GROUP BY and filter groups with HAVING'],
      dailyTasks: [
        { day: 1, title: 'Relational Model: Tables, Keys & Schemas', estimatedMinutes: 90, objectives: ['Understand Primary Keys, Foreign Keys, and Referential Integrity'], explanation: 'Relational databases enforce data consistency through normalized relational schemas.', codeSnippet: 'CREATE TABLE customers (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE);', practicalExercise: 'Design an Entity-Relationship (ER) diagram for an online retail business.', resources: [], completed: false },
        { day: 2, title: 'SQL Data Retrieval: SELECT, WHERE & Operators', estimatedMinutes: 90, objectives: ['Filter datasets with logical operators, LIKE pattern matching, and IN lists'], explanation: 'WHERE clauses filter individual rows before returning results.', codeSnippet: 'SELECT name, price FROM products WHERE category = "Electronics" AND price < 500;', practicalExercise: 'Query a store database to find high-value orders placed in Q3.', resources: [], completed: false },
        { day: 3, title: 'SQL Aggregations: COUNT, SUM, AVG, MIN, MAX', estimatedMinutes: 90, objectives: ['Calculate descriptive statistical summaries in SQL'], explanation: 'Aggregate functions compute single summary metrics across rows.', codeSnippet: 'SELECT COUNT(*), AVG(salary), MAX(salary) FROM employees;', practicalExercise: 'Calculate department-level compensation summaries.', resources: [], completed: false },
        { day: 4, title: 'Grouping Data with GROUP BY & HAVING', estimatedMinutes: 90, objectives: ['Aggregate records by categorical keys and filter groups'], explanation: 'GROUP BY aggregates rows; HAVING filters aggregated groups.', codeSnippet: 'SELECT country, COUNT(*) FROM users GROUP BY country HAVING COUNT(*) >= 100;', practicalExercise: 'Identify customer segments with more than 10 total transactions.', resources: [], completed: false },
        { day: 5, title: 'Date & Time Manipulation in SQL', estimatedMinutes: 90, objectives: ['Extract dates, calculate time deltas, and handle timezones'], explanation: 'DATE_TRUNC, EXTRACT, and DATEDIFF enable time-series slicing.', codeSnippet: 'SELECT DATE_TRUNC("month", created_at) AS month, COUNT(*) FROM orders GROUP BY 1;', practicalExercise: 'Calculate average delivery time (days between order date and ship date).', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: E-Commerce Customer Analytics in SQL', estimatedMinutes: 120, objectives: ['Write complex SQL queries analyzing user acquisition and order volume trends'], explanation: 'Produce an executive analytics summary from raw transactional tables.', codeSnippet: '', practicalExercise: 'Complete Customer Analytics SQL project.', resources: [], completed: false },
        { day: 7, title: 'Phase 1 Graduation Assessment', estimatedMinutes: 60, objectives: ['Take Week 3 quiz'], explanation: 'Assess SQL and spreadsheet foundations.', codeSnippet: '', practicalExercise: 'Complete Week 3 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Customer Transaction Analysis with SQL', description: 'Set of production SQL queries answering 10 key business questions regarding churn, order frequency, and revenue.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 4,
      phase: 2,
      title: 'Advanced SQL: Multi-Table Joins, Subqueries & CTEs',
      focusSkills: ['SQL Joins', 'CTEs', 'Subqueries'],
      difficulty: 'Intermediate',
      status: 'locked',
      learningObjectives: ['Master INNER, LEFT, RIGHT, and FULL OUTER joins', 'Construct Common Table Expressions (CTEs) for modular analysis', 'Solve complex business queries with correlated subqueries'],
      dailyTasks: [
        { day: 1, title: 'Inner Joins vs Outer Joins (LEFT, RIGHT, FULL)', estimatedMinutes: 90, objectives: ['Select appropriate join types for relational data queries'], explanation: 'INNER JOIN retains matches; LEFT JOIN keeps all left rows and fills unmatched right rows with NULL.', codeSnippet: 'SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id;', practicalExercise: 'Write a query identifying customers who have never placed an order.', resources: [], completed: false },
        { day: 2, title: 'Self Joins & Hierarchical Relationship Modeling', estimatedMinutes: 90, objectives: ['Query tables that reference their own primary keys'], explanation: 'Self joins map hierarchical relationships like employee-manager or product bundling.', codeSnippet: 'SELECT e.name, m.name AS manager FROM employees e LEFT JOIN employees m ON e.mgr_id = m.id;', practicalExercise: 'Build a multi-level management reporting query.', resources: [], completed: false },
        { day: 3, title: 'Common Table Expressions (CTEs) & Readability', estimatedMinutes: 90, objectives: ['Deconstruct complex multi-tier queries into structured WITH blocks'], explanation: 'CTEs define named temporary result sets that improve readability and maintainability.', codeSnippet: 'WITH TopCustomers AS (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY 1) ...', practicalExercise: 'Refactor a 4-level nested subquery into clean, readable CTEs.', resources: [], completed: false },
        { day: 4, title: 'Subqueries: Correlated vs Scalar Subqueries', estimatedMinutes: 90, objectives: ['Filter records dynamically against subquery aggregations'], explanation: 'Correlated subqueries evaluate per row of the outer query; scalar subqueries return a single value.', codeSnippet: 'WHERE salary > (SELECT AVG(salary) FROM employees);', practicalExercise: 'Identify employees earning more than the average salary of their specific department.', resources: [], completed: false },
        { day: 5, title: 'Set Operations: UNION, INTERSECT, and EXCEPT', estimatedMinutes: 90, objectives: ['Combine and compare independent query result sets'], explanation: 'UNION deduplicates; UNION ALL appends rapidly without sorting; EXCEPT finds differences.', codeSnippet: 'SELECT email FROM newsletter_subscribers EXCEPT SELECT email FROM registered_users;', practicalExercise: 'Find subscribers who have not created registered accounts.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: SaaS Retention & Churn SQL Model', estimatedMinutes: 120, objectives: ['Build an end-to-end subscription retention SQL analysis model using CTEs and Joins'], explanation: 'Track active subscriptions, upgrades, and cancellations across billing cycles.', codeSnippet: '', practicalExercise: 'Complete SaaS Retention project.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take Week 4 adaptive quiz'], explanation: 'Assess multi-table SQL queries.', codeSnippet: '', practicalExercise: 'Complete Week 4 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'SaaS Subscription Retention SQL Model', description: 'Comprehensive CTE-driven SQL analysis calculating monthly recurring revenue (MRR), expansion revenue, and churn.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 5,
      phase: 2,
      title: 'SQL Window Functions & Advanced Analytical Queries',
      focusSkills: ['SQL Window Functions', 'Analytics'],
      difficulty: 'Intermediate',
      status: 'locked',
      learningObjectives: ['Compute running totals, rolling averages, and partitions with OVER()', 'Rank items with ROW_NUMBER(), RANK(), and DENSE_RANK()', 'Calculate period-over-period growth using LAG() and LEAD()'],
      dailyTasks: [
        { day: 1, title: 'Window Function Basics & OVER (PARTITION BY ...)', estimatedMinutes: 90, objectives: ['Perform aggregations without collapsing individual rows'], explanation: 'Window functions calculate aggregate metrics across partitions while preserving individual row detail.', codeSnippet: 'SELECT employee_id, salary, AVG(salary) OVER (PARTITION BY department) FROM employees;', practicalExercise: 'Calculate each employee\'s salary as a percentage of their department\'s total budget.', resources: [], completed: false },
        { day: 2, title: 'Ranking Functions: ROW_NUMBER, RANK & DENSE_RANK', estimatedMinutes: 90, objectives: ['Identify top N items within each categorical group'], explanation: 'ROW_NUMBER assigns unique indices; RANK skips ties; DENSE_RANK assigns consecutive numbers.', codeSnippet: 'SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC) AS rank FROM items;', practicalExercise: 'Query the top 3 best-selling products in every sales region.', resources: [], completed: false },
        { day: 3, title: 'Navigational Functions: LAG & LEAD for Growth Analysis', estimatedMinutes: 90, objectives: ['Calculate month-over-month (MoM) revenue growth rates'], explanation: 'LAG accesses previous row data in the window; LEAD looks ahead.', codeSnippet: 'SELECT date, revenue, LAG(revenue, 1) OVER (ORDER BY date) AS prev_rev FROM sales;', practicalExercise: 'Calculate daily percentage change in website traffic over a 90-day period.', resources: [], completed: false },
        { day: 4, title: 'Cumulative Metrics: Running Totals & Moving Averages', estimatedMinutes: 90, objectives: ['Smooth out noisy data using 7-day rolling averages'], explanation: 'Frame specifications (ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) define sliding windows.', codeSnippet: 'AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)', practicalExercise: 'Calculate a 7-day moving average of daily active users (DAU).', resources: [], completed: false },
        { day: 5, title: 'Percentiles & Distribution Functions: NTILE, CUME_DIST', estimatedMinutes: 90, objectives: ['Segment users into revenue quartiles and deciles'], explanation: 'NTILE(4) divides ordered rows into 4 equal buckets for quartile analysis.', codeSnippet: 'SELECT user_id, spend, NTILE(4) OVER (ORDER BY spend DESC) AS quartile FROM users;', practicalExercise: 'Segment customer base into spending quartiles for marketing campaigns.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Financial Time-Series Analytics in SQL', estimatedMinutes: 120, objectives: ['Build an executive financial report featuring rolling averages, MoM growth, and ranking'], explanation: 'Apply window functions to stock or sales time-series data.', codeSnippet: '', practicalExercise: 'Complete Financial Time-Series project.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take Week 5 adaptive quiz'], explanation: 'Assess window functions.', codeSnippet: '', practicalExercise: 'Complete Week 5 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Financial Time-Series Analytics in SQL', description: 'Advanced SQL script calculating running revenue totals, 7-day moving averages, and month-over-month growth rates.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 6,
      phase: 2,
      title: 'Power BI Data Modeling, DAX Measures & Visualizations',
      focusSkills: ['Power BI', 'DAX', 'Data Modeling'],
      difficulty: 'Intermediate',
      status: 'locked',
      learningObjectives: ['Architect Star Schema dimensional models with Fact and Dimension tables', 'Author business logic with DAX (CALCULATE, RELATED, FILTER)', 'Design accessible, high-impact business dashboards in Power BI'],
      dailyTasks: [
        { day: 1, title: 'Dimensional Modeling: Star Schemas & Fact Tables', estimatedMinutes: 90, objectives: ['Design one-to-many relationships and handle date dimensions'], explanation: 'Star schemas maximize columnar storage compression and optimize query speed.', codeSnippet: '', practicalExercise: 'Construct a data model connecting Sales fact tables to Date, Customer, and Product dimensions.', resources: [], completed: false },
        { day: 2, title: 'DAX Basics: Measures vs Calculated Columns', estimatedMinutes: 90, objectives: ['Understand row context vs filter context in DAX'], explanation: 'Calculated columns consume RAM at refresh; Measures calculate dynamically at query time.', codeSnippet: 'Total Revenue = SUM(Sales[Quantity] * Sales[UnitPrice])', practicalExercise: 'Write core measures for Total Sales, Total Cost, and Gross Profit Margin.', resources: [], completed: false },
        { day: 3, title: 'Mastering CALCULATE & Filter Context Transitions', estimatedMinutes: 90, objectives: ['Override report filter context to calculate percentages of totals'], explanation: 'CALCULATE evaluates expressions in modified filter contexts.', codeSnippet: 'Sales % of Total = DIVIDE([Total Sales], CALCULATE([Total Sales], ALL(Products)))', practicalExercise: 'Create measures computing category sales as a percentage of total company revenue.', resources: [], completed: false },
        { day: 4, title: 'Time Intelligence in DAX: YTD, QTD, and YoY Growth', estimatedMinutes: 90, objectives: ['Compute Year-to-Date and Year-over-Year performance metrics'], explanation: 'Time intelligence functions evaluate calendar periods against a continuous Date table.', codeSnippet: 'Sales YoY Growth = DIVIDE([Total Sales] - [Sales LY], [Sales LY])', practicalExercise: 'Build a Year-over-Year sales comparison table with conditional formatting indicators.', resources: [], completed: false },
        { day: 5, title: 'Dashboard UX & Visual Storytelling Best Practices', estimatedMinutes: 90, objectives: ['Design clean, readable dashboards adhering to visual hierarchy principles'], explanation: 'Place key high-level KPIs at top left; use consistent color palettes; eliminate clutter.', codeSnippet: '', practicalExercise: 'Build an executive dashboard layout with cards, trend lines, and category bar charts.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Executive Sales Performance Dashboard', estimatedMinutes: 120, objectives: ['Deliver an interactive Power BI dashboard featuring dynamic DAX measures and drill-throughs'], explanation: 'Create an end-to-end Power BI report.', codeSnippet: '', practicalExercise: 'Complete Executive Dashboard project.', resources: [], completed: false },
        { day: 7, title: 'Phase 2 Graduation Assessment', estimatedMinutes: 60, objectives: ['Take Week 6 adaptive quiz'], explanation: 'Assess Power BI, DAX, and SQL analytics.', codeSnippet: '', practicalExercise: 'Complete Week 6 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Executive Sales Performance Power BI Dashboard', description: 'Production-ready Power BI dashboard featuring Star Schema data modeling, dynamic DAX measures, and drill-through pages.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 7,
      phase: 3,
      title: 'Python for Data Analysis: NumPy & Pandas Foundations',
      focusSkills: ['Python', 'Pandas', 'NumPy'],
      difficulty: 'Beginner',
      status: 'locked',
      learningObjectives: ['Master NumPy array broadcasting and vectorization', 'Manipulate Pandas Series and DataFrames with .loc and .iloc', 'Handle missing data, duplicates, and type casting'],
      dailyTasks: [
        { day: 1, title: 'NumPy Arrays, Indexing & Vectorization', estimatedMinutes: 90, objectives: ['Perform high-speed numerical calculations without Python loops'], explanation: 'NumPy arrays store elements contiguously in C-level memory, enabling hardware vectorization.', codeSnippet: 'import numpy as np\narr = np.array([1, 2, 3])\nscaled = arr * 1.5', practicalExercise: 'Perform matrix operations and calculate statistical metrics on multi-dimensional arrays.', resources: [], completed: false },
        { day: 2, title: 'Pandas DataFrames: Creation, Inspection & Data Types', estimatedMinutes: 90, objectives: ['Load CSV/JSON data, inspect shapes, summary info, and memory usage'], explanation: 'DataFrames represent labeled 2D tabular data with heterogeneous column types.', codeSnippet: 'import pandas as pd\ndf = pd.read_csv("sales.csv")\nprint(df.info(), df.describe())', practicalExercise: 'Load a messy dataset, inspect column dtypes, and optimize memory with category types.', resources: [], completed: false },
        { day: 3, title: 'Subsetting & Indexing: loc vs iloc vs Boolean Masking', estimatedMinutes: 90, objectives: ['Filter rows and select columns cleanly'], explanation: 'loc is label-based and inclusive; iloc is integer-based and exclusive.', codeSnippet: 'adults = df.loc[df["age"] >= 18, ["name", "email"]]', practicalExercise: 'Filter transactions by customer demographic and purchase amount thresholds.', resources: [], completed: false },
        { day: 4, title: 'Data Cleaning: Handling NaN, Nulls & Duplicates', estimatedMinutes: 90, objectives: ['Detect and impute missing values using mean/median or forward fills'], explanation: 'dropna() removes nulls; fillna() imputes missing values to prevent calculation skew.', codeSnippet: 'df["income"] = df["income"].fillna(df["income"].median())\ndf.drop_duplicates(inplace=True)', practicalExercise: 'Clean a customer dataset with 20% missing values and duplicate rows.', resources: [], completed: false },
        { day: 5, title: 'String & DateTime Manipulation in Pandas', estimatedMinutes: 90, objectives: ['Extract dates, format strings, and handle timezones with .str and .dt accessors'], explanation: 'The .str and .dt accessors vectorize string and datetime operations across Series.', codeSnippet: 'df["year"] = pd.to_datetime(df["date"]).dt.year\ndf["clean_code"] = df["code"].str.strip().str.upper()', practicalExercise: 'Parse unformatted timestamps and extract day-of-week traffic metrics.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Automated Data Cleaning Script in Python', estimatedMinutes: 120, objectives: ['Write a reusable Python data cleaning module that outputs clean, validated datasets'], explanation: 'Package data cleaning logic into functions.', codeSnippet: '', practicalExercise: 'Complete Data Cleaning Script project.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take Week 7 adaptive quiz'], explanation: 'Assess Pandas and NumPy fundamentals.', codeSnippet: '', practicalExercise: 'Complete Week 7 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Automated Data Cleansing & Validation Pipeline', description: 'Python script utilizing Pandas to detect missing values, flag outliers, standardize dates, and export clean datasets.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 8,
      phase: 3,
      title: 'Pandas Data Wrangling: GroupBy, Merging & Pivoting',
      focusSkills: ['Pandas', 'Data Wrangling', 'GroupBy'],
      difficulty: 'Intermediate',
      status: 'locked',
      learningObjectives: ['Perform split-apply-combine operations with .groupby()', 'Merge, join, and concatenate multi-source DataFrames', 'Reshape data with pivot_table() and melt()'],
      dailyTasks: [
        { day: 1, title: 'GroupBy Aggregations & Transformations', estimatedMinutes: 90, objectives: ['Compute multiple metrics per category with .agg()'], explanation: 'GroupBy groups rows by key, executes aggregations, and combines results into a DataFrame.', codeSnippet: 'df.groupby("category").agg({"sales": ["mean", "sum"], "id": "count"})', practicalExercise: 'Calculate average order value and customer count across product categories.', resources: [], completed: false },
        { day: 2, title: 'Merging DataFrames: pd.merge() vs pd.concat()', estimatedMinutes: 90, objectives: ['Join tables using inner, left, and outer strategies on single or multiple keys'], explanation: 'pd.merge joins on column values; pd.concat stacks DataFrames along axes.', codeSnippet: 'merged = pd.merge(orders, users, on="user_id", how="left")', practicalExercise: 'Merge web clickstream data with purchase transaction logs.', resources: [], completed: false },
        { day: 3, title: 'Reshaping Data: pivot_table() & melt()', estimatedMinutes: 90, objectives: ['Pivot rows into columns and unpivot wide columns into tidy data'], explanation: 'pivot_table creates multi-dimensional cross-tabulations; melt unpivots wide datasets.', codeSnippet: 'pivoted = df.pivot_table(values="sales", index="region", columns="year", aggfunc="sum")', practicalExercise: 'Reshape survey response data from wide format into clean analysis-ready tidy rows.', resources: [], completed: false },
        { day: 4, title: 'Window Functions in Pandas: rolling() & expanding()', estimatedMinutes: 90, objectives: ['Calculate moving averages and cumulative sums in Python'], explanation: 'rolling() creates sliding windows over Series to smooth noisy metrics.', codeSnippet: 'df["rolling_7d"] = df["daily_sales"].rolling(window=7).mean()', practicalExercise: 'Compute a 30-day rolling volatility and moving average of stock prices.', resources: [], completed: false },
        { day: 5, title: 'Vectorized Logic vs apply(): Optimizing Execution Speed', estimatedMinutes: 90, objectives: ['Replace slow df.apply() loops with fast np.where and np.select'], explanation: 'np.where executes directly in compiled C, avoiding Python interpreter loop overhead.', codeSnippet: 'df["tier"] = np.where(df["spend"] > 1000, "High", "Standard")', practicalExercise: 'Benchmark the speed difference between df.apply and np.select on 1 million rows.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Multi-Source Data Integration & Wrangling', estimatedMinutes: 120, objectives: ['Ingest, clean, and merge 3 disparate data sources into a unified analytics data mart'], explanation: 'Integrate API, CSV, and database tables in Python.', codeSnippet: '', practicalExercise: 'Complete Data Integration project.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take Week 8 adaptive quiz'], explanation: 'Test data wrangling techniques.', codeSnippet: '', practicalExercise: 'Complete Week 8 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Multi-Source Customer Data Integration Mart', description: 'End-to-end Python pipeline joining web analytics, customer CRM, and billing data into a unified analysis mart.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 9,
      phase: 3,
      title: 'Exploratory Data Analysis & Visualization (Matplotlib & Seaborn)',
      focusSkills: ['EDA', 'Data Visualization', 'Seaborn'],
      difficulty: 'Intermediate',
      status: 'locked',
      learningObjectives: ['Conduct thorough Exploratory Data Analysis (EDA) on raw datasets', 'Visualize distributions, correlations, and categorical comparisons with Seaborn', 'Detect anomalies and outliers using statistical plots'],
      dailyTasks: [
        { day: 1, title: 'Exploratory Data Analysis (EDA) Methodology', estimatedMinutes: 90, objectives: ['Formulate analytical hypotheses, inspect distributions, and identify missing patterns'], explanation: 'EDA uncovers underlying data structure, detects outliers, and tests hypotheses before modeling.', codeSnippet: 'print(df.corr(numeric_only=True))', practicalExercise: 'Perform an initial EDA report on a housing prices dataset.', resources: [], completed: false },
        { day: 2, title: 'Visualizing Distributions: Histograms, KDE & Box Plots', estimatedMinutes: 90, objectives: ['Plot and interpret skewness, kurtosis, and quartiles with Seaborn'], explanation: 'Box plots highlight median, IQR, and outliers; KDE plots illustrate smooth probability densities.', codeSnippet: 'import seaborn as sns\nsns.boxplot(data=df, x="department", y="salary")', practicalExercise: 'Generate distribution plots comparing customer order values across segments.', resources: [], completed: false },
        { day: 3, title: 'Correlation & Multi-Variable Visualizations: Heatmaps & Pairplots', estimatedMinutes: 90, objectives: ['Visualize correlation matrices with annotated heatmaps'], explanation: 'Heatmaps visually display Pearson correlation coefficients between numeric variables.', codeSnippet: 'sns.heatmap(df.corr(), annot=True, cmap="coolwarm", fmt=".2f")', practicalExercise: 'Plot a correlation heatmap and identify multicollinearity between features.', resources: [], completed: false },
        { day: 4, title: 'Categorical Analysis: Bar, Count & Violin Plots', estimatedMinutes: 90, objectives: ['Compare categorical groups with confidence interval error bars'], explanation: 'Violin plots combine box plots with kernel density estimation for richer categorical comparisons.', codeSnippet: 'sns.violinplot(data=df, x="segment", y="satisfaction_score")', practicalExercise: 'Analyze customer satisfaction scores across multiple product tiers.', resources: [], completed: false },
        { day: 5, title: 'Customizing Visuals & Production Formatting in Matplotlib', estimatedMinutes: 90, objectives: ['Format titles, axes, annotations, and export high-resolution vector figures'], explanation: 'Customize figure size, DPI, labels, and legends for executive slide presentations.', codeSnippet: 'plt.figure(figsize=(10, 6), dpi=300)\nplt.title("Revenue Growth 2026", fontsize=16)', practicalExercise: 'Format a publication-ready chart with highlighted trendlines and milestone annotations.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Comprehensive Exploratory Data Analysis Report', estimatedMinutes: 120, objectives: ['Deliver an end-to-end Jupyter Notebook EDA report uncovering insights and business recommendations'], explanation: 'Combine narrative insights with charts.', codeSnippet: '', practicalExercise: 'Complete EDA Report project.', resources: [], completed: false },
        { day: 7, title: 'Phase 3 Graduation Assessment', estimatedMinutes: 60, objectives: ['Take Week 9 adaptive quiz'], explanation: 'Review Python data analysis and visualization.', codeSnippet: '', practicalExercise: 'Complete Week 9 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Executive Exploratory Data Analysis (EDA) Report', description: 'Jupyter Notebook examining a 50,000-row customer dataset with distribution analysis, correlation heatmaps, and insights.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 10,
      phase: 4,
      title: 'Applied Statistics, Probability & Hypothesis Testing',
      focusSkills: ['Statistics', 'Hypothesis Testing', 'Probability'],
      difficulty: 'Advanced',
      status: 'locked',
      learningObjectives: ['Formulate null and alternative hypotheses with significance levels', 'Conduct two-sample t-tests, Mann-Whitney U tests, and Chi-Square tests in SciPy', 'Compute confidence intervals and interpret p-values accurately'],
      dailyTasks: [
        { day: 1, title: 'Probability Distributions: Normal, Binomial & Poisson', estimatedMinutes: 90, objectives: ['Recognize when real-world phenomena follow specific statistical distributions'], explanation: 'Normal distributions model continuous measurements; Binomial models binary success/failure counts.', codeSnippet: 'from scipy import stats\np = stats.norm.cdf(1.96)', practicalExercise: 'Calculate probability thresholds for customer wait times using normal distributions.', resources: [], completed: false },
        { day: 2, title: 'Central Limit Theorem & Sampling Distributions in Python', estimatedMinutes: 90, objectives: ['Demonstrate the CLT empirically through Monte Carlo simulation'], explanation: 'Averages of random samples approach normality even if underlying data is heavily skewed.', codeSnippet: 'sample_means = [df["values"].sample(30).mean() for _ in range(1000)]', practicalExercise: 'Simulate drawing sample means from an exponential distribution and plot the resulting normal curve.', resources: [], completed: false },
        { day: 3, title: 'Hypothesis Testing: Independent Two-Sample T-Tests', estimatedMinutes: 90, objectives: ['Determine whether differences between two groups are statistically significant'], explanation: 'Two-sample t-tests evaluate whether two population means are statistically distinct.', codeSnippet: 't_stat, p_val = stats.ttest_ind(group_a, group_b, equal_var=False)', practicalExercise: 'Test whether a new checkout design increased average purchase spend with p < 0.05.', resources: [], completed: false },
        { day: 4, title: 'Categorical Significance: Chi-Square Test of Independence', estimatedMinutes: 90, objectives: ['Analyze contingency tables to determine if two categorical variables are independent'], explanation: 'Chi-Square test compares observed frequencies against expected frequencies under the null hypothesis.', codeSnippet: 'chi2, p_val, dof, expected = stats.chi2_contingency(contingency_table)', practicalExercise: 'Test whether customer device type (Mobile vs Desktop) is associated with subscription tier choice.', resources: [], completed: false },
        { day: 5, title: 'Confidence Intervals & Effect Size (Cohen\'s d)', estimatedMinutes: 90, objectives: ['Quantify the practical magnitude of differences alongside statistical significance'], explanation: 'Statistical significance indicates effect presence; effect size measures practical magnitude.', codeSnippet: 'd = (mean1 - mean2) / pooled_std', practicalExercise: 'Calculate 95% confidence intervals and Cohen\'s d for an e-commerce feature rollout.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: Statistical Inference & Hypothesis Testing Report', estimatedMinutes: 120, objectives: ['Deliver an automated Python statistical testing suite assessing experiment outcomes'], explanation: 'Produce documented statistical analysis.', codeSnippet: '', practicalExercise: 'Complete Statistical Testing project.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take Week 10 adaptive quiz'], explanation: 'Validate hypothesis testing knowledge.', codeSnippet: '', practicalExercise: 'Complete Week 10 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Statistical Hypothesis Testing Suite in Python', description: 'Python module executing automated normality checks, two-sample t-tests, Chi-Square independence tests, and p-value reports.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 11,
      phase: 4,
      title: 'Business Analytics: A/B Testing, Cohort Analysis & KPIs',
      focusSkills: ['A/B Testing', 'Cohort Analysis', 'Business KPIs'],
      difficulty: 'Advanced',
      status: 'locked',
      learningObjectives: ['Design rigorous A/B experiments with sample size and power calculations', 'Perform customer cohort retention analysis in Pandas', 'Track core unit economics: Churn, CLV, CAC, and conversion funnels'],
      dailyTasks: [
        { day: 1, title: 'A/B Testing Framework: Sample Size & Statistical Power', estimatedMinutes: 90, objectives: ['Calculate required sample sizes before launching experiments to avoid underpowered tests'], explanation: 'Power calculations prevent premature stopping and false positive decisions.', codeSnippet: 'from statsmodels.stats.power import TTestIndPower\npower = TTestIndPower().solve_power(effect_size=0.2, alpha=0.05, power=0.8)', practicalExercise: 'Compute required sample size and experiment duration for a 2% target conversion lift.', resources: [], completed: false },
        { day: 2, title: 'Evaluating A/B Experiment Results & Guardrail Metrics', estimatedMinutes: 90, objectives: ['Analyze experiment metrics while monitoring secondary guardrail metrics for degradation'], explanation: 'Ensure conversion improvements do not inadvertently trigger refunds or crash latency.', codeSnippet: '', practicalExercise: 'Analyze a live A/B test dataset and decide whether to launch, iterate, or abort the variant.', resources: [], completed: false },
        { day: 3, title: 'Cohort Retention Analysis in Pandas', estimatedMinutes: 90, objectives: ['Build a customer cohort retention matrix and visualize it as a heatmap'], explanation: 'Cohorts track behavioral retention curves across user sign-up months.', codeSnippet: 'cohort_matrix = df.groupby(["cohort_month", "cohort_index"])["user_id"].nunique().unstack()', practicalExercise: 'Construct a 12-month cohort retention matrix from raw user transaction logs.', resources: [], completed: false },
        { day: 4, title: 'Unit Economics: Customer Lifetime Value (CLV) & CAC', estimatedMinutes: 90, objectives: ['Calculate historical and predictive CLV and evaluate LTV:CAC ratios'], explanation: 'CLV estimates total gross profit generated per customer relationship over time.', codeSnippet: 'clv = (avg_order_value * purchase_frequency) * customer_lifespan', practicalExercise: 'Calculate customer acquisition payback periods across marketing channels.', resources: [], completed: false },
        { day: 5, title: 'Conversion Funnel & Drop-off Analysis', estimatedMinutes: 90, objectives: ['Pinpoint conversion bottlenecks in multi-step user workflows'], explanation: 'Funnel analytics highlight exact screens where users abandon workflows.', codeSnippet: '', practicalExercise: 'Analyze a 5-step registration funnel and identify the primary drop-off step.', resources: [], completed: false },
        { day: 6, title: 'Weekly Project: A/B Experiment & Cohort Retention Dashboard', estimatedMinutes: 120, objectives: ['Deliver an integrated A/B testing and cohort retention report with executive recommendations'], explanation: 'Complete business analytics capstone module.', codeSnippet: '', practicalExercise: 'Complete A/B & Cohort project.', resources: [], completed: false },
        { day: 7, title: 'Weekly Knowledge Check', estimatedMinutes: 60, objectives: ['Take Week 11 adaptive quiz'], explanation: 'Assess business analytics concepts.', codeSnippet: '', practicalExercise: 'Complete Week 11 quiz.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'A/B Experiment Analysis & Cohort Retention Study', description: 'Comprehensive business study evaluating a digital product A/B test, retention cohorts, and conversion funnel drop-offs.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    },
    {
      weekNumber: 12,
      phase: 4,
      title: 'Master Capstone Showcase, Analytical Storytelling & Career Prep',
      focusSkills: ['Analytics Portfolio', 'Data Storytelling', 'Employability'],
      difficulty: 'Advanced',
      status: 'locked',
      learningObjectives: ['Complete an end-to-end data analytics capstone project', 'Synthesize actionable recommendations for executive leadership', 'Excel in SQL, Python, and business case interview rounds'],
      dailyTasks: [
        { day: 1, title: 'Capstone Project Definition & Data Ingestion', estimatedMinutes: 90, objectives: ['Frame business problem, formulate analytical questions, and acquire raw data'], explanation: 'Great analytics starts with clear business questions and measurable objectives.', codeSnippet: '', practicalExercise: 'Write an analytical project charter defining hypotheses, data sources, and success metrics.', resources: [], completed: false },
        { day: 2, title: 'Data Cleaning, Transformation & SQL Modeling', estimatedMinutes: 120, objectives: ['Clean, validate, and transform the capstone dataset into structured analytics tables'], explanation: 'Perform rigorous data hygiene and prepare structured tables.', codeSnippet: '', practicalExercise: 'Write the data preparation and transformation pipeline for your capstone.', resources: [], completed: false },
        { day: 3, title: 'Exploratory Analysis & Statistical Verification', estimatedMinutes: 120, objectives: ['Discover trends, run hypothesis tests, and compute key performance indicators'], explanation: 'Support business observations with sound statistical validation.', codeSnippet: '', practicalExercise: 'Execute statistical evaluations and generate exploratory visualizations.', resources: [], completed: false },
        { day: 4, title: 'Interactive BI Dashboard Build (Power BI or Tableau)', estimatedMinutes: 120, objectives: ['Construct an executive BI dashboard with interactive filters, KPIs, and drill-throughs'], explanation: 'Deliver a polished visual report enabling self-service stakeholder exploration.', codeSnippet: '', practicalExercise: 'Build the interactive capstone dashboard.', resources: [], completed: false },
        { day: 5, title: 'Analytical Storytelling & Executive Presentation', estimatedMinutes: 90, objectives: ['Synthesize findings into an executive slide deck with actionable recommendations'], explanation: 'Translate complex metrics into clear, non-technical business recommendations.', codeSnippet: '', practicalExercise: 'Draft a 5-slide executive presentation summarizing findings, ROI, and next steps.', resources: [], completed: false },
        { day: 6, title: 'Data Analyst Interview Prep: Live SQL & Case Studies', estimatedMinutes: 90, objectives: ['Practice common SQL window function challenges and product sense interview questions'], explanation: 'Prepare to articulate analytical trade-offs during live technical interviews.', codeSnippet: '', practicalExercise: 'Solve 3 complex live-coding SQL questions under time constraints.', resources: [], completed: false },
        { day: 7, title: 'Final Program Assessment & PathForge Certification', estimatedMinutes: 120, objectives: ['Complete the final comprehensive assessment and graduate!'], explanation: 'Celebrate completing your personalized 12-week Data Analyst curriculum!', codeSnippet: '', practicalExercise: 'Take the final comprehensive graduation assessment.', resources: [], completed: false }
      ],
      weeklyProject: { title: 'Data Analytics Master Capstone Project', description: 'End-to-end analytics project featuring SQL transformation, Python statistical modeling, Power BI dashboard, and executive slides.', completed: false },
      weeklyQuizScore: null,
      isRemedial: false
    }
  ]
};

export default {
  mernLearningPath,
  dataAnalystLearningPath
};
