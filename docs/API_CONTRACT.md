# PathForge - API Contract

## Authentication & Authorization
All protected endpoints require an `httpOnly` cookie (`token`) containing a valid JWT signed with `JWT_SECRET`.
Missing, tampered, or expired tokens result in `401 Unauthorized`.

---

## Roadmap Endpoints

### 1. GET `/api/roadmap`
- **Auth**: Protected (uses `req.user.id` only; client-supplied userIds are ignored).
- **Success (200)**: Returns user's active, non-archived roadmap.
- **Not Found (404)**: `{ "message": "No roadmap yet" }` when no active roadmap exists.

### 2. PATCH `/api/roadmap/module/:moduleId/complete`
- **Auth**: Protected.
- **Rule**:
  - Only a module with `status: 'active'` can be completed.
  - If module is `locked` or already `complete`, returns `400 Bad Request`.
  - Completing the module sets its status to `'complete'`, unlocks the next `'locked'` module to `'active'`, and recalculates `readinessScore`.
  - Completing the final module leaves all modules complete with readiness `100`.
- **Readiness Formula**:
  $$\text{readinessScore} = \text{round}\left(\frac{\sum_{\text{complete}} \text{estimatedHours}}{\sum_{\text{all}} \text{estimatedHours}} \times 100\right)$$
- **Success (200)**: Returns updated `{ "roadmap": ... }`.

---

## User Profile & Account Endpoints

### 1. PATCH `/api/user/profile`
- **Auth**: Protected.
- **Body**: `{ "name": "string (2-60 chars)" }`
- **Validation**: 400 on invalid or missing name.
- **Success (200)**: `{ "user": { "id", "name", "email", "targetRole" } }`

### 2. PATCH `/api/user/password`
- **Auth**: Protected.
- **Body**: `{ "currentPassword": "...", "newPassword": "..." }`
- **Validation**:
  - `newPassword` requires min 8 characters, at least 1 letter and 1 number.
  - Returns `400 Bad Request` if `currentPassword` is incorrect or `newPassword` is weak.
- **Success (200)**: `{ "message": "Password updated successfully" }`

### 3. DELETE `/api/user`
- **Auth**: Protected.
- **Body**: `{ "password": "..." }`
- **Validation**: Returns `400 Bad Request` if password is incorrect.
- **Action**:
  - Deletes user's `User` record.
  - Deletes all associated `Roadmap` documents.
  - Deletes all associated `Diagnostic` documents.
  - Clears `token` auth cookie.
- **Success (200)**: `{ "message": "User account and all related data deleted successfully" }`
