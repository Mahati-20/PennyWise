# Pennywise — Premium Personal Finance Web Application

> **"Your money, made visual."**  
> A high-fidelity, full-stack personal finance web application built for college students (**Campus Mode**) and working professionals (**Pro Mode**).

---

## 🌟 Product Vision

Unlike ordinary expense trackers that merely record where money went, **Pennywise** combines luminous fintech visualizations with useful decision-making tools. Users understand what they can afford today, what commitments they need to protect, and how daily spending decisions trade off against long-term milestones.

### Dual Experience Modes
1. **Campus Mode (College Students):** Vibrant, friendly, and encouraging. Focuses on pocket money/stipends, canteen meals, books, transit, hostel amenities, and safe daily spending allowances.
2. **Pro Mode (Working Professionals):** Executive luxury, restrained elegance, and high data density. Focuses on salary cash flow, fixed commitments, emergency runway months, and multi-goal wealth allocation.

---

## 🎨 Visual Design System

- **Midnight Navy (`#10172E`):** Main application background
- **Deep Navy (`#151E38`):** Sidebar and secondary surfaces
- **Elevated Navy (`#1B2645`):** Cards and interactive panels
- **Electric Turquoise (`#40D9D0`):** Primary accent, liquid metrics, progress glow
- **Soft Lavender (`#B9A7FF`):** Secondary accent, savings, selected states
- **Semantic States:** Success (`#5ED6A2`), Warning (`#F2C66D`), Error (`#F08091`)
- **Typography:** Inter, Manrope, with tabular numerals for crystal-clear financial alignment

---

## 🚀 Full-Stack Architecture & Features

### 1. Dedicated Public Landing Page
- Striking headline: **"Your money, made visual."**
- Live interactive mini **Money Orbit preview** with sample data labeling.
- Clear action pathways: **Get Started (Sign Up)**, **Log In**, and **Explore Demo**.

### 2. Real Authentication & Multi-Tenant Session Security
- **Backend:** Express REST API + Node.js (`server/`).
- **Database:** SQLite (`data/pennywise.db`) with WAL mode and foreign key constraints via `better-sqlite3`.
- **Password Security:** Salted password hashing via `bcryptjs`.
- **Session Management:** HTTP-only cookies via `express-session` (the default in-memory store is for local/demo use only).
- **Multi-Tenant Isolation:** All database queries bind `user_id` strictly from server-side session. User A cannot view, modify, or leak data into User B's account.

### 3. Guided Personal Onboarding (Clean Zero-State)
- New users start with a clean slate (zero demo data pollution).
- 4-step personal wizard:
  1. Starting liquid balance (distinct from monthly income to prevent artificial inflation of savings rates).
  2. Monthly income/allowance and source.
  3. Optional upcoming commitments (rent, subscriptions).
  4. Optional initial savings goal.

### 4. Isolated Demo Mode
- **"Explore Demo"** button allows testing Campus and Pro datasets without registering.
- Displays a prominent sticky top banner: *"Demo Mode Active — Exploring sample data. Changes stay in memory and are not saved."*
- Exiting demo mode or logging in returns cleanly to authenticated state without corrupting database records.

### 5. Signature Interactive Money Orbit
- Concentric multi-ring financial visualizer:
  - **Center Core:** Net balance or available funds with glow and interactive toggle.
  - **Inner Ring:** Category spending arcs with hover tooltips, percentages, and semantic color-coding.
  - **Middle Ring:** Monthly budget utilization track.
  - **Outer Orbit:** Interactive satellite nodes for active savings goals with progress halos.
- Includes accessible data table fallback and reduced-motion support.

### 6. "Can I Afford This?" Purchase Analyzer
- **0–100 Affordability Score Gauge:** Evaluates discretionary purchases before spending.
- **Transparent Scoring Engine:**
  - Liquid cash buffer impact (up to 45 pts)
  - Category budget cap impact (up to 30 pts)
  - Savings goal delay penalty (up to 20 pts)
  - Essential necessity bonus (+10 pts)
- **3-Scenario Comparison:**
  1. *Buy Now* (Immediate impact & risk assessment)
  2. *Wait for Next Payday / Allowance*
  3. *Save Incrementally* (Weekly target plan)
- **Actions:** Save to Wishlist or directly convert to an actual expense in the ledger.

### 7. Advanced Savings Goals Studio
- Multi-goal tracking (e.g., MacBook M3 Pro, Emergency Runway, Hackathon Trip).
- **Interactive Trade-offs Simulator:** Sliders adjust monthly allocations across goals; projected completion dates dynamically recalculate in real time.
- **Milestone Deposit:** Log deposits to goals with celebratory confetti animation (`canvas-confetti`).

### 8. Budgets & Smart Suggestions
- Category budget progress bars with real-time utilization status (*Healthy*, *Approaching Limit*, *Over Budget*).
- **Smart Suggestions Generator:** One-click algorithm calculating balanced budgets:
  - *Campus:* 35% Food/Canteen, 15% Books, 10% Transit, 15% Outings, 5% Subs, 20% Savings.
  - *Pro (50/30/20 Rule):* 30% Housing, 15% Groceries, 8% Utilities, 22% Investments, 8% Health, 10% Shopping.

### 9. Transactions Ledger
- Complete searchable and filterable ledger.
- Multi-dimensional filters: Search term, Category, Transaction Type (Income vs Expense), and Sorting.
- Export entire transaction log to CSV.
- Inline edit and delete with confirmation dialogs.

### 10. Reports & Analytics
- Interactive date filtering: **Last 30 Days**, **Quarterly (90 Days)**, and **This Year**.
- Inflow vs Outflow cash retention comparison bar with explicit currency units.
- Category spending distribution with proportional progress bars.
- Plain-language executive takeaway summaries.

### 11. Single-Currency Accounts
- Each account uses one currency selected before onboarding amounts or records are saved. Values are not converted; a saved account cannot change currency.
- Supported account currencies:
  - **INR (₹)** — Indian Rupee
  - **USD ($)** — US Dollar
  - **EUR (€)** — Euro
  - **GBP (£)** — British Pound

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend:** Node.js, Express 5, TypeScript (`tsx`)
- **Database:** SQLite with WAL mode (`better-sqlite3`)
- **Authentication:** `bcryptjs` password hashing, `express-session` with HTTP-only cookies
- **Core workflows:** Track transactions, budgets, and goals through the Pennywise interface.

### Deployment limits

- Set `SESSION_SECRET` to a random value of at least 32 characters, `NODE_ENV=production`, and `TRUSTED_ORIGINS` to exact comma-separated frontend origins. Production startup fails if these are missing.
- Set `DATABASE_PATH` to a file on a persistent writable volume. By default the DB is `data/pennywise.db`; mounting `/data` alone does not move it. SQLite on an ephemeral filesystem loses data when the host replaces the instance.
- The default `express-session` MemoryStore is not suitable for production or multiple instances. Use a persistent session store before accepting real users.
- The app has not received a professional security review. Use fictional data for a hackathon demo.
- JSON export includes profile, transactions, budgets, goals, and calendar events. It is not restorable and excludes authentication data and saved purchase analyses.

---

## 📦 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend API Server
In your first terminal:
```bash
npm run server
```
The Express backend starts at `http://localhost:5000` with the SQLite database initialized at `data/pennywise.db`.

### 3. Start the Frontend Application
In your second terminal:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. (Vite automatically proxies `/api` calls to `http://localhost:5000`).

### 4. Build for Production
```bash
npm run build
```

### Tests

Run `npm run test:calculations` for the focused calculation checks. `npm test` writes fictional accounts, transactions, and budgets to the backend configured by `API_URL`; only run it while that backend uses a disposable `DATABASE_PATH`, with `PENNYWISE_ALLOW_E2E_WRITES=1` set. It is not safe to run against a personal or production database.

---

## 🎯 Suggested Live Demo Walkthrough for Evaluators & Judges

1. **Public Landing Page:**
   - Open `http://localhost:5173` to view the brand headline: *"Your money, made visual."*
   - Explore the interactive mini Money Orbit preview with sample data labeling.

2. **Explore Sample Datasets (Demo Mode):**
   - Click **"Explore Demo"** to inspect pre-populated datasets.
   - Switch between **Campus Mode** (INR ₹, daily allowance pacing) and **Pro Mode** (USD $, executive runway).
   - Notice the prominent demo banner indicating that sample changes do not affect personal databases.
   - Click **"Exit Demo"** in the banner or header to return to the landing page.

3. **User Registration & Isolated Onboarding:**
   - Click **"Get Started"** on the landing page.
   - Enter your name, email, password, and choose Campus or Pro mode.
   - Complete the 4-step onboarding wizard by entering your starting liquid balance, monthly income, and optional goals.
   - Arrive at a pristine personal dashboard tailored exclusively to your numbers.

4. **Interactive Money Orbit & Calculations:**
   - Hover over category arcs on the dashboard to inspect spend percentages; hover over satellites to inspect goals.
   - Click the Info icon next to **Available to Spend** to see the transparent audit calculation:
     $$\text{Available} = \text{Balance} - \text{Bills} - \text{Goals}$$

5. **"Can I Afford This?" Purchase Analyzer:**
   - Click **"Can I Afford This?"** in the top navigation or sidebar.
   - Test a purchase (e.g., ₹8,500 or $350) and observe the 0–100 score, budget impact, and 3-scenario planner.
   - Click **"Log as Expense"** to immediately debit the amount from your ledger and observe Available-to-Spend update.

6. **Savings Goals Studio & Confetti:**
   - Navigate to **Savings Goals**.
   - Drag allocation sliders to simulate trade-offs between competing milestones.
   - Click **"Deposit"** to add funds and celebrate milestone completion with confetti!

7. **Multi-User Data Isolation Verification:**
   - Log out of your account.
   - Create a second account with a different email.
   - Observe that the second account starts in a clean zero state with 0 transactions, 0 budgets, and zero traces of the first user's financial data.
