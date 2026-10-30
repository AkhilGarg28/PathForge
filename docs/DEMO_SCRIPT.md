# PathForge 5-Minute Evaluation & Demo Script

This script provides an end-to-end walkthrough for demonstrating PathForge's core capabilities in under 5 minutes.

---

## ⏱️ Walkthrough Outline

| Time | Phase | Target Screen | Key Talking Points |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:45** | 1. Introduction & Landing | `/` | Problem statement: Employability gap, student skill verification, AI curricula |
| **0:45 - 1:30** | 2. Registration & Role Selection | `/signup` → `/roles` | Secure registration, JWT `httpOnly` cookies, choosing targeted engineering role |
| **1:30 - 2:30** | 3. Diagnostic Assessment | `/diagnostic` | 12 MCQs across 4 dimensions, anti-cheat protection, progress navigation |
| **2:30 - 3:15** | 4. AI Synthesis & Fallback | `/generating` | AI synthesis with Gemini, Zod validation, resource mapper, zero-crash fallback |
| **3:15 - 4:15** | 5. Dashboard & Progression | `/dashboard` → `/module/:id` | Pinned readiness score gauge, dimension bars, marking active module complete |
| **4:15 - 5:00** | 6. Account & Security Wrap-up | `/settings` | Profile management, password rotation, cascading data deletion, summary |

---

## 🎙️ Step-by-Step Script

### Phase 1: Landing Page (0:00 - 0:45)
1. **Action**: Open browser at `http://localhost:5173`.
2. **Narration**:
   > *"Welcome to PathForge. College graduates often struggle to bridge the gap between academic theory and practical job requirements. PathForge solves this by taking students through an adaptive 3-step loop: diagnostic assessment, AI curriculum synthesis, and verifiable skill progression."*
3. **Point out**:
   - Hero value proposition with call-to-action button.
   - 4-step "How PathForge Works" workflow.
   - Clean, professional design system with high-contrast accessibility.
4. **Action**: Click **"Get Started — It's Free"**.

---

### Phase 2: Registration & Role Selection (0:45 - 1:30)
1. **Action**: On `/signup`, register a new user:
   - Name: `Alex Mercer`
   - Email: `alex.mercer@example.com`
   - Password: `Password123!`
   - Confirm Password: `Password123!`
2. **Narration**:
   > *"User accounts are secured with bcrypt (cost factor 12) and issue session tokens strictly via httpOnly secure cookies, making credentials impervious to client-side XSS token theft."*
3. **Action**: Click **"Sign Up"**. The app transitions to `/roles`.
4. **Narration**:
   > *"Here students select their target engineering trajectory. PathForge currently supports MERN Developer and Data Analyst tracks, each covering 4 distinct skill dimensions."*
5. **Action**: Select **"MERN Developer"** and click **"Continue to Diagnostic"**.

---

### Phase 3: Diagnostic Assessment (1:30 - 2:30)
1. **Action**: On `/diagnostic`, view Question 1.
2. **Narration**:
   > *"The diagnostic assessment consists of 12 questions across 4 core dimensions. Notice the clean, distraction-free single-question view with keyboard navigation and progress tracking. Critically, correct answers are never sent to the client, preventing browser inspection cheating."*
3. **Action**: Select an answer for each question and click **"Next Question →"**.
4. **Demonstrate Refresh Resilience**:
   - On question 4, refresh the browser (`Ctrl+R` / `F5`).
   - Point out that the current question index and previously selected answers are restored without data loss.
5. **Action**: Complete questions 4 through 12, then click **"Submit Diagnostic"**.

---

### Phase 4: AI Synthesis & Fallback (2:30 - 3:15)
1. **Action**: Observe the animated `/generating` screen.
2. **Narration**:
   > *"PathForge is now evaluating the student's skill gaps. If Gemini API credentials are provided, it synthesizes an individualized roadmap prioritizing the weakest dimensions. If the AI service times out or is unconfigured, our deterministic fallback engine engages instantly, ensuring students never face a broken screen."*
3. **Action**: Transition completes and navigates automatically to `/dashboard`.

---

### Phase 5: Dashboard & Module Progression (3:15 - 4:15)
1. **Action**: Inspect the top overview card on `/dashboard`.
2. **Narration**:
   > *"Here is the student's Employability Dashboard. The circular gauge pins their overall readiness percentage—combining 40% from the diagnostic assessment and 60% from completed curriculum hours. Below, dimension score bars visually highlight strong areas and priority skill gaps."*
3. **Action**: Scroll down to the Curriculum Modules stepper.
4. **Narration**:
   > *"Notice sequential progression: Module 1 is active, while subsequent modules are locked. Let's click into Module 1."*
5. **Action**: Click **Module 1**. Review the curated resources (articles, official docs, videos).
6. **Action**: Click **"Mark as Complete ✓"**.
7. **Narration**:
   > *"Marking the module complete triggers readiness recalculation. Returning to the dashboard, Module 1 is now marked complete, Module 2 is unlocked, and the readiness gauge has increased."*

---

### Phase 6: Account Settings & Security Wrap-Up (4:15 - 5:00)
1. **Action**: Click **"Settings"** in the top navigation bar.
2. **Narration**:
   > *"In Settings, students can update their display name, rotate passwords with cryptographic verification, or permanently delete their account with cascading cleanup across all database collections."*
3. **Action**: Click **"Sign Out"**.
4. **Narration**:
   > *"Signing out clears the authentication cookie and resets all application state. PathForge provides a complete, resilient, and enterprise-grade skill acceleration platform."*
