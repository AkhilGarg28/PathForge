# PathForge Backend API Documentation

All API responses return JSON.
Base URL: `/api`

---

## Authentication (`/api/auth`)

### 1. Register User
- **Method**: `POST`
- **Route**: `/api/auth/signup`
- **Auth Required**: No (Rate limited: 10 attempts / 15 mins per IP)
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123",
    "targetRole": "MERN Developer" // Optional
  }
  ```
- **Validation**:
  - `name`: String, 2–60 characters (trimmed)
  - `email`: Valid email format (trimmed, lowercased)
  - `password`: String, min 8 characters, at least 1 letter and 1 number
- **Success Response (201 Created)**:
  - Header: Sets `token` in an `httpOnly` cookie (7-day expiration).
  ```json
  {
    "user": {
      "id": "67222384a1e944df88e998a1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "targetRole": "MERN Developer"
    }
  }
  ```
- **Error Cases**:
  - `400 Bad Request`: Validation failure on name, email, or weak password.
  - `409 Conflict`: Email is already registered.
  - `429 Too Many Requests`: Rate limit exceeded.

---

### 2. Login User
- **Method**: `POST`
- **Route**: `/api/auth/login`
- **Auth Required**: No (Rate limited: 10 attempts / 15 mins per IP)
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Success Response (200 OK)**:
  - Header: Sets `token` in an `httpOnly` cookie (7-day expiration).
  ```json
  {
    "user": {
      "id": "67222384a1e944df88e998a1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "targetRole": "MERN Developer"
    }
  }
  ```
- **Error Cases**:
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Generic `"Invalid credentials"` (does not leak email existence).
  - `429 Too Many Requests`: Rate limit exceeded.

---

### 3. Logout User
- **Method**: `POST`
- **Route**: `/api/auth/logout`
- **Auth Required**: No
- **Request Body**: None
- **Success Response (200 OK)**:
  - Header: Clears `token` cookie.
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

### 4. Get Current User Profile
- **Method**: `GET`
- **Route**: `/api/auth/me`
- **Auth Required**: Yes (`token` cookie)
- **Request Body**: None
- **Success Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "67222384a1e944df88e998a1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "targetRole": "MERN Developer"
    }
  }
  ```
- **Error Cases**:
  - `401 Unauthorized`: Missing, expired, or tampered token.

---

## Roles (`/api/roles`)

### 1. List Available Roles
- **Method**: `GET`
- **Route**: `/api/roles`
- **Auth Required**: No (Public)
- **Request Body**: None
- **Success Response (200 OK)**:
  ```json
  {
    "roles": [
      {
        "id": "67222384a1e944df88e998b2",
        "name": "MERN Developer",
        "description": "Full-stack JavaScript engineer...",
        "dimensions": [
          "Frontend React",
          "Node & Express",
          "MongoDB & Mongoose",
          "API Design & Security",
          "State Management",
          "Testing & Deployment"
        ]
      }
    ]
  }
  ```

---

## User Management (`/api/user`)

### 1. Select / Switch Target Role
- **Method**: `POST`
- **Route**: `/api/user/role`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "roleId": "67222384a1e944df88e998b2"
  }
  ```
- **Action**: Updates `user.targetRole` and archives any existing active roadmap (`isArchived: true`).
- **Success Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "67222384a1e944df88e998a1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "targetRole": "MERN Developer"
    }
  }
  ```
- **Error Cases**:
  - `400 Bad Request`: Malformed `roleId` or role does not exist.
  - `401 Unauthorized`: Unauthenticated.

---

### 2. Update Profile Name
- **Method**: `PATCH`
- **Route**: `/api/user/profile`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Jane Developer"
  }
  ```
- **Validation**: `name`: 2–60 characters.
- **Success Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "67222384a1e944df88e998a1",
      "name": "Jane Developer",
      "email": "jane@example.com",
      "targetRole": "MERN Developer"
    },
    "message": "Profile updated successfully"
  }
  ```
- **Error Cases**:
  - `400 Bad Request`: Missing or invalid name.
  - `401 Unauthorized`: Unauthenticated.

---

### 3. Change Password
- **Method**: `PATCH`
- **Route**: `/api/user/password`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "currentPassword": "SecurePassword123",
    "newPassword": "NewStrongPassword456"
  }
  ```
- **Validation**: `newPassword` requires min 8 characters, at least 1 letter and 1 number.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```
- **Error Cases**:
  - `400 Bad Request`: Incorrect current password or weak new password.
  - `401 Unauthorized`: Unauthenticated.

---

### 4. Delete Account
- **Method**: `DELETE`
- **Route**: `/api/user`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "password": "SecurePassword123"
  }
  ```
- **Action**: Cascades deletion across `User`, `Roadmap`, and `Diagnostic` records; clears cookie.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "User account and all related data deleted successfully"
  }
  ```
- **Error Cases**:
  - `400 Bad Request`: Incorrect password or missing body.
  - `401 Unauthorized`: Unauthenticated.

---

## Diagnostic Assessments (`/api/diagnostic`)

### 1. Get Assessment Questions for a Role
- **Method**: `GET`
- **Route**: `/api/diagnostic/:roleId`
- **Auth Required**: Yes
- **Success Response (200 OK)**:
  - Strips and **never leaks `correctIndex`**.
  ```json
  {
    "roleId": "67222384a1e944df88e998b2",
    "roleName": "MERN Developer",
    "questions": [
      {
        "id": "mern-q1",
        "roleName": "MERN Developer",
        "dimension": "Frontend React",
        "question": "What is the primary purpose of useEffect...?",
        "options": ["Option A", "Option B", "Option C", "Option D"]
      }
    ]
  }
  ```
- **Error Cases**:
  - `400 Bad Request`: Invalid `roleId` format.
  - `401 Unauthorized`: Unauthenticated.
  - `404 Not Found`: Role does not exist.

---

### 2. Submit Assessment Answers & Generate Roadmap
- **Method**: `POST`
- **Route**: `/api/diagnostic/submit`
- **Auth Required**: Yes (Rate limited: 1 submission per 2 mins per user)
- **Request Body**:
  ```json
  {
    "roleId": "67222384a1e944df88e998b2",
    "answers": [
      {
        "questionId": "mern-q1",
        "selectedIndex": 1
      }
    ]
  }
  ```
- **Validation**:
  - Every question for the specified role must be answered exactly once.
  - `selectedIndex` must be an integer between 0 and 3.
- **Action**:
  1. Computes `dimensionScores` (0–5 scale per dimension).
  2. Saves a `Diagnostic` record.
  3. Archives any existing active roadmap.
  4. Generates a personalized 6-module curriculum using AI with local fallback.
  5. Computes initial `readinessScore` (weighted by estimatedHours).
  6. Saves and returns the new `Roadmap`.
- **Success Response (200 OK)**:
  ```json
  {
    "dimensionScores": {
      "Frontend React": 4.5,
      "Node & Express": 3.0
    },
    "readinessScore": 0,
    "roadmap": {
      "id": "67222384a1e944df88e998c3",
      "userId": "67222384a1e944df88e998a1",
      "roleId": "67222384a1e944df88e998b2",
      "isArchived": false,
      "readinessScore": 0,
      "modules": [
        {
          "moduleId": "mod-1-react",
          "title": "React Core Foundations",
          "estimatedHours": 10,
          "status": "active"
        },
        {
          "moduleId": "mod-2-node",
          "title": "Node.js & Express Architecture",
          "estimatedHours": 15,
          "status": "locked"
        }
      ],
      "history": [
        {
          "date": "2026-10-30T17:00:00.000Z",
          "event": "roadmap_created",
          "readinessScore": 0
        }
      ]
    }
  }
  ```
- **Error Cases**:
  - `400 Bad Request`: Missing questions, duplicate answers, or out-of-range option index.
  - `401 Unauthorized`: Unauthenticated.
  - `429 Too Many Requests`: Rate limit exceeded (more than 1 generation per 2 minutes).

---

## Roadmap (`/api/roadmap`)

### 1. Get Active Roadmap
- **Method**: `GET`
- **Route**: `/api/roadmap`
- **Auth Required**: Yes (Queries for `req.user.id` only; client-supplied userIds are ignored)
- **Request Body**: None
- **Success Response (200 OK)**:
  ```json
  {
    "roadmap": {
      "id": "67222384a1e944df88e998c3",
      "userId": "67222384a1e944df88e998a1",
      "roleId": "67222384a1e944df88e998b2",
      "isArchived": false,
      "readinessScore": 25,
      "modules": [
        {
          "moduleId": "mod-1-react",
          "title": "React Core Foundations",
          "status": "complete"
        },
        {
          "moduleId": "mod-2-node",
          "title": "Node.js & Express Architecture",
          "status": "active"
        }
      ]
    }
  }
  ```
- **Error Cases**:
  - `401 Unauthorized`: Unauthenticated.
  - `404 Not Found`: `{ "message": "No roadmap yet" }`.

---

### 2. Complete Module
- **Method**: `PATCH`
- **Route**: `/api/roadmap/module/:moduleId/complete`
- **Auth Required**: Yes
- **URL Parameter**: `moduleId` (string)
- **Request Body**: None
- **Rule**:
  - Only a module with `status: 'active'` can be completed.
  - Marks target module as `'complete'`.
  - Unlocks the next `'locked'` module to `'active'`.
  - Recalculates weighted `readinessScore` based on module `estimatedHours`.
  - Appends `{ date, event: "module_complete", readinessScore }` to `history`.
  - Completing the final module leaves all modules complete and readiness at 100%.
- **Success Response (200 OK)**:
  ```json
  {
    "roadmap": {
      "id": "67222384a1e944df88e998c3",
      "readinessScore": 33,
      "modules": [...]
    },
    "message": "Module completed successfully"
  }
  ```
- **Error Cases**:
  - `400 Bad Request`: Module is not active (`locked` or already `complete`).
  - `401 Unauthorized`: Unauthenticated.
  - `404 Not Found`: Module does not exist in the active roadmap, or user has no active roadmap.

---

## Health Check (`/api/health`)
- **Method**: `GET`
- **Route**: `/api/health`
- **Auth Required**: No (Public)
- **Success Response (200 OK)**:
  ```json
  {
    "status": "ok"
  }
  ```
