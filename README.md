# FIXMYSTREET — Report. Track. Resolve.

FixMyStreet is a civic issue reporting and resolution platform that connects citizens with municipal authorities to solve public infrastructure issues such as potholes, garbage accumulation, blocked drains, water leakage, broken streetlights, and damaged roads.

---

## 1. Project Overview
FixMyStreet bridges the transparency and accountability gap between citizens and municipal work crews. It provides:
- A 1-minute issue reporting workflow with camera capture and AI vision categorization
- Instant local duplicate complaint detection using Haversine geo-proximity and text similarity
- An explainable 0–100 smart priority scoring engine to triage municipal work orders
- Citizen verification of repairs with before/after photographic evidence
- An interactive public map powered by Leaflet & OpenStreetMap (zero paid APIs)

---

## 2. Problem Statement
In most cities, reporting civic problems is fragmented across disparate helplines with no photographic evidence, no duplicate prevention, and zero accountability. Municipal authorities struggle to prioritize emergency repairs, while citizens have no way to verify whether an issue was truly resolved or simply marked closed in an internal database.

FixMyStreet addresses this with an end-to-end verified lifecycle:
```
Citizen Reports -> AI Categorizes -> Geo & Duplicate Check -> Smart Priority Engine -> 
Authority Assigns Department -> In Progress -> Repair Evidence Uploaded -> 
Citizen Inspects & Verifies -> Public Map Updated
```

---

## 3. Five Core Features

### Feature 1: AI-Based Issue Detection
- Analyzes uploaded photos to classify problems (Pothole, Garbage Overflow, Blocked Drain, Water Leakage, Broken Streetlight, Damaged Road/Sidewalk).
- Returns category, confidence score (e.g. 94%), suggested severity, and reasoning.
- Gives citizens the option to `[Use Result]` or `[Change Category]`.
- Built with a server-side Gemini vision integration (`@google/genai`) and an automatic zero-cost local heuristic fallback.

### Feature 2: Duplicate Complaint Detection
- Evaluates incoming reports against active nearby issues.
- Calculates geographic distance using the Haversine formula, category match, and description similarity.
- Displays a non-blocking warning modal (e.g. *"Similar complaint FM-1024 found 37m away with 5 reports"*).
- Citizens can choose `[View Existing Complaint]` or `[Report Anyway]`.

### Feature 3: Smart Priority Score (0–100)
- Rule-based, explainable civic intelligence:
  - **Severity (40%)**: Critical (40 pts), High (30 pts), Medium (20 pts), Low (10 pts)
  - **Related Citizen Reports (25%)**: 1 report (5 pts) to 6+ reports (25 pts)
  - **Estimated Citizens Affected (15%)**: Local lane (<50) to main artery (200+)
  - **Location Importance (10%)**: Arterial road (+5 pts), School/Hospital zone (+5 pts)
  - **Issue Age (10%)**: Days unattended (up to 10 pts)
- Categorized into: `CRITICAL` (80–100), `HIGH` (60–79), `MEDIUM` (40–59), `LOW` (0–39).

### Feature 4: Resolution Verification
- Authorities must upload after-repair photographic proof and work notes to mark an issue `RESOLVED`.
- The citizen inspects a side-by-side Before vs After comparison and answers: *"Was this issue actually fixed?"*
- `[YES, IT IS FIXED]` -> status becomes `CITIZEN_VERIFIED`
- `[NO, STILL EXISTS]` -> reopens complaint to `IN_PROGRESS` with status `VERIFICATION_FAILED`.

### Feature 5: Public Issue Map
- Interactive map rendered using Leaflet and OpenStreetMap.
- Color-coded pins: Red (Critical), Orange (High), Amber (Medium), Slate (Low), Green (Resolved).
- Popup cards show Complaint ID, Category, Priority, Status, and Reports count.
- **Privacy Guaranteed**: Strictly excludes personal citizen names or contact info.

---

## 4. Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend API**: Node.js, Express, tsx, esbuild
- **Mapping**: Leaflet, OpenStreetMap
- **Icons**: Lucide React
- **AI Vision**: `@google/genai` (server-side, with built-in heuristic fallback)
- **Data Persistence**: Browser `localStorage` with reactive cross-tab events and realistic civic seed data

---

## 5. Free / Open-Source Cost Policy
- Zero paid API requirements.
- Uses Leaflet + OpenStreetMap (no Google Maps API billing).
- Uses rule-based local calculations for duplicates and priority.
- If `GEMINI_API_KEY` is not provided, the system automatically uses the internal smart heuristic analyzer without breaking or crashing.

---

## 6. Folder Structure
```
FixMyStreet/
├── server.ts                       # Express backend server with /api/analyze-image & Vite middleware
├── index.html                      # Entry HTML with Leaflet CSS and SEO tags
├── metadata.json                   # Applet configuration and permissions
├── package.json                    # Scripts and dependencies
├── .env.example                    # Sample environment variables
├── src/
│   ├── main.tsx                    # React client entrypoint
│   ├── App.tsx                     # Main application layout, state, and router
│   ├── types.ts                    # TypeScript types (Issue, Category, Status, User)
│   ├── index.css                   # Tailwind CSS styling
│   ├── data/
│   │   └── seedData.ts             # 20+ realistic Indian civic seed complaints
│   ├── services/
│   │   ├── aiService.ts            # AI vision client caller with fallback
│   │   └── storage.ts              # LocalStorage persistence & role managers
│   ├── utils/
│   │   ├── categoryUtils.ts        # Category-department mapping & badge colors
│   │   ├── priorityEngine.ts       # Explainable 5-factor priority calculator
│   │   └── duplicateDetector.ts    # Haversine distance & text similarity engine
│   ├── components/
│   │   ├── Navbar.tsx              # Civic header with role switcher & demo launcher
│   │   ├── StatusBadge.tsx         # Status pill with color indicators
│   │   ├── PriorityBadge.tsx       # Priority score pill
│   │   ├── Timeline.tsx            # Status progression lifecycle
│   │   ├── DuplicateWarningModal.tsx # Feature 2 duplicate warning modal
│   │   ├── ResolutionVerificationModal.tsx # Feature 4 Before/After modal
│   │   └── DemoScenarioGuide.tsx   # 21-step interactive evaluator walkthrough
│   └── pages/
│       ├── LandingPage.tsx         # Modern civic landing overview
│       ├── ReportIssuePage.tsx     # 1-minute 5-step report flow
│       ├── PublicMapPage.tsx       # Leaflet OpenStreetMap page
│       ├── CitizenDashboard.tsx    # Citizen reports & verification prompts
│       ├── AuthorityDashboard.tsx  # Authority priority queue & department triage
│       └── IssueDetailPage.tsx     # Comprehensive complaint & resolution audit
```

---

## 7. Local Setup & How to Run

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### Installation
```bash
git clone https://github.com/your-username/fixmystreet.git
cd fixmystreet
npm install
```

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add `GEMINI_API_KEY="your_key"` to enable real Gemini AI vision. If left blank, the built-in smart heuristic analyzer runs automatically).*

### Running in Development
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Building for Production
```bash
npm run build
npm start
```

---

## 8. Vercel Deployment
To deploy on Vercel:
1. Push your repository to GitHub.
2. In Vercel, import the repository.
3. Set Framework Preset: **Vite**.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. (Optional) Add `GEMINI_API_KEY` in Vercel Environment Variables.
7. Click **Deploy**.

---

## 9. 21-Step Demonstration Scenario (Section 34)
The application includes a built-in floating **21-Step Demo Guide** (click "Demo Guide" in the top bar):
1. Citizen logs in.
2. Clicks "Report an Issue".
3. Uploads or selects pothole photo.
4. AI analyzes: Pothole, 94% confidence, High severity.
5. Location captured near Indiranagar 100ft Road.
6. System checks duplicates against active complaints.
7. Displays: *"Similar complaint FM-1024 found 37m away"*.
8. Citizen clicks *"Report Anyway"*.
9. Priority engine scores 87/100 (CRITICAL).
10. Complaint submitted (FM-1042).
11. Switch to Municipal Authority dashboard.
12. Authority opens FM-1042 in priority queue.
13. Assigns **Roads Department**.
14. Changes status: Reported -> Assigned -> In Progress.
15. Authority attaches after-repair photo & work notes.
16. Authority marks as **Resolved**.
17. Switch back to Citizen; prompt alerts resolution.
18. Citizen reviews Before vs After images.
19. Citizen clicks **[YES, IT IS FIXED]**.
20. Status becomes **CITIZEN VERIFIED**.
21. Public OpenStreetMap marker updates to green verified pin.
