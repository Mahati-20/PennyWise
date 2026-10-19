# Pennywise — Hackathon Submission Kit

## 1. Project Overview & Elevator Pitch

**Pennywise** is a high-fidelity, full-stack personal finance web companion designed for college students (**Campus Mode**) and working professionals (**Pro Mode**). 

Unlike conventional expense trackers that merely record where money went, Pennywise combines luminous financial visualizations with transparent decision-making tools. Users instantly understand their **Available-to-Spend** buffer (guarding against overdrafts by deducting scheduled bills and planned savings), test discretionary purchases using the signature **"Can I Afford This?"** analyzer, simulate savings goal trade-offs, and monitor budget pacing.

Pennywise runs on a **Node.js + Express + SQLite** backend with salted password hashing (`bcryptjs`) and HTTP-only session cookies. The built-in session store is in memory; this project has not received a professional security review. Use fictional data for demos.

---

## 2. Key Standout Features

| Feature | Description |
| :--- | :--- |
| **Dual Experience Personas** | **Campus Mode:** Pocket money/stipend pacing, safe daily spending allowance, college categories.<br>**Pro Mode:** Salary cash flow, fixed lease commitments, multi-month emergency runway, investment goals. |
| **Available-to-Spend Math** | Distinguishes total liquid balance from spendable cash:<br>$$\text{Available} = \text{Balance} - \text{Committed Bills} - \text{Goal Allocations}$$ Includes a step-by-step audit formula popup. |
| **Signature "Money Orbit"** | Concentric SVG visualization depicting liquid cash core, category expense arcs, monthly budget tracks, and orbiting savings goal satellites. |
| **"Can I Afford This?" Analyzer** | 0–100 heuristic scoring engine evaluating discretionary purchases against liquid cash, category budget caps, and goal delay penalties. Includes a 3-scenario planner (*Buy Now*, *Wait for Next Cycle*, *Save Weekly*). |
| **Interactive Savings Goals Studio** | Drag-and-drop contribution trade-off simulator, projected completion dates, and milestone deposit logging with celebratory confetti. |
| **Budgets & Smart Suggestions** | Real-time budget progress bars with 1-click balanced suggestions tailored to persona rules (e.g., student allowance pacing or the 50/30/20 rule). |
| **Financial Calendar** | Monthly commitment grid tracking scheduled bills, recurring subscriptions, paydays, and historical transactions on inspected dates. |
| **Per-Account Data Scoping** | Financial routes require a logged-in session and query records using that session's user ID. The automated API test covers basic account separation; it is not a security audit. |
| **Zero-Pollution Onboarding** | Clean 4-step wizard collecting starting liquid balance (distinct from income) and optional goals without contaminating personal accounts with demo data. |
| **Isolated Demo Mode** | Explore fictional Campus and Pro sample datasets with a demo banner. Changes stay in memory and are not saved. |

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend:** Node.js, Express 5, TypeScript (`tsx`)
- **Database:** SQLite in WAL mode (`better-sqlite3`)
- **Authentication:** `bcryptjs` salted password hashing, `express-session` with HTTP-only cookies
- **Testing:** Native automated end-to-end multi-tenant isolation suite (`scripts/test-e2e.js`)

---

## 4. Suggested 60–90 Second Video Demo Walkthrough

### Act 1: The Hook & Landing Page (0:00 – 0:15)
- Open `http://localhost:5173`.
- *"Meet Pennywise — a personal finance companion that transforms raw balances into visual decision-making."*
- Highlight the dark luxury midnight-navy UI and the live interactive mini **Money Orbit** preview.

### Act 2: Dual Personas & Demo Exploration (0:15 – 0:30)
- Click **"Explore Demo"** to show instant exploration without registering.
- Highlight the **Campus Mode** (Safe Daily Spending Allowance: ₹X/day based on days remaining).
- Toggle persona to **Pro Mode** (Emergency Runway: X months of living expenses covered).
- Point out the sticky demo banner: sample data stays strictly in memory.
- Click **"Exit Demo"** to return to the landing page.

### Act 3: Sign Up, Onboarding & Starting Balance (0:30 – 0:45)
- Click **"Get Started"** and register a new user (`alex@college.edu`).
- Complete the 4-step wizard: enter a starting liquid balance (e.g., ₹15,000) and monthly allowance (₹12,000).
- Explain that Pennywise keeps starting balance distinct from income to prevent inflating net savings rates.
- Arrive at a pristine, personalized dashboard with clean empty states.

### Act 4: Available-to-Spend & "Can I Afford This?" (0:45 – 1:10)
- Click the Info icon next to **Available to Spend (Free Cash)** to show the transparent audit formula.
- Open **"Can I Afford This?"** from the top bar. Enter a proposed purchase (e.g. *Wireless Headphones* for ₹4,500).
- Show the 0–100 score gauge, the budget impact warning, and the 3-scenario planner (*Buy Now*, *Wait for Next Payday*, *Save ₹1,125/week*).
- Click **"Log as Expense"** to immediately debit the amount and watch the Available-to-Spend balance deduct in real time.

### Act 5: Savings Goals Studio & Confetti (1:10 – 1:25)
- Navigate to **Savings Goals Studio**.
- Adjust the monthly allocation slider to see projected completion dates dynamically change.
- Click **"Deposit"** to log ₹1,000 and trigger celebratory confetti!

### Act 6: Account Separation & Closing (1:25 – 1:35)
- Log out and demonstrate that a second account starts completely clean with 0 records.
- *"Pennywise turns everyday spending, budgets, and goals into a clear visual story, with Campus and Pro experiences to match different financial routines."*

---

## 5. Recommended Screenshots to Capture

1. **`01_landing_page.png`:** Full viewport of the public landing page showing *"Your money, made visual."*, product highlights, and the interactive mini Money Orbit preview.
2. **`02_dashboard_campus.png`:** Campus dashboard showing Available to Spend, Safe Daily Allowance, the full-size Money Orbit rings, and recent activity.
3. **`03_dashboard_pro.png`:** Pro dashboard showing Emergency Runway in months, category budget utilization bars, and active savings targets.
4. **`04_can_i_afford_this.png`:** The "Can I Afford This?" modal showing the 0–100 score gauge, reasons breakdown, and the 3 scenario cards (*Buy Now*, *Wait*, *Save Plan*).
5. **`05_savings_goals_studio.png`:** Savings Goals Studio showing the interactive allocation trade-off sliders and milestone confetti celebration.
6. **`06_budgets_suggestions.png`:** Budgets view showing category progress bars and the 1-click "Smart Suggestions" generator.
7. **`07_financial_calendar.png`:** Financial calendar grid highlighting scheduled bills and the day inspector drawer.
8. **`08_reports_analytics.png`:** Reports view showing the Cash Flow Balance bar (Inflow vs. Outflow) and category distribution proportions.

---

## 6. How to Run Locally

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Backend API Server
In terminal 1:
```bash
npm run server
```
*Backend runs at `http://localhost:5000` with SQLite database initialized at `data/pennywise.db`.*

### Step 3: Start the Frontend App
In terminal 2:
```bash
npm run dev
```
*Frontend runs at `http://localhost:5173` (proxies `/api` to port 5000).*

### Step 4: Run Automated Tests
In terminal 3:
```bash
npm test
```
*Executes all 10 automated end-to-end isolation tests.*

### Step 5: Production Build Verification
```bash
npm run build
```

---

## 7. Deployment Guide

Pennywise can be deployed in under 5 minutes to any platform supporting Node.js (Render, Railway, Fly.io, DigitalOcean, or an Ubuntu VPS).

### Deploying to Render / Railway:
1. **Build Command:**
   ```bash
   npm install && npm run build
   ```
2. **Start Command:**
   ```bash
   npm start
   ```
   *(The server serves API routes on `/api/*` and the compiled frontend static files from `dist/` if configured, or can run as separate services).*
3. **Environment Variables:**
   - `PORT`: `5000` (or injected by host)
   - `SESSION_SECRET`: Set to any secure 32-character random string.
   - `NODE_ENV`: `production`
   - `TRUSTED_ORIGINS`: exact comma-separated frontend origins.
   - `DATABASE_PATH`: SQLite file path on a persistent writable volume. The default is `data/pennywise.db`; mounting `/data` alone does not move this path.
4. **Persistence warning:** SQLite must be on a persistent disk. The in-memory session store loses sessions on restart and does not support multiple instances; replace it before serving real users.

---

## 8. Final Submission Checklist

- [x] Public Landing Page renders first for all new visitors.
- [x] Clear pathways: "Get Started", "Log In", and "Explore Demo".
- [x] Registration & Login work with salted `bcryptjs` password hashing.
- [x] Sessions maintained via secure HTTP-only cookies.
- [x] Basic API account separation and session restoration tested with disposable accounts; this is not a security audit.
- [x] Personal Onboarding separates starting liquid balance from monthly income.
- [x] Demo mode is explicitly labeled and makes zero database writes.
- [ ] Browser journeys and visual behavior still require a manual browser run.
- [x] Empty states with direct CTAs implemented across all views.
- [x] Production build passes with 0 TypeScript/compilation errors (`npm run build`).
- [x] Automated test suite passes 10/10 checks (`npm test`).

