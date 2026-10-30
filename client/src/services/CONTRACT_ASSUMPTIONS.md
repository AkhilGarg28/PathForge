# PathForge – Frontend Contract Assumptions

This document records the assumed backend API contract (JWT in httpOnly cookie, normalized errors shaped `{ error: { code, message } }`).
Created because `docs/API_CONTRACT.md` is not present in the repository.

---

## 1. Authentication
Session/JWT managed through secure `httpOnly` cookies. Requests must pass `credentials: "include"`.

### Endpoints
- **POST `/api/auth/signup`**
  - Request: `{ email: string, password: string, name?: string }`
  - Response (201): `{ user: { id: string, email: string, name: string, roleId?: string } }`
- **POST `/api/auth/login`**
  - Request: `{ email: string, password: string }`
  - Response (200): `{ user: { id: string, email: string, name: string, roleId?: string } }`
- **POST `/api/auth/logout`**
  - Response (200): `{ success: true, message: string }`
- **GET `/api/auth/me`**
  - Response (200): `{ user: { id: string, email: string, name: string, roleId?: string } }`
  - Response (401): `{ error: { code: "UNAUTHORIZED", message: "Not logged in" } }`

---

## 2. Roles
- **GET `/api/roles`**
  - Response (200): `{ roles: Array<{ id: string, title: string, description: string, dimensions: string[] }> }`
- **POST `/api/user/role`**
  - Request: `{ roleId: string }`
  - Response (200): `{ success: true, roleId: string }`

---

## 3. Diagnostic Assessment
Questions evaluate self-assessed proficiency on role dimensions (no single "correct" answer, Likert scale).
- **GET `/api/diagnostic/:roleId`**
  - Response (200): `{ roleId: string, questions: Array<{ id: string, dimension: string, text: string, options: string[] }> }`
- **POST `/api/diagnostic/submit`**
  - Request: `{ roleId: string, answers: Array<{ questionId: string, selectedIndex: number }> }`
  - Response (200):
    ```json
    {
      "scores": { "<dimension>": 0-5 },
      "readinessScore": 0-100,
      "roadmap": { ...RoadmapShape }
    }
    ```

---

## 4. Roadmap & Modules
Roadmap shape:
```json
{
  "roleId": "mern-developer",
  "generatedBy": "llm", // "llm" | "fallback"
  "readinessScore": 45,
  "modules": [
    {
      "moduleId": "mod-1",
      "title": "Modern JavaScript & Async Patterns",
      "description": "Deep dive into ES6+, promises, and event loop.",
      "resourceTags": ["ES6", "Async", "JavaScript"],
      "resources": [
        { "title": "MDN Async JS", "url": "https://developer.mozilla.org", "type": "documentation" }
      ],
      "estimatedHours": 12,
      "status": "active", // "active" | "locked" | "complete"
      "checkpointScore": null // number | null
    }
  ]
}
```
*Rule: First module is "active", remainder are "locked".*

### Endpoints
- **GET `/api/roadmap`**
  - Response (200): `{ roadmap: RoadmapShape }`
  - Response (404): `{ error: { code: "NO_ROADMAP", message: "No roadmap found for user" } }`
- **PATCH `/api/roadmap/module/:moduleId/complete`**
  - Request: `{}`
  - Response (200): `{ roadmap: RoadmapShape }` (marks current module as "complete" and unlocks the next module as "active")

---

## 5. Checkpoints
- **GET `/api/checkpoint/:moduleId`**
  - Response (200):
    ```json
    {
      "moduleId": "mod-1",
      "title": "Module 1 Checkpoint",
      "questions": [
        {
          "id": "cp-q1",
          "text": "Question text...",
          "options": ["Option A", "Option B", "Option C", "Option D"]
        }
      ]
    }
    ```
- **POST `/api/checkpoint/:moduleId/submit`**
  - Request: `{ answers: Array<{ questionId: string, selectedIndex: number }> }`
  - Response (200):
    ```json
    {
      "score": 85,
      "replanned": true,
      "changeSummary": "Reinforced advanced async patterns based on assessment.",
      "roadmap": { ...UpdatedRoadmapShape }
    }
    ```

---

## 6. User Profile & Settings
- **PATCH `/api/user/profile`**
  - Request: `{ name?: string, email?: string }`
  - Response (200): `{ user: { id: string, email: string, name: string, roleId?: string } }`
- **PATCH `/api/user/password`**
  - Request: `{ currentPassword: string, newPassword: string }`
  - Response (200): `{ success: true, message: "Password updated successfully" }`
- **DELETE `/api/user`**
  - Response (200): `{ success: true, message: "User account deleted" }`

---

## 7. Standard Error Response
All error payloads follow:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```
`api.js` normalizes all errors into `{ status: number, code: string, message: string }`.
