# PathForge - Project Context

## Overview
PathForge is an AI-powered personalized learning path and curriculum generator that helps learners master complex technical subjects through adaptive roadmaps, structured milestones, and intelligent resource recommendations.

## Tech Stack
- **Runtime**: Node.js (v20+)
- **Server Framework**: Express.js
- **Database & ODM**: MongoDB & Mongoose
- **Validation**: Zod
- **Security**: Helmet, CORS, Cookie-Parser, Bcrypt (12 rounds), JWT in httpOnly cookies, Express Rate Limit
- **Testing**: Jest, Supertest

## Core Architecture
- `server/models/`:
  - `User`: Authentication, profile data, and target role.
  - `Role`: Standard industry roles and skill dimensions.
  - `Diagnostic`: Initial evaluation results and dimension scores.
  - `Roadmap`: Personalized milestones, modules, completion statuses, and history tracking.
- `server/services/`:
  - `questionService`: In-memory caching and retrieval of diagnostic and checkpoint questions.
  - `scoringService`: Pure evaluation of diagnostic submissions (0-5 scale per dimension).
  - `readinessService`: Pure calculation of overall readiness scores (0-100) weighted by module estimated hours.
  - `roadmapService`: Pure status advancement and state transitions for curriculum modules.
- `server/controllers/` & `server/routes/`:
  - `/api/auth`: Signup, login, logout, current user profile.
  - `/api/roles`: Public list of available career pathways.
  - `/api/user`: Target role selection, profile updates, password change, account deletion.
  - `/api/diagnostic`: Assessment question retrieval and submission.
  - `/api/roadmap`: Roadmap retrieval and module completion tracking.
