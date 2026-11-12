# ARCHITECTURE ACCEPTANCE & SYSTEM COMPREHENSION REPORT - V-EVAL WEB CLIENT

---

## 1. Executive Summary & Purpose

The **V-Eval Web Client** (`v-eval-web-client`) serves as the primary Single Page Application (SPA) frontend interface for the V-Eval educational ecosystem. It delivers a personalized, adaptive learning experience tailored for the Vietnamese National High School Assessment (V-ACT 2026), empowering students, teachers, and academic directors through modern interactive visualizations, real-time AI guidance, and automated assessment diagnostics.

---

## 2. Technical Stack & Frontend Architecture

| Component | Specification | Description |
| :--- | :--- | :--- |
| **Framework** | React 19 (`^19.2.8`) | Latest functional component model, hooks, and Concurrent React architecture |
| **Build Tool** | Vite 8 (`^8.3.0`) | Lightning-fast HMR and Rollup/Oxc optimized production bundle packaging |
| **Styling** | TailwindCSS v4 (`^4.3.3`) | Modern utility-first CSS engine with Vite plugin integration |
| **Icons & UI** | Lucide React (`^1.47.0`), Canvas Confetti | Accessible modern icon system and gamification micro-interactions |
| **Data Visualization** | Recharts (`^3.10.1`) | Responsive Radar and Chart renderings for multi-domain competency display |
| **Motion** | Framer Motion (`^13.4.0`) | Smooth modal transitions and page state choreography |
| **Linter** | Oxlint (`^1.81.0`) | High-performance Rust-based linter ensuring clean code standards |

---

## 3. Directory Layout & Modular Structure

```text
V-Eval-Web_Client/
├── .gitignore               # Ignored build assets, dist/, node_modules/
├── .oxlintrc.json           # Oxlint rules and environment specifications
├── Dockerfile               # Production multi-stage build (Node 22 + Nginx Alpine)
├── nginx.conf               # SPA routing fallback (try_files index.html)
├── package.json             # Manifest, dependencies, and build scripts
├── vite.config.js           # Vite configuration with React & Tailwind plugins
├── Scripts/
│   └── push.bat             # Standalone interactive Git sync and push utility
├── docs/
│   ├── daily.md             # Chronological development log
│   ├── process.md           # Architecture breakdown & progress matrix
│   └── architecture_acceptance.md # Technical acceptance report
└── src/
    ├── App.jsx              # Core application orchestrator, routing & modals
    ├── main.jsx             # React DOM root entry point
    ├── index.css            # Base stylesheet & font definitions
    ├── data/
    │   └── mockData.js      # System-calibrated mock database
    └── components/
        ├── auth/            # Multi-role authentication views
        ├── dashboard/       # Student and teacher metrics, milestone cards, tutor
        ├── landing/         # Public promotional & pedagogical landing page
        ├── layout/          # Responsive navigation bar and sidebar
        └── modals/          # Diagnostic, ZPD adaptive quiz, and Radar modals
```

---

## 4. Key Functional Modules & Pedagogical Alignment

### 4.1. Flow 1: Diagnostic Assessment (IRT 2PL Model & 30-Question Real Test Page)
- Implemented in `DiagnosticAssessmentPage.jsx` and quick modal `DiagnosticTestModal.jsx`.
- **Dual Entry Architecture (Guest Mode vs. Logged-in Mode)**:
  - *Guest Mode (Unauthenticated)*: Triggered from Public Landing Page via quick entry modal (`autoStart: true`), directly entering the proctored 30-question diagnostic test without requiring registration or exposing student dashboard.
  - *Logged-in Mode (Authenticated)*: Accessed either via the **"Thi thử ngay" Top Header button** (adjacent to Architecture 3 Q&A in `Navbar.jsx`) or Dashboard Sidebar (`Khảo thí & Chẩn đoán - Flow 1`). Triggering the Top Header button opens the standalone **Exam Detail & Passcode Verification Modal** (`ExamPasscodeModal.jsx`), showing 30 questions / 45-min specs and prefilled code `VACT2026`. Confirming passcode immediately launches the proctored test in full-screen mode, hiding navigation chrome.
- Fetches real 30-question diagnostic exam from Content Service (`/api/content/diagnostic-test` or `getExamDetail`) and AI Engine.
- Features in-exam question navigator, 45-minute timer, flagging, adaptive 2-column split view for reading passages, and embedded AI Socratic Tutor guidance.
- Evaluates student ability across 5 core evaluation domains (Mathematics, Logic Reasoning, Language Arts, Natural Sciences, Social Sciences).
- Employs 2-Parameter Logistic (IRT 2PL) probability scoring and Bayesian Knowledge Tracing initial mastery estimation `P(L_0)`.
- Generates 5-axis Recharts Radar Chart and pedagogically calibrated Socratic AI Commentary.
- Features Azota proctoring with Fullscreen mode, Web Audio warning chime, and secure room code entry (`VACT2026`).
- Zero Native Dialogs: Replaced native browser `window.alert` and `window.confirm` with dedicated React overlay modals (`showPopupAlert`, `showExitConfirmModal`) to eliminate window blur triggers and tab-switch violation miscounts.
- **Streamlined Diagnostic Hub & Historical Attempts Subsystem (`DiagnosticAssessmentPage.jsx`, `diagnosticData.js`)**:
  - *Unified Dual-Mode Interface (Zero Tab Clutter)*:
    1. **Historical Attempts List (Overview Mode)**: Displays longitudinal performance tracking with 4 KPI summary cards (Total Tests, Highest Score, Peak `` `\theta` ``, Average Duration), an IRT Growth Trend Area Chart visualising `` `\theta` `` progression against benchmark (`` `\theta \ge +0.80` ``), and an interactive Test Attempts Table.
    2. **Attempt Detail View (Deep-Dive Psychometrics Mode)**: Clicking any attempt immediately loads its comprehensive diagnostic report:
       - Top navigation bar with *← Quay Lại Danh Sách Lần Thi* button and attempt metadata.
       - **5-Axis Competency Radar Chart**: Compares student ability against V-ACT 900+ target standard across Mathematics, Logic, Language Arts, Natural Sciences, and Social Sciences.
       - **Domain Accuracy Bar Chart**: Measures accuracy percentage and correct question count per subject area.
       - **Pacing Speedometer Grid**: 4 metric cards measuring question response time distribution (<25s rapid reflex, 25-90s standard pacing, >90s time-sink traps, and overall average time per item).
       - **AI Socratic Diagnostic Synthesis**: Automated pedagogical qualitative assessment, identifying strengths, critical gaps, and tailored recommendations.
       - **30-Question Interactive Review**: Complete post-test review with filterable states (All, Correct, Incorrect, Flagged), showing options, correct answers, and KaTeX-rendered step-by-step solutions.
  - *Data Persistence Layer*: Seamless local persistence via `localStorage` keys `veval_exam_history` and `veval_latest_diagnostic_result`, automatically appending new attempts upon test submission and seamlessly opening the new attempt's detail view.

### 4.2. Dedicated Exam Catalog & Testing Hub: Question Bank (`QuestionBankPage.jsx`)
- Implemented in `src/components/question_bank/QuestionBankPage.jsx`, accessible directly via Sidebar item *"Ngân hàng đề & Thi thử"*.
- Eliminates functional redundancy by decoupling the test catalog and room entry from Flow 1.
- Features V-ACT 2026 Examination Lobby, 5 Core Domains strip, room code quick search (`VACT2026`), category filters (All, Diagnostic, Mock 120, Skill Refinement), and exam detail cards with Azota proctoring modal and passcode verification.

### 4.2. Flow 2: Dynamic Learning Roadmap & Subject Mastery (3-Stage Placement & Chapter-Lesson Architecture)
- Visualized in `HeroBanner.jsx`, `MilestoneCard.jsx`, `RoadmapLearningPage.jsx`, and `roadmapSubjectsData.js`.
- **9-Subject Diagnostic Stage Placement Architecture**:
  - Dynamically classifies all 9 V-ACT subjects (Mathematics, Logic & Data Analysis, Vietnamese, English, Physics, Chemistry, Biology, History, Geography) into 3 optimal stages based on individual diagnostic test scores:
    1. *Stage 1 (Foundation - Score < 50%)*: Remedial core textbooks and essential definitions (e.g. Mathematics 42/100, Physics 38/100, Biology 46/100).
    2. *Stage 2 (Acceleration - Score 50% - 74%)*: Problem-solving heuristics and common traps (e.g. Vietnamese 68/100, Chemistry 70/100, History 72/100).
    3. *Stage 3 (Mastery 900+ - Score >= 75%)*: Advanced synthesis, rapid pacing (<1.5 min/item), and top 5% discrimination items (e.g. Logic 90/100, English 84/100, Geography 80/100).
- **Chapter & Lesson Hierarchical Navigation**:
  - Collapsible left accordion displaying Chapters and Lessons per subject with completion states.
- **Quad-Resource Pedagogical Workspace (4 Interactive Tabs)**:
  - *Tab 1 (Lecture Video)*: Integrated responsive YouTube player, watch time telemetry, and fullscreen toggle.
  - *Tab 2 (Textbook Knowledge & VNU-HCM Exam Traps)*: Panoramic tri-block view (Block 1: SGK Theorems & Formulas, Block 2: Step-by-Step Algorithm & Trap Warnings, Block 3: Sample Standard Problem with Detailed Solutions).
  - *Tab 3 (Interactive Live Q&A)*: Direct Google Meet room integration, weekly scheduled sessions, lecturer profile, and attendance tracking.
  - *Tab 4 (Milestone Quiz)*: irt-calibrated practice items with automated scoring and confetti rewards.
- Progressive stage unlocking based on Finite State Machine criteria: Lecture Video completion (`>= 80%`) followed by the Milestone Quiz (`>= 60%`) before unlocking subsequent graph nodes.

### 4.3. Flow 3: Adaptive Practice & Remediation (ZPD & BKT)
- Executed in `AdaptiveQuizModal.jsx`.
- Dynamically delivers question items targeted within the Zone of Proximal Development (`ZPD \in [0.60, 0.75]`).
- Updates student mastery probability `P(L_t)` using Bayesian Knowledge Tracing transitions.

### 4.4. Flow 4: AI Socratic Tutor Widget
- Embedded in `AISocraticTutorWidget.jsx`.
- Simulates step-by-step Socratic pedagogy, guiding learners with heuristic questions rather than giving immediate answers.

### 4.5. Architecture Integration: API Gateway Client Layer (`src/services/`)
- Centralized Axios client (`apiClient.js`) routing all traffic through V-Eval YARP API Gateway (`http://localhost:5212`).
- JWT authentication management with automatic request decoration and silent refresh handling via `X-Token-Refresh-Required` Gateway response header.
- Clean separation of microservice concerns: `authService.js` (Identity), `contentService.js` (Content), `practiceService.js` (Practice), and `aiService.js` (AI Engine).
- **AI Engine Multi-Platform Integration (`aiService.js`)**:
  - Exam OCR & Background Jobs: `uploadPdfExam()`, `getExamJobStatus()`, `getViewExamUrl()`.
  - Textbook Ingestion & Vector Chunks (250MB): `uploadTextbookPdf()`, `getActiveTextbookJob()`, `getTextbookCheckpoint()`, `getTextbookChunks()`, `saveTextbookChunksToDb()`, `pingVisionModels()`.
  - Exam Generator & Psychometrics: `generateExam()`, `analyzeDiagnosticSubmission()`, `getDiagnosticConfig()`.
  - Conversational Socratic AI Tutor: `askSocraticTutor()`, `askSocraticTutorStream()` (Server-Sent Events streaming token-by-token for typewriter UX).

### 4.6. KaTeX Mathematical Formula Rendering Engine (`src/components/common/MathText.jsx`)
- Full KaTeX integration via `katex` package and `katex.min.css`.
- Intelligent normalization heuristic (`normalizeMathString`):
  - Detects explicit math delimiters (`$$...$$`, `$...$`, `\[...\]`, `\(...\)`).
  - Automatically encloses mathematical intervals `(-\infty; +\infty)`, algebraic functions (`y = x^4 + 2x^2`, `y = \frac{2x - 1}{x + 1}`), derivatives, and LaTeX tags without interfering with Vietnamese typography.
  - Used uniformly across exam questions, multiple choice options (A, B, C, D), and Socratic AI Tutor explanations.

### 4.7. Intuitive User-Centric Navigation & Nomenclature Architecture (`src/components/layout/Sidebar.jsx`)
- Re-architected system navigation menu items to eliminate confusing academic and technical acronyms (DAG, ZPD, BKT, Socratic) in favor of immediately self-explanatory, user-centric labels:
  - `dashboard`: **"Tổng quan học tập"** (replacing "Dashboard (Tổng quan)").
  - `diagnostic` (Flow 1): **"Thi đánh giá đầu vào"** (replacing "Khảo thí & Chẩn đoán").
  - `roadmap` (Flow 2): **"Lộ trình học cá nhân"** (replacing "Lộ trình học (DAG)").
  - `adaptive` (Flow 3): **"Luyện tập thích ứng"** (replacing "Luyện tập ZPD").
  - `ai_tutor` (Flow 4): **"Gia sư AI gợi mở"** (replacing "AI Socratic Tutor").
  - `live_qa`: **"Lớp học & Hỏi đáp"** (replacing "Lớp học & Live Q&A").
  - `analytics` (Flow 5 & 6): **"Báo cáo & Dự báo điểm"** (replacing "Báo cáo & Dự báo").
- Re-sectioned the Sidebar hierarchy into two intuitive pedagogical domains: **"Học tập & Luyện thi"** and **"Hỗ trợ & Phân tích"**.
- Synchronized metric cards and modal headers in `MetricsGrid.jsx`, `DiagnosticAssessmentPage.jsx`, and `AdaptiveQuizModal.jsx` for consistent, accessible terminology throughout the application.

### 4.8. Comprehensive Account Settings, Parent Link & Digital Academic Transcript (`src/components/settings/AccountSettingsPage.jsx`)
- Implemented a unified 5-tab Account Management view for students, teachers, and coordinators:
  1. **Personal Identity & Profile (`Tab: profile`)**:
     - Full Name (`fullName`), Phone Number (`phone`), Verified Email badge, Campus Affiliation (`campusId`), System Role, and Unique User ID.
     - Interactive 6-preset 3D student avatar picker + custom URL override.
     - Real-time client session synchronization via `tokenStorage` and `onUpdateUser` dispatching immediate updates to `Navbar` and `HeroBanner`.
  2. **Academic & IRT Competency Goals (`Tab: academic`)**:
     - Interactive V-ACT 1200-point target score range slider (`targetScore`), dynamically annotated with university benchmark thresholds (750+ Natural Sciences/Pedagogy, 850+ Polytechnic/Economics, 950+ Medicine/Top 1%, 1050+ Valedictorian).
     - Target University / Major selection, High School name, Target Exam Date, and daily self-study hours allocation (`studyHoursDay`).
     - Real-time IRT psychometrics status card displaying current student ability vector (Theta 0 = `+0.65`, 18/28 mastered skills).
  3. **Parent Link & Digital Academic Transcript (`Tab: family`)**:
     - **Student Connection VIP Card (`StudentLinkCode`)**: Dark glassmorphic card displaying unique student link identifier (`VEVAL-STU-88902`) with 1-click clipboard copy, real-time live link badge, and on-demand code regeneration.
     - **Designated Guardian Representative**: Form selector supporting `Cha (Bố)`, `Mẹ`, or `Người giám hộ` with full name, contact phone (SMS/Zalo attendance alerts), and automatic progress report email delivery.
     - **Digital Academic Transcript (VNU-HCM 2026 E-Transcript)**: Official standardized grade sheet layout breaking down the 3 core exam sections (Language 310/400, Math & Logic 255/300, Science Problem Solving 220/500), current estimate `785/1200`, study diligence metrics (12-day streak, 48.5h study time), pedagogical evaluation by Head Teacher (Thầy Phạm Duy), and actionable AI diagnostic insights with PDF print and email forwarding capabilities.
  4. **Security & Password Management (`Tab: security`)**:
     - Current Password, New Password, Confirm New Password with toggleable visibility.
     - Dynamic 4-tier Password Strength Meter with strict validation rules (min 8 chars, uppercase, lowercase, numeric).
     - Active Session Inspector (Web Browser on Windows, YARP Gateway IP, HMAC-SHA256 JWT validation) and global session revocation action.
  5. **Learning & AI Preferences (`Tab: preferences`)**:
     - AI Socratic Guidance Mode toggle (Flow 4 - conceptual scaffolding vs. direct answer).
     - Daily study reminder scheduler with custom time picker (e.g. `19:30`).
     - Gamified audio feedback & victory confetti triggers.
     - Weekly Monday morning learning progress email report delivery.
- **Backend API Integration (`src/services/authService.js`)**:
  - Direct integration with `V-Eval-Identity_Service`: `PUT /api/v1/users/me/profile`, `GET /api/v1/students/me/profile`, `PUT /api/v1/students/me/profile`, `POST /api/v1/users/me/change-password`, `GET /api/v1/students/me/parent`, `PUT /api/v1/students/me/parent`.
  - Robust offline / disconnected fallback utilizing browser storage ensures zero UI degradation during local testing.

---

## 5. Verification & Acceptance Criteria

1. **Clean Production Build**: Executed `npm run build` with 0 syntax or bundle errors; production artifacts outputted to `dist/` within 5.08s.
2. **Docker Multi-Stage Validation**: `docker compose config` passes with 0 syntax errors across the entire 6-service microservices constellation.
3. **Repository Sync Automation**: Standalone `Scripts/push.bat` and root `Scripts/` correctly recognize `V-Eval-Web_Client` as a first-class project service.
4. **API Gateway Connectivity**: Full client suite structured and verified to consume all microservices endpoints via API Gateway (`:5212`) entry point.




## [22/10/2026] - Diagnostic submission: require backend results

- Removed frontend grading, theta/placement estimation, generated submission IDs, radar benchmarks and commentary fallbacks from submission handling.
- Failed requests or incomplete responses show an error and keep answers in component state; they do not create a result or successful history entry. Answers are not persisted across reloads.
- Backend unchanged. Existing historical/demo displays and backend fallback behavior are outside this change.
- Validation: Vite production build passed; targeted Oxlint passed with existing warnings. No live POST was sent.


### Campus prerequisite correction [22/10/2026]

- Apply changes to the lowercase v-eval-web-client project. Before loading any diagnostic exam, require authentication and fetch student profile plus active campuses.
- Missing/inactive campus opens a selection dialog. Confirm campus through PUT /api/v1/students/me/profile before continuing; failed reads/writes do not enter the exam. Existing valid campus requires no new selection.
- Auto-start begins in setup until prerequisites and exam loading succeed. No mock campus list. Backend unchanged.
- Production build passed; authenticated end-to-end writes not tested.


### Real campus selector [22/10/2026]

- Navbar reads active campuses from GET /api/v1/campuses and the student campus from GET /api/v1/students/me/profile. Removed mock campus list and default campus.
- Student selection is saved through PUT /api/v1/students/me/profile; update selection only after server confirmation. Errors appear beside the selector. Diagnostic setup dispatches a campus update to synchronize Navbar.
- Non-student campus selection is read-only. Backend registration does not accept CampusId; campus remains a profile setup step before the diagnostic exam.
- Live read-only campus API returned CS_THU_DUC and CS_QUAN_10. Vite build passed; targeted lint has warnings and no errors. Authenticated writes were not exercised. Backend unchanged.


### Read-only campus badge [22/10/2026]

- Navbar displays the saved campus name from live API data as plain text. Removed selection control and profile write handler. Missing campus shows an unset state; loading and API errors remain explicit.
- Production build passed. Backend unchanged.


### Mandatory campus prerequisite before all exam entry paths [22/10/2026]

- Removed premature testing transitions from passcode confirmation and retake entry; auto-start no longer requests fullscreen before prerequisite checks.
- Exam loading and timer start happen only after the saved campus is verified against live active campuses. Missing campus requires registration in the pre-exam dialog and confirmed profile save.
- Updated Vietnamese prerequisite messaging. Account registration remains separate; backend unchanged.
- Validation: production build passed. Isolated handler checks passed for missing campus, valid campus, profile API failure and campus API failure; only valid campus loads the exam and enters testing. No authenticated live writes.


### Exam exit control [22/10/2026]

- Removed the in-exam Exit button and its exit confirmation modal/navigation path. Submit remains the normal completion action.
- Added beforeunload warning during testing and submission analysis, cleaned up when leaving those states. Browsers retain control over closing/reloading tabs; no absolute browser exit lock is claimed.
- Production build passed. Backend unchanged.


### Diagnostic report visual refresh [22/10/2026]

- Shared DiagnosticResultSummary renders a dark introductory panel and responsive score, IRT and duration metrics for both historical and newly submitted results. Removed overall placement and hardcoded national percentile claims from these summaries.
- History table removes the overall placement column and play/retry action; keeps the explicit report action. Refined spacing, alternating rows and report button styling.
- History accuracy is derived from correct/total counts, preserving zero; duration no longer defaults to a fabricated 30 minutes. No subject placement is invented and backend placement processing is unchanged.
- Validation: production build and targeted lint passed (existing warnings remain). Visual browser verification not performed.


### Compact report header [22/10/2026]

- Confirmed the shared report summary contains no exam ID label. Redesigned historical report navigation with an accessible compact back button, title and separate submission date.
- Reduced setup top padding, report section gaps and summary hero height; refined gradient and concise report heading. No scoring or API changes.
- Validation: production build passed. Browser visual review not performed.


### Account settings banner redesign [22/10/2026]

- Replaced only the account settings header with AccountSettingsBanner: light blue/white split layout, compact navigation, profile card and existing target score. Removed hardcoded theta and technical JWT badge from this banner.
- Settings tabs, lower cards/forms and save handlers remain unchanged. Responsive single-column layout on small screens.
- Validation: production build and targeted banner lint passed. Browser visual verification not performed.


### Repair incomplete banner undo [22/10/2026]

- Removed the dangling AccountSettingsBanner import and component call after its file was undone. Restored the previous inline header only; lower settings content unchanged.
- Validation: reproduced unresolved import before the fix; production build passed after restoration. Banner redesign reverted.


### Academic save and security accuracy [22/10/2026]

- Academic save requires confirmed targetScore/campusId from the profile API. Errors show failure without local success/cache writes; browser cache failure after confirmed server save does not misreport server failure. Campus changes notify Navbar. Zero target scores load correctly.
- Disabled unsupported university aspiration input and removed its mock default; explicitly marked unavailable for persistence.
- Removed fabricated Chrome/IP/session status and fixed-refresh claims. Logout copy now describes only the current browser session. Real password API flow unchanged; backend token revocation behavior unchanged.
- Validation: production build passed; isolated save checks passed for success, API failure, incomplete response and browser-cache failure. No live profile/password writes.


### Academic save and security accuracy [22/10/2026]

- Include the existing account settings page, Navbar/App entry and authentication service integration required to expose these fixes.
- Academic saves require confirmed target score/campus response; API failures show errors without local success. Unsupported aspirations are disabled.
- Removed mock Chrome/IP/session information; logout describes only the current browser session. Password changes use the existing backend API.
- Build passed; four isolated academic-save checks passed. No live profile/password writes. Backend unchanged; other existing family/preferences demo behavior is outside this fix.


### Tailwind canonical class cleanup [22/10/2026]

- Normalized DiagnosticAssessmentPage classes using the installed Tailwind design system: gradient aliases, flex-shrink alias, z-index and stroke arbitrary values now use canonical utility names. No application logic changes.
- Production build passed. IDE diagnostics cannot be read directly; editor may need to refresh diagnostics.


### Flow 1 to Flow 2 API integration [22/10/2026]

- Main roadmap export now uses ConnectedRoadmapPage with backend diagnostic history/results, existing roadmap retrieval, explicit creation and node detail. No mock imports in the active page. Existing demo source is preserved.
- Request generation uses diagnosticSubmissionId, examDate and studyHoursPerDay; reads actual student identity and completed server submissions. No automatic class clustering or bulk enrollment.
- Contract audit: stages group domains, not per-subject learning phases. Backend does not return subject learningPhase; generation targetScore is fixed at 800. Documented roadmap/class request and response fields in flow_2_api_contract.md.
- Video/quiz execution and individual-subject phase analysis remain pending backend contract/integration; no fabricated results. Backend unchanged.
- Validation: production build passed; targeted lint has warnings only. No authenticated live writes; full browser integration not verified.


### Frontend checkpoint before upstream review [22/10/2026]

- Checkpoint remaining lowercase frontend work: Flow 1 Tailwind aliases, existing roadmap demo/content and menu naming, and real diagnostic-to-roadmap API integration. Main roadmap export uses the connected page; demo source remains preserved.
- Known gaps: no backend per-subject phase response; video/quiz execution not integrated; target score in BE generation fixed at 800. No claim of full Flow 2 completion.
- Validation: latest production build passed; targeted connected-roadmap lint exits successfully with warnings. No authenticated writes or end-to-end browser verification.
- Excludes backend controller edits, uppercase frontend and configuration backups.


### [22/10/2026] - Restore previous roadmap interface

- Restored the roadmap export to the preserved RoadmapLearningPage component at the user's request. The connected API form is no longer the active roadmap screen; its source remains available.
- The restored page uses its existing demo data and interactions. This does not establish a live backend roadmap integration.
- Validation: npm run build passed with a bundle-size warning. Browser appearance has not been visually verified. No commit or push performed for this restoration.


### Role workspaces [22/10/2026]

- Centralized exact Identity role mapping for STUDENT, TEACHER, ACADEMIC_MANAGER, ACADEMIC_DIRECTOR, ADMINISTRATOR and PARENT. Unknown roles have a restricted workspace; multiple roles use administrator/director/manager/teacher/parent/student priority.
- Login and session restoration enter the matching dashboard. Desktop/mobile sidebars share role-specific menus and the existing layout. Student-only dashboard tabs and exam prompts are guarded; role labels are shared across navbar/settings.
- Non-student workspaces have navigation cards and explicit unfinished-feature screens. No operational CRUD or backend authorization was added; existing TeacherDashboardView source remains preserved. Student roadmap restoration remains in place.
- Validation: production build passed with bundle-size warning; targeted lint passed with warnings; isolated role/access matrix passed for six roles, multiple roles, unknown roles and cross-role denial. No browser or live-login verification.

### [02/11/2026] - Frontend role workspace checkpoint

- Checkpoint existing role-specific navigation, login/session routing, shared role labels and student-tab guards for six Identity roles.
- Restore the preserved demo roadmap as the active roadmap screen. Non-student business screens remain placeholders pending API integration.
- Validation on 02/11/2026: npm run build passed with a bundle-size warning; npm run lint exited successfully with warnings. Browser and live-login behavior were not verified in this checkpoint.
### [08/11/2026] - CF1 diagnostic history from server

- Diagnostic history now loads completed submissions for the signed-in student from Practice API; legacy localStorage history/results and sample factories are ignored.
- Added loading, empty, API error/retry and report-loading states. Server ownership and submission IDs are checked; stale responses are discarded.
- Successful submission refreshes server history while showing its confirmed result immediately. Historical reports use the result endpoint; question text/options are unavailable in its DTO and explicitly identified as unavailable.
- Summary DTO lacks theta, so completed result details are fetched for the trend chart. This adds one detail request per completed submission.
- Validation: production build passed with bundle-size warning; targeted oxlint passed with warnings. Browser/live API behavior has not been verified. Timer, submission retry and proctoring fixes remain outside this change.

### [09/11/2026] - CF1 direct diagnostic entry

- The history header New Test button now starts the diagnostic assessment instead of navigating to the question bank; disabled during loading.
- Existing flow checks login and Campus, requests GET /api/content/diagnostic-test, then enters testing after a nonempty exam response. Missing Campus prompts registration before continuing; API failure remains on the error flow.
- Validation: npm run build passed with bundle-size warning. No live API/browser verification. Frontend-only implementation; no backend edits.

### [09/11/2026] - CF1 timestamp-based exam timing

- Added a frontend exam clock retaining milliseconds across question revisits and rounding to integer seconds only for display/payload. Unseen questions send zero instead of the previous fabricated 25-second default.
- Submission sends the actual assessment start timestamp. Countdown derives from an absolute deadline, refreshes on focus/visibility changes, and caps measured question time at the deadline. Timing pauses while submitting; failed submissions retain the original deadline.
- Read-only contract check: existing BE validator accepts TimeSpentSeconds >= 0 and StartedAt is already supported; no backend edits required.
- Validation: npm run build passed with bundle-size warning; three node:test cases passed for revisits/subsecond time, delayed callbacks/deadline, and submission pause/resume. Live browser/API behavior remains unverified. Submission locking, idempotency and reload recovery remain separate work.

### [09/11/2026] - CF1 account isolation

- Removed shared diagnostic-result writes and obsolete guest-result linking on login. Clear legacy diagnostic keys from both browser storages on API client initialization, token updates and logout; preserve unrelated storage.
- Remount diagnostic assessment by user ID so in-progress answers/results do not carry across accounts. Submission responses must match the current owner and login session; ignore late success/error/UI updates after logout, account change or unmount.
- Removed Navbar theta badge reading shared cache and its fabricated default score/admission percentage. Diagnostic history remains server-backed with ownership checks.
- Validation: production build passed with bundle-size warning; five node tests passed (two privacy cleanup tests and three timing regressions). Browser account-switch and live API tests remain unverified. No backend edits; server authorization remains outside this frontend fix.

### [09/11/2026] - CF1 three distinct diagnostic exams

- Show completed distinct diagnostic exam count out of three. Only COMPLETED DIAGNOSTIC submissions contribute; duplicate submissions of one exam do not increase progress.
- Every diagnostic entry reloads owned server history. Block entry at three completed exams or when Content returns an already completed exam; allow a new exam below the limit. Missing exam ID or invalid history blocks entry.
- Existing BE may return the same sole exam; FE reports that no new exam was received rather than allowing a repeat. BE selection of an uncompleted exam and multi-exam theta aggregation remain backend responsibilities, not implemented here.
- Validation: production build passed with bundle-size warning; three eligibility tests passed for new student, distinct count/type/status/limit and invalid ownership/history. Live browser/API not tested. No backend edits.

### [09/11/2026] - CF1 completed-exam dialog polish

- Shortened completed-exam notice to a title and one waiting sentence. Added a three-segment progress indicator with completed count, success icon and explicit return-to-history action.
- Clear selected report before this dialog so closing it returns to the history overview. Added dialog role and accessible title/progress labels.
- Validation: npm run build passed with bundle-size warning. No browser visual verification; frontend only.

### [09/11/2026] - CF1 freeze submission before sending

- Create one immutable submission payload before POST. Retries reuse the original student/exam IDs, start timestamp, answers and per-question durations. Removed fallback exam ID.
- Submission failures stay in the analyzing/submission screen with an explicit retry action; answer changes are guarded once a snapshot exists. Added synchronous in-flight guard against overlapping submission calls; warning count no longer resets on submission.
- Report review uses frozen submitted choices/times. Snapshot resets only when a valid new assessment starts. Payload remains in memory; reload recovery, backend duplicate handling and ambiguous-success reconciliation are separate work. Three-warning pre-submit delay is unchanged.
- Validation: production build passed with bundle-size warning; two snapshot tests passed for immutable retry data and missing IDs. Live browser/network-failure scenarios not verified. No backend changes or new API fields.

### [11/11/2026] - CF1 retry reconciliation, recovery and weak skills

- Before retrying a frozen submission, inspect the owned completed diagnostic history by exam ID and fetch any saved result. A failed history check blocks another POST. Render confirmed server choices/timing when recovering an already saved result.
- Three violations now trigger submission immediately instead of the former 3.5-second delay. Input guards block changes after the threshold or deadline. Warning count remains FE-only because the current API contract has no warning/reason fields.
- Save a versioned draft per student in localStorage, including exam, answers, flags, warning count, original deadline, millisecond timing and frozen payload. On re-entry, check server history before restoring; completed results open their report, expired/violation/frozen drafts stay locked, and active drafts resume with the original deadline. Remove draft after confirmed completion. Storage failure displays a warning; recovery network failure blocks starting another exam until retry.
- Added weak-skill cards with skill/domain, correct count and percentage for both historical and new reports. Question domains now use server domain IDs/names; unavailable domains are explicitly unknown rather than inferred from wording or question order. Existing Campus requirement is preserved.
- Validation: production build passed with bundle-size warning; all 15 node tests passed, including draft ownership/corruption, deadline restoration, saved-result reconciliation, network failures and domain grouping. Targeted oxlint exited successfully with warnings. No live browser/API or visual verification.
- Limits: local drafts apply only to the same browser and can be lost if storage is cleared/disabled; closed-page time reduces remaining time but is not attributed to a question. History lookup is not backend idempotency; an in-flight server request can still race a retry. No backend edits; reliable cross-device drafts, warning persistence and multi-exam aggregation need BE support.

### [12/11/2026] - CF1 confirmed result survives draft cleanup failure

- Added best-effort diagnostic draft removal. Storage deletion exceptions cannot interrupt a confirmed submission result or the recovery path opening an already saved result.
- Cleanup targets only the current student draft. If deletion fails, the next recovery still checks server history before permitting resumed editing or sending.
- Validation: all 7 recovery tests passed, including blocked storage and owner-specific deletion; npm run build passed with bundle-size warning. Browser storage-failure behavior not manually verified. Frontend only; no backend changes.

### [12/11/2026] - CF1 frontend checkpoint before synchronization

- Checkpoint all pending lowercase frontend work: server-backed diagnostic history, account isolation, timestamp timing, three-distinct-exam eligibility, concise progress dialog, frozen submission/retry reconciliation, immediate three-warning submission, per-student draft recovery and weak-skill reporting.
- Confirmed server results remain successful even when draft cleanup fails. Backend source and configuration backups are excluded. Uppercase frontend has pre-existing unresolved conflicts and is not part of this checkpoint.
- Validation: production build passed with bundle-size warning; all 17 node tests passed. Live browser/API and visual behavior not verified. Remaining limits include multi-tab coordination, backend idempotency, warning persistence, and server selection/aggregation of multiple diagnostic exams.
