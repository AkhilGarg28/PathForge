# PathForge Security Architecture & Hardening Guide

This document details the security posture, defensive controls, and operational policies implemented across the PathForge backend API (`/api`). PathForge enforces defence-in-depth principles across transport, authentication, authorization, query sanitization, and runtime configuration.

---

## 1. Threat Model & Defensive Overview

PathForge processes user accounts, diagnostic assessments, and personalized career roadmaps. The system is hardened against:
- **Credential Stuffing & Brute Force**: Defended by multi-tiered rate limiting, bcrypt hashing (cost factor 12), and generic authentication error messages.
- **NoSQL Injection & Operator Manipulation**: Defended by a custom recursive sanitizing middleware rejecting `$` and `.` in keys across all request scopes (`body`, `query`, `params`), paired with strongly typed Mongoose schemas.
- **Cross-User Data Leaks & BOLA / IDOR**: Defended by strict tenant isolation where all data operations derive identity solely from verified JWT session tokens (`req.user._id`), rejecting client-supplied user identifiers.
- **Assessment Cheating & Answer Tampering**: Defended by server-side answer scoring where `correctIndex` and solution metadata are strictly stripped prior to quiz transmission.
- **Information Leakage**: Defended by sanitized centralized error handling that redacts internal error details and suppresses stack traces in all environments.
- **Session Hijacking & XSS Token Theft**: Defended by storing JWTs exclusively in `httpOnly`, `SameSite` cookies (with `Secure` in production).

---

## 2. Authentication & Session Security

- **Password Storage**: Passwords are hashed using `bcryptjs` with **12 salt rounds**. The `passwordHash` field is marked `select: false` in the Mongoose `User` model, and model `toJSON` transforms permanently remove `passwordHash` and `__v` from all serialized outputs.
- **JWT Tokens**:
  - Signed with high-entropy HMAC-SHA256 secrets (`JWT_SECRET`).
  - Standard expiration of 7 days (`JWT_EXPIRES_IN`).
  - Payload contains minimal non-sensitive identity claims (`{ id: user._id }`).
- **Cookie Policy**:
  - `httpOnly: true`: Prevents client-side JavaScript access via `document.cookie`, mitigating XSS exfiltration.
  - `secure: process.env.NODE_ENV === 'production'`: Enforces HTTPS transmission in production environments.
  - `sameSite`: Configured to `'lax'` in development and `'none'` with `secure` in production cross-site contexts.
  - `path: '/'` with explicit maxAge matching token expiration.
- **Generic Auth Errors**: Login failures for non-existent emails or incorrect passwords return an identical generic response:
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```
  This eliminates account enumeration vulnerabilities.

---

## 3. Secret Management & Startup Entropy Validation

To guarantee cryptographic resilience, `server/config/env.js` validates environment parameters at application boot:
- **`JWT_SECRET` Strength Check**:
  - Minimum length: **32 characters** (256 bits).
  - Rejection of common weak placeholders (e.g., `secret`, `password`, `changeme`, `your_jwt_secret_key_here`).
  - Startup failure: The process terminates immediately with `process.exit(1)` if `JWT_SECRET` fails strength criteria in production or development.
- **Environment Isolation**: In test runs (`NODE_ENV === 'test'`), an ephemeral strong secret is supplied if omitted, preventing flaky test runs while preserving production safety.

---

## 4. NoSQL Injection & Query Sanitization

PathForge implements a recursive key sanitization middleware located at [`server/middleware/mongoSanitize.js`](file:///d:/Downloads/Pathforge/Pathforge/server/middleware/mongoSanitize.js):
- **Mechanism**: Inspects `req.body`, `req.query`, and `req.params`.
- **Prohibited Patterns**:
  - Keys beginning with `$` (MongoDB query operators, such as `$gt`, `$ne`, `$where`, `$regex`).
  - Keys containing `.` (MongoDB dot-notation for nested document traversal).
- **Enforcement**: Any violation triggers an immediate `400 Bad Request` before reaching controllers or database queries:
  ```json
  {
    "success": false,
    "message": "Malformed request: parameter keys cannot contain '$' or '.'"
  }
  ```
- **Value Preservation**: Legitimate values containing `$` (e.g. monetary amounts `$100`) or dots (e.g. email addresses `user.name@example.com`) are permitted; only object keys are restricted.

---

## 5. Multi-Tiered Rate Limiting

Rate limiting is powered by `express-rate-limit` with custom window and request thresholds:

| Tier | Endpoints | Default Limit | Purpose |
| :--- | :--- | :--- | :--- |
| **Strict Auth** | `POST /api/auth/signup`<br>`POST /api/auth/login` | **10 requests / 15 min** per IP | Mitigates brute-force attacks and credential stuffing |
| **Moderate Submit**| `POST /api/diagnostic/submit` | **15 requests / 15 min** per IP | Prevents assessment abuse and heavy AI generation load |
| **General API** | All `/api/*` endpoints | **100 requests / 15 min** per IP | Protects application availability against denial-of-service |

- **Proxy Trust (`trust proxy: 1`)**: Express is configured with `app.set('trust proxy', 1)` to correctly resolve client IP addresses when hosted behind reverse proxies (Render, AWS ALB, NGINX).
- **Standard Error Format**: Rate limiting violations return HTTP `429 Too Many Requests` in the standardized API error envelope:
  ```json
  {
    "success": false,
    "message": "Too many requests from this IP. Please try again after 15 minutes."
  }
  ```
- **Test Mode Bypass**: Disabled during test runs (`NODE_ENV === 'test'` or `DISABLE_RATE_LIMIT=true`) to enable rapid automated test execution while exposing custom factory methods for dedicated rate limit testing.

---

## 6. Tenant Isolation & Access Control

- **Strict User Scoping**: Non-authentication endpoints (`/api/roles`, `/api/user/*`, `/api/diagnostic/*`, `/api/roadmap/*`) require `authMiddleware`.
- **Identity Binding**:
  - Roadmap retrieval (`GET /api/roadmap`) exclusively queries by `req.user._id`.
  - Module completion (`PATCH /api/roadmap/module/:moduleId/complete`) verifies that the target module belongs to the authenticated user's active roadmap.
  - Account deletion (`DELETE /api/user`) cascades only to documents where `userId == req.user._id`.
- **Cheating Prevention**: `GET /api/diagnostic/:roleId` maps questions through a sanitizing filter that strips `correctIndex` and explanation fields prior to delivery.

---

## 7. Transport Security & HTTP Headers

- **Helmet**: Adds security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security`, `X-XSS-Protection`).
- **CORS Configuration**:
  - Explicit origin binding to `CLIENT_URL` (default: `http://localhost:5173`).
  - Wildcard `*` origins are strictly prohibited and will crash with an error if configured with `credentials: true`.
  - Allowed methods: `GET, POST, PATCH, PUT, DELETE, OPTIONS`.
- **Payload Limits**: Express JSON and URL-encoded parsers enforce a strict `10kb` body limit to block large-payload memory exhaustion attacks.

---

## 8. Dependency Security & `npm audit` Analysis

A security audit performed via `npm audit` identified:
- **`deepmerge` (GHSA-gcqx-w48m-w2h4)**: Low severity advisory in transitive dependency of `jest`. Remediation via `npm audit fix --force` would downgrade `jest` to v25, breaking modern Node.js ES Module test execution. Since Jest is a developer dependency used exclusively during offline testing, production runtimes are unexposed.
- **`zod` (GHSA-mrhx-c7xc-m3w5)**: High severity advisory regarding potential memory exhaustion during unbounded collection parsing.
  - **Mitigation**: PathForge mitigates this vulnerability at the network and middleware layers:
    1. Body parser limits restrict request payloads to `10kb`, making oversized JSON collections impossible to submit.
    2. Rate limiting restricts submission frequency.
    3. Forced upgrade to Zod v4 is currently deferred to maintain backward compatibility with current validation schemas.
- **`react-router` (GHSA-wrjc-x8rr-h8h6 / GHSA-337j-9hxr-rhxg)**: Moderate severity advisory related to React Router SSR hydration error deserialization and open redirects via backslash.
  - **Mitigation**: PathForge is architected exclusively as a client-side Single Page Application (CSR) using Vite; server-side rendering (SSR) hydration endpoints do not exist. Navigation is constrained to internal relative routes or external resource links validated by backend seed data.
- **`tinypool` / `esbuild` / `@vitest/mocker`**: Build-time / offline test harness dependencies utilized exclusively during local test and build processes, isolated from runtime production traffic.

---

## 9. Client-Side Security & Frontend Controls

1. **Zero `dangerouslySetInnerHTML`**: All dynamic strings from API responses and LLM curricula are rendered as native React children (`{module.title}`, `{module.description}`), which automatically escape HTML entities and defend against Cross-Site Scripting (XSS).
2. **External Link Safety**: All external learning resource links enforce `target="_blank"` with `rel="noopener noreferrer"` to prevent tab-nabbing and `window.opener` context leakage.
3. **No Sensitive Data in Web Storage**:
   - Authentication tokens are never placed into `localStorage` or `sessionStorage`.
   - `sessionStorage` is strictly restricted to temporary quiz question state (`selectedIndex` per question) and pending diagnostic inputs to survive browser refreshes.
4. **LLM Privacy Safeguards**:
   - The LLM prompt synthesizer ([`server/services/llmService.js`](file:///d:/Downloads/Pathforge/Pathforge/server/services/llmService.js)) consumes only `roleName`, numerical `dimensionScores`, and whitelisted keyword tags.
   - User names, emails, user IDs, IP addresses, and database keys are never passed to the LLM.
5. **Double-Submit & Race Condition Guards**:
   - Client submission handlers utilize `useRef` locks (`submittingRef.current`) and reactive disabled states to block rapid duplicate clicks.
   - Backend module completion handlers detect already-completed states and reject redundant operations with HTTP `400 Bad Request`.

---

## 10. Verification & Automated Test Coverage

The security configuration is validated by automated test suites:
- [`server/tests/security.test.js`](file:///d:/Downloads/Pathforge/Pathforge/server/tests/security.test.js): NoSQL injection sanitization, rate limiting, secret entropy validation, CORS protection, header security, and stack trace redaction.
- [`server/tests/regressions.test.js`](file:///d:/Downloads/Pathforge/Pathforge/server/tests/regressions.test.js): Expired token rejection, orphan/deleted user token detection, special characters and Unicode in display names, 10kb body payload limits, concurrent module completion safety, and in-memory cache invalidation.
- [`client/src/test/regressions.test.jsx`](file:///d:/Downloads/Pathforge/Pathforge/client/src/test/regressions.test.jsx): Expired session redirection, role protection guards, sessionStorage refresh survival, and empty database empty-states.
