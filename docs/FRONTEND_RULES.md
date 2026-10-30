# PathForge – Frontend Rules

Every contributor and AI agent editing files in `client/` **must** follow these rules.

---

## 1. Scope Guard
Only edit files inside `client/` (plus `docs/FRONTEND_RULES.md`).
Never touch `server/`, `data/`, or other docs.

## 2. Change Transparency
Before editing, list the files you will touch.
Never rename, move, or delete existing files unless explicitly asked.

## 3. Minimal Dependencies
State **why** before installing any new dependency.
Keep the dependency count as low as possible.

## 4. No Secrets in Code
No API keys, tokens, or secrets in source.
Only safe `VITE_` environment variables are allowed.
Keep `client/.env.example` updated with every new variable.

## 5. Centralized HTTP
All HTTP calls go through `src/services/api.js` only.
Components and hooks must **never** call `fetch` or `axios` directly.

## 6. Code Style
- Functional components and hooks only (no class components).
- Consistent naming: PascalCase for components, camelCase for utils/hooks.
- Code must pass ESLint and Prettier with zero warnings.

## 7. Security
Never use `dangerouslySetInnerHTML`.
Treat all API and LLM-generated text as plain text.

## 8. UI States
Every data-driven screen must handle three states:
- **Loading** – spinner or skeleton
- **Empty** – helpful message when there is no data
- **Error** – user-friendly error message with optional retry

## 9. Task Completion Checklist
Every task ends with:
1. Run the app (`npm run dev`).
2. Run tests / lint / build (`npm run lint`, `npm run build`).
3. Fix any failures.
4. Print a summary: files created/changed, commands run, results.

## 10. MVP Scope
Build MVP first. The following are **out of scope**:
- Peer matching
- GitHub repository scan
- Socket.IO real-time features
- Dark mode

The checkpoint quiz is a **stretch feature** behind the `VITE_ENABLE_CHECKPOINT` flag.

## 11. Assumptions
If something is ambiguous, state your assumption clearly in the task summary
rather than silently guessing.
