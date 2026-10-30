# PathForge Production Deployment Guide

This guide provides end-to-end, step-by-step instructions for deploying PathForge to production using:
- **Backend**: [Render](https://render.com) (Node.js Express Web Service)
- **Frontend**: [Vercel](https://vercel.com) (React SPA with Vite)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (M0 Free Tier Cluster)

---

## Architecture & Production Highlights

- **Cross-Site Cookies**: The backend sets `httpOnly`, `secure: true`, and `sameSite: 'none'` in production, allowing authentication cookies to flow between the Vercel frontend (`https://<app>.vercel.app`) and Render backend (`https://<api>.onrender.com`).
- **Proxy Trust**: `app.set('trust proxy', 1)` is enabled on the server so secure cookie attributes and IP-based rate limiting work accurately behind Render's reverse proxy.
- **SPA Routing**: `client/vercel.json` provides URL rewrites to `index.html` so client-side navigation (`/roles`, `/diagnostic`, `/dashboard`, etc.) works seamlessly on hard refresh.
- **AI Fallback**: The curriculum generation engine utilizes Google Gemini (`gemini-1.5-pro`), backed by automatic deterministic fallback so curriculum synthesis never crashes if the LLM is temporarily unavailable.

---

## (A) MongoDB Atlas Setup

### 1. Create Free Cluster
1. Sign in or create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a new project named **PathForge**.
3. Click **Create Deployment** and select the **M0 Free Tier** (Shared).
4. Select your preferred Cloud Provider (AWS or Google Cloud) and region closest to your users.
5. Cluster Name: leave as `Cluster0` or name it `pathforge-cluster`. Click **Create Deployment**.

### 2. Configure Database User
1. Under **Security** in the left sidebar, click **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Set a Username: e.g. `pathforge_admin`.
5. Set a Password: click **Autogenerate Secure Password** or enter your own. **Copy and save this password safely**.
6. Built-in Role: Select **Read and write to any database**.
7. Click **Add User**.

### 3. Configure Network Access (IP Whitelist)
1. Under **Security** in the left sidebar, click **Network Access**.
2. Click **Add IP Address**.
3. Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   > *Note:* Render web services use dynamic outbound IP pools. Allowing `0.0.0.0/0` is necessary for Render to communicate with your Atlas cluster.
4. Click **Confirm**. Wait until status changes to **Active**.

### 4. Copy Connection String
1. Under **Deployment** in the left sidebar, click **Database**.
2. Click **Connect** on your cluster.
3. Choose **Drivers** (Node.js, version 5.5 or later).
4. Copy the connection string format:
   ```text
   mongodb+srv://pathforge_admin:<db_password>@cluster0.xxxxx.mongodb.net/pathforge?retryWrites=true&w=majority&appName=Cluster0
   ```
5. Replace `<db_password>` with your actual password and ensure the database name `/pathforge` is included right before the `?` query parameters.

---

## (B) Render Web Service Setup (Backend)

### 1. Create Web Service
1. Sign in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub account and select your **PathForge** repository.

### 2. Web Service Configuration Settings

| Setting | Value | Explanation |
| :--- | :--- | :--- |
| **Name** | `pathforge-api` | Your Render subdomain (`https://pathforge-api.onrender.com`) |
| **Region** | Closest to Atlas (e.g. *Frankfurt*, *Oregon*, *Ohio*) | Minimizes database network latency |
| **Branch** | `main` | Production branch to build from |
| **Root Directory** | `server` | Points to the backend Express folder |
| **Runtime** | `Node` | Node.js environment |
| **Build Command** | `npm install` | Installs server production dependencies |
| **Start Command** | `npm start` | Runs `node server.js` |
| **Instance Type** | `Free` | Free tier instance |

### 3. Environment Variables on Render
Scroll to **Environment Variables** and add the following entries:

| Variable Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production cookie settings (`secure: true`, `sameSite: none`) |
| `PORT` | `10000` | Port for the service (Render sets this, but defining it ensures consistency) |
| `MONGODB_URI` | `mongodb+srv://pathforge_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pathforge?retryWrites=true&w=majority` | Your Atlas connection string |
| `JWT_SECRET` | `64_character_random_hex_string` | Random secret for signing user tokens (generate via `openssl rand -hex 32`) |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-1.5-pro` | Gemini model variant |
| `CLIENT_URL` | `http://localhost:3000` | Temporary value; will be updated in Step (D) once Vercel URL is known |

4. Click **Create Web Service**.
5. Wait for the build and deployment to finish. Once live, copy your service URL:  
   `https://pathforge-api.onrender.com`

---

## (C) Vercel Project Setup (Frontend)

### 1. Import Project
1. Sign in to [vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your **PathForge** repository.

### 2. Configure Vercel Project Settings

| Setting | Configuration |
| :--- | :--- |
| **Framework Preset** | `Vite` |
| **Root Directory** | Click **Edit** and choose `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 3. Environment Variables on Vercel
Under **Environment Variables**, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://pathforge-api.onrender.com/api` | Your Render backend API base URL (must include `/api`) |

> *Note:* In Vite, `VITE_API_URL` is baked into the JavaScript bundle at build time. Whenever you change this URL, trigger a new deployment on Vercel.

### 4. Deploy
1. Click **Deploy**.
2. Vercel will install dependencies, run `vite build`, and publish your app.
3. Copy your live Vercel domain: e.g. `https://pathforge.vercel.app`.

---

## (D) Link Frontend & Backend (Update Render CLIENT_URL)

Now that your Vercel URL is known:
1. Go to your Render Dashboard -> select **pathforge-api**.
2. Click **Environment** in the left sidebar.
3. Edit the `CLIENT_URL` variable:
   ```text
   CLIENT_URL = https://pathforge.vercel.app
   ```
   *(Ensure there is no trailing slash! If you have multiple domains or preview URLs, you can supply comma-separated values: `https://pathforge.vercel.app,https://pathforge-git-main-yourname.vercel.app`)*
4. Click **Save Changes**. Render will automatically trigger a zero-downtime redeploy with the updated CORS configuration.

---

## (E) Seed the Production Database (Atlas)

Your MongoDB Atlas cluster requires initial roles and competency dimensions. Run the pre-built seed script from your local machine targeting Atlas:

### Windows PowerShell:
```powershell
cd server
$env:MONGODB_URI="mongodb+srv://pathforge_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pathforge?retryWrites=true&w=majority"
node scripts/seed.js
```

### macOS / Linux:
```bash
cd server
MONGODB_URI="mongodb+srv://pathforge_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pathforge?retryWrites=true&w=majority" node scripts/seed.js
```

### Expected Output:
```text
MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
Seeded 2 roles, 24 questions, and 24 resources successfully.
Database seeding completed!
```

---

## (F) Render Free Tier Sleep Behavior & Demo Preparation

### Understanding Sleep Mode
- Render's **Free Tier** web services automatically enter sleep mode after **15 minutes of inactivity** to preserve server capacity.
- The next incoming request triggers a "cold start", which takes approximately **30 to 50 seconds** to boot the container, connect to MongoDB, and respond.
- Once awake, response times return to normal sub-100ms speeds.

### How to Wake Up the Server Before a Demo
Always wake your server 2–3 minutes before starting a live presentation or evaluation:

1. **Method 1: Run the Smoke Test (Recommended)**
   ```bash
   node server/scripts/smokeTest.js https://pathforge-api.onrender.com
   ```
   This will ping health, authenticate, verify roles, and ensure the backend is fully awake and primed.

2. **Method 2: Browser Ping**
   Open `https://pathforge-api.onrender.com/api/health` directly in a browser tab. Wait for the JSON response:
   ```json
   {"status":"ok"}
   ```

3. **Method 3: Free Uptime Ping (Optional)**
   Configure a free monitor (such as [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com)) to send a `GET` request to `https://pathforge-api.onrender.com/api/health` every 10 minutes during your presentation window.

---

## (G) Verification: Run Post-Deployment Smoke Test

To verify that your live production deployment is completely functional, run the built-in smoke test script against your production URL:

```bash
node server/scripts/smokeTest.js https://pathforge-api.onrender.com
```

### Sample Successful Output:
```text
============================================================
  PathForge Post-Deployment Smoke Test
============================================================
Target Base URL: https://pathforge-api.onrender.com
API Base URL:    https://pathforge-api.onrender.com/api
Timestamp:       2026-10-30T17:25:00.000Z

[Step 1/5] Checking API health status (GET /api/health)... ✓ PASS
    ↳ Server healthy: {"status":"ok"}
[Step 2/5] Registering test user (POST /api/auth/signup)... ✓ PASS
    ↳ Registered user ID: 6722... (smoke_test_173030...a@example.com)
[Step 3/5] Logging in test user (POST /api/auth/login)... ✓ PASS
    ↳ Login successful, auth session established
[Step 4/5] Fetching role catalog (GET /api/roles)... ✓ PASS
    ↳ Retrieved 2 role(s): [MERN Developer, Data Analyst]
[Step 5/5] Logging out test user (POST /api/auth/logout)... ✓ PASS
    ↳ Logout successful: Logged out successfully

------------------------------------------------------------
✓ ALL SMOKE TESTS PASSED! Target service is fully operational.
------------------------------------------------------------
```

---

## Production Readiness Checklist

- [x] Server start script added (`npm start` -> `node server.js`)
- [x] Express `trust proxy` enabled for Render reverse proxy
- [x] Cross-site cookie configuration (`secure: true`, `sameSite: 'none'`)
- [x] CORS dynamic validation reading `CLIENT_URL`
- [x] SPA rewrite rules configured in `client/vercel.json`
- [x] Frontend `VITE_API_URL` runtime & build-time resolution
- [x] Smoke test automated verification script (`server/scripts/smokeTest.js`)
- [x] Detailed deployment walkthrough documented in `docs/deployment.md`
