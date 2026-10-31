/**
 * PathForge Mock Question Bank: MERN Stack Development Track
 * Contains 60+ rigorous, verified questions across Beginner, Intermediate, and Advanced tiers.
 */

export const mernQuestions = [
  // ==========================================
  // HTML & CSS (Questions 1 - 6)
  // ==========================================
  {
    id: 'mern-q01',
    track: 'mern',
    skill: 'HTML',
    topic: 'Semantic HTML & Accessibility',
    difficulty: 'Beginner',
    question: 'Which HTML5 semantic element is most appropriate for enclosing self-contained content that could be distributed independently, such as a blog post or news article?',
    codeSnippet: '',
    options: ['<section>', '<article>', '<main>', '<aside>'],
    correctIndex: 1,
    explanation: 'The <article> tag is specifically designed for self-contained, independently distributable compositions, whereas <section> represents a generic thematic grouping.'
  },
  {
    id: 'mern-q02',
    track: 'mern',
    skill: 'CSS',
    topic: 'Box Model & Layout',
    difficulty: 'Beginner',
    question: 'When "box-sizing: border-box" is applied to an element, how are its computed width and height calculated?',
    codeSnippet: `div {\n  box-sizing: border-box;\n  width: 200px;\n  padding: 20px;\n  border: 5px solid black;\n}`,
    options: [
      'Width includes padding and border, so total rendered width remains 200px.',
      'Padding and border are added to the width, rendering a total width of 250px.',
      'Width only applies to the content box, while margins are absorbed.',
      'Padding is included, but borders are added outside the 200px width.'
    ],
    correctIndex: 0,
    explanation: 'In the border-box model, width and height include content, padding, and borders, keeping the total element size fixed at the specified width.'
  },
  {
    id: 'mern-q03',
    track: 'mern',
    skill: 'CSS',
    topic: 'Flexbox Layout',
    difficulty: 'Beginner',
    question: 'In CSS Flexbox, which property aligns flex items along the cross axis (perpendicular to the main axis)?',
    codeSnippet: '',
    options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
    correctIndex: 1,
    explanation: 'justify-content aligns items along the main axis, while align-items controls alignment along the cross axis.'
  },
  {
    id: 'mern-q04',
    track: 'mern',
    skill: 'CSS',
    topic: 'CSS Grid',
    difficulty: 'Intermediate',
    question: 'What is the effect of using the "fr" unit in CSS Grid definitions, such as "grid-template-columns: 1fr 2fr"?',
    codeSnippet: `.grid {\n  display: grid;\n  grid-template-columns: 1fr 2fr;\n}`,
    options: [
      'Sets column widths to fixed percentages (10% and 20%).',
      'Distributes available free space proportionally, giving the second column twice the space of the first.',
      'Forces column heights to match font size increments.',
      'Creates responsive columns that collapse below 100px.'
    ],
    correctIndex: 1,
    explanation: 'The "fr" (fractional) unit represents a fraction of the leftover available space inside the grid container after fixed tracks are allocated.'
  },
  {
    id: 'mern-q05',
    track: 'mern',
    skill: 'CSS',
    topic: 'CSS Specificity',
    difficulty: 'Intermediate',
    question: 'Which of the following CSS selectors has the highest specificity weight?',
    codeSnippet: '',
    options: [
      'nav ul li a:hover',
      '.header .nav-item.active',
      '#main-nav .menu-item',
      'header#main-nav'
    ],
    correctIndex: 2,
    explanation: '#main-nav .menu-item has 1 ID and 1 class (specificity 0,1,1,0), which beats header#main-nav (1 ID, 1 element = 0,1,0,1) and pure class/element selectors.'
  },
  {
    id: 'mern-q06',
    track: 'mern',
    skill: 'HTML',
    topic: 'Web Accessibility (a11y)',
    difficulty: 'Intermediate',
    question: 'Why is it critical to provide descriptive "alt" attributes on HTML <img> tags rather than leaving them omitted?',
    codeSnippet: `<img src="/logo.png" alt="PathForge Engineering Learning Platform Logo" />`,
    options: [
      'Search engines require alt tags to execute JavaScript on the page.',
      'Screen readers announce alt text to visually impaired users, and it renders when images fail to load.',
      'Alt text is strictly required to establish SSL/TLS connection certificates.',
      'Omitted alt text forces modern browsers into quirks rendering mode.'
    ],
    correctIndex: 1,
    explanation: 'The alt attribute provides alternative text used by screen readers for accessibility and displays fallback text when image loading fails.'
  },

  // ==========================================
  // Core JavaScript (Questions 7 - 16)
  // ==========================================
  {
    id: 'mern-q07',
    track: 'mern',
    skill: 'JavaScript',
    topic: 'Data Types & Primitives',
    difficulty: 'Beginner',
    question: 'What is logged to the console when checking the type of null versus undefined in JavaScript?',
    codeSnippet: `console.log(typeof null, typeof undefined);`,
    options: ['"null" "undefined"', '"object" "undefined"', '"undefined" "undefined"', '"object" "null"'],
    correctIndex: 1,
    explanation: 'typeof null returns "object" due to a historical legacy 32-bit type tag bug in JavaScript, while typeof undefined correctly returns "undefined".'
  },
  {
    id: 'mern-q08',
    track: 'mern',
    skill: 'JavaScript',
    topic: 'Variable Scoping & Hoisting',
    difficulty: 'Beginner',
    question: 'What is the behavior of variables declared with "let" and "const" prior to their declaration line in code?',
    codeSnippet: `console.log(myVar);\nlet myVar = 10;`,
    options: [
      'Returns undefined because let is hoisted like var.',
      'Throws a ReferenceError because the variable is in the Temporal Dead Zone (TDZ).',
      'Silently skips the statement without printing anything.',
      'Logs null to the console.'
    ],
    correctIndex: 1,
    explanation: 'let and const declarations are hoisted but remain uninitialized in the Temporal Dead Zone (TDZ) until evaluation reaches the declaration, throwing a ReferenceError if accessed.'
  },
  {
    id: 'mern-q09',
    track: 'mern',
    skill: 'JavaScript',
    topic: 'Array Methods',
    difficulty: 'Beginner',
    question: 'Which JavaScript array method executes a reducer function on each element to produce a single cumulative output value without mutating the source array?',
    codeSnippet: `const numbers = [10, 20, 30];\nconst sum = numbers.reduce((acc, curr) => acc + curr, 0);`,
    options: ['Array.prototype.forEach()', 'Array.prototype.map()', 'Array.prototype.reduce()', 'Array.prototype.filter()'],
    correctIndex: 2,
    explanation: 'reduce() accumulates values across an array using an accumulator callback and returns a single resulting value without mutating the original array.'
  },
  {
    id: 'mern-q10',
    track: 'mern',
    skill: 'JavaScript',
    topic: 'Object References & Immutability',
    difficulty: 'Intermediate',
    question: 'What will be output by the following snippet regarding object reference mutation?',
    codeSnippet: `const userA = { name: 'Alice', scores: [90, 80] };\nconst userB = { ...userA };\nuserB.scores.push(100);\nconsole.log(userA.scores.length, userB.scores.length);`,
    options: ['2 3', '3 3', '2 2', 'Throws TypeError: Assignment to constant variable'],
    correctIndex: 1,
    explanation: 'The spread operator performs a shallow copy. The scores array reference is copied by pointer, so mutating userB.scores also mutates userA.scores.'
  },
  {
    id: 'mern-q11',
    track: 'mern',
    skill: 'JavaScript',
    topic: 'Event Loop & Concurrency',
    difficulty: 'Intermediate',
    question: 'In what exact order are the logs emitted in this Event Loop microtask vs macrotask scenario?',
    codeSnippet: `console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');`,
    options: ['1, 2, 3, 4', '1, 4, 2, 3', '1, 4, 3, 2', '3, 1, 4, 2'],
    correctIndex: 2,
    explanation: 'Synchronous code runs first (1, 4). The microtask queue (Promise.then -> 3) is drained before the macrotask queue (setTimeout -> 2) executes.'
  },
  {
    id: 'mern-q12',
    track: 'mern',
    skill: 'JavaScript',
    topic: 'Closures',
    difficulty: 'Intermediate',
    question: 'What output is printed when executing this closure factory?',
    codeSnippet: `function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst c1 = makeCounter();\nconst c2 = makeCounter();\nconsole.log(c1(), c1(), c2());`,
    options: ['1 2 3', '1 2 1', '1 1 1', '0 1 0'],
    correctIndex: 1,
    explanation: 'Each call to makeCounter() creates a fresh Lexical Environment scope. c1 increments its own count (1, 2), while c2 has its own isolated count starting at 1.'
  },
  {
    id: 'mern-q13',
    track: 'mern',
    skill: 'JavaScript',
    topic: 'Prototypes & Inheritance',
    difficulty: 'Advanced',
    question: 'In JavaScript prototype inheritance, what does Object.create(proto) accomplish?',
    codeSnippet: `const proto = { greet() { return 'hello'; } };\nconst obj = Object.create(proto);`,
    options: [
      'Deep copies all properties of proto directly onto obj as own properties.',
      'Creates a new empty object whose internal [[Prototype]] points to proto.',
      'Freezes proto so that its properties cannot be overridden.',
      'Executes the constructor function of proto with new bindings.'
    ],
    correctIndex: 1,
    explanation: 'Object.create(proto) instantiates a new empty object with its internal [[Prototype]] reference set to the provided proto object.'
  },
  {
    id: 'mern-q14',
    track: 'mern',
    skill: 'JavaScript',
    topic: 'Async Generators & Iterators',
    difficulty: 'Advanced',
    question: 'What does the "for await...of" statement iterate over?',
    codeSnippet: `for await (const chunk of readableStream) {\n  process(chunk);\n}`,
    options: [
      'Synchronous arrays only, converting them into web workers.',
      'Async iterable objects (such as streams, async generators, or arrays of promises).',
      'DOM events emitted by event listeners.',
      'Database collections without opening a network connection.'
    ],
    correctIndex: 1,
    explanation: 'for await...of iterates over async iterable objects that implement the Symbol.asyncIterator method, awaiting each resolved promise in sequence.'
  },
  {
    id: 'mern-q15',
    track: 'mern',
    skill: 'JavaScript',
    topic: 'Memory Management & Garbage Collection',
    difficulty: 'Advanced',
    question: 'Why does WeakMap prevent memory leaks when associating metadata with DOM elements or objects?',
    codeSnippet: `const cache = new WeakMap();\nfunction setMetadata(domNode, data) {\n  cache.set(domNode, data);\n}`,
    options: [
      'WeakMap automatically encrypts memory values after 60 seconds.',
      'Keys must be objects, held weakly; when no other reference to the key object exists, it is garbage collected.',
      'WeakMap stores data in client localStorage rather than RAM.',
      'WeakMap deletes all entries immediately after any function execution ends.'
    ],
    correctIndex: 1,
    explanation: 'WeakMap maintains weak references to its object keys. If no other strong references to a key exist, both key and associated value are eligible for garbage collection.'
  },
  {
    id: 'mern-q16',
    track: 'mern',
    skill: 'JavaScript',
    topic: 'this Keyword Binding',
    difficulty: 'Intermediate',
    question: 'How does an arrow function determine the value of the "this" keyword?',
    codeSnippet: `const obj = {\n  val: 42,\n  getVal: () => this.val\n};`,
    options: [
      'this is dynamically bound to obj at invocation time.',
      'Arrow functions have no own this; they retain the lexical this of the enclosing scope where defined.',
      'this always refers to the global window or globalThis object, ignoring enclosing scopes.',
      'Arrow functions throw a syntax error if this is referenced inside them.'
    ],
    correctIndex: 1,
    explanation: 'Arrow functions do not define their own this binding; they inherit this lexically from the outer enclosing scope at creation time.'
  },

  // ==========================================
  // React.js (Questions 17 - 28)
  // ==========================================
  {
    id: 'mern-q17',
    track: 'mern',
    skill: 'React',
    topic: 'JSX & Component Basics',
    difficulty: 'Beginner',
    question: 'Why must React components return a single root element or React Fragment (<>...</>)?',
    codeSnippet: `<>\n  <h1>Title</h1>\n  <p>Paragraph</p>\n</>`,
    options: [
      'HTML only supports one tag per web page.',
      'Under the hood, JSX compiles into React.createElement calls, which can only return a single JavaScript value per function.',
      'React uses Web Workers that cannot process multiple elements.',
      'Multiple root elements crash the CSS parser.'
    ],
    correctIndex: 1,
    explanation: 'JSX compiles to function calls (React.createElement / jsx). A JavaScript function can only return a single object or value, necessitating a single root or Fragment.'
  },
  {
    id: 'mern-q18',
    track: 'mern',
    skill: 'React',
    topic: 'useState Hook',
    difficulty: 'Beginner',
    question: 'Why should state updates that depend on the previous state value use a functional updater, like setCount(prev => prev + 1)?',
    codeSnippet: `const handleClick = () => {\n  setCount((prev) => prev + 1);\n  setCount((prev) => prev + 1);\n};`,
    options: [
      'Functional updaters run faster by bypassing the Virtual DOM.',
      'React state updates may be batched or asynchronous; functional updaters ensure calculations use the most up-to-date queued state.',
      'Direct state updates like setCount(count + 1) are deprecated in React 18.',
      'Functional updaters prevent components from re-rendering.'
    ],
    correctIndex: 1,
    explanation: 'Because React batches state updates asynchronously, functional updaters (prev => prev + 1) guarantee access to the latest committed state in the update queue.'
  },
  {
    id: 'mern-q19',
    track: 'mern',
    skill: 'React',
    topic: 'useEffect Hook & Cleanup',
    difficulty: 'Beginner',
    question: 'When is the cleanup function returned inside a useEffect hook executed?',
    codeSnippet: `useEffect(() => {\n  const timer = setInterval(tick, 1000);\n  return () => clearInterval(timer);\n}, []);`,
    options: [
      'Only once when the application closes or browser tab is refreshed.',
      'Before the component unmounts, and before re-running the effect if dependencies change.',
      'Immediately before the JSX elements are rendered to the DOM.',
      'Every time any unrelated state in the parent component changes.'
    ],
    correctIndex: 1,
    explanation: 'React invokes the effect cleanup function when the component unmounts, and also before re-executing the effect on subsequent renders when dependencies change.'
  },
  {
    id: 'mern-q20',
    track: 'mern',
    skill: 'React',
    topic: 'Keys in Lists',
    difficulty: 'Intermediate',
    question: 'What bug can occur when using array indices as the "key" prop for a dynamically reordered or filtered list in React?',
    codeSnippet: `{items.map((item, index) => (\n  <TodoItem key={index} text={item.text} />\n))}`,
    options: [
      'React throws a fatal syntax error and halts rendering.',
      'Component local state and DOM input focus can attach to the wrong item because keys no longer match item identity after sorting or deletion.',
      'Browser cookies are cleared upon re-ordering.',
      'Network requests are automatically duplicated.'
    ],
    correctIndex: 1,
    explanation: 'Keys identify element identity across renders. When items are inserted, deleted, or sorted, index keys cause uncontrolled component state to remain bound to the wrong position.'
  },
  {
    id: 'mern-q21',
    track: 'mern',
    skill: 'React',
    topic: 'useCallback vs useMemo',
    difficulty: 'Intermediate',
    question: 'What is the primary difference between the useMemo and useCallback hooks in React?',
    codeSnippet: `const memoizedValue = useMemo(() => computeHeavy(a), [a]);\nconst memoizedCallback = useCallback(() => handleClick(a), [a]);`,
    options: [
      'useMemo memoizes the computed RESULT of a function; useCallback memoizes the FUNCTION DEFINITION itself.',
      'useCallback runs asynchronously in a web worker, while useMemo runs on the main thread.',
      'useMemo can only cache strings and numbers; useCallback caches objects.',
      'There is no difference; useCallback is an alias for useMemo.'
    ],
    correctIndex: 0,
    explanation: 'useMemo returns the cached return value of an expensive calculation, whereas useCallback returns a memoized callback function reference to prevent child re-renders.'
  },
  {
    id: 'mern-q22',
    track: 'mern',
    skill: 'React',
    topic: 'useRef Hook',
    difficulty: 'Intermediate',
    question: 'What is a key difference between updating a useRef value (ref.current = x) versus calling a useState setter?',
    codeSnippet: `const renderCount = useRef(0);\nrenderCount.current += 1;`,
    options: [
      'Updating useRef triggers a synchronous re-render of the component tree.',
      'Updating ref.current mutates the value without causing the component to re-render.',
      'useRef can only store HTML DOM elements, not primitives.',
      'useRef values are lost whenever the component re-renders.'
    ],
    correctIndex: 1,
    explanation: 'useRef creates a mutable container that persists across renders. Changing ref.current does not trigger a component re-render.'
  },
  {
    id: 'mern-q23',
    track: 'mern',
    skill: 'React',
    topic: 'Context API & State Propagation',
    difficulty: 'Intermediate',
    question: 'What happens to consumers of a React Context when the Context Provider value changes?',
    codeSnippet: `<ThemeContext.Provider value={{ theme, toggleTheme }}>\n  <App />\n</ThemeContext.Provider>`,
    options: [
      'Only consumers wrapped in React.memo will re-render.',
      'All component consumers that call useContext(ThemeContext) will automatically re-render.',
      'The entire page is reloaded from the server.',
      'Context values can only be updated if Redux is installed.'
    ],
    correctIndex: 1,
    explanation: 'When a Context Provider value changes, all descendant components that consume that context via useContext() are re-rendered with the new value.'
  },
  {
    id: 'mern-q24',
    track: 'mern',
    skill: 'React',
    topic: 'Virtual DOM & Reconciliation',
    difficulty: 'Advanced',
    question: 'How does React\'s Fiber reconciler optimize rendering performance compared to the older stack reconciler?',
    codeSnippet: '',
    options: [
      'It compiles React code directly into WebAssembly binaries at runtime.',
      'It breaks rendering work into incremental chunks that can be paused, prioritized, or aborted via cooperative concurrency.',
      'It bypasses the browser DOM entirely and renders to a WebGL canvas.',
      'It executes all renders synchronously in a single blocking thread loop.'
    ],
    correctIndex: 1,
    explanation: 'React Fiber introduces a virtual stack frame architecture enabling incremental rendering, work prioritization, and cooperative scheduling between frames.'
  },
  {
    id: 'mern-q25',
    track: 'mern',
    skill: 'React',
    topic: 'Custom Hooks Architecture',
    difficulty: 'Intermediate',
    question: 'Which of the following is a strict Rule of Hooks enforced by React and ESLint?',
    codeSnippet: '',
    options: [
      'Hooks must always return an array containing exactly two items.',
      'Hooks can only be called at the top level of React functions, never inside loops, conditions, or nested functions.',
      'Hooks must always initiate a network fetch call.',
      'Custom hooks must be declared inside class components.'
    ],
    correctIndex: 1,
    explanation: 'Hooks must be called at the top level to guarantee that React preserves hook execution order and state across multiple renders.'
  },
  {
    id: 'mern-q26',
    track: 'mern',
    skill: 'React',
    topic: 'Error Boundaries',
    difficulty: 'Advanced',
    question: 'Which types of errors are NOT caught by React Error Boundaries?',
    codeSnippet: '',
    options: [
      'Errors inside render methods of child components.',
      'Errors in asynchronous code (e.g. setTimeout or fetch callbacks) and event handlers.',
      'Errors in component lifecycle methods.',
      'Errors in child component constructors.'
    ],
    correctIndex: 1,
    explanation: 'Error Boundaries catch errors during rendering, in lifecycle methods, and in constructors. They do NOT catch errors in event handlers, async code (e.g. setTimeout), or SSR.'
  },
  {
    id: 'mern-q27',
    track: 'mern',
    skill: 'React',
    topic: 'React.memo & Referencing Equality',
    difficulty: 'Advanced',
    question: 'Why might wrapping a child component in React.memo fail to prevent re-renders when the parent component re-renders?',
    codeSnippet: `const MemoizedChild = React.memo(ChildComponent);\n// In parent:\n<MemoizedChild onClick={() => doSomething()} data={{ id: 1 }} />`,
    options: [
      'React.memo is only compatible with class components.',
      'Inline arrow functions and object literals create new memory references on every parent render, failing shallow prop equality checks.',
      'React.memo only checks state changes, never props.',
      'React.memo requires Redux store integration.'
    ],
    correctIndex: 1,
    explanation: 'React.memo performs shallow comparison (Object.is). Inline functions and object literals produce new reference pointers on every render, triggering re-renders unless memoized.'
  },
  {
    id: 'mern-q28',
    track: 'mern',
    skill: 'React',
    topic: 'useReducer Hook',
    difficulty: 'Intermediate',
    question: 'When is useReducer generally preferred over useState in React component architecture?',
    codeSnippet: `const [state, dispatch] = useReducer(reducer, initialState);`,
    options: [
      'When state involves complex logic, multiple sub-values, or when the next state depends on the previous state in intricate ways.',
      'When state only stores a single boolean flag.',
      'When you need to persist state directly to the server database.',
      'When state cannot be updated more than once per minute.'
    ],
    correctIndex: 0,
    explanation: 'useReducer is optimal for managing complex state machines with multiple related transitions, decoupling state transition logic from UI components.'
  },

  // ==========================================
  // Node.js & Express.js (Questions 29 - 40)
  // ==========================================
  {
    id: 'mern-q29',
    track: 'mern',
    skill: 'Node.js',
    topic: 'Architecture & Event Loop',
    difficulty: 'Beginner',
    question: 'Why is Node.js described as "single-threaded, non-blocking asynchronous"?',
    codeSnippet: '',
    options: [
      'Node.js cannot handle more than one request at a time.',
      'JavaScript executes on a single main thread, while I/O operations are offloaded to libuv background thread pools and OS kernel polling.',
      'Node.js runs inside browser Web Workers exclusively.',
      'Every HTTP request spawns a separate OS process.'
    ],
    correctIndex: 1,
    explanation: 'Node.js runs user JavaScript on a single thread event loop, but delegates file, network, and database I/O to libuv and the underlying OS asynchronously.'
  },
  {
    id: 'mern-q30',
    track: 'mern',
    skill: 'Express.js',
    topic: 'Middleware Mechanics',
    difficulty: 'Beginner',
    question: 'What is the purpose of the "next()" function in Express middleware?',
    codeSnippet: `app.use((req, res, next) => {\n  console.log('Request received');\n  next();\n});`,
    options: [
      'Terminates the HTTP request and sends a 200 OK response.',
      'Passes control to the next middleware or route handler in the execution stack.',
      'Restarts the Express server.',
      'Redirects the client to the homepage.'
    ],
    correctIndex: 1,
    explanation: 'next() passes control to the next handler in the Express middleware stack. If omitted, the request remains hanging until timing out.'
  },
  {
    id: 'mern-q31',
    track: 'mern',
    skill: 'Express.js',
    topic: 'Error Handling Middleware',
    difficulty: 'Intermediate',
    question: 'How does Express differentiate a standard middleware function from an error-handling middleware?',
    codeSnippet: `app.use((err, req, res, next) => {\n  res.status(500).json({ error: err.message });\n});`,
    options: [
      'Error middleware must be named "errorHandler".',
      'Error-handling middleware functions strictly accept four arguments (err, req, res, next).',
      'Error middleware must return a Promise that rejects.',
      'Express requires registering error handlers with app.error() instead of app.use().'
    ],
    correctIndex: 1,
    explanation: 'Express inspects function.length. Middleware with 4 parameters (err, req, res, next) is treated specifically as an error handler.'
  },
  {
    id: 'mern-q32',
    track: 'mern',
    skill: 'Node.js',
    topic: 'Streams & Buffers',
    difficulty: 'Intermediate',
    question: 'Why is stream piping (e.g. readStream.pipe(writeStream)) preferred over fs.readFile when handling large files in Node.js?',
    codeSnippet: `fs.createReadStream('huge-log.txt').pipe(res);`,
    options: [
      'fs.readFile compresses files, reducing accuracy.',
      'fs.readFile buffers the entire file in RAM before returning, risking Out-Of-Memory crashes, whereas streams process data in manageable chunks.',
      'Streams automatically encrypt file contents.',
      'Streams only work on text files smaller than 10MB.'
    ],
    correctIndex: 1,
    explanation: 'Streams read and process files chunk by chunk, keeping memory consumption low and constant regardless of whether the file is 100MB or 10GB.'
  },
  {
    id: 'mern-q33',
    track: 'mern',
    skill: 'Express.js',
    topic: 'Route Parameters & Query Strings',
    difficulty: 'Beginner',
    question: 'Given the request URL "GET /api/users/42?includePosts=true", how does Express extract the ID and query parameter?',
    codeSnippet: `app.get('/api/users/:id', (req, res) => { ... });`,
    options: [
      'req.body.id and req.body.includePosts',
      'req.params.id and req.query.includePosts',
      'req.headers.id and req.url.includePosts',
      'req.data.id and req.search.includePosts'
    ],
    correctIndex: 1,
    explanation: 'Named route segments (:id) populate req.params, while URL query string parameters (?includePosts=true) populate req.query.'
  },
  {
    id: 'mern-q34',
    track: 'mern',
    skill: 'Node.js',
    topic: 'CommonJS vs ES Modules',
    difficulty: 'Intermediate',
    question: 'In Node.js ES Modules ("type": "module" in package.json), which global variables from CommonJS are NO longer available by default?',
    codeSnippet: `import { fileURLToPath } from 'url';\nconst __dirname = path.dirname(fileURLToPath(import.meta.url));`,
    options: [
      'console and process',
      '__dirname, __filename, and require()',
      'setTimeout and setInterval',
      'Buffer and Promise'
    ],
    correctIndex: 1,
    explanation: 'In ESM mode, __dirname and __filename are undefined and replaced by import.meta.url, and require() is replaced by native import statements.'
  },
  {
    id: 'mern-q35',
    track: 'mern',
    skill: 'Express.js',
    topic: 'Cross-Origin Resource Sharing (CORS)',
    difficulty: 'Intermediate',
    question: 'When configuring CORS in an Express API with "credentials: true" for cookie authentication, what must the origin configuration be?',
    codeSnippet: `app.use(cors({ origin: 'https://myapp.vercel.app', credentials: true }));`,
    options: [
      'origin must be set to the wildcard "*".',
      'origin cannot be "*"; it must be an explicit whitelist of allowed domain origins.',
      'credentials: true automatically permits all origins without verification.',
      'origin must be omitted entirely.'
    ],
    correctIndex: 1,
    explanation: 'The CORS specification strictly forbids the wildcard origin ("*") when credentials (cookies/auth headers) are allowed; an explicit matching origin must be provided.'
  },
  {
    id: 'mern-q36',
    track: 'mern',
    skill: 'Node.js',
    topic: 'Child Processes & Cluster',
    difficulty: 'Advanced',
    question: 'What is the purpose of Node.js Cluster module or PM2 cluster mode in production?',
    codeSnippet: `import cluster from 'cluster';\nimport os from 'os';\nif (cluster.isPrimary) {\n  os.cpus().forEach(() => cluster.fork());\n}`,
    options: [
      'Compresses database records to save hard drive storage.',
      'Spawns multiple child worker processes sharing the same server port to utilize all CPU cores on multi-core servers.',
      'Encrypts server SSL keys in hardware modules.',
      'Translates Node.js into Go code for higher concurrency.'
    ],
    correctIndex: 1,
    explanation: 'Since a single Node process only uses one CPU core, the Cluster module forks multiple worker processes sharing ports to achieve full multi-core CPU utilization.'
  },
  {
    id: 'mern-q37',
    track: 'mern',
    skill: 'Express.js',
    topic: 'Security Headers with Helmet',
    difficulty: 'Intermediate',
    question: 'Which HTTP security header configured by Helmet protects web applications from clickjacking attacks?',
    codeSnippet: `app.use(helmet());`,
    options: ['X-Frame-Options: DENY', 'Content-Type: text/html', 'Access-Control-Allow-Origin', 'Accept-Encoding: gzip'],
    correctIndex: 0,
    explanation: 'X-Frame-Options (DENY or SAMEORIGIN) instructs browsers not to render the page in a <frame>, <iframe>, or <object>, preventing clickjacking attacks.'
  },
  {
    id: 'mern-q38',
    track: 'mern',
    skill: 'Node.js',
    topic: 'Event Emitter Pattern',
    difficulty: 'Intermediate',
    question: 'In Node.js EventEmitter, what happens when an "error" event is emitted but no listener has been registered for it?',
    codeSnippet: `const emitter = new EventEmitter();\nemitter.emit('error', new Error('Something failed'));`,
    options: [
      'The error is logged to console.log and program continues unaffected.',
      'The Node process throws an unhandled exception and crashes.',
      'The event is silently queued until a listener connects.',
      'It triggers an automatic HTTP 500 error.'
    ],
    correctIndex: 1,
    explanation: 'In Node.js EventEmitter conventions, emitting an "error" event with no attached listener throws an uncaught exception, which crashes the process.'
  },
  {
    id: 'mern-q39',
    track: 'mern',
    skill: 'Express.js',
    topic: 'Payload Limit & DoS Prevention',
    difficulty: 'Intermediate',
    question: 'Why should Express applications enforce strict body parser limits, such as express.json({ limit: "10kb" })?',
    codeSnippet: `app.use(express.json({ limit: '10kb' }));`,
    options: [
      'To prevent malicious clients from sending massive JSON payloads that exhaust server RAM and cause Denial-of-Service (DoS).',
      'Because JSON specifications limit object size to 10kb.',
      'To force users to upload images using base64 strings.',
      'Express servers crash if payloads exceed 1kb.'
    ],
    correctIndex: 0,
    explanation: 'Without payload size restrictions, an attacker could send multi-megabyte payloads in high volumes, consuming all available server RAM and CPU.'
  },
  {
    id: 'mern-q40',
    track: 'mern',
    skill: 'Node.js',
    topic: 'Process Lifecycle & Graceful Shutdown',
    difficulty: 'Advanced',
    question: 'What is the correct strategy for implementing a graceful shutdown on SIGTERM / SIGINT in a production Node server?',
    codeSnippet: `process.on('SIGTERM', () => {\n  server.close(() => {\n    mongoose.connection.close(false, () => process.exit(0));\n  });\n});`,
    options: [
      'Immediately execute process.exit(1) on signal reception.',
      'Stop accepting new HTTP connections, allow in-flight requests to complete, close database connections, and then exit cleanly.',
      'Restart the operating system.',
      'Clear all MongoDB collections.'
    ],
    correctIndex: 1,
    explanation: 'Graceful shutdown stops new incoming HTTP traffic, finishes active requests, closes database connections cleanly, and then terminates the process with code 0.'
  },

  // ==========================================
  // MongoDB & Mongoose (Questions 41 - 48)
  // ==========================================
  {
    id: 'mern-q41',
    track: 'mern',
    skill: 'MongoDB',
    topic: 'Document Database Fundamentals',
    difficulty: 'Beginner',
    question: 'In MongoDB, what is the primary structural difference compared to traditional relational databases (RDBMS)?',
    codeSnippet: '',
    options: [
      'MongoDB stores data in tables and rigid foreign-key schemas.',
      'MongoDB stores data in flexible, schema-less BSON (Binary JSON) documents organized into collections.',
      'MongoDB requires all data to be stored entirely in CSV format.',
      'MongoDB cannot perform query filters or sorting.'
    ],
    correctIndex: 1,
    explanation: 'MongoDB is a document database storing dynamic BSON documents in collections, allowing nested sub-documents and arrays without rigid relational schemas.'
  },
  {
    id: 'mern-q42',
    track: 'mern',
    skill: 'Mongoose',
    topic: 'Schema Definition & Indexes',
    difficulty: 'Beginner',
    question: 'In Mongoose, how do you define an index that enforces unique values (e.g. unique user email addresses)?',
    codeSnippet: `const userSchema = new mongoose.Schema({\n  email: { type: String, required: true, unique: true, index: true }\n});`,
    options: [
      'Using the primaryKey: true constraint.',
      'Setting unique: true in the schema field definition or invoking schema.index({ email: 1 }, { unique: true }).',
      'Using the validateUnique() callback hook.',
      'MongoDB enforces uniqueness on all string fields automatically.'
    ],
    correctIndex: 1,
    explanation: 'The unique: true property instructs MongoDB to create a unique BSON B-tree index, rejecting duplicate key inserts with E11000 duplicate key error.'
  },
  {
    id: 'mern-q43',
    track: 'mern',
    skill: 'MongoDB',
    topic: 'Query Performance & Indexing',
    difficulty: 'Intermediate',
    question: 'What is the consequence of executing a query on a collection of 1,000,000 documents without an index on the filtered field?',
    codeSnippet: `db.users.find({ email: 'test@example.com' });`,
    options: [
      'MongoDB rejects the query with a missing index exception.',
      'MongoDB executes a Collection Scan (COLLSCAN), scanning all 1,000,000 documents into RAM from disk.',
      'MongoDB automatically creates an index within 5 seconds.',
      'The query runs in constant O(1) time.'
    ],
    correctIndex: 1,
    explanation: 'Without an index, MongoDB must inspect every single document in the collection (COLLSCAN), resulting in high disk I/O, CPU consumption, and slow response times.'
  },
  {
    id: 'mern-q44',
    track: 'mern',
    skill: 'Mongoose',
    topic: 'populate() & References',
    difficulty: 'Intermediate',
    question: 'What does Mongoose .populate() accomplish when querying documents with ObjectIds referencing another collection?',
    codeSnippet: `Roadmap.findById(id).populate('userId', 'name email');`,
    options: [
      'Copies all data into localStorage on the client.',
      'Performs a secondary lookup query replacing the referenced ObjectId with the actual document data from the referenced collection.',
      'Deletes the referenced document from the database.',
      'Creates a permanent SQL foreign key relationship in MongoDB.'
    ],
    correctIndex: 1,
    explanation: 'Mongoose populate() issues an additional query to replace specified ObjectId path references with matching document objects from the target collection.'
  },
  {
    id: 'mern-q45',
    track: 'mern',
    skill: 'MongoDB',
    topic: 'Aggregation Pipeline',
    difficulty: 'Advanced',
    question: 'In MongoDB Aggregation Framework, which pipeline stage groups documents by a specified key and calculates accumulators like sum, average, or count?',
    codeSnippet: `db.sales.aggregate([\n  { $match: { status: 'completed' } },\n  { $group: { _id: '$category', totalSales: { $sum: '$amount' } } }\n]);`,
    options: ['$project', '$match', '$group', '$unwind'],
    correctIndex: 2,
    explanation: 'The $group stage groups input documents by a specified identifier expression and applies accumulator operators ($sum, $avg, $push, etc.) to the grouped values.'
  },
  {
    id: 'mern-q46',
    track: 'mern',
    skill: 'MongoDB',
    topic: 'Atomic Updates & Operators',
    difficulty: 'Intermediate',
    question: 'Which MongoDB update operator atomically increments a numeric field by a specified value?',
    codeSnippet: `db.users.updateOne({ _id: userId }, { $inc: { loginCount: 1 } });`,
    options: ['$set', '$inc', '$add', '$push'],
    correctIndex: 1,
    explanation: '$inc increments a field by a specified number atomically, preventing concurrency race conditions between competing threads.'
  },
  {
    id: 'mern-q47',
    track: 'mern',
    skill: 'Mongoose',
    topic: 'Middleware & Pre/Post Hooks',
    difficulty: 'Intermediate',
    question: 'In Mongoose, why is a pre("save") hook commonly utilized for password security?',
    codeSnippet: `userSchema.pre('save', async function() {\n  if (!this.isModified('password')) return;\n  this.password = await bcrypt.hash(this.password, 12);\n});`,
    options: [
      'To automatically email the plain password to the user.',
      'To intercept document saving and hash modified plain text passwords with bcrypt before storing them in MongoDB.',
      'To convert passwords into base64 images.',
      'To bypass MongoDB validation rules.'
    ],
    correctIndex: 1,
    explanation: 'Mongoose pre-save hooks intercept document persistence, allowing password hashing with bcrypt only when the password field has been newly created or modified.'
  },
  {
    id: 'mern-q48',
    track: 'mern',
    skill: 'MongoDB',
    topic: 'ACID Transactions',
    difficulty: 'Advanced',
    question: 'Under what conditions does MongoDB support multi-document ACID transactions?',
    codeSnippet: `const session = await mongoose.startSession();\nsession.startTransaction();`,
    options: [
      'Only on single standalone local nodes running in development mode.',
      'Across replica sets and sharded clusters using multi-document session transactions.',
      'MongoDB has no support for transactions under any circumstance.',
      'Only when connected via ODBC SQL drivers.'
    ],
    correctIndex: 1,
    explanation: 'MongoDB supports multi-document distributed ACID transactions on replica sets and sharded clusters using client sessions.'
  },

  // ==========================================
  // Authentication, JWT & Security (Questions 49 - 54)
  // ==========================================
  {
    id: 'mern-q49',
    track: 'mern',
    skill: 'Authentication',
    topic: 'JWT Structure & Mechanics',
    difficulty: 'Beginner',
    question: 'What are the three dot-separated components of a JSON Web Token (JWT)?',
    codeSnippet: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
    options: [
      'Username, Password, and Role',
      'Header (algorithm & token type), Payload (claims/data), and Signature (verification hash)',
      'Database URI, Collection Name, and Index ID',
      'Public Key, Private Key, and Certificate'
    ],
    correctIndex: 1,
    explanation: 'A JWT comprises Header (Base64Url encoded metadata), Payload (Base64Url encoded claims), and cryptographic Signature generated using a secret key.'
  },
  {
    id: 'mern-q50',
    track: 'mern',
    skill: 'Security',
    topic: 'Cookie Security Attributes',
    difficulty: 'Intermediate',
    question: 'Why should authentication JWTs be stored in "httpOnly" cookies rather than browser "localStorage"?',
    codeSnippet: `res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });`,
    options: [
      'localStorage has a 10-byte storage limit.',
      'httpOnly cookies cannot be read or stolen by malicious JavaScript during Cross-Site Scripting (XSS) attacks.',
      'httpOnly cookies automatically delete user passwords after 5 minutes.',
      'localStorage requires an active internet connection to read.'
    ],
    correctIndex: 1,
    explanation: 'Tokens stored in localStorage are fully readable by any JavaScript running in the origin, making them vulnerable to XSS theft. httpOnly cookies are inaccessible to client-side scripts.'
  },
  {
    id: 'mern-q51',
    track: 'mern',
    skill: 'Security',
    topic: 'Password Hashing & Salt Rounds',
    difficulty: 'Intermediate',
    question: 'Why is bcrypt preferred over SHA-256 or MD5 for user password storage?',
    codeSnippet: `const hash = await bcrypt.hash(password, 12);`,
    options: [
      'SHA-256 and MD5 produce shorter strings that take more disk space.',
      'Bcrypt incorporates automated salting and is computationally slow (adaptive work factor), resisting GPU brute-force and rainbow table attacks.',
      'Bcrypt is a two-way encryption algorithm that allows retrieving plain passwords.',
      'MD5 is an industry requirement for modern banking apps.'
    ],
    correctIndex: 1,
    explanation: 'Cryptographic hash functions like SHA-256 are designed to be fast, making brute-force attacks trivial on modern GPUs. Bcrypt uses a key derivation function with configurable salt and work factor.'
  },
  {
    id: 'mern-q52',
    track: 'mern',
    skill: 'Security',
    topic: 'NoSQL Injection Prevention',
    difficulty: 'Intermediate',
    question: 'How can an attacker bypass password verification in a vulnerable Express + MongoDB route if input is not sanitized?',
    codeSnippet: `// Vulnerable code:\nUser.findOne({ email: req.body.email, password: req.body.password });\n// Attacker payload: { "email": "admin@app.com", "password": { "$ne": null } }`,
    options: [
      'By sending a buffer overflow that restarts the server.',
      'Using MongoDB query operators like "$ne" or "$gt" in JSON payloads to match any non-null password, bypassing authentication.',
      'By embedding SQL UNION SELECT statements in the URL.',
      'MongoDB queries are immune to injection.'
    ],
    correctIndex: 1,
    explanation: 'If request bodies accept unsanitized objects containing keys starting with "$", query operators like { $ne: null } match without knowing the actual password. Sanitization (mongo-sanitize) strips "$" keys.'
  },
  {
    id: 'mern-q53',
    track: 'mern',
    skill: 'Security',
    topic: 'Cross-Site Request Forgery (CSRF)',
    difficulty: 'Advanced',
    question: 'How does the "SameSite=Lax" or "SameSite=Strict" cookie attribute protect against CSRF attacks?',
    codeSnippet: `res.cookie('token', jwt, { sameSite: 'lax', secure: true });`,
    options: [
      'It prevents cookies from being stored on hard drives.',
      'It prevents the browser from sending the cookie on cross-site requests initiated by third-party origins.',
      'It forces cookies to expire after 10 seconds.',
      'It scrambles the cookie payload with AES-256 encryption.'
    ],
    correctIndex: 1,
    explanation: 'SameSite restricts cookie transmission: cross-site requests (e.g. from an attacker\'s website) will not include the cookie, eliminating CSRF vulnerabilities.'
  },
  {
    id: 'mern-q54',
    track: 'mern',
    skill: 'Authentication',
    topic: 'Role-Based Access Control (RBAC)',
    difficulty: 'Intermediate',
    question: 'What is the correct approach to enforce Role-Based Access Control in Express API routes?',
    codeSnippet: `router.delete('/courses/:id', authMiddleware, requireRole('admin'), deleteCourse);`,
    options: [
      'Check the user\'s role in the client-side React UI and skip server-side checks.',
      'Authenticate the user via JWT first, attach user info to req.user, then apply an authorization middleware checking req.user.role against permitted roles.',
      'Create a separate database for each role.',
      'Encrypt route URLs so only admins know the path.'
    ],
    correctIndex: 1,
    explanation: 'Server-side enforcement is mandatory: auth middleware verifies the JWT, followed by role guard middleware ensuring req.user has appropriate permissions before executing the controller.'
  },

  // ==========================================
  // Git, DevOps & System Design (Questions 55 - 60)
  // ==========================================
  {
    id: 'mern-q55',
    track: 'mern',
    skill: 'Git',
    topic: 'Version Control Workflows',
    difficulty: 'Beginner',
    question: 'What is the difference between "git merge" and "git rebase"?',
    codeSnippet: '',
    options: [
      'git merge deletes previous commits; git rebase recovers deleted files.',
      'git merge creates a 3-way merge commit preserving history; git rebase moves the branch base to create a linear commit history.',
      'git rebase pushes code to GitHub; git merge pulls code.',
      'There is no difference; they are aliases for the same operation.'
    ],
    correctIndex: 1,
    explanation: 'Merge creates a merge commit preserving parallel branch history. Rebase re-applies commits onto the tip of another branch, resulting in a cleaner linear history.'
  },
  {
    id: 'mern-q56',
    track: 'mern',
    skill: 'DevOps',
    topic: 'Docker Containerization',
    difficulty: 'Intermediate',
    question: 'Why are multi-stage Dockerfiles recommended for production MERN stack deployments?',
    codeSnippet: `FROM node:20-alpine AS builder\n...\nFROM node:20-alpine AS runner\nCOPY --from=builder /app/dist ./dist`,
    options: [
      'Multi-stage builds allow running Windows and Linux containers simultaneously.',
      'They separate build dependencies (compilers, npm devDependencies) from the final runtime image, resulting in dramatically smaller and more secure images.',
      'They eliminate the need for container registries.',
      'They enable hot-reloading in production containers.'
    ],
    correctIndex: 1,
    explanation: 'Multi-stage builds leave behind heavyweight compilers, build tools, and devDependencies, producing lean, lightweight production images with minimal attack surface.'
  },
  {
    id: 'mern-q57',
    track: 'mern',
    skill: 'System Design',
    topic: 'Caching with Redis',
    difficulty: 'Advanced',
    question: 'How does the Cache-Aside (Lazy Loading) pattern operate in a MERN stack application with Redis and MongoDB?',
    codeSnippet: `const cached = await redis.get(key);\nif (cached) return JSON.parse(cached);\nconst data = await Model.findById(id);\nawait redis.set(key, JSON.stringify(data), 'EX', 3600);`,
    options: [
      'Data is written exclusively to Redis; MongoDB is permanently discarded.',
      'The API checks Redis first; on a cache miss, it reads from MongoDB, populates Redis with an expiration TTL, and returns the response.',
      'Redis intercepts all network packets at the OS router level.',
      'MongoDB automatically syncs with Redis without any backend code.'
    ],
    correctIndex: 1,
    explanation: 'Cache-aside checks cache first; if present (cache hit), it returns immediately. If absent (cache miss), it queries database, populates the cache with a TTL, and returns data.'
  },
  {
    id: 'mern-q58',
    track: 'mern',
    skill: 'System Design',
    topic: 'Rate Limiting Algorithms',
    difficulty: 'Intermediate',
    question: 'What is the core advantage of the Sliding Window Counter rate limiting algorithm over a Fixed Window algorithm?',
    codeSnippet: '',
    options: [
      'Sliding Window eliminates the burst traffic vulnerability at window boundary edges.',
      'Sliding Window requires zero memory storage.',
      'Sliding Window only works on WebSocket connections.',
      'Fixed Window is completely unsupported in Node.js.'
    ],
    correctIndex: 0,
    explanation: 'Fixed windows allow twice the rate limit if an attacker bursts at the end of window 1 and start of window 2. Sliding window prevents boundary bursts by calculating a weighted rate.'
  },
  {
    id: 'mern-q59',
    track: 'mern',
    skill: 'DevOps',
    topic: 'CI/CD Pipelines',
    difficulty: 'Intermediate',
    question: 'In modern DevOps (e.g. GitHub Actions), what is the function of Continuous Integration (CI)?',
    codeSnippet: '',
    options: [
      'Automatically charging client credit cards on successful build.',
      'Automatically compiling code, executing automated test suites, and running linters whenever commits are pushed to detect errors early.',
      'Replacing human developers with automated code generation bots.',
      'Preventing team members from committing code after 5 PM.'
    ],
    correctIndex: 1,
    explanation: 'CI automatically builds and tests code changes on every pull request or push, providing fast feedback and preventing broken code from merging to main.'
  },
  {
    id: 'mern-q60',
    track: 'mern',
    skill: 'System Design',
    topic: 'Horizontal vs Vertical Scaling',
    difficulty: 'Advanced',
    question: 'In cloud architecture, what is horizontal scaling and what requirement does it impose on application servers?',
    codeSnippet: '',
    options: [
      'Upgrading a single server with more RAM and CPU; servers must be stateful.',
      'Adding more server instances behind a load balancer; application servers must be stateless (e.g. sessions in Redis/cookies rather than server memory).',
      'Migrating from MongoDB to SQL databases.',
      'Running client-side JavaScript on edge CDNs only.'
    ],
    correctIndex: 1,
    explanation: 'Horizontal scaling adds multiple server instances behind a load balancer. It requires servers to be stateless so any server can handle any request identically.'
  }
];

export default mernQuestions;
