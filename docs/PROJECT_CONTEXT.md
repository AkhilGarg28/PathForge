# PathForge: AI-Powered Personalized Skill Roadmaps for Employability

> **Permanent Source of Truth for PathForge Development**
> All coding agents, developers, and collaborators must consult and adhere strictly to this document before making any changes.

---

## 1. Product Overview

PathForge bridges the gap between student aspirations and employer expectations by generating personalized, adaptive learning paths based on diagnostic assessments.

### Core User Journey
1. **Role Selection**: A student picks a targeted career role (e.g., *MERN Developer* or *Data Analyst*).
2. **Diagnostic Quiz**: The student completes a diagnostic assessment covering 4 distinct skill dimensions (12 MCQs total, 3 per dimension).
3. **Skill Profiling**: Per-dimension skill scores and gap analyses are calculated.
4. **AI-Generated Roadmap**: An AI-powered engine constructs an ordered sequence of learning modules with curated resources, estimated completion times, and actionable outcomes, backed by a deterministic fallback if the AI service fails or times out.
5. **Progress Tracking**: Students track their learning journey on a visual dashboard displaying overall and per-dimension readiness percentages.
6. **Module Completion**: Students mark modules complete as they learn to update their readiness metrics.
7. **Adaptive Re-planning (Stretch)**: Periodic checkpoint quizzes dynamically adapt the remaining roadmap modules based on demonstrated mastery.

---

## 2. Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 18+ (Vite), React Router, Modern CSS / Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database & ODM** | MongoDB Atlas, Mongoose |
| **Authentication & Security** | JWT stored in `httpOnly` secure cookies, `bcryptjs` password hashing, Helmet, Rate Limiting, CORS |
| **Validation** | Zod (runtime request/response validation) |
| **AI / LLM Integration** | Google Gemini API (structured JSON output, swappable for OpenAI API) |
| **Hosting & Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |
| **Version Control** | Git, GitHub (branching model: `main` and `develop`) |

---

## 3. Scope & Phasing

### MVP Scope (In-Scope)
1. **Authentication**: Register, Login, Logout with `httpOnly` JWT cookies and password hashing.
2. **Role Selection**: Choose between "MERN Developer" and "Data Analyst".
3. **Diagnostic Quiz**: 12 MCQs per role (3 questions across 4 dimensions) with automatic score calculation.
4. **AI Roadmap Generation**: Structured prompt to Gemini with robust fallback to predefined curriculum templates on failure/timeout.
5. **Dashboard**: Display current readiness score, module list, per-dimension breakdown, and active status.
6. **Progress Tracking**: Mark module as complete/incomplete with live score updates.
7. **Account Settings**: Update profile name, view current role, and safely reset progress/account.

### Stretch Goals (Post-MVP Only)
> *Do not implement until MVP works reliably end to end.*
- Checkpoint quizzes mid-roadmap.
- Adaptive re-planning (regenerating or re-ordering remaining modules based on checkpoint scores).

### Explicitly Out of Scope
- Peer matching / social feeds
- Automated GitHub repository scanning or code parsing
- Real-time WebSockets / Socket.IO
- Dark mode theming (keep UI clean, light, and focused)

---

## 4. Supported Roles & Skill Dimensions

Each role features **4 dimensions** evaluated by **12 multiple-choice questions (MCQs)** (3 questions per dimension):

### Role 1: MERN Developer
- **Dimension 1**: Frontend Fundamentals (React, Component Lifecycle, Hooks, State Management)
- **Dimension 2**: Backend Architecture (Node.js, Express.js, RESTful API design, Middleware)
- **Dimension 3**: Database & Data Modeling (MongoDB, Mongoose, Aggregations, Indexing)
- **Dimension 4**: Full-Stack Integration & Auth (JWT, Security, CORS, Deployment, Error Handling)

### Role 2: Data Analyst
- **Dimension 1**: Data Wrangling & Cleaning (Python/Pandas or Excel, Handling Missing Data, Transformations)
- **Dimension 2**: SQL & Relational Databases (Joins, Aggregations, Window Functions, Subqueries)
- **Dimension 3**: Statistical Analysis & Modeling (Probability, Descriptive & Inferential Statistics, Hypothesis Testing)
- **Dimension 4**: Data Visualization & Storytelling (PowerBI / Tableau / Matplotlib, KPI Dashboards, Insights)

---

## 5. Development Rules & Guidelines

Every coding agent and developer **MUST** follow these rules for every single prompt/task:

1. **Read Context First**: Always read `docs/PROJECT_CONTEXT.md` and inspect the repository before taking any action.
2. **Strict Scope Control**: Change and touch **only** the files needed for the assigned task. Never start next phases unprompted.
3. **Zero Hardcoded Secrets**: Never hardcode API keys, database connection strings, or JWT secrets in code or commits. Always read from environment variables (`.env`).
4. **Simplest Option Principle**: When requirements are ambiguous, pick the simplest viable implementation and document the decision in the prompt response.
5. **Verification Before Handover**: Run and fix linting and tests (`npm run lint`, `npm test`) before concluding work.
6. **Required Ending Summary**: Every response must end with a structured summary containing:
   - **Files Changed**: List of modified/created files.
   - **How to Run**: Commands to install, run, and test.
   - **What Was Tested**: Specific commands executed and their outcomes.
   - **Open Issues / Next Steps**: Known limitations or immediate next steps.
