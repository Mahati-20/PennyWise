# Pennywise — Premium Personal Finance Companion

> **"Make your money make sense."**  
> A high-fidelity, interactive, responsive personal finance web application built for college students (**Campus Mode**) and working professionals (**Pro Mode**).

---

## 🌟 Product Vision

Unlike ordinary expense trackers that merely record where money went, **Pennywise** combines luminous fintech visualizations with useful decision-making tools. Users understand what they can afford today, what commitments they need to protect, and how daily spending decisions trade off against long-term milestones.

### Dual Experience Modes
1. **Campus Mode (College Students):** Vibrant, friendly, and encouraging. Focuses on pocket money/stipends, canteen meals, books, transit, hostel amenities, and safe daily spending allowances.
2. **Pro Mode (Working Professionals):** Executive luxury, restrained elegance, and high data density. Focuses on salary cash flow, fixed commitments, 6-month emergency runways, and multi-goal wealth allocation.

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

## 🚀 Key Features

### 1. Main Financial Dashboard & Balance Hero
- **Total Liquid Balance vs. Available-to-Spend:** Distinct concepts.
  $$\text{Available to Spend} = \text{Liquid Balance} - \text{Upcoming Committed Bills} - \text{Reserved Monthly Goal Contributions}$$
- **Mode-Specific Intelligence:**
  - *Campus:* Safe Daily Spending Allowance ($\text{Available} / \text{Days Remaining}$) and semester budget pacing.
  - *Pro:* Monthly cash flow ratio and emergency runway (months of living expenses covered).
- **Interactive Tooltip:** Step-by-step audit of the calculation math.

### 2. Interactive Money Orbit *(Signature Visual Differentiator)*
- High-fidelity concentric SVG visualization:
  - **Center Core:** Net balance or available funds with glow and interactive toggle.
  - **Inner Ring:** Category spending arcs with hover tooltips, percentages, and semantic color-coding.
  - **Middle Ring:** Monthly budget utilization track.
  - **Outer Orbit:** Interactive satellite nodes for active savings goals with progress halos.
- Includes accessible data table fallback and reduced-motion support.

### 3. "Can I Afford This?" Purchase Analyzer *(Signature Functional Feature)*
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

### 4. Advanced Savings Goals Studio
- Multi-goal tracking (e.g., MacBook M3 Pro, Emergency Runway, Hackathon Trip).
- **Interactive Trade-offs Simulator:** Sliders adjust monthly allocations across goals; projected completion dates dynamically recalculate in real time.
- **Milestone Deposit:** Log deposits to goals with celebratory confetti animation (`canvas-confetti`).

### 5. Budgets & Smart Suggestions
- Category budget progress bars with real-time utilization status (*Healthy*, *Approaching Limit*, *Over Budget*).
- **Smart Suggestions Generator:** One-click algorithm calculating balanced budgets:
  - *Campus:* 35% Food/Canteen, 15% Books, 10% Transit, 15% Outings, 20% Savings.
  - *Pro (50/30/20 Rule):* 30% Housing, 15% Groceries, 8% Utilities, 15% Dining, 22% Investments.

### 6. Transactions Ledger
- Complete searchable and filterable ledger.
- Multi-dimensional filters: Search term, Category, Transaction Type (Income vs Expense), and Sorting.
- Export entire transaction log to CSV.
- Inline edit and delete with confirmation dialogs.

### 7. Proactive Money Coach & Notification Center
- Deterministic, rules-based financial heuristics (zero hallucinating AI dependencies).
- Real-time warnings when budgets cross 75% or 100%, daily allowance pacing alerts, and milestone celebrations.
- Top header notification bell with unread counter and dismissible alerts.

### 8. Financial Calendar
- Monthly calendar grid marking scheduled bills, recurring subscriptions, and paydays.
- Day inspector displaying scheduled commitments and historical transactions on that date.
- Commitment scheduler with paid/unpaid status toggles.

### 9. Reports & Analytics
- Inflow vs. Outflow cash retention comparison.
- Category spending distribution with proportional progress bars.
- Average daily burn rate and savings rate percentage.

### 10. Multi-Currency Engine
- Global currency switcher in top header supporting:
  - **INR (₹)** — Indian Rupee
  - **USD ($)** — US Dollar
  - **EUR (€)** — Euro
  - **GBP (£)** — British Pound
- Locale-aware number formatting and conversion rates.

### 11. Settings & Transparency Center
- Audit formulas for Available-to-Spend, Affordability scoring, and goal projections.
- Demo data management: 1-click reset to Campus or Pro sample data.
- Full account backup export (JSON).
- 100% client-side privacy guarantee.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS (Dark luxury theme)
- **Icons:** Lucide React
- **Animations & Effects:** Canvas Confetti, SVG drop-shadows, CSS backdrop-filter
- **Persistence:** LocalStorage with structured hydration

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation
```bash
# Clone or navigate to the project directory
cd PennyWise

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Building for Production
```bash
npm run build
npm run preview
```

---

## 🎯 Suggested Live Demo Walkthrough for Judges

1. **Welcome Screen:** Launch the app, observe the brand identity and dual cards: *Campus* vs. *Pro*.
2. **Switch Persona:** Toggle between Campus Mode (INR ₹, daily allowance pacing) and Pro Mode (USD $, executive runway).
3. **Interactive Money Orbit:** Hover over category arcs on the dashboard to inspect spend percentages; hover over satellites to inspect goals. Toggle between "Available" and "Net Balance".
4. **Signature Purchase Analyzer:** Click **"Can I Afford This?"** in the sidebar. Enter a proposed purchase (e.g., ₹12,000 or $450) and observe the 0–100 score, budget impact, and 3-scenario planner.
5. **Add a Transaction:** Click **"+ Add Transaction"** to log an expense; see the Available-to-Spend balance, budgets, and Orbit update immediately.
6. **Savings Goals Studio:** Navigate to **Savings Goals**. Drag the monthly contribution sliders to simulate allocation trade-offs; click **"Deposit"** to celebrate a milestone with confetti!
7. **Budgets:** Click **"Generate Smart Suggestions"** in Budgets to observe the automated allocation algorithm.
8. **Calendar & Reports:** Check upcoming bills on the Financial Calendar and analyze cash flow retention in Reports.
9. **Transparency Center:** View Settings to review the transparent calculation math and export your data as JSON.
