# PathForge 🚀
> **AI-Powered Personalized Skill Roadmaps for Employability**

PathForge bridges the gap between student aspirations and employer expectations. By evaluating baseline proficiencies through targeted technical diagnostic assessments, PathForge dynamically synthesizes personalized, outcome-driven learning curricula using AI (Google Gemini), backed by deterministic offline fallbacks, verified learning resources, and progress tracking.

---

## 📑 Table of Contents
1. [Core Features](#-core-features)
2. [Technology Stack](#-technology-stack)
3. [System Architecture](#-system-architecture)
4. [Monorepo Folder Structure](#-monorepo-folder-structure)
5. [Prerequisites](#-prerequisites)
6. [Local Installation & Setup](#-local-installation--setup)
7. [Environment Variables Reference](#-environment-variables-reference)
8. [Run, Seed & Test Commands](#-run-seed--test-commands)
9. [API Overview & Postman Guide](#-api-overview--postman-guide)
10. [Deployment Architecture](#-deployment-architecture)
11. [Known Limitations](#-known-limitations)

---

## 🌟 Core Features

- **Role Selection**: Career trajectories for **MERN Developer** (JavaScript, React, Node & Express, Databases & Git) and **Data Analyst** (Excel & SQL, Python, Statistics, Data Visualization).
- **Targeted Diagnostic Assessment**: 12 Multiple-Choice Questions (3 per dimension) with anti-cheat protection (`correctIndex` stripped before transmission).
- **AI Curriculum Synthesis**: Structured Google Gemini 1.5 JSON generation ordering modules from weakest to strongest skill gap, verified with Zod schemas.
- **Resilient Fallback Pipeline**: Automatic, zero-crash fallback to hand-authored curriculum templates when the AI service times out or is unconfigured.
- **Curated Learning Assets**: Automatic mapping to vetted video, documentation, and article resources (the LLM never writes external URLs).
- **Progress & Employability Dashboard**: Pinned circular readiness gauge (40% baseline diagnostic + 60% completed curriculum hours), dimension skill bars, and sequential vertical stepper.
- **Sequential Progression**: Strict unlock rules where completing module $k$ unlocks module $k+1$.
- **Account & Security Settings**: Display name updates, password rotation with verification, and permanent account deletion with cascading cleanup.
- **Adaptive Re-planning (Stretch)**: In-module checkpoint quizzes that dynamically adapt upcoming modules based on demonstrated mastery.

---

## 🛠️ Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Pure CSS Variables Design System |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database & ODM** | MongoDB Atlas / Local MongoDB, Mongoose 8 |
| **Authentication & Security** | JWT in `httpOnly` secure cookies, `bcryptjs` (cost 12), Helmet, Rate Limiting, NoSQL Sanitizer |
| **Schema Validation** | Zod (Runtime API payloads and LLM outputs) |
| **AI Integration** | Google Gemini API (official SDK / REST fallback, structured JSON mode) |
| **Testing** | Vitest, React Testing Library, Jest, Supertest, MongoMemoryServer, Playwright E2E |

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 18 + Vite)"]
        UI["React UI (CSS Variables Design System)"]
        Router["React Router v6 (Code Splitting via React.lazy)"]
        AuthCtx["AuthContext & ToastContext"]
        API["api.js Fetch Wrapper (credentials: 'include')"]
    end

    subgraph Server ["Backend API (Express.js)"]
        Security["Helmet & CORS & NoSQL Key Sanitizer"]
        RateLimit["Multi-Tiered Rate Limiter"]
        AuthMid["authMiddleware (httpOnly JWT Verification)"]
        Controllers["Controllers (Auth, Roles, Diagnostic, Roadmap, User)"]
        Cache["In-Memory Cache (Roles & Question Banks)"]
    end

    subgraph AI_Pipeline ["AI Synthesis Pipeline"]
        LLM["Google Gemini API (JSON Mode)"]
        Schema["Zod Schema Validator (roadmapSchema.js)"]
        Mapper["Resource Mapper (resources.json)"]
        Fallback["Deterministic Template Generator (fallbackRoadmap.js)"]
    end

    subgraph Database ["Persistence Layer"]
        MongoDB[("MongoDB (Atlas / Memory Server)")]
    end

    UI --> Router
    Router --> AuthCtx
    AuthCtx --> API
    API -->|HTTPS + Cookie| Security
    Security --> RateLimit
    RateLimit --> AuthMid
    AuthMid --> Controllers
    Controllers <--> Cache
    Controllers --> Controllers
    Controllers -->|Generate Curriculum| LLM
    LLM -->|Raw JSON| Schema
    Schema -->|Validated AST| Mapper
    LLM -.->|On Timeout or Error| Fallback
    Schema -.->|On Schema Violation| Fallback
    Mapper --> Controllers
    Fallback --> Controllers
    Controllers <-->|Mongoose Queries (.lean)| MongoDB
```

---

## 📁 Monorepo Folder Structure

```text
PathForge/
├── client/                     # Frontend Single Page Application
│   ├── src/
│   │   ├── components/         # Reusable UI widgets (Button, Card, Stepper, Modal, etc.)
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── hooks/              # Custom React hooks (useAuth, useToast, usePageTitle)
│   │   ├── mocks/              # Offline mock responses for all contract endpoints
│   │   ├── pages/              # 10 route pages (Landing, Auth, Quiz, Dashboard, etc.)
│   │   ├── services/           # Unified api.js fetch client
│   │   ├── styles/             # CSS variable design tokens and global styles
│   │   └── test/               # Vitest + React Testing Library suites (63 tests)
│   ├── .env.example            # Client environment template
│   ├── index.html              # HTML shell with embedded SVG favicon
│   ├── package.json            # Client dependencies & scripts
│   └── vite.config.js          # Vite bundler configuration
├── server/                     # Backend REST API
│   ├── config/                 # Database connection & startup entropy checks
│   ├── controllers/            # Route controllers for Auth, Roles, Diagnostic, Roadmap, User
│   ├── middleware/             # authMiddleware, rateLimiter, mongoSanitize, errorHandler
│   ├── models/                 # Mongoose models (User, Role, Diagnostic, Roadmap, Checkpoint)
│   ├── routes/                 # Express route definitions
│   ├── scripts/                # Database seed, validateData, startDevServer, testLlm
│   ├── services/               # llmService, roadmapGenerator, readinessService, scoringService
│   ├── tests/                  # Jest integration test suites (161 tests)
│   ├── utils/                  # Cache, JWT helpers, fallbackRoadmap, roadmapSchema
│   ├── validators/             # Zod validation schemas for request bodies
│   ├── .env.example            # Backend environment template
│   └── package.json            # Server dependencies & scripts
├── data/                       # Content repositories
│   ├── questions.json          # 24 Diagnostic MCQs across 8 dimensions
│   ├── resources.json          # 24 Curated learning assets (articles, docs, videos)
│   ├── checkpoints.json        # 6 Module checkpoint assessments (24 MCQs)
│   └── sampleRoadmap.json      # Contract baseline curriculum reference
├── docs/                       # Architecture & QA specifications
│   ├── API_CONTRACT.md         # Complete schema and endpoint contract
│   ├── ARCHITECTURE.md         # Detailed pipeline & security design
│   ├── DEMO_SCRIPT.md          # 5-minute evaluation walkthrough script
│   ├── PROJECT_CONTEXT.md      # Permanent source of truth & rules
│   ├── SECURITY.md             # Security architecture & hardening audit
│   ├── test-cases.md           # 29 manual QA test cases
│   ├── screenshots/            # UI screenshot capture reference
│   ├── PathForge.postman_collection.json # Comprehensive Postman test collection
│   └── PathForge.postman_environment.json# Postman environment configuration
├── e2e-runner/                 # Playwright End-to-End test suite
│   ├── tests/                  # happyPath.spec.js & fallbackPath.spec.js
│   ├── playwright.config.js    # Playwright configuration with automated web servers
│   └── package.json            # Playwright runner dependencies
├── .env.example                # Monorepo root environment reference
├── package.json                # Monorepo workspaces & shared scripts
└── README.md                   # Project documentation
```

---

## ⚡ Prerequisites

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher
- **MongoDB**: MongoDB Atlas cluster URI OR local MongoDB instance running at `mongodb://127.0.0.1:27017`
- **Google Gemini API Key**: Optional for offline mode (fallback template engages automatically if unconfigured)

---

## 💻 Local Installation & Setup

### 1. Clone & Install Dependencies
Clone the repository and install all workspace dependencies from the root directory:
```bash
git clone https://github.com/your-org/pathforge.git
cd pathforge
npm install
```

### 2. Configure Environment Files
Copy the example environment templates:
```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

---

## 🔑 Environment Variables Reference

### Backend (`server/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5000` | HTTP port on which Express listens. |
| `NODE_ENV` | Yes | `development` | Runtime environment (`development`, `production`, `test`). |
| `MONGODB_URI` | Yes | - | MongoDB connection string (Atlas or local `mongodb://127.0.0.1:27017/pathforge`). |
| `JWT_SECRET` | Yes | - | High-entropy secret key for signing auth cookies (min. 32 characters). |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime (`7d`, `24h`, etc.). |
| `CLIENT_URL` | Yes | `http://localhost:5173`| Frontend origin permitted by CORS (no wildcards allowed). |
| `GEMINI_API_KEY` | No | - | Google AI Studio API key. If omitted, fallback template generates roadmaps. |
| `GEMINI_MODEL` | No | `gemini-1.5-flash` | Gemini model name. |
| `LLM_TIMEOUT_MS` | No | `20000` | Timeout in milliseconds before triggering deterministic fallback (default: 20s). |
| `FORCE_LLM_FAILURE` | No | `false` | Test flag: Set `true` to force deterministic fallback execution. |
| `DISABLE_RATE_LIMIT`| No | `false` | Disable rate limiters during rapid testing. |

### Frontend (`client/.env`)
| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Yes | `http://localhost:5000/api` | Base URL of backend API server. |
| `VITE_USE_MOCK` | Yes | `false` | Set `true` for standalone client testing without backend. |
| `VITE_ENABLE_CHECKPOINT` | No | `false` | Set `true` to reveal module checkpoint quiz actions. |

---

## 🏃 Run, Seed & Test Commands

### 1. Validate Content Data & Seed Database
Validate the integrity of questions, resources, and checkpoints in `data/`:
```bash
npm run validate:data
```
Seed the database with roles, diagnostic question banks, and checkpoints:
```bash
npm run seed
```

### 2. Start Development Servers
Start the backend and frontend development servers:
```bash
# Terminal 1: Backend (Express + Nodemon on port 5000)
npm run dev:server

# Terminal 2: Frontend (Vite on port 5173)
npm run dev:client
```
*Alternatively, start an in-memory database and backend with auto-seeding in one step:*
```bash
node server/scripts/startDevServer.js
```

### 3. Run Automated Test Suites
Execute all test suites with a single command or run individual suites:

- **All Server Tests with Coverage (161 tests, 11 suites)**:
  ```bash
  npm run test:coverage --prefix server
  ```
- **All Client Unit & Component Tests (63 tests, 6 suites)**:
  ```bash
  npm test --prefix client -- --run
  ```
- **End-to-End Browser Tests (Playwright)**:
  ```bash
  npm run test:e2e
  ```
- **Code Linting & Formatting**:
  ```bash
  npm run lint
  npx prettier --check "server/**/*.js" "client/src/**/*.{js,jsx,css}"
  ```

---

## 📡 API Overview & Postman Guide

PathForge exposes a clean, standardized REST API conforming to [`docs/API_CONTRACT.md`](./docs/API_CONTRACT.md).

### Endpoint Summary
- **Authentication**: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- **Career Roles**: `GET /api/roles`, `POST /api/user/role`
- **Diagnostic**: `GET /api/diagnostic/:roleId`, `POST /api/diagnostic/submit`
- **Roadmap**: `GET /api/roadmap`, `PATCH /api/roadmap/module/:moduleId/complete`
- **User Profile**: `PATCH /api/user/profile`, `PATCH /api/user/password`, `DELETE /api/user`
- **Checkpoints**: `GET /api/checkpoint/:moduleId`, `POST /api/checkpoint/submit`

### Postman Usage
1. Open Postman and click **Import**.
2. Select [`docs/PathForge.postman_collection.json`](./docs/PathForge.postman_collection.json) and [`docs/PathForge.postman_environment.json`](./docs/PathForge.postman_environment.json).
3. Ensure the active environment is set to `PathForge Local`.
4. Run the collection using Postman Collection Runner to execute automated assertion suites across all endpoints, including negative and edge cases.

---

## 🌐 Deployment Architecture

- **Backend (Render / Railway / AWS)**:
  - Deployed as a Node.js web service running `npm start`.
  - `trust proxy` enabled for correct client IP resolution through load balancers.
  - Environment variables set in provider console (`JWT_SECRET`, `MONGODB_URI`, `CLIENT_URL`, `GEMINI_API_KEY`).
- **Frontend (Vercel / Netlify / Cloudflare Pages)**:
  - Deployed as a Single Page Application (Vite).
  - Configured with SPA rewrite routing rules (`/* -> /index.html`).
  - `VITE_API_URL` pointed to deployed backend URL.
- **Database (MongoDB Atlas)**:
  - Managed replica set with IP access whitelist and SSL/TLS encryption in transit and at rest.

---

## ⚠️ Known Limitations

1. **Checkpoints Data Coverage**: `data/checkpoints.json` includes module checkpoints for all 6 MERN Developer modules. Data Analyst checkpoint quizzes will return 404 until additional question banks are seeded.
2. **Third-Party Cookies**: Cross-site cookie transmission (`SameSite=None; Secure`) requires HTTPS in production. When testing across different domains on HTTP, browsers will block cookie transmission.
3. **AI Generation Rate Limits**: Gemini API free tier enforces RPM limits. If rate limited, PathForge automatically logs a warning and serves the deterministic fallback curriculum without impacting user experience.
