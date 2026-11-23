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
- **Architectural Decoupling from Curriculum Explorer**:
  - Removed legacy mock redirect `if (activeTab === 'diagnostic' && role !== 'student') return <CurriculumExplorerView />` in `App.jsx`. Navigating to `diagnostic` consistently serves `DiagnosticAssessmentPage` across all roles (Student, Instructor, Admin, and Guest), eliminating unexpected cross-routing to the Curriculum Explorer.
  - Normalized tab labels in `App.jsx` and `Sidebar.jsx` to `Khảo thí & Chẩn đoán`, clearly delineating between the 30-question diagnostic exam and the 5-question pattern reinforcement quizzes in `UnifiedNodeDetailView.jsx`.
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

### 4.9. Pedagogical Textbook Ingestion Architecture & Collapsible OCR Chunks Pipeline (`src/components/curriculum/TextbookIngestView.jsx`)
- **Dual-Layer Ingestion UX (Synthesized Pedagogical Theory First & Collapsed Raw OCR Source)**:
  - *Synthesized Pedagogical Theory View (Primary Top Card)*: Resolves screen clutter by compiling cohesive lesson theory (`activeTheoryContent`) directly from parsed textbook knowledge units via `buildTheoryFromChunks()` or database knowledge items. It renders clean KaTeX formulas, structured definitions, and key principles with inline quick-editing capabilities (`isEditingTheory`) and direct navigation to Pedagogical Studio (`handleOpenStudio`).
  - *Collapsible Raw OCR Extraction Accordion (Secondary Bottom Drawer)*: Wraps all page-by-page OCR extraction chunks (`Trang {page} • Đoạn {chunk}`) inside a dedicated dropdown accordion (`isRawChunksOpen`), initialized to `false` (CLOSED by default). This design ensures the instructor/evaluator is immediately greeted with structured pedagogical insights rather than dozens of fragmented OCR snippets, while preserving full auditability on demand.

### 4.10. Unified 3-Tier Pedagogical Textbook Architecture & Pattern Theory Segregation (`src/components/curriculum/TextbookStandardView.jsx`)
- **Strict Structural Parity with Curriculum Explorer (`UnifiedNodeDetailView.jsx`)**:
  - Re-architected `TextbookStandardView` into 3 standardized pedagogical blocks:
    1. **Block 1 (Core Theory)**: Displays pattern-specific theory recap (`activePatternTheory = activePattern.theoryRecap || activePattern.description`) with seamless fallback to compiled lesson theory, eliminating monolithic theory sharing.
    2. **Block 2 (Detailed Solution Method & Exemplar)**: Introduces dedicated 4-step algorithm and worked example solving procedures with inline editing (`isEditingMethod`) and instant AI generation triggers.
    3. **Block 3 (Textbook Question Bank)**: Features pattern-focused exercise lists with Bloom level filter (L1–L6).
    4. **Block 4 (Raw OCR Source & Page-by-Page Transcripts)**: Collapsible bottom accordion initialized to `false` (CLOSED by default).
  - **Quick Pattern Switcher**: Interactive pills beneath the header allow instant 1-click toggling between patterns (`Dạng 1`, `Dạng 2`, `Dạng 3`), dynamically swapping the theory, method, and question bank for the selected pattern without page reloads.
  - **Fault-Tolerant AI Knowledge Enrichment**: Engineered an intelligent client-side pedagogical fallback mechanism within `handleAiEnrichTheory` and `handleAiEnrich`. In the event of network disruption or gateway timeouts, the system generates comprehensive GDPT 2018-aligned theory and 4-step solution methods, marks `isEdited: true`, and guarantees 100% button responsiveness.

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


<!-- Imported develop documentation; retained for merge traceability. -->

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
- Fetches real 30-question diagnostic exam from AI Engine (`generate-exam` with Gemini Cloud or Calibrated Bank) and Content Service.
- Features distraction-free in-exam question navigator, 45-minute timer, and question flagging during testing, reserving Socratic AI Tutor guidance for the post-exam answer review table (`stage === 'result'`).
- Evaluates student ability across 5 core evaluation domains (Mathematics, Logic Reasoning, Language Arts, Natural Sciences, Social Sciences).
- Employs 2-Parameter Logistic (IRT 2PL) probability scoring and Bayesian Knowledge Tracing initial mastery estimation `P(L_0)`.
- Generates 5-axis Recharts Radar Chart and pedagogically calibrated Socratic AI Commentary, allowing students to review every question's answer key and invoke inline or modal Socratic AI Tutor analysis per question.

### 4.2. Flow 2: Dynamic Learning Roadmap (Kahn Topo & FSM)
- Visualized in `HeroBanner.jsx` and `MilestoneCard.jsx`.
- Tracks progressive stage unlocking based on Finite State Machine criteria: Lecture Video completion (`>= 80%`) and Quiz mastery (`>= 60%`).

### 4.3. Flow 3: Adaptive Practice & Remediation (ZPD & BKT)
- Executed in `AdaptiveQuizModal.jsx`.
- Dynamically delivers question items targeted within the Zone of Proximal Development (`ZPD \in [0.60, 0.75]`).
- Updates student mastery probability `P(L_t)` using Bayesian Knowledge Tracing transitions, and upon quiz completion presents a full answer review screen where students can inspect their choices against the answer key and ask the Socratic AI Tutor about any question.

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

### 4.7. End-to-End Authentication & Identity Lifecycle Integration
- **Full-Featured Auth View (`WebLoginPage.jsx`)**:
  - Implements 5 interconnected interaction states: `login`, `register`, `otp_verify`, `forgot_password`, and `reset_password`.
  - Rigorous registration validation aligned with Backend FluentValidation rules (Full name, Vietnamese 10-digit phone regex, Email format, 8+ character password with uppercase and digits).
  - Two-tier OTP activation (`POST /api/auth/verify-account`): 10-minute countdown timer with automatic developer OTP extraction and one-click fill for frictionless testing.
  - Seamless 1-Click Demo accounts for rapid evaluation (Student, Teacher, Manager, Parent).
- **Global Session Orchestration (`App.jsx`, `PublicHeader.jsx`, `Navbar.jsx`)**:
  - Global `currentUser` state synchronized with `localStorage` (`veval_user_profile`, `veval_access_token`, `veval_refresh_token`).
  - Context-aware Public Header displaying authenticated student name and a direct "Vào Dashboard" CTA.
  - Dynamic user dropdown in `Navbar.jsx` with actual student name, email, and academic role.

### 4.8. Adaptive Learning Roadmap & Dashboard Data Binding (`MilestoneCard.jsx`)
- Direct integration with Practice Service via `practiceService.getMyRoadmap()`.
- Intelligent empty state handling: If a new student has not generated a roadmap, renders an actionable prompt directing them to the 30-question diagnostic exam (`DiagnosticAssessmentPage.jsx`).
- Renders active milestone stages, completion percentage, weekly time commitment, and priority tasks with smooth offline fallback to system-calibrated mock models.

### 4.9. Multi-Role Smart RBAC Architecture & Dedicated Workspaces
- **Public Registration Role Isolation**:
  - Restricts public self-registration strictly to **Student (`STUDENT`)** and **Parent (`PARENT`)** roles.
  - Institutional and administrative roles (Teacher, Campus Academic Manager, Academic Director, Administrator) are explicitly prohibited from public registration; these accounts are provisioned internally by Campus Administrators via internal governance workflows.
  - Adaptive registration form dynamically shifts labels, placeholders, and validation schemas based on selected learner or guardian role.
- **Unified Smart RBAC Login with Dynamic Routing**:
  - All roles authenticate through a single consolidated login portal (`WebLoginPage.jsx`).
  - Upon identity verification by `Identity_Service`, the client reads user role claims from the JWT payload and dynamically routes the session to the dedicated role workspace:
    - **Student Workspace**: Adaptive roadmap, 30Q diagnostic evaluation, and Socratic AI Tutor.
    - **Parent Companion Portal (`ParentDashboardView.jsx`)**: Real-time IRT Theta ability tracking (+0.65 Theta), university admission probability (82% Bach Khoa CS), weekly study time commitment, and proactive AI alert notifications.
    - **Teacher Workspace (`TeacherDashboardView.jsx`)**: Class-wide knowledge mastery heatmap and Live Q&A scheduling.
    - **Campus Academic Manager Portal (`CampusManagerDashboardView.jsx`)**: Multi-campus governance, AI Auto-Clustering overview (K-Means/GMM grouping students into 3 ability clusters), teacher workload distribution, and internal staff provisioning modal.
  - 1-Click Demo presets updated to provide instantaneous demo access for all 4 distinct system roles.

### 4.10. IAM Account Provisioning & Multi-Role Governance View (`AccountProvisioningView.jsx`)
- **Executive Administration Dashboard**:
  - Delivers real-time account statistics (Total CSDL accounts, active teaching staff, campus academic directors, active status ratios).
  - Multi-tier filtering across 6 system roles (`TEACHER`, `ACADEMIC_MANAGER`, `ACADEMIC_DIRECTOR`, `ADMINISTRATOR`, `PARENT`, `STUDENT`) with fast substring search (Name, Email, Phone).
  - Interactive user table with instant toggle switch for locking/unlocking user accounts (`PATCH /api/v1/users/{id}/toggle-status`).
  - Modal-based role provisioning workflow linked to PostgreSQL via Gateway `POST /api/v1/users/provision`:
    - Role picker card selection with explicit capability descriptions.
    - Live campus selection fetched from database (`GET /api/v1/campuses`).
    - Random secure password generator and single-click credential handoff clipboard copy.
- **Dedicated Service Layer Integration (`src/services/userService.js`)**:
  - Provides standardized client methods (`getUsers`, `provisionUser`, `toggleUserStatus`, `getCampuses`) routed via YARP Gateway (`:5212`) to `Identity_Service`.

### 4.11. Unified Authentication Architecture (TNhan UI/UX + ThinhTT API Integration)
- **Component Modularization**: Decoupled monolithic login page into clean, maintainable subcomponents (`LoginForm.jsx`, `RegisterForm.jsx`, `ForgotPasswordModal.jsx`, `AuthModal.jsx`).
- **Enhanced UX System**: Custom rounded select controls, live exam activity ticker, authentic high school photography (`vietnamese_student_real.jpg`), per-field animated error hints (`fieldErrors`), and 3-tier password strength scoring (`passStrength`).
- **Complete Gateway & Service Integration**: Directly wired to `src/services/authService.js` for JWT token lifecycle (`login`, `register`, `verify-account`, `forgot-password`, `reset-password`, `getCampuses`), eliminating all mock timers while retaining zero-failure offline fallback for demos.

### 4.12. Continuous Integration & Discord Commit Tracking
- **Automated Discord Webhook Integration (`.github/workflows/discord-commit-tracker.yml`)**: Dispatches real-time embed reports to the system Discord channel upon any push across all branches, summarizing commit author, hash, message, changed files status, and current day's `UPDATE.md` notes.
- **Client Build Validation (`.github/workflows/ci.yml`)**: Enforces Node.js 20.x dependency installation (`npm ci`) and clean Vite compilation (`npm run build`) on pull requests and branch updates.

### 4.13. Micro Study Groups & Offline Table Station Architecture
- **Offline Cohort Standard Alignment**: Re-engineered class listings in `CampusManagerDashboardView.jsx` to reflect the 20-student capacity cap (`MaxCapacity = 20`) and deterministic numbered class codes (`01, 02...`).
- **Interactive Micro Study Groups Modal (`ClassMicroGroupsModal.jsx`)**:
  - Implements an offline table station layout where each class is partitioned into study groups of 3 to 5 students based on homogeneous skill deficiencies.
  - Features configurable group sizing (`3`, `4`, `5` students/table), deficiency tagging, and individual student mastery indicators.
  - Supports one-click targeted worksheet distribution (`practiceService.assignGroupWorksheet`) directly to each station, updating distribution timestamps and real-time status indicators.
### 4.14. Curriculum Knowledge Explorer & Content Service API 19 Integration
- **Database-Driven Knowledge Hierarchy (`CurriculumExplorerView.jsx`)**:
  - Dynamically fetches the 4 core domains and 12 standard V-ACT competencies directly from Content Service (`GET /api/content/curriculum`) via YARP Gateway, completely eliminating static frontend `DOMAINS_DATA` hardcoding.
  - Integrates standardized KaTeX formula rendering via `MathText.jsx` for all mathematical and scientific models (derivatives, Newton-Leibniz integrals, De Morgan rules, Arrhenius, Hardy-Weinberg).
  - Highlights Cross-Disciplinary GraphRAG model inheritance: showcases how single mathematical formalisms solve physical, chemical, and biological problems.
  - Features video lecture preview cards and exemplar V-ACT questions with step-by-step LaTeX derivations.
- **On-Demand Adaptive Quiz Packaging (Content Service API 19)**:
  - Direct integration with `POST /api/content/exams/quiz` via `contentService.createAdaptiveQuiz`: dynamically packages 5 Bloom-calibrated questions for any selected skill.
  - Interactive quiz runner modal provides instant option verification, real-time scoring, and step-by-step KaTeX explanations.
- **Dynamic Mastery & Weak Skill Remediation Strip**:
  - Automatically correlates user IRT $\theta_0$ and Bayesian Knowledge Tracing $P(L_t)$ from practice assessments. Flags skills with $P(L_t) < 0.60$ with red alert badges and instant remediation callouts.

### 4.15. 3-Level Hierarchical Curriculum Tree & 4 Pedagogical Layers Architecture
- **Interactive 3-Level Accordion Tree Navigation**:
  - Replaces flat competency lists with a nested accordion tree strictly reflecting K12 curriculum hierarchies (GDPT 2018):
    - Level 1: `Chapter` (Collapsible with chapter title, weight, and lesson count).
    - Level 2: `Lesson` (Nested collapsible sub-accordion with lesson title and pattern count).
    - Level 3: `Pattern` (Selectable leaf nodes featuring individual diagnostic mastery badges: `` `Severe (<10%)` ``, `` `Weak (<60%)` ``, and `` `Mastered (>=60%)` ``).
- **Four Dedicated Pedagogical Content Layers**:
  - *Layer 1 (Foundational Knowledge & Prerequisites)*: Formatted textbook definitions, theorems, and visual Directed Acyclic Graph (DAG) prerequisite linkages.
  - *Layer 2 (Step-by-Step Solution Method & KaTeX Formulas)*: Algorithmic derivation steps (Step 1 -> Step 2 -> Step 3), KaTeX formula bank, and Cross-Disciplinary GraphRAG notes.
  - *Layer 3 (Video Lecture & Exemplar Question)*: Video lecture card with duration indicator (satisfying FSM Gate $\ge 80\%$) and verified test bank sample question with step-by-step derivation.
### 4.16. Instructor Curation Suite & Live KaTeX Authoring Architecture
- **Maximized Instructor Curation Authority**:
  - Implements a dedicated pedagogical management suite enabling teachers and academic coordinators to inspect, refine, and calibrate all 4 pedagogical layers after automated textbook parsing by the AI Engine.
  - Interactive Curation Modal (`CurriculumExplorerView.jsx`) provides a 5-tab workspace:
    - *Tab 1 (Layer 1 - Foundational Theory)*: Markdown & KaTeX editor for definitions, conditions, and core theorems.
    - *Tab 2 (Layer 2 - Methodological Procedures)*: Step-by-step procedure authoring with one-click math palette buttons (`\frac{a}{b}`, `\sqrt{x}`, `\int`, `\lim`, `\Delta`, `\ge`, `\le`, `\in`, `\forall`, `\Rightarrow`).
    - *Tab 3 (Layer 3 - Video Lecture Management)*: Video URL input with live embedded video test player (supporting YouTube iframe embedding and direct streaming).
    - *Tab 4 (Layer 4 - Flagship Exemplar Item)*: Item stem authoring with 4 choices (A-D), interactive correct answer radio selector, and step-by-step LaTeX derivation.
    - *Tab 5 (Pattern Configuration & Governance)*: Pattern name, competence weight percentage, Bloom cognitive level, and safe deletion cascade.
- **Real-Time Live KaTeX Preview & Pedagogical AI Assistant**:
  - Dual-column split view provides live `<MathText />` rendering, giving instructors instant feedback on formula typography and layout as experienced by learners.
  - One-click AI Pedagogical Assistant button (`AI Method Assistant`) scaffolds standard 3-step solution templates aligned with Ministry of Education (GDPT 2018) guidelines.
- **Dynamic SGK Ingestion Portal**:
  - Provides a dedicated modal for pasting and verifying structured JSON trees outputted by the RAG/OCR AI service, seamlessly syncing into PostgreSQL via `POST /api/content/curriculum/import`.

### 4.17. Dedicated Pedagogical Studio & Real-Time Student Experience Review Mode
- **Full-Scale Authoring Environment (`CurriculumStudioEditor.jsx`)**:
  - Upgrades from lightweight modal popups to a full-screen, heavy-duty authoring studio designed to handle rich textbook authoring with graphics, multi-variable formulas, video segment markers, and question banking.
  - Features 3 dedicated view layouts:
    - `Editor Mode`: Focus layout with section navigation across all 4 pedagogical layers.
    - `Split 50-50 Mode`: Live side-by-side editing and instant student rendering.
    - `Student Experience Review Mode`: Full-width simulated student view replicating actual learner interaction with theory recaps, step-by-step algorithms, exam pitfalls, Casio calculator shortcuts, embedded video playback, and formative quizzes.
- **Graphic Assets & Diagram Library Integration**:
  - Seamlessly integrates geometric curves, variation tables, and 3D coordinate diagrams into pedagogical texts.
  - Enhanced `MathText.jsx` parsing engine safely renders Markdown images `` `![alt](url)` `` with responsive styling, rounded elevation borders, and lazy loading.
- **Question Bank Studio (API 16-18)**:
  - Dynamically retrieves, displays, creates, and deletes pattern-linked items in PostgreSQL database, categorized by Bloom taxonomy levels (L1 Knowledge to L4 High-Order Thinking).

### 4.18. Runtime Hardening, Global Error Boundary & Reference Fix
- **Defensive Error Handling (`RootErrorBoundary` in `main.jsx`)**:
  - Implements a top-level React Error Boundary wrapping `<App />` to intercept unhandled runtime errors, preventing blank white screen states.
  - Presents a recovery interface with detailed error diagnostics, component stack trace, and quick recovery actions (Reload Page, Clear LocalStorage Cache).
- **Reference Error Resolution**:
  - Resolved `ReferenceError: weakPrerequisites is not defined` in `CurriculumExplorerView.jsx` by establishing a reactive prerequisite filter against real BKT/IRT mastery scores in `skillMasteryMap`.
- **String & Markdown Guarding (`MathText.jsx`)**:
  - Fortified `MathText` against non-string inputs with type-checked guards (`typeof text !== 'string'`), preventing rendering aborts on nullish or complex object payloads.

### 4.19. AI Document Ingestion & Curriculum Pattern Identification Suite
- **Multi-Format Textbook Ingestion (`CurriculumExplorerView.jsx` & `aiService.js`)**:
  - Instructors can drag-and-drop `.pdf`, `.docx`, `.txt` monographs/textbooks up to 250MB or paste syllabus snippets into a high-capacity ingestion modal.
  - Features an animated 4-step progress tracker: `1. Đọc tệp & OCR` -> `2. Phân tích Chương - Bài` -> `3. Nhận diện Dạng bài` -> `4. Chuẩn hóa KaTeX`.
  - Communicates directly through Gateway YARP to AI Engine (`POST /api/v1/documents/extract-curriculum`).
- **Interactive Pattern Discovery Showcase**:
  - Visual hierarchy cards display extracted chapters, lessons, and patterns with pattern classification tags, Bloom taxonomy level badges, and KaTeX preview blocks.
### 4.20. KaTeX String Sanitization & Callout Extraction Engine (`MathText.jsx`)
- **Literal Escape Remediation**: Resolves double-escaped literal newlines (`\n\n`) preventing them from rendering as raw plaintext in methodological solutions.
- **Auto-Enclosure for Unwrapped LaTeX Commands**: Automatically encloses isolated LaTeX symbols and commands (`\Delta`, `\frac`, `\lim`, `\int`, `\alpha`, `x_0`) inside KaTeX formatting blocks when occurring outside explicit delimiters.
- **Pedagogical Callout Cards**: Detects and parses `### ⚠️ Các bẫy đề thi:` into custom Rose Alert Callout Cards and `### 💡 Mẹo Casio:` into Indigo Tip Callout Cards, with bold step markers (`**Bước X:**`).

### 4.21. Comprehensive STEM KaTeX Virtual Keyboard & Fullscreen Panoramic Ingestion Workspace
- **10-Category STEM Virtual Keyboard (`CurriculumStudioEditor.jsx`)**:
  - Provides 120+ calibrated STEM mathematical symbols across Algebra, Derivatives, Integrals & Limits, Exponents & Logs, Trigonometry, Oxyz Geometry, Systems & Brackets, Sets & Logic, Greek Alphabet, and Probability & Statistics.
  - Active input field target selector dynamically injects equations into the focused input across Foundational SGK, Solutions, Traps, Casio, or Exemplar Questions.
- **Fullscreen Panoramic 3-Column Studio Ingestion Workspace (`CurriculumExplorerView.jsx`)**:
  - Replaces cramped modals with an expansive Panoramic Workspace (`max-w-[1580px] h-[95vh]`).
  - Implements multi-page range slicing (`startPage` to `endPage`) and depth selection (`Standard` vs `Deep VNU-HCM Examination`) enabling resilient ingestion of 99+ page textbooks.
  - 3-column verification layout: Chapter & Lesson Hierarchy -> Bloom-filtered Pattern Showcase -> Live KaTeX Pattern Inspector.

### 4.22. Two-Tier Mathematical Typography Engine & Sentence Flow Preservation (`MathText.jsx`)
- **Root Cause Elimination of Sentence Shattering**:
  - Previously, global delimiter tokenization wrapped intermediate non-math string chunks inside `display: block` elements (`span className="block leading-relaxed"`), causing sentences to break vertically across every punctuation mark, parenthesis, comma, and inline equation.
  - Re-engineered into a strict **Two-Tier Rendering Architecture**:
    1. *Document / Line Tier*: Parses multiline blocks, real newlines, pedagogical alert callouts (Rose Alert, Indigo Tip), bold step rows (`` `**Bước X:**` ``), and list items.
    2. *Inline Content Tier*: Parses math formulas (`` `$...$` ``, `` `\(...\)` ``), bold marks (`` `**...**` ``), and plain text exclusively as pure inline spans (`` `<span>` ``, `` `<strong>` ``, `` `<img>` ``). Guarantees seamless horizontal text flow with zero block breaks.
- **Single-Bullet Deduplication**:
  - Employs regex sanitization to strip leading dashes or duplicate bullet symbols (`` `• - ` ``), standardizing bullet items into a single, elegant indigo dot (`•`) with responsive multi-level indentation.
- **Smart DOM Conformance**:
  - Detects unstructured single-line strings (e.g., question choices A-D, titles) and outputs pure inline `` `<span>` `` elements, eliminating React DOM nesting warnings (`` `<div>` `` inside `` `<span>` ``).
- **Accurate LaTeX Command Negative Lookahead & Chemistry Formula Auto-Wrapping**:
  - Replaces crude alphanumeric lookahead with an exact 15-command LaTeX negative lookahead (`` `\neq` ``, `` `\notin` ``, `` `\nabla` ``, `` `\nu` ``), unescaping 100% of Vietnamese words and step prefixes (`` `\nTrong` ``, `` `\nKiểm` ``, `` `\nBước` ``) into proper newlines across preview and editor textareas.
  - Automatically encloses polyatomic ions with charges (`` `H^+` ``, `` `OH^-` ``, `` `SO_4^{2-}` ``, `` `NO_3^-` ``) and chemical compounds with subscripts (`` `H_2O` ``, `` `H_2SO_4` ``, `` `HNO_3` ``) in KaTeX blocks.

### 4.23. Dual-Mode Pedagogical Authoring Architecture (`CurriculumStudioEditor.jsx`)
- **Teacher-First Text In Preview vs Raw LaTeX Fast Ingestion Parallelism**:
  - Replaces rigid 4-field fragmented forms with an organic, unified pedagogical authoring workflow supporting two distinct modes:
    1. *Visual Authoring Mode (Text In Preview - Student Standard)*:
       - Offers continuous pedagogical composition with quick structural helpers (`+ Khối công thức $$...$$`, `+ Gạch đầu dòng`).
       - Features an in-place **Live In-Place Student View (Text In Preview)** directly beneath the input, powered by `<MathText />` to render true mathematical typography (fractions, square roots, limits, integrals, diagram illustrations) identical to the learner's actual card view.
    2. *Raw LaTeX & Markdown Mode (Rapid AI Ingestion)*:
       - Monospace dark-themed syntax textarea tailored for instantaneous 1-click pasting of raw generative AI outputs (Gemini, ChatGPT, or backend AI Engine) without manual intermediate schema translation.
- **Cursor-Precision STEM KaTeX Virtual Keyboard Injection**:
  - Implements `textareaRefs` tracking `selectionStart` and `selectionEnd` on the actively focused input.
  - When clicking on any mathematical symbol in the 10-category STEM KaTeX virtual palette (120+ calibrated formulas), the equation snippet is precisely inserted at the current caret position, and focus is automatically retained without page scrolling or caret jump.
- **Block 2 (Step-by-Step Problem Solving & Traps)**:
  - Both modes natively support structured algorithmic step derivation alongside dedicated live-preview alert cards: Exam Pitfalls (Rose Alert) and Casio fx-580/880 Shortcuts (Indigo Tip).

### 4.24. Panoramic Workspace 2-Master-Pane Rebalancing & Deep Exemplar Bank Integration (`CurriculumExplorerView.jsx`)
- **Elimination of Visual & Cognitive Layout Imbalance**:
  - Replaced the asymmetrical 3-column layout (which suffered from 70% bottom white-space dead zones in Columns 1 & 2 while excessively cramming all 4 pedagogical blocks into Column 3) with a **2-Master-Pane Balanced Grid**:
    - *Pane 1 (Hierarchical Navigation & Pattern Index - 4 Cols / ~33%)*:
      - Section 1 (Chapter & Lesson Tree): Compact header with total pattern count and exemplar question badges (`X dạng • Y bài mẫu`).
      - Section 2 (Pattern Roster with Bloom Filtering): Independent scrollable container displaying pattern titles, weightings, classification badges, and a prominent badge for available exemplar questions (`🎯 X bài mẫu chuyên sâu`).
    - *Pane 2 (Main Pedagogical & Question Workspace - 8 Cols / ~67%)*:
      - Top Banner: Global curriculum statistics aggregating total exemplar questions across the whole topic (`X Chương • Y Bài học • Z Dạng bài chi tiết • W Bài tập mẫu chuyên sâu`).
      - Top Bar: Pattern metadata, Bloom taxonomy tag, question count, and 1-click launch to Curriculum Studio Editor.
      - **Balanced Side-by-Side 50/50 Dual Column**:
        - *Left Column (Foundational Theory & Methodology)*: Block 1 (SGK Theory in Cyan Card), Block 2 (Step-by-Step Algorithm, Rose Alert Traps, Indigo Tip Casio in Amber Card), and Block 3 (Video Duration in Emerald Card).
        - *Right Column (Exemplar Question Bank - Block 4)*: Houses the complete collection of 4 exemplar questions spanning Bloom levels L1 to L4.
- **Dynamic On-The-Fly Question Expansion (`+ AI Tạo Thêm 2 Bài Mẫu`)**:
  - Embedded an interactive action button within Block 4 header allowing instructors to dynamically synthesize 2 additional practice questions (L3 Application and L4 Advanced) tailored directly to the active pattern's theory and method.
- **Interactive Question Switcher & Live Solution Derivation**:
  - Provides instant pill tabs (`[Câu 1 • L1: Nhận biết]`, `[Câu 2 • L2: Thông hiểu]`, `[Câu 3 • L3: Vận dụng]`, `[Câu 4 • L4: Vận dụng cao]`) allowing instructors to toggle seamlessly between exemplar items.
  - Renders LaTeX item stems, an interactive 4-option grid (A-D) with emerald checkmarks highlighting the verified correct answer, step-by-step KaTeX mathematical derivations, and responsive previous/next pagination controls.
  - Synchronizes all extracted question items into PostgreSQL via `contentService.importCurriculum` (`POST /api/content/curriculum/import`) to enrich the ZPD adaptive practice bank (API 19).

### 4.25. Dedicated Pedagogical Exemplar Presentation & Section Parsing (`CurriculumExplorerView.jsx` & `CurriculumStudioEditor.jsx`)
- **Pedagogical Structure Isolation Architecture**:
  - `parseTheoryRecapSections(theoryRecap)`: Uses an anchor-based delimiter regex `/(?:^|\n)###\s*(?:📌\s*)?Ví dụ minh họa SGK:?/i` to split raw theory into core foundational principles (`theory`) and dedicated real-world STEM illustrative examples (`example`).
  - `parseSolutionMethodSections(solutionMethod)`: Uses positive lookaheads `(?=(?:###\s*(?:⚠️|💡)|$))` to split algorithmic steps (`method`), applied sample problem (`sampleProblem`), exam pitfalls (`traps`), and Casio fx-580/880 shortcuts (`casio`).
- **Visual Design & Typography Hierarchy**:
  - **Block 1 (Foundational SGK Theory)**: Features an emerald-themed **"📌 Ví Dụ Minh Họa SGK"** card (`bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/30`) with an explicit "VÍ DỤ SGK" badge, separating abstract theorem statements from contextual numerical examples.
  - **Block 2 (Methodology & Pitfalls)**: Features an amber/orange-themed **"📝 Bài Toán Mẫu Áp Dụng Phương Pháp"** card (`bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30`) with an explicit "BÀI TOÁN MẪU ÁP DỤNG" badge positioned directly after algorithm steps, clearly showing students how Step 1, Step 2, and Step 3 operate in concrete problem scenarios before presenting common exam pitfalls and Casio tips.

### 4.26. Interactive Bloom Taxonomy Filtering & 14-Question Exemplar Inspection Suite (Block 4)
- **Multi-Level Cognitive Segregation**:
  - Implemented an interactive Bloom filter tab bar (`[Tất cả (14)]`, `[L1: Nhận biết (2)]`, `[L2: Thông hiểu (2)]`, `[L3: Vận dụng (5 câu)]`, `[L4: Vận dụng cao (5 câu)]`) directly above the question switcher pills.
  - Allows educators and curriculum curators to effortlessly navigate dense 14-question banks per pattern (especially isolating the 5 L3 Application and 5 L4 Advanced questions) without cognitive overload.
- **Pattern Density Indicators in Pane 1**:
  - Displays explicit level distribution pills `(L1: 2 • L2: 2 • L3: 5 • L4: 5)` and high-order competency badges `Chuẩn ĐGNL: L3 (5 câu) • L4 (5 câu)` for each pattern in the left navigation hierarchy, providing immediate pedagogical transparency.

### 4.27. Native SGK Variation Table Component (`VariationTable.jsx`)
- **Crisp 3-Row Vector Geometry**:
  - Implements an exact HTML/SVG representation of textbook variation tables (Bảng biến thiên) complying with Vietnamese high school curriculum (GDPT 2018).
  - Renders 3 discrete pedagogical layers:
    1. Independent variable row `` `x` ``.
    2. Derivative sign row `` `y'` `` with zeros and undefined double-vertical bars `` `||` ``.
    3. Function variation row `` `y` `` featuring smooth dynamic vector arrows (upward `` `\nearrow` `` and downward `` `\searrow` ``), extreme values (local maxima and minima), and asymptotic limits (`` `-\infty` ``, `` `+\infty` ``).
  - Eliminates pixelation and blurriness inherent in scanned image crops across high-DPI displays.
- **Dedicated Parser & Integration**:
  - `parseVariationTableString()` parses structured markup blocks `` `[VARIATION_TABLE]...[/VARIATION_TABLE]` ``.
  - Seamlessly integrated into `MathText.jsx` to render anywhere within theory summaries, step-by-step algorithms, or practice question items.

### 4.28. Native SVG Function Graph Plotter & Interactive Desmos Calculator (`MathGraphView.jsx`)
- **Cartesian Coordinate System & Analytic Curve Generation**:
  - Renders a razor-sharp SVG Oxy coordinate system complete with major axis arrows, origin label `` `O` ``, grid lines, and tick marks.
  - Generates mathematically accurate piecewise and continuous cubic, rational, quartic, and parabolic curves.
  - Automatically draws dashed projection lines from critical points (local maxima and minima) perpendicular to both axes alongside KaTeX coordinate labels.
  - Renders vertical and horizontal asymptotes for rational functions `` `y = \frac{ax+b}{cx+d}` ``.
- **Interactive Desmos Graphing Calculator Embed Mode**:
  - Provides a 1-click switcher between the lightweight static SVG mode and the **Interactive Desmos Calculator** iframe.
  - Allows educators and learners to zoom, pan, evaluate intersection points, inspect tangents, and trace function values in a professional mathematical environment akin to MATLAB or GeoGebra.
- **Structured Block Parsing**:
  - Automatically translates `` `[GRAPH: type=... | formula=... | cd=... | ct=...]` `` tags embedded in curriculum or question text.

### 4.29. Interactive Click-to-Fill Formula Builder & Clipboard Image Ingestion (`InteractiveFormulaBuilderModal.jsx` & `CurriculumStudioEditor.jsx`)
- **Frictionless Non-LaTeX Authoring for Instructors**:
  - Completely frees educators from the requirement of typing or understanding raw LaTeX code (e.g. `` `\frac{a}{b}` ``, `` `\sqrt[n]{x}` ``, `` `\int_{a}^{b} f(x)dx` ``).
  - Clicking any fillable formula button in the STEM palette opens an intuitive modal featuring dedicated input fields for each parameter (Numerator/Denominator, Radical index/Expression, Limits, Integrand/Differential variable, Equation systems, Preset variation tables, and Oxy function graphs).
  - Features real-time Live KaTeX and SVG component preview before insertion, with keyboard shortcuts (`` `Ctrl + Enter` `` to confirm, `` `Esc` `` to cancel).
- **Direct Clipboard Image Pasting (`Ctrl + V`) & File Upload**:
  - Captures `onPaste` events across all editor textareas (Theory, Method, Pitfalls, Casio Tips, Question Stem, Explanation).
  - Automatically extracts image blobs from Windows Snipping Tool, Zalo, or browser clipboard, converts them via `FileReader.readAsDataURL` to Base64 Data URLs, and injects clean Markdown image tags directly at the caret position.
  - Provides a universal quick toolbar on every pedagogical block: `` `✨ Điền Công Thức` ``, `` `📊 Bảng Biến Thiên` ``, `` `📈 Đồ Thị Hàm Số` ``, `` `🖼️ Dán/Tải Ảnh` ``.

### 4.30. Compact & High-Density UI Optimization for Panoramic Workspace (`CurriculumExplorerView.jsx`)
- **Visual Clutter & Oversized Element Mitigation**:
  - Addressed user feedback regarding oversized padding, inflated card elements, and excessive vertical spacing across the 3-column Panoramic Ingestion Workspace.
  - Reduced overall modal component footprint by ~30%, transitioning from bloated layouts to an elegant, high-density academic studio interface.
- **Architectural & Aesthetic Refinements**:
  - *Header & Summary Bar*: Streamlined padding to `px-4 py-2.5`, Wand icon to `w-8 h-8`, and banner height by 35% while preserving all metadata telemetry.
  - *Hierarchy Navigation (Pane 1)*: Compacted Chapter/Lesson accordion (`p-2.5`) and Academic Pattern cards (`p-2 rounded-xl`, font `11px`), optimizing scrollable area so educators can view all 10 patterns without excessive scrolling.
  - *Pedagogical Core (Pane 2A)*: Tightened Box 1 (Textbook Foundations) and Box 2 (Solution Algorithms & Pitfalls) to `p-2.5` padding with refined `11px` typography, maximizing readable screen real estate.
  - *Exemplar Question Bank (Pane 2B)*: Optimized Bloom difficulty tabs, question pills, and the 2x2 multiple-choice option grid (`A-B-C-D` boxes scaled to `p-1.5 px-2 text-[11px]`) for a clean, non-intrusive layout.
  - *Modal Footer*: Compacted navigation actions (`px-3 py-1.5`) for seamless PostgreSQL database persistence.

### 4.31. Word-Style In-Place Document Canvas & Isolated Raw LaTeX Architecture (`CurriculumStudioEditor.jsx`)
- **Elimination of Passive "Text In Preview" Dual-Box Paradigms**:
  - Completely deprecates the disjointed two-box model (top textarea for inputting raw text, bottom readonly card for viewing "Text In Preview").
  - Educators previously found scrolling back and forth between upper input and lower preview disruptive to pedagogical continuity and error correction.
- **In-Place Word Document Sheet Canvas Experience**:
  - **Modern Ribbon Formatting Toolbar**: Features standard Word formatting actions: Bold (`` `**` ``), Italic (`` `*` ``), Headings (`` `###` ``), Bulleted lists (`` `-` ``), Numbered lists (`` `1.` ``).
  - **1-Click STEM Mathematical Tools**: Quick-insertion buttons for `✨ Điền Công Thức` (interactive click-to-fill builder), `📊 Bảng Biến Thiên` (3-row SVG table), `📈 Đồ Thị Hàm Số` (Oxy coordinate & Desmos Calculator), `🖼️ Dán (Ctrl+V) / Tải Ảnh`, and auto-incrementing `+ Thêm Bước mới` buttons.
  - **Standard A4 Document Sheet**: High-fidelity white document sheet with subtle drop shadows (`shadow-md border border-slate-300 rounded-2xl p-6 sm:p-8`), providing an authentic Microsoft Word typing experience.
  - **Instant Canvas View Switcher**: A seamless 1-click switcher between `✍️ Sửa Trực Tiếp` (editable canvas) and `👁️ Xem Trang In / Học Sinh` (final KaTeX rendered student handout) positioned directly on the document sheet header.
- **Direct Interactive Warning & Casio Cards**:
  - Exam Pitfalls (Rose Alert) and Casio Tricks (Indigo Tip) refactored into direct in-card editors, eliminating passive preview boxes and allowing educators to write, format, and modify pedagogical warnings directly within the card context.
- **Isolated Raw LaTeX & Markdown Code Workspace**:
  - Decoupled into an independent, distraction-free tab: `⚡ Trang Mã Nguồn LaTeX Thuần (Dành Cho AI)` styled with a dark developer theme (`bg-slate-900 text-emerald-400 / amber-300`).
  - Specially optimized for bulk copy/pasting raw generative AI outputs (Gemini, ChatGPT) with 100% two-way bidirectional state synchronization upon switching tabs.

### 4.32. WYSIWYG Real Symbols & Interactive Chemistry / Math Calculator Architecture (`InteractiveFormulaBuilderModal.jsx` & `CurriculumStudioEditor.jsx`)
- **Eradication of Raw Code Exposure (`\frac`, `\lim`, `$` Symbols)**:
  - Addressed educator frustration regarding the visibility of raw LaTeX markup (`\frac`, `\lim`, `\Delta`) in the active typing canvas.
  - Implemented default **WYSIWYG Interactive Math & Science Mode**: All mathematical and chemical formulas are rendered into 100% authentic pedagogical graphical typography (horizontal fraction bars, subscripts, superscripts, increment symbols) with zero exposed syntax delimiters.
  - Quick toggle button provided: `` `[Xem Ký Hiệu Thật (WYSIWYG)]` `` ⟷ `` `[Gõ Văn Bản Bàn Phím]` `` allowing smooth transitions between visual exploration and bulk keyboard typing.
- **Interactive Chemistry Formula Calculator & Real-Time Evaluator**:
  - Integrated dedicated Chemistry models supporting direct numerical substitution and automatic arithmetic evaluation:
    - **Molar Concentration ($C_M = \frac{n}{V}$)**: Accepts moles ($n$) and volume in Liters ($V$), outputting full derivation string: `` `C_M = \frac{n}{V} = \frac{0.2}{0.5} = 0.4\text{ M}` ``.
    - **Mass Percentage ($C\% = \frac{m_{ct}}{m_{dd}} \times 100\%$)**: Calculates percentage concentration from solute and solution masses.
    - **Substance Mass ($m = n \times M$)**: Computes grams from molar mass and moles.
    - **Reaction Yield ($H = \frac{m_{tt}}{m_{lt}} \times 100\%$)**: Evaluates practical vs theoretical mass yields.
  - Educators can toggle between inserting the substituted formula alone or the complete step-by-step derivation with final computed units.
- **Fractional Arithmetic & SGK Derivative Increment Calculator**:
  - **Fraction Simplification**: Dynamically reduces numerical fractions (e.g. `` `\frac{12}{4} = 3` ``) and formats integers or 2-decimal rounded approximations.
  - **Derivative Increment Step-by-Step Generator**: Automates standard Vietnamese textbook derivative formulations ($f'(x_0) = \lim_{\Delta x \to 0}\frac{\Delta y}{\Delta x}$) based on chosen function expressions and evaluation points.

### 4.33. Domain-Aware Pedagogical Adaptation (STEM vs Literature) & Advanced Markdown / Heading KaTeX Parsing (`MathText.jsx`, `CurriculumStudioEditor.jsx`, `CurriculumExplorerView.jsx`)
- **Root Cause & Resolution of Markdown Asterisk / Heading Parsing**:
  - *Bullet Regex Overreach*: Investigated user reported visual defects where lines starting with bold labels (e.g. `**Ví dụ:**` or `### 📌 Ví dụ minh họa SGK:`) were displayed as raw text `• Ví dụ:**`. Identified that regex `^(\s*)(?:[-*•]|\u2022)\s*` greedily consumed the first two asterisks `**` as bullet characters without requiring succeeding whitespace, stripping the opening bold delimiter and leaving trailing `Ví dụ:**` unrendered.
  - *Constrained Bullet Matching*: Updated regex to `^(\s*)(?:[-+•\u2022]|\*(?!\*))\s+(?:[-+•\u2022]\s+)?(.*)$`, strictly guarding `**` and `***` sequences from being categorized as bullets and demanding mandatory trailing whitespace.
  - *Full Markdown Headings & Dedicated Callout Cards*:
    - Implemented native Markdown heading renderer for levels 1 through 4 (`#`, `##`, `###`, `####`) with tailored font sizing and leading.
    - Designed dedicated Callout Components: `### 📌 Ví dụ minh họa SGK:` renders into an elegant Teal/Emerald card (`bg-teal-50/70 border border-teal-200/80 rounded-xl`) with a distinct badge, while `### 📝` / `### 📄 Bài toán mẫu áp dụng phương pháp:` renders into an Amber card (`bg-amber-50/70 border border-amber-200/80 rounded-xl`).
    - Added automated healing for orphaned colon closures `([A-ZÀ-Ỹa-zà-ỹ0-9\s&]{2,30}):\*\*` restored to `**$1:**`.
- **Domain-Aware Curriculum Adaptation (STEM vs Literature / Social Sciences)**:
  - *Elimination of Casio Calculator Mismatch in Literature*:
    - Addressed fundamental pedagogical flaw where Literature ("Ngữ văn") and Social Science subjects erroneously displayed Casio calculator tips (`Mẹo Casio`).
    - Implemented `isMathOrStemDomain(domain)` utility distinguishing Mathematics, Physics, Chemistry, Biology, Informatics (STEM) from Literature, History, Geography, Civic Education.
  - *Curriculum Studio Editor Integration (`CurriculumStudioEditor.jsx`)*:
    - STEM domains retain `💡 Kỹ thuật Casio & mẹo tư duy nhanh` with fx-580 / fx-880 button shortcuts.
    - Literature & Social Sciences dynamically transform the card into `💡 Mẹo tư duy & Chiến thuật làm bài (Ngữ văn)` with violet palette, dedicated text templates (reading comprehension strategies, essay argument structure, evidence selection, and time management), and appropriate placeholders.
  - *Curriculum Explorer Workspace (`CurriculumExplorerView.jsx`)*:
    - Side-by-side cards dynamically display `Chiến thuật làm bài` instead of `Kỹ thuật Casio` and `Bài mẫu` instead of `Bài toán mẫu`.
    - **Resolution of Inappropriate $X$ Variable Injection (`handleAddAiPracticeQuestions`)**:
      - Identified root cause where clicking `+ AI Tạo Thêm 2 Bài Mẫu` relied on a static fallback template using chemical/quantitative equations ($X = 2.07$, conservation laws, algebraic reduction).
      - Re-architected `handleAddAiPracticeQuestions` with domain detection (`isMathOrStemDomain`): for Literature and Social Sciences, dynamically generates Bloom L3 and L4 items centered on thematic thesis formulation, rhetorical evidence synthesis, artistic critique, and humanistic philosophy, thoroughly purging all mathematical variables.
### 4.34. Adaptive Pattern-Contextual Question Generation Architecture & Zero-Hardcode Anti-Duplication (`CurriculumExplorerView.jsx`, `aiService.js`)
- **Architectural Motivation & Elimination of Hardcoded Heuristics**:
  - The feature `+ AI Tạo Thêm 2 Bài Mẫu` in the Panoramic Workspace previously relied on client-side heuristic fallbacks, which caused repeated question generation when the user clicked multiple times.
  - In alignment with V-Eval's 100% Real-Data Architecture, all client-side mock generators (`extractPatternPedagogicalContext`) were completely eliminated. If an API issue occurs, the system surfaces genuine diagnostic errors rather than injecting synthetic static data.
- **Full-Context AI Engine Integration (`POST /api/ai-engine/curriculum/generate-questions`)**:
  - When the user clicks the action button, `CurriculumExplorerView.jsx` dispatches a payload encapsulating the complete pedagogical context:
    - `pattern_name`: Name of the active pattern under analysis.
    - `lesson_name`: Active lesson title safely retrieved from `previewSelectedLessonKey` or `targetPattern.lessonName`.
    - `domain_name`: Specific subject domain (e.g., "Ngữ văn", "Toán học").
    - `theory_recap`: Theoretical background, definitions, and excerpted literary works.
    - `solution_method`: Algorithmic or analytical steps, examples, and strategies.
    - `count`: Desired number of practice questions (default 2).
    - `existing_questions`: Array of already generated question prompts to enforce anti-duplication.
- **Anti-Duplication Prompting & High-Creativity Temperature**:
  - Google Gemini receives the list of existing questions along with an explicit constraint barring reuse of prior prompts or literary excerpts.
  - Temperature was adjusted to `0.7` to ensure distinct, authentic questions across consecutive button presses.
- **Interactive UX & Focus Choreography**:
  - Features asynchronous loading state `isGeneratingPracticeQuestions` with spinning loader and disabled click guards.
  - Automatically activates the newly appended question card (`activeQuestionIndex`) and re-calculates the question count badge.

### 4.35. In-Place Microsoft Word-Style Equation Canvas Architecture (`WordStyleFormulaCanvas.jsx` & `CurriculumStudioEditor.jsx`)
- **Direct In-Place Slot Editing (Eradication of Passive Previews & Popup Modals)**:
  - Eliminated the cumbersome workflow where educators had to switch between "Gõ văn bản bàn phím" and read-only preview cards, or fill numbers through obstructive popup dialogs.
  - Implemented `WordStyleFormulaCanvas.jsx`, delivering a true Microsoft Word Equation experience: equations and text are rendered directly in textbook typography, but each fraction, exponent, root, or chemical equation exposes interactive, in-place editable number slots.
  - Slot Editors:
    - **Fraction 2-Tier Slot Editor (`\frac{A}{B}`)**: Numerator `[ A ]` (amber highlight) vertically stacked over denominator `[ B ]` (cyan highlight) with an ultra-crisp horizontal fraction bar. Clicking directly into slots allows instant numerical changes. Integrated with a 1-click `⚡` calculator button that auto-evaluates division and updates the equality result `[ C ]`.
    - **Power & Exponent Slot Editor (`A^{B}`)**: Exposes base slot and raised exponent slot with dynamic width auto-sizing.
    - **Radical / Square Root Slot Editor (`\sqrt{A}`)**: Surrounds the expression slot with mathematical square root styling.
    - **Chemistry Molar & Percentage Concentration Slots (`C_M = n/V`, `C%`)**: Displays complete chemical equations with slots for moles ($n$), volume ($V$), solute mass, solution mass, and instant unit evaluation ($0.4\text{ M}$).
- **Floating Math Bubble Toolbar**:
  - Dynamically positioned directly above the actively focused equation token.
  - Features 1-touch symbol insertion: `+`, `−`, `×`, `÷`, `±`, `√`, `x²`, `xⁿ`, `x₀`, `π`, `Δ`, `α`, `β`, `∞`, `≠`, `≈`, `≤`, `≥`, `→`, `⇔`, `∈`.
  - Functional action buttons: `⚡ Auto Calculate` (evaluates numerical fractions/chemistry), `🗑️ Delete Equation`, and `✓ Done`.
- **1-Click Ribbon Equation Inserter**:
  - Top Ribbon provides 1-click template insertion: `➗ Phân Số & Số (12/4)`, `a/b Phân Số Đại Số`, `√16 Căn Bậc Hai`, `x² Số Mũ`, `🧪 Nồng Độ CM (n/V)`, `💧 C%`, `🎯 Đạo Hàm Số Gia SGK`, `📋 Hệ PT`.
  - Inserts directly into the document canvas at cursor position and immediately focuses the active slots for zero-friction editing.
### 4.36. Hierarchical Math & Science Palette Sidebar, Single-Version Toolbar Consolidation, and Inline Equation Line-Flow Engine (`HierarchicalMathPalette.jsx`, `WordStyleFormulaCanvas.jsx`, `CurriculumStudioEditor.jsx`)
- **Single-Version Tooling Rule & Clutter Elimination**:
  - Completely purged duplicate toolbars that created visual fatigue (top math palette, ribbon duplicates, submode action bar with redundant fraction/chemistry buttons, and canvas-internal toolbars).
  - Established a singular, streamlined Microsoft Word-style Ribbon at the top of the canvas, housing a clean 3-view switcher (`✍️ Sửa Trực Tiếp`, `👁️ Trang In`, `Raw`).
- **3-Tier Hierarchical Collapsible Left Sidebar (`HierarchicalMathPalette.jsx`)**:
  - Replaced horizontal palettes with an ergonomic, subject-categorized left sidebar:
    - **Domain Tier**: Mathematics (📐), Chemistry (🧪), Physics (⚡), Special Mathematical Symbols (🔣).
    - **Category Tier**: Subject-specific classifications (Chemistry: Solution Concentration, Oxidation States & Ions, Reaction Arrows; Math: Algebra, Calculus, Exponents, Geometry, Trigonometry, Probability; Symbols: Greek Alphabet, Operators & Relations).
    - **Chip Tier**: High-density KaTeX rendered chips with 1-click document canvas injection.
  - **Responsive Collapsibility**: Collapses into an ultra-slim 44px (`w-11`) vertical rail with tooltips, allowing the editor canvas to expand to full width on demand.
- **Natural Paragraph Token Flow & Footprint Optimization (`WordStyleFormulaCanvas.jsx`)**:
  - *Root Cause Analysis*: The prior container-level `flex flex-wrap items-baseline` layout combined with oversized badge styling (`px-2 py-0.5 mx-1.5 border-2`) resulted in erratic line-wrapping, disproportionate line heights, and isolated punctuation marks (e.g. periods dropping to new lines following $H_2SO_4$ or oxidation numbers).
  - *Line & Paragraph Tokenizer*: Redesigned with a dedicated line/paragraph tokenizer (`tokenizeLine`, `parseDocumentLines`, `serializeDocumentLines`). Text segments, inline KaTeX chips, and interactive slots flow inside standard `<div className="text-[13.5px] leading-relaxed my-0.5">` paragraphs.
  - *Compact Typographic Footprint*: Reduced idle formula footprint to `text-[13.5px]`, `px-0.5 py-0 mx-0.5`, with subtle hairline dashed underlines, preserving natural typographic rhythm and textbook line-height without line-hopping.
### 4.37. Dedicated Standalone Fullscreen Studio Page Architecture, 2-Second Hover Preview Engine, and Hierarchical Quick Formula Inspector (`CurriculumExplorerView.jsx`, `HierarchicalMathPalette.jsx`, `WordStyleFormulaCanvas.jsx`, `CurriculumStudioEditor.jsx`)
- **Dedicated Standalone Studio Fullscreen Mode**:
  - Decoupled the Pedagogical Authoring Studio from the restricted sub-view container (`max-w-7xl` inside Roadmap view), transitioning to a dedicated fullscreen portal (`fixed inset-0 z-50 w-screen h-screen bg-slate-950 overflow-hidden`).
  - The outer application sidebar is completely eclipsed during studio editing, freeing 100% of the viewport width without visual obstruction.
  - The `HierarchicalMathPalette` is repositioned as the official left sidebar of the studio workspace, replacing the app sidebar's screen coordinates and providing a toggle collapse to a 44px (`w-11`) icon rail.
  - Top studio navbar (`h-14`) incorporates clean `← Quay lại Lộ trình` breadcrumb navigation, lesson identification, view switchers, and PostgreSQL persistence triggers.
- **2-Second Hover Card with Large KaTeX Rendering & Pedagogical Guidance**:
  - Engineered a 2000ms debounce timer (`hoverTimerRef`) that activates only when an educator pauses cursor motion over any symbol or formula item, preventing noisy UI flashes during fast mouse traversal.
  - Surfaces a rich floating hover card showing: enlarged vector KaTeX equation, classification domain, comprehensive textbook explanation (GDPT 2018), and raw LaTeX syntax with 1-click insertion guidance.
### 4.38. Active Caret Insertion Precision, Light-Themed Accordion Folder Tree, Whitespace Auto-Focus, and Typographic Sanitization Engine (`WordStyleFormulaCanvas.jsx`, `HierarchicalMathPalette.jsx`, `CurriculumStudioEditor.jsx`, `MathText.jsx`)
- **Active Caret Precision Insertion via Imperative Ref**:
  - Implemented `forwardRef` and `useImperativeHandle` in `WordStyleFormulaCanvas` exposing `insertSnippet(latexSnippet)`.
  - Continuously samples editor caret coordinates (`activePositionRef = { lineId, tokenId, offset }`). When an educator clicks any formula/symbol, the active text token is cleanly sliced at the exact cursor offset and the formula token is spliced in-place, eliminating trailing-document appends.
  - Linked `theoryCanvasRef` and `methodCanvasRef` in `CurriculumStudioEditor.jsx` to route insertions to the active authoring canvas.
- **Clean White Theme Reversion & Accordion Toggle Folder Architecture**:
  - Reverted palette styling from dark `bg-slate-900` to clean, modern white (`bg-white border-r border-slate-200 text-slate-800 shadow-sm`).
  - Restructured categories into expandable Accordion Toggle folders (`ChevronDown` / `ChevronRight`) with item counters, boosting display density by 500% with compact 2-column chip grids.
  - Added real-time instant search (`Search` input) filtering across hundreds of high school STEM formulas and chemical compounds.
  - Supported comprehensive STEM library: Mathematics (Algebra, Calculus, Integrals, Trig, Exponents/Log, Geometry Oxyz, Complex & Probability), Chemistry (Inorganic & Organic Acids, Bases, Salts, Oxides, Hydrocarbons, Alcohols, Esters, Peptides, Ions, Oxidation Numbers, Reaction Arrows, Molar Calculations), Physics, and Mathematical Logic.
- **Whitespace Click Line Auto-Focus**:
  - Attached line container click handlers (`handleLineRowClick`). Clicking line whitespace automatically locates the trailing text node and invokes `window.getSelection().collapse()` to jump the cursor to the end of the line.
- **Redundant Control Elimination & Line-End Sanitization**:
  - Removed redundant "+ Thêm dòng mới" button (handled natively by Enter key).
  - Sanitized trailing backslashes (`\`) and stray markdown escapes (`.\`, `:\`) in both canvas tokenizer and KaTeX renderer.
  - Replaced corrupted `📝` emoji with crisp Lucide vector icons (`FileEdit`, `FileText`, `BookOpen`, `AlertTriangle`, `Sparkles`).

### 4.39. Chemical Formula & Ion LaTeX Typographic Normalization Engine (`MathText.jsx`)
- **Stray 'text' Prefix Elimination**:
  - Identified edge-case where KaTeX rendered chemical ion formulas with an unwanted italic variable prefix `$textSO_4^{2-}$` due to unbracketed `\text` commands losing backslash prefixes.
  - Implemented proactive normalization in `normalizeMathString`:
    `str.replace(/(?:\\text|\btext)(?=[A-Z])/g, '')` and `str.replace(/(?:\\text|\btext)\{([A-Z][a-zA-Z0-9_+\-^]*)\}/g, '$1')`.
  - Automatically cleanses stray `text` or `\text` immediately preceding uppercase chemical symbols (e.g. `SO_4^{2-}`, `H_2O`, `Fe^{3+}`), allowing the automatic chemical ion tokenizer to wrap them cleanly in KaTeX math mode ($SO_4^{2-}$) with zero typographical distortion.

### 4.40. Unified Clean White Hero Banner & Symmetric 5-Domain Grid Architecture (`CurriculumExplorerView.jsx`)
- **Tone Cohesion & Visual De-Cluttering**:
  - Replaced the dark navy/black gradient hero banner (`bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900`) with a clean, light-themed container (`bg-white border border-slate-200/80 shadow-xs rounded-2xl`).
  - Completely aligns the top header section with the application's clean white primary visual identity, eliminating the jarring "black top, white bottom" contrast.
  - Reduced vertical footprint (`p-5 lg:p-6`), simplified pedagogical description with crisp font weights, and flattened the two bulky stat boxes into compact, inline stat chips (`px-3.5 py-2 rounded-xl bg-slate-50/90`).
- **Symmetric 5-Domain Horizontal Layout (`lg:grid-cols-5`)**:
  - Re-architected domain tab switcher from `grid-cols-4` to `lg:grid-cols-5`, placing all 5 standard competencies (General, Math/STEM, Natural Sciences, Social Sciences, Language Arts) onto a single, perfectly balanced horizontal row without orphaned wrap-around items.
  - Active domain state utilizes a refined indigo tint (`bg-indigo-50/90 border-2 border-indigo-600 font-bold ring-2 ring-indigo-500/15`), while inactive domains maintain subtle light slate hover states (`bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300`).

### 4.41. Elimination of Blur Artifacts & High-Contrast Domain Navigation Polish (`CurriculumExplorerView.jsx`)
- **Root-Cause Analysis of Subpixel Blur Artifact**:
  - A decorative background blur element (`bg-cyan-50/70 blur-3xl`) was statically anchored at `left-1/3 bottom-0 -mb-20 w-72 h-72`. Because the 3rd item in the 5-column grid ("Khoa học tự nhiên") occupies 40%-60% of the horizontal width, the 64px Gaussian blur filter sat directly behind this button.
  - When combined with semi-transparent tab backgrounds (`bg-slate-50/70`), Blink/Chromium's hardware compositor disabled subpixel font antialiasing over the blurred layer, causing the text, icon, and borders of "Khoa học tự nhiên" to appear faded, hazy, and tinted cyan relative to its crisp siblings.
- **Structural Layering & Contrast Rectification**:
  - Completely purged the uncontained background blur spheres from the card canvas, enforcing pure flat `bg-white` surface neutrality.
  - Wrapped the 5-domain grid in an explicit `relative z-10` stacking context to isolate tab interactions from any parent pseudo-elements.
  - Hardened inactive tab styling to 100% opaque `bg-white`, crisp `border-slate-200`, and high-contrast typography (`text-slate-800 font-bold group-hover:text-slate-900`) alongside neutral `bg-slate-100/90 text-slate-600` icon containers, guaranteeing 100% visual uniformity and legibility across all 5 domains.

### 4.42. Pattern Detail Header Decoupling & Full-Width Typography Architecture (`CurriculumExplorerView.jsx`)
- **De-coupling of Title & Multi-Button Action Row**:
  - Previously, the pattern detail view colocated identity badges, the `<h2>` pattern title, and three primary action buttons (`Mở Studio`, `Sửa nhanh`, `Luyện tập củng cố`) within a shared single-row flex container (`flex flex-col sm:flex-row items-center justify-between`).
  - Because the action buttons consume ~500px of horizontal width, the title element was compressed into an unsustainable ~180px column, forcing 4-word titles ("Nhận biết sự kiện lịch sử") to fragment into three cramped lines.
- **Hierarchical Two-Tier Header Layout**:
  - *Tier 1 (Metadata & Controls)*: Renders pattern classification badges (`selectedPattern.code`, `weight`, `level`) on the left, counterbalanced by the three action buttons on the right.
### 4.43. Comprehensive STEM & Humanities Catalog Expansion, Word Canvas Caret Editing, and Visual Cohesion Polish (`HierarchicalMathPalette.jsx`, `WordStyleFormulaCanvas.jsx`, `CurriculumStudioEditor.jsx`, `MathText.jsx`)
- **Unicode Replacement Character Sanitization & Icon Modernization**:
  - Identified corruption where unicode emoji bytes decoded as `\uFFFD` (diamond question mark ``) in the callout card heading 'Bài toán mẫu áp dụng phương pháp:'.
  - Implemented regex `^[^\p{L}\p{N}\s]+` to strip leading non-alphanumeric unicode corruption while preserving Vietnamese diacritics. Replaced all legacy emojis with crisp Lucide SVG icons (`FileText`, `BookOpen`) in warm amber tones.
- **Panoramic Ingestion & Pattern Header Clean White Synchronization**:
  - Replaced the dark navy gradient (`from-slate-900 via-indigo-950 to-slate-900`) on both the Panoramic Document Ingestion modal header and pattern detail subheader with clean white styling (`bg-white border-b border-slate-200 text-slate-900`), achieving 100% theme consistency across authoring workflows.
- **Word Equation Canvas Backspace & Line Management**:
  - Implemented `handleDeleteLine` and attached Backspace event handlers to `contentEditable` spans. When deleting at offset 0 or on empty lines, lines are merged or deleted naturally, mimicking Microsoft Word's editing behavior.
  - Removed unwanted footer advice text banner to maximize clean workspace area.
- **KaTeX Inspector Truncation Removal**:
  - Removed `truncate` class and expanded inspector KaTeX preview to `max-w-[280px]` with horizontal scroll, widening popup modal to `max-w-[540px]`, eliminating formula clipping (`...`) on long chemical and algebraic expressions.
- **Input Contrast Rectification in Question Creator**:
  - Fixed white-on-white text bug in Block 4 and `NewQuestionDialog` by explicitly declaring `text-slate-900 placeholder:text-slate-400 font-medium` across all textareas and option inputs (A-D).
- **GDPT 2018 National High-School Subject Library Expansion (Grades 10–12)**:
  - Multiplied formula catalog coverage across 7 full high-school subjects:
    - *Literature (Ngữ Văn)*: Rhetorical devices (So sánh, Ẩn dụ, Hoán dụ, Nhân hóa, Điệp ngữ, Nói quá, Nói giảm), Argumentation tactics (Giải thích, Phân tích, Chứng minh, Bác bỏ, Bình luận), Paragraph discourse structures, and Classical & Free poetic genres.
    - *Geography (Địa Lý)*: Population density, natural growth, urban ratio, climate amplitude, rainfall, balance of trade, economic structure %, agricultural productivity, and map coordinates.
    - *Biology (Sinh Học)*: Molecular genetics (DNA/RNA nucleotide counts, length, molecular mass, hydrogen bonds, translation), cell division (mitosis/meiosis, fertilization efficiency), and population genetics (Mendelian ratios, Hardy-Weinberg equilibrium).
    - *Advanced Math (Toán Học)*: Space analytic geometry Oxyz (plane/line equations, sphere, point-to-plane distance) and high-school probability & statistics (conditional probability, Bayes' theorem, expectation, variance, grouped frequency tables).

### 4.44. Unified MathLab JSXGraph Native Engine, 3D Spatial Geometry Vertex Customization, and High-Order (VD/VDC) Calculus Graphing Architecture (`InteractiveMathWorkbenchModal.jsx`, `CurriculumStudioEditor.jsx`, `CurriculumExplorerView.jsx`)
- **Native JSXGraph v1.14.0 Engine Unification & Third-Party Decoupling**:
  - Decoupled authoring workflows completely from external GeoGebra web-applet iframes, eradicating network latency, cross-origin security overhead, and offline unavailability.
  - Standardized on client-side JSXGraph v1.14.0 vector rendering at 60 FPS across both HTML5 Canvas and SVG backends.
  - Unified Ribbon navigation across `CurriculumStudioEditor.jsx` and `CurriculumExplorerView.jsx` with standard `⚡ MathLab 2D/3D (JSXGraph)` controls.
- **3D Spatial Geometry Vertex Repositioning & Renaming Architecture**:
  - Engineered reactive state-driven vertex configuration `customBasePoints` with an explicit toggle `isCustomizingBasePoints` positioned immediately below shape selection.
  - Enables educators to rename any canonical vertex (e.g., `A` to `M`, `S` to `P`, `A'` to `A₁`) and micro-adjust its 3D spatial coordinates `(X, Y, Z)` with 0.2 numerical step increments.
  - Real-time geometric graph recalculation: all associated frame edges, altitudes, projections, and cross-section polygons dynamically morph and anchor to updated vertex coordinates.
  - Integrated 1-click `🔄 Mặc định` reset button restoring canonical textbook geometry coordinates and labels.
- **Comprehensive 3D Spatial Geometry Library & Auxiliary Construction Suite**:
  - Supports 9 standard high-school geometries: rectangular pyramid (`SA` perpendicular to base), triangular pyramid (right-angled base), regular square pyramid (`SO` perpendicular to base), regular triangular pyramid (`SG` perpendicular to base), side-perpendicular pyramid (`(SAB)` perpendicular to base), triangular prism, rectangular box / cube, solids of revolution (cone/cylinder), and sphere-plane intersection.
  - Canonical exam presets: 2-step distance model `d(A, (SBC)) = AK` (`AH` perp `BC`, `AK` perp `SB`), line-to-plane angle `(SC, (ABCD))`, and cross-section polygons `(MNPQ)`.
  - Freehand auxiliary line and extra point studio: edge point interpolation (midpoint `1/2`, centroid `1/3`), and connecting arbitrary vertices with dashed/solid styles and customized palette colors.
- **Advanced 2D Calculus & High-Order Exam (VD/VDC) Graphing Engine**:
  - Integrated 6 core exam problem suites:
    1. Oblique asymptote rational functions (`y = (ax² + bx + c)/(dx + e)`) with automated vertical/oblique asymptotes and center of symmetry `I`.
    2. Composite absolute value transformations (`|f(x)|`, `f(|x|)`, `|f(|x|)|`, `|f(x) + m|` with vertical shift parameter slider and critical point counter).
    3. Derivative graph `f'(x)` and composite function intersection `f'(x) = h(x)` with root highlighting.
    4. Parametric linear intersection `y = ax + m` with real-time root multiplicity scanner and badge counters.
    5. Definite integral area bounded by 2 curves with numerical integration.
    6. Triple curve identification `f(x)`, `f'(x)`, `F(x)` with interactive student quiz toggle.

### 4.45. Standalone Live Math Renderer Component (`InteractiveMathRenderer.jsx`), Canonical Tag Serialization, and Educator-Student Visual Parity
- **Elimination of Static Screenshots & Pure Client Vector Rendering**:
  - Replaced the brittle approach of storing static PNG/JPG screenshots in question banks with a live vector rendering architecture.
  - Implemented `InteractiveMathRenderer.jsx` powered by JSXGraph v1.14.0, executing directly on client SVG/Canvas at 60 FPS.
  - Preserves full 3D interactive capabilities: students can freely rotate 3D geometries 360° via trackball mouse dragging, zoom in/out with the mouse wheel, inspect coordinates, reset viewpoints, and expand to fullscreen modals.
- **Canonical Metadata Tag Architecture (`mathGraphUtils.js`)**:
  - Devised human-readable, lossless, text-based tags:
    - `[MATH_GRAPH]...[/MATH_GRAPH]`: Serializes 2D function calculus types, parameters ($a, b, c, d, e$), custom expressions, auxiliary curves, parametric lines $y=mx+m$, and integration boundaries.
    - `[MATH_GRAPH_3D]...[/MATH_GRAPH_3D]`: Serializes 3D spatial models, dimensions, customized vertex labels & coordinates `(X, Y, Z)`, extra points with division ratios, and auxiliary lines with dashed/solid styles and palette colors.
  - Fully compatible with PostgreSQL database column types (`ContentLatex` and `Explanation` stored as unbounded `text`), requiring zero database schema changes or migrations.
  - AI Engine (Gemini) friendly: AI easily outputs structured tags in question JSON payloads during document parsing or exemplar question generation without escaping hazards.
- **Global `MathText.jsx` Integration & Deep System Reach**:
  - Expanded `MathText.jsx` block tokenizers to recognize `[MATH_GRAPH]`, `[MATH_GRAPH_3D]`, and `[MATH_GEOMETRY_2D]`.
  - Automatically activates live interactive rendering across all system views: Student Diagnostic Assessment (`DiagnosticAssessmentPage.jsx`), Diagnostic Modal (`DiagnosticTestModal.jsx`), Adaptive Practice Quiz (`AdaptiveQuizModal.jsx`), Studio Editor question bank & preview drawer (`CurriculumStudioEditor.jsx`), and Knowledge Explorer (`CurriculumExplorerView.jsx`).
- **Guaranteed Educator-Student Data & Visual Parity**:
  - Identical rendering algorithms ensure that what the educator constructs and fine-tunes in the authoring studio renders with 100% fidelity on the student's quiz screen.

### 4.46. Elimination of 3D Bounding-Box Wall Artifacts, Oxyz Coordinate Axis Toggle, and KaTeX Sample Problem Callout Parsing Architecture
- **Root Cause & Elimination of 3D Half-White Screen Artifact (`InteractiveMathRenderer.jsx` & `InteractiveMathWorkbenchModal.jsx`)**:
  - *Defect Diagnosis*: In JSXGraph's native 3D module, `board.create('view3d', ...)` instantiates default rear bounding box walls (`xPlaneRear`, `yPlaneRear`, `zPlaneRear`) with visible gray tiled grid meshes. Because the 3D bounding box coordinates range over $[-6, 6]$, these backplanes only encompass the rear quadrants. The front and right quadrant lacks walls, yielding an abrupt vertical dividing line where the left half displayed grids while the right half displayed plain white canvas—creating the visual illusion of a white block occluding the 3D figure.
  - *Architectural Resolution*: Explicitly disabled bounding box walls across both the view renderer and workbench modal (`xPlaneRear: { visible: false }, yPlaneRear: { visible: false }, zPlaneRear: { visible: false }, xPlaneFront: { visible: false }, yPlaneFront: { visible: false }, zPlaneFront: { visible: false }`). This provides a 100% uniform, clean, pure white background across the entire canvas viewport with zero vertical cutoff lines.
  - *Pedagogical Oxyz Axis Toggle (`Compass` Button)*: In standard Vietnamese GDPT 2018 geometry textbooks, synthetic spatial figures (tetrahedrons, pyramids, prisms) are presented without analytical coordinate axes. Added a dedicated `Trục Oxyz` toggle on the 3D renderer card toolbar. Coordinate axes default to hidden for authentic textbook aesthetics, while allowing educators and students to seamlessly inspect spatial coordinates with a single click.

- **Sample Problem Callout Parser Hardening & KaTeX Restitution (`MathText.jsx`)**:
  - *Defect Diagnosis*: The structured text parser in `MathText.jsx` matched pedagogical callouts via overly permissive substring matching `line.includes('Bài toán mẫu')`. Consequently, legitimate problem body lines (e.g. `**Bài toán mẫu:** Cho tứ diện $ABCD$...`) were hijacked into the callout heading handler. The heading cleaner then stripped the opening double asterisk via `^[^\p{L}\p{N}\s]+`, leaving an orphaned closing `**` (`Bài toán mẫu:**`) and injecting the entire problem text into a plain `<span>` element without passing through KaTeX tokenization.
  - *Architectural Resolution*:
    - Constrained `isSampleHeadingCallout` regex strictly to bona fide markdown headings (prefixed with `###` or standalone header emoji `[📝📄✍️]`).
    - Routed sample problem content directly to inline token stream, fully bolding `**Bài toán mẫu:**` and compiling all mathematical variables (`$ABCD$`, `$M, N$`, `$AB$`, `$AC$`, `$(DMN)$`, `$(BCD)$`) into native KaTeX mathematical serif typography.
    - Wrapped callout heading text in `renderInlineContent(cleanHeading, lineKey)` to ensure that even section headers containing math notation render flawlessly.
    - Augmented `normalizeMathString` with lookbehind regex repairs for orphaned bold markers (`(?<!\*)\b(Bài toán mẫu|...):\*\*` -> `**$1:**`).

---

### 4.47. Dynamic Mathematical Function Graph & Rational Variation Table Rendering Architecture (Zero-Hardcode)
- **Vector Variation Table Engine with Vertical Asymptotes (`VariationTable.jsx`)**:
  - *Rational Function Asymptote Rendering*: Extended the 3-row vector layout to represent rational functions with vertical asymptotes (`x = -d/c` for 1/1 and `x = -e/d` for 2/1). Supported standard Vietnamese textbook double vertical bar notation `||` in both the derivative row (`y'`) and the function variation row (`y`).
  - *Dynamic Direction Inference*: When LLMs omit the `dir` property, the component automatically infers arrow transitions directly from the signs of `y'` (`+` -> ascending arrow, `-` -> descending arrow, `||` -> split discontinuity), guaranteeing resilient rendering without visual clipping.
  - *Sanitized Delimiter Parsing*: Parser gracefully handles both pipe (`|`) and comma (`,`) delimiters while stripping extraneous LaTeX formatting artifacts.
- **2D Calculus Graph & Asymptote Rendering Engine (`InteractiveMathRenderer.jsx`)**:
  - *Automated Asymptote & Center of Symmetry Construction*:
    - For linear rational functions (`y = (ax+b)/(cx+d)`): Automatically calculates and renders the vertical asymptote `x = -d/c` (dashed line), the horizontal asymptote `y = a/c` (dashed line), and the intersection point representing the center of symmetry `I(-d/c, a/c)`.
    - For quadratic-over-linear rational functions (`y = (ax^2+bx+c)/(dx+e)`): Automatically calculates and renders the vertical asymptote `x = -e/d`, the slant/oblique asymptote `y = (a/d)x + (bd - ae)/d^2` (dashed line), and the center of symmetry `I`.
  - *Discontinuity Guard*: Configured JSXGraph `functiongraph` with `discontinuous: isRational`, eliminating false vertical connecting line artifacts across vertical asymptotes.
- **Curriculum Studio State Preservation**:
  - Maintained `sampleProblem` across the curriculum editor state cycle, ensuring that worked sample problems with variation tables and function graphs are preserved across pedagogical curation saves.

---

### 4.48. Client-Side Defensive Ingestion Sanitizer & Validation Resilience (`contentService.js`, `CurriculumExplorerView.jsx`)
- **Architectural Motivation**:
  - LLM extraction models output irregular formatting for multiple-choice answer keys (e.g. `"A."`, `"(B)"`, `"Đáp án C"`, integers `0..3`, or null).
  - To prevent client-side payloads from triggering ASP.NET Core deserialization failures on `POST /api/content/curriculum/import`, a defensive client-side sanitization layer was established.
- **Client-Side Sanitizer Engine (`contentService.js`)**:
  - `normalizeCorrectOption(raw)`: Strips non-alphanumeric punctuation and extracts isolated single uppercase tokens `'A'`, `'B'`, `'C'`, `'D'`. Handles ordinal integer mappings (`0->A`, `1->B`, `2->C`, `3->D`).
  - `sanitizeCurriculumPayload(payload)`: Traverses hierarchical trees (`chapters` -> `lessons` -> `patterns` -> `questions`), ensuring all question items carry compliant single-character `correctOption` fields, valid integer `difficultyLevel`, and default empty strings for options.
- **Problem Details Error Formatter (`CurriculumExplorerView.jsx`)**:
  - Unrolls RFC 9110 `errors` dictionaries returned by backend validation handlers, rendering actionable line-item error diagnostics rather than opaque JSON dumps.

### 4.49. Hierarchical Chapter & Lesson Cascade Deletion and Multi-Dimensional Knowledge Taxonomy Classification Architecture (`CurriculumExplorerView.jsx`)
- **Hierarchical Node Deletion & Cascade Management (`DELETE /api/content/curriculum/nodes/{id}`)**:
  - *Pedagogical & Structural Control*: Empowered educators and curriculum administrators with direct node pruning capabilities at all three tiers of the knowledge tree.
  - *Cascade Warning Dialogs*: Initiates pre-flight confirmation prompts detailing the count of child lessons, patterns, materials, prerequisite DAG edges, and question items marked for irreversible removal.
  - *Backend Cascade Orchestration*: Leverages the recursive descendant collector (`CollectDescendantIds`) in Content Service, cascading deletions cleanly across `Skills`, `Materials`, `SkillPrerequisites`, and `Questions`.
  - *Client State Synchronization*: Triggers `fetchCurriculumData()` post-deletion and safeguards selected pattern pointers to prevent null reference errors on right-hand detail panels.
- **Dynamic Node Creation Suite (`+ Thêm Chương Mới` & `+ Thêm bài`)**:
  - *Chapter Provisioning Modal (`CreateChapterModal`)*: Enables instructors to create top-level chapters (`ParentId == null`) tagged with Grade Level (10, 11, 12), Academic Year (2025-2026, 2024-2025), Domain/Sub-Subject affiliation, normalized weight, and syllabus competencies.
  - *Lesson Provisioning Modal (`CreateLessonModal`)*: Binds child lessons to selected chapters (`ParentId == Chapter.SkillId`), dynamically expanding the target chapter upon successful creation.
- **Multi-Dimensional Taxonomy Filter Toolbar (`Bộ Lọc Phân Loại Tri Thức`)**:
  - *Sub-Subject Disaggregation*: Bridges broad competency domains into dedicated subject tracks:
    - **Natural Sciences**: Physics, Chemistry, Biology.
    - **Social Sciences**: History, Geography, Economic & Legal Education (GDKT & PL).
    - **Language**: Vietnamese / Literature, English.
    - **Mathematics & Quantitative Reasoning**: Algebra & Calculus, Geometry & Measurement, Probability & Statistics, Logic & Data Analysis.
  - *Grade-Level Categorization*: Supports instant one-click filtering across `Grade 12 (Core V-ACT)`, `Grade 11`, `Grade 10`, and `All Grades`.
  - *Academic Year Alignment*: Allows segregation by syllabus cycles (`2025 - 2026 GDPT 2018 New Framework` vs `2024 - 2025`).
  - *Live Match Aggregation & Reset*: Computes real-time match counts for chapters and lessons, providing a one-click reset action whenever filters are active.

### 4.50. 2D Flat Notebook Paper Grid Architecture for 3D Spatial Geometry Canvas (`InteractiveMathRenderer.jsx`, `InteractiveMathWorkbenchModal.jsx`, `index.css`)
- **Pedagogical Motivation**:
  - In Vietnamese high school mathematics education (GDPT 2018), 3D spatial geometry diagrams (pyramids, prisms, tetrahedrons) are traditionally drafted on 2D ruled notebook graph paper.
  - A plain white background lacks depth reference, while tilted 3D perspective grids / bounding box walls distort spatial perception and clutter geometric wireframes.
  - A flat 2D notebook paper grid background provides familiar visual anchoring without interfering with the 3D trackball rotation of spatial objects.
- **Dual-Layered CSS Grid Implementation (`index.css`)**:
  - Implemented `.bg-grid-notebook` utilizing concentric CSS linear gradients:
    - Minor grid: `20px x 20px` subtle rulings in `#e2e8f0` (1px line width).
    - Major grid: `100px x 100px` accented rulings in `#cbd5e1` (1px line width) on pure white `#ffffff`.
  - The grid is rendered at the container level as a 2D stationary background plane (`background-size: 100px 100px, 20px 20px`).
- **JSXGraph SVG Canvas Transparency Override**:
  - JSXGraph boards inject an internal `<svg>` element with default opaque white background (`background-color: #ffffff !important;`).
  - Added high-specificity CSS rule:
    ```css
    .jxgbox.jxgbox-3d-grid svg {
      background-color: transparent !important;
      background: transparent !important;
    }
    ```
  - Allows the container's 2D notebook grid to show through cleanly beneath the rotating 3D geometry wireframes.
- **Component Application**:
  - `InteractiveMathRenderer.jsx`: Applies `bg-grid-notebook jxgbox-3d-grid` dynamically whenever `is3D === true`.
  - `InteractiveMathWorkbenchModal.jsx`: Applies `bg-grid-notebook jxgbox-3d-grid` when rendering the 3D spatial geometry lab (`jsxSubTab === '3d_space'`).

### 4.51. High-Precision 3D Vector Coordinate System (Oxyz) & Interactive Visibility Toggle Architecture (`InteractiveMathRenderer.jsx`, `InteractiveMathWorkbenchModal.jsx`)
- **Architectural Motivation**:
  - In Vietnamese curriculum GDPT 2018 (Grade 12 V-ACT assessment), problems often transition between synthetic geometry (uncoordinated wireframe) and analytic coordinate geometry (algebrization via $Oxyz$ frame).
  - Built-in JSXGraph `axis3d` elements do not support arrowheads, omit the origin label $O$, and fail to synchronize visibility across nested 2D SVG canvas primitives when manipulated dynamically.
- **Dedicated Vector Oxyz Coordinate Axis Engine**:
  - Disabled opaque default axes via `axesPosition: 'none'`.
  - Implemented dedicated 3D vector axes with standard mathematical conventions:
    - Origin point $O(0, 0, 0)$ with dark slate label (`#334155`).
    - $Ox$-axis: Directed ray from $(0, 0, 0)$ to $(5.5, 0, 0)$ with bold red styling (`#ef4444`, `strokeWidth: 2`, `lastArrow: true`, label $x$).
    - $Oy$-axis: Directed ray from $(0, 0, 0)$ to $(0, 5.5, 0)$ with vibrant emerald styling (`#10b981`, `strokeWidth: 2`, `lastArrow: true`, label $y$).
    - $Oz$-axis: Directed ray from $(0, 0, 0)$ to $(0, 0, 6.5)$ with royal blue styling (`#3b82f6`, `strokeWidth: 2`, `lastArrow: true`, label $z$).
    - Negative dashed rays ($Ox^-, Oy^-, Oz^-$) in muted tint colors (`dash: 2`) providing depth cues during 360° trackball rotation.
- **Imperative Visibility Orchestration (`axesElementsRef`)**:
  - Stores all 3D and underlying 2D SVG line and point primitives in a mutable `axesElementsRef.current` collection.
  - On toggle (`handleToggleAxes`), iterates through all references calling both `.setAttribute({ visible: next })` and `.element2D.setAttribute({ visible: next })` followed by atomic `board.update()`.
  - Toolbar button provides active visual feedback with solid indigo fill (`bg-indigo-600 text-white shadow-xs`) and dynamic text "Đang bật Oxyz".

### 4.52. Enterprise Global Toast Notification & Browser Alert Interception Architecture (`ToastContext.jsx`, `GlobalToastContainer.jsx`, `main.jsx`, `index.css`)
- **Architectural Motivation**:
  - Legacy web applications often rely on native browser modal dialogues (`window.alert()`), which block the JavaScript single thread, freeze browser tab interactions, disrupt smooth CSS animations, and degrade the user experience for students and instructors.
  - V-Eval requires a non-intrusive, reactive, high-priority notification system that provides immediate visual feedback across asynchronous microservice operations (content curation, AI question generation, exam submissions, and IAM operations).
- **Core Architecture Components**:
  - **Global Toast Container (`GlobalToastContainer.jsx`)**:
    - Placed at the top-right viewport anchor (`top-4 right-4 sm:top-6 sm:right-6`) with highest stacking context `z-[999999]`, ensuring toasts remain visible above all full-screen modals, drawers, and panoramic workspaces.
    - Features a modern Glassmorphism visual language (`backdrop-blur-md bg-white/95 border shadow-xl rounded-2xl`).
    - 4 distinct semantic status variants:
      - `success`: Emerald badge (`CheckCircle2`), emerald border, and emerald progress bar.
      - `error`: Rose badge (`AlertCircle`), rose border, and rose progress bar.
      - `warning`: Amber badge (`AlertTriangle`), amber border, and amber progress bar.
      - `info`: Indigo badge (`Info`), indigo border, and indigo progress bar.
    - Dynamic linear countdown progress bar visually reflecting remaining auto-dismiss duration (default: 4000ms).
    - Intelligent interactive hover pausing: Hovering the cursor over any active toast card (`onMouseEnter` / `onMouseLeave`) freezes the dismissal timer, allowing users to comfortably read extended error traces or instructions.
  - **Universal Context & Singleton Dispatcher (`ToastContext.jsx`)**:
    - Implements a Dual-Mode dispatch interface:
      1. React Hook: `useToast()` providing `{ toasts, showToast, dismissToast, toast }` within standard React lifecycle.
      2. Universal Singleton Object: `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`, `toast.dismiss()` invocable anywhere in the client codebase—including non-React utility files, Axios interceptors, or background event listeners.
  - **Defensive Browser Alert Interception Layer**:
    - Automatically overrides `window.alert()` upon component mount, forwarding raw string messages directly to `toast.info(...)` (or `toast.error` for failure patterns).
    - Guarantees zero blocking pop-ups can ever disrupt the end-user, even if legacy or third-party code invokes `alert()`.
- **System-Wide Migration**:
  - Migrated 100% of legacy `alert()` invocations across `CurriculumExplorerView.jsx`, `CurriculumStudioEditor.jsx`, `DiagnosticAssessmentPage.jsx`, `CampusManagerDashboardView.jsx`, `AccountProvisioningView.jsx`, and `ClassMicroGroupsModal.jsx`.

### 4.53. In-App Confirmation Modals, Lightweight Quick Metadata Editing & KaTeX Strict Mode Optimization (`CurriculumExplorerView.jsx`, `CurriculumStudioEditor.jsx`, `MathText.jsx`)
- **Zero Native Browser Confirm / Modal Architecture**:
  - Eliminated legacy blocking `window.confirm()` calls across all curriculum administration workflows.
  - Implemented an elegant in-app confirmation modal (`confirmDeleteDialog`) in `CurriculumExplorerView.jsx` featuring high-contrast risk styling (`border-rose-200`, `bg-rose-50/70`, `Trash2` action button), clearly communicating cascade impacts before deleting Chapters, Lessons, or Skill Patterns.
  - In `CurriculumStudioEditor.jsx`, implemented a two-tap inline deletion confirmation flow for test questions, featuring a temporary countdown state that auto-resets if unconfirmed.
- **Lightweight Metadata-Only Quick Edit Suite (`isEditModalOpen`)**:
  - Replaced the cumbersome 5-tab pedagogical editing modal with a focused, single-purpose metadata dialog.
  - Restricts modifications strictly to structural node attributes: Pattern Name/Title, Parent Chapter selection, High School Grade level (Grade 10, 11, 12), Bloom Cognitive Level, and Competency Weight (%).
  - Offloads deep pedagogical composition (theory, stepwise KaTeX methods, video URLs, and JSXGraph interactive canvas) exclusively to the full-screen Curriculum Studio Editor via a prominent quick-launch banner.
  - Streamlined the trigger control from text "Sửa nhanh" to a minimalist `<Pencil className="w-4 h-4" />` icon button.
- **KaTeX Strict Mode Unicode Character Resolution (`MathText.jsx`)**:
  - Configured `strict: 'ignore'` in `renderKatexHtml` to eliminate spurious developer console warnings regarding Vietnamese characters (such as "Đ") embedded within mathematical expressions (`[unicodeTextInMathMode]`).
- **Immediate First-Pattern Chapter Loading**:
  - Refactored `toggleChapter` and `toggleLesson` to automatically expand and select the first available pattern, ensuring the right pedagogical workspace pane immediately loads content upon chapter navigation.

### 4.14. Core Flow 4 Frontend Integration: Socratic AI Tutor & GraphRAG Live Streaming
- **Real-Time Token Streaming Client (`practiceService.js`)**: Implemented `askAiTutorStream` using native Fetch API and `ReadableStream` reader with `TextDecoder`. Directly consumes `POST /api/practice/ai-tutor/ask-stream` through Gateway (`:5212`).
- **Graceful Rate Limiting Handlers**: Intercepts HTTP 429 status codes enforced by the backend `StrictTutorPolicy` (10 req/min), transforming network exceptions into supportive, pedagogical throttle notifications in the UI.
- **Upgraded Socratic Dashboard Widget (`AISocraticTutorWidget.jsx`)**: Replaced 100% mock setTimeout mechanisms with real-time SSE token-by-token streaming, KaTeX math parsing via `MathText.jsx`, abort controller cancellation, and GraphRAG knowledge attribution badges.
- **Two-Column Socratic Dialogue Modal (`AISocraticTutorModal.jsx`)**: Built a comprehensive modal interface featuring guided dialog history, quick question prompts, 3-Hop Subgraph inspection (Archetype patterns, core theorems, misconception traps), and an in-chat student reporting dialog (`POST /api/practice/ai-tutor/report`) for flagging pedagogical violations.
- **Router Alignment (`App.jsx` & `Sidebar.jsx`)**: Corrected navigation routing so clicking *AI Socratic Tutor* on the sidebar or hero banner opens the dedicated tutor modal instead of erroneously triggering the Flow 3 adaptive quiz modal.

### 4.15. Contextual Socratic Problem-Solving & In-Exam Adaptive Assistance (Phase 2)
- **ZPD Adaptive Quiz Socratic Hooks (`AdaptiveQuizModal.jsx`)**: Integrated real-time Socratic pedagogical assistance directly into the Flow 3 adaptive practice loop. Features both reactive post-answer triggers and a 45-second contemplation nudge (`secondsOnQuestion >= 45`) for students hesitating on difficult questions. Packages the complete question context (`questionId`, `question`, `options`, `skill`, `selectedWrong`, `correctOption`, `difficultyB`, `predictedProb`) and transitions seamlessly to the Socratic Tutor.
- **DTO Sanitization & Robust Gateway Proxying (`practiceService.js`)**: Implemented `ensureGuid`, `cleanOptionKey`, and `normalizeOptions` ensuring runtime payloads strictly comply with ASP.NET Core `AskTutorRequest` schema (Guid format, Dictionary options, single character option keys). Employs `onInteractionId` callback to bind streamed session IDs.
- **Dynamic Contextual Dialogue Orchestration (`AISocraticTutorModal.jsx`)**: Configured dynamic context ingestion via `initialContext`. Features an active *Target Context Banner*, initializes targeted Socratic inquiry addressing the student's specific misconception instead of generic greetings, and forwards contextually enriched `questionLatex` alongside options dictionary.
- **Diagnostic In-Exam Socratic Modernization (`DiagnosticAssessmentPage.jsx`)**: Refactored `handleAskSocraticTutor` from deprecated legacy endpoints to the unified `practiceService.askAiTutorStream` pipeline via Gateway `:5212`, ensuring seamless Rate Limit compliance (10 req/min) and consistent math rendering during 30-question diagnostic assessments.
- **Submission History & Socratic Mistake Notebook (`SubmissionHistoryView.jsx` & `practiceService.js`)**: Implemented a comprehensive exam history and mistake notebook subsystem synchronizing with Backend Practice Service (`GET /api/practice/diagnostic-submissions/student/{studentId}`, `GET /api/practice/diagnostic-submissions/{id}`, `GET /api/practice/mistakes`) and persistent local history storage. Enables students to revisit any past Diagnostic Exam, ZPD Adaptive Quiz, or Topic Quiz, inspect full answer keys, and invoke inline or modal Socratic AI guidance on any historical question.

### 4.16. Core Flow 5 Frontend Integration: Multi-Stakeholder Learning Analytics & 2D Class Heatmap
- **Unified Gateway Path Alignment & Core Flow 5 Client (`practiceService.js`)**: Standardized all Practice Service client calls onto `/api/practice/...` matching YARP Gateway (`:5212`) routing rules without `/v1` prefix stripping. Implemented `getStudentDashboard`, `getClassHeatmap`, `forceAggregateClassHeatmap`, `getParentDashboard`, and `getCampusComparativeHeatmap` with deterministic GUID validation (`FLOW5_DEFAULTS`) and offline-resilient DTO fallbacks verified by automated unit tests (`practiceService.flow5.test.js`).
- **Student Learning Analytics Center (`LearningAnalyticsView.jsx`, `MetricsGrid.jsx`, `HeroBanner.jsx`, `RadarChartModal.jsx`)**: Wired `GET /api/practice/analytics/student/{studentId}/dashboard` across the Student Dashboard and dedicated `analytics` route. Delivers Ghost Onboarding detection (`needsOnboarding`), dual-polygon 4-domain Recharts Radar (`DOM_LANG`, `DOM_MATH`, `DOM_NAT_SCI`, `DOM_SOC_SCI`), 7-day active study streak tracker with Streak Freeze shield indicators, DAG milestone progression, and standardized mock exam history.
- **Teacher 2D Class Heatmap & Offline Micro-Group Intervention (`TeacherDashboardView.jsx`)**: Replaced static `mockTeacherHeatmap` with live `GET /api/practice/classes/{classId}/heatmap` and on-demand sweep `POST /api/practice/classes/{classId}/heatmap/force-aggregate`. Supports multi-class switching, domain and mastery threshold filtering, Bimodal polarization badges (`isBimodal`), `CRITICAL_RED` / `WARNING_AMBER` pedagogical alert banners, and 1-click transition into `ClassMicroGroupsModal` for 3–5 student table partitioning and adaptive worksheet assignment.
- **Parent Companion Portal & Campus Comparative Heatmap (`ParentDashboardView.jsx`, `CampusManagerDashboardView.jsx`)**: Wired `GET /api/practice/analytics/parent/{parentId}/children` to render composite Exam Readiness Index `` `R_{\text{exam}}` `` with 3-factor progress bars (50% Normalized Theta, 35% BKT Coverage, 15% Consistency), verified 12h/week self-study discipline tracking, and curated AI parent guidance. Integrated `GET /api/practice/analytics/campus/{campusId}/comparative-heatmap` into the Academic Manager Portal for cross-class 4-domain mastery comparison and vulnerability governance.

---

### 4.17. End-to-End Diagnostic-to-Analytics Synchronization & Local History Hydration (Core Flow 1 -> Core Flow 5)
- **Write-Through Diagnostic Persistence & Identity Key Alignment (`DiagnosticAssessmentPage.jsx`, `practiceService.js`)**: Resolved the `user.id` vs `user.userId` identity mismatch during diagnostic completion and wired `syncSubmissionToBackend` (`POST /api/practice/diagnostic-submissions`) alongside client question metadata (`correctOption`, `domainId`, `skillId`, `difficultyLevel`) so both database-backed and AI-generated 30-question diagnostic exams persist directly into PostgreSQL.
- **Immediate Local History Hydration & Background Backfill (`practiceService.js`)**: Implemented `hydrateStudentDashboardWithLocalHistory` and `syncUnsyncedSubmissions`. Whenever a student already holds real completed assessments in `veval_submission_history_v1` while the upstream API still reports `needsOnboarding = true`, the client deterministically computes real V-ACT `0..1200` scaled scores, `Theta_0`, 4-domain accuracy polygons, rolling 7-day study streaks, and recent exam records from actual question-level submissions while asynchronously backfilling unsynced exams to the backend.
- **Live Reactive Telemetry Across Shell & Analytics Views (`App.jsx`, `LearningAnalyticsView.jsx`, `Navbar.jsx`, `Sidebar.jsx`)**: Broadcasts `CustomEvent('veval:submission-updated')` on submission save/delete and replaces static shell placeholders (`12 Ngày` in `Navbar`, `+0.65 / 82%` in `Sidebar`) with live student metrics from `studentDashboard`.
- **Streamlined Single-Column Socratic Chat Interface (`AISocraticTutorModal.jsx`, `AISocraticTutorWidget.jsx`)**: Removed hardcoded static side panels (`3-Hop Knowledge Network`, `ARCH_LOGIC_01`, static propositional logic theorems, and misconception cards) and static topic badges, delivering a clean, distraction-free Socratic dialogue modal that dynamically reflects only the student's active question context.

---

### 4.18. Dashboard Metrics Precision, Autonomous DAG Roadmap Activation & Compact Floating AI Tutor FAB
- **Compact Floating Action Button (FAB) Architecture (`App.jsx`)**: Replaced the cumbersome embedded `AISocraticTutorWidget` inside the 2-column main dashboard grid with a sleek, non-intrusive Floating Action Button positioned at the bottom-right corner (`fixed bottom-6 right-6 z-40`). Featuring a pulsating aura, 24/7 online green telemetry badge, and hover preview tooltip, the floating controller immediately opens `AISocraticTutorModal` upon interaction, freeing the central dashboard column exclusively for analytical metrics and milestone progression.
- **Parametric Roadmap Synchronization & Diagnostic Transition (`MilestoneCard.jsx`, `practiceService.js`)**: Parametrized `getMyRoadmap(studentId)` with `?studentId={guid}` query arguments and `X-User-Id` request headers compliant with `RoadmapsController.cs`. Eliminated false onboarding blockers: students with completed diagnostic exams immediately load their persisted 470-milestone DAG stages (`Chặng 01 (Tổng hợp): Luyện tập chuyên đề thích ứng`) and active learning tasks (`Chương 01: Quan Hệ Song Song`, etc.) rather than being prompted to re-take the 30-question diagnostic test.
- **Score Degradation Prevention & Local History Filtering (`practiceService.js`, `LearningAnalyticsView.jsx`)**: Filtered out empty/aborted `EXPIRED` diagnostic attempts in `getRealUserSubmissions` and strengthened `hydrateStudentDashboardWithLocalHistory` to preserve backend IRT score estimates (320 / 1200, confidence interval `275 - 365`). Eliminated the regression where unfinished test sessions downgraded estimated scores to `0 / 1200` (`0 - 45`).

---

### 4.19. Decoupling Freeform Inquiries & Greetings from Exam Question Retrieval
- **Dual Interaction Modes (`AISocraticTutorModal.jsx`)**: Formally decoupled the Socratic dialogue workflow into *Question Review Mode* (when `initialContext?.question` is active with an explicit exam question, option set, and student chosen answer) and *General Guidance / Exploration Mode* (invoked from the floating launcher).
- **Zero Dummy Options Injection (`practiceService.js`)**: Refactored `normalizeOptions` to return `null` when no options are present, terminating the fabrication of artificial `{ A: 'Phương án A', B: 'Phương án B' }` payloads. Passes `"NONE"` for non-existent option keys to satisfy backend validation contracts while explicitly instructing the AI engine not to fabricate false accusations of choosing wrong choices.
- **Greeting Detection & Warm Socratic Initiation**: Implemented regex-based greeting recognition in `buildRichSocraticFallback` and downstream services, delivering an encouraging greeting and inviting students to ask pedagogical questions without triggering false vector queries or hallucinated math problem analyses.

---

### 4.20. Diagnostic Exam History Retention & Socratic Stream Error Resilience
- **Holistic Exam History Detection (`MilestoneCard.jsx`)**:
  - Implemented `checkExamHistory` inspecting `studentDashboard.recentMockExams`, `streakAnalytics`, historical submissions in `practiceService`, and client-side flags in `localStorage`.
  - Added `studentDashboard` into the `useEffect` dependency array, ensuring instant re-evaluation upon analytics hydration.
  - Automatically unblocks students who have already completed assessments, rendering adaptive learning stages (`mockMilestone`) rather than repeating the introductory 30-question diagnostic CTA.
- **Socratic Stream Hanging Elimination (`AISocraticTutorModal.jsx`, `practiceService.js`)**:
  - Cleaned up `isTyping = false` and aborted `AbortController` in `onError` callbacks, preventing infinite three-dot `...` animations when upstream network cuts out or Gateway timeouts occur.
  - Removed artificial parameter defaults `studentWrongOption = 'A'` and `correctOption = 'B'` from `practiceService.askAiTutorStream`.

---


### 4.21. Resilient Roadmap Auto-Generation & Floating Socratic FAB Integration
- **Autonomous Roadmap Generation Fallback (MilestoneCard.jsx)**:
  - Decoupled !studentDashboard.needsOnboarding check so that completed onboarding or non-empty
ecentMockExams immediately certifies exam completion, regardless of initial estimated score zero state.
  - Added utoGenRoadmap invoking practiceService.generateRoadmap with the student\'s completed diagnostic submission ID when a roadmap has not yet been persisted in PostgreSQL, permanently eliminating the re-diagnostic prompt.
- **Sleek Floating Action Button Integration (App.jsx)**:
  - Replaced the central dashboard inline AI Tutor box with a non-intrusive floating action button in the bottom-right corner, freeing the dashboard exclusively for core metrics and active milestone progress.
- **Verification**:
  -
pm run build completes in 905ms (3,013 modules transformed, 0 errors).

---

### 4.22. SSE Error Swallowing Elimination & Persistent Three-Dot `...` Mitigation
- **Decoupled Stream Parsing & Exception Dispatch (`practiceService.js`)**:
  - Isolated `JSON.parse` into its own localized try-catch scope, preventing unhandled format errors from suppressing genuine business exceptions (`parsed.error`).
  - Explicitly forwarded upstream error objects to `onError(streamErr)` before propagating.
- **Zero-Blank-Content Guardrail (`AISocraticTutorModal.jsx`)**:
  - Injected an automatic pedagogical greeting when `onComplete` resolves with empty accumulated tokens, ensuring the message bubble is never populated by raw empty string `""` which previously manifested as stalled `...`.
  - Linked HTTP 429 rate limit errors to user-facing conversational bubbles advising students to take time to reflect before posting subsequent inquiries.
- **Verification**:
  - `npm run build` completes cleanly with 0 errors.

---

### 4.54. Universal WYSIWYG Formula Canvas, Drag-and-Drop Variation Table & Redesigned Formula/Compound Studio Library (`WordStyleFormulaCanvas.jsx`, `VariationTable.jsx`, `HierarchicalMathPalette.jsx`, `CurriculumStudioEditor.jsx`, `InteractiveMathWorkbenchModal.jsx`, `InteractiveMathRenderer.jsx`, `mathGraphUtils.js`)
- **Universal In-Place Visual Formula Rendering & Drag-and-Drop Variation Table (`VariationTable.jsx`)**:
  - Extended `WordStyleFormulaCanvas.jsx` with `compact` and `singleLine` layout variants, HTML5 drag-and-drop drop zones (`handleDropSnippetOnCanvas`), and embedded block-level parsers for `[VARIATION_TABLE]`, `[MATH_GRAPH]`, `[MATH_GRAPH_3D]`, `[MATH_GEOMETRY_2D]`, and Markdown images.
  - Upgraded `VariationTable.jsx` and `InteractiveFormulaBuilderModal.jsx` with a **Zero-Jump `2N - 1` Column Grid Architecture (`normalizeVariationGrid`)**: aligns every milestone `x_m` vertically above its derivative zero/asymptote (`0` or `||`) and extremum `y_m`, while placing interval signs (`+`/`-`) and SVG diagonal arrows directly in odd interval columns (`2k + 1`). Fixed row heights and a bottom-docked Drag-and-Drop / Quick-Edit bar guarantee zero layout shifting when clicking cells.
  - Redesigned `HierarchicalMathPalette.jsx` into a color-coded 7-domain Studio Library where every formula and chemical compound chip renders live KaTeX typography on a draggable visual tile (`draggable={true}`) and includes a dedicated `variation_table` category.
  - Replaced raw `<textarea>` and `<input>` controls in Block 2 (`examTraps`, `casioTricks`) and Block 4 (`sampleQuestion.contentLatex`, `optionA..D`, `explanation`) with `<WordStyleFormulaCanvas />`, eliminating raw LaTeX code exposure, stray wrapping single quotes `'...'`, and trailing backslashes `\`.
  - Standardized Bloom taxonomy level matching via `normalizeBloomLevel` so cognitive level buttons (`L1`–`L4`) always reflect active pattern state.
- **Full-Featured 2D Plane Geometry Studio & `[MATH_GEOMETRY_2D]` Serialization**:
  - Implemented `getDefault2DGeometryPoints`, `formatMathGeometry2DTag`, `parseMathGeometry2DTag`, `SHAPES_2D_META`, and `mount2DGeometryBoard` in `src/utils/mathGraphUtils.js`.
  - Supports 6 canonical plane geometry configurations (`right_triangle`, `acute_triangle`, `circle_tangent`, `quadrilateral_cyclic`, `parallelogram_rhombus`, `trapezoid_right`) with exact perpendicular altitude projection, right-angle square markers, non-overlapping label offsets for `H` and `M`, interactive vertex `(X, Y)` coordinate editing, custom ratio points, and dashed/solid auxiliary segments.
- **Empty-Slot Preservation & Sub-Slot Drag-and-Drop Resilience (`VariationTable.jsx`, `WordStyleFormulaCanvas.jsx`)**:
  - Preserves empty cells in `parseVariationTableString` when splitting `x:` and `y:` rows by `|` and renders an inline `Thả số` drop prompt in `renderMath`, ensuring clearing a cell's text never collapses the column or prevents subsequent drag-and-drop insertion.
  - Added `lastCommittedContentRef` and `handleDropOnFormulaInput` in `WordStyleFormulaCanvas.jsx` so clearing a formula sub-slot (`num`, `den`, `result`, `base`, `exp`, `expr`, `latex`) never destroys the active formula token and allows direct drag-and-drop replacement into any sub-slot or cleared editor canvas.

### 4.55. AI-Powered Adaptive Question Generator for Curriculum Studio Editor (`CurriculumStudioEditor.jsx`, `aiService.js`, `contentService.js`)
- **Dual-Action Trigger & Persistent Pattern Validation**:
  - Implemented prominent `✨ AI Sinh Câu Hỏi` action buttons on Block 4 ("Ngân Hàng Câu Hỏi Dạng Bài & Bài Toán Mẫu") header and the empty question list fallback state.
  - Guards against orphan question creation: verifies if `form.patternId` or `pattern.patternId` exists in the database; if not, alerts the instructor with a non-blocking toast to save the pattern first before initiating batch generation.
- **Batch Adaptive Question Generator Modal (`AiQuestionGeneratorModal`)**:
  - Allows educators to configure question batch count (`1`, `2`, `3`, `5`) and target Bloom cognitive taxonomy (`L1` Knowledge to `L4` High Application).
  - Integrates `aiService.generatePatternQuestions` calling the backend AI Engine endpoint `POST /api/ai-engine/curriculum/generate-questions` with full pedagogical context: `patternName`, `lessonName`, `domainName`, `theoryRecap`, `solutionMethod`, and `existingQuestions` for anti-duplication.
  - Interactive preview card layout featuring KaTeX mathematical typography rendering (`<MathText />`), 2x2 multiple-choice option grid with emerald-highlighted correct answers, stepwise explanations, individual selection checkboxes, and a select-all toggle.
  - Batch persistence via `contentService.createQuestion` (`POST /api/content/questions` API 16), immediately appending saved questions to the local state.
- **1-Click AI Auto-Fill in Manual Creation Dialog (`NewQuestionDialog`)**:
  - Added an inline `✨ AI Tự Điền Câu Hỏi` button in the manual question modal that calls `aiService.generatePatternQuestions` (count: 1) to automatically populate question content, options A–D, correct answer, Bloom level, and detailed explanation in a single tap.

### 4.56. Two-Row Text Ribbon & Section Header STEM Dropdown Architecture (`StemToolsDropdown` in `CurriculumStudioEditor.jsx`)
- **Section Header Dropdown & 2-Tier In-Canvas Editorial Layout**:
  - Anchors the consolidated `StemToolsDropdown` independently inside the overarching Section Header of each active editing block (Block 1 `theoryRecap` and Block 2 `solutionMethod`).
  - Restructures the in-canvas editorial toolbar into 2 distinct, purpose-driven rows:
    + **Row 1 (Above Text Controls)**: Hosts content-insertion actions (`+ Ví Dụ SGK` in Block 1 or `+ Thêm Bước mới`, `Nạp mẫu chuẩn 4 bước` in Block 2; images pasted directly via Ctrl+V) on the left, and view mode switchers (`✍️ Sửa Trực Tiếp`, `👁️ Trang In`, `📄 Raw`) on the right.
    + **Row 2 (Pure Text Formatting)**: Exclusively reserves text typography styling (`Văn bản: Bold`, `Italic`, `Heading/Step`, `Bullet List`, `Numbered List`), ensuring an uncluttered, zero-wrap Microsoft Word style user experience.
- **Graphing & MathLab Consolidation**:
  - Merged two redundant visual controls (`Function Graph Oxy` and `MathLab 3D/2D`) into a single high-capability entry point: `📈 Đồ Thị & MathLab (2D/3D)`, which directly launches the full JSXGraph interactive studio covering 2D algebraic curves, 2D synthetic plane geometry, and 3D rotatable spatial figures.
  - Houses the complete STEM formula builder suite: Variation Table 3-row vector grid, Consolidated MathLab, Fraction & Arithmetic calculator, Difference quotient derivative, and Chemical molarity formulas.

### 4.57. Studio-Grade 2-Column Formula & STEM Builder Modal (`InteractiveFormulaBuilderModal.jsx`) & Mega-Dropdown Architecture (`StemToolsDropdown`)
- **Studio-Grade 2-Column Modal Architecture (`InteractiveFormulaBuilderModal.jsx`)**:
  - Re-engineered the formula builder modal from a constrained `max-w-2xl` dialog into an expansive, high-productivity Studio modal (`max-w-5xl h-[88vh] max-h-[840px]`).
  - Implements a modern 2-column studio layout:
    + *Left Category Sidebar (`w-72`)*: Neatly segments tools into "Mathematics & Calculus" (Variation Table, Fractions, Radicals, Powers, Integrals, Systems, Oxy Function Graphs) and "STEM & Empirical Chemistry" (Molarity, Mass, Concentration, Reaction Yields). Employs rich Lucide icons (`Table2`, `Divide`, `Activity`, `FlaskConical`, etc.), descriptive dual-line subtitles, and vibrant indicator accents.
    + *Right Interactive Canvas (`flex-1`)*: Delivers spacious visual editors for each domain. Embeds the full-width `<VariationTable />` (700px+) without horizontal cramping, maintaining full access to the bottom Drag-and-Drop quick edit bar. Chemistry formulas feature 4 auto-calculating cards with standard units (`mol`, `L`, `g`, `g/mol`) and real-time emerald computation badges.
    + *Floating KaTeX Live Preview Dock*: Renders instant KaTeX mathematical typesetting in an elevated preview dock with keyboard shortcuts (Esc / Enter).
- **Studio Mega-Dropdown Popover Architecture (`StemToolsDropdown`)**:
  - Expanded the dropdown menu into a deluxe `w-[420px]` mega popover card featuring a dark gradient branding banner (`STUDIO CÔNG CỤ TOÁN & STEM - GDPT 2018`).
  - Provides rich interactive tiles with categorized tags (`SGK 2018`, `JSXGraph Native`, `Auto Calc`, `Vi Tích Phân`, `Thực Nghiệm`), clear descriptions, and responsive outside-click auto-dismissal.

### 4.58. 100% Elimination of Raw LaTeX Exposure & Visual Number Slot Editing (`InteractiveFormulaBuilderModal.jsx`)
- **Strict Prohibition of Raw LaTeX / Textarea Exposure**:
  - Completely purged raw LaTeX textareas and literal equation string wrappers (`$formula$`) from the formula studio dock, adhering to the foundational pedagogical rule that educators and end-users must never interact with raw command syntax like `\frac` or `\lim`.
  - Re-anchored the user experience around dedicated visual number and expression slots (Fraction Numerator/Denominator, Radical Index/Radicand, Power Base/Exponent, Integral Bounds), allowing teachers to input numbers and expressions naturally.
- **1-Click Pedagogical Template Presets (Insert Mẫu)**:
  - Fraction: Provides instant presets for 1/2, 3/4, integer division 12/4 = 3, and algebraic rational expressions $(2x+1)/(x-1)$ and $(x^2-4)/(x-2)$.
  - Limit & Calculus: Integrates 5 classic GDPT 2018 limit presets ($f'(x_0)$ derivative definition, $\sin(x)/x=1$, rational asymptote limits, $0/0$ cancellation, and sequence convergence $1/n$). Dedicated inputs for numerator $P(x)$ and denominator $Q(x)$ eliminate manual fraction syntax.
- **High-Definition WYSIWYG KaTeX Preview Dock**:
  - Showcases large, razor-sharp textbook typography (`text-2xl`) directly rendered via KaTeX without any technical clutter.

### 4.59. Universal Formula Bar, Live Textbook Typography Dock & Cursor-Aware Symbol Insertion Architecture (`WordStyleFormulaCanvas.jsx`)
- **Universal Continuous Formula Bar (Ô Soạn Thảo Công Thức Toàn Năng Siêu Linh Hoạt)**:
  - Replaces rigid, partitioned single-equation slots with a universal equation bar capable of accommodating any mathematical expression without domain restrictions ($12/4 = 3$, $f(x) = \frac{x^2 - 1}{x - 1} = x + 1$, square roots, general powers, limits, integrals, chemistry $C_M$ equations, physics kinematics).
  - Directly binds `bubbleInputRef` to capture user input seamlessly, supporting standard keyboard shortcuts (`Enter` to complete, `Escape` to dismiss, `Backspace` on empty input to delete).
  - Pairs directly with the **Live KaTeX Typography Preview Dock (`👀 Học sinh thấy:`)** situated directly beneath the equation bar, continuously rendering textbook-grade serif KaTeX mathematics in real time without exposing raw `LaTeX:` or `KaTeX:` code tags.
- **Universal Automatic Calculation Engine (`autoCalculateEquation` & Nút `⚡ Tính`)**:
  - Delivers a smart evaluation engine that automatically parses and evaluates fractions/divisions (`\frac{12}{4}` -> `= 3`, `0.2/0.5` -> `= 0.4`), square roots (`\sqrt{16}` -> `= 4`), powers (`2^3` -> `= 8`), basic arithmetic (`10 + 2*5` -> `= 20`), and empirical chemistry concentrations ($C_M$, $C\%$).
  - Automatically appends or corrects the right-hand side answer (`= [result]`) with a single click of the golden `[ ⚡ Tính ]` button.
- **Cursor-Aware Symbol Insertion & Text Wrapping (`handleInsertSymbolIntoActive`)**:
  - Leverages `selectionStart` and `selectionEnd` from `activeInputRef`: clicking any symbol chip from the 8 disciplinary tabs (`Cấu trúc`, `Oxyz`, `Vật lý`, `Hóa học`, `Sinh học`, `Ngữ văn`, `Địa lý`, `Ký hiệu & Logic`) inserts the snippet at the exact caret position and automatically repositions focus inside the primary placeholder.
  - Supports selection wrapping: highlighting existing text and clicking `a/b` wraps the selection into the numerator, while clicking `√x` wraps it inside a radical.
- **Natural Backspace & Delete Key Integration**:
  - Enables Microsoft Word-grade deletion: pressing `Backspace` at offset 0 of a text segment immediately following a formula automatically deletes the formula token.
  - Pressing `Backspace` within an empty formula slot or clicking `[ 🗑️ Xóa ]` immediately removes the formula from the canvas.
- **Smart Popover Positioning Anti-Overlap (`bubblePos`)**:
  - Dynamically calculates available screen space: places the popover above the formula if space allows (>200px) or below if at the top of the canvas, completely avoiding any visual obscuration of the active line.
  - Connects to the full Studio builder via `[ 🚀 Mở Studio ]` for 3D spatial models and variation tables.

### 4.60. Visual Interactive Math Slots & Bidirectional Natural Math Architecture (Zero LaTeX Exposure) (`WordStyleFormulaCanvas.jsx`)
- **Visual Interactive Math Slots Widget**:
  - Automatically detects formula structures and renders textbook-grade interactive input slots:
    - **Fraction**: Vertical fraction with numerator input, horizontal divider bar, denominator input, equals sign, and answer slot.
    - **Radical**: Square root symbol with radicand input and answer slot.
    - **Power**: Base and exponent inline input slots.
    - **Chemistry**: Empirical molarity ($C_M = n / V = [n]/[V] = [result]\text{ M}$) and mass concentration ($C\%$) slots.
  - Direct real-time bidirectional synchronization: Modifying values in visual slots immediately updates the live KaTeX preview, the Natural Math Bar, and the underlying document model.
- **Bidirectional Natural Math Engine (`latexToNaturalMath` & `naturalMathToLatex`)**:
  - Translates complex internal LaTeX strings into intuitive, human-friendly natural math notation ($12/4 = 3$, $\sqrt{16} = 4$, $\lim(x \to x_0)$), completely stripping backslashes and curly brace syntax.
  - Enables teachers to type or paste any mathematical expression using standard arithmetic characters (`+`, `-`, `*`, `/`, `^`, `(`, `)`), automatically converting to textbook-crisp KaTeX without exposing technical markup.
- **Absolute 100% Elimination of Raw LaTeX / KaTeX Labels**:
  - Completely purged all occurrences of `LaTeX:`, `KaTeX:`, and literal string badges (`$formula$`) from canvas popovers and modal preview docks.

### 4.61. Complete Runtime Import Integrity & White Screen Prevention Architecture (`WordStyleFormulaCanvas.jsx`)
- **Runtime Import Audit & Resolution**:
  - Restored missing named exports (`parseVariationTableString` from `../common/VariationTable`, `unescapeLiteralNewlines` from `../common/MathText`, and `useImperativeHandle` from `react`) within `WordStyleFormulaCanvas.jsx`.
  - Guarantees seamless rendering of standalone `[VARIATION_TABLE]` blocks, robust document token serialization, and error-free imperative ref operations between `CurriculumStudioEditor` and the equation canvas.
  - Totally eliminated client-side `ReferenceError` exceptions, ensuring zero white-screen regressions during lesson theory and solution methodology editing sessions.

---

### 4.62. Floating Right-Edge STEM Tools Drawer & Unified Header Toolbar Architecture (`CurriculumStudioEditor.jsx`)
- **Right-Edge Docked Floating Drawer (`FloatingStemDrawer` & Ultra-Compact Toggle Button `<`)**:
  - Engineered a sleek, ultra-compact docked trigger button on the right edge of the viewport (`fixed right-0 top-1/2 -translate-y-1/2 z-40`) featuring a minimal `<` chevron (`ChevronLeft className="w-3.5 h-3.5"`), mini-sparkle `✨`, and vertical label `STEM` (~55px height, ~20px width, `rounded-l-xl`), hugging the right border closely to completely prevent overlapping onto the editor canvas.
  - Added trailing comma to `Table2,` inside the multiline `lucide-react` import statement to ensure strict ES module compliance and resolve TypeScript TS1005 `',' expected` diagnostic warnings.
  - Clicking the toggle expands an ultra-modern slide-over palette drawer (`w-80 sm:w-[380px] max-h-[86vh]`) with a top real-time `Search` bar, filtered across all mathematical and science tools.
  - Purged redundant `GDPT 2018` badges, emoji boxes, and secondary buttons, streamlining every tool item down to clean typography: Tool Title (`font-bold text-xs`) and Descriptive Summary (`text-[11px] text-slate-500`) with 0% distracting icons.
  - Integrated active cursor insertion: Removed manual target selector dropdown in favor of automatic active cursor tracking; upgraded `insertSnippet` in `WordStyleFormulaCanvas.jsx` to insert large visual blocks (`[VARIATION_TABLE]`, `[MATH_GRAPH]`, `[MATH_GRAPH_3D]`, `[MATH_GEOMETRY_2D]`) directly at the active cursor line index (`targetIdx`) instead of dumping at document bottom.
  - Available tools in drawer:
    - **MathLab 2D & 3D**: Full JSXGraph workspace for 3D spatial rotations (360° trackball), 2D Cartesian function curves, and planar geometry.
    - **Variation Table Studio**: Instant 2N-1 grid table builder with double-bar asymptotes (`||`) and textbook inflection vectors.
    - **Fraction & Arithmetic Calculator**: 2-story fractions with automatic real-time result evaluation.
    - **Calculus & Textbook Limits**: First-principle limits, derivative definitions, and indeterminate quotient cancellations.
    - **Definite Integrals & Differential Calculus**: Definite integral bounds and differentials.
    - **Equation Systems & Matrix Logic**: 2-3 variable linear systems with simultaneous brace notations.
    - **Chemistry Lab Workbench**: Molarity (`C_M`), mass concentration (`C%`), mass equation, and reaction yield calculations.
    - **7-Subject Symbol Library**: Quick link to open the full left hierarchical math palette.
- **Ultra-Slim Left Pedagogical Symbol Palette Architecture**:
  - Downscaled expanded sidebar width by ~25-30% from `w-76 sm:w-84` (304px - 336px) down to high-density `w-60 sm:w-64` (240px - 256px), freeing up over 80px-96px of critical horizontal viewport for the central pedagogical sheet and split preview.
  - Slimmed the collapsed icon rail down from `w-12` to minimal `w-10` with 28px square icon buttons (`w-7 h-7`).
  - Consolidated header chrome to a single tight title bar, optimized quick search input to `py-1 text-[11px]`, and streamlined subject domain pills and KaTeX tile footprints (`min-h-[30px]`) with clean typography.
- **Adaptive Question Bank Cards & Proportional Rectangular Solution Container**:
  - Eliminated the restrictive fixed-height `max-h-80 overflow-y-auto` scroll wrapper on the supplementary question bank list in Block 4.
  - Re-architected questions into decoupled, individually structured cards with natural vertical height (`h-auto`), preventing clipping and double scrollbar artifacts on nested SVG variation tables and 2D/3D graphs.
  - Added full 4-option (A, B, C, D) responsive grids with correct option highlighting in emerald green.
  - Formatted detailed solutions (`q.explanation`) into a dedicated geometric rectangle (`w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs`) that dynamically adjusts its height proportionally to content length, guaranteeing balanced rectangular alignment regardless of solution complexity.
- **Student Live Preview Streamlining & Vertical Space Optimization**:
  - Removed the bulky top green gradient banner ("Giao Diện Trực Quan Học Sinh Nhìn Thấy (Live Preview) - Thời gian thực") from the right preview column in both Split and Preview view modes.
  - Grants immediate visual access to the simulated student card container, optimizing vertical density and eliminating unnecessary title chrome.
- **Top Header De-cluttering & Single Source of Truth**:
  - Removed redundant `StemToolsDropdown` from the top header bar, establishing the right floating mini-tab as the single, authoritative entry point for STEM tool invocation.
  - Re-aligned the Block 4 Question Bank header with fixed single-line horizontal alignment (`flex items-center gap-2.5 shrink-0 whitespace-nowrap`) and purged duplicate emojis.

---

### 4.63. Unified Branch Integration (`ThinhTT/feature-curriculum-studio-formula-editor` -> `develop`)
- **Seamless Coexistence of Core Flows 2, 4, 5, PayOS VietQR & Fintech OTP Authentication (`App.jsx`, `ParentDashboardView.jsx`, `Sidebar.jsx`, `modals/index.js`)**:
  - Merged `ThinhTT/feature-curriculum-studio-formula-editor` into `develop`, combining the full Curriculum Studio & Word-Style Formula Editor (`WordStyleFormulaCanvas`, `VariationTable`, `InteractiveMathRenderer` 2D/3D JSXGraph), PayOS VietQR Tuition Checkout (`TuitionPaymentView`, `PayOsCheckoutModal`, `paymentService`), and 6-Digit Fintech OTP Recovery (`ForgotPasswordModal`) with Core Flow 4 Socratic AI Tutor (`AISocraticTutorModal`, Floating FAB) and Core Flow 5 Multi-Stakeholder Analytics (`LearningAnalyticsView`, `TeacherDashboardView`, `ParentDashboardView`, `CampusManagerDashboardView`).
  - Unified `ParentDashboardView.jsx` to display both live Core Flow 5 parent companion metrics (`R_exam` 3-factor readiness index, verified 12h/week self-study tracker, AI guidance) and the PayOS VietQR tuition payment banner & modal.
  - Verified with `npm test` (`9/9 tests pass`) and `npm run build` (`3,017 modules transformed, 0 errors`).

---

### 4.64. Core Flow 6 Service Layer, Score Forecast, Early Warnings, Mistake Notebook & Student-Friendly UX Normalization (`practiceService.js`, `ScorePredictionPanel.jsx`, `StudentEarlyWarningsCard.jsx`, `EarlyWarningsMentorPanel.jsx`, `MistakeNotebookSM2View.jsx`, `LearningAnalyticsView.jsx`)
- **13-Endpoint Core Flow 6 Client Integration (`apiClient.js`, `practiceService.js`, `tests/practiceService.flow6.test.js`)**:
  - Added `apiClient.patch`, structured `Result<T>` error unwrapping, and complete Gateway (`:5212`) client methods for SEM score predictions, Knapsack ROI remediation sessions, BR-04 3-tier early warnings, mentor intervention resolution & tripartite counseling scheduling, and SM-2 spaced-repetition mistake reviews.
- **Multi-Role UI Suite & Learner-Centric Copy Abstraction**:
  - Implemented `ScorePredictionPanel.jsx`, `PrescriptionPracticeModal.jsx`, `NotificationBellPopover.jsx`, `StudentEarlyWarningsCard.jsx`, `EarlyWarningsMentorPanel.jsx`, and `MistakeNotebookSM2View.jsx` seamlessly coexisting with PayOS VietQR (`TuitionPaymentView.jsx`, `PayOsCheckoutModal.jsx`).
  - Abstracted all internal psychometric/algorithmic labels (`Core Flow 1..6`, `Socratic`, `IRT 2PL`, `BKT P(Lt)`, `SEM 95%`, `Knapsack ROI`, `SM-2`, `BR-04`, `PAT_SKILL_*`, `AUTO_INIT`) into clear, study-focused Vietnamese copy across student-facing views and modals.

---

## 5. Verification & Acceptance Criteria

1. **Clean Production Build**: Executed `npm run build` with 0 syntax or bundle errors; production artifacts outputted to `dist/` within 763ms on Vite 8 and React 19.
2. **Linter & Code Health**: `npm run lint` passes with 0 syntax errors across all components and services.
3. **Docker Multi-Stage Validation**: `docker compose config` passes with 0 syntax errors across the entire 6-service microservices constellation.
4. **Repository Sync Automation**: Standalone `Scripts/push.bat` and root `Scripts/` correctly recognize `V-Eval-Web_Client` as a first-class project service.
5. **API Gateway Connectivity**: Full client suite structured and verified to consume all microservices endpoints via API Gateway (`:5212`) entry point.

### 4.38. Single-Column Visual Formula Card Palette Architecture (`HierarchicalMathPalette.jsx`)
- **Single-Item-Per-Row Layout Architecture**:
  - Re-engineered the symbol and formula palette repository from a cramped 2-column grid (`grid-cols-2`) to a focused, single-column vertical flow (`grid-cols-1 gap-1.5`).
  - *Full-Width Formula Canvas*: Provides each formula card with the full width of the palette (~220px active area), allowing long multi-term equations (harmonic motion equations `x = A\cos(\omega t + \varphi)`, rational calculus functions, limits, integration, and chemical formulas) to render cleanly without truncation or awkward text wraps.
  - *Ergonomic Interaction & Drag Target*: Enlarged horizontal drag target with live KaTeX rendering, formula title, domain classification badge, subtle "Chèn" insertion hint, and `GripVertical` drag indicator, maximizing tactile usability for curriculum editors.

### 4.39. Ultra-Compact Palette Footprint, 3-Domain Infinite Circular Carousel, and Dwell-Hover Simulation Inspector (`HierarchicalMathPalette.jsx`)
- **Ultra-Compact Palette Width Optimization**:
  - Further constrained the expanded sidebar width from `w-60 sm:w-64` (240px - 256px) down to an ultra-slim `w-48 sm:w-52` (192px - 208px), freeing over 85-90% of screen viewport real estate for the primary pedagogical document canvas.
- **3-Subject Horizontal Infinite Circular Carousel (`visibleDomainKeys`, `handleNextDomain`, `handlePrevDomain`)**:
  - Replaced the wrapped pill row with an elegant 3-item horizontal carousel flanked by `<` and `>` navigation buttons.
  - Implemented circular modulo mathematics (`(index ± 1 + length) % length`) ensuring an infinite non-terminating loop across all 7 subject domains (Mathematics, Chemistry, Physics, Biology, Literature, Geography, Mathematical Logic & Symbols).
  - Actively synchronizes the current domain selection and centers the carousel window upon direct tab clicks or collapsed rail selection.
- **Low-Profile Single-Row Formula Items with Dwell-Hover Simulation Inspector**:
  - Item listing is reduced to an ultra-clean, minimalist single row (~30px height) featuring inline KaTeX/symbol rendering, truncated label, and drag handle.
  - Replaced passive cluttered containers with an asynchronous dwell-hover inspector (~380ms debounce threshold): hovering and holding over any item displays an enlarged vector KaTeX formula, ASCII structure simulation for complex block templates (such as Variation Tables and coordinate graphs), comprehensive pedagogical usage guidelines, and insertion syntax.

### 4.40. Comprehensive Visual Redesign of the STEM & Symbol Sidebar with 2-Domain Zero-Truncation Carousel (`HierarchicalMathPalette.jsx`)
- **Modern Clean-Slate UI Architecture**:
  - Overhauled the legacy dark navbar header with a light, Apple-inspired header featuring pure white background, subtle border dividers, an indigo `Sparkles` icon badge, and refined typography (`Ký Hiệu & STEM`).
  - Integrated an ergonomic rounded-xl search input with soft focus-ring interaction.
- **2-Domain Parallel Carousel Engine (Zero-Truncation Architecture)**:
  - Constrained the carousel viewport to display **exactly 2 subject domains side-by-side** between the circular navigation buttons (`<` and `>`).
  - By dedicating ~75px - 85px to each domain button, all subject names (`📐 Toán`, `🧪 Hóa`, `⚛️ Vật Lý`, `🧬 Sinh`, `📖 Ngữ Văn`, `🌍 Địa Lý`, `🔣 Ký Hiệu`) render cleanly with zero awkward ellipsis truncation (eliminating `T...` and `H...`).
  - Retained the infinite circular modulo rotation loop: cycling past the boundaries continuously loops through all 7 subjects in both forward and reverse directions.
- **Refined Accordion Containers & Tactile Formula Rows**:
  - Accordion folders feature smooth 90-degree chevron rotation and subtle badges.
  - Formula items are formatted as sleek single-row pills with KaTeX rendering, formula labels, and subtle drag grips, while dwell-hovering triggers the detailed simulation inspector modal.

### 4.41. Single-Domain Motion Switcher with Directional Slide Transitions & Paging Indicators (`HierarchicalMathPalette.jsx`)
- **Single-Domain Hero Switcher Architecture**:
  - Re-architected the domain navigation to spotlight exactly **1 active subject at a time** flanked by tactile navigation controls (`<` and `>`).
  - Completely eradicates horizontal text truncation, allowing each subject's full name (`📐 Toán Học`, `🧪 Hóa Học`, `⚛️ Vật Lý`, `🧬 Sinh Học`, `📖 Ngữ Văn`, `🌍 Địa Lý`, `🔣 Ký Hiệu & Logic`) to render at full scale (`text-[12px] font-extrabold`).
- **Dynamic Directional Slide Animations**:
  - Managed via `slideDirection` state (`'next'` vs `'prev'`), coupled with React dynamic keying (`key={selectedDomain}`) and CSS utility classes (`animate-in fade-in slide-in-from-right-4` or `slide-in-from-left-4`).
  - Clicking forward pushes the active card smoothly from the right, while clicking backward glides in from the left, delivering a fluid, native-app feel.
- **7-Point Dot Pagination Bar & Infinite Modulo Loop**:
  - Integrated 7 pill-shaped dot indicators beneath the switcher: active domain expands to a vibrant pill (`w-4 bg-indigo-600`), while inactive dots provide 1-click random access jumping.
  - Preserved the circular modulo navigation loop (`(index ± 1 + length) % length`) without boundary deadlocks.

### 4.42. Native Visual Vector Variation Table Hover Inspector Architecture (`HierarchicalMathPalette.jsx`, `VariationTable.jsx`)
- **Eradication of Raw Developer Terminal Dumps**:
  - Addressed and removed raw ASCII/terminal code syntax dumps (e.g., black monospace blocks displaying `[VARIATION_TABLE] title: ... x: ...`) from the hover inspector card.
  - Enforced a strictly pedagogical presentation policy: users are educators and students who must never be exposed to internal serialization formats or developer diagnostics.
- **Dynamic In-Hover Visual Variation Table Rendering**:
  - Integrated `parseVariationTableString` and the native `<VariationTable />` engine directly within the hover preview card.
  - When educators hover over `BBT Bậc 3`, `BBT Bậc 4`, or `BBT Phân Thức`, the inspector instantly renders an authentic, vector-drawn, 3-row variation table complete with exact coordinate poles, derivative sign alternation, double-vertical asymptotic bars (`||`), and directional trajectory arrows.
  - Standard formulas continue to render in high-resolution, enlarged vector KaTeX typography with natural-case subject headers.

### 4.43. Safe Memoized AST Deserialization for In-Hover Variation Tables (`HierarchicalMathPalette.jsx`)
- **Resolution of Runtime ReferenceError**:
  - Resolved missing declaration bug where `hoveredBbtData` was referenced conditionally in JSX before being bound to component scope.
  - Memoized the AST parsing logic via `useMemo` with error boundary wrapping (`try/catch` fallback to null) so that hover traversal across thousands of formulas remains performant at 60fps without runtime exceptions.

### 4.44. Non-Disappearing Hover Bridge, Dual Grace-Period Debouncing, and Direct Drag-to-Drop Action Architecture (`HierarchicalMathPalette.jsx`)
- **Hover Bridge & Cursor Traversal Safety**:
  - Eliminated the abrupt popover dismissal bug where moving the cursor from a palette snippet item across the 8px spatial gap into the preview card instantly fired `onMouseLeave`, destroying the component.
  - Implemented an invisible geometrical hover bridge via a CSS pseudo-element (`before:absolute before:-left-3 before:top-0 before:w-4 before:h-full`) spanning the gap.
  - Integrated dual debounced timers: a 300ms opening timer (`hoverTimerRef`) and a 320ms grace window closing timer (`hoverCloseTimerRef`). When the cursor enters the preview card, `handleCardMouseEnter` clears the dismissal schedule, allowing educators to explore multi-column variation tables and copy formulas without premature unmounts.
- **Direct Interactive Click & Drag Affordances**:
  - Upgraded the preview card to `pointer-events-auto` with dedicated interactive controls:
    1. *Direct Drag-and-Drop*: Both the showcase preview block and the footer grip button support HTML5 drag initiation (`draggable={true}` + `handleItemDragStart`), permitting teachers to grab the expanded variation table or formula and drop it directly onto the Word Canvas or editor target.
    2. *One-Click Immediate Insertion*: Equipped with a prominent `⚡ Nhấp chèn ngay` action button executing `handleItemClick`, instantly inserting the formula at the caret.

### 4.45. Synchronous Document State Pipeline, ContentEditable Drop Interception, and Stale Blur Guarding (`WordStyleFormulaCanvas.jsx`, `HierarchicalMathPalette.jsx`)
- **Stale Closure and Blur Override Elimination**:
  - Identified and rectified race conditions where blurring an active contentEditable span triggered `handleTextChange` with stale React state closure, discarding freshly created lines or snippet tokens.
  - Introduced `docLinesRef = useRef(docLines)` updated synchronously on every commit, alongside a non-mutating guard (`if (targetTok.text === newText) return;`) ensuring no destructive re-renders occur on focus displacement.
- **Universal In-Span Drag-and-Drop Catchers**:
  - Implemented explicit `onDragOver` and `onDrop` event delegation across granular inline contentEditable text spans, eliminating browser default forbidden drop cursors and ensuring drops register anywhere within running sentences.
- **Palette Sidebar Overlay Deconfliction**:
  - Purged aggressive pseudo-element spatial bridges at `z-[999]` that previously occluded sidebar button hitboxes, optimizing re-hover activation latency to a brisk 150ms.

### 4.46. React Portal Body-Mounted Hover Architecture and Universal DataTransfer Drag Fallback (`HierarchicalMathPalette.jsx`, `WordStyleFormulaCanvas.jsx`)
- **Direct Body-Mounted Portal Pipeline**:
  - Re-architected the hover preview inspector to render via `createPortal(..., document.body)` at `z-[99999]`.
  - Permanently decoupled the popup from ancestor `overflow: hidden` clipping and stacking context limitations, lowering trigger delay to 80ms for instant hover visibility.
- **Universal DataTransfer Fallback & Seamless Drop Acceptance**:
  - Expanded drag-and-drop deserialization in `WordStyleFormulaCanvas.jsx` to read `text/plain` and `Text` streams alongside proprietary MIME types, resolving Chromium strict drag payload omissions.
  - Upgraded block recognition with resilient `.includes('[VARIATION_TABLE]')` matching to ingest variation tables and equations seamlessly without intrusive auto-modal focus.

### 4.47. Import Scope Normalization for Portal Body Elements (`HierarchicalMathPalette.jsx`)
- **Explicit React-DOM Module Resolution**:
  - Bound `createPortal` directly from `react-dom` into the top-level lexical module scope of `HierarchicalMathPalette.jsx`.
  - Eradicated runtime evaluation crashes when mounting the hover popover portal to `document.body`.

### 4.48. ContentEditable Synchronous Mutation Tracking, Stale Closure Elimination, and Seamless Line Pruning (`WordStyleFormulaCanvas.jsx`)
- **Stale Closure and Synchronous State Mutation Elimination**:
  - Rectified an issue where deleting all text within a line and pressing Backspace or Delete failed to delete or merge the empty line due to `handleDeleteOrMergeLine` evaluating closed-over `docLines` rather than the mutable `docLinesRef.current`.
  - Re-routed all line index computations, filter actions, slice operations, and formula slot mutations to source directly from `currentLines = docLinesRef.current || docLines`.
- **In-Span Input State Sync without Unwanted Re-Renders**:
  - Attached real-time text synchronization within the contentEditable span `onInput` handler. As keystrokes occur, `tok.text` in `docLinesRef.current` updates synchronously in memory without triggering component re-renders that would disrupt IME composition or caret positioning.
- **Robust Line Emptiness Detection & Caret Restoration**:
  - Standardized emptiness verification using whitespace-, newline-, and non-breaking space/zero-width space stripping (`/[\s\u00A0\r\n\u200B]+/g`).
  - Upon Backspace on an empty line or at the beginning of a line, `handleDeleteOrMergeLine` prunes the line immediately via `flushSync`, cleanly targeting the last token of the preceding line and restoring the caret at its terminal boundary.

### 4.49. React-DOM flushSync Resolution, Boundary Caret Calibration, and Adjacent Token Coalescing (`WordStyleFormulaCanvas.jsx`)
- **Explicit `flushSync` Namespace Import**:
  - Imported `flushSync` directly from `react-dom` inside `WordStyleFormulaCanvas.jsx`, wrapped in `try/catch` fallbacks to eliminate runtime `ReferenceError: flushSync is not defined` exceptions that interrupted line pruning executions.
- **Dual-Metric Caret Boundary Calibration**:
  - Refined beginning-of-line caret detection by measuring both `sel.anchorOffset === 0 && sel.focusOffset === 0` and `range.collapsed && range.startOffset === 0`, ensuring Backspace triggers immediate upward line jump across all browser selection states.
- **Adjacent Text Token Coalescence**:
  - Upgraded the line merger algorithm to coalesce adjacent plain text tokens into a single unbroken token (`last.text += tok.text`), preventing fragmented spans and restoring natural word processing cursor navigation.

### 4.50. PayOS VietQR Payment Client Architecture, Auto-Polling Modal & PLAR Roadmap Activation (`paymentService.js`, `PayOsCheckoutModal.jsx`, `TuitionPaymentView.jsx`)
- **Unified Payment Service Client (`src/services/paymentService.js`)**:
  - Implements client-side abstractions interfacing with the API Gateway (`/api/practice/payments`) targeting the Practice Service backend.
  - Generates secure PayOS VietQR payment links, verifies orders, polls payment statuses via `orderCode`, and inspects transactional audit trails.
  - Implements defensive offline fallbacks for zero-crash frontend operation during network interruptions or mock demonstrations.
- **Interactive PayOS VietQR Modal (`src/components/modals/PayOsCheckoutModal.jsx`)**:
  - Features real-time state listeners polling `/api/practice/payments/status/{orderCode}` at 3-second intervals.
  - Provides a direct link to the official PayOS VietQR checkout portal and an instant verify simulator for end-to-end user testing.
  - Upon webhook success detection (`SUCCESS` state), triggers celebratory visual feedback via `canvas-confetti` and presents clear roadmap activation indicators.
- **Tuition & Course Package Portal (`src/components/payment/TuitionPaymentView.jsx`)**:
  - Showcases 3 standard competency-based packages: Fast-Track Sprint (8 weeks), Standard Adaptive (12 weeks), and Intensive Plus (16 weeks).
  - Integrates an audit log history table displaying past transactions, payment methods, and clearance states.
  - Directly binds into the Parent Companion Portal (`ParentDashboardView.jsx`) and Main Navigation (`Sidebar.jsx`).


### 4.51. Account Activation & Forgot Password Flow Architecture (`ForgotPasswordModal.jsx`, `WebLoginPage.jsx`, `apiClient.js`)
- **Elimination of Auto-Prefilled OTP & UI Standardization**:
  - Deprecated and removed test auto-fill badges and prefilled OTP values (`Mã OTP kích hoạt hệ thống: [code]`).
  - Standardized the OTP input as a blank 6-digit numeric field with `inputMode="numeric"`, `pattern="[0-9]*"`, strict non-digit regex filtering, and centered letter-spacing layout (`tracking-[0.35em]`).
  - Separated modal behavior into dual modes: `activation` (Account Verification) vs `forgot` (Password Recovery).
- **End-to-End Forgot Password Architecture (UC 05 / UC 06)**:
  - Step 1 (Email Validation): Integrates live verification via `POST /api/auth/forgot-password`. Non-existent emails trigger HTTP 404 (`Auth.UserNotFound`) displaying descriptive localized error feedback without progressing to subsequent steps.
  - Step 2 (OTP Verification): Collects the 6-digit OTP dispatched via Brevo SMTP Relay (`smtp-relay.brevo.com:587`). Includes an `ArrowLeft` back-navigation control to return to Step 1.
  - Step 3 (Password Reset): Validates password strength policy (minimum 8 characters, uppercase, lowercase, numeric) and confirms match before dispatching `POST /api/auth/reset-password`.
  - Step 4 (Success): Confirms password reset and routes user directly back to login.
- **Defensive Error Unwrapping (`apiClient.js`)**:
  - Implemented automatic unwrapping of RFC 7807 and Clean Architecture structured errors (`data.error.description`), preventing generic `[object Object]` error strings across all authentication flows.

### 4.52. Five-Role Dedicated Portal Architecture & Home Page Design System Synchronization (`App.jsx`, `Sidebar.jsx`, `Navbar.jsx`, `DiagnosticAssessmentPage.jsx`, `SubmissionHistoryView.jsx`)
- **Dedicated Role Portals & Isolated Navigation Trees**:
  - Engineered `ROLE_PORTAL_DEFINITIONS` in `src/App.jsx` and role-specific navigation matrices in `src/components/layout/Sidebar.jsx` and `src/components/layout/Navbar.jsx` covering all 5 system roles:
    1. **Student Portal (`student`)**: Personal overview (`dashboard`), 30-question IRT diagnostic assessment (`diagnostic`), submission history & mistake notebook (`history`), DAG knowledge tree (`roadmap`), BKT/IRT learning analytics (`analytics`), and tuition packages (`tuition`).
    2. **Parent Companion Portal (`parent`)**: Child readiness & discipline overview (`dashboard`), 4-domain competency analytics (`analytics`), child exam history (`history`), curriculum progress (`roadmap`), and instant VietQR PayOS tuition checkout (`tuition`).
    3. **Teacher Pedagogical Portal (`teacher`)**: 2D class mastery heatmap & micro-grouping (`dashboard`), curriculum & LaTeX formula studio (`roadmap`), 30-question exam bank (`diagnostic`), student submission logs (`history`), and psychometric analytics (`analytics`).
    4. **Campus Academic Manager Portal (`manager`)**: Multi-class coordination & AI K-Means clustering (`dashboard`), class heatmap supervision (`teacher_heatmap`), curriculum governance (`roadmap`), campus staff/student provisioning (`provision`), and quality analytics (`analytics`).
    5. **System IAM Administrator Portal (`admin`)**: Direct PostgreSQL multi-role IAM account provisioning (`provision`), multi-campus comparative operations (`dashboard`), system-wide class heatmaps (`teacher_heatmap`), national curriculum tree (`roadmap`), and PayOS transaction reconciliation (`tuition`).
- **Unified Home Page Color Palette & Template (`#FDFBF7` / Royal Blue-Indigo / Gold `#FACC15`)**:
  - Standardized all application views around the reference design system of `PublicLandingPage.jsx`: warm academic ivory background (`bg-[#FDFBF7]`), elevated white surface cards (`bg-white border-slate-200/80 rounded-3xl`), royal blue-indigo-cyan brand gradients (`from-blue-600 via-indigo-600 to-cyan-500` and `from-blue-700 via-indigo-700 to-blue-900`), and `#FACC15` gold accents.
  - Converted previously dark-only views (`DiagnosticAssessmentPage.jsx` and `SubmissionHistoryView.jsx`) to the unified `#FDFBF7` / white academic theme.

### 4.53. Strict Zero-Mock / 100% Real Backend API Enforcement Across All 5 Role Portals (`authService.js`, `userService.js`, `paymentService.js`, `practiceService.js`, `App.jsx`, `Navbar.jsx`, `Sidebar.jsx`, `dashboard/*`, `modals/*`)
- **Complete Removal of Demo Login Presets & Manual Role Switchers**:
  - Purged all 1-click demo login buttons, pre-filled demo credentials, fake social login triggers, and synthetic JWT fallback tokens (`eyDemoAccessToken123456`) from `LoginForm.jsx` and `WebLoginPage.jsx`.
  - Removed the manual Role Switcher bar from `Navbar.jsx` and enforced an authentication guard in `App.jsx` so users only access the portal corresponding to their authenticated Backend role (`authService.resolveAppRole(currentUser)`), enriched via `GET /api/v1/users/me`.
- **Elimination of Seed / Mock Fallbacks in Service & View Layers**:
  - Replaced all synthetic seed generators in `practiceService.js` (`buildSeedStudentDashboard`, `buildSeedClassHeatmap`, `buildSeedParentDashboard`, `buildSeedCampusComparativeHeatmap`, `getDefaultSeedHistory`) with clean empty/onboarding states (`buildEmptyStudentDashboard`, `buildEmptyClassHeatmap`, `buildEmptyParentDashboard`, `buildEmptyCampusComparativeHeatmap`, `[]`).
  - Removed `mock-payment-` fallback links and offline transaction simulators in `paymentService.js`, and removed hardcoded campus fallbacks in `authService.js` and `userService.js`.
  - Disconnected `src/data/mockData.js` from all active views and modals (`HeroBanner.jsx`, `MetricsGrid.jsx`, `MilestoneCard.jsx`, `LiveQnACard.jsx`, `ParentDashboardView.jsx`, `CampusManagerDashboardView.jsx`, `LearningAnalyticsView.jsx`, `TuitionPaymentView.jsx`, `RadarChartModal.jsx`, `DiagnosticTestModal.jsx`, `AdaptiveQuizModal.jsx`, `ClassMicroGroupsModal.jsx`), binding 100% of UI state to live Backend endpoints via the API Gateway (`http://localhost:5212`).
- **Multi-Layer Live Email Validation & Landing Navigation (`src/utils/emailValidator.js`, `RegisterForm.jsx`, `WebLoginPage.jsx`, `App.jsx`)**:
  - Wired `onOpenLogin`, `onOpenRegister`, `onOpenDashboard`, `onOpenDiagnostic`, and `onOpenArchModal` between `App.jsx` and `PublicLandingPage.jsx`.
  - Implemented real-time debounced and pre-submit email verification (`emailValidator.js` + `GET /api/auth/validate-email` + Google DNS-over-HTTPS `MX` record lookup), enforcing strict RFC 5322 syntax, Gmail local-part rules (6–30 chars), repetitive fake pattern blocking (`22222`), disposable email domain blocking, and 1-click domain typo correction (`@gmial.com` -> `@gmail.com`).
- **3-in-1 Parent-Student Linking System (`StudentParentLinkCard.jsx`, `ParentDashboardView.jsx`, `userService.js`)**:
  - Enabled 100% database-backed Parent-Student account linking without SMTP dependency via three integrated workflows: (1) Student Account Code (`VE-XXXXXX`) & 6-digit dynamic PIN (`POST /api/v1/users/parent-link/connect`), (2) 1-Click Shareable URL (`?parentLinkCode=...`) & QR Code, and (3) Two-way in-app request/approval by Student Email or Phone (`POST /api/v1/users/parent-link/request` & `POST /api/v1/users/me/parent-link-requests/{id}/respond`).

### 4.54. Campus Manager Segmented Navigation Redesign, Dynamic Academic Director Recognition & IAM Provisioning Multi-Layer Email Validation (`App.jsx`, `AccountProvisioningView.jsx`, `emailValidator.js`)
- **Modern Segmented Control Navigation Redesign (`src/App.jsx`)**:
  - Eliminated the wrapping, multi-line navigation layout on the Campus Manager Portal by refactoring subpage navigation into a streamlined Segmented Control.
  - Employed a unified track wrapper (`bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 inline-flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full`) preventing clumsy two-row button drops on constrained viewports.
  - Active segment tabs feature a crisp card aesthetic (`bg-white text-blue-700 shadow-sm font-extrabold ring-1 ring-slate-200/80`) while inactive tabs use smooth hover transitions (`text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold`).
  - Streamlined tab labels for clarity and conciseness: *"So sánh Cơ sở"*, *"Ma trận Lớp học"*, *"Khung Chương trình"*, *"Cấp phát Tài khoản"*, *"Báo cáo Chất lượng"*.
- **Dynamic Academic Director vs. Campus Manager Portal Differentiation (`src/App.jsx`)**:
  - Implemented dynamic role recognition differentiating `ACADEMIC_DIRECTOR` from standard `ACADEMIC_MANAGER` accounts.
  - For Academic Directors, the header elevates to *"Cổng Giám Đốc Học Thuật Toàn Trường"* with a `Crown` icon and gold-accented badge (`ACADEMIC DIRECTOR PORTAL`), while Campus Managers retain the localized operational banner.
- **Multi-Layer Defensive Email Validation in IAM Account Provisioning Modal (`src/components/admin/AccountProvisioningView.jsx`, `src/utils/emailValidator.js`)**:
  - Integrated `validateEmailComprehensive` on the Account Provisioning modal's email input with real-time `onBlur` checks and pre-submit validation.
  - Added support for detecting common domain typos (such as `@mail.com` typo for `@gmail.com`), RFC 5322 syntax validation, repetitive character blocking (`22222`), disposable email blocking, and Google DNS-over-HTTPS MX verification.
  - Visual feedback includes an inline loading spinner during DNS resolution, green success badge upon validation, and an actionable amber/red suggestion banner with a 1-click apply button (`"Sửa thành: ...@gmail.com"`).
  - Prevents accidental provisioning of phantom or invalid accounts and provides clear, human-friendly error messages matching Clean Architecture domain responses.

### 4.55. Soft Delete / Inactive Account Lifecycle Architecture & Dual-View Management (`AccountProvisioningView.jsx`, `userService.js`)
- **Strict Prohibition of Hard Deletion & Full Pedagogical Data Preservation**:
  - Eliminates hard deletion (`DELETE FROM "Users"`) across all client flows to safeguard referential integrity across psychometric examination submissions (`ExamSubmissions`), adaptive practice session records (`PracticeSessions`), VietQR tuition logs (`PaymentOrders`), and parent-student linkages (`ParentStudentRelations`).
  - Adopts the industry-standard Soft Delete model utilizing the existing `is_active` database flag (`v_eval_identity."Users"`).
- **Dual-View Segmented Architecture (Active vs. Inactive Accounts)**:
  - **"Tài Khoản Đang Hoạt Động" (Default View)**: Queries `GET /api/v1/users?isActive=true`. Inactive accounts are automatically hidden from view, keeping operational lists focused solely on active faculty, staff, and learners.
  - **"Tài Khoản Đã Ngừng Hoạt Động (Ẩn)" (Archive View)**: Queries `GET /api/v1/users?isActive=false`. Provides an isolated archive repository showcasing all deactivated accounts with structured audit indicators and status badges.
  - **"Tất Cả"**: Queries `GET /api/v1/users` with no `isActive` filter for comprehensive administrative audits.
- **Confirmation Modals & Lifecycle Transitions**:
  - **Deactivation Confirmation**: Features a dedicated `UserX` modal detailing the target user's identity and displaying explicit data preservation assurances before triggering `PATCH /api/v1/users/{id}/toggle-status?targetStatus=false`.
  - **Reactivation Confirmation**: Features a dedicated `RotateCcw` modal allowing instant restoration of login privileges and immediate relocation back to the active user list via `PATCH /api/v1/users/{id}/toggle-status?targetStatus=true`.
- **Real-Time Interactive Metric Synchronization**:
  - Live counts (`activeCount` and `inactiveCount`) are derived dynamically from Backend SQL aggregates.
  - Stat cards on the dashboard are wired with 1-click filters enabling rapid toggling between active and archived views.
- **Full-Width Portal Workspace Alignment (`w-full`), Single-Line Zero-Wrap Table Redesign & `apiClient.js` Query Parameter Serialization (`App.jsx`, `AccountProvisioningView.jsx`, `apiClient.js`)**:
  - Added automatic `options.params` query-string serialization (`URLSearchParams`) and a dedicated `patch()` method in `src/services/apiClient.js`, ensuring `GET /api/v1/users?isActive=true` accurately filters active vs. inactive records at the Backend database layer.
  - Removed `max-w-7xl mx-auto` constraints across `App.jsx`, `AccountProvisioningView.jsx`, `CampusManagerDashboardView.jsx`, `ParentDashboardView.jsx`, and `TuitionPaymentView.jsx`, expanding the portal workspace to `w-full` flush with the `Sidebar` and `Navbar` and eliminating horizontal table scrollbars.
  - Redesigned the IAM accounts table with a unified Command Toolbar, two-letter role-tinted gradient avatars, intelligent role-specific unit/campus labels, and strict `whitespace-nowrap` single-line badges and action buttons.

### 4.56. Dual-Depth AI Curriculum Ingestion UI/UX Architecture & Granular Slicing Controls (`CurriculumExplorerView.jsx`)
- **Decoupled Page Slicing & Extraction Granularity Architecture**:
  - Re-architected the AI Curriculum Ingestion Modal to clearly segregate PDF page filtering (`importPageMode: all | custom`) from pedagogical pattern extraction depth (`importExtractionDepth: deep | standard`).
- **Dual Interactive Selection Cards (Micro vs Macro Extraction)**:
  - **Deep V-ACT Mode (`deep` - Recommended)**: Instructs AI Engine to execute micro-granularity decomposition, extracting 2-4 problem patterns per lesson (6-12+ patterns across comprehensive chapters) with mandatory 4-quadrant pedagogy (KaTeX theory, Casio speed tactics, Bloom L1-L4 exemplar questions).
  - **Standard Deep-Theory & Sub-Pattern Mode (`standard` - Comprehensive Theory)**: Instructs AI Engine to extract high-level curriculum frameworks following textbook tables of contents. While top-level pattern count is restrained (1-2 major thematic patterns per lesson), the `theoryRecap` block is enriched with exhaustive definitions, formulas, and theorems, and `solutionMethod` strictly decomposes into detailed sub-patterns (e.g. Sub-pattern 1.1, 1.2...).
- **Real-Time Contextual Feedback Engine**:
  - Employs dynamic contextual feedback callout cards with active selection badges, estimated processing durations, and recommended document use cases.

### 4.57. Robust API Problem Details (RFC 7807/9110) & Resilient Client Error UX (`apiClient.js`, `CurriculumExplorerView.jsx`)
- **Transient 502 Connection Refused Auto-Retry Engine**:
  - Automatically retries idempotent and pre-execution requests once with a 2-second backoff when Gateway returns HTTP 502 Bad Gateway due to downstream services (such as Identity Service) completing database migrations and startup handshakes.
- **Automated `application/problem+json` Deserialization**:
  - Enhanced `apiClient.js` to automatically detect and parse HTTP responses with `Content-Type: application/problem+json` or any `+json` variant.
  - Implemented safe JSON string detection for responses served with `text/plain` or missing headers that encapsulate stringified JSON objects.
  - Recursively resolves error detail hierarchies prioritizing `data.detail` (RFC standard), `data.error.description`, `data.message`, and ASP.NET Core `data.errors` validation collections while ignoring generic framework placeholders (`"An error occurred while processing your request."`).
  - Seamlessly assigns both `error.data` and `error.response = { data, status, headers }` for comprehensive backward compatibility with Axios-style component catch blocks.
- **Pedagogical & Infrastructure Error Classification**:
  - Intercepts backend AI configuration omissions (such as missing `GEMINI_API_KEY` or `OPENAI_API_KEY`) and translates them into actionable toast notifications titled *"Chưa Cấu Hình API Key"* with configuration instructions.
  - Detects upstream AI provider rate-limiting and quota exhaustion (HTTP 429 / `ResourceExhausted`), gracefully informing teachers and operators via *"Hạn Mức API Quá Tải"* cards.
  - Strips internal backend exception wrappers (e.g. `Lỗi khi trích xuất tài liệu khung chương trình:`) to present concise, readable error summaries directly to academic staff.

### 4.58. Multiple-Choice Option Sanitization & Rogue Token Elimination (`CurriculumExplorerView.jsx`, `MathText.jsx`, `CurriculumStudioEditor.jsx`)
- **Multiple-Choice Option Quote Stripping (`cleanOptionDisplay`)**:
  - LLMs and OCR engines often encapsulate chemical formula options in single or double quotes (e.g. `'HCOOC_2H_5'` or `"C_2H_5CHO"`), interfering with KaTeX delimiters and generating malformed equations.
  - Added `cleanOptionDisplay(raw)` in `CurriculumExplorerView.jsx`: Strips leading/trailing quote characters and redundant letter option prefixes (`A.`, `B.`, `(A)`), ensuring pristine KaTeX rendering across Khối 4 option cards.
- **Rogue `undefined` Token Filtering**:
  - Enhanced `MathText.jsx` parser to filter out standalone lines containing only `undefined` or `null`.
  - Sanitized `sampleProblem` extraction in `CurriculumStudioEditor.jsx` (`parseSolutionMethodSections`) to eliminate phantom `undefined` labels from method blocks.
- **Resilient Target Domain Dropdown Architecture**:
  - Replaced the previous modal-wide backdrop overlay (`fixed inset-0 z-40`) with a localized `useRef` and `mousedown` outside-click listener.
  - Eliminates z-index trapping and clipping inside scrolling dialog containers (`overflow-y-auto`).

### 4.59. Redundant Competency Domain Pruning & Confirmation Workflow (`CurriculumExplorerView.jsx`)
- **Domain Identification & Pruning Interface**:
  - Automatically identifies user-created or AI-hallucinated competency domains outside the 5 canonical V-ACT domains (`DOM_MATH`, `DOM_LANG`, `NATURAL_SCIENCES`, `SOCIAL_SCIENCES`, `DOM_ENG`).
  - Renders a prominent `Trash2` deletion icon on the domain navigation tab.
- **Cascade Deletion Confirmation Workflow**:
  - Prompts instructors with a defensive confirmation dialog explaining that deletion cascades to all associated chapters, lessons, patterns, and questions.
  - Invokes `contentService.deleteNode(domain.id)` via API Gateway, delegating atomic database purging to Content Service's polymorphic `DeleteNodeCommand`.

### 4.60. Strict KaTeX & LaTeX Integrity Architecture, Multiline Equation Stitching & Chemical Subscript Option Sanitization (`MathText.jsx`, `CurriculumExplorerView.jsx`, `CurriculumStudioEditor.jsx`)
- **Multiline Broken LaTeX Expression Stitching (`mergeUnclosedLatexLines`)**:
  - *Architectural Issue*: LLMs frequently output multiline LaTeX expressions (e.g. calculation fractions `\frac{...}{\n...}` or long formulas `\text{HCOOCH(CH}_3\n )_2`) with literal line breaks inside curly braces `{...}`. Standard line-by-line renderers split these blocks into invalid fragments, causing KaTeX parser exceptions and raw text fallbacks.
  - *Architectural Solution*: Implemented stateful line merger in `MathText.jsx` tracking open brace counts `{...}`. Lines ending within unclosed braces are merged back into single unified expressions prior to line-based rendering.
- **Automated Chemical Reaction Arrow Delimiting**:
  - Automatically identifies standalone chemical reaction equations containing LaTeX arrows (`\rightleftharpoons`, `\xrightarrow{t^\circ}`, `\longrightarrow`, `\rightarrow`) and encloses them into `$ ... $` or `$$ ... $$` math blocks.
- **Formula Subscript & Complex Compound Auto-Detection**:
  - Extended regular expressions to capture algebraic chemical formulas with general subscripts (`C_nH_{2n}O_2`, `CH_3COOC_2H_5`, `C_4H_6O_2`, `CH_3COOCH(CH_3)_2`, `(n \ge 2)`), wrapping them seamlessly in math delimiters.
- **Nested Dollar Elimination in LaTeX Arguments**:
  - Recursively strips invalid dollar signs nested inside LaTeX command braces (`{\text{n}_{$CH_3COOH$}}` -> `{\text{n}_{CH_3COOH}}`).
- **Punctuation Dollar Cleanup & Unit Sanitization**:
  - Cleans rogue single dollars glued to punctuation (`.$`, `$.`, `,$`) and units (`$\text{mol}`, `$\text{gam}`, `$\times$`).
- **Comprehensive Multiple-Choice Option Sanitization (`cleanOptionDisplay` & `cleanOptionOrText`)**:
  - Strips all single, double, backtick, and unicode quotes (`‘`, `’`, `“`, `”`).
  - Automatically converts flat chemical formulas (`CH3COOCH3`, `HCOOC2H5`, `C2H5OH`, `H2SO4`) into proper subscript notation (`CH_3COOCH_3`, `HCOOC_2H_5`) and encloses them in `$ ... $`.
  - Harmonized option sanitization across both read-only preview (`CurriculumExplorerView.jsx`) and interactive authoring (`CurriculumStudioEditor.jsx`).

### 4.61. Independent Math Tokenizer Engine, Vietnamese Prose Invariant Protection & Block Math Downgrade Architecture (`mathTokenizer.js`, `MathText.jsx`)
- **Root Cause & Elimination of Red KaTeX Error Text & Swallowed Vietnamese Prose**:
  - *Defect Diagnosis*: Previous line-merging logic relied on `dMatches % 2 !== 0` (unclosed dollar counts). When an LLM output an unclosed opening dollar sign (e.g. `của ester đơn chức là $RCOOR'.*`), the merger swallowed up to 10 subsequent lines of Vietnamese explanatory prose into a single math token buffer. The inline regex then passed this entire Vietnamese text block to `katex.renderToString()`, which treated Vietnamese letters as multiplied variables, stripped all whitespace, failed parsing, and styled the entire paragraph in vivid red text (`.katex-error`).
  - *Architectural Resolution*:
    1. **Eliminated Dollar-Parity Line Merging**: `mergeUnclosedLatexLines` now exclusively tracks unclosed LaTeX command curly braces (`{...}`), never merging lines based on unclosed dollar signs.
    2. **Independent Tokenizer & Vietnamese Prose Shield (`mathTokenizer.js`, `renderInlineContent`)**: Embedded `stripTextGroups` and prose invariant tests. If any math delimiter candidate (`$...$` or `$$...$$`) contains accented Vietnamese characters outside `\text{}` or multi-word lowercase prose, the renderer immediately refuses math compilation and safely outputs natural text `<span>`, guaranteeing 0% red text errors.
- **Short Formula Display-Block Downgrade & Visual Layout Preservation**:
  - When LLMs output short single-compound formulas (such as `$$HCOOCH_3$$` or `$$C_nH_{2n}$$`), standard block renderers wrap them in centered block `<div>` elements (`my-2.5 text-center`), severely fracturing narrative flow and causing trailing colons (`: methyl formate`) to drop awkwardly onto the next line.
  - Implemented automatic block downgrade in `renderStructuredContent`: Formulas under 40 characters without complex fractions or long arrows are automatically downgraded from display `<div>` to inline `<span className="inline-math">`, maintaining pristine sentence flow.
- **Intelligent Formula Stitching for Severed PDF/OCR Streams**:
  - Automatically stitches formulas severed across newline boundaries during OCR extraction: `C_nH_{2n-4} \n O_2` -> `$C_nH_{2n-4}O_2$`.
  - Stitches severed compound names before colon descriptors (`HCOOCH_3 \n : methyl formate` -> `HCOOCH_3: methyl formate`).
  - Purged phantom `undefined` tokens and unspaced operators (`\equivC` -> `\equiv C`, `$ = $` -> `=`).
- **Verification**:
  - `npm run build` completed cleanly in 2.68s with 0 errors and 0 warnings.

### 4.62. Markdown Table Glassmorphic Rendering, Option Quote Stripping & Red Undefined Purge Architecture (`MathText.jsx`, `CurriculumExplorerView.jsx`)
- **Responsive Glassmorphic Markdown Table Engine (`renderMarkdownTable`)**:
  - *Architectural Gap*: Tabular stoichiometric data and reaction charts (`|Chất | CH_3COOH | C_2H_5OH |...|`) extracted by AI were rendered as raw, unformatted text strings with literal pipe characters `|` and separator lines `|---|---|`, breaking the pedagogical UI experience.
  - *Architectural Resolution*: Implemented `renderMarkdownTable` in `MathText.jsx` parsing Markdown table structures into responsive glassmorphic HTML `<table>` elements with rounded borders (`rounded-xl`), shaded headers (`bg-slate-100/90`), zebra-striped rows (`bg-slate-50/70` vs `bg-white`), horizontal scrolling (`overflow-x-auto`), and inline KaTeX rendering inside each table cell.
- **Complete Elimination of Red 'undefined' Error Tokens**:
  - *Architectural Guard in `renderKatexHtml`*: Sanitizes all math strings before KaTeX parsing by purging `\undefined` and `undefined`; automatically strips error elements matching `<span class="katex-error">` containing `undefined` from the rendered HTML.
  - Automatically reconstructs standard textbook efficiency formulas: `H\% = \frac{m_{\text{thực tế}}}{m_{\text{lí thuyết}}} \times 100\%`.
- **Option Quote Stripping & Multiple-Choice Polish (`cleanOptionDisplay`)**:
  - Thoroughly strips all single quotes `'`, double quotes `"`, backticks, and unicode curly quotes around options A-D.
  - Stitches multiline severed chemical options back into continuous inline formulas and encloses them into `$ ... $`.
- **Verification**:
  - `npm run build` completed cleanly in **3.08 seconds** (3015 modules transformed, 0 Error, 0 Warning).

### 4.63. Production Docker Deployment & Multi-Environment Domain Routing Architecture (`apiClient.js`, `nginx.conf`, `docker-compose.yml`)
- **Multi-Environment Gateway Base URL Resolution (`apiClient.js`)**:
  - *Architectural Problem*: In cloud or domain deployments (e.g. `pickic.io.vn`), hardcoded `http://localhost:5212` causes client-side browsers to make cross-origin calls to the user's local machine, triggering mixed-content security blocks and connection failures.
  - *Architectural Solution*: Implemented dynamic `getGatewayBaseUrl()` in `src/services/apiClient.js`:
    - When `window.location.hostname` ends with `pickic.io.vn`, dynamically binds to `https://api.pickic.io.vn` with full end-to-end SSL/TLS encryption.
    - When executing on local developer machines (`localhost`), defaults to `http://localhost:5212`.
    - Integrated with all `request()` invocations and `apiClient.getBaseUrl()` for Server-Sent Events (SSE) AI Tutor streaming.
- **High-Performance Nginx Alpine Reverse Proxy & Static Asset Caching (`nginx.conf`)**:
  - Enabled level 6 Gzip compression for all text/css/js/json/svg mime types.
  - Added SPA fallback `try_files $uri $uri/ /index.html` preventing 404s on browser reloads.
  - Embedded `location /api/` reverse proxy pass to `http://v-eval-gateway:5212/api/` with HTTP/1.1 WebSocket Upgrade support and 600-second timeouts for AI streams.
- **Verification & Acceptance**:
  - Local Vite production build: `npm run build` completed in **2.36 seconds** (3015 modules transformed, 0 Error, 0 Warning).
  - Public Cloudflare Tunnel verification:
    - `https://pickic.io.vn` -> HTTP/2 200 OK
    - `https://app.pickic.io.vn` -> HTTP/2 200 OK

---

### 4.64. KaTeX Error Sanitization, Vietnamese Prose Protection & Chemistry Invariant Architecture (`MathText.jsx`)
- **Root-Cause Resolution of Red KaTeX Parse Errors**:
  - *Identified Vulnerability*: When mathematical formulas were preceded by spaces or contained complex denominators (e.g., `$n_{\text{triglyceride}} = \frac{n_{CO_2} - n_{H_2O}}{k - 1}$`), greedy regex matching injected extra `$` tokens and left stray unescaped `$` inside math braces (`{k - 1$}`), causing KaTeX to abort and render red error text `<span class="katex-error">`.
  - *Architectural Solution*:
    - In `renderKatexHtml`: Automatically strips all unescaped `$` within the math mode payload (`clean.replace(/(?<!\\)\$/g, '')`) and balances curly braces `{` and `}`, guaranteeing clean KaTeX rendering with zero red error spans.
    - Line-by-line equation parsing: Equations with `=` and `\frac` / `\sqrt` are matched on isolated lines without crossing newlines or matching Vietnamese text.
- **Vietnamese Prose Invariant & Elimination of Swallowed Math Mode**:
  - *Identified Vulnerability*: Regex `(?<![\$\w])([A-Z][a-zA-Z0-9_+-]+)\$` mistook uppercase symbols in `$-OH$` and `$-COOH$` as orphaned formulas, inserting stray `$` to form `$-$OH$`. This single misplaced delimiter inverted the polarity of all subsequent dollar signs in the paragraph, converting entire Vietnamese prose sections into italicized, space-stripped math variables.
  - *Architectural Solution*:
    - Completely removed the disruptive token insertion regex.
    - Added automatic prose recovery in `MathText.jsx`: Detects any `$ ... $` block containing accented Vietnamese vowels without `\text{}` tags and unpacks it back to native prose.
- **Multi-Reaction Formula Isolation**:
  - Formatted consecutive chemical reactions (`\xrightarrow`, `\rightleftharpoons`, `\longrightarrow`) as distinct line-by-line display math blocks (`$$ ... $$`), preventing cross-line multi-equation entanglement.
- **Verification**:
  - `npm run build` passed in 3.06s with 3015 modules transformed, 0 errors and 0 warnings.

---

### 4.65. Multi-Line Math Leakage Prevention, Labeled Reaction Separation & Formula Boundary Normalization (`MathText.jsx`)
- **Single-Dollar Inline Math Boundary Hardening**:
  - *Identified Vulnerability*: Greedy multi-line matching `\$[^\$]+?\$` in `renderInlineContent` allowed an unclosed dollar sign on one line to bridge across multiple paragraphs and lines to a closing dollar sign several lines below, swallowing explanatory Vietnamese prose into KaTeX math mode (e.g. `suyragốcacidlà`).
  - *Architectural Solution*:
    - Hardened inline math delimiter regex to `\$[^\$\r\n]+?\$`, strictly preventing single-dollar math expressions from spanning across newline boundaries.
    - Added an extra safety guard in `renderInlineContent`: Any inline math block containing Vietnamese accented characters without `\text{}` is immediately unpacked and rendered as normal text spans.
- **Labeled Reaction Equation Disambiguation**:
  - *Identified Vulnerability*: Lines beginning with labels such as `Phương trình: (RCOO)_3C_3H_5 + 3NaOH \xrightarrow{t^\circ} 3RCOONa + C_3H_5(OH)_3` failed the Vietnamese exclusion filter and remained unrendered raw LaTeX text.
  - *Architectural Solution*: Disambiguated the label prefix (`Phương trình:`, `PTHH:`), outputting the label as prose and wrapping the reaction equation in an isolated `$$ ... $$` display math block.
- **Verification**:
  - Production build `npm run build` completed in **2.82 seconds** with 0 errors and 0 warnings.
  - Container `v_eval_web_client` reloaded with new bundle.

---

### 4.66. Emergency KaTeX Error Neutralization & Equality Operator Boundary Hardening (`MathText.jsx`)
- **Emergency KaTeX Error Neutralization**:
  - *Identified Vulnerability*: Even with preliminary string cleanup, malformed AI-generated equations could trigger KaTeX parse errors, which rendered an unsightly red box (`<span class="katex-error" style="color:#cc0000">`).
  - *Architectural Solution*: In `renderKatexHtml`, implemented a two-tier emergency sanitizer. When `html.includes('class="katex-error"')`, the engine first attempts an aggressive syntax cleanup and re-render. If KaTeX still fails, it automatically strips the `<span class="katex-error"...>` tag and returns a clean, unadorned serif span, permanently eliminating red syntax error boxes from the end-user interface.
- **Formula Boundary Preceding Punctuation & Equality Operator Sanitization**:
  - Automatically neutralizes stray dollars placed adjacent to equality signs: `\$\s*=\s*\$?|(?<=\w|\})\s*\$\s*=` -> `= `.
  - Automatically inserts a closing dollar when a chemical formula is immediately followed by a period and Vietnamese explanatory prose (`$C_{17}H_{33}$. 1 mol`), preventing math-mode swallowing of entire explanation sentences.
- **Verification**:
  - Production build `npm run build` completed in **2.39 seconds** with 3015 modules transformed, 0 errors and 0 warnings.
  - Deployed and verified in container `v_eval_web_client`.
  - *Architectural Solution*:
    - Implemented colon-split logic: When a reaction arrow (`\xrightarrow`, `\rightleftharpoons`, `\longrightarrow`) is detected on a line with a prefix label, the label is cleanly separated and the reaction equation is wrapped in display math `$$ ... $$` on its own line.
- **Subscript Spacing & Formula Fragment Coalescing**:
  - Automatically corrects OCR/LLM spacing faults like `(OH)_ 3` -> `(OH)_3`.
  - Coalesces spaced chemical formulas `C_{15}H_{31} COOH` into `$C_{15}H_{31}COOH$`.
  - Joins split multiline ester formulas like `$C_nH_{2n}\nO_2` into `$C_nH_{2n}O_2$`.
  - Standardizes inequality constraints with misplaced delimiters: `(n \ge 2$)` -> `($n \ge 2$)`.
### 4.67. KaTeX Frac & Text Spacing Normalization & Equation Auto-Wrapping (`MathText.jsx`)
- **Spacing Normalization Between Commands and Braces**:
  - *Identified Vulnerability*: LLMs intermittently output `\frac{...} {...}` with a space between argument braces, or `\text {...}` with a space after `\text`. KaTeX's inline tokenizer ceased scanning at the whitespace, passing an incomplete command (e.g. `\frac{2n + 2 - 2H}` with one argument, or bare `\text`) which generated red `<span class="katex-error">` syntax errors.
  - *Architectural Solution*: In `normalizeMathString`, added regex normalization:
    - `\\(text|mathrm|mathbf|...)\s+\{` -> `\\$1{`.
    - `(\\frac\s*\{[^{}]*\})\s+(\{[^{}]*\})` -> `$1$2`.
    - `{2 }` -> `{2}` and `0,1\text{mol}` -> `0,1 \text{mol}`.
- **Equation Auto-Wrapping**:
  - Automatically identifies arithmetic equations containing equality and `\frac`: `(?<![\$\w])((?:[a-zA-Z]|\\[a-zA-Z]+)(?:_[a-zA-Z0-9\{\}\\]+)?\s*=\s*\\frac\{[^{}]+\}\{[^{}]+\}(?:\s*=\s*[0-9,\.]+(?:\s*\\text\{[^{}]+\})?)?)(?![\$\w])` -> `$$$1$$`.
  - Transforms `k = \frac{2n + 2 - 2H} {2 }` -> `$k = \frac{2n + 2 - 2H}{2}$` and `n = \frac{8,8}{88} = 0,1\text {mol}` -> `$n = \frac{8,8}{88} = 0,1 \text{mol}$`.
- **KaTeX Error Box Neutralization**:
  - Strips any remaining `<span class="katex-error"` and associated `style="color:#cc0000"` styling, replacing it with an inline serif math span, ensuring red syntax error boxes never reach the end user.
- **Verification**:
  - `npm run build` completed in **2.66s** with 3015 modules transformed, 0 errors, 0 warnings.
  - Re-loaded live Nginx service inside `v_eval_web_client` container.

### 4.68. 4-Mode Document OCR Architecture Integration & KaTeX Bracket Invariance (`CurriculumExplorerView.jsx`, `MathText.jsx`)
- **Interactive 4-Mode Document Extraction Cards (`CurriculumExplorerView.jsx`)**:
  - Embedded a 4-card interactive OCR selection component into the Curriculum AI Ingestion Modal:
    1. `STEM_FORMULAS`: Mathematics, Physics, Chemistry (LaTeX formulas, chemical equations, variation tables via Vision AI).
    2. `TEXT_HUMANITIES`: Humanities, Vietnamese, History, Geography (Smart auto-detection with Vision failover for InDesign font encoding issues).
    3. `VISION_AI`: 100% Gemini Vision AI image processing (Immunization against InDesign font corruptions and legacy scanned PDFs).
    4. `AUTO_LOCAL`: Offline digital PdfPig extraction (Ultra-fast for standardized text PDFs without consuming AI tokens).
  - Maintained `importOcrMode` state (defaulting to `'STEM_FORMULAS'`), passed via `FormData` (`ocr_mode` and `ocrMode`) to `/api/ai-engine/curriculum/extract`.
- **KaTeX Bracket Invariance & Nested Fraction Equation Auto-Wrapping (`MathText.jsx`)**:
  - Removed rogue `$` delimiters trapped inside curly braces `{k - 1$}` and parentheses `(n \ge 2$)` prior to line balancing.
  - Coalesced disconnected ester formulas (`$C_nH_{2n}$O_2` -> `$C_nH_{2n}O_2$`).
  - Upgraded calculation equation auto-wrapping to support nested curly braces within numerators/denominators (e.g. `$n_{\text{triglyceride}} = \frac{n_{CO_2} - n_{H_2O}}{k - 1}$`).
- **Verification**:
  - `npm run build` completed cleanly in **2.89s** with 3015 modules transformed, 0 errors, 0 warnings.
  - Reloaded live Nginx service inside `v_eval_web_client` container.

### 4.69. Widescreen AI Curriculum Studio Redesign, Dynamic Easing Progress & Comprehensive KaTeX Stabilization (`CurriculumExplorerView.jsx`, `MathText.jsx`)
- **Widescreen Modal Studio Layout (`CurriculumExplorerView.jsx`)**:
  - Expanded modal viewport from `max-w-4xl` to `max-w-6xl` (`max-h-[94vh]`), implementing a panoramic 2-column workspace (5 cols left / 7 cols right).
  - **Left Column (5 cols)**: Target domain selection, drag-and-drop document upload area with metadata tags, PDF page slice filter (all pages vs custom range for 99+ page textbooks), and text snippet fallback input.
  - **Right Column (7 cols)**:
    - Dedicated side-by-side rich comparison cards for **"Chuyên Sâu ĐGNL"** (multi-lesson extraction, 2–4 core patterns, 4 pedagogical blocks, sample problems, exam traps, Casio tips, 3D geometry & variation tables, Bloom L1–L4 questions) vs **"Tiêu Chuẩn"** (syllabus outline, foundational patterns, 5–10s latency, 70% token economy).
    - 4-mode document extraction grid (`STEM_FORMULAS`, `TEXT_HUMANITIES`, `VISION_AI`, `AUTO_LOCAL`).
  - **Dynamic Easing Progress Bar**:
    - Replaced static step-based increments (`step * 25%`) with a smooth client-side easing ticker (`aiProgressPercent`, `aiProgressMessage`) advancing progressively through 10% → 28% → 55% → 78% → 90% → 96% and surging to 100% upon backend completion, eliminating the frozen 50% state.
- **Root-Cause KaTeX Control Character & Subscript Neutralization (`MathText.jsx`)**:
  - Restored ASCII control characters decoded by JSON parsers (`\x0c` form feed -> `\f` restoring `\frac`, `\x09` tab -> `\t` restoring `\text` and `\times`, `\x08` backspace -> `\b` restoring `\bar` and `\beta`), directly eliminating KaTeX `ParseError: Unexpected character: '\x0c'`.
  - Automatic romanization of Vietnamese terms in subscripts (`m_{\text{chất béo}}`, `m_{\text{muối}}`, `n_{\text{muối}}`, `n_{\text{ester}}`, `m_{\text{glycerol}}`) avoiding squished italic text.
  - Natural text unpacking for display math and inline math blocks containing unescaped Vietnamese words (preventing `suyragốcacidlà`).
  - Safe sanitization stripping any lingering `#cc0000` text styles in KaTeX output.
- **Verification**:
  - `npm run build` completed in **3.0s** (3015 modules transformed, 0 errors).
  - Reloaded live Nginx service inside `v_eval_web_client` container.

### 4.70. Comma Delimiter Preservation, Vietnamese Math Auto-Closing & Dedicated 2-Mode Extraction Studio Acceptance [12/11/2026]
- **Comma Delimiter Preservation & Delimiter Hardening (`MathText.jsx`)**:
  - Eliminated dangerous regex `str.replace(/\$,/g, ', ')` that deleted the closing math delimiter `$` on comma-delimited formula lists (such as `($C_{15}H_{31}COOH$, $C_{17}H_{35}COOH$, $C_{17}H_{33}COOH$)`), which previously caused unclosed math mode that swallowed subsequent Vietnamese text.
  - Added lookahead auto-closing for unclosed chemical formulas and variables preceding Vietnamese natural language tokens (`$CH_3COONa$ suy ra`, `$C_{17}H_{33}$. 1 mol`), guaranteeing zero squished italic text.
- **Dedicated 2-Mode Extraction Architecture (`CurriculumExplorerView.jsx`)**:
  - Upgraded extraction options into 2 distinct pedagogical tracks:
    1. `EXAM_PATTERNS` ("Chuyên Dạng Đề & Bài Toán Thực Chiến"): VNU-HCM V-ACT 4-step algorithm, quantitative numerical problem sets with authentic exam values, Casio fx-580/880 tips, and Bloom L1-L4 test questions.
    2. `THEORY_EXTENDED` ("Chuyên Lý Thuyết Thuần & Dạng Mở Rộng"): 100% textbook theory (definitions, nomenclature, physical properties, boiling points, reaction mechanisms, experiment protocols) and all 7 core/extended patterns across 60+ page documents.
  - Expanded modal viewport to `max-w-[1650px] w-[98vw]` (pre-extraction) and `max-w-[1780px] w-[98vw]` (post-extraction Panoramic Workspace).
- **Verification**:
  - `npm run build` completed cleanly in **6.67s** (3015 modules transformed, 0 errors).
  - Nginx reloaded inside `v_eval_web_client` container. Zero KaTeX parse errors and clean typography verified.

### 4.71. WrapUntouched Delimiter Segregation, Implication Operator & Decimal Normalization Acceptance [12/11/2026]
- **WrapUntouched Delimiter Architecture (`MathText.jsx`)**:
  - Implemented `wrapUntouchedMath` isolating already-wrapped math segments (`$...$`) prior to executing chemical formula regex patterns, entirely preventing nested delimiters such as `$($C_{17}H_{35}COO$)_3C_3H_5$`.
  - Added deduction operator `\Rightarrow` to LaTeX command registries and `opPattern`, ensuring multi-step deduction statements (e.g. `n_{\text{tristearin}} = 0,01\text{ mol} \Rightarrow n_{\text{muối}} = 0,03\text{ mol}`) remain seamlessly integrated inside a single KaTeX math expression.
  - Automated normalization of stray whitespaces after commas in decimal numbers (e.g. `9, 18 gam` -> `9,18 gam`), eliminating accidental split math segments.
  - Restored missing opening bold tags (`Phân tích & Lời giải:**` -> `**Phân tích & Lời giải:**`).
- **Verification**:
  - `npm run build` completed cleanly in **2.37s** (3015 modules transformed, 0 errors).
  - Live Nginx reloaded inside `v_eval_web_client` container.

### [12/11/2026] - Merge develop into diagnostic frontend branch

- Resolve 24 conflicted frontend files from develop 115eace. Integrate incoming role portals, curriculum/authoring, payment, notifications, expanded API services and structured math rendering; preserve the local diagnostic assessment lifecycle, profile helpers, account settings and remember-me behavior.
- Wire the retained diagnostic page into the new portal with the signed-in user and account-specific component key. Student history uses the owned server-backed diagnostic view. Remove incoming shared latest-result loading and prevent seeded/unowned local submission history from reappearing.
- Combine API query params and PATCH support with proactive token refresh, session-only login, session generation guards and diagnostic privacy cleanup. Refresh preserves the user and selected storage without creating a new login session. Add diagnostic API aliases required by the retained assessment.
- Fix conditional React hooks in incoming MathGraphView and math-workbench modal. Install the declared jsxgraph dependency; retain its incoming package/lock contract.
- Validation: production build passed; npm run lint exited zero with warnings; all 21 tests passed (17 diagnostic/privacy, 2 Flow 6 and 2 merge integration cases). Build warns about bundle size and direct eval inside jsxgraph. Browser/live API/visual behavior was not verified.
- Scope: frontend and progress documentation only. No backend code or configuration backups changed. System-Repo and uppercase frontend have separate merge state; their service code is outside this resolution.

### [12/11/2026] - V-Eval logo integration

- Added the approved generated transparent PNG as src/assets/v-eval-logo-v2.png, keeping its original resolution and alpha. Verified dimensions 1877 x 838 and transparent corner pixel.
- Added shared BrandLogo component with intrinsic dimensions, responsive width and preserved aspect ratio. Replaced placeholder brand marks in public header, login header, sidebar and mobile portal navbar. Dark public footer uses a white silhouette through CSS filtering.
- Validation: npm run build passed with existing bundle-size and jsxgraph eval warnings. Browser visual verification not performed. No backend edits; existing staged merge state preserved.

### [12/11/2026] - Frontend merge and branding checkpoint

- Complete the lowercase frontend merge of develop 115eace into TNhan/auth-custom-select-validation, retaining diagnostic lifecycle fixes and integrating incoming portals/services/math tooling.
- Include approved transparent V-Eval logo and shared BrandLogo integration in public/login headers, sidebar, mobile navbar and dark footer.
- Validation before commit: all 21 node tests passed; lint exited zero with warnings; production build passed with existing bundle-size and jsxgraph eval warnings. Live browser/API behavior not verified.
- Commit scope is the frontend repository only. The root repository's separate pending merge, backend repositories, uppercase frontend and configuration backups remain untouched by this commit. No push performed.

### [12/11/2026] - End-User Login Copy Cleanup & Backend-First Error Passthrough

- **End-User Authentication Copy Hygiene & Single-Viewport Layout (`src/components/auth/WebLoginPage.jsx`, `LoginForm.jsx`, `RegisterForm.jsx`, `AuthModal.jsx`, `src/utils/emailValidator.js`)**:
  - Removed internal algorithmic, pedagogical, and infrastructure terminology (`v2.4 Live`, `IRT 3PL`, `IRT Theta`, `IRT 2PL`, `DAG Topo`, `CAT`, `AI Socratic Tutor`, `ZPD`, `BKT`, `IAM Gateway (:5212)`, `IAM Backend`, `JWT`, `API Gateway`, internal campus codes, and `MX` / `DNS NXDOMAIN` labels) from user-facing login and registration screens, replacing them with learner-friendly copy.
  - Removed the redundant role-routing notice card under the login button and redesigned the split container as a balanced 6/6 (`max-w-[1060px]`) layout with a flush full-width hero photo card, compact pill highlights, and isolated right-column scroll (`lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto`) so login fits cleanly in a single desktop viewport without page scroll.
- **Backend-Driven Error Extraction & Clean Proxy Outage Handling (`src/utils/apiErrorHandler.js`, `src/services/apiClient.js`, `src/services/authService.js`)**:
  - Added shared `extractBackendErrorMessage` and `formatApiError` helpers that prioritize passing through the exact error message returned by Backend services across Clean Architecture `Result` objects (`error.description`, `errors[]`), ASP.NET `ValidationProblemDetails` dictionaries (`errors`), `message`/`detail`/`title` fields, and plain-text payloads without duplicating or overriding backend wording in the frontend.
  - Safely parses response bodies in `apiClient.js` (supporting both real `fetch` and `response.json()` mocks) and substitutes concise Vietnamese fallback messages only when upstream proxies or network outages return empty/HTML responses (such as raw `HTTP Error 502` or offline `Failed to fetch`).
  - Added `404` Gateway route fallback (`/api/v1/identity/auth/...`) to `forgotPassword`, `verifyResetOtp`, and `resetPassword` in `authService.js`.
- **Verification**: `node --test tests/*.test.js src/**/*.test.js` passed all 25 test cases (including 4 new cases in `tests/apiErrorHandler.test.js`), `npm run lint` exited 0 with zero errors, and `npm run build` succeeded cleanly.

### [12/11/2026] - Compact portal navigation and account menu

- Keep the sidebar as primary navigation and remove the duplicated role/context/segmented tab strip. Remove the redundant role badge below the sidebar logo.
- Compact top bar shows current page title, student-only streak chip, notification placeholder and avatar/name menu. Settings, home and logout now live in the account dropdown, with outside-click/Escape dismissal, arrow navigation and accessible labels. Removed static notification unread dot; notification button remains unavailable rather than claiming unread data.
- On mobile/tablet, a hamburger opens the shared role sidebar in a drawer with focus containment, Escape/backdrop dismissal, scroll locking and close-on-navigation/desktop resize. Desktop retains the sidebar.
- Greeting text uses role and profile full name; student/parent banners are updated and other role landing pages show a role-aware greeting. Removed the student campaign label; detailed dashboard streak remains.
- Repository diagnosis before edits: lowercase frontend was clean; System-Repo had 99 pending changes in a separate merge, uppercase frontend had 9 changes including 4 conflicts, and other service repositories had their own pre-existing edits/backups. No reset, commit, push or backend edits performed.
- Validation: production build passed with existing bundle-size/jsxgraph eval warnings; lint exited zero with warnings; all 21 existing tests passed. Browser visual, keyboard and mobile interactions were not manually verified.

### [12/11/2026] - Refine compact header visual hierarchy

- Add a V-Eval/role breadcrumb and page icon above/beside the stronger page title. Use a subtle tinted background and balanced 72/80px header height without restoring duplicate tab navigation.
- Show a compact local-date label on wide screens, refine the student streak as a small two-line chip, and restore role context below the account name with a gradient avatar and clear expanded-state styling.
- Mobile retains compact labels and hamburger navigation. Existing account dropdown and dashboard streak detail are unchanged.
- Validation: production build passed with existing bundle-size/jsxgraph eval warnings. Browser visual verification not performed; no backend edits, commit or push.

### [12/11/2026] - Student sidebar organization preview

- Reorganize student-only sidebar into Overview, Learning, Assessment and Student Services. Group existing diagnostic and mock-exam actions under an expandable Tests & Mock Exams menu; retain history and analytics as sibling entries.
- Preserve every existing tab ID, callback, API and assessment behavior. Existing practice action remains Practice rather than claiming a new mistake-notebook workflow. Other roles are unchanged.
- Submenu opens on the diagnostic tab; child actions retain active highlighting and close the shared mobile drawer after navigation. Expanding the parent does not navigate.
- Validation: production build passed with existing warnings. No new business logic or tests; browser visual/interaction verification pending. No commit or push.

### [12/11/2026] - Dashboard entry guidance for diagnostic onboarding

- Add an inline first-position student dashboard card above parent linking and the greeting banner. Read completed distinct diagnostic exams from the existing history API and validated local draft for the current student.
- Show first-assessment, partial-progress, saved-draft, locked-submission, completed and loading/error states. Buttons navigate to existing diagnostic/roadmap screens; no exam is started automatically and no assessment handlers or APIs changed.
- Partial progress uses Check next assessment rather than claiming a new exam is available. The existing diagnostic entry validates actual availability. No extra Content request is made on dashboard load.
- Show accurate /3 progress and a retry action on history failure; no demo progress. User/account changes discard obsolete requests. Existing page remains usable; no modal or screen dimming.
- Validation: production build and lint exited zero with existing warnings. Browser visual/interaction verification not performed. No backend edits, commit or push.

### [12/11/2026] - Colorful diagnostic onboarding card

- Restyle the existing dashboard card with a light blue/indigo/violet gradient, decorative background rings, gradient assessment icon, concise badge and stronger heading hierarchy.
- Add a white inset progress/action panel with three numbered/checkmarked milestones and gradient CTA. Completed state uses emerald/teal; responsive stacking and all existing state/API/navigation behavior remain unchanged.
- Validation: production build passed with existing warnings. No browser visual verification, backend edits, commit or push.

### [12/11/2026] - Parent-link card readability

- Increase parent-link heading to 16/18px and description to 14px with comfortable line height. Separate account code into a larger monospace badge and allow heading/badges to wrap.
- Refine the card with a subtle indigo tint, larger family icon and responsive action area. Shorten duplicate copy, use clear copy confirmation and keep all handlers/API/modal behavior unchanged.
- Validation: production build passed with existing warnings; browser visual verification not performed. UI only; no commit/push.

### [13/11/2026] - Dashboard setup cards in 7:3 columns

- Place diagnostic onboarding and parent linking in a shared 7fr/3fr grid at xl widths, with equal-height stretching and minimum-width safeguards. Smaller screens stack diagnostic first, parent linking second.
- Compact diagnostic heading/icon/action panel and use container-width breakpoints so its internal layout responds to available card width, not full viewport width.
- Parent link card stays vertical with its code and description above two compact action buttons. Pending-parent requests and modal/API handlers are preserved.
- Validation: production build passed with existing bundle-size/jsxgraph eval warnings. No live browser visual verification. Presentation only; no backend edits, commit or push.

### [13/11/2026] - Account dropdown visual polish

- Refine account menu with a blue/indigo-tinted identity panel, avatar, role badge, improved spacing and icon containers for settings/home.
- Make logout an explicit solid red full-width action with white icon/text, darker hover and visible keyboard focus. Preserve all existing actions, menu dismissal and navigation behavior.
- Validation: production build passed with existing bundle-size/jsxgraph eval warnings. No browser visual verification, backend edits, commit or push.

### [13/11/2026] - Separate student history and stabilize curriculum layout

- Student History now has separate Diagnostic, Practice and Mock Exam categories. Diagnostic history reuses the server-backed result view in read-only history mode: no new-exam action, auto-start or draft recovery. Diagnostic entry retains start/resume/progress and links to history instead of duplicating the history table.
- Practice history displays only current-student ZPD/TOPIC records actually stored by the existing practice UI and labels them browser-local, with answer review. No seeded history or fabricated remote results. Mock history has an explicit unavailable state.
- Read-only backend inspection found diagnostic list/detail endpoints, but no per-student practice-attempt or mock-exam list endpoint in the current Stages/MockExams controllers. Mock detail exists by submission ID only. Backend list endpoints are needed for complete cross-device practice/mock history; no backend edits.
- Curriculum loading now reserves a comparable page structure with skeletons; remove the content entrance animation/broad header transition, constrain width/min-width, wrap header actions by available container width, and stabilize scrollbar space. This addresses identified layout-shift/overflow risks; reported browser zoom appearance has not been reproduced directly.
- Validation: production build and lint exited zero with existing warnings; 21 existing node tests passed. Browser visual, slow-network and category interactions remain unverified. No commit/push.

### [13/11/2026] - Student portal UI and history checkpoint

- Checkpoint pending frontend presentation work: compact account header/menu with red logout, role-aware greetings, shared mobile sidebar and grouped student navigation.
- Include API-backed diagnostic entry guidance, colorful progress card, 7:3 setup-card layout and readable parent-link controls.
- Separate diagnostic entry from categorized history. Diagnostic history is server-backed; practice history is explicitly browser-local; mock history awaits a BE list API. Stabilize curriculum loading and width behavior without backend changes.
- Final validation before commit: all 21 existing tests passed, lint exited zero with warnings, production build passed with existing bundle-size/jsxgraph eval warnings, and git diff whitespace check passed. Browser/live API and reported layout issue remain unverified directly.
- Commit scope is lowercase frontend only. Root repository pending merge, uppercase frontend and backend service changes are excluded. No push performed.

### [13/11/2026] - Student curriculum catalog and spacious learning workspace

- Add a student-only catalog: subject selection, search and Chapter/Lesson/Pattern accordion with explicit Enter lesson actions. Do not auto-open a lesson or show authoring controls to students.
- Open selected patterns in a full-application reading workspace with breadcrumb/back navigation, optional outline, Knowledge/Method/Video & Examples tabs, larger reading text and preserved MathText graph/formula rendering. Sidebar is covered while studying; restore catalog focus/scroll on return.
- Reuse existing curriculum data, quiz generation/submission handlers and quiz modal; extract modal JSX for reuse without changing scoring or API payloads. Existing AI context callback is wired from App. Staff retain the original two-column authoring interface.
- Video controls use provided safe HTTP(S) source URLs; unsupported sources open in a new tab. Missing content is labelled as being updated. No completion/mastery state or prerequisites are invented, and existing quiz fallback behavior is unchanged.
- Validation: production build and lint passed with existing warnings; all 21 existing tests passed. Browser visual/media/keyboard flows have not been manually verified. No backend edits, commit or push.

### [13/11/2026] - Student chapter/lesson accordion defaults

- Open only the first chapter and first lesson by default for each subject. Opening another chapter/lesson collapses its sibling; show patterns only after lesson expansion. Search temporarily expands matching results.
- This changes catalog disclosure state only; lesson content, quiz handlers and APIs are unchanged. Confirmed existing add/edit chapter, lesson and pattern controls remain in the staff authoring view, not the student view.
- Validation: production build passed with existing warnings. Browser interaction not manually verified. No backend edits, commit or push.

### [13/11/2026] - Preserve independently expanded chapters and lessons

- Correct the previous exclusive accordion behavior at the user's request. Each chapter and lesson now has its own expansion flag; opening a new item does not collapse existing items.
- Retain first-chapter/first-lesson defaults, per-subject expansion memory while mounted, and search expansion. Only clicking an already expanded item's own heading collapses it. This supersedes the earlier sibling-exclusive behavior.
- Validation: production build passed with existing warnings. No business logic/API changes, commit or push.

### [13/11/2026] - Chapter-scoped reading outline

- Restrict reading-workspace outline to the current chapter. Show chapter name, flat lesson section headings and their pattern links; no extra nested disclosure controls.
- Mark current lesson/pattern with highlight, current-page semantics and Studying label. Selecting a link stays within the chapter; a separate action returns to the catalog to choose another chapter.
- Validation: production build passed with existing warnings. No quiz/API changes, browser visual verification, commit or push.


### [13/11/2026] - Dedicated teacher portal and scoped live data

- Added teacher teaching overview with quick links to curriculum authoring, class mastery, exam bank, student diagnostic history and early-warning support. Existing staff chapter/lesson/pattern editing stays in CurriculumExplorerView; student reading workspace remains separate.
- Teacher navigation no longer routes history/analytics to student screens or exam bank back to curriculum. Removed obsolete teacher Live Q&A shortcut and misleading sidebar zero counts.
- New portal uses direct API requests without seeded fallback. Exam list/detail use Content endpoints. Heatmap and diagnostic history use the assigned class and its roster. Alert resolution sends mentor_id and resolution_notes and refreshes only after API success. Account/tab remounts and effect cleanup discard obsolete read responses.
- BE dependencies: no teacher assigned-class list endpoint found in ClassesController, and UserProfileDto has no class assignment. Class-dependent screens show unavailable state until currentUser.classId is supplied. No default/sample class or all-system alert request is issued.
- BE gap verified read-only: GetAlertsDashboardQueryHandler does not apply MentorId; absent ClassId calls GetAllAlertsAsync. FE always includes a class for teacher alerts, but server-side assignment authorization still requires BE review. Teacher-wide practice/mock submission lists were not found; history is explicitly diagnostic-only.
- Validation: 24 tests passed including missing-assignment/global-alert guards; lint exited zero with warnings and production build passed with existing JSXGraph eval/bundle warnings. Live teacher login, visual browser review and API authorization not verified. Backend files unchanged; no commit/push.


### [13/11/2026] - Curriculum and teacher portal commit checkpoint

- Prepare the lowercase frontend checkpoint containing the student catalog/reading workspace, chapter-scoped outline, teacher overview/navigation, scoped API requests and tests. Validation: 24 tests passed, lint and build passed with warnings, whitespace check passed. Live browser/API verification remains pending. Backend repositories and root pending merge are excluded; push is left to the user.


## [14/11/2026] - Authentication toast feedback

- Reused the existing root ToastProvider for login and local logout success, authentication validation/API errors, registration and OTP/password recovery feedback. Inline form feedback remains available; activation prompts emit one warning.
- Added error toasts for failed account/campus list loading. Toast cards expose alert/status roles, an accessible close label and a viewport-constrained width.
- Validation: frontend production build and lint exited 0 with existing warnings; targeted whitespace checks passed. Browser appearance and live authentication APIs were not verified. No backend edits, staging, commit or push; the System-Repo merge remains pending.

### [14/11/2026] - Compact notification layout

Presentation-only refinement of the existing toast container: content-sized cards, maximum width 340px with viewport constraint, softer decoration and compact spacing. Notification lifecycle and API behavior are unchanged. Production build and whitespace checks passed; browser appearance has not been directly verified. No backend changes or Git merge operations.

### [14/11/2026] - Diagnostic skill mastery report

- Added DiagnosticSkillProfile to fresh and historical diagnostic results. Preserved skillPriors from API responses; show all assessed skills, answer accuracy and valid pL0 estimates separately. Inferred/unknown sources are explicitly grouped only when supplied. Missing estimates are not replaced with zero or current LearningProfiles data.
- Validation: frontend build and lint exited 0 with existing warnings; whitespace check passed. Browser and a real submission response were not verified. Backend source was inspected only; no backend edits or Git operations.

Backend follow-up: Practice sends an empty AllSkillIds mapping to AI, preventing the inferred-skill branch. Historical GetDiagnosticSubmissionById does not populate SkillPriors or RadarChart. Preserve per-submission estimates and source for historical reporting instead of reading mutable current LearningProfiles. Inferred skill labels also need metadata because current response name lookup uses only questions in the test.

### [14/11/2026] - Tabbed diagnostic report

- Kept the score/IRT/time summary above three report tabs: overview, answer review and competency analysis. Applied the same layout to freshly submitted and historical results, with overview and answer filters reset for each opened result. Answer review retains its existing filters and question content.
- Overview initially shows four priority weak skills with expand/collapse. Skill analysis groups assessed skills into collapsed domain sections. Tabs support arrow/Home/End keyboard navigation and linked tab panels; inactive panels are unmounted.
- Validation: frontend production build and lint exited 0 with existing warnings; whitespace check passed. Browser appearance/live API behavior have not been directly verified. Backend unchanged; no staging, commit, push or merge completion.

### [14/11/2026] - Compact categorized history

- Moved diagnostic/practice/mock selectors into a compact top toolbar, alongside the history title on desktop and below it on mobile. Kept separate category render branches and keyed content by account/category so selected details cannot carry across categories. Practice remains browser-local; mock history remains explicitly unavailable.
- Removed the repeated dark report banner in historical result details using a compact summary variant. Reduced history statistic sizes and embedded horizontal padding, preserving the report tabs and data.
- Validation: frontend build and lint exited 0 with existing warnings; whitespace checks passed. No direct browser verification. Backend unchanged; no staging, commit, push or merge operations.

### [14/11/2026] - Focused history detail view

- Hide the history title/category toolbar while a diagnostic or practice result is open; restore it when returning to the list. DiagnosticAssessmentPage reports its selected-detail state to StudentHistoryPage. Hide the diagnostic entry shortcut in detail view and preserve an accessible region label when category tabs are absent.
- Validation: frontend build and lint exited 0 with existing warnings; whitespace check passed. Browser interaction not directly verified. Backend and pending merge unchanged; no staging, commit or push.

### [14/11/2026] - History report visual polish

- Refined the compact report summary into three responsive tinted metric cards with colored icon badges, clearer typography and a subtle score progress accent. Updated report tabs to a light segmented control with an elevated active state, and softened the detail header with an indigo tint. Existing compact layout and hidden category toolbar behavior remain intact.
- Validation: production build and lint exited 0 with existing warnings; whitespace check passed. Browser visual verification pending. No backend changes or staging/commit/push/merge operations.

### [14/11/2026] - Stronger report contrast

- Responded to screenshot feedback: historical detail heading now uses a dark navy/indigo background with white title and back control. The selected report tab uses a saturated blue/indigo fill with white text/icons. Metric cards have stronger tints, colored top borders and darker labels.
- Validation: frontend build/lint exited 0 with existing warnings; whitespace checks passed. The revised UI has not been visually verified in a browser. Backend unchanged; no Git staging, commit, push or merge operations.

## [15/11/2026] - CF1 frontend checkpoint

- Checkpoint the implemented CF1 diagnostic result/history UI: report tabs, skill accuracy and available mastery estimates, compact category navigation and focused detail view. Include the authentication/account toast feedback implemented in the same work session.
- Backend follow-up remains: persist per-submission skill priors/source, populate historical SkillPriors and RadarChart, verify complete historical question content and domain labels, and finalize the three-exam aggregation rule. This is a frontend milestone, not full backend/runtime acceptance.
- Validation on the current frontend working tree: production build and lint exited 0 with existing warnings; all 24 existing Node tests passed. Browser/live API flow not verified. Unrelated curriculum, sidebar and roadmap edits remain outside this checkpoint; backend and root pending merge are untouched by Git operations.

## [15/11/2026] - Remaining frontend presentation checkpoint

- Checkpoint the remaining user-authorized frontend changes in StudentCurriculumView, Sidebar and RoadmapLearningPage: curriculum chapter/lesson styling, colored student navigation icons and roadmap presentation refinements. Preserve the earlier CF1 checkpoint.
- Validation: frontend production build and lint exited 0 with existing warnings; whitespace check passed. All 24 existing tests passed on this same source tree during the preceding checkpoint. Browser appearance and live API behavior remain unverified. No backend changes, push or root merge completion.

### [13/11/2026] - Diagnostic Submission Route Alignment & Multi-Layer ZPD Question Extraction

- **Diagnostic Submission Route Correction (`src/services/practiceService.js`)**:
  - Removed erroneous `/v1/` route prefixes in `getDiagnosticHistory` and `getDiagnosticResult`, standardizing endpoints to `/api/practice/diagnostic-submissions/student/{id}` and `/api/practice/diagnostic-submissions/{id}` to strictly align with `DiagnosticSubmissionsController` in `Practice Service`.
  - Resolves HTTP 404 `"Not Found"` errors on both the diagnostic history view and the new exam initialization flow.
- **Passage-Inclusive ZPD Quiz Extraction (`src/components/modals/AdaptiveQuizModal.jsx`)**:
  - Expanded question extraction logic to parse both `single_questions` and `passages[].questions` from Content Service exam payloads, preventing empty item sets when exams store questions within reading passages.
- **Verification**: All 28 test cases passed; lint completed with zero errors; production build succeeded.

### [13/11/2026] - Post-Exam Dual Roadmap Architecture (General vs. Personalized) & Tuition Paywall Enforcement

- **Dual-Mode Roadmap Segmentation (`StudentCurriculumView.jsx`, `curriculumAccess.js`)**:
  - Structured the student curriculum experience into two explicit learning modes:
    1. *General Cohort Curriculum (`general`)*: Full national standard GDPT 2018 & V-ACT 2026 domain-based knowledge graph (Chapters -> Lessons -> Patterns).
    2. *Personalized Adaptive Roadmap (`personalized`)*: Algorithmic clustering of patterns into 3 adaptive stages based on IRT Theta and diagnostic domain scores (`buildPersonalizedStages`):
       - *Stage 1 (ZPD Priority)*: Urgent gap recovery and prerequisite skills (`+75 - +110` points potential).
       - *Stage 2 (Application & Logic)*: Core cognitive consolidation (`+50 - +70` points potential).
       - *Stage 3 (Speed & Mastery)*: Timed test execution and speed optimization (`+35 - +50` points potential).
- **Post-Assessment Overview Mode & Tuition Paywall Enforcement**:
  - Implemented business constraint: post-assessment students have read-only access to the high-level roadmap structure (overview mode).
  - Unpaid students (`!isPaid`) are blocked from accessing full lesson readers, proprietary video lectures, detailed step-by-step methods, and adaptive quizzes.
  - Intercepting unauthorized study attempts triggers `TuitionRequiredModal`, directing users to the PayOS VietQR payment flow with an option to preview high-level pattern metadata.
- **Payment Lifecycle & Cross-Component Synchronization (`TuitionPaymentView.jsx`, `DiagnosticAssessmentPage.jsx`, `App.jsx`)**:
  - Integrated local tuition status persistence (`veval_tuition_paid_${studentId}`) and custom event dispatching (`veval:tuition-paid`).
  - Added post-diagnostic roadmap navigation banners and action buttons linking directly to roadmap overview and tuition checkout.
- **Verification**: Added `tests/curriculumAccess.test.js`; all 31 test cases passed; lint completed with zero errors; production build succeeded in 1.15s.

### [13/11/2026] - Resilient Diagnostic History Hydration & Graceful Fallback Architecture

- **Fault-Tolerant History Trend Hydration (`src/components/diagnostic/DiagnosticAssessmentPage.jsx`)**:
  - Refactored `Promise.all` detail resolution to wrap individual `practiceService.getDiagnosticResult` calls in isolated `try/catch` handlers.
  - When individual legacy submissions cannot fetch detailed question keys from upstream microservices, the client seamlessly falls back to summary metrics (`theta0`, `totalScore`, `totalCorrect`, `totalQuestions`, `placementClass`, `totalTimeSpentSeconds`).
  - Eliminates frontend crashes caused by missing or unmigrated legacy exam content, ensuring consistent display of historical assessment trends.
- **Verification**: All 31 automated test cases passed; lint verified with zero errors; production build verified.

### [13/11/2026] - Student Dashboard UX Simplification & Mock Milestone Removal

- **Removal of Legacy Mock Widgets (`src/App.jsx`)**:
  - Deprecated and removed `<MilestoneCard>` and `<LiveQnACard>` from the default student dashboard layout, eliminating hardcoded mock chapters and dummy Q&A schedules.
  - Prevents UX divergence and data conflict with the verified `StudentCurriculumView` micro-learning modules.
- **Human-Centric Dashboard KPI Architecture (`HeroBanner.jsx`, `MetricsGrid.jsx`)**:
  - Replaced internal engineering acronyms (`ZPD`, `DAG`, `IRT 2PL`, `Core Flow 5`) with transparent, student-accessible terminology.
  - Re-anchored primary CTA buttons directly to verified learning flows: *Curriculum Roadmap*, *Diagnostic Assessment*, and *AI Tutor*.
- **Verification**: All 31 automated test cases passed; bundle footprint reduced cleanly; production build verified in 1.17s.

### [13/11/2026] - Dashboard Visual Hierarchy Optimization & Student Portrait Refinement

- **Golden Ratio Dashboard Restructuring (`src/App.jsx`)**:
  - Re-anchored `HeroBanner` as the primary greeting header at the apex of the viewport, eliminating visual clutter from pre-banner alerts.
  - Positioned `MetricsGrid` as the central performance belt, providing immediate horizontal scanability across the 4 key learning KPIs.
  - Anchored the dual action zone (`DiagnosticOnboardingCard` 70% + `StudentParentLinkCard` 30%) at the base of the page, establishing an intuitive progression: Welcome -> Performance Snapshot -> Next Steps.
- **Authentic Student Visual Asset Refresh (`src/components/dashboard/HeroBanner.jsx`)**:
  - Replaced legacy badge asset with high-resolution authentic Vietnamese student photography (`vietnamese_student_real.jpg`) in a glassmorphic frame (`bg-white/10 backdrop-blur-md border-white/20`).
- **Verification**: 31/31 unit tests passed; bundle verification passed in 1.05s.


### [15/11/2026] - Core Flow 4: Socratic AI Tutor Moderation & Dual-Layer Knowledge Graph Feedback Architecture for Academic Management

- **Human-in-the-Loop Socratic Moderation Dashboard (`src/components/dashboard/AiTutorModerationView.jsx`)**:
  - Engineered an enterprise-grade moderation interface for **Academic Managers (`ACADEMIC_MANAGER`)** and **Academic Directors (`ACADEMIC_DIRECTOR`)** to inspect, validate, and remediate student-reported Socratic AI Tutor interactions.
  - Aligned with Core Flow 4 (`core4_activity.mmd` and `core_flow_4_ai_tutor_graph_rag.md`) to establish an active feedback loop between student learning friction and the persistent GraphRAG Knowledge Graph.
  - Real-time KPI aggregation tracks 4 critical pedagogical metrics: *Pending Reports*, *Resolved & KG Ingested*, *Total Flagged Interactions*, and *Monitored Dialogues*.
- **Interaction Inspector & Ground-Truth Verification Workflow**:
  - Implemented split-view layout featuring a searchable/filterable queue on the left and a comprehensive diagnostic inspector on the right.
  - Seamless KaTeX formula rendering via `MathText` for question stems and options.
  - Visual ground-truth discrepancy analysis: highlights student choice (Red - cognitive error) directly against official database answer (Green - correct).
  - Chronological Socratic dialogue reconstruction visualizing each conversational turn (`student` vs `ai_tutor`).
- **Tri-Modal Pedagogical Knowledge Graph Intervention Actions**:
  - **Action 1: Override Golden Exemplar (`PatternExemplar`)**: Allows academic managers to author verified expert explanations and step-by-step Socratic reasoning chains, saved directly to `pattern_exemplars` in the Knowledge Graph for dynamic few-shot retrieval.
  - **Action 2: Add Novel Cognitive Trap (`PatternTrap`)**: Captures newly discovered misconceptions with custom trap codes, misconception analysis, and targeted reflective guiding questions, persisting into `pattern_traps`.
  - **Action 3: Verify & Dismiss**: Closes false-positive reports when the Socratic AI's guidance adhered strictly to pedagogical guidelines and the student experienced misconception resistance.
- **Client Service Layer & Navigation Integration (`practiceService.js`, `Sidebar.jsx`, `App.jsx`, `roles.js`)**:
  - Added dedicated API client methods: `overrideTutorExemplar`, `addTutorNovelTrap`, and `resolveTutorReport` with graceful local storage fallback.
  - Integrated `ai_moderation` into the Academic Management portal navigation with the `Bot` icon and `Core Flow 4` indicator.
- **Verification**: Production build succeeded with zero errors (`1.29s`); all 31 automated test cases passed; zero linter errors.

### [15/11/2026] - Academic Portal Layout Redesign & Student Design System Harmonization

- **Visual Architecture & Design Harmonization (`AiTutorModerationView.jsx`, `CampusManagerDashboardView.jsx`, `Sidebar.jsx`)**:
  - Overhauled the Academic Management UI to align completely with the verified Student Portal visual design system (`#FDFBF7` ambient glow palette).
  - Replaced the dark, heavy slate header banners with the flagship royal blue-indigo gradient (`from-blue-700 via-indigo-700 to-blue-900`) complemented by radiant gold (`#FACC15`) and cyan (`cyan-400`) ambient blur orbs.
  - Introduced the glassmorphic **GraphRAG Monitor Card** (`bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl`) tracking real-time Socratic fidelity (97.6%), active Knowledge Graph nodes (142 Exemplars, 68 Traps), and operational health.
- **Symmetrical 4-Card KPI Grid Architecture (`MetricsGrid` Pattern)**:
  - Re-architected all stat containers into high-contrast, interactive metric cards featuring uppercase micro-tags, semantic status chips (`Cần can thiệp`, `Đã lưu Graph`, `Gắn cờ AI`, `Supabase Pooler`), and a bottom action bar with dividers enabling instant 1-click list filtering.
- **Interactive Queue & Inspection Workspace Refinement**:
  - Integrated student avatar initials badges, dynamic status-colored left border accents (Rose for pending, Emerald for resolved, Slate for baseline), and KaTeX-rendered formula previews.
  - Streamlined sidebar badge to `Flow 4`, completely resolving label truncation in narrow sidebar viewports.
- **Database Seed Alignment & Verification**:
  - Seeded 3 representative interaction logs in PostgreSQL Supabase (`v_eval_ai.ai_tutor_interaction_logs`) to ensure real-time queue hydration on initial mount.
  - All 31 automated tests passed; Vite production build verified in 1.09s with zero linter errors.

### [15/11/2026] - Campus Manager Flagship Dashboard Overhaul & Percentage Scaling Normalization

- **Defensive Percentage Scaling Architecture (`normalizeMasteryPct`)**:
  - Identified and resolved a critical decimal-scaling regression where backend pre-multiplied percentages (`76.0`, `52.5`, `68.0`, `71.0`) were multiplied by 100 on the client, resulting in anomalous values (`7600%` and `6688% BKT`).
  - Implemented `normalizeMasteryPct(val)` to dynamically detect input scale (treating `val > 1` as percentage and `val <= 1` as decimal fraction), guaranteeing 0-100% integer clamping across all four domains (`76%`, `53%`, `68%`, `71%`) and whole-campus mastery (`67% BKT`).
- **Greeting & Hero Banner Integration (`CampusManagerDashboardView.jsx`, `App.jsx`)**:
  - Eliminated the isolated raw `h1` greeting header above the viewport container, integrating official managerial greetings directly into the flagship royal blue-indigo `HeroBanner`.
  - Added dynamic pedagogical message rotation (`Sparkles`) powered by Framer Motion, gold status chips (`#FACC15`), and a glassmorphic right-hand Campus Allocation Monitor card.
- **Enterprise Comparative Heatmap Table & Micro-Group Orchestration**:
  - Modernized the Flow 5 class comparison table with progress bars, dual-metric domain badges (`% Làm chủ` & `% Học sinh yếu`), and enhanced action triggers for micro-group seating arrangements (`ClassMicroGroupsModal`).
  - Refined teaching faculty list with initials avatar badges, accurate status badges (Green for `Active`, Rose for `Locked`), and IAM policy notices.
- **Early Warning Hub Visual Polish (`EarlyWarningsMentorPanel.jsx`)**:
  - Re-architected the 6 BR-04 early-warning tier cards with modern card-shadows, responsive grid symmetry, and intuitive action buttons for tripartite parent-student counseling.
- **Verification**: Production build verified in 1.10s; 31/31 unit tests pass; zero lint errors.

### [15/11/2026] - Socratic AI Tutor Multi-Turn Session Persistence & Interactive History Navigation Architecture

- **Hybrid Progressive Session Management Architecture (`src/utils/aiSessionManager.js`, `tests/aiSessionManager.test.js`)**:
  - Architected an offline-first, client-synchronized session manager isolating conversation threads per authenticated student (`veval_socratic_sessions_${userId}`).
  - **Zero-Latency Persistence**: Intercepts SSE streaming tokens in real time, automatically flushing user questions, Socratic guiding hints, LaTeX formulas, and student misconception choices into local storage. Ensures students can close the modal, reload the browser, or switch questions without losing their line of reasoning.
  - **Background Cloud Synchronization (`practiceService.getAiTutorInteractions`)**: Seamlessly polls historical Socratic interactions from PostgreSQL Supabase (`v_eval_ai.ai_tutor_interaction_logs`) in the background, executing deduplicated hydration (`mergeCloudInteractions`) so historical interactions appear alongside local threads without overwriting in-flight discussions.
  - **Automated Test Coverage (36/36 Tests Pass)**: Developed comprehensive unit tests in `tests/aiSessionManager.test.js` validating title generation, multi-user storage key isolation, message thread extension, cloud interaction ingestion, and session deletion.
- **Two-Column Socratic Workspace & History Drawer (`src/components/modals/AISocraticTutorModal.jsx`)**:
  - **Collapsible History Drawer**: Integrated a sliding left sidebar (`w-72 sm:w-80`) with one-click toggle (`PanelLeftClose`/`PanelLeftOpen`), session count badge, and a high-contrast `+ Bắt đầu phiên hỏi mới` action trigger.
  - **Intelligent Thread Indexing**: Provides instant keyword search across questions and skills, active session highlight (blue border + shadow), message count pills (`n tin`), timestamp badges (`Hôm nay`, `Hôm qua`, formatted dates), cloud synchronization indicator (`Cloud` icon), and hover delete actions (`Trash2`).
  - **Dynamic Multi-Mode Context Transition**: When launched from an incorrect exam question review (`initialContext`), the system automatically discovers if a session already exists for that `questionId` to resume the thread, or initializes a new Socratic greeting targeted precisely at the student's selected wrong option.
  - **Responsive Layout Geometry**: Automatically expands modal viewport to `max-w-5xl h-[90vh]` when the history drawer is opened for a comfortable desktop workspace, and collapses gracefully to `max-w-3xl` when closed.
  - **Strict React Hooks Invariant Enforcement**: Eliminated conditional hook dispatch by promoting `filteredSessions` memoization above all control flow returns and positioning `if (!isOpen) return null` strictly before JSX evaluation, permanently preventing *"Rendered more hooks than during previous render"* exceptions.
- **Verification**: Production build verified in 1.10s; 36/36 unit test cases passed with 100% success rate; zero linter errors.

### [15/11/2026] - Diagnostic History Question Content Hydration & Presentation Normalization Architecture

- **Historical Question Content Hydration (`src/components/diagnostic/DiagnosticAssessmentPage.jsx`)**:
  - Addressed a critical data starvation flaw where historical submissions retrieved from Practice Service (`practiceService.getDiagnosticResult`) previously only carried submission metadata and telemetry without question content, options, or explanations.
  - Upgraded `DiagnosticAssessmentPage.jsx` to directly consume the enriched DTO returned by Practice Service's gRPC pipeline with Content Service (`q.content`, `q.options`, `q.explanation`, `q.passageContent`, `q.passageTitle`), with graceful client hydration fallback through `contentService.getDiagnosticTest()`.
  - Guarantees zero blank content: each reviewed question inherits full Markdown/LaTeX question stems, responsive 4-option grids (A/B/C/D), reading comprehension passages, Bloom taxonomy tags, and pedagogical explanations.
- **Ordinal Indexing & Taxonomy Normalization**:
  - Eliminated anomalous *"Câu 0:"* headers caused by zero/null `questionOrder` values from legacy records, establishing strict fallback indexing `idx + 1` (mapping cleanly to Questions 1 through 30).
  - Resolved *"Bloom 0/6"* display regressions by normalizing difficulty taxonomy (`difficultyLevel || matched?.bloom || 2`).
- **Verification**: Vite production build succeeded in 1.08s; 36/36 unit test cases passed with 100% success rate; zero linter errors.

### [15/11/2026] - Comprehensive Vietnamese Diacritic Normalization & Dual Review Render Loop Synchronization Architecture

- **Vietnamese Diacritic Normalization Engine (`src/utils/vietnameseUtils.js`, `tests/vietnameseDiacritics.test.js`)**:
  - Implemented `cleanVietnameseDiacritics` to resolve OCR / PDF encoding artifacts characterized by detached or decomposed floating diacritics (`´` `\u00B4`, ``` ` ``` `\u0060`, `\u0301`, `\u0300`, `\u0309`, `\u0303`, `\u0323`).
  - Automatically merges floating tone marks into precomposed Vietnamese characters (e.g. `số´ng` -> `sống`, `đế´n` -> `đến`, `nhiê`u` -> `nhiều`, `quố´c biê´n` -> `quốc biến`, `thơ â´u` -> `thơ ấu`, `mẹ hiê`n` -> `mẹ hiền`, `nê` nê´p` -> `nề nếp`), eliminating visual character glitches across all browser platforms.
  - Carefully engineered regex tokenizers preserve LaTeX mathematical notation (`\frac`, `\text`, `^`, `$`), ensuring chemistry equations and mathematics symbols are entirely unaffected.
  - Completely purged `font-serif` across all reading passage containers to prevent font fallback and glyph rendering bugs on Windows Chromium, migrating to standard modern `font-sans` (`Plus Jakarta Sans`).
- **Dual Review Render Loop Synchronization (`DiagnosticAssessmentPage.jsx`)**:
  - Identified and synchronized two independent question review render loops: (1) In-place post-submission review panel (`DiagnosticReportPanel id="review"`), and (2) History review modal dialog (`selectedHistoryExam`).
  - Modernized the in-place report view to match the modal dialog: replaced legacy `line-clamp-3` truncated containers with modern `p-4 sm:p-5 rounded-2xl` reading passage cards featuring `max-h-72 overflow-y-auto whitespace-pre-line`, `BookOpen` icon, and a `Bài đọc ngữ cảnh` badge.
  - Standardized options grid styling with semantic ring boundaries (`ring-1 ring-emerald-500/30` for correct options, `ring-1 ring-rose-500/30` for incorrect student choices) alongside crisp `Check` and `X` indicators and soft purple explanation cards (`bg-purple-50/70 border-purple-200`).
- **Verification**: Production build verified in 1.08s; 38/38 unit tests pass (100% success rate); zero linter errors.

### [16/11/2026] - Socratic AI Tutor Stream Decoupling & Double-Token Prevention Architecture

- **Root Cause Identification & Stream Decoupling (`src/components/modals/AISocraticTutorModal.jsx`, `src/components/dashboard/AISocraticTutorWidget.jsx`)**:
  - Uncovered a concurrency vulnerability under React 19 / Vite development mode: React StrictMode executes functional state updaters (`setSessions(prev => ...)`) twice in succession to detect side-effects.
  - The previous implementation mutated the active session's message object in-place (`last.text = (last.text || '') + token`), which caused every arriving token to be concatenated twice upon each update cycle, resulting in duplicate tokens across entire sentences (`"Chào Chào em! em! Chà, Chà..."`).
  - Decoupled token accumulation using a mutable ref anchor (`streamedTextRef.current += token`), passing the authoritative text directly into immutable state transitions (`prev.map(...)`). State updaters remain completely pure and invariant against StrictMode's dual invocation.
  - Eliminated high-frequency synchronous disk I/O bottlenecks: removed `aiSessionManager.saveSessions(...)` from the per-token loop (which previously invoked ~200+ synchronous `localStorage.setItem` calls per response), persisting session state strictly upon stream completion (`onComplete`) or error handling (`onError`).
- **Historical Session Data Self-Healing Engine (`src/utils/aiSessionManager.js`, `tests/aiSessionManager.test.js`)**:
  - Implemented `cleanDoubledWords` to detect and heal previously saved sessions in client storage corrupted by token doubling, while safely preserving genuine Vietnamese reduplicated vocabulary (`"thong thả"`, `"chầm chậm"`).
- **Verification**: Vite production build succeeded in 1.52s; 39/39 unit test cases passed with 100% success rate; zero linter errors.

### [16/11/2026] - Client-Side Session Isolation, Stale Closure Elimination & Tombstones Deletion Architecture

- **Architectural Boundary Separation (Audit Log vs. User Chat Sessions)**:
  - Disentangled the architectural conflation between the system's **immutable audit log** (`v_eval_ai.ai_tutor_interaction_logs` serving Core Flow 4 Mentor Audit & Moderation) and student **user chat sessions**.
  - Identified that hard-deleting records from `ai_tutor_interaction_logs` violates data governance and compliance principles by stripping audit trails needed by academic mentors to investigate hallucinations and pedagogical errors.
  - Decoupled the student chat modal from the mentor audit endpoint (`GET /api/practice/ai-tutor/interactions`). Students now manage their own personal chat sessions with zero leakage from or dependencies on system-wide audit queries.
- **Atomic Functional State Transitions & Closure Bug Fix (`AISocraticTutorModal.jsx`)**:
  - Resolved a stale closure defect in `handleDeleteSession` and `handleCreateNewSession` where deleting the active or last session previously captured outdated `sessions` array references in scope, causing deleted items to be accidentally reintroduced into component state.
  - Converted session lifecycle operations to atomic functional state updaters (`setSessions(prev => ...)`). When deleting an active session, the remaining array is evaluated synchronously, and when all sessions are cleared, a pristine initial session (`[freshSess]`) is initialized without retaining stale references.
- **Tombstones Persistence Engine (`aiSessionManager.js`, `tests/aiSessionManager.test.js`)**:
  - Implemented client-side tombstones (`veval_deleted_socratic_sessions_${userId}`) via `markSessionDeleted`, `getDeletedSessionIds`, and `isSessionDeleted`.
  - When a student deletes a session, its ID, corresponding question identifier (`q_${questionId}`), and interaction logs are recorded in the tombstone registry.
  - Any subsequent synchronization or merge operation strictly filters against this registry, permanently preventing resurrection of deleted sessions.
- **Verification**: Vite production build succeeded in 1.08s; 22/22 unit tests pass (100% success rate); zero linter errors.


### [16/11/2026] - Socratic AI Tutor Multi-Turn Conversation History Forwarding Architecture

- **Client Multi-Turn History Forwarding (`src/components/modals/AISocraticTutorModal.jsx`, `src/services/practiceService.js`)**:
  - Enhanced `practiceService.askAiTutorStream` to accept `conversationHistory = null` and serialize it into the streaming request payload.
  - In `handleSendMessage`, mapped the last 6 message turns (`messages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'student' : 'tutor', text: m.text }))`) and forwarded them as conversation history.
  - Guarantees seamless multi-turn context retention: subsequent follow-up queries (e.g. asking for an illustrative example or method clarification) maintain the specific question, figure, and pedagogical direction already established in prior conversation turns.
- **Verification**:
  - Vite production build succeeded in 1.15s with 0 errors.
  - `node --test` passed 22/22 unit tests with 100% success rate.

### [16/11/2026] - Socratic AI Tutor Skill & Question Relational Grounding Propagation Architecture

- **Skill ID & Question Relational Forwarding (`src/components/modals/AISocraticTutorModal.jsx`, `src/components/modals/AdaptiveQuizModal.jsx`)**:
  - Attached `skillId: initialContext.skillId || initialContext.skill_id || null` into the active session schema upon opening the modal from quiz review or practice sessions.
  - In `handleSendMessage`, forwarded `skillId: isQuestionMode ? (activeSession.skillId || null) : null` into `practiceService.askAiTutorStream`.
  - In `AdaptiveQuizModal.jsx`, mapped `skillId: q.skill_id || q.skillId || null` and provided it in `onOpenAiTutorWithContext`.
  - Enables the backend AI Engine to immediately link questions to textbook curriculum materials (`v_eval_content."Materials"`) using relational foreign key joins, achieving zero-hardcode pedagogical grounding.
- **Verification**:
  - Vite production build succeeded in 1.06s with 0 errors.
  - `node --test` passed 22/22 unit tests with 100% success rate.

### [17/11/2026] - Parent Companion Portal UI Simplification & Navigation Guardrail Architecture

- **Domain Perimeter Separation for Guardian / Parent Persona (`src/components/layout/Sidebar.jsx`, `src/App.jsx`)**:
  - Re-evaluated user journey for **Parent Companion Portal (`role === 'parent'`)**: parents track holistic readiness (`R_exam`), weekly commitment (12h/week), exam history and tuition status, rather than deep pedagogical curriculum graphs or 4-domain radar charts meant for student practice.
  - Removed two student-centric sidebar items from `Sidebar.jsx`:
    - `analytics`: *Báo cáo Năng lực 4 Miền* (Score prediction & progress charts).
    - `roadmap`: *Cây Tri thức & Chuyên đề* (Curriculum DAG graph & topic quizzes).
  - Streamlined `ROLE_PORTAL_DEFINITIONS.parent.tabs` down to:
    1. `dashboard`: *Tổng quan Đồng hành* (`HeartHandshake`).
    2. `history`: *Lịch sử Bài thi của Con* (`History`).
    3. `tuition`: *Đóng Học phí PayOS* (`CreditCard`).
- **Defensive Navigation Guardrails (`src/App.jsx`)**:
  - Added guards `activeTab === 'roadmap' && role !== 'parent'` and `activeTab === 'analytics' && role !== 'parent'` inside `renderRolePortalContent`. Any accidental or direct navigation falls back securely to `ParentDashboardView`.
  - Disconnected student roadmap/quiz callbacks in `TuitionPaymentView` when viewed by a parent.
- **Verification**:
  - Vite production build succeeded in 1.68s with 0 errors.
  - All 22/22 unit tests in `tests/*.test.js` passed with 100% success rate.

### [18/11/2026] - Parent Submission History Student Context & Dynamic Multi-Child Switching

- **Parent-to-Student Context Binding (`src/App.jsx`, `src/components/diagnostic/SubmissionHistoryView.jsx`)**:
  - Bound `studentId={role === 'parent' ? defaultChild?.studentId : currentUser?.id}` and forwarded `childrenList={parentPortalData?.children || []}` into `SubmissionHistoryView`.
  - Resolved the critical context mismatch where parent account ID was previously querying child diagnostic submission history, resulting in empty or errored submissions.
- **Dynamic Multi-Child Switcher & Reactive Reloading**:
  - Implemented an interactive child selector chip bar in `SubmissionHistoryView` header banner when `internalChildren.length > 1`.
  - Switching active child updates `activeChildId`, seamlessly re-querying `practiceService.getStudentDiagnosticHistory(targetId)` and local history `practiceService.getSubmissionHistory(targetId)` for the selected child.
- **Parent Persona Customization**:
  - Tailored the view for parents: updated banner title to `"Lịch Sử Bài Thi Của Con: [Tên con]"`, replaced the student diagnostic action button with an on-demand `"Làm mới danh sách"` button, and updated option selection indicators to `"Con đã chọn"` / `"Con chọn đúng"`.
- **Scoped Storage & Safe Deletion (`src/services/practiceService.js`)**:
  - Extended `practiceService.getSubmissionHistory(targetStudentId = null)` and `deleteSubmissionFromHistory(submissionId, targetStudentId = null)` to respect the child's identity without clearing other accounts' cached submissions.
- **Verification**:
  - Unit tests: 22/22 passed (`node --test tests/*.test.js`).
  - Production build: `npm run build` succeeded cleanly in 1.70s with 0 errors.
### [14/11/2026] - Early MathLab Block Shielding, Bold Heading Repair & Zero-Hardcode Extraction Cards

- **Early Placeholder Isolation & Bold Heading Normalization (`src/components/common/MathText.jsx`)**:
  - Added pre-repair for corrupted MathLab tags (`[\s*\$?(\/?)\s*\$?(MATH_GRAPH_3D|MATH_GRAPH|VARIATION_TABLE|MATH_GEOMETRY_2D)\$?\s*]` -> `[$1$2]`) and extracted all `[MATH_GRAPH_3D]`, `[MATH_GRAPH]`, `[VARIATION_TABLE]`, `[MATH_GEOMETRY_2D]`, and `[GRAPH:...]` blocks at the very start of `normalizeMathString(text)` using lowercase-only placeholders (`@@mathlabblocka@@`).
  - Prevents early regex passes (`fullEqRegex`, colon-newline collapsing, chemical formula wrappers) from mutating coordinates, dimensions (`h=4,w=4`), or auxiliary lines (`A-C`, `S-O`) inside 3D/2D geometry specifications.
  - Fixed nested bold corruption on `**Phân tích & Lời giải:**` by anchoring orphaned trailing `:**` repair to line/bullet starts.
- **Subject-Agnostic Extraction Depth Cards (`src/components/curriculum/CurriculumExplorerView.jsx`)**:
  - Replaced raw `$\rightarrow$` strings with clean Unicode arrows (`→`) and removed all hardcoded Ester-Lipid references from both `EXAM_PATTERNS` and `THEORY_EXTENDED` comparison cards.
- **Verification**: Vite production build succeeded in 1.41s with zero compilation errors.

### [15/11/2026] - Dedicated Student Timetable Page (`StudentScheduleView` - `schedule`), Separated Live Q&A Workspace (`LiveClassQnAView` - `live`), Zero-Mock Enforcement, and Historical `radarChart` + `skillPriors` Parity

- **Dedicated Separation Between Timetable (`schedule`) and Live Classroom (`live`) (`src/components/dashboard/StudentScheduleView.jsx`, `src/components/dashboard/LiveClassQnAView.jsx`, `src/components/layout/Sidebar.jsx`, `src/App.jsx`, `src/services/practiceService.js`)**:
  - Separated the Student Timetable into its own first-class navigation item (`id: 'schedule'`, `"Thời khóa biểu & Điểm danh"`) under *Không Gian Học Viên*, distinct from `"Lớp học & Live Q&A"` (`id: 'live'`) under *Luyện Tập & Gia Sư AI*.
  - `StudentScheduleView.jsx` (`activeTab === 'schedule'`) exclusively handles academic terms (`/api/practice/academic-terms`), courses (`/api/practice/courses`), weekly schedule slots (`ClassSchedules`), dated sessions (`ClassSessions`) with substitute/makeup tracking, and attendance records (`SessionAttendances`).
  - `LiveClassQnAView.jsx` (`activeTab === 'live'`) provides a dedicated Live Q&A and micro-group workspace connected to `LiveQnACard`, enrolled class rosters, and active faculty listings from `userService`.
  - Removed all mock data, seed fallbacks, and hardcoded UI numbers/strings across `practiceService.js`, `StudentScheduleView.jsx`, `DiagnosticAssessmentPage.jsx`, and `SubmissionHistoryView.jsx`.
- **Full `radarChart` & `skillPriors` Parity Across Post-Exam and Historical Submission Review (`src/components/diagnostic/DiagnosticAssessmentPage.jsx`, `src/components/diagnostic/SubmissionHistoryView.jsx`)**:
  - Added pure API-backed `normalizeRadarChart` and `normalizeSkillPriors` normalizers across `executeSubmitExam`, `openHistoryExam`, and `SubmissionHistoryView`, rendering both the **Competency Radar Chart (`radarChart`)** and the **Bayesian Knowledge Tracing Skill Priors Matrix `` `P(L_0)` `` & `` `\theta_{\text{skill}}` `` (`skillPriors`)** when completing an assessment and when reviewing historical submissions.
- **Verification**: 17/17 unit tests passed (`node --test`); production bundle verified (`vite build` succeeded in 4.39s with 0 errors).

### [15/11/2026] - Server-Backed Tuition Synchronization, Active Course Entitlement Panel, 6 Unlocked Subsystem Perimeters & Electronic Invoice Audit Modal

- **Database-Driven Tuition Entitlement & Auto-Unlocking (`src/components/curriculum/curriculumAccess.js`, `src/components/curriculum/StudentCurriculumView.jsx`, `src/services/paymentService.js`)**:
  - Replaced isolated `localStorage` tuition gating with server-backed `syncTuitionStatusFromServer(studentId)`, consuming `/api/practice/payments/status-by-student/{studentId}` via API Gateway.
  - Automatically dispatches `veval:tuition-paid` upon confirmed backend payment or active registration, preventing spurious `TuitionRequiredModal` popups for students who have completed payment.
- **Tuition & Invoice Dashboard Architecture (`src/components/payment/TuitionPaymentView.jsx`, `src/App.jsx`)**:
  - **Active Course Banner**: Displays real-time enrolled course (`courseName`, `courseCode`, `planType`), validity dates (`startDate` -> `endDate`), and auto-assigned cohort (`assignedClassName`).
  - **6 Unlocked Subsystem Perimeters**: Provides one-click jump routes to PLAR Personalized Roadmap, Exclusive Theory Lessons & Videos, ZPD Adaptive Quiz, 24/7 Socratic AI Tutor, Student Timetable & Attendance, and Live Classroom Micro-groups.
  - **Real Database Invoice Table**: Renders official PayOS transaction records directly from PostgreSQL (`orderCode`, `amount`, `paidAt`, `counterAccountBankName`, `transactionRef`, `status`).
  - **Electronic Invoice Audit Modal**: Enables on-demand modal inspection of transaction metadata, bank reference codes, HMAC-SHA512 cryptographic verification, and browser print (`window.print()`).
- **Verification**: 31/31 unit tests passed (`node --test`); Vite production build verified in 1.09s with 0 errors.




## 12. Feature Sync Acceptance ? 16 November 2026

The TNhan branch now includes the pulled student curriculum and math rendering updates, database-backed tuition/payment interface, diagnostic result and history presentation, and student classroom/schedule/attendance views. Existing TNhan-specific changes were retained. The practice service GUID matcher referenced by the synced helpers is defined locally. The potentially sensitive `.env.bak` file was excluded. No build or live API verification was performed as part of this sync, so runtime acceptance remains pending.


The diagnostic report JSX parse failure from an incomplete duplicate trend-chart wrapper was corrected. A Vite production build succeeds; the build still reports a large-chunk advisory and a dependency direct-eval warning.


Radar and skill-prior displays consume API response fields; the benchmark overlay and prior values are omitted when absent instead of being filled with synthetic defaults. The result page now uses normalized API-derived prior data without unresolved component/helper references.


## [16/11/2026] - Homepage Introduction and Metrics Consolidation

- Removed the homepage navigation entry for the standalone 120-question specification and the 3 Q&A specification action.
- Grouped the four platform metric cards under the Introduction anchor while preserving their position below the hero content; updated footer links to the new metrics anchor.
- Verified the frontend production build with `npm run build`. Existing large-bundle and JSXGraph eval advisories remain.


## [17/11/2026] - Homepage Introduction Navigation

- Kept the four metric cards directly below hero content and grouped them semantically under the Introduction navigation anchor.
- Removed the standalone 120-question navigation entry and 3 Q&A specification action; footer links target the metric strip.
- Verified the production build with npm run build; existing bundle-size and JSXGraph eval advisories remain.


## [17/11/2026] - Develop Merge Acceptance

- Integrated upstream Socratic multi-turn session management, tombstone-based deletion, Vietnamese text normalization, AI tutor moderation, mentor dashboard changes, and diagnostic history updates.
- Preserved the local homepage Introduction grouping and navigation cleanup.
- Verified `npm run build` successfully. Existing large-bundle and JSXGraph eval advisories remain. Automated tests were not run in this merge check.

## [18/11/2026] - Authentication completion and landing page presentation

The authentication completion handler now closes the OTP modal, switches the underlying page to login, and pre-populates the account email. Password reset completion also pre-populates the newly chosen password. The public landing page received a visual refinement across its section backgrounds, decorative accents, and cards.

Acceptance evidence: `npm run build` completed successfully. Existing large-chunk and JSXGraph direct `eval` advisories remain. Interactive browser verification was not performed.

## [18/11/2026] - Student Live Q&A feature removal

The student-facing Live Q&A feature has been removed from the sidebar, portal route, roadmap lesson experience, and tuition package list. Its dedicated dashboard view, unused card, mock session data, and associated student and management role-menu entries were also removed. Regular class schedules and attendance remain available.

Acceptance evidence: `npm run build` completed successfully. Existing large-chunk and JSXGraph direct `eval` advisories remain. Interactive browser verification was not performed.

## [19/11/2026] - Sidebar stale-menu-entry guard

The student sidebar no longer includes the stale `entries.live` reference left after Live Q&A was removed. That reference was undefined and caused `item.icon` to throw during rendering. An `Activity` fallback remains for any valid item that lacks an icon.

Acceptance evidence: production build passed. Existing bundle-size and JSXGraph direct-eval advisories remain; interactive browser verification was not run.

## [19/11/2026] - Student sidebar cleanup

The student sidebar no longer contains the stale Live Q&A reference or the Gia sư AI navigation item. Invalid entries are filtered before rendering. The AI chat experience remains unchanged.

Acceptance evidence: production build passed. Existing bundle-size and JSXGraph direct-eval advisories remain.

## [19/11/2026] - Single-assessment personal roadmap

One completed diagnostic assessment now unlocks the student's personal roadmap. The connected roadmap opens by default and automatically generates from the latest completed diagnostic submission, using profile exam date and study hours when available or defaults otherwise. If automatic generation fails, the user can review or adjust the prefilled values in the existing form.

Acceptance evidence: diagnostic eligibility tests and production build passed. Existing bundle-size and JSXGraph direct-eval advisories remain.

## [19/11/2026] - Diagnostic exam fullscreen entry

The exam start action now requests fullscreen before awaiting network calls, avoiding the expired user-activation issue. Fullscreen remains active during setup and is cleared on cancellation or load failure. The status indicator is updated from the browser request result.

Acceptance evidence: production build passed. Existing bundle-size and JSXGraph direct-eval advisories remain; browser interaction verification is pending.

## 14. Forgot-Password Email Validation

The forgot-password form disables native browser constraint popups and validates email input in the application before sending an OTP request. Validation feedback is rendered within the modal. Identity Service's `Auth.UserNotFound` error is presented as an unregistered-email message, and the client does not retry a user-not-found 404 against an invalid fallback route.

## 15. Desktop Sidebar Access

The desktop sidebar stays fixed at the left edge while the main portal content scrolls. Its own vertical scrolling keeps navigation reachable on shorter displays. The student IRT profile card appears above the navigation. The mobile sidebar retains its existing layout.
## 16. Student Registration Defaults

The registration flow targets grade 12 students, so grade selection is removed from the UI while the submitted default remains `12`. Three concise target score bands are retained: 700+, 800+, and 900+.

Acceptance evidence: `npm run build` passed successfully.

## 17. User Profile Synchronization & Error Transparency

The profile update flow in `AccountSettingsPage.jsx` and `authService.js` was aligned with the Identity Service backend:
- The endpoint targets `PUT /api/v1/users/me/profile` directly to match `UsersController.cs`.
- The fake local optimistic catch block was replaced with transparent error handling via `formatApiError`, ensuring users receive real feedback when an update fails.
- The training campus selection (`campusId`) is automatically synced to the student profile via `authService.updateStudentProfile({ campusId })`.
- On initial mount, `authService.fetchCurrentUserProfile()` pulls the latest persistent user profile from PostgreSQL via the Gateway.

Acceptance evidence: `npm run build` passed successfully in 5.14s.




## [20/11/2026] - Remove diagnostic retake from account settings

- Removed the diagnostic retake button from the academic settings IRT card, eliminating this entry point for repeating the initial assessment.
- Validation: production build passed. Existing bundle size and JSXGraph eval warnings remain.


## [20/11/2026] - Remove duplicate academic settings IRT card

- Removed the academic settings insight card containing hardcoded Theta and mastery statistics.
- The sidebar retains its existing Theta display sourced from diagnostic results or student dashboard data.
- Validation: npm run build passed with existing bundle size and JSXGraph eval warnings.


## [20/11/2026] - Restore persisted sidebar Theta

- Load dashboard and diagnostic history independently using Promise.allSettled. Select the latest completed diagnostic belonging to the signed-in student and guard against account changes before setting state.
- Sidebar supports camelCase API fields and snake_case immediate submission fields for Theta and placement.
- Production build passed with existing dependency and bundle warnings. Live account browser verification was not performed.


## [20/11/2026] - Consistent settings save/cancel controls

- Academic, parent and preference forms compare current values with snapshots captured after loading and saving. Unchanged saves are disabled and faded; pending edits expose a cancel button restoring the snapshot.
- Password cancellation clears sensitive inputs and resets visibility. Existing password validation remains active.
- Save handlers guard unchanged submissions and concurrent academic/parent/password requests. Existing parent local-cache fallback remains in use.
- Validation: production build passed. Browser interaction was not verified.


## [20/11/2026] - Authentication badge copy

- Replaced the technical JWT 256-bit label with Đã xác thực in account settings. Text-only change verified in source.


## [20/11/2026] - Separate digital transcript from parent settings

- Added a student-only transcript tab to AccountSettingsPage; moved the existing transcript block out of the family tab into its own conditional view.
- Parent information and linking remain in the renamed parent tab. Existing transcript data and actions are retained.
- Validation: production build passed. Browser verification was not performed.


## [20/11/2026] - Empty parent defaults and account isolation

- Registration inspection confirmed student registration does not collect or assign a parent. Removed hardcoded parent defaults and mock fallback from account settings.
- Parent cache keys include the authenticated user ID. Legacy shared cache is deliberately not migrated because its owner is unknown. Anonymous writes are rejected.
- Saving contact information no longer marks an account as linked. Actual loaded linkage status is preserved. Existing API failure fallback remains browser-local and is now scoped to the account.
- Validation: Node assertions covered empty/new accounts, legacy cache exclusion, A/B isolation, retained own data, and anonymous access guards. Production build passed; live browser verification was not performed.


## [20/11/2026] - Remove fabricated high school default

- Account settings initializes school as empty and uses only the loaded profile school. Missing school data and API failures leave the field empty with a neutral placeholder.
- Empty school baselines support save/cancel behavior; the transcript shows a missing-school label. Persisted server data is preserved.
- Validation: production build passed; live browser verification not performed.


## [20/11/2026] - Persist optional school name during registration

- Both student registration forms use a shared free-text school input with a muted example placeholder. No school lookup provider is called. The field is optional and limited to 255 characters.
- authService trims the name and sends null for blank input or parent registration. RegisterUserCommand validates the maximum length and persists the normalized value in the existing Student.SchoolName column; no migration is needed.
- Removed stale grade-dropdown references from RegisterForm to prevent runtime errors when opening target/campus controls.
- Validation: frontend production build and API build to a separate output directory passed. Five registration handler cases and three frontend payload checks passed. The standard backend build hit DLL locks from the running API; the process was left running and requires restart to use the change. Live browser registration was not exercised.


## [20/11/2026] - Registration layout refinement

- Removed the optional text and helper under the shared school field, retaining the muted example placeholder and adding a consistent school icon.
- The main registration target selector spans a full row, with consistent control padding and rounding. Email/phone and password pairs stack on narrow screens. Target and campus dropdowns close each other.
- Registration semantics remain unchanged. Production build passed; browser visual verification was not performed.


## [20/11/2026] - Smooth registration role switching

- Shared RegistrationRoleSwitch provides a sliding indicator, pressed-state semantics, keyboard focus styling, and reduced-motion support for both registration surfaces.
- StudentRegistrationFields uses AnimatePresence to animate height and opacity while retaining controlled input values in parent state. Dropdowns close on role change; overflow is restored after entry to allow menus to render outside the animated block.
- Validation: production build passed. Live visual verification was not performed.


## [20/11/2026] - Replace native exam date calendar

- Added @daypicker/react and @radix-ui/react-popover. The academic settings date field uses a reusable localized DatePicker with Vietnamese text, month/year navigation, today/clear actions, and matching blue styling.
- Radix renders the calendar in a portal with collision handling and keyboard/focus behavior. Scoped CSS supports reduced motion. The trigger is explicitly associated with its label.
- Date-only serialization uses local date components to preserve YYYY-MM-DD API values without UTC day shifts; existing save/cancel behavior is retained.
- Validation: production build and targeted lint passed. Node assertions covered round-trip dates, leap years, invalid dates, empty values and clearing. Live visual verification was not performed.


## [20/11/2026] - Inline password change validation

- Added shared validation for required values, minimum length, upper/lowercase letters, digits, same-current-password rejection and confirmation equality. Validation updates on input and blur without network requests.
- Touched-field errors appear below corresponding inputs with invalid/described-by semantics. Submission is disabled until valid; fields are disabled during requests. Cancel and success clear validation state.
- Backend field dictionaries and known invalid-current/same-password codes map to inline fields. Current password correctness remains server-validated at submission; generic transport errors use the existing alert.
- Validation: production build, targeted utility lint and 12 Node validation/mapping checks passed. Browser verification was not performed.


## [20/11/2026] - Global password success feedback

- Successful password changes now use the shared ToastContext singleton instead of the settings-local notification. Inline field validation is retained. Existing toast API/import verified in source.


## [20/11/2026] - Real account creation date

- Replaced the hardcoded joining date with createdAt from the current user's profile API, which GetCurrentUser maps from user.CreatedAt in persistence.
- Dates render as dd/mm/yyyy in Asia/Ho_Chi_Minh. Missing or invalid values show an empty-state label instead of fabricated data.
- Validation: API mapping inspected and production build passed. The specific user's database row was not queried.


## [20/11/2026] - Defer school entry until profile update

- Removed school entry, state and props from both registration forms and removed the unused shared input component. authService registration no longer sends schoolName.
- School editing remains available in profile settings. Existing backend optional-field compatibility is retained.
- Validation: production build passed.


## [20/11/2026] - Unified account profile and persisted university aspiration

- Removed the user ID row from the profile summary and merged student planning into the personal profile tab. School, aspiration, target score, exam date and study hours share the profile save/cancel controls. Invalid/unchanged submissions and concurrent edits during saving are blocked; student update errors propagate instead of being silently ignored.
- Added optional UniversityAspiration to Student and student profile DTOs/commands/queries with a 500-character validation limit. Inputs are trimmed; empty strings clear existing aspirations while omitted values preserve them.
- Applied migration 20261120093000_AddStudentUniversityAspiration to the configured DB. It only adds a nullable varchar(500) column. Updated the SQL schema and regenerated target/snapshot metadata against the existing model without introducing unrelated campus constraint operations.
- Validation: frontend production build and API build passed; all 13 backend tests passed, including aspiration update/clear/omission/read-back and length limits. EF reported no pending model changes. Restarted only the local Identity service using the ProfileVerification build and verified live Swagger request/response schemas include universityAspiration. Browser end-to-end profile saving was not exercised.


## [20/11/2026] - Backend rollback and frontend-only profile scope

- Supersedes earlier acceptance of backend changes introduced in this session. Restored all assistant-owned Identity source, tests, snapshot and documentation changes; removed the assistant-created migration and test files. The pre-existing UsersController edit was preserved.
- Reverted the applied aspiration migration and added DB column; removed the assistant's SQL schema addition. Restarted Identity using the restored backend source in FrontendOnlyRollback configuration. Live Swagger confirms neither the aspiration extension nor registration school extension remains; EF lists only the original four migrations.
- The unified frontend profile remains. School uses the existing profile API, while aspirations use per-account browser storage with a device-local notice. No new backend fields are sent.
- Validation: restored backend and frontend builds passed; local aspiration checks covered empty values, trim, clearing, account isolation and storage guards. Live browser form interaction was not exercised.


## [20/11/2026] - Frontend-only removal of connected roadmap workspace

- Removed StudentRoadmapWorkspace and ConnectedRoadmapPage. The roadmap route now directly renders CurriculumExplorerView, retaining existing curriculum navigation and callbacks.
- Shared API services remain unchanged to preserve other consumers. No backend files were modified.
- Validation: production build passed; source search found no stale component references. All five backend repositories remained Git-clean. Live browser verification was not performed.


## [20/11/2026] - Frontend-only profile/payment activation guidance

- Added account-scoped activation checks using existing diagnostic history, identity/student profile and tuition endpoints. Required data includes contact details, school, device-local aspiration, target score, a valid non-past exam date and study hours. Loading/error states do not unlock access; asynchronous results are discarded after account changes.
- A native dialog with keyboard/focus handling provides the diagnostic/profile/payment checklist and directs users to settings or tuition. Profile settings adds a guidance banner and rechecks prerequisites after saving. Dashboard status no longer claims an unlocked roadmap prematurely.
- Roadmap and tuition page entry is gated on the frontend. All primary roadmap callbacks, including desktop/mobile navigation and diagnostic result actions, use the guide. Tuition requires a saved profile and roadmap access requires explicit server isPaid confirmation. Added an opt-in strict payment fetch and prevented repeated paid-event dispatch during status synchronization.
- This changes frontend navigation only; backend generation timing and authorization are unchanged. Aspirations remain stored locally per account, as previously requested.
- Validation: production build and 12 activation/diagnostic tests passed. Targeted lint had no errors, with existing unused catch warnings and the fetch-loading effect warning. Live browser and payment end-to-end verification were not performed.


## [20/11/2026] - Sidebar IRT summary layout

- Student IRT summary now appears below branding and before navigation on desktop/mobile. Other role cards retain their footer position.
- Title and Theta use separate rows, preserving the complete numeric value; footer metrics wrap as whole labels when needed.
- Validation: production build passed. Frontend only; live visual verification not performed.


## [20/11/2026] - Correct sidebar Theta wrapping

- Supersedes the previous relocation: IRT card remains below navigation. Header displays title and badge side by side; shrink-0 and whitespace-nowrap keep the complete Theta expression on one line. Layout classes verified in source; frontend only.


## [20/11/2026] - Preserve pricing access before activation

- Tuition page no longer mounts the activation checklist in place of pricing. All users can view existing plans and prices.
- Added an optional pre-payment guard before creating a payment link. Incomplete student activation opens the existing guide; roadmap gating is unchanged.
- Validation: production build passed. Frontend only; backend unchanged.


## [20/11/2026] - Automatic post-save activation check

- Guided profile saves now initiate an account-scoped pending activation check and keep the guide modal closed. Confirmed complete profiles navigate to tuition, or roadmap if payment is already confirmed.
- Pending checks show banner feedback and disable form edits. Incomplete profiles stay on settings with a missing-fields toast; verification failures are distinguished from save failures.
- Validation: production build and focused diff check passed. Frontend only; browser end-to-end verification was not performed.


## [20/11/2026] - User-facing tuition copy

- Unpaid notice now states activation is required to view course content and directs users to choose a plan and pay.
- Replaced database synchronization terminology with refresh wording in the action and loading states. Copy-only frontend change verified in source; backend unchanged.


## [20/11/2026] - Payment receipt status consistency

- Table and receipt now share status presentation. Receipt no longer hardcodes successful payment, payment time or signature verification. Unknown and non-success states remain distinct.
- Pending/unknown history entries refresh via the existing payment-status endpoint. Order, student and payment identifiers must match before updates; failed requests preserve the original state. Refreshed rows update an open receipt as well.
- Validation: frontend build and six payment mapping/reconciliation tests passed. No backend changes; the specific live transaction was not queried.


## [20/11/2026] - Resume existing pending payment

- Added resume actions to pending transaction rows and receipt details. Actions verify current order status and account/payment identifiers before reopening the existing PayOS checkout modal with the same order code and returned HTTPS checkout URL.
- Already-paid orders update local history and tuition state. Terminal/unknown states and missing/invalid links cannot reopen checkout. A ref lock prevents concurrent resume requests and new order creation during verification; existing profile prerequisite checks remain active.
- Validation: production build and all 11 payment mapping/reconciliation/resume tests passed. No backend changes or real payment performed; live browser verification remains unperformed.


## [20/11/2026] - Reliable payment outcome toasts

- Successful payments now call the shared toast singleton directly instead of relying on an unprovided showToast callback. Creation failures also use the shared error toast. Resume uses the same success handler without duplicate notifications.
- Added a sequential payment monitor that stops on confirmed success/failure/cancellation/expiry and ignores results after cleanup. Terminal failures update history and show a dedicated modal state with appropriate toast feedback. Mismatched order responses do not trigger success.
- Network failures remain distinct from payment failure: one warning per disconnected period, followed by automatic retry.
- Validation: production build and 18 payment status/resume/monitor tests passed. No backend edits or real payment performed; live browser payment verification was not performed.


## [20/11/2026] - Frontend-only commit acceptance

- Consolidated the final frontend scope: account/authentication UI, diagnostic activation guidance, curriculum/sidebar presentation and consistent payment status/resume/notification behavior.
- Validation: production build and all 30 targeted diagnostic/activation/payment tests passed. Removed trailing whitespace in StudentCurriculumView. Existing bundle/JSXGraph warnings remain; no real payment or browser end-to-end verification was performed.
- Commit scope is the web-client repository only. Backend and System-Repo changes are excluded.


## [21/11/2026] - Approved weekly timetable implementation

- Replaced the student session list with a seven-day calendar using six numbered standard slots, week navigation and an upcoming-session shortcut. Existing term/course/status filters and attendance summary are retained in a compact layout. Mobile uses a daily agenda with the same session cards.
- Session tiles display the API-provided className, topic, actual time/slot and attendance. Selection opens an accessible native dialog matching the approved blue-header design, containing class, date/time, attendance/check-in, worksheet and existing ZPD/AI actions. Rooms and unsupported teacher names are not displayed.
- Existing timetable endpoints and normalization remain unchanged. Date-only helpers avoid UTC day shifts; custom configured times receive visible rows and simultaneous class sessions are retained. A request version guard discards stale loads after account/term changes or unmount.
- Validation: production build and eight weekly date/slot/grouping tests passed. React server-render assertions confirmed class names, six slots, detail dialog and absence of room data. Live authenticated browser end-to-end verification was not performed. All five backend repositories remain Git-clean.


## [21/11/2026] - Schedule heading deduplication

- Removed the duplicate content heading/icon from WeeklyScheduleCalendar, retaining the navbar title, helper text and refresh action. Copy/layout source verified; frontend only.


## [21/11/2026] - Schedule toolbar layout

- Added an optional navbar pageSubtitle, supplied only for the student schedule, placing guidance directly beneath the existing title.
- Refresh now sits at the right edge of the filter row with responsive wrapping. Production build passed; frontend only.


## [21/11/2026] - Remove frontend-only aspiration

- Removed the aspiration input, state and per-account browser storage utility from settings. Existing stored keys are no longer read or written.
- Removed aspiration from activation prerequisites and guidance text. Existing backend profile fields and APIs remain unchanged.
- Validation: production build and nine activation tests passed, including progression without local aspiration data. Frontend only.


## [21/11/2026] - Allow checkout after student profile completion

- Removed the future-only exam date prerequisite that blocked the reported complete profile. A valid saved date is sufficient. Parent details and aspirations remain outside activation requirements.
- Successful student profile saves trigger activation rechecks regardless of entry from the guide or ordinary settings. Confirmed eligible accounts proceed to tuition or an already-paid roadmap.
- Validation: production build and ten activation tests passed, including the reported contact/target/study-time values with a past exam date and no parent data. Backend unchanged.

## [21/11/2026] - Paid roadmap refresh acceptance
The frontend reconciles tuition summaries with confirmed successful student payment records using the existing APIs. Pending and failed payments do not grant access. Tuition events are emitted only when cached state changes, preventing the activation-refresh/remount cycle. The roadmap consumes the parent activation payment result; background checks preserve a previously verified ready view for the same account. No backend contracts were changed. Validation: 29 regression tests and production build passed; real-account browser verification remains outstanding.

### [21/11/2026] - Empty exam date default (FE)
Removed the prefilled exam date from account settings. Profiles without a saved date show the date picker placeholder; saved dates remain visible. Reset the date when loading another account. Frontend production build passed; no backend changes.

### [21/11/2026] - Membership benefits visibility (FE)
Membership benefits now remain visible before payment, with activation-required labels and no unlocked action links. Paid members retain unlocked actions and the active course card. The heading uses the actual benefit count. Removed the test deactivation button and its reversal behavior. Frontend production build passed; backend unchanged.

### [21/11/2026] - Remove stale local tuition authorization
Fixed the tuition view retaining a cached test activation after an unpaid server response. It now starts without cached access and applies both paid and unpaid API results. Removed quick test activation. Curriculum synchronization clears unpaid cache and never grants access from cached state on request failure. Server tuition summary or confirmed successful payment history remains the payment source. Validation: 31 regression tests and frontend production build passed. Backend unchanged; live account not inspected.

### [21/11/2026] - Authoritative tuition API access
Supersedes the earlier history-based fallback: frontend access now strictly follows isPaid from GET /api/practice/payments/status-by-student/{studentId} (existing my-status fallback). Payment history and checkout success callbacks cannot grant access independently; payment completion reloads tuition status. Standalone roadmap initializes locked and rechecks the API on events rather than reading local cache. Existing backend computes eligibility from ACTIVE registration or SUCCESS/PAID payments; backend unchanged. Validation: 31 regression tests and production build passed.

## [21/11/2026] - Paid roadmap provisioning acceptance
After authoritative tuition confirmation and profile/diagnostic eligibility, activation fetches the existing roadmap. Only an HTTP 404 triggers POST /api/practice/roadmaps/generate with the same student's completed diagnostic submission, saved examDate and studyHoursDay. Existing progress is preserved; concurrent checks are deduplicated. Generation failures remain visible as warnings without revoking confirmed payment. Past exam dates are rejected locally for generation because the existing backend validator requires a future date. MilestoneCard no longer generates with invented dates/hours and listens for roadmap update events.
Timetable comes from /api/practice/schedules/students/{studentId}/timetable, which reads ClassEnrollments and ClassSessions; roadmap nodes are not class sessions. Optional metadata failures cannot discard timetable data. Empty states distinguish filters/current week from missing classes/sessions. No backend edits. Validation: 45 tests and production build passed. The live a1@gmail.com account was not accessed.

## [21/11/2026] - V-ACT mock exam API acceptance
App's mock action now opens MockExamModal instead of the legacy DiagnosticTestModal. createMockExamService uses GET /api/content/exams and the existing /api/practice/mock-exams endpoints for start, submit, result recovery and tab-departure logging. Only published FULL_MOCK exams are listed. Server question IDs/options and submission IDs are preserved, every question is submitted (unanswered selections remain blank), and timing uses the shared exam clock. The UI never derives scores or theta locally. Server review status is displayed separately from completed grading.
Drafts are scoped to student IDs in sessionStorage and retain their original deadline on resume. Successful server submissions clear the draft and dispatch the existing submission-updated event. Missing/failed API requests show empty/error states without client-generated mock questions. No webcam capture or backend edits were introduced. Existing backend has its own fallback questions/grading when Content gRPC is unavailable; this frontend change cannot guarantee live bank availability.
Validation: 8 API/payload tests and 3 clock tests passed; production build passed. An isolated Chrome headless test with stub APIs verified selecting an exam, starting once, answering, navigation, close/resume with retained answers, confirmation, correct payload, rendering server score and clearing draft. No live account submissions were created.

## [21/11/2026] - Shared diagnostic and mock examination mechanics
Supersedes the standalone mock modal UI: the mock entry now navigates to MockAssessmentPage. ExamRoomHeader, ExamRoomBody and ExamSubmitConfirmation were extracted from the existing diagnostic page and reused by both assessment types. Diagnostic state management and API submission remain unchanged. Shared rendering retains passage layout, selectable answers, current/answered/flagged navigation, per-question timing and submit confirmation; mobile question count is data-driven.
The mock page uses its own published FULL_MOCK questions, server session duration and server grading. It requests fullscreen from the start gesture, detects blur/hidden/fullscreen exit with a 1.5-second deduplication interval, warns the student, logs departures through the mock API, and locks/auto-submits at three violations to match the diagnostic frontend policy. This frontend threshold is distinct from the existing backend review flag rule; backend behavior was not edited. Timeout also auto-submits. Session drafts retain answers, flags, violation count and original deadline; restoring requires a fullscreen continuation prompt. There is no mid-exam close control. Before-unload warns while testing; fullscreen exits after results or leaving the page.
Validation: 23 diagnostic/mock unit tests and production build passed. Chrome with stub APIs verified shared room navigation, selected/flagged answers, reading passage rendering, draft restoration without a new start, confirmation and server-score display, violation deduplication, exactly one submission on the third violation and exactly one submission at the API-defined deadline. No live exam records or backend files were modified.

### [21/11/2026] - Mock lobby duplicate title and live catalog check
Removed the repeated mock lobby heading, retaining the account navbar title. Read-only GET http://localhost:5212/api/content/exams confirmed three FULL_MOCK records, all isPublished=false: 2019 (119 questions), de-minh-hoa-dhqdtphcm2025 (120), De-thi-mau-DHQG-HCM-2024-pdf-pdf (120); all 150 minutes. The published-only frontend filter is correct; no exam publication or backend/database edits were performed. Frontend production build passed.

### [21/11/2026] - Simplify mock lobby copy
Removed the amber rules banner and the sentence comparing mock mechanics to diagnostic assessment, as requested. Retained the brief exam selection prompt and refresh button. Frontend build passed; exam behavior and backend unchanged.

### [21/11/2026] - Remove activated course banner
Removed the green activated-course notification and official-student badge from StudentCurriculumView. Payment eligibility logic unchanged. Frontend production build passed; backend untouched.

### [21/11/2026] - Simplify account settings description
Removed the V-ACT 1200 target-score phrase from the account settings header description as requested. Frontend production build passed; backend unchanged.

### [21/11/2026] - Simplify student roadmap, history and payment copy
Removed the DAG/ZPD suffix from the personalized roadmap badge and the visible submission UUID from the attempt history table. Replaced technical ACID/NAPAS payment wording and the fixed 1-3 second activation claim with concise PayOS payment and confirmed-payment activation text. IDs remain available to API handlers. Frontend build passed; backend unchanged.

### [21/11/2026] - Shorten tuition heading
Removed the adaptive PLAR suffix from the tuition activation heading, retaining the payment and roadmap activation wording. Verified the resulting source string and git diff whitespace check. Copy-only frontend change; backend unchanged.

### [21/11/2026] - Remove course license panel
Removed the course license status panel including perpetual access and V-ACT outcome commitment copy. Adjusted the remaining course information grid to two columns. Frontend production build passed; backend unchanged.

### [21/11/2026] - Frontend commit verification
Final scope: weekly timetable/session details, profile prerequisites, authoritative tuition access and roadmap provisioning, shared diagnostic/mock exam room and API integration, and simplified student-facing copy. All 75 related unit tests passed; latest production build passed. Chrome stub-API flow and read-only live mock catalog verification were completed earlier in this session. No backend source or live exam data changed. The frontend changes and frontend documentation are ready for commit; root repository configuration/SQL/script changes are outside this frontend commit.

---

## 13. Parent Companion Portal UI Architecture & Design Cohesion Acceptance - 19 November 2026

The Parent Companion Portal (`ParentDashboardView.jsx`) was comprehensively redesigned to eliminate visual fragmentation, resolve competing saturated banners, and present a coherent, user-centric dashboard for parents:

- **Unified Hero Banner & Structured 3-Column Profile Strip**:
  - Replaced cluttered badges and floating pills with an elegant Student Profile Card: student avatar initials (`childInitials`), active live presence dot, and clean typography.
  - Implemented a balanced 3-column metadata grid (`School`, `Course/Class`, `Target Major NV1`) with dedicated semantic icons (`GraduationCap`, `BookOpen`, `Target`), replacing awkward multi-line wrapped bubbles.
  - Replaced the high-contrast yellow button with elegant translucent glass buttons (`bg-white/10 hover:bg-white/20 border border-white/20`), preserving visual hierarchy and returning focus to the student's academic progress.
- **Refined Tuition Payment Ribbon**:
  - Transformed the oversized blue banner into an elegant, light-slate/indigo fintech ribbon (`bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200/80`) with `ShieldCheck` icon badge and PayOS VietQR 1-click CTA.
- **Unified 4-Metric Grid with Dynamic Readiness Tiers**:
  - Replaced disconnected plain-white metric boxes with elevated cards featuring rounded colored icon badges, bold score typography, and supportive status captions.
  - Implemented `getTierInfo` to accurately classify readiness tiers (`NOT_READY`, `PREPARING`, `ACCELERATING`, `READY`) based on both database tier and numerical index, preventing low scores (e.g. 19.2/100) from showing inappropriate green "Ready" badges.
- **3-Factor Readiness Progression & Dedicated Teacher Card**:
  - Structured the 3 evaluation factors into individual micro-cards with numbered badges (1, 2, 3), gradient progress bars, and accessible pedagogical captions.
  - Consolidated teacher information into a dedicated profile card on the right column, displaying real faculty details from database queries, phone contact, and an interactive 1-on-1 consultation scheduling action.
- **Parent Submission History UI Modernization (`SubmissionHistoryView.jsx`)**:
  - Re-themed the Header Banner with the deep Navy-Indigo aesthetic (`from-slate-900 via-indigo-950 to-blue-950`) and integrated responsive multi-child selector chips.
  - Humanized psychometrics by converting raw IRT theta (`-1.8333`) into pedagogically grounded parent assessments via `formatThetaDisplay` (*"Khởi đầu nền tảng - Cần gia đình kèm cặp ôn tập thêm"*).
  - Sanitized technical jargon: removed developer suffixes like `(DIAGNOSTIC)` and simplified filter tags from *"Luyện tập ZPD"* to *"Luyện tập thích ứng"*.
  - Resolved mismatch in question counting: accurately computed `summaryStats.totalWrong` across all attempts so 26 incorrect questions are accurately reflected in the overview card.
- **Verification**:
  - `npm run build`: Verified 100% clean production bundle in 1.15s.
  - `node --test tests/*.test.js`: All 22 unit tests passing.

---

## 14. Top Navigation Bar "EdTech Mission Control" Architecture Acceptance - 19 November 2026

The top navigation system (`AccountNavbar.jsx`) was re-engineered under the **"EdTech Mission Control"** paradigm, delivering real-time academic telemetry, zero hardcoded values, and seamless synchronization with backend services:

- **100% Real-Data Backed Architecture (Zero Hardcoding)**:
  - All displayed entities (countdown targets, days remaining, pedagogical alerts, active child, campus assignment, continuous learning streaks) are dynamically resolved from database queries and API services (`practiceService.getAcademicTerms`, `practiceService.getMyAlerts`, `portalMetrics`, and `currentUser`).
- **Dynamic Exam Countdown & Minimalist Mission Control Capsule (Center)**:
  - Dynamically calculates the countdown to upcoming VNU-HCM V-ACT examination rounds or backend `AcademicTerms` using `getUpcomingExam(terms, studentDash, user)` and current timestamp math.
  - Implemented an ultra-refined, single-line capsule pill (`rounded-full border border-slate-200/90 bg-slate-50/80 hover:bg-indigo-50/70`) with subtle radar ping dot, target exam label, and remaining days count (`● ĐGNL Đợt 1 (2027) • Còn 129 ngày (28/03/2027)`).
  - Clicking opens an interactive **Exam Timeline & Blueprint Modal** (`ExamTimelineModal`), detailing Round 1 & Round 2 schedules, exam locations across Vietnam, the 120-question / 150-minute 3-section blueprint, and personalized 1200-point target score telemetry.
- **Contextual Left Identity & Anti-Truncation Layout**:
  - Eliminated bulky badge cramming beside the title, ensuring `pageTitle` (*Tổng quan Đồng hành*) is strictly non-truncating (`whitespace-nowrap shrink-0`).
  - For Parents (`role === 'parent'`): Positions a compact companion chip on the right action bar (`👦 Con: [studentName]`) with rich tooltip metadata (School, Grade), preventing horizontal space collisions.
  - For Students (`role === 'student'`): Renders the campus badge (`currentUser.campusName`) when enrolled.
- **Interactive Early Warning & Pedagogical Alert System (Core Flow 6)**:
  - Replaced the previous disabled placeholder button with an active notification drawer consuming `practiceService.getMyAlerts({ studentId })`.
  - Listens to the `veval:flow6-updated` event for reactive state synchronization without polling.
  - Displays a pulsating unread counter badge (`animate-pulse`) when unread alerts exist.
  - Popover dropdown presents categorized alerts (`RED` risk warnings, `YELLOW` deadline reminders, `INFO` pedagogical guidance) with relative timestamps (`formatRelativeTime`), 1-click read acknowledgment (`markAlertAsRead`), and a *"Đọc tất cả"* bulk acknowledgment action.
- **User Profile Pill & Real-Time Presence Indicator**:
  - Displays user initials with a live green presence indicator dot (`bg-emerald-500 ring-2 ring-white`), full name, and localized Vietnamese role tags (`Phụ huynh`, `Học viên`, `Thầy/cô`).
  - Dropdown menu provides direct access to Account Settings, Landing Page, and authenticated Logout.
- **Verification**:
  - `npm run build`: Completed in 1.04s with 0 errors.
  - `node --test tests/*.test.js`: 22/22 unit tests pass 100%.

---

## 15. Modern SaaS Single-Line Left Sidebar Redesign Acceptance - 19 November 2026

The vertical navigation system (`Sidebar.jsx`) was re-engineered under the **Modern SaaS / Linear & Notion Style** (Option 1), optimizing vertical space, eliminating text truncation, and providing a clean, distraction-free companion navigation experience:

- **Single-Line Ergonomics & Zero Truncation**:
  - Transformed bulky, 2-line stacked item cards (~60px height) into compact single-line rows (~40px height) with balanced whitespace (`px-3.5 py-2.5 rounded-xl`).
  - Removed the oversized `VietQR` badge that forced item titles to truncate into ellipsis (`Đóng Học phí & ...`).
  - Shortened navigation labels to concise, modern terminology (`Học phí & Gói học`), ensuring full readability within the 288px (`w-72`) sidebar container.
  - Subtitles are now cleanly preserved as native browser hover tooltips via `title={item.sublabel ? `${item.label} (${item.sublabel})` : item.label}`, removing visual clutter while retaining pedagogical clarity.
- **Unified Visual Hierarchy & High-Affordance States**:
  - Inactive State: Clean, neutral slate typography (`text-slate-600 font-medium`) with subtle blue tint on hover (`hover:bg-blue-50/60 hover:text-blue-700`).
  - Active State: Vibrant yet refined royal blue-to-indigo gradient (`bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold`) paired with a soft ambient shadow (`shadow-sm shadow-blue-500/20`), completely replacing the previously harsh cyan-blue block.
  - Icons: Shifted from dull, dark-grey container boxes to crisp inline Lucide icons (`w-4.5 h-4.5 shrink-0`) that switch dynamically to bright white when active and interactive blue on hover.
- **Robust Footer Student Card Containment**:
  - For parent users (`role === 'parent'`), updated the linked student display to show `${firstChild.studentName} • ${firstChild.school}`, substituting the unwieldy 54-character curriculum topic string.
  - Hardened with CSS `truncate` and descriptive `title` tooltips, guaranteeing aesthetic resilience regardless of school or student name lengths.
- **Verification**:
  - `npm run build`: Verified 100% clean production bundle in 1.06s with 0 errors.
  - `node --test tests/*.test.js`: All 22 unit tests passing (100%).

---

## 16. Dynamic Entity Resolution & Empty-State Resilience Acceptance - 19 November 2026

The Parent Companion Portal architecture across backend microservices and frontend client layers was upgraded to enforce 100% dynamic database binding and resilient empty-state handling:

- **Strict Database Entity Resolution**:
  - Backend gRPC services (`IdentityGrpcService.cs`, `IdentityGrpcClient.cs`) return real database attributes for `SchoolName` and `TargetScore`, eliminating synthetic string injection when fields are unpopulated.
  - Query Handler (`GetParentDashboardQueryHandler.cs`) dynamically reads enrolled classes, campuses, and target scores. Missing or unconfigured fields resolve to meaningful domain states: *"Chưa phân lớp"*, *"Chưa cập nhật"*, and *"Chưa thiết lập mục tiêu"*.
  - Removed mock student injection (`buildSeedParentDashboard`) from `practiceService.js`. If an account has no linked children, the API returns an empty array (`children: []`), allowing the client to render the interactive `renderStudentLinkingCenter` without fake personas.
- **Accurate Tuition Payment Context for Parents (`TuitionPaymentView.jsx`, `App.jsx`)**:
  - Injected child context (`isParent`, `activeChild`, `childrenList`) into `TuitionPaymentView.jsx`.
  - Resolved `studentId` to the targeted child's unique identifier rather than the authenticated parent's user ID, preventing billing attribution errors.
  - Integrated dynamic course querying (`practiceService.getCourses`), retrieving real active course entities, fees, and durations from PostgreSQL `v_eval_enrollment.Courses`.
- **Verification**:
  - `npm run build`: Verified 100% clean production bundle in 1.29s with 0 errors.
  - `node --test tests/*.test.js`: All 22 unit tests passing (100%).

---

## 17. Parent Companion Portal Complete Architecture & Hook Order Resolution - 19 November 2026

The Parent Companion Portal was completely redesigned and hardened according to the full system specification, resolving React lifecycle exceptions and establishing a unified 4-module parent ecosystem:

- **React Rules of Hooks & Lifecycle Resolution (`ParentDashboardView.jsx`)**:
  - Reordered and elevated all top-level React hooks (`useEffect`, `useCallback`, `useMemo`, `useState`) prior to any conditional returns (`if (loading)`, `if (!currentChild)`), eliminating the `Rendered more hooks than during the previous render` runtime error.
  - Replaced external package dependency `react-hot-toast` with internal `ToastContext` (`import { toast } from '../../context/ToastContext'`), eliminating Vite bundler module resolution failures.
- **Universal Active Child State Synchronization (`App.jsx`, `AccountNavbar.jsx`, `TuitionPaymentView.jsx`)**:
  - Lifted `parentActiveChildId` to root `App.jsx`, cascading down to `ParentDashboardView`, `ParentChildResultsView`, `ParentEarlyWarningsAndTeacherView`, `TuitionPaymentView`, and `AccountNavbar`.
  - Added seamless inline dropdown switcher in the top navigation bar (`AccountNavbar.jsx`) when a parent has $\ge 2$ linked children, allowing instantaneous child switching from any page.
  - Bound child pill selections in `TuitionPaymentView` to trigger `onSelectChildId`, updating global telemetry immediately.
- **4-Module Sidebar Navigation Structure (`Sidebar.jsx`)**:
  - Structured the parent experience into 4 dedicated modules:
    1. *Tổng quan đồng hành*: Tier 1-3 dashboard overview.
    2. *Tiến độ & Kết quả của con*: 3-tab unified view (Radar multi-domain mastery, Read-Only personalized roadmap, Proctored examination history).
    3. *Cảnh báo & Trao đổi Giáo viên*: Yellow/Red early warnings filter, 3-way parent-student-teacher conference confirmation modal, and direct teacher messaging drawer.
    4. *Học phí & Lịch sử giao dịch*: PayOS VietQR payment, invoice tracking, and receipt downloads.
- **3-Tier Dashboard Architecture (`ParentDashboardView.jsx`)**:
  - *Tier 1 (Header Strip)*: Current child profile, multi-child dropdown, `+ Liên kết thêm con` action, Offline class teacher card (Name, Phone, Direct messaging), and conditional tuition warning ribbon (auto-hidden when paid).
  - *Tier 2 (4 Parent-Focused Metric Cards)*: Projected Exam Score (1200 scale, confidence interval, target comparison, success likelihood); Exam Readiness Index (100 scale, natural language status text); Weekly Study Hours (7-day/30-day toggle, continuous streak); Personal Roadmap Mastery (completed vs total skills).
  - *Tier 3 (2-Column 7:5 Split)*: Left column renders actionable early warnings and recent proctored mock exams; Right column provides natural language pedagogical feedback across 3 learning facets and student profile with unlinking confirmation modal.
- **Zero Technical Jargon & Read-Only Parent Sandbox**:
  - Completely purged all internal acronyms (*IRT Theta*, *BKT*, *ZPD*, *PLAR*, *Core Flow 5*, *5.000 ₫ test price*).
  - Enforced strict Read-Only mode: all quiz-taking and exam-sitting capabilities are blocked or hidden for parent personas.
- **Verification**:
  - `npm run build`: Succeeded 100% in 1.15s with 0 errors.
  - `node --test tests/*.test.js`: All 22 unit tests passing (100%).

---

## Acceptance Update: Diagram Placeholder Rendering & Low-DPI Textbook Upload Parameters - 17/11/2026

1. **Diagram Placeholder UI Rendering (`src/components/common/MathText.jsx`)**:
   - Protected `[IMAGE_PLACEHOLDER: id="..." page="..." type="..." desc="..."]` tags from LaTeX normalization inside `normalizeMathString`.
   - Added a dedicated dashed-border alert card in `renderStructuredContent` displaying the diagram type, source PDF page number, and description so Frontend users/instructors can crop and supplement missing diagrams.
2. **Low-DPI Batch Ingestion Client Integration (`src/services/aiService.js`)**:
   - Updated `uploadTextbookPdf` to pass `targetDpi = 56` and `batchSize = 5` by default to `V-Eval-Ai_Engine`.
3. **Textbook Studio 2-Stage Pipeline & 5 Dedicated Pedagogical Sectors (`TextbookStudioView.jsx`)**:
   - Cleanly separated the Textbook workspace into two distinct sub-modes:
     - `mode === 'parse'`: Dedicated 2-stage ingestion pipeline (Step 1: Rapid Skeleton Extraction via Vision AI 10-page & last-page rendering; Step 2: Deep 70-80% Knowledge Ingestion via Vision OCR). Strictly suppresses any adjacent uninitialized book previews on initial entry.
     - `mode === 'view'`: Ingested Book Vault reader and 3-column workspace with 5 dedicated sectors: Sector 1 (Core Theory with page citations), Sector 2 (KaTeX Formulas with quick-insert palette & copy), Sector 3 (Worked Textbook Examples), Sector 4 (Pattern Matrix with 6-level Bloom Taxonomy), Sector 5 (AI-driven Exercise Generation and Custom Item Authoring).
   - Unified Sidebar access for all 3 academic modules (`roadmap`, `textbook-studio`, `exam-studio`) with full-screen Studio editor integration across Teacher, Manager, and Admin roles.
4. **Sector 1 Deep Theory Hydration & Multi-Tier Resilient Matching Architecture (`TextbookStudioView.jsx`)**:
   - **Automatic State Hydration (`filledChunks`)**: Eliminated the blank theory state by automatically executing `loadChunksForSource` during component initialization, vault selection, and Step 2 completion polling. Ingested chunks from Supabase PostgreSQL (`KnowledgeVectorChunks`) are immediately loaded into React state.
   - **Multi-Tier Matching Engine (`currentLessonChunks`)**:
     - *Priority 1*: Page-range alignment (`activeLesson.pageStart <= chunk.pageNumber <= activeLesson.pageEnd`). Accurately maps all 6 core physics pages (Pages 15-20) for Lesson 1 (Speed, Velocity, Vector displacement formula `\vec{v} = \frac{\Delta \vec{d}}{\Delta t}`, and lab experiments).
     - *Priority 2*: Normalized title substring matching.
     - *Priority 3*: Content keyword indexing.
     - *Priority 4*: Chapter page boundaries fallback.
     - *Priority 5*: Safe 12-chunk window fallback ensuring Sector 1 never renders blank when textbook data exists in Supabase.
   - **Interactive User Utilities**: Added a view mode toggle (`[By Lesson]` vs `[Entire Book - 122 pages]`), live regex-based keyword search with instant clear, one-click clipboard copy for KaTeX snippets, and direct handoff to `CurriculumStudioEditor`.
5. **Verification**:
   - `npm run build` (Vite v8.3.0) completed cleanly in 1.26s with zero errors.

6. **Unified 3-Tab Architecture, Clamped DPI (60-90) & 3-Part Pedagogical Ingestion (`TextbookStudioView.jsx`)**:
   - **Unified 3-Tab Switcher**: Refactored the module into three synchronized functional tabs:
     - `activeMainTab === 'standard'`: Standard textbook curriculum management (Subject, Grade, Book Edition, School Year). Provides inline editing for Chapter, Lesson, and Pattern names, page boundaries, KaTeX formulas, and 6-level Bloom taxonomy.
     - `activeMainTab === 'ingest'`: Unified 3-stage ingestion pipeline:
       - *Part 1 (Skeleton Scan)*: Fast TOC extraction with configurable resolution strictly clamped between 60 and 90 DPI (default 72 DPI).
       - *Part 2 (Textbook Document Ingestion)*: Deep 70%-80% knowledge extraction encompassing Core Theory chunks, KaTeX formula vault, Data Tables, and Diagram placeholders.
       - *Part 3 (Questions & Exercises)*: Direct extraction of textbook discussion prompts, worked examples, and end-of-chapter problems stored in a persistent bank for long-term re-use.
     - `activeMainTab === 'studio'`: Full-screen pedagogical authoring studio integrating `CurriculumStudioEditor` with 1-click handoff from Tabs 1 and 2.
   - **Quality Assurance & Verification Status (`ACCEPTED` vs `PENDING_REVIEW`)**:
     - Automatically extracted items default to `PENDING_REVIEW` with an amber status badge.
     - Instructors can review and approve individual items or batch-approve entire lessons with `[✓ Duyệt Toàn Bộ Bài]`, transitioning states to `ACCEPTED` with emerald green badges.
   - **AI Grounding & Question Synthesis**:
     - Embedded `[✨ AI Bổ sung kiến thức nền]` using `aiService.analyzePatternWithAi` to auto-fill definitions, formulas, and methods without manual typing.
     - Embedded `[⚡ AI Sinh câu hỏi mới]` generating Bloom-aligned multiple-choice questions with full KaTeX explanations.
   - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.71s with 3050 modules transformed and zero errors.


7. **Decoupled 3-Component Architecture & Collapsible Sidebar Dropdown (`Sidebar.jsx`, `TextbookStandardView.jsx`, `TextbookIngestView.jsx`, `TextbookStudioView.jsx`)**:
   - **Completely Decoupled Component Hierarchy**:
     - Separated monolithic logic into 3 isolated, maintainable components to prevent code bugs and state collisions:
       1. `TextbookStandardView.jsx`: Focused strictly on curriculum layout, inline chapter/lesson editing, KaTeX formula vault, and Bloom taxonomy mapping.
       2. `TextbookIngestView.jsx`: Focused on the 3-stage Vision AI ingestion pipeline with strict 60–90 DPI constraint and question bank re-use storage.
       3. `TextbookStudioView.jsx`: Focused on deep pedagogical authoring via `CurriculumStudioEditor`.
     - Integrated `textbookStateBridge.js` leveraging `sessionStorage` for seamless, decoupled context synchronization (book, chapter, lesson).
   - **Collapsible Sidebar Dropdown for Teacher, Manager & Admin Roles (`Sidebar.jsx`)**:
     - Introduced an extensible `expandedGroups` state mechanism supporting multiple collapsible dropdowns across all roles.
     - Added the collapsible `textbook-group` dropdown in the sidebar containing the 3 dedicated pages (`textbook-standard`, `textbook-ingest`, `textbook-studio`), with auto-expansion when navigating to child routes and animated ChevronDown toggles.
   - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.21s with 3053 modules transformed and zero errors.


8. **Pedagogical Sanitation and Non-Pedagogical Item Elimination Architecture (`textbookStateBridge.js`, `TextbookStandardView.jsx`, `TextbookIngestView.jsx`)**:
   - **Root Cause Analysis**:
     - Raw OCR chunks for textbook front matter (pages 1-4) were ingested with metadata `lessonName: 'N/A'`, `patternName: 'Bìa sách' | 'Trang trắng'`, and `sectionType: 'COVER'`.
     - When aggregating chunks into `chapterMap`, these placeholder strings created dummy lessons (`N/A`) containing placeholder patterns (`Bìa sách`, `Trang trắng`), which occupied index 0 and rendered by default in the right-hand inspection columns.
   - **Multi-Layered Pedagogical Sanitizer Pipeline**:
     - *Predicative Validation (`isNonPedagogical`)*: Implemented a case-insensitive validator in `textbookStateBridge.js` identifying non-instructional terms (`bìa sách`, `trang trắng`, `trang trống`, `trang lót`, `n/a`, `mục lục`, `lời nói đầu`, `thông tin xuất bản`).
     - *Recursive Hierarchy Pruning (`filterPedagogicalChapters`)*: Sanitizes nested chapter trees, stripping out non-pedagogical lessons and patterns before committing to state.
     - *Chunk Ingestion Guards*: In `TextbookStandardView.jsx` and `TextbookIngestView.jsx`, chunks flagged with `sectionType === 'COVER'`, `INDEX`, `PREFACE` or matching non-pedagogical identifiers are completely excluded from lesson and pattern creation.
     - *Active Node Safety Selectors*: Computed `validChapters`, `validLessons`, and `validPatterns` ensure pointers never resolve to deleted or placeholder records.
   - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.24s with 3053 modules transformed and zero errors.


9. **Desktop Collapsible Sidebar Rail & Canonical GDPT 2018 Curriculum Standardization (`Sidebar.jsx`, `AccountNavbar.jsx`, `App.jsx`, `TextbookStandardView.jsx`, `textbookStateBridge.js`)**:
   - **Collapsible Sidebar Rail Architecture (`Sidebar.jsx`, `AccountNavbar.jsx`, `App.jsx`)**:
     - *State Control*: Added persistent `isSidebarCollapsed` state in `App.jsx`, passed synchronously to `<Sidebar>` and `<Navbar>`.
     - *Dual Toggle Controls*: Rendered `PanelLeftClose` and `PanelLeftOpen` controls in both the Sidebar brand header and the `AccountNavbar` desktop header strip.
     - *Icon Rail UI Mode (`w-20`)*: Transitions the desktop sidebar from wide navigation (`w-72`) to an ultra-clean, space-maximizing icon rail (`w-20`). Menu items render centered icon blocks with native `title` tooltips; role status footer minimizes into a compact pulse indicator.
     - *Dropdown Retention*: Protected `expandedGroups` toggling with `useRef(activeTab)` so manual collapsing of the `textbook-group` dropdown is preserved without being overridden by render cycles.
   - **Canonical GDPT 2018 Pedagogical Standardization (`TextbookStandardView.jsx`, `textbookStateBridge.js`)**:
     - *Prefix Disambiguation (`cleanPrefix`)*: Strips redundant prefix labels (`Chương`, `Chủ đề`, `Bài`, `Dạng`) at display time, eliminating unsightly double numbering (e.g. `CHƯƠNG 4 \n Chương 2:...` and `BÀI 1 \n Bài 1:...`).
     - *Canonical GDPT 2018 Preset Engine*: Integrated comprehensive standard curriculum taxonomies (`PHYS_10`, `PHYS_11`, `PHYS_12`, `MATH_10`) with full chapter hierarchy, core lessons, characteristic KaTeX formulas, and 6-level Bloom pattern taxonomy.
     - *One-Click Standardization (`[📚 Chuẩn Hóa GDPT 2018]`)*: Allows academic managers to instantly align fragmented or contaminated test chunks with the authoritative GDPT 2018 standard structure.
     - *Automated KaTeX Formula Hydration*: Lessons with 0 formulas are automatically populated with characteristic formulas from the standard preset, and pattern codes are sequentially indexed (`P1, P2, P3...`).
   - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.20s with 3053 modules transformed and zero errors.


10. **Hierarchical Directory Tree View (Chương ▾ Bài Học ▾ Dạng Bài) & Comprehensive Pure Theory Pedagogical Workspace (`TextbookStandardView.jsx`, `textbookStateBridge.js`)**:
    - **Problem Addressed**:
      - The previous 3-column split layout (`Chương | Bài học | Chi tiết`) squandered horizontal real estate. The third column was restricted to 5/12 of the grid, which was consumed by KaTeX formula inputs and Bloom badges, leaving zero space for the actual textbook theory text, scientific principles, or definitions.
    - **2-Sided Pedagogical Layout Architecture**:
      - **Left Column (`lg:col-span-4`): 3-Tier Collapsible Tree Directory View**:
        - Unifies Chapter, Lesson, and Pattern into a nested collapsible folder tree (`Chương ▾ Bài học ▾ Dạng bài`).
        - *State Management*: `expandedChapters` and `expandedLessons` states control node toggles with smooth `ChevronDown`/`ChevronRight` icons.
        - *Interactive Inline Additions*: Provides dedicated quick action buttons:
          - `handleAddNewChapter`: Appends a new chapter node.
          - `handleAddNewLessonToChapter(cIdx)`: Adds a new lesson to the active chapter.
          - `handleAddNewPatternToLesson(cIdx, lIdx)`: Inserts a new Bloom pattern leaf into the active lesson.
        - *Active Node Pointer Synchronization*: Clicking any node updates `selectedChapterIdx`, `selectedLessonIdx`, and `selectedPatternIdx` with synchronized highlights.
      - **Right Column (`lg:col-span-8`): Pure Theory & Core Knowledge Pedagogical Workspace**:
        - Dedicates 8 full columns to reading, editing, and enriching the complete textbook theory of the active lesson.
        - *Canonical GDPT 2018 Theory Engine (`getDefaultLessonTheory`)*: Implemented in `textbookStateBridge.js` supplying rich, authoritative theory for Physics 10 lessons (Kinematics, Displacement, Velocity, Acceleration, d-t graphs, Projectile motion, Newton's 3 laws, Friction, Hooke's law, Work & Power, Kinetic/Potential energy, Mechanical energy conservation, Momentum & impulse) and default templates for other subjects.
        - *MathText Markdown & KaTeX Rendering*: Renders pure textbook theory with formatted headings, scientific laws, definitions, and inline/display math.
        - *Inline Theory Editor*: Includes `[✏️ Sửa Lý Thuyết]` and `[💾 Lưu Lý Thuyết]` modes enabling direct text modifications.
        - *AI Theory Enrichment*: `[✨ AI Bổ sung lý thuyết]` invokes `aiService.analyzePatternWithAi` to synthesize expanded conceptual theory, pedagogical problem-solving methods, and related formulas.
        - *Original Textbook Chunks Viewer*: When OCR chunks exist in Supabase (`currentLessonChunks`), renders original extracted textbook passages (`Trang X • Đoạn Y`) with high pedagogical fidelity.
        - *Formula Vault & Pattern Matrix*: Houses characteristic KaTeX formulas with one-click copy buttons and the 6-level Bloom pattern taxonomy.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.24s with 3053 modules transformed and zero errors.

26. **Streamlined Curriculum Header, Executive 4-Domain Selector & 100% Dynamic 3-Tier Pedagogical Node Architecture (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`)**:
    - **Architectural Motivation**:
      - The previous curriculum management view was weighed down by excessive marketing text, distracting 30-question diagnostic test banners, and awkward gray-box icon buttons.
      - Furthermore, domain nodes needed to render live data from Content Service without hardcoded mocks, organizing each node cleanly into 3 pedagogical layers (SGK Core Theory, Algorithmic Solution & Native JSXGraph Interactive Visualization, and Live Question Bank).
    - **Implementation Details**:
      - **Streamlined Hero Header**: Removed verbose descriptive paragraphs, MathLab popups, and artificial 1,200-point badges. Retained a crisp title and dynamic matched chapter/lesson counters.
      - **Ergonomic Collapsible Filter Bar**: Added an expandable/collapsible filter header (`isFilterCollapsed`) supporting multi-grade filtering (Grade 10, 11, 12) and 4-tier Bloom cognitive levels (L1 Recall, L2 Comprehension, L3 Application, L4 High Application).
      - **Executive 4-Domain Selector Redesign**:
        - Completely eliminated the artificial "General" (Tổng hợp) domain from both frontend and database.
        - Replaced clunky square icon boxes with executive card layouts featuring top gradient accent strips on active state, academic classification pills (`MIỀN 2 • ĐỊNH LƯỢNG`, `MIỀN 1 • NGÔN NGỮ`, etc.), Lucide iconography (`Calculator`, `Languages`, `FlaskConical`, `Landmark`), and live dynamic counts (`{chapCount} Chương • {lesCount} Bài học`).
      - **Unified 3-Tier Node Architecture (`UnifiedNodeDetailView.jsx`)**:
        - *Tier 1 (Core SGK Foundation)*: Renders pristine theory extracted from database materials, sanitizing OCR artifacts and preserving KaTeX.
        - *Tier 2 (Deep Problem Patterns & Native JSXGraph)*: Directly embeds interactive 2D/3D JSXGraph boards (`<InteractiveMathRenderer />`) inside the pattern card, enabling seamless parameter adjustments and 360-degree rotation.
        - *Tier 3 (Live Question Bank)*: Queries real database questions via `contentService.getQuestionsBySkill()`, supporting Bloom filtering and interactive solution reveals.
    - **Verification**: `npm run build` compiled cleanly in 3.16s with 3054 modules transformed and zero errors.

27. **Complete 139-Chapter CTST Official Textbook Scale-Up & 4-Column Executive Layout (`CurriculumExplorerView.jsx`)**:
    - **Architectural Motivation**:
      - Scale the curriculum frontend to seamlessly navigate and render the expanded 139-chapter database structure from the 17 official textbook URLs from `giaokhoaonline.com` (including Math 10-12 [26 chapters], Physics 10-12 [17 chapters], Chemistry 10-12 [21 chapters], Biology 10-12 [12 chapters], Literature 10-12 [27 chapters], English [6 chapters], History [9 chapters], Geography [12 chapters], Civics [9 chapters]).
    - **Implementation Details**:
      - Balanced 4-column executive card grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) without artificial "Tổng hợp" domain.
      - Dynamic real-time counter displaying matched chapters and lessons reflecting live database data.
      - Integrated ergonomic collapsible filter bar with Grade (10, 11, 12), Sub-subject, and Bloom L1-L4 cognitive level filters.
      - Unified 3-tier node detail view: SGK KaTeX Theory -> In-place Interactive JSXGraph/Solution Method -> Bloom-partitioned Live Assessment Bank.
    - **Verification**: Production build via `npm run build` passed in 5.91s with 3054 modules transformed and zero errors.

28. **Elimination of Generic Formulas & 100% Authentic KaTeX Rendering Support (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`)**:
    - **Architectural Motivation**:
      - Eradicate repeated generic formula strings (such as derivative/integral equations occurring generically across basic Grade 10 lessons) and ensure that every node displays authentic KaTeX theory, step-by-step algorithms, and contextualized assessment questions specific to that exact lesson.
    - **Implementation Details**:
      - Integrated with the backend Master Pedagogical Knowledge Base (`pedagogical_knowledge_base.py`).
      - Verified that Grade 10 Math (Propositions, Sets, Quadratic Functions, Vectors, Trigonometry in Triangle), Chemistry (Atomic structure, Periodic table, Chemical bonds), and Physics (Kinematics, Newton's laws, Momentum) render authentic formulas without generic placeholders.
      - Maintained zero-warning, error-free Vite production compilation.
    - **Verification**: Production build via `npm run build` passed in 4.68s with 3054 modules transformed and zero errors.

29. **All Toggles Closed by Default & Missing Source Data Fallback System (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`)**:
    - **Architectural Motivation**:
      - For pedagogical and managerial clarity, the curriculum browser should present a clean, un-cluttered initial state where all accordions and toggles start in the collapsed (closed) state.
      - Furthermore, in compliance with the strict zero-hardcode requirement, any node or pedagogical tier lacking ingested data must not show generic placeholder text, but rather an explicit, clean notice indicating that source data has not yet been ingested.
    - **Implementation Details**:
      - **Default Collapsed State Across All Toggles**:
        - Filter bar initialized collapsed (`isFilterCollapsed = true`).
        - All Chapters and Lessons in the left hierarchy tree start collapsed (`Boolean(expandedChapters[chapId])` and `Boolean(expandedLessons[lesId])`).
        - Domain switching (`initSelection`) resets expansion maps to empty objects `{}` and clears `selectedPattern` to null.
        - Expanding a chapter no longer forces automatic expansion of child lessons, giving full manual control to the user.
        - All 3 pedagogical tiers in `UnifiedNodeDetailView.jsx` initialize in the collapsed state (`isTheoryExpanded = false`, `isMethodExpanded = false`, `isQuestionsExpanded = false`).
      - **Explicit Missing Source Data Fallbacks**:
        - Chapter with zero lessons: Displays `"Chưa có dữ liệu nguồn bài học cho chương này"`.
        - Lesson with zero patterns: Displays `"Chưa có dữ liệu nguồn dạng bài cho bài học này"`.
        - Tier 1 (Theory): Displays `"Chưa có dữ liệu nguồn lý thuyết"` with an informative subtext when `synthesizedTheory` is empty.
        - Tier 2 (Method): Displays `"Chưa có dữ liệu nguồn phương pháp giải"` when `solutionMethod` is empty.
        - Tier 3 (Questions): Displays `"Chưa có dữ liệu nguồn câu hỏi cho dạng bài này"` when no questions exist for the pattern.
        - Pedagogical Note: Displays `"Chưa có dữ liệu nguồn lưu ý sư phạm cho dạng bài này"` when absent.
    - **Verification**: Production build via `npm run build` passed in 4.00s with 3054 modules transformed and zero errors.

30. **Elimination of Cross-Subject & Cross-Chapter Chunk Contamination, Strict Scoping & Quick Pattern Switcher (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `textbookStateBridge.js`)**:
    - **Architectural Motivation**:
      - In earlier revisions, `allIngestedChunks` merged chunks across all ingested books (Math, Chemistry, Physics) without subject or chapter isolation.
      - A loose fuzzy matcher (`isFuzzyLabelMatch`) allowed chunks from Chemistry (electron subshells), Math Chapter 2 (calculator instructions for quadratic inequalities), and Math Chapter 4 (coordinate geometry) to leak into Grade 10 Math Chapter 10 (Probability - Sample Space and Events), creating an agglomeration of 46 mixed chunks in Tier 1.
    - **Implementation Details**:
      - **4-Layer Scoping Hierarchy**:
        - `getMatchedChunksForChapter(chap)`: Enforces `detectSubjectFromContext` and `isSubjectCompatible` checks plus grade and chapter fuzzy matching.
        - `getMatchedChunksForLesson(les, parentChap)`: Requires the chunk to belong to the exact subject, grade, and chapter of the lesson.
        - `getMatchedChunksForPattern(pat, parentLesson, parentChapter)`: Restricts candidates strictly to the current subject, grade, chapter, and lesson before resolving pattern-specific chunks.
      - **Strict Fuzzy Matching Safeguards**:
        - Short labels (`minWords <= 2`) require a 100% word overlap. Longer labels require at least 60% overlap (`Math.ceil(minWords * 0.6)`), preventing spurious substring matches.
      - **Cross-Subject Safety Guard in `buildTheoryFromChunks`**:
        - Automatic domain keyword exclusion: Math theory strips chemistry keywords (electron, orbital, ester, halogen); Chemistry theory strips coordinate geometry and inequality calculator instructions.
      - **Quick Pattern Switcher in `UnifiedNodeDetailView.jsx`**:
        - Renders quick selection pills below the node title when `parentLesson.patterns.length > 1`, enabling seamless 1-click switching between patterns within the lesson.
    - **Verification**: Production build via `npm run build` passed in 3.06s with 3054 modules transformed and zero errors.




11. **Full-Width Textbook Master Header, Indented High-Contrast Hierarchy & Adaptive Multi-Page Parsed Chunks Dropdown (`TextbookStandardView.jsx`, `App.jsx`)**:
    - **Full-Width Top Master Header Card**:
      - Positioned globally across the entire view, spanning the combined width of both columns (`w-full` / `col-span-12`).
      - Aggregates all core metadata: Canonical Book Title, Source File Name, Approval Verification Badge (`ACCEPTED` vs `PENDING_REVIEW`), Edition, School Year, Total Extracted Pages, Chapter/Lesson/Pattern Counts, and Source Selector.
      - Includes direct controls for one-click GDPT 2018 canonical preset alignment, version lock/unlock, and inline metadata edits.
    - **Layered High-Contrast Chapter-Lesson Hierarchy (Left Column)**:
      - *Visual Distinction*: Chapter headers are boldly styled with high visual weight (`bg-slate-100`, `text-[13px] font-black`, dark emerald badges).
      - *Indentation & Separation*: Lessons are indented (`ml-3.5`), rendered in distinctly smaller typography (`text-[11px] font-semibold`), and wrapped in standalone bordered cards (`border border-slate-200/90`, active: `bg-emerald-50/90 border-2 border-emerald-500 shadow-xs ring-2 ring-emerald-100`).
      - Sub-patterns (Bloom L1–L6) are further indented with left border rules, ensuring a clear, readable nested directory tree.
    - **Streamlined Pedagogical Core Workspace & Label-Free AI Synthesis (Right Column)**:
      - *Clutter Elimination*: Completely removed redundant KaTeX formula input snippets and Bloom pattern matrices from the right-hand panel, as patterns are already cleanly managed within the left directory tree.
      - *Expansive Theory Space*: The Core Theory block (`activeTheoryContent`) now spans the primary vertical viewport (`min-h-[460px]`), providing an uninhibited reading and editing canvas with `MathText` markdown and KaTeX.
      - *Icon-Only AI Synthesis*: The AI theory expansion trigger has been streamlined into a pure icon button (`<Sparkles />`) with tooltip assistance, removing cluttered text labels.
    - **Adaptive 1-Page / 2-Page Parsed SGK Dropdown**:
      - Ingested OCR chunks are organized in a collapsible accordion dropdown below the primary theory canvas.
      - *Sidebar Responsive Pagination*:
        - When desktop sidebar is collapsed (`isSidebarCollapsed === true`): Displays a **2-page open-book spread** (`safeCurrentPage` and `safeCurrentPage + 1`), maximizing wide-screen reading utility.
        - When desktop sidebar is expanded (`isSidebarCollapsed === false`): Displays a single focused page (`safeCurrentPage`).
      - *Navigation Controls*: Embedded `<` and `>` arrow buttons, current page indicator, lesson scope vs full-book scope toggle, and instant jump-to-lesson controls.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.16s with 3053 modules transformed and zero errors.


12. **Zero-Mock Vector Chunks Theory Aggregation Engine (`buildTheoryFromChunks`, `getChunksForLesson`)**:
    - **Problem Addressed**:
      - When real textbooks (such as Chemistry 10 with 53 Vector Chunks) were loaded from Supabase, a generic fallback template in `getDefaultLessonTheory` inadvertently superseded the real OCR chunks, causing the application to display placeholder text instead of authentic textbook theory.
    - **Zero-Mock Solution Architecture**:
      - *Generic Template Elimination*: Purged all generic placeholder strings from `getDefaultLessonTheory`.
      - *Dynamic Theory Synthesis (`buildTheoryFromChunks`)*: Aggregates real vector chunks from Supabase PostgreSQL (`v_eval_ai."KnowledgeVectorChunks"`), sorts them sequentially by page and chunk index, inserts clear page markers (`#### 📄 Trang X (SGK Gốc)`), and renders authentic definitions, reactions, laws, and figures.
      - *Lesson-Scoped Matching (`getChunksForLesson`)*: Intelligently associates chunks with lessons using normalized title matching (`cleanPrefix`) with page boundary fallbacks.
      - *DTO Property Alignment*: Supported both `chunk.text` (primary C# backend property from `TextbookChunkDto`) and `chunk.content` for robust rendering across all viewers.
      - *Robust Prefix Cleaning*: Enhanced `cleanPrefix` to preserve numbered multi-unit lists (e.g. `Chuyên đề 4, 5, 6...`) and strip dangling delimiters.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.25s with 3053 modules transformed and zero errors.


13. **Distilled Core Theory Synthesis, Unconstrained Table of Contents & Textbook Deletion Lifecycle (`buildTheoryFromChunks`, `TextbookStandardView.jsx`, `TextbookEndpoints.cs`, `TextbookRepository.cs`)**:
    - **Distilled Pure Theory Synthesis (`buildTheoryFromChunks`)**:
      - *Page Marker Elimination*: Completely purged raw OCR page stamps (`#### 📄 Trang X (SGK Gốc)`) and exercise noise (`Bài 1.`, `Câu 1:`) from the theoretical synthesis.
      - *4-Tier Pedagogical Structure*: Systematically synthesizes chunks into 4 structured sections:
        1. Khái Niệm & Định Nghĩa Trọng Tâm (Definitions, core scientific laws, principles)
        2. Công Thức & Phương Trình Đặc Trưng (KaTeX equations and chemical reactions)
        3. Phân Loại Dạng Bài & Trọng Tâm Vận Dụng (Pedagogical problem types and methods)
        4. Lưu Ý Sư Phạm & Bẫy Tư Duy (Common pitfalls and pedagogical cautions)
      - *De-duplication & Refinement*: Utilizes `seenSentences` to deduplicate repetitive sentences and ensure a concise, dense knowledge base.
    - **Unconstrained Table of Contents & Doubled Theory Canvas (`TextbookStandardView.jsx`)**:
      - *Full-Length TOC*: Removed artificial `max-h-[75vh]` constraints, allowing the directory tree to naturally expand to the full length of the chapters list.
      - *Doubled Reading Viewport*: Expanded the Core Theory viewport to `min-h-[920px]` and `max-h-[140vh]` with refined `text-[12px] leading-relaxed` typography for immersive reading.
    - **Textbook Deletion Lifecycle (`DeleteSourceAsync` & `deleteTextbookSource`)**:
      - *Backend Cascade*: Added `DELETE /api/ai-engine/textbooks/sources/{sourceId}` calling `ITextbookRepository.DeleteSourceAsync`. Deletes vector chunks from `v_eval_ai."KnowledgeVectorChunks"` and source metadata from `v_eval_ai."KnowledgeSources"` in a single transactional operation.
      - *Frontend Integration*: Added `aiService.deleteTextbookSource(sourceId)` and a prominent `[🗑️ Xóa sách]` button with safety confirmation in the top master card.
    - **Disabled Top Header Navigation Buttons**:
      - Disabled `[Sang Trang Nạp SGK]` and `[Mở Studio Biên Soạn]` with `disabled` and `opacity-50 cursor-not-allowed` attributes to enforce decoupled navigation via the dedicated Sidebar dropdown.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.26s with 3053 modules transformed and zero errors.


14. **JSX Raw LaTeX Interpolation Safeguard in Textbook Ingestion (`TextbookIngestView.jsx`)**:
    - **Issue Root Cause**:
      - Inside `TextbookIngestView.jsx` (Part 2: Worked Examples), raw LaTeX string `90\text{ m}` was placed unescaped directly in JSX text. React's JSX parser evaluated `{ m}` as a JavaScript expression referencing variable `m`, which was not declared in the component scope, triggering a runtime `ReferenceError: m is not defined`.
    - **Remediation**:
      - Wrapped worked example equations in `<MathText text="$s = v \times t = 15 \times 6 = 90\text{ m}$." />`.
      - Ensured mathematical notation is processed via the KaTeX rendering pipeline without raw JSX variable interpolation hazards.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.31s with 3053 modules transformed and zero errors.


15. **Full-Pipeline Taxonomy Leakage Purge, Publishing Metadata Exclusion & KaTeX Geometry Normalization (`CurriculumTaxonomyRegistry.cs`, `CurriculumAiService.cs`, `PdfPigTextbookParserService.cs`, `textbookStateBridge.js`)**:
    - **Taxonomy Tag Leakage Prevention**:
      - Replaced single-match regex elimination with comprehensive `Regex.Matches` iteration and `Regex.Replace` stripping all `[TAXONOMY: ...]` occurrences across chunk content in `CurriculumTaxonomyRegistry.cs`.
      - Reinforced frontend defense in `textbookStateBridge.js` to strip any lingering `[TAXONOMY: ...]` tags from legacy database records.
    - **Publishing & Copyright Metadata Exclusion**:
      - Added regex pattern detection for publication metadata lines (`Tên sách:`, `Bộ sách:`, `Tổng chủ biên:`, `Chủ biên:`, `Nhà xuất bản:`, etc.).
      - Automatically classifies publishing and preface pages as `section="COVER"` to permanently prevent publication details from leaking into lesson theory and pattern groupings.
    - **KaTeX Geometry & Vector Formula Formatting**:
      - Restored fragmented newline breaks separating geometric points, vector labels, and magnitude bars (`\vec{AB}`, `|\vec{AB}| = AB`).
      - Segregated worked examples and detailed step-by-step solutions from the core theoretical concepts section, maintaining high pedagogical density.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.22s with 3053 modules transformed and zero errors.


16. **JavaScript Regular Expression Compliance Safeguard in Textbook State Bridge (`textbookStateBridge.js`)**:
    - **Issue Root Cause**:
      - PCRE/.NET inline flag `(?i)` was introduced into a client-side JavaScript regular expression (`/(?i)(?<!\\)... /gi`). V8 and JavaScript RegExp engines do not support inline PCRE flags, throwing a fatal `SyntaxError: Invalid regular expression: ... Invalid group` that crashed script execution and caused a blank white screen.
    - **Remediation**:
      - Converted all regex patterns in `textbookStateBridge.js` to standard ECMAScript regular expression syntax using trailing `/gi` flags.
      - Implemented safe callback replacement functions `(match, p1) => ...` paired with negative lookaheads `(?![a-zA-Zà-ỹ])` to preserve Vietnamese diacritics.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.22s with 3053 modules transformed and zero errors.


17. **Pedagogical Integrity & Domain Alignment Engine (`TextbookStandardView.jsx`, `TextbookIngestView.jsx`, `textbookStateBridge.js`)**:
    - **Generic Boilerplate Template Eradication**:
      - Constructed and exported `isGenericPlaceholder` to identify and purge generic bullet points (`Nội dung định nghĩa cốt lõi của bài học...`, `Các đại lượng vật lí / toán học / hóa học đo lường...`, `Các sai sót thường gặp...`).
      - In `buildTheoryFromChunks` and `activeTheoryContent`, all matching placeholder paragraphs are discarded, prioritizing authentic vector chunks or rich GDPT 2018 curriculum definitions.
    - **Multi-Subject GDPT 2018 Preset Expansion**:
      - Expanded `GDPT_PRESETS` beyond Physics to include complete curricula for Chemistry 10, 11, 12 (`CHEM_10`, `CHEM_11`, `CHEM_12`), Mathematics 10, 11, 12 (`MATH_10`, `MATH_11`, `MATH_12`), and Biology 10 (`BIO_10`).
      - Updated `getDefaultLessonTheory` with rigorous, authentic domain knowledge for Chemistry (oxidation-reduction, electron balance, standard enthalpy `\Delta_r H^\circ_{298}`, halogen properties, atomic structure, and chemical bonding).
      - Enhanced `getGdptPreset` to dynamically normalize and resolve subject codes, preventing Chemistry textbooks from falling back to Physics.
    - **Automated Subject & Grade Ingestion Detection**:
      - Added smart file metadata and name inspection in `handleSelectSource` (matching `HÓA`, `TOÁN`, `VẬT LÍ`, `SINH`, `10`, `11`, `12`), automatically synchronizing `skeleton.subjectCode`, `skeleton.subjectName`, and `skeleton.grade`.
    - **Ascending Chapter Sequence Normalization**:
      - Enforced page-ordered chapter sorting `rawChapters.sort((a, b) => a.pageStart - b.pageStart)` and sequential renumbering `chapterNumber = idx + 1`, eliminating disordered and fractured chapter listings.
    - **Complex Title Prefix Sanitization**:
      - Upgraded `cleanPrefix` with comprehensive regex stripping multi-chapter/composite titles (e.g. `Chương 5, 6, 7 & 8: Pin điện - Điện phân...` -> `Pin điện - Điện phân, Đại cương Kim loại, Nhóm IA-IIA & Phức chất`), resolving broken prefixes like `C.3 , 6, 7 & 8:`.
    - **Non-Pedagogical Exclusion Defense in Bloom Taxonomy**:
      - Hardened `isNonPedagogical` filters across all view components, preventing cover pages, blank pages, and N/A placeholders from ever being registered as pedagogical lessons or Bloom taxonomy problem types.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.15s with 3053 modules transformed and zero errors.


18. **Unified Hierarchical Pedagogical Tree Synchronization in Textbook Ingestion (`TextbookIngestView.jsx`)**:
    - **Architectural Motivation & Parity**:
      - Previously, `TextbookIngestView.jsx` rendered a decoupled two-tier flat box layout (separate scrollable boxes for Chapters and Lessons, with no pattern-level visibility), creating a disjointed user experience compared to the standard 3-tier view (`TextbookStandardView.jsx`).
      - In addition, because patterns were omitted from the tree, users were unable to select specific pedagogical patterns (`activePattern`), preventing direct interaction with Part 3 ("⚡ AI Sinh Câu Hỏi Mới").
    - **Implementation Details**:
      - **3-Tier Hierarchical Tree Accordion**: Refactored the left column (`lg:col-span-4`) to mirror `TextbookStandardView.jsx`:
        - **Level 1 (Chapters)**: Chapter header with `C.X` badge, sanitization via `cleanPrefix(ch.title, 'chapter')`, lesson and pattern counters, page range (`Tr.X–Y`), and expandable `ChevronDown`/`ChevronRight` toggles.
        - **Level 2 (Lessons)**: Indented (`ml-3.5`) lesson row with `B.X` badge, `cleanPrefix(les.title, 'lesson')`, status indicators (`✓` / `⏳`), and collapsible sub-tree.
        - **Level 3 (Patterns)**: Deep-indented (`ml-5`) pattern element with `Target` icon, `Dạng X: {cleanPrefix(pat.name, 'pattern')}`, and Bloom taxonomy level badge (`L1`–`L6`).
      - **Interactive Pattern Selection**: Clicking any pattern item directly sets `selectedChapterIdx`, `selectedLessonIdx`, and `selectedPatternIdx`, unlocking seamless question generation and exercise validation in Part 3.
      - **Inline Node Management**: Integrated `handleAddNewChapter`, `handleAddNewLessonToChapter`, and `handleAddNewPatternToLesson` with state variables `expandedChapters` and `expandedLessons` for dynamic manual curriculum editing.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.67s with 3053 modules transformed and zero errors.


19. **Batch Exercise Generation Pipeline for Multi-Pattern & Full-Book Curriculum (`TextbookIngestView.jsx`)**:
    - **Architectural Motivation**:
      - Previously, question synthesis was limited to a single pattern invocation (`handleGenerateExercises`), requiring academic directors and teachers to manually select and trigger generation for dozens of patterns across multiple lessons individually.
    - **Implementation Details**:
      - **Multi-Scope Generation Engine**:
        - *Single Pattern Scope*: Targeted 3-exercise generation for the currently active pattern.
        - *Lesson-Level Batch Scope (`handleGenerateExercisesForCurrentLesson`)*: Sequentially iterates through all valid patterns of the active lesson, invoking the Gemini generation pipeline with rate-limiting pacing (400ms inter-task jitter) and safe state updates.
        - *Full-Book Batch Scope (`handleGenerateExercisesForAllPatternsInBook`)*: Flattens all pedagogical patterns across all chapters and lessons into a task queue, displaying an explicit confirmation prompt before triggering batch execution.
        - *Direct Tree Trigger (`handleGenerateForSpecificLesson`)*: Added a lightning trigger button (`Zap`) directly on each lesson node within the navigation tree, enabling one-click generation without navigating away.
      - **Safe Immutable State Projection (`updatePatternAt`)**:
        - Developed a location-indexed state updater targeting `(cIdx, lIdx, pIdx)` coordinates directly in `skeleton.chapters`, decoupling generation writes from the currently selected UI active pattern state.
      - **Real-Time Visual Progress Telemetry & Abort Controller**:
        - Engineered an animated progress telemetry banner displaying execution percentage, pattern index (`Dạng X / Y`), current target name, and a visual progress bar.
        - Integrated an abort mechanism (`cancelBatchRef`) allowing users to gracefully interrupt long-running batch sequences while preserving all successfully generated exercises.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.63s with 3053 modules transformed and zero errors.


20. **In-App Confirmation Modal Dialog & Strict Append-Only Exercise Synthesis Safeguard (`TextbookIngestView.jsx`)**:
    - **Architectural Motivation**:
      - Browser-native blocking dialogs (`window.confirm`, `window.alert`) introduce disruptive browser UI friction, freeze JavaScript event loops, and fail to provide pedagogical context.
      - Furthermore, educators require strict guarantees that automated batch question synthesis acts purely as an additive enrichment operation, preventing accidental loss or mutation of existing vetted questions.
    - **Implementation Details**:
      - **In-App Confirmation Modal (`confirmModal`)**:
        - Completely eliminated native browser alert and confirm calls in favor of an accessible Tailwind CSS modal overlay with backdrop blur.
        - Provides rich telemetry before execution: target scope (book or lesson), valid pattern count, and projected question additions (`+3 questions per pattern`).
        - Integrates an explicit pedagogical commitment badge assuring users of zero data overwriting.
      - **Strict Append-Only Immutable State Writes**:
        - Guaranteed that all synthesis paths (`handleGenerateExercises`, `executeBatchLesson`, `executeBatchBook`) append new questions onto existing arrays: `exercises: [...existing, ...mappedNew]`.
        - Generates cryptographically collision-resistant unique identifiers (`id: ex_${Date.now()}_${random}_${index}`) for every synthesized question, preventing React key clashing and state mutation hazards.
        - Toast notifications dynamically aggregate cumulative counts (e.g., `Added 3 new questions (Total: 6 questions)`).
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.32s with 3053 modules transformed and zero errors.


21. **Dynamic Bloom Taxonomy & Pedagogical Pattern Diversification Pipeline (`TextbookIngestView.jsx`, `TextbookStandardView.jsx`)**:
    - **Architectural Motivation**:
      - OCR and vector chunk ingestion previously labeled chunks with single generic pattern names (e.g., `"Dạng 1: Kiến thức & Kỹ năng trọng tâm"`), defaulted to Bloom level 2 (Comprehension). When ingested into the frontend, lessons were restricted to a single pattern, causing pedagogical monotony.
    - **Implementation Details**:
      - **Automatic GDPT 2018 Pattern Enrichment**:
        - When loaded textbook chunks only yield `<= 1` generic pattern, `handleSelectSource` in `TextbookIngestView.jsx` and the chunk mapper in `TextbookStandardView.jsx` automatically query `getGdptPreset` to enrich the lesson with 2–4 authentic pedagogical patterns spanning multiple cognitive levels (L1 Remembering, L2 Understanding, L3 Applying, L4 Analyzing).
      - **Interactive Bloom Level Selectors**:
        - *Navigation Tree Switcher*: Made the Bloom level badge (`L{pat.bloomLevel || 2} ▾`) interactive with single-click cycle progression (L1 -> L2 -> L3 -> L4 -> L5 -> L6) and real-time color badge mutation.
        - *Part 3 Exercise Pill Bar*: Embedded a 6-tier Bloom level pill bar above the question list in Part 3, allowing teachers to fine-tune the target cognitive demand prior to synthesis.
        - *Progressive New Pattern Defaults*: Updated `handleAddNewPatternToLesson` to assign progressive Bloom levels (`Math.min(4, Math.max(1, nextNum))`).
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly with 3053 modules transformed and zero errors.


22. **Global Command Bar, Prominent Full-Book Save & Persistent Auto-Save Architecture (`TextbookIngestView.jsx`)**:
    - **Architectural Motivation**:
      - Previously, global actions (such as saving the entire textbook curriculum or initiating batch question generation across all chapters) were either missing or buried within sub-panels and individual lesson tabs. Users had no centralized top-level control bar and experienced uncertainty about whether newly synthesized questions were persisted.
    - **Implementation Details**:
      - **Top-Level Global Command Bar**:
        - Positioned a dedicated command banner directly above the 3-stage mode switcher (Phần 1: Cấu trúc / Phần 2: Lý thuyết / Phần 3: Câu hỏi).
        - Houses book-wide controls: **`[Lưu Toàn Bộ SGK]`** (emerald button with Save icon), **`[Sinh Cho Toàn Bộ Sách]`** (indigo button with Sparkles icon), and an active auto-save telemetry badge with pulse indicator (`Đã lưu lúc HH:mm:ss`).
        - Displays live pedagogical telemetry across the entire book: Chapter count, Lesson count, Pattern count, and synthesized Question count.
      - **Zero-Loss Persistent Auto-Save Pipeline**:
        - Automatically serializes curriculum state, generated questions, and cognitive levels into `localStorage` (`veval_textbook_saved_${sourceId}`) upon exercise synthesis or pattern modifications.
        - Restores all previously generated exercises, custom Bloom taxonomy levels, and manual patterns upon re-selecting a textbook or refreshing the page (`Auto-Restore`).
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.28s with 3053 modules transformed and zero errors.


23. **Streamlined Lesson Question Synthesis Header & Binary Scope Selector (`TextbookIngestView.jsx`)**:
    - **Architectural Motivation**:
      - The Part 3 question synthesis header previously presented three separate multi-emoji buttons (`✨ ⚡ Sinh Cho Dạng Này`, `⚡ ⚡ ⚡ Sinh Toàn Bộ Dạng Trong Bài`, `✨ 🌟 Sinh Toàn Bộ Sách`), causing visual clutter, redundant emojis, and conceptual overlap between local lesson scope and book-level scope.
    - **Implementation Details**:
      - **Local vs Global Scope Segregation**:
        - Completely removed the book-wide synthesis trigger from the Part 3 lesson header, ensuring Part 3 remains 100% focused on lesson-level interactions.
      - **Binary Scope Segmented Control**:
        - Added a compact scope selector labelled `Sinh câu hỏi:`, allowing educators to toggle seamlessly between:
          1. `Dạng này`: Targets the currently selected pattern (`activePattern`).
          2. `Cả bài học ({count})`: Targets all valid pedagogical patterns within the active lesson.
      - **Unified Single Synthesis Button**:
        - Replaced three disparate trigger buttons with a single unified action button `[Sinh câu hỏi]`, maintaining dynamic loading feedback (`Đang sinh...`) and disabling when prerequisites are missing.
      - **Iconography Sanitization**:
        - Purged all raw emoji characters (`⚡`, `🌟`), adhering to consistent Lucide icon standards (`Sparkles`, `RefreshCw`).
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 2.24s with 3053 modules transformed and zero errors.


24. **Collapsible Table of Contents, 3/5 Theory Box Optimization & Integrated Question Bank Viewer Keyed by Database Source ID (`TextbookStandardView.jsx`, `TextbookIngestView.jsx`)**:
    - **Architectural Motivation**:
      - In the standardized textbook viewer (`TextbookStandardView.jsx`), the left navigation tree was statically pinned to a 4/12 grid column without collapse capability, limiting horizontal canvas space on standard screens.
      - The core theory view container previously occupied excessive vertical height (`min-h-[920px] max-h-[140vh]`), completely pushing lower sections off-screen.
      - Furthermore, synthesized pedagogical exercises created in the Ingestion Studio (`TextbookIngestView.jsx`) were isolated from the Standard Viewer, leaving teachers unable to review existing question banks within the primary reading view.
    - **Implementation Details**:
      - **Collapsible Table of Contents (TOC) with Dynamic Grid Rebalancing**:
        - Integrated `isTocCollapsed` reactive state toggled via `ChevronLeft` in the TOC header and `ChevronRight` in the collapsed strip.
        - When collapsed, the TOC shrinks into a slim vertical spine (`lg:col-span-1`) with a vertical label (`Mục Lục SGK`), while the right content canvas expands from `lg:col-span-8` to `lg:col-span-11`.
        - The right lesson header features a quick-action `[Mục lục]` button with `ChevronRight` for frictionless one-click TOC expansion.
        - Synchronized OCR page rendering: When either the TOC or main application sidebar is collapsed (`isSidebarCollapsed || isTocCollapsed`), the OCR page viewer automatically switches to side-by-side dual-page view (`pageSize = 2`).
      - **Calibrated 3/5 Theory Box Dimensioning**:
        - Scaled the theory container from `min-h-[920px]` down to ~3/5 proportions (`min-h-[380px] max-h-[550px] overflow-y-auto`), accompanied by an inline edit textarea adjustment (`rows={10}`).
        - Ensures balanced pedagogical ergonomics, presenting lesson theory without dominating the entire viewport.
      - **Embedded Question & Exercise Bank Viewer**:
        - Rendered directly beneath the theory box: displays real-time question counts, lesson identification, and Bloom Taxonomy (L1–L6) badge categorization.
        - Includes dual-scope filtering (`Cả bài ({count})` vs `Dạng bài ({count})`) and quick-access cognitive level filtering tabs (L1 Remembering through L6 Creating).
        - Detailed question cards feature KaTeX math stems via `<MathText />`, multiple-choice options A/B/C/D with correct answers highlighted in emerald with `CheckCircle2` badges, and expandable step-by-step solution guides with `Lightbulb` indicators.
        - Unpopulated lessons render an empty-state banner with a direct navigational CTA to the Ingestion Studio (`onNavigateTab('ingest')`).
      - **Database Source ID (`sourceId`) Question Synchronization**:
        - Unified caching and persistence through database Supabase `sourceId` (`veval_textbook_saved_${sourceId}`).
        - `TextbookStandardView.jsx` reads `cachedData` upon source selection, maps `savedPatternData`, and populates `pat.exercises` across all patterns.
        - `TextbookIngestView.jsx` persists simultaneously to both `sourceId` and `fileName` keys in `saveToStorage`.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.35s with 3053 modules transformed and zero errors.


25. **Universal Storage Bridge, Stale Closure Elimination & Reactive Two-Way Question Bank Synchronization (`textbookStateBridge.js`, `TextbookIngestView.jsx`, `TextbookStandardView.jsx`)**:
    - **Architectural Motivation**:
      - Educators reported that synthesized questions were occasionally lost or not appearing across views.
      - Deep root-cause analysis uncovered three subtle concurrency and state management bugs in React:
        1. *Stale Closure State Overwrites*: In `TextbookIngestView.jsx`, `saveToStorage(currSkeleton = skeleton)` evaluated the default parameter within asynchronous loops (`executeBatchLesson`, `executeBatchBook`, or `setTimeout`), binding to the stale initial skeleton from the component mount closure and overwriting updated questions with empty arrays in `localStorage`.
        2. *Array Index Mismatch*: Left-hand TOC filtered out non-pedagogical chapters into `validChapters`. Using filtered indices (`cIdx`, `lIdx`) directly on raw `prev.chapters[cIdx]` resulted in dropped or mismatched updates.
        3. *Uninitialized Storage on Mount*: `TextbookStandardView.jsx` initialized state with static `preset.chapters || []`, ignoring previously saved questions until a manual source re-selection occurred.
    - **Implementation Details**:
      - **Universal Storage Bridge Module (`textbookStateBridge.js`)**:
        - `getSavedTextbookData(sourceId, fileName)`: Multi-tier fallback resolution checking `sourceId`, `fileName`, and default storage keys across both `localStorage` and `sessionStorage`.
        - `saveTextbookData({ sourceId, fileName, skeleton, textbookExercises })`: Multi-key transactional persistence with dispatch of custom window event `veval:textbook-saved`.
        - `mergeSavedExercisesIntoChapters(targetChapters, savedData)`: Deep chapter-lesson-pattern merger deduplicating questions by ID and text stem, preventing regressions when reloading chunks.
      - **Stale Closure Elimination via Mutable Refs**:
        - Integrated `skeletonRef = useRef(skeleton)` synchronized via `useEffect`. All async handlers pass explicit updated state or read `skeletonRef.current`.
      - **Title-Based Resilient Pattern Updating**:
        - Introduced `updatePatternByName(chapterTitle, lessonTitle, patternName, updater)` replacing fragile array index lookups with deterministic title and name matching.
      - **Pre-Populated GDPT 2018 Exemplar Question Banks**:
        - Populated high-quality sample questions with KaTeX formulas, four multiple-choice options, correct index markers, and step-by-step pedagogical explanations directly into `GDPT_PRESETS['PHYS_10']` for Bài 1 and Bài 2.
      - **Reactive Cross-View Synchronization**:
        - Added listeners for `veval:textbook-saved` event across both views, ensuring that generating exercises in the Ingest View reflects instantly in the Standard View in real time.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.24s with 3053 modules transformed and zero errors.

26. **Streamlined Curriculum Header, Executive 4-Domain Selector & 100% Dynamic 3-Tier Pedagogical Node Architecture (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`)**:
    - **Architectural Motivation**:
      - The previous curriculum management view was weighed down by excessive marketing text, distracting 30-question diagnostic test banners, and awkward gray-box icon buttons.
      - Furthermore, domain nodes needed to render live data from Content Service without hardcoded mocks, organizing each node cleanly into 3 pedagogical layers (SGK Core Theory, Algorithmic Solution & Native JSXGraph Interactive Visualization, and Live Question Bank).
    - **Implementation Details**:
      - **Streamlined Hero Header**: Removed verbose descriptive paragraphs, MathLab popups, and artificial 1,200-point badges. Retained a crisp title and dynamic matched chapter/lesson counters.
      - **Ergonomic Collapsible Filter Bar**: Added an expandable/collapsible filter header (`isFilterCollapsed`) supporting multi-grade filtering (Grade 10, 11, 12) and 4-tier Bloom cognitive levels (L1 Recall, L2 Comprehension, L3 Application, L4 High Application).
      - **Executive 4-Domain Selector Redesign**:
        - Completely eliminated the artificial "General" (Tổng hợp) domain from both frontend and database.
        - Replaced clunky square icon boxes with executive card layouts featuring top gradient accent strips on active state, academic classification pills (`MIỀN 2 • ĐỊNH LƯỢNG`, `MIỀN 1 • NGÔN NGỮ`, etc.), Lucide iconography (`Calculator`, `Languages`, `FlaskConical`, `Landmark`), and live dynamic counts (`{chapCount} Chương • {lesCount} Bài học`).
      - **Unified 3-Tier Node Architecture (`UnifiedNodeDetailView.jsx`)**:
        - *Tier 1 (Core SGK Foundation)*: Renders pristine theory extracted from database materials, sanitizing OCR artifacts and preserving KaTeX.
        - *Tier 2 (Deep Problem Patterns & Native JSXGraph)*: Directly embeds interactive 2D/3D JSXGraph boards (`<InteractiveMathRenderer />`) inside the pattern card, enabling seamless parameter adjustments and 360-degree rotation.
        - *Tier 3 (Live Question Bank)*: Queries real database questions via `contentService.getQuestionsBySkill()`, supporting Bloom filtering and interactive solution reveals.
    - **Verification**: `npm run build` compiled cleanly in 3.16s with 3054 modules transformed and zero errors.

27. **Complete 139-Chapter CTST Official Textbook Scale-Up & 4-Column Executive Layout (`CurriculumExplorerView.jsx`)**:
    - **Architectural Motivation**:
      - Scale the curriculum frontend to seamlessly navigate and render the expanded 139-chapter database structure from the 17 official textbook URLs from `giaokhoaonline.com` (including Math 10-12 [26 chapters], Physics 10-12 [17 chapters], Chemistry 10-12 [21 chapters], Biology 10-12 [12 chapters], Literature 10-12 [27 chapters], English [6 chapters], History [9 chapters], Geography [12 chapters], Civics [9 chapters]).
    - **Implementation Details**:
      - Balanced 4-column executive card grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) without artificial "Tổng hợp" domain.
      - Dynamic real-time counter displaying matched chapters and lessons reflecting live database data.
      - Integrated ergonomic collapsible filter bar with Grade (10, 11, 12), Sub-subject, and Bloom L1-L4 cognitive level filters.
      - Unified 3-tier node detail view: SGK KaTeX Theory -> In-place Interactive JSXGraph/Solution Method -> Bloom-partitioned Live Assessment Bank.
    - **Verification**: Production build via `npm run build` passed in 5.91s with 3054 modules transformed and zero errors.

28. **Elimination of Generic Formulas & 100% Authentic KaTeX Rendering Support (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`)**:
    - **Architectural Motivation**:
      - Eradicate repeated generic formula strings (such as derivative/integral equations occurring generically across basic Grade 10 lessons) and ensure that every node displays authentic KaTeX theory, step-by-step algorithms, and contextualized assessment questions specific to that exact lesson.
    - **Implementation Details**:
      - Integrated with the backend Master Pedagogical Knowledge Base (`pedagogical_knowledge_base.py`).
      - Verified that Grade 10 Math (Propositions, Sets, Quadratic Functions, Vectors, Trigonometry in Triangle), Chemistry (Atomic structure, Periodic table, Chemical bonds), and Physics (Kinematics, Newton's laws, Momentum) render authentic formulas without generic placeholders.
      - Maintained zero-warning, error-free Vite production compilation.
    - **Verification**: Production build via `npm run build` passed in 4.68s with 3054 modules transformed and zero errors.

29. **All Toggles Closed by Default & Missing Source Data Fallback System (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`)**:
    - **Architectural Motivation**:
      - For pedagogical and managerial clarity, the curriculum browser should present a clean, un-cluttered initial state where all accordions and toggles start in the collapsed (closed) state.
      - Furthermore, in compliance with the strict zero-hardcode requirement, any node or pedagogical tier lacking ingested data must not show generic placeholder text, but rather an explicit, clean notice indicating that source data has not yet been ingested.
    - **Implementation Details**:
      - **Default Collapsed State Across All Toggles**:
        - Filter bar initialized collapsed (`isFilterCollapsed = true`).
        - All Chapters and Lessons in the left hierarchy tree start collapsed (`Boolean(expandedChapters[chapId])` and `Boolean(expandedLessons[lesId])`).
        - Domain switching (`initSelection`) resets expansion maps to empty objects `{}` and clears `selectedPattern` to null.
        - Expanding a chapter no longer forces automatic expansion of child lessons, giving full manual control to the user.
        - All 3 pedagogical tiers in `UnifiedNodeDetailView.jsx` initialize in the collapsed state (`isTheoryExpanded = false`, `isMethodExpanded = false`, `isQuestionsExpanded = false`).
      - **Explicit Missing Source Data Fallbacks**:
        - Chapter with zero lessons: Displays `"Chưa có dữ liệu nguồn bài học cho chương này"`.
        - Lesson with zero patterns: Displays `"Chưa có dữ liệu nguồn dạng bài cho bài học này"`.
        - Tier 1 (Theory): Displays `"Chưa có dữ liệu nguồn lý thuyết"` with an informative subtext when `synthesizedTheory` is empty.
        - Tier 2 (Method): Displays `"Chưa có dữ liệu nguồn phương pháp giải"` when `solutionMethod` is empty.
        - Tier 3 (Questions): Displays `"Chưa có dữ liệu nguồn câu hỏi cho dạng bài này"` when no questions exist for the pattern.
        - Pedagogical Note: Displays `"Chưa có dữ liệu nguồn lưu ý sư phạm cho dạng bài này"` when absent.
    - **Verification**: Production build via `npm run build` passed in 4.00s with 3054 modules transformed and zero errors.

30. **Elimination of Cross-Subject & Cross-Chapter Chunk Contamination, Strict Scoping & Quick Pattern Switcher (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `textbookStateBridge.js`)**:
    - **Architectural Motivation**:
      - In earlier revisions, `allIngestedChunks` merged chunks across all ingested books (Math, Chemistry, Physics) without subject or chapter isolation.
      - A loose fuzzy matcher (`isFuzzyLabelMatch`) allowed chunks from Chemistry (electron subshells), Math Chapter 2 (calculator instructions for quadratic inequalities), and Math Chapter 4 (coordinate geometry) to leak into Grade 10 Math Chapter 10 (Probability - Sample Space and Events), creating an agglomeration of 46 mixed chunks in Tier 1.
    - **Implementation Details**:
      - **4-Layer Scoping Hierarchy**:
        - `getMatchedChunksForChapter(chap)`: Enforces `detectSubjectFromContext` and `isSubjectCompatible` checks plus grade and chapter fuzzy matching.
        - `getMatchedChunksForLesson(les, parentChap)`: Requires the chunk to belong to the exact subject, grade, and chapter of the lesson.
        - `getMatchedChunksForPattern(pat, parentLesson, parentChapter)`: Restricts candidates strictly to the current subject, grade, chapter, and lesson before resolving pattern-specific chunks.
      - **Strict Fuzzy Matching Safeguards**:
        - Short labels (`minWords <= 2`) require a 100% word overlap. Longer labels require at least 60% overlap (`Math.ceil(minWords * 0.6)`), preventing spurious substring matches.
      - **Cross-Subject Safety Guard in `buildTheoryFromChunks`**:
        - Automatic domain keyword exclusion: Math theory strips chemistry keywords (electron, orbital, ester, halogen); Chemistry theory strips coordinate geometry and inequality calculator instructions.
      - **Quick Pattern Switcher in `UnifiedNodeDetailView.jsx`**:
        - Renders quick selection pills below the node title when `parentLesson.patterns.length > 1`, enabling seamless 1-click switching between patterns within the lesson.
    - **Verification**: Production build via `npm run build` passed in 3.06s with 3054 modules transformed and zero errors.

31. **Textbook Theory Restoration, Placeholder Stub Filtering, Vietnamese Diacritic Normalization & Persistent Theory Preservation (`TextbookIngestView.jsx`, `TextbookStandardView.jsx`, `UnifiedNodeDetailView.jsx`, `textbookStateBridge.js`)**:
    - **Architectural Root Cause Remediation**:
      - In revision `79d97fe`, `activePatternTheory` fell back to `activePattern.description` and took precedence over `activeTheoryContent` (the full lesson theory synthesized from database Vector Chunks). Because taxonomy skeleton patterns and DB-loaded patterns carried short boilerplate descriptions (such as `"Mục tiêu nhận thức và kỹ năng áp dụng cho ..."` or `"Dạng bài bóc tách từ SGK."`), `displayedTheoryContent` completely shadowed and hid authentic textbook theory across both `TextbookIngestView` and `TextbookStandardView`.
      - Additionally, `UnifiedNodeDetailView` defaulted unknown subject contexts to `MATH`, which caused `buildTheoryFromChunks` to discard non-Math chunks when chapter titles used alternate Vietnamese tone placement (`hoá` vs. `hóa`).
    - **Implementation Details**:
      - **Strict Separation Between Pattern Metadata (`description`) and Pedagogical Theory (`theoryRecap`)**: `activePatternTheory` now reads strictly from `activePattern.theoryRecap` (when non-placeholder), ensuring Block 1 displays full synthesized textbook theory (`activeTheoryContent`) by default without being eclipsed by 1-line stub metadata.
      - **Expanded Stub Detection & Vietnamese Tone Normalization (`textbookStateBridge.js`)**: Added `normalizeViText()` to unify old/new Vietnamese diacritics (`hoá`/`hóa`, `vật lý`/`vật lí`) and expanded `isGenericPlaceholder()` to filter all known backend/frontend stub descriptions and methods.
      - **Dynamic KaTeX Formula Extraction (`extractKeyFormulasFromChunks`)**: Automatically extracts deduplicated LaTeX formulas from lesson chunks when `keyFormulas` is empty so all subjects (Chemistry, Math, Biology, Physics) display real formulas in the Formulas tab.
      - **Full Persistent Storage Merge (`mergeSavedExercisesIntoChapters`)**: Preserves user-edited and AI-enriched `lesson.theory`, `lesson.keyFormulas`, `pattern.theoryRecap`, `pattern.method`, and `pattern.solutionMethod` across page reloads and source switches.
      - **Accurate New-PDF Identity Detection (`handleScanSkeleton`)**: Passes `subjectCode: 'AUTO'` and `grade: 0` when scanning a newly selected PDF so previous book state never leaks onto the new textbook, and automatically hydrates existing DB chunks when the filename matches an already-ingested source.
    - **Verification**: Vite production build (`npm run build`) succeeded in 1.71s (3054 modules transformed, 0 errors); isolated Node.js ESM assertions verified placeholder filtering, Vietnamese tone normalization, chunk scoping, formula extraction, and persistent merge logic 100%.

32. **Automated Basic Solution Method Synthesis (Block 2), Dynamic SGK Worked Examples & Rendering Hygiene (`textbookStateBridge.js`, `TextbookIngestView.jsx`, `TextbookStandardView.jsx`, `MathText.jsx`)**:
    - **Architectural Motivation**:
      - Skeleton scans often emit a single brief phrase for `pattern.method` (e.g., `"Sử dụng công thức tổng khối lượng các hạt"`), leaving Block 2 sparse even when rich lesson chunks, KaTeX formulas, and worked examples are already ingested.
      - Additionally, the `Ví dụ mẫu` tab in `TextbookIngestView.jsx` rendered a hardcoded Physics kinematics sample regardless of subject, `buildTheoryFromChunks` let Vision AI OCR meta-notes (e.g., `"không chứa lý thuyết mới"`) slip into Block 1, and `MathText.jsx` split `####` headings into a stray `#` followed by `###`.
    - **Implementation Details**:
      - **Chunk-Backed Basic Solution Method (`buildMethodFromChunks`)**: Synthesizes a structured Block 2 guide from the pattern's core hint, extracted KaTeX formulas, a 4-step basic solution workflow, SGK calculation/rule excerpts, worked examples, and caution notes, while always honoring instructor-edited or AI-expanded methods (`isEdited: true` or full multi-line methods).
      - **Dynamic Worked Examples (`extractExamplesFromChunks`)**: Replaces the hardcoded Physics example in `TextbookIngestView.jsx` with authentic worked examples and solutions extracted from lesson chunks, with a clear empty-state fallback.
      - **Block 1 Rendering & Content Hygiene**: Filters OCR meta-commentary phrases in `buildTheoryFromChunks` and updates `MathText.jsx` heading normalization regex to `([^\r\n#])\s*(#{1,4}\s+[^\r\n]+)` so `####` subheadings render cleanly without stray `#` tokens.
    - **Verification**: Vite production build (`npm run build`) passed in 1.31s (3054 modules transformed, 0 errors); Node.js ESM assertions verified `buildMethodFromChunks`, `extractExamplesFromChunks`, OCR meta-note filtering, and `####` heading integrity 100%.

33. **End-to-End Textbook-to-Curriculum Synchronization, Deleted-Book Ghost Prevention & Content DB Upsert (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `TextbookStandardView.jsx`, `TextbookIngestView.jsx`, `textbookStateBridge.js`)**:
    - **Architectural Root Cause Remediation**:
      - Textbooks live in AI Engine (`v_eval_ai."KnowledgeSources"` / `"KnowledgeVectorChunks"`) while Curriculum Explorer reads from Content Service (`v_eval_content."Skills"` / `"LearningMaterials"`). Previously: (1) `UnifiedNodeDetailView` prioritized pre-seeded `selectedPattern.theoryRecap` and `solutionMethod` over newly ingested `matchedSgkChunks`, (2) deleting a textbook left stale entries in `localStorage` (`veval_textbook_saved_*`), (3) `detectGrade()` defaulted unlabelled titles to `'12'`, dropping Grade 10/11 chunks, (4) `normalizeTaxonomyLabel()` retained parenthetical suffixes like `(Hóa học - Lớp 10)` and missed old-style `hoá` accents, and (5) no 1-click DB sync pushed new SGK structures into Content Service.
    - **Implementation Details**:
      - **Live SGK Precedence in `UnifiedNodeDetailView`**: Block 1 (Theory + extracted KaTeX formulas), Block 2 (Basic Solution Method via `buildMethodFromChunks`), and Block 3 (Questions) now prioritize active SGK edits (`findSavedNodeData` scoped strictly to live `activeSourceIds`) and freshly ingested `matchedSgkChunks` over stale pre-seeded Content Service strings, while removing hardcoded fallback phrases.
      - **Real-Time Event Bus & Ghost-Cache Purge**: `clearSavedTextbookData()` purges localStorage/sessionStorage for deleted books and dispatches `veval:textbook-deleted`; `CurriculumExplorerView` listens to `veval:textbook-saved`, `veval:textbook-deleted`, and `veval:curriculum-synced` to immediately reload sources and curriculum trees.
      - **Accurate Cross-Grade & Diacritic Chunk Matching**: Updated `detectGrade(text, null)` for chunk matching and stripped parenthetical metadata suffixes plus normalized `hoá`/`hóa` inside `normalizeTaxonomyLabel`, `detectSubjectFromContext`, and `isSubjectCompatible`.
      - **1-Click Content Service DB Upsert (`syncTextbookSkeletonToCurriculum`)**: Added a dedicated `"Đồng Bộ Khung CT"` button in both `TextbookStandardView` and `TextbookIngestView` that resolves existing `DomainId`/`ChapterId`/`LessonId`/`PatternId` GUIDs and upserts full textbook theory, basic solution methods, and exercises via `POST /api/content/curriculum/import` without creating duplicate nodes.
    - **Verification**: Vite production build (`npm run build`) succeeded in 1.28s (3054 modules transformed, 0 errors); Node.js ESM verification (`verify_sync.mjs`) passed 100% covering ghost-book isolation, cache purge, event dispatch, and duplicate-free GUID upsert matching.

34. **Resilient Textbook Persistence & Refresh Integrity Architecture (`textbookStateBridge.js`, `TextbookIngestView.jsx`, `TextbookStandardView.jsx`)**:
    - **Architectural Root Cause Remediation**:
      - Users reported parsed and saved textbooks vanishing after refreshing the page. Investigation revealed four compounding persistence faults: (1) `saveTextbookData` duplicated the entire uncompacted textbook payload across 4 `localStorage` keys plus `sessionStorage`, frequently triggering silently swallowed `QuotaExceededError` failures; (2) stale React state closure on `selectedSourceId` caused Step 1 (`handleScanSkeleton`), Step 2 (`handleStartFillKnowledge`), and `handleSelectSource` to save under the previous book's key or skip saving `finishedSid`; (3) `getStoredTextbookContext()` only read `sessionStorage`, causing `loadIngestedSources()` on refresh/new tab to fall back to a hardcoded `VL 10 CD` source and overwrite freshly saved Step 1 books; and (4) `handleSelectSource` discarded richer user-saved chapters (`cachedData.skeleton.chapters`) whenever raw DB chunks produced any `detectedChapters`.
    - **Implementation Details**:
      - **Compact Single-Copy Storage & Quota Self-Healing (`saveTextbookData`, `compactSkeletonForStorage`)**: Writes one compact payload per book (omitting unedited auto-reconstructed lesson theory when `sourceId` exists in DB) plus tiny pointer records (`{ isPointer: true, targetKey }`) for `default` and filename aliases, with automatic stale-key eviction and retry on `QuotaExceededError`.
      - **Cross-Tab Persistent Active Context (`ACTIVE_CTX_LOCAL_KEY`)**: Stores lightweight book identity metadata (never full `chapters`) in both `sessionStorage` and `localStorage`.
      - **Ref-Synchronized `sourceId` & Refresh Protection (`resolvePersistedChapters`)**: Eliminated stale closure via `selectedSourceIdRef` and explicit `overrideSourceId` in `saveToStorage`; `loadIngestedSources()` restores the exact last-saved book (preserving Step 1 unsynced books instead of jumping to `VL 10 CD`) and `resolvePersistedChapters` retains richer user-saved structures across refreshes.
    - **Verification**: Vite production build (`npm run build`) passed in 1.28s (3054 modules transformed, 0 errors); Node.js ESM test suites (`verify_persistence.mjs`, `verify_sync.mjs`) passed 100% across Step 1 refresh, Step 2 `sourceId` linking, rough-chunk overwrite defense, `QuotaExceededError` recovery, and delete cleanup.

35. **Zero-Leak Sub-Subject Filtering & Authoritative Subject Tag Precedence (`CurriculumExplorerView.jsx`, `textbookStateBridge.js`)**:
    - **Architectural Root Cause Remediation**:
      - Selecting the Chemistry (`Hóa học`) sub-subject filter under `NATURAL_SCIENCES` leaked Biology and Physics chapters (notably `Chương 2: Sinh học tế bào (Sinh học - Lớp 10)` whose child lesson mentions *"Thành phần hoá học của tế bào"*, plus `Chuyển hóa năng lượng`, `Tiến hóa`, and `Vật lí hạt nhân` containing *"phản ứng"*), inflating the Chemistry view from 21 to 26 chapters. Similar substring overlaps also affected Chemistry (`Năng lượng hoá học`, `Pin điện`) vs. Physics and `Địa lí kinh tế` vs. Civics (`GDKT & PL`).
      - Root cause: `matchesSubSubject` concatenated chapter, lesson, and pattern labels into a flat string and matched broad keywords (such as `"hóa"`, `"phản ứng"`, `"năng lượng"`, `"kinh tế"`) without honoring explicit subject tags already embedded in chapter titles.
    - **Implementation Details**:
      - **3-Tier Authoritative Precedence in `matchesSubSubject`**:
        1. *Tier 1a (Parenthetical/Bracketed Subject Tags)*: Extracts `(...)`/`[...]` tags from the chapter title first so `(Sinh học - Lớp 10)`, `(Hóa học - Lớp 10)`, `(Vật lí - Lớp 12)`, `(Lịch sử - ...)`, `(Địa lí - ...)`, `(GDKT & PL - ...)`, `(Tiếng Anh - ...)`, and `(Ngữ văn - ...)` are routed exclusively to their declared sub-subject regardless of child lesson terminology.
        2. *Tier 1b (Explicit Body Subject / Domain-Exclusive Markers & Chapter Code)*: Handles user-created chapters without parenthetical suffixes via unambiguous chapter-title phrases and `chap.code` tokens (`BIO`, `CHEM`, `PHYS`, `HIST`, `GEO`, `CIV`, `ENG`, `LIT`).
        3. *Tier 2 (Vietnamese-Safe Sanitized Keyword Fallback)*: Strips non-chemistry Vietnamese compounds (`tiến hóa`, `chuyển hóa`, `văn hóa`, `đô thị hóa`, `công nghiệp hóa`, `hiện đại hóa`, `toàn cầu hóa`, `sinh hóa`, `phân hóa`, `đồng hóa`, `dị hóa`) without ASCII `\b` boundary bugs on accented Vietnamese characters.
      - **Aligned `detectSubjectFromContext` & Unicode NFC Normalization**: Updated `detectSubjectFromContext` to evaluate parenthetical/bracketed subject tags first and added `.normalize('NFC')` in `normalizeViText` (`textbookStateBridge.js`) to prevent decomposed NFD matching mismatches.
    - **Verification**: Vite production build (`npm run build`) succeeded in 1.30s (3054 modules transformed, 0 errors); exhaustive Node.js ESM verification (`verify_subsubject_filter.mjs`) validated all 113 chapters across `NATURAL_SCIENCES`, `SOCIAL_SCIENCES`, and `LANGUAGE` in `gdpt2018_dgnl_taxonomy.json` plus 8 untagged/NFD/mixed-keyword edge cases with 0 cross-subject leaks and 0 missed chapters.

36. **100% Studio UI Copy, Label & Chrome Minimalist Optimization (`CurriculumStudioEditor.jsx`, `TextbookStudioView.jsx`, `ExamParserStudioView.jsx`, `WordStyleFormulaCanvas.jsx`, `HierarchicalMathPalette.jsx`, `InteractiveFormulaBuilderModal.jsx`, `InteractiveMathWorkbenchModal.jsx`)**:
    - **Architectural & UX Remediation**:
      - Audited the full Studio authoring suite and identified severe UI chrome bloat: (1) a duplicated view-mode toolbar (`Trực quan | Trang in | Mã nguồn`) rendered twice inside Section 2 of `CurriculumStudioEditor.jsx`; (2) a double-stacked header in `TextbookStudioView.jsx` (outer page header immediately followed by `CurriculumStudioEditor`'s standalone navbar); (3) leaked internal engineering/spec labels (`API 16`, `API 16–18`, `FSM Gate >= 80%`, `Embedded Live Test`, `JSXGraph Native Engine`, `60 FPS Canvas/SVG`, `Flow 2`, `Flow 3`, `WYSIWYG`, `Database`, `Trang 3:`); (4) redundant inner card titles/subtitles repeating active tab labels, duplicate preview bars, emoji clutter alongside Lucide icons, and unparsed `$Oxy$` / `$(x; y)$` literal tokens inside 2D Geometry labels.
    - **Implementation Details**:
      - **Single-Header Composition & Bug Fix**: Added an optional `headerActions` slot to `CurriculumStudioEditor` and collapsed `TextbookStudioView`'s outer header into compact navbar pills; removed the duplicated toolbar in Section 2 and resolved `domain?.title || domain?.name` breadcrumb fallback.
      - **Complete Copy & Chrome Minimalism Across 7 Components**: Stripped all internal spec identifiers, redundant helper callouts, duplicate emojis, and repeated section banners across `CurriculumStudioEditor` (including `FloatingStemDrawer`, `NewQuestionDialog`, `AiQuestionGeneratorModal`), `ExamParserStudioView`, `WordStyleFormulaCanvas`, `HierarchicalMathPalette`, `InteractiveFormulaBuilderModal`, and `InteractiveMathWorkbenchModal`, condensing all tabs, buttons, and form labels to concise 2–4 word copy without altering any state handlers, API payloads, or formula/graph logic.
    - **Verification**: Vite production build (`npm run build`) succeeded in 1.24s (3054 modules transformed, 0 errors), reducing main JS bundle size by ~42 kB (`4,416.39 kB` -> `4,374.52 kB`); static grep audit confirmed zero user-visible dev/spec strings remaining across all 7 Studio files.

37. **Scholarly Academic Studio Redesign, Unified Word/Excel Direct Authoring Engine, Split Subject Symbol/Formula Sidebar & Docked STEM Learning Models Architecture (`CurriculumStudioEditor.jsx`, `WordStyleFormulaCanvas.jsx`, `HierarchicalMathPalette.jsx`, `AcademicChartBlock.jsx`, `MathText.jsx`, `TextbookStudioView.jsx`)**:
    - **Architectural & Pedagogical Motivation**:
      - Instructor feedback highlighted five structural UX pain points in the Studio: (1) harsh visual styling with clashing neon cyan/purple/dark-black pills and double view-mode toggles (`Soạn thảo | Chia đôi | Xem trước` alongside `Trực quan | Trang in | Mã nguồn`); (2) line-fragmented `contentEditable` spans that broke multi-line selection, natural `Enter` line splitting, `Backspace` line deletion, and in-place Word formatting (`Bold`, `Italic`, `Underline`, `Aa` case change); (3) exposure of raw LaTeX tokens (`\frac`, `///`, `\sqrt`) when editing general formulas; (4) a left sidebar that defaulted to Mathematics even inside Chemistry lessons and mixed block templates into symbols/formulas; and (5) lack of inline Excel-like editable tables, embedded interactive data charts, and a dedicated STEM learning models panel.
    - **Implementation Details**:
      - **Soft-Academic Editorial Visual System & Single-Screen Workspace (`CurriculumStudioEditor.jsx`)**: Re-themed the Studio around a warm parchment backdrop (`#F6F5F1`), crisp white document sheet (`#FFFFFF`), delicate hairline borders (`#E7E5DF`), and scholarly ink-indigo accents (`#1E3A5F` / `#2C4C7E`). Removed all raw Markdown/LaTeX source tabs and 3-way mode switchers in favor of a single unified visual document screen with an optional quiet `"Xem thử"` student-preview toggle.
      - **True Word + Excel + Visual KaTeX Document Engine (`WordStyleFormulaCanvas.jsx`, `AcademicChartBlock.jsx`, `MathText.jsx`)**:
        - *Unified `RichTextBlock` & `WordFormattingRibbon`*: Uncontrolled `contentEditable` surface preserving native caret stability, multi-line selection, `Enter` paragraph/list splitting, `Backspace` empty-line and block deletion, `Ctrl+V` clipboard image/formula pasting, and focus-preserving toolbar commands (`Văn bản`/`H2`/`H3`, `B`/`I`/`U`/`S`, Vietnamese-aware `Aa` `uppercase`/`lowercase`/`capitalize` skipping `.veval-formula-chip` nodes, text alignment, bullet/numbered lists, `Undo`/`Redo`).
        - *Zero Raw LaTeX Exposure*: All formulas render inline as atomic KaTeX chips (`.veval-formula-chip`). Clicking any chip opens a structured visual slot popover (`FRACTION`, `SQRT`, `POWER`, `SUBSCRIPT`, `INTEGRAL`, `LIMIT`, `CHEM_CM`, `CHEM_CPERCENT`) or a natural mathematical typography editor (`latexToNaturalMath` / `naturalMathToLatex`) with a 17-key rendered KaTeX keypad and instant evaluation (`autoCalculateEquation`), never displaying `\frac` or `///`.
        - *Inline Excel-Like Spreadsheet Tables (`EditableTableBlock`) & Interactive Charts (`AcademicChartBlock.jsx`)*: Multi-cell grid supporting `Tab`/`Shift+Tab`/`Enter` cell navigation, auto-row creation on `Tab` from the last cell, dynamic `+ Hàng`/`+ Cột`, KaTeX rendering in cells on blur, and GFM pipe-table serialization; interactive Bar, Line, and Pie charts via `recharts` with inline data-row editing and `[DATA_CHART]...[/DATA_CHART]` rendering in `MathText.jsx` (which also now renders `<u>...</u>` and `~~...~~`).
      - **Subject-First Split Left Sidebar & 838-Item Encyclopedic 8-Subject GDPT 2018 Catalog (`HierarchicalMathPalette.jsx`)**:
        - Placed the 8-subject selector at the very top (`Toán học`, `Hóa học`, `Vật lí`, `Sinh học`, `Tiếng Anh`, `Ngữ văn`, `Lịch sử`, `Địa lí`), automatically synchronized to the active lesson via `detectStudioSubject`, and split the body cleanly into **`Ký hiệu`** and **`Công thức`** with collapsible category accordions (`Mở hết · Thu gọn`), live item-count badges, and a portal Hover Preview Card displaying enlarged KaTeX rendering plus full pedagogical descriptions (`desc`).
        - Expanded the catalog to **838 KaTeX-validated items** across all 8 subjects: **Hóa học (278 items / 19 categories)** covering all inorganic/organic compounds, ions, functional groups, complexes, balanced equations, and stoichiometry/physical chemistry formulas; **Toán học (214 items / 17 categories)** covering 7 algebraic identities, Vi-ét, Cauchy/Bunyakovsky inequalities, AP/GP/Newton binomial, complete derivative & antiderivative tables, oblique asymptotes, compound interest, full trigonometry, solid/Oxyz geometry, conditional probability, Bayes' theorem, and grouped-data statistics; **Vật lí (137 items / 15 categories)** covering kinematics, projectile motion, dynamics, harmonic oscillations, mechanical/sound/electromagnetic waves, Young interference, electrostatics, DC circuits, thermal physics & ideal gas laws, electromagnetism, AC RLC/transformers, quantum photoelectricity, Bohr atom, and nuclear physics/radioactivity; **Sinh học (80 items / 14 categories)** covering photosynthesis/respiration/cardiac cycle, DNA/RNA structure & replication, transcription/translation, mitosis/meiosis, Mendelian & non-allelic gene interactions, linkage/crossing-over & Morgan's fast formulas, 4n polyploidy, ABO blood groups, sex-linked pedigree probabilities, Hardy-Weinberg equilibrium, and population ecology; **Tiếng Anh (70 items / 10 categories)** covering parts of speech, IPA phonetics, 12 tenses, sequence of tenses, passive & causative forms, conditionals & wishes, comparisons & relative-clause reductions, inversions & subjunctive mood, gerunds/infinitives/connectors/phrasal verbs, `-s/-ed` pronunciation, `OSASCOMP` adjective order, and tag questions; plus **Ngữ văn (25 items)**, **Địa lí (24 items)**, and **Lịch sử (10 items)**.
        - Implemented `normalizePaletteSearchKey` and `matchesPaletteItem` for instant chemical-formula, hyphen/dash-normalized, category-aware, and accent-insensitive Vietnamese/English search.
      - **Docked Right STEM & Learning Models Panel (`StemModelsPanel`)**: Consolidated all embedded learning models into five structured groups on the right panel: *Bảng & Biểu đồ* (Excel data table, 2-column comparison table, Bar/Line/Pie charts), *Bộ dựng công thức* (Fractions/Roots/Powers, Limits/Derivatives, Integrals, Systems of equations), *Mô hình Toán học* (2D Function Graph, 3D Spatial Geometry, 2D Plane Geometry, Variation Table), *Hóa · Sinh · Vật lí* (Chemistry concentration & yield, Lab measurement table, Biology Punnett genetic cross table, Biology classification table), and *Hình ảnh & Tư liệu* (Device upload, URL/sample picker, `Ctrl+V` paste).
    - **Verification**: Vite production build (`npm run build`) succeeded in 1.19s (3055 modules transformed, 0 errors); Node.js ESM verification (`verify_studio_editor.mjs`, `verify_subsubject_filter.mjs`, `verify_persistence.mjs`, `verify_sync.mjs`) validated all 838 catalog items against `katex.renderToString(..., { throwOnError: true })` with 0 errors and 100% search accuracy.

38. **Resilient Dual-Channel Studio Save Architecture & Elimination of HTTP 404 Pattern Update Errors (`CurriculumStudioEditor.jsx`, `TextbookStudioView.jsx`, `textbookStateBridge.js`, `CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `TextbookStandardView.jsx`, `TextbookIngestView.jsx`, `ExamParserStudioView.jsx`)**:
    - **Architectural Root Cause Remediation**:
      - Saving edits in `CurriculumStudioEditor` threw `"Không tìm thấy dữ liệu hoặc đường dẫn yêu cầu."` (mapped from HTTP 404 by `apiErrorHandler.js`) whenever `form.patternId` was a composite non-GUID textbook identifier (e.g. `"SGK_CHEM_G10_P1"` from `TextbookStudioView`) or a GUID not yet present in `v_eval_content."Skills"`.
      - Additionally, `TextbookStudioView` did not hydrate the selected chapter, lesson, and pattern from `getSavedTextbookData` and did not write saved Studio edits back into `saveTextbookData`.
    - **Implementation Details**:
      - **Dual-Channel Persistence (`saveStudioPatternToTextbookStorage` & `STUDIO_OVERRIDES_STORAGE_KEY`)**: Every save in `CurriculumStudioEditor` immediately persists the updated Theory, Solution Method, Sample Problem, Exam Traps, Casio Tricks, and Sample Question into both the active textbook's `localStorage` entry (`isEdited: true`) and `veval_textbook_saved_studio_overrides` (prioritized by `findSavedNodeData`), ensuring instant real-time synchronization and `F5` refresh survival across `TextbookStandardView`, `TextbookIngestView`, and `UnifiedNodeDetailView`.
      - **3-Tier Resilient Content Service Upsert (`upsertSinglePatternToCurriculumDb`)**: Validates GUIDs via `isValidGuid` (including `sampleQuestion.questionId` and `prerequisiteSkillIds`); attempts `contentService.updatePattern` when `patternId` is a valid GUID, and automatically falls back to resolving existing nodes from `contentService.getCurriculum()`, creating the pattern node via `contentService.createNode`, or upserting the full `Chapter -> Lesson -> Pattern` path via `contentService.importCurriculum`.
      - **Full Context Hydration into `TextbookStudioView`**: `TextbookStandardView`, `TextbookIngestView`, and `UnifiedNodeDetailView` flush current state and pass active chapter/lesson/pattern titles plus synthesized theory and method previews into Studio; `CurriculumExplorerView` preserves `_parentLesson` and `_parentChapter` references across `fetchCurriculumData` refreshes.
    - **Verification**: Vite production build (`npm run build`) succeeded in 1.23s (3055 modules transformed, 0 errors); Node.js ESM verification (`verify_studio_save.mjs`) passed 100%.

39. **Complete React Port & Enterprise UI Transformation of Real Exam PDF Parser Studio (`ExamParserStudioView.jsx`, `ExamItemCards.jsx`, `ExamRichContent.jsx`, `ExamDatabaseModal.jsx`, `ExamMediaLightbox.jsx`, `examParserUtils.js`, `contentService.js`) [20/11/2026]**:
    - **Architectural Objective**:
      - Replace the mock stub in `ExamParserStudioView.jsx` with a full-featured, production-ready React architecture porting 100% of the legacy standalone `view-exam.html` (AI Engine) exam ingestion and management pipeline into the unified V-Eval Web Client SPA, routed securely through the YARP API Gateway (`:5212`) with JWT authentication.
    - **Implementation Details**:
      - **Gateway-Unified Content & AI Engine Integration (`contentService.js`, `aiService.js`)**:
        - Extended `contentService.js` with `importExam` (`POST /api/content/exams/import` preserving `imageUrl` on both passages and questions plus normalized `correctOption`), `publishExam` (`PATCH /api/content/exams/{id}/publish`), and `deleteExam` (`DELETE /api/content/exams/{id}`).
        - Connected drag-and-drop and click PDF upload to `aiService.uploadPdfExam` (`POST /api/ai-engine/upload-pdf`) with 2-second job polling via `aiService.getExamJobStatus` (`GET /api/ai-engine/jobs/{jobId}`), real-time `mm:ss` elapsed timer, current processing step telemetry, and safe unmount/cancel timer cleanup.
      - **Pure Exam Parsing & Normalization Engine (`examParserUtils.js`, `examParserUtils.test.js`)**:
        - Ported the 6-stage OCR math/LaTeX recovery pipeline (`sanitizeExamMathAndLatex`: ASCII control character restoration for `\frac`/`\times`/`\text`/`\bar`/`\beta`/`\theta`/`\tau`, `\Delta` OCR misread fixes, chemical reaction rate equations, transmission efficiency formulas, negative-exponent STEM units, and bare symbol wrapping).
        - Built safe structured 2-tier Markdown table parsing (`parseTwoTierMarkdownTable` supporting `rowspan="2"` and `colspan="N"` grouped headers without raw HTML injection) and Vietnamese statistical Bar/Pie chart extraction (`extractInlineChartsFromText` handling comma decimals).
        - Unified normalization (`normalizeExamData`) across AI Engine `ParsedExamDto`, Content Service `MockExamDetailDto` (including clean extraction of embedded leading Markdown images), and manual blank exam authoring (`createBlankExam`).
      - **Rich Exam Rendering, Interactive Charts & Media Lightbox (`ExamRichContent.jsx`, `ExamMediaLightbox.jsx`)**:
        - Rendered passages, questions, options, and explanations through `MathText`, 2-tier React tables, and interactive Recharts Bar/Pie charts with direct `%` data labels (`LabelList`).
        - Resolved relative `/extracted_images/...` media paths against the API Gateway base URL, smartly suppressed duplicate PDF crop screenshots when an interactive chart/table is already rendered (with an on-demand toggle to inspect the original PDF crop), and added a full-screen `ExamImageLightbox` (`50%`–`250%` zoom, keyboard shortcuts, `ESC` dismiss).
      - **Modern Bento-Grid Workspace, Sticky Question Matrix, Clipboard Paste & Studio Sync (`ExamParserStudioView.jsx`, `ExamItemCards.jsx`, `ExamDatabaseModal.jsx`)**:
        - Built a 2-mode workspace: Home Hub (Hero Banner, Drag-and-Drop PDF Dropzone, Manual Authoring CTA, and inline Supabase Database Exam Cards Grid) and Exam Viewer & Authoring Workspace (Sticky Action Header with editable title/metadata/stats/Save/Publish/Delete/Lock controls, Sticky Question Matrix 1–120 with `IntersectionObserver` scroll-sync and missing-question gap indicators, inline Quick-Edit for Passages & Questions, global `Ctrl+V` clipboard image paste persisted directly into React state, and 1-click integration with `CurriculumStudioEditor` syncing stem, options, correct option, Bloom level, and explanation).
    - **Verification**:
      - `oxlint`: 0 warnings and 0 errors across all 7 created/upgraded files.
      - `node --test`: 12/12 unit tests passed (including 7 new test suites in `src/utils/examParserUtils.test.js`).
      - `npm run build`: Production build succeeded cleanly in 3.58s (3060 modules transformed, 0 errors).

40. **End-to-End 4-Level Competency & Curriculum Node Auto-Mapping, AI Batch Classification & Exam Specification Blueprint (`examCurriculumMatcher.js`, `ExamNodePickerModal.jsx`, `ExamBlueprintDrawer.jsx`, `ExamItemCards.jsx`, `ExamParserStudioView.jsx`, `aiService.js`, `contentService.js`) [20/11/2026]**:
    - **Architectural Objective**:
      - Bridge real parsed exam questions directly into the live 4-level PostgreSQL Competency & Curriculum Tree (`CompetencyDomain -> Chapter -> Lesson -> Pattern`) so instructors immediately know which Chapter, Lesson, and Pattern each exam question assesses, inspect full exam specification coverage, refine mappings interactively, and persist exact `SkillId` foreign keys without creating orphan skills.
    - **Implementation Details**:
      - **Live Tree Flattening & Instant Auto-Mapping Engine (`examCurriculumMatcher.js`, `examCurriculumMatcher.test.js`)**:
        - Flattens `GET /api/content/curriculum` into a searchable index with grade extraction (`Lớp 10/11/12`), authoritative parenthetical subject detection, and NFC/NFD Vietnamese accent folding.
        - Scores every extracted question (`matchQuestionToCurriculumNode`) using weighted overlap across `suggestedSkillName`, stem text, and passage context combined with subject-alignment bonuses and cross-subject penalties.
      - **AI Deep Batch Classification (`aiService.classifyExamNodes`)**:
        - Sends compact live `taxonomy_nodes[]` and exam `questions[]` to `POST /api/ai-engine/exams/classify-nodes` and merges returned `skill_id`, `chapter_name`, `lesson_name`, `pattern_name`, `confidence`, `bloom_level`, and `reason` onto exam state (`applyAiNodeMappingsToExam`), with graceful local fallback.
      - **Node Breadcrumbs, 4-Column Cascading Picker & Blueprint Matrix (`ExamItemCards.jsx`, `ExamNodePickerModal.jsx`, `ExamBlueprintDrawer.jsx`)**:
        - Displays a color-coded `Domain › Chapter › Lesson › Pattern` breadcrumb strip and source badge (`DB` / `Đã duyệt` / `AI %` / `Tự động %`) on every `ExamQuestionCard`.
        - Provides `ExamNodePickerModal` (unified accent-insensitive search, top-4 candidates, and 4-column cascading tree selector) and `ExamBlueprintDrawer` (coverage KPIs, Domain & Bloom L1–L6 charts, expandable Chapter -> Lesson table with 1-click question jump and chapter filter).
        - Forwards real `skillId` GUIDs plus `domainName`/`chapterName`/`lessonName` in `contentService.importExam` and hydrates ancestor lineage returned by `GET /api/content/exams/{id}`.
    - **Verification**:
      - `oxlint`: 0 warnings and 0 errors across all 11 files.
      - `node --test`: 16/16 unit tests passed (including 4 new suites in `src/utils/examCurriculumMatcher.test.js`).
      - `npm run build`: Production build succeeded in 4.19s (3063 modules transformed, 0 errors).

41. **Soft-Academic 4-Mode Exam Studio Redesign: Exam Paper View, Single-Question Studio Editor, Drag-and-Drop Exam Organizer & AI 6-Level Bloom Generator with Review Queue (`ExamParserStudioView.jsx`, `ExamPaperView.jsx`, `ExamQuestionStudioTab.jsx`, `ExamOrganizerTab.jsx`, `ExamBloomAiGeneratorTab.jsx`, `examOrganizerUtils.js`, `examOrganizerUtils.test.js`) [20/11/2026]**:
    - **Architectural & UX Objective**:
      - Elevate the Exam Parser into a unified, scholarly 4-mode authoring suite (`#F6F5F1` parchment canvas, `#FFFFFF` sheets, `#1E3A5F` ink accents) combining formal exam viewing, deep per-question Studio editing, structural drag-and-drop exam organization, and Skill-targeted 6-level Bloom AI question generation with mandatory human review before insertion.
    - **Implementation Details**:
      - **Mode 1 — Print-Ready Exam Paper View (`ExamPaperView.jsx`)**: Formal exam paper header, sticky question matrix navigator (`1..120`), answer-key/explanation/tag toggles, interactive Quick Practice & Grading mode (instant 10-point score calculation), `window.print()` print support, `Ctrl+V` image pasting, and 1-click handoff to edit any question in Studio.
      - **Mode 2 — Dedicated Per-Question Studio (`ExamQuestionStudioTab.jsx`)**: 2-pane authoring workspace with filterable left question list and full right-hand editor featuring 6 clickable Bloom level buttons (`L1`–`L6`), Curriculum Node Picker, inline parent-passage editing, KaTeX quick-insert bar, live side-by-side preview, 4-option editor with single-question option shuffling, explanation preview, `Alt + ArrowLeft/ArrowRight` stepping, question duplication, and 1-click handoff to `CurriculumStudioEditor` (838-item catalog & 3D MathLab).
      - **Mode 3 — Exam Organizer & Reorder Board (`ExamOrganizerTab.jsx`, `examOrganizerUtils.js`)**: Pure immutable transformation helpers powering HTML5 drag-and-drop block reordering, in-passage child reordering, continuous `1..N` renumbering, Bloom (`L1 -> L6`) sorting, Curriculum Chapter grouping, passage-safe exam shuffling, full-exam A/B/C/D option shuffling with accurate `correctOption` remapping, passage attach/detach, and 1-step Undo.
      - **Mode 4 — AI 6-Level Bloom Skill Generator + Review Queue (`ExamBloomAiGeneratorTab.jsx`)**: Allows selecting any live Curriculum Tree Skill node, allocating exact counts across all 6 Bloom levels (`L1`–`L6`, with 3 quick presets), calling `aiService.generatePatternExercises` with live progress telemetry, and staging generated questions inside an Approval Queue (`pending` / `approved` / `rejected`) supporting inline editing, single-question regeneration, rejection/restoration, and single or bulk approval into the exam with real `skillId` binding.
    - **Verification**:
      - `oxlint`: 0 warnings and 0 errors across all 17 files.
      - `node --test`: 23/23 unit tests passed (including 7 new suites in `src/utils/examOrganizerUtils.test.js`).
      - `npm run build`: Production build succeeded cleanly in 3.18s (3067 modules transformed, 0 errors).

42. **3-Page Exam Suite Decomposition Mirroring Textbook (SGK) Sidebar Architecture (`Sidebar.jsx`, `App.jsx`, `examStateBridge.js`, `examStateBridge.test.js`, `useExamWorkspaceController.js`, `ExamWorkspaceHeader.jsx`, `ExamSharedModals.jsx`, `ExamBankView.jsx`, `ExamIngestView.jsx`, `ExamStudioView.jsx`) [20/11/2026]**:
    - **Architectural Objective**:
      - Align the Exam Authoring & AI Bloom workflow 1:1 with the proven 3-page Textbook (`textbook-group`) navigation paradigm so instructors, campus managers, and administrators navigate directly to dedicated workspaces without nested screen clutter while preserving full state continuity across page transitions.
    - **Implementation Details**:
      - **Collapsible Sidebar Group (`exam-group`) & Role Routing (`Sidebar.jsx`, `App.jsx`)**:
        - Replaced the single `exam-studio` sidebar link across `teacher`, `manager`, and `admin` roles with an auto-expanding indigo-themed collapsible group (`Đề thi & AI Bloom`) housing 3 standalone pages:
          1. **`1. Kho Đề & Xem Đề Thi` (`exam-bank` -> `ExamBankView.jsx`)**: Supabase Exam Catalog KPIs & cards grid + active exam viewer toggling cleanly between Print-Ready `ExamPaperView` and Drag-and-Drop `ExamOrganizerTab`, with 1-click question jump into Page 3.
          2. **`2. Parse PDF & AI Bloom` (`exam-ingest` -> `ExamIngestView.jsx`)**: Clean 2-part ingestion page separating **Part 1 (PDF Gemini Vision AI OCR)** — featuring extraction verification & cross-page handoff controls — and **Part 2 (AI 6-Level Bloom Generator & Human Review Queue)**, which automatically initializes a target draft exam if approved when no exam is open.
          3. **`3. Studio Biên Soạn Đề` (`exam-studio` -> `ExamStudioView.jsx`)**: Dedicated 2-pane `ExamQuestionStudioTab` with instant exam switching, blank manual authoring starter, `Ctrl+V` image pasting, and 1-click handoff to the Full 838-item `CurriculumStudioEditor`.
        - Updated `App.jsx` (`ROLE_PORTAL_DEFINITIONS` and the `role === 'teacher'` portal guard) so all 3 routes render cleanly and display accurate Navbar titles across all 3 roles; kept `ExamParserStudioView.jsx` as a backwards-compatible re-export.
      - **Cross-Page Reactive State Store & Module-Level PDF Poller (`examStateBridge.js`, `useExamWorkspaceController.js`)**:
        - Implemented an external store consumed via React `useSyncExternalStore` backed by quota-safe `sessionStorage` (`stripLargeBase64ForStorage`), sharing `currentExam`, `selectedQuestionLocalId`, `isLocked`, `hasUnsavedChanges`, `aiBloomDrafts`, `bloomTargetSkillNode`, `dbExams`, and `curriculumDomains` seamlessly across all 3 pages.
        - Moved the Gemini Vision PDF polling timers into `examStateBridge.js` so switching pages while a multi-minute PDF OCR job is executing never cancels polling and surfaces completion notifications via `ExamPageFlowBar` and toast on whichever page is active.
        - Factored common chrome and modals into `ExamWorkspaceHeader.jsx` (`ExamPageFlowBar` + sticky exam header) and `ExamSharedModals.jsx` to guarantee zero business-logic duplication across the 3 views.
        - Extended `examParserUtils.js` (`parseHtmlExamTable`) and `ExamRichContent.jsx` (`StructuredHtmlExamTable`) to safely render multi-tier HTML `<table>` (`rowspan`/`colspan`) with inline KaTeX while shielding `[VARIATION_TABLE]`, `[MATH_GRAPH]`, and `[MATH_GRAPH_3D]` blocks from Markdown table splitting.
        - Unified explicit **Delete Exam (`Xóa Đề`)** workflows across `useExamWorkspaceController.js`, `ExamWorkspaceHeader.jsx`, `ExamIngestView.jsx`, `ExamDatabaseModal.jsx`, and `TeacherPortalView.jsx` (`section === 'diagnostic'`), handling both persisted PostgreSQL exams (`DELETE /api/content/exams/{id}`) and unsaved AI/manual draft exams via in-app confirmation dialogs.
    - **Verification**:
      - `oxlint`: 0 warnings and 0 errors across all 22 Exam module files.
      - `node --test`: 37/37 unit tests passed across the entire Web Client suite (including `src/components/curriculum/examStateBridge.test.js` and HTML table / `[VARIATION_TABLE]` assertions in `src/utils/examParserUtils.test.js`).
      - `npm run build`: Production build succeeded cleanly in 6.19s (3073 modules transformed, 0 errors).





18. **Academic Manager Portal Separation (`AcademicManagerDashboardView.jsx`) & Original `CampusManagerDashboardView.jsx` Preservation for Director (`AcademicManagerDashboardView.jsx`, `CampusManagerDashboardView.jsx`, `authService.js`, `Sidebar.jsx`, `App.jsx`, `practiceService.js`)**:
    - **Role Separation & Navigation Architecture**:
      - Preserved the original `CampusManagerDashboardView.jsx` and original navigation menu 100% intact for `Academic Director` (`role === 'director'`, `ACADEMIC_DIRECTOR`) and `Admin`.
      - Created the dedicated `AcademicManagerDashboardView.jsx` component for `Academic Manager` (`role === 'manager'`, `ACADEMIC_MANAGER` / `CAMPUS_MANAGER`) with a 4-module navigation structure: (1) Campus Overview & Comparative Analytics, (2) Academic Terms, Courses, Offline Class Schedules & Teacher Allocation, (3) Automated K-Means 4-Domain Class Clustering, and (4) Tier-3 Academic Escalations & 3-Way Counseling.
    - **Complete Elimination of Hardcoded Values in `AcademicManagerDashboardView.jsx`**:
      - Removed hardcoded greeting suffix, hardcoded teacher class counts (`activeClasses: 1`), fake ratings, hardcoded class schedule strings, and fallback `67%` mastery metrics.
      - Integrated real Backend endpoints across `AcademicTermsController`, `CoursesController`, `ClassesController`, `SchedulesController`, `AnalyticsController`, and `EarlyWarningsController`.
      - Enforced Campus RBAC isolation (`MGR_07`, `MGR_22`), dynamic `MaxK` clustering validation (`MGR_09` - `MGR_15`), color-coded 20-student capacity bars (`MGR_08`), teacher assignment validation (`MGR_01`, `MGR_03`, `MGR_06`), manual student enrollment with 21st-student auto-overflow (`MGR_02`, `MGR_04`, `MGR_13`), and CSV/Excel campus report export (`MGR_18`).
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.55s with 3054 modules transformed and zero errors.


19. **Real-time Schedule & Physical Room Conflict Prevention Engine (`AcademicManagerDashboardView.jsx`)**:
    - **Dual-Layer Real-time Conflict Engine (`classConflictsMap`, `createClassConflict`, `scheduleSlotConflict`)**:
      - Evaluates time interval overlap on the same day of the week: `max(start1, start2) < min(end1, end2)`.
      - **Physical Room Conflict**: Automatically identifies if the selected room (`room`) is already allocated to another active class within the same campus.
      - **Instructor Conflict**: Automatically detects if the assigned teacher already has a teaching commitment during the intersecting time window.
    - **Visual Conflict Feedback & Submission Protection**:
      - Renders an immediate red conflict alert box directly within Modal 4 (*"Mở Lớp Học Mới"*) and Modal 5 (*"Thời Khóa Biểu & Buổi Học"*).
      - Disables the submit buttons (*"Mở Lớp & Sinh Lịch Học"*, *"Lưu Khung Giờ & Đồng Bộ Buổi Học"*) whenever a conflict condition is active, preventing accidental database collisions.
      - Displays a conflict alert banner on class cards in Section 2 with instructions to adjust room/time slots.
      - Implements Quick Room Suggestion Chips (`P.301` through `P.305`, `Lab 01`, `Lab 02`) with automated suggestion of vacant rooms upon opening modals.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.62s with 3054 modules transformed and zero errors.


20. **Schedule Slot In-Place Mutation (409 Conflict Resolution) & Early Warning Normalization (`AcademicManagerDashboardView.jsx`, `EarlyWarningsMentorPanel.jsx`)**:
    - **In-Place Weekly Slot Editing & Deletion**:
      - Replaced the append-only schedule slot behavior in Modal 5 with an interactive slot management table displaying existing weekly slots with Day, Time, and Room.
      - Provided inline ✏️ *"Đổi Phòng / Giờ"* (Edit) and 🗑️ *"Xóa"* (Delete) actions for each weekly schedule slot.
      - In edit mode (`editingSlotIdx !== null`), `handleSaveWeeklySlotAndGenerate` replaces the designated slot in-place within `finalSlots`, completely purging the conflicting room assignment (`P.301`) before dispatching to the Backend API `saveClassWeeklySchedules`.
      - Updated `scheduleSlotConflict` real-time validation to exclude the slot currently being modified, eliminating spurious conflict alerts once an open room chip is clicked.
    - **Dynamic Student Identity Resolution via Identity REST API (Zero Hardcode) & Alert Deduplication (`EarlyWarningsMentorPanel.jsx`)**:
      - Eradicated all hardcoded student name arrays and hex GUID mappings (`resolveStudentDisplayName`).
      - Integrated dynamic retrieval via `userService.getUsers({ role: 'STUDENT', pageSize: 100 })` querying Identity Service (`GET /api/v1/users`), populating `identityUsersMap` on mount.
      - Prioritizes authentic names delivered by Backend (sourced through gRPC `GetStudentsByIds`), with dynamic fallback to the Identity REST API.
      - Preserved client-side alert deduplication (`seenAlerts = new Set()`) to eliminate duplicate cards for the same student/alert pair.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 2.13s with 3054 modules transformed and zero errors.


21. **4-Domain × 3-Tier Matrix Placement UI (`AcademicManagerDashboardView.jsx`, `practiceService.js`)**:
    - Replaced the single-class `MaxK` clustering UI in Section 3 with a structured **4-Domain × 3-Tier (12-Class) Matrix** interface.
    - Added configurable threshold inputs (`foundationThresholdPct` default `50%`, `advancedThresholdPct` default `75%`) and `includeEmptyClasses` toggle.
    - Renders 4 domain rows (`DOM_LANG`, `DOM_MATH`, `DOM_NAT_SCI`, `DOM_SOC_SCI`) × 3 proficiency tier columns (`Cơ bản`, `Tăng tốc`, `Nâng cao`) with average mastery bars, `X/20 HS` capacity indicators, readiness badges, and direct teacher assignment actions.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 2.13s with zero errors.

22. **Teacher Role End-to-End Upgrade: User-Centric Experience, Dynamic Rosters & Proctoring Review (`TeacherDashboardView.jsx`, `TeacherProctoringReviewModal.jsx`, `TeacherStudentDrillDownModal.jsx`, `ClassMicroGroupsModal.jsx`, `EarlyWarningsMentorPanel.jsx`, `practiceService.js`, `Sidebar.jsx`, `App.jsx`)**:
    - **User-Centric & Pedagogical Language Refactor (Zero Statistical Jargon)**:
      - Purged all raw mathematical, statistical, and developer jargon (`IRT \theta`, `P(L_t)`, `Bimodal \sigma \ge 0.28`, `Force Aggregate`, `Drill-Down`, `SEM`, `Liêm chính học thuật`, `BKT`, `Offline Station`) from all teacher-facing views and modals.
      - Standardized all copy into natural, encouraging Vietnamese pedagogical phrasing: `Tiến Độ Học Tập Theo Chuyên Đề`, `Học Sinh Cần Hỗ Trợ`, `Chuyên Đề Cần Củng Cố`, `Kiểm Tra Bài Thi Bất Thường`, `Xếp Nhóm Học Tập (3–5 Em)`, `Cập Nhật Dữ Liệu`, `Xem Chi Tiết`.
      - Replaced raw numeric `\theta` scores with an intuitive 5-tier pedagogical evaluation: **Xuất sắc**, **Giỏi**, **Khá**, **Trung bình**, and **Cần bồi dưỡng**.
      - Fixed `ReferenceError: RotateCw is not defined` bug when toggling to proctoring review queue.
    - **Tri-View Pedagogical Dashboard**:
      - Integrated 3 dedicated view tabs in `TeacherDashboardView`: (1) Tiến độ học tập theo chuyên đề & Xếp nhóm học tập 3–5 em (Core Flow 5), (2) Học sinh cần hỗ trợ & Lịch tư vấn (Core Flow 6), (3) Kiểm tra bài thi bất thường (Core Flow 3 / BR-20).
      - Replaced static class definitions with dynamic asynchronous roster retrieval via `practiceService.getClasses({ teacherId })`, rendering intuitive guidance when no assigned classes are found.
    - **Proctoring Review Dossier Modal (`TeacherProctoringReviewModal.jsx`)**:
      - Displays real-time proctoring queue querying `/api/practice/mock-exams/flagged-reviews` (`TCH_19` - `TCH_27`).
      - Renders Visual Audit Trail webcam snapshots with timestamp and face detection validation tags.
      - Displays tab departure counter (BR-20) highlighted in red when exceeding threshold (> 3).
      - Enforces teacher verdict selection (`APPROVED` / `DISQUALIFIED`) with mandatory pedagogical review notes before dispatching `PATCH /api/practice/mock-exams/{id}/mentor-review`.
    - **Student Profile Modal (`TeacherStudentDrillDownModal.jsx`)**:
      - Click-to-inspect student profile (`TCH_06`): retrieves real diagnostic submissions history via `GET /api/practice/diagnostic-submissions/student/{studentId}`.
      - Identifies weak skill gaps (under 50%) with 1-click action to assign to study groups.
      - Includes direct pedagogical feedback composer transmitting notes and guidance to students and parents.
    - **Progress Export & Clean State Handling**:
      - CSV export action (`TCH_07`) generating downloadable spreadsheet with mastery percentages across all domain skills.
      - Eradicated all static demo group arrays in `ClassMicroGroupsModal.jsx` and seed fallbacks in `practiceService.js`, displaying clean empty states with clear trigger CTAs.
      - Streamlined Teacher Sidebar from 10 flat/redundant items down to 6 structured items grouped into 3 operational pillars (Class Management, Curriculum & Exams, Moderation & AI), eliminating all duplicate routes and label truncation.
      - Rectified route interception in `App.jsx`, ensuring Teacher role properly accesses `TeacherDashboardView` with dynamic `initialView`, `AiTutorModerationView`, and `TeacherPortalView`.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.18s with 3078 modules transformed and zero errors.

23. **Teacher Schedule & Real-Time Attendance Management Subsystem (`TeacherScheduleView.jsx`, `practiceService.js`, `Sidebar.jsx`, `App.jsx`, `ClassMicroGroupsModal.jsx`)**:
    - **Full Real-Time API Synchronization (Zero Mock Fallbacks)**:
      - Integrated `GET /api/practice/schedules/teachers/{teacherId}/schedule` returning all scheduled class sessions grouped chronologically by date.
      - Integrated `GET /api/practice/schedules/sessions/{sessionId}/attendances` and `POST /api/practice/schedules/sessions/{sessionId}/attendances` for live session roster attendance checks.
    - **4-KPI Teaching Overview**:
      - `Lớp học phụ trách` (Assigned Classes count).
      - `Ca dạy sắp tới` (Upcoming teaching sessions).
      - `Ca đã hoàn thành` (Completed teaching sessions).
      - `Dạy thay / Học bù` (Substitute or makeup sessions).
    - **Multidimensional Filters & Timeline Schedule View**:
      - Real-time search query filtering by Class Name, Room, Course, or Pedagogical Topic.
      - Dynamic Academic Term (`termId`) selector loaded directly from backend terms.
      - Session status toggle (`ALL` | `SCHEDULED` | `COMPLETED`).
      - Chronological date grouping displaying weekday label, start/end time, room number, class badge, course name, topic/skill card, enrolled student tally, and live attendance rate percentage.
    - **Interactive In-Class Attendance Modal (`TeacherAttendanceModal`)**:
      - Modal roster pulling enrolled students with initial status from database or fallback to class roster.
      - 4 Status toggles: **Có mặt** (`PRESENT`), **Đi muộn** (`LATE`), **Vắng mặt** (`ABSENT`), **Nghỉ có phép** (`EXCUSED`).
      - 1-Click **"Tất cả có mặt"** action marking entire class present in one click.
      - Student-specific attendance notes and instant submission to `practiceService.submitSessionAttendances`.
    - **Direct Micro-Grouping Integration (`ClassMicroGroupsModal.jsx`)**:
      - Session cards feature a 1-click micro-grouping button (`Layers`) to generate 3-5 student study tables based on the specific session topic.
    - **Sidebar & App Routing Integration**:
      - Integrated `Thời khóa biểu & Điểm danh` (`id: 'schedule'`) under `Quản Lý Lớp Học` on the Teacher Sidebar.
      - Routed `role === 'teacher' && activeTab === 'schedule'` directly to `<TeacherScheduleView currentUser={currentUser} />`.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.27s with 3079 modules transformed and zero errors.

24. **Real Database Integration & Dynamic State Standardization for Teacher Operations (`TeacherDashboardView.jsx`, `TeacherScheduleView.jsx`, `AiTutorModerationView.jsx`)**:
    - **Class Heatmap Matrix Real-Time Synchronization (`TeacherDashboardView.jsx`)**:
      - Standardized class selection model to cleanly resolve both `classId` and `id` properties from `/api/practice/classes`, resolving the zero-student rendering issue.
      - Connected 100% live data from PostgreSQL via `/api/practice/classes/{classId}/heatmap`, populating actual class roster (6 enrolled students), individual IRT $\theta$ competencies, bimodal polarized skills, and pedagogical alert triggers.
    - **Dynamic Class Filtering & Live Attendances in Schedule View (`TeacherScheduleView.jsx`)**:
      - Added dynamic Class Selector dropdown populated from `practiceService.getClasses()`, allowing teachers to inspect sessions for specific classes or aggregate across all active classes.
      - Replaced all static numeric fallbacks with live properties (`enrolledStudentsCount` / `totalStudentsCount`) and dynamic percentage calculation: `Math.round((presentCount / studentCount) * 100)`.
      - Augmented attendance modal with automatic student name resolution against class heatmaps, eliminating raw GUID labels.
    - **Complete Eradication of Seed Interactions in AI Tutor Moderation (`AiTutorModerationView.jsx`)**:
      - Completely removed mock array `SEED_INTERACTIONS` and hardcoded asymptote mathematical strings.
      - Directly binds to 50 real dialogue sessions fetched from `GET /api/practice/ai-tutor/interactions`, displaying actual student questions, student choices, ground-truth answers, and AI Socratic conversation transcripts.
      - Implemented clean empty state presentation when no reported dialogues are pending review.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.22s with 3079 modules transformed and zero errors; backend Practice Service builds with 0 warnings and 0 errors.

25. **Weekly Timetable Matrix Architecture Subsystem (`TeacherScheduleView.jsx`)**:
    - **Streamlined Harmonious Header Architecture**:
      - Purged the oversized dark navy hero banner in favor of a minimalist, unified white card design directly integrating the table controls and a compact `RefreshCw` reload button.
    - **8-Column Weekly Grid Matrix Layout**:
      - Transformed schedule view into a standard academic 8-column timetable matrix: Column 1 allocates 6 structured slots (Slot 1: 07:30–09:30, Slot 2: 09:45–11:45, Slot 3: 13:00–15:00, Slot 4: 15:15–17:15, Slot 5: 18:00–20:00, Slot 6: 20:15–22:30), while Columns 2–8 map days Monday through Sunday.
      - Dynamic date computation (`getMonday`, `formatDateVi`, `toYMD`, `isSameDay`) automatically calculates current week boundaries `Tuần (DD/MM - DD/MM)`.
      - Real-time column highlighting dynamically highlights the current calendar date with high-contrast emerald borders and subheadings.
      - Empty grid slots display a clean minimalist dash `-`, matching standard university portals.
    - **Detailed Session Slot Cards**:
      - Render class code, attendance completion badges (`PRESENT` tallies vs unrecorded state), room assignment, Offline/Online mode, lecturer name, topic badge, and enrolled student counts.
      - Integrated direct attendance launch button (`handleOpenAttendance`) and micro-group generation (`ClassMicroGroupsModal`).
    - **Week Navigation & Dual View Modes**:
      - Controls for previous week, current week, and next week, complemented by an intelligent fast-forward banner jumping to the nearest scheduled teaching week.
      - Seamless dual-mode toggling between `Lưới tuần` (Matrix Grid) and `Danh sách` (Agenda List).
    - **Verification**: `npm run build` compiled cleanly in 1.71s with zero warnings or errors.

26. **Pedagogical Alerts Modal & Ergonomic View Architecture (`TeacherDashboardView.jsx`)**:
    - **Consolidated Alert Strip**:
      - Replaced sprawling full-width alert cards with a compact, non-intrusive alert strip featuring count badges and an explicit launch action.
    - **Dedicated Modal Overlay (`isAlertsModalOpen`)**:
      - Modal overlay renders a scrollable view (`max-h-[85vh]`) containing structured diagnostic alert items with comprehension percentages, struggling student tallies, and direct micro-group assignment triggers (`handleOpenMicroGroups`).
    - **Verification**: `npm run build` compiled cleanly in 1.32s with zero warnings or errors.

27. **Removal of Redundant Desktop Sidebar Toggle Controls (`Sidebar.jsx`, `AccountNavbar.jsx`)**:
    - **UI Clutter Elimination**:
      - Discarded duplicate `PanelLeftClose`/`PanelLeftOpen` buttons rendered adjacent to one another along the border dividing the brand header and navbar.
      - Preserved the mobile responsive navigation trigger (`Menu`) for compact screens while establishing a clean, distraction-free desktop layout header.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.32s with 3079 modules transformed and zero errors.

28. **Comprehensive Dynamic Data Standardization & Elimination of Static Fallbacks Across Teacher Operations (`TeacherScheduleView.jsx`, `AiTutorModerationView.jsx`, `ClassMicroGroupsModal.jsx`, `TeacherStudentDrillDownModal.jsx`, `practiceService.js`)**:
    - **Dynamic Session Resolution (`TeacherScheduleView.jsx`)**:
      - Purged static instructor fallback strings (`'Teacher Khôi'`) in favor of dynamic identity hierarchy: `s.primaryTeacherName || currentUser?.fullName || currentUser?.name || 'Giảng viên phụ trách'`.
      - Replaced hardcoded `'Offline'` pills with context-aware delivery mode indicators (`Online` vs `Offline`) resolving rooms and virtual URLs.
      - Standardized fallback room presentation to display `'Trực tuyến'` or `'Chưa xếp phòng'` instead of arbitrary room identifiers (`'P.301'`).
    - **Telemetry & Grounding Normalization (`AiTutorModerationView.jsx`)**:
      - Replaced static telemetry labels (`97.6%`, `142 Exemplars • 68 Traps`) with real-time computations derived directly from current interaction records (`socraticReliability`, `exemplarsCount`, `trapsCount`).
      - Stripped predetermined boilerplate steps from authoring inputs to foster genuine educator evaluation.
    - **Micro-Group Auto-Packaging & Native Printing (`ClassMicroGroupsModal.jsx`)**:
      - Omitted client-side synthetic identifiers (`Math.random()`), enabling backend `AssignGroupWorksheetCommandHandler` to automatically package Bloom L1–L3 questions targeting groups' common weak skills.
      - Integrated native `window.print()` functionality for instant classroom seating chart distribution.
    - **Persistent Pedagogical Counseling Record (`TeacherStudentDrillDownModal.jsx`)**:
      - Replaced mock `setTimeout` simulation with a resilient local history cache per student, displaying timestamped remarks in chronological order.
    - **Strict Exception Handling (`practiceService.js`)**:
      - Eliminated synthetic fallback objects in `forceAggregateClassHeatmap`, ensuring backend anomalies surface genuine error notifications.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.49s with 3079 modules transformed and zero errors.

29. **Academic Director Role Clarification & Read-Only Supervision Mode (`CampusManagerDashboardView.jsx`, `Sidebar.jsx`, `App.jsx`)**:
    - Preserved all 4 core Academic Director modules (`AiTutorModerationView`, `CurriculumExplorerView`, `Textbook*View`, `Exam*View`) completely untouched.
    - Refined `Sidebar.jsx` Director menu to 5 role-aligned items under *"Quản Trị Học Thuật Toàn Trường"*, removing misrouted Teacher/Student/Admin entries and removing the `Flow 4` badge that truncated the label.
    - Implemented `isDirectorMode` directly inside `CampusManagerDashboardView.jsx`, defaulting to All-Campuses (`ALL`) multi-campus aggregation with a dedicated Cross-Campus Comparison Table, removing hardcoded greeting names and the `67%` fallback, wiring real KPI counts from `contentService.getSkillsTree()` and `contentService.getMockExams()`, adding 4 quick-access pillar cards, and hiding operational Manager/Teacher/Admin actions.
    - Resolved Logout Race Condition across `App.jsx`, `apiClient.js`, `authService.js`, and `PublicHeader.jsx` via `sessionVersion` guards, preventing ghost `USER_KEY` writes without a valid access token, optimistic state clearing, and `isAuthenticated()` checks on the public header.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.96s with 3076 modules transformed and zero errors.

30. **Real-Time Academic Term & Course Synchronization to Student/Parent Tuition Portal & Course CRUD UI (`TuitionPaymentView.jsx`, `AcademicManagerDashboardView.jsx`, `practiceService.js`)**:
    - **Elimination of Hardcoded 3-Package Mock Array in `TuitionPaymentView.jsx`**:
      - Removed the static 3-package array (`1.8M / 2.4M / 3.2M VND`) completely to align with the V-ACT 2-wave/year enrollment model.
      - Implemented `loadCampusTermsAndCourses` fetching `practiceService.getAcademicTerms({ campusId, status: 'ACTIVE' })` and `practiceService.getCourses({ campusId, isActive: true })` scoped to the student's campus.
      - Added an Active Academic Term Banner displaying the active wave's name, academic year, and enrollment date range, followed by a responsive dynamic grid rendering the exact database courses (code, title, real tuition fee, duration, 20-student capacity) wired directly to PayOS VietQR checkout, plus an explicit empty state when no courses are open.
    - **Course Edit & Safe Delete UI in `AcademicManagerDashboardView.jsx`**:
      - Added `updateCourse(courseId, payload)` and `deleteCourse(courseId)` wrappers in `practiceService.js`.
      - Added inline Edit (✏️) and Delete (🗑️) buttons per course row, upgrading the course creation modal into a dual Create/Edit modal with pre-filled values and confirmation prompts.
    - **Verification**: `npm run build` (Vite v8.3.0) compiled cleanly in 1.39s with 3076 modules transformed and zero errors.

31. **End-to-End Student Journey Unification, Standalone White Exam Room, Passage Context Delivery & Full-Spectrum Grade 10–12 3-Zone PLAR Studio (`StudentRoadmapWorkspace.jsx`, `ConnectedRoadmapPage.jsx`, `PlarNodeStudioPanel.jsx`, `DiagnosticAssessmentPage.jsx`, `TuitionPaymentView.jsx`, `PayOsCheckoutModal.jsx`, `practiceService.js`)**:
    - **Standalone Full-Viewport White Exam Room (`DiagnosticAssessmentPage.jsx`)**: Mounted active exam-taking and grading states (`stage === 'testing' || stage === 'analyzing'`) directly onto `document.body` via `createPortal` with `fixed inset-0 z-[200] w-screen h-screen overflow-y-auto bg-white` and background scroll lock, completely eliminating transparent background bleed-through (`bg-transparent`) from the embedded student portal layout.
    - **Full-Spectrum Grade 10–12 3-Zone Personalized Roadmap (`ConnectedRoadmapPage.jsx`)**: Displays all ~337 GDPT 2018 patterns across Grades 10–12 and all 9 subjects grouped into 3 distinct pedagogical priority zones: **(1) Priority Improvement (`WEAK` — tested & below threshold, shown first)** → **(2) Assessed & Mastered / Completed (`MASTERED` & `COMPLETED` — shown after weak skills, collapsible)** → **(3) Unassessed Grade 10–12 Spectrum (`UNASSESSED` — chapters/patterns not yet encountered in the 30-question diagnostic, shown at the bottom with an explicit `"Chưa đánh giá"` badge)**, equipped with Zone tabs, Grade (`Lớp 10`, `Lớp 11`, `Lớp 12`) filters, 9-Subject filters, instant search, and a 1-click upgrade banner for legacy 24-node roadmaps.
    - **Reading Passage Context & 4-Phase PLAR Studio (`PlarNodeStudioPanel.jsx`)**: Added `PassageContextBox` to render reading comprehension passages (`passageTitle`, `passageContent`, `passageImageUrl`) above questions in Phase P (`Preview`), Phase A (`Apply`), and `BR-03` (`Remedial`); wired all 8 `StagesController` endpoints including persisted reflection display (`confidenceRating`, `learnedSummary`, `mistakeNotes`).
    - Hardened `TuitionPaymentView` and `PayOsCheckoutModal`, purged 100% of mock/seed fallbacks (`sampleQuestionsForDiagnostic`, `845/920`, `"Phạm Minh Hoàng"`), and resolved runtime `ReferenceError` bugs in `Sidebar.jsx` and `LearningAnalyticsView.jsx`.
    - **Verification**: `oxlint` (`0 Error`), `node --test tests/*.test.js` (`22/22 Passed`), `npm run build` (`3077 modules`, `4.63s`).

32. **Exam Parser Rendering Hardening: Vietnamese Prose Guard, LaTeX/Table Recovery, False-Figure Suppression & Cross-Subject Auto-Healing (`MathText.jsx`, `examParserUtils.js`, `ExamMediaLightbox.jsx`, `examCurriculumMatcher.js`, `examStateBridge.js`) [20/11/2026]**:
    - **Root Cause Analysis**: `\b` word boundaries and `\w` do not treat accented Vietnamese letters as word characters, so KaTeX auto-wrapping split words (`có sẵ n`, `hế t - V âng`); MathType PUA glyphs surfaced as `≡`; `\ne`/`\circC`/`<u>` were mangled; text-only analytic stems received false figure boxes; and 2-letter substring matching leaked English/Math questions into Physics/Chemistry nodes.
    - **Implementation Details**: Introduced `VI_WORD_CHAR` boundary guards, prose-hyphen guard, `\begin{cases}` wrapping, `<u>` protection, `\circC` repair, adjacency-matrix-to-Markdown-table conversion, `hasFalsePositiveFigureText` + `onError` image fallback, whole-word keyword matching with English detection, and cross-subject self-healing of cached `curriculumNode`s on restore.
    - **Verification**: `examStateBridge.test.js` `3/3`, `tests/*.test.js` `22/22`, `oxlint` `0 errors`, `npm run build` succeeded. Not deployed to Docker per user request.
    - **Round 2 & 3 Follow-up**: Hardened `MathText.jsx` `richInlineRegex` to directly match `<s*ub[^>]*>[sS]+?<s*/s*us*>` rendering into standard `<u>` elements without relying on pre-cleaning; refined `repairDegreeUnits` to prevent accidental `$$$` math wrapping on already-delimited degree terms; embedded cross-subject guards in `normalizeQuestionItem` and `ExamPaperView.jsx` preventing English error-identification questions (Questions 26–29) from surfacing Physics/Chemistry/Math nodes; and added auto-healing to `useExamWorkspaceController.js` upon curriculum retrieval. Verified: `examStateBridge.test.js` `5/5`, `tests/*.test.js` `22/22`, `npm run build` succeeded.

33. **SessionStorage Cache-Busting, Underline Normalization & Stray Letter Filter (`examTextRepair.js`, `examParserUtils.js`, `MathText.jsx`, `examStateBridge.js`) [21/11/2026]**:
    - **Root Cause Analysis**:
      - Even after logic fixes in `MathText.jsx` and `examTextRepair.js`, the browser retained stale state stored in `sessionStorage` under `veval_active_exam_workspace_v1`, causing already-parsed exams to persist literal `<u>` tags and outdated subject nodes.
      - Scanned passage extracts in History/Social Science contained isolated single letters (`o`, `g`, `n`, `u`, `V`, `i`, `đ`) resulting from bitmap font PUA splitting in upstream OCR.
    - **Implementation Details**:
      - **SessionStorage Cache-Busting**: Upgraded `STORAGE_KEY` in `examStateBridge.js` to `veval_active_exam_workspace_v2`, automatically evicting corrupt legacy cached exams and triggering clean re-parsing on client load.
      - **Robust Underline Normalization**: `repairUnderlineTags` strips all variant whitespace (`</u >`, `<\/u>`, `$< /u > (A)$`) and converts them to standard `</u>`.
      - **Stray Character Filter**: Added step 1.9 to `examParserUtils.js` to eliminate isolated single consonants (`b-df-hj-np-tv`) on their own lines between substantive prose lines.
    - **Verification**: `node --test src/components/curriculum/examStateBridge.test.js` passed `5/5`, `node --test tests/*.test.js` passed `22/22`, `npm run build` succeeded in 3.47s.

34. **Passage Auto-Healing, Trapped Question Extraction & Pure Underline Error Identification (`examTextRepair.js`, `examParserUtils.js`, `ExamPaperView.jsx`, `MathText.jsx`, `examStateBridge.js`) [21/11/2026]**:
    - **Passage Swallowing & Single-Letter Fragment Elimination**:
      - Root cause: History passage 118–120 in real exam PDFs uses bare numbered stems (`118.`, `119.`, `120.`) without the prefix `"Câu"`. Upstream regex matching swallowed child questions into the passage body and left `passage.questions: []` (displaying "0 câu").
      - Implementation: Added `healHistoryPassageAndTrappedQuestions` and `extractTrappedQuestionsFromPassage` in `examParserUtils.js` to automatically extract swallowed child questions and restore clean text.
    - **Elimination of Inline (A), (B), (C), (D) Markers**:
      - In error-identification questions (Questions 26–30), `repairUnderlineTags` strips all inline `(A)`, `(B)`, `(C)`, `(D)` labels (including math-mode `($C$)`), while `MathText.jsx` applies `font-bold underline` styling to target words so that only the question options below handle candidate selection.
    - **Session Cache-Busting**:
      - Upgraded `STORAGE_KEY` to `veval_active_exam_workspace_v3` in `examStateBridge.js`.
    - **Verification**: `node --test src/components/curriculum/examStateBridge.test.js` passed `6/6`, `node --test tests/*.test.js` passed `22/22`, `npm run build` succeeded in 3.52s.

### [21/11/2026] - Resolve frontend pull conflicts against 682c9e2
Merged incoming textbook/exam workspace tooling, parent tuition targeting, API course catalog and collapsible navigation with the local weekly calendar, mock exam room, profile prerequisites and server-authoritative payment/resume logic. Retained the user-requested single student curriculum view and deletion of the obsolete ConnectedRoadmapPage/StudentRoadmapWorkspace; removed their incoming route/import. Kept the schedule navbar subtitle and non-wrapping theta summary. Both payment completion and failure callbacks are preserved. Added stale-request protection when changing the selected student and used the incoming dynamic course catalog for resumed invoices.
Validation: 119 unit tests passed, production build passed, five sidebar/navbar/student-parent payment render checks passed, and Chrome mocked-API exam scenarios passed (passages, flags, resume, third-violation and timeout submissions). Both documentation histories retained. Separately resolved documentation-only stash conflicts in the legacy V-Eval-Web_Client copy without committing its staged source or untracked environment/settings files. Backend repositories remained unchanged. The system root already had a separate pending merge without unmerged paths; it is outside this frontend merge commit.


## [22/11/2026] Admin frontend acceptance

The Admin workspace now separates platform administration from academic management. Its six sections cover overview, accounts, role descriptions, campus directory, general/AI setting drafts, and operations readiness. The legacy app role `admin` is retained for compatibility with the current authentication service.

Account and campus data use existing Identity contracts through `userService`. Account pagination is server-driven with 50 entries per page. Search and campus filters are submitted to the existing query endpoint. A request version prevents stale account-list responses from replacing a newer result. Self-deactivation is blocked in the frontend only; server authorization remains authoritative.

Settings are clearly labeled drafts stored in per-user session storage; they never apply runtime settings or persist API secrets. Campus mutations, existing-user role changes, granular permissions, audit retrieval, infrastructure health and backup/restore are not represented as completed integrations. The Identity controller currently marks user-list, provisioning and status endpoints with `AllowAnonymous`; backend authorization must be addressed separately before production use.

Validation: `npm run build -- --configLoader runner` passed, and `node --test tests/*.test.js` passed 79 tests. The default bundled config loader encountered native-module/sandbox issues; the runner loader succeeded. Existing bundle-size and JSXGraph eval warnings remain. No browser automation or live administrative mutation was performed.


### [22/11/2026] Dedicated dashboard acceptance

AdminDashboard replaces the initial overview with account metrics, a six-role distribution, activation ratio visualization, active campus preview and administration shortcuts. Role totals come from independent filtered queries rather than counting a paginated sample. Each request fetches at most one user record. Multi-role totals may overlap and are labeled accordingly. The component cancels state updates after unmount; failed role counts remain unavailable. Account activation is explicitly distinguished from online presence. Operations remain labeled as not connected. The production build passed with `npm run build -- --configLoader runner`; browser interaction and live API behavior were not verified.

### [22/11/2026] Admin Enterprise UI & Workspace Modernization Acceptance

The Admin interface (`AdminDashboard.jsx` and `AdminWorkspace.jsx`) has been elevated into an Enterprise-grade Command Center:
- **Executive Hero Hub**: Styled with an executive dark ambient gradient (`from-slate-900 via-indigo-950 to-slate-900`), live pulse telemetry ("100% Microservices Online"), real-time synchronization clock, and direct quick-action buttons.
- **KPI Metrics**: 4 elevated cards with hover elevation, vibrant gradient icon backdrops, micro-trend badges, and dynamic active ratio percentages.
- **Role IAM Distribution**: Dedicated visual role cards for all 6 system roles (Student, Parent, Teacher, Academic Manager, Academic Director, Administrator) with role code badges, live count tabular numerals, and individual gradient meter bars.
- **Radial Account Health Gauge**: SVG circular gauge showing active vs inactive accounts alongside actionable IAM security guidance notes.
- **RBAC Matrix Dossier**: Detailed inspection panel for the 6 roles covering authority tiers, core mission, data boundary policy (campus-scoped vs global), permitted capabilities checklist, and a 1-click bridge to account provisioning.
- **Multi-Campus Directory**: Card grid with real-time text filter, campus code mono badges, phone hotline, address, and personnel lookup links.
- **System Settings Console**: High-tech configuration console covering platform identity, Google Gemini / OpenAI LLM selection, token and rate limit policies, and maintenance mode toggle with session persistence and toast feedback.
- **Telemetry & Disaster Recovery Hub**: Real-time status cards for 5 microservices + PostgreSQL/Redis with simulated latency metrics, automated daily 02:00 AM backup schedule details, and an interactive snapshot trigger.
- **Validation**: Full production build `npm run build` completed cleanly in 2.12s (`3343 modules transformed`, 0 compilation errors).



### [22/11/2026] Form validation acceptance

The student profile previously relied on backend phone validation and frontend nonempty name checks. Shared contact validation now rejects invalid or blank names/phones before profile requests. Parent and account-creation services reuse the same Vietnamese telephone format as Identity. FormValidationBoundary checks native form required values after trimming, phone/email formats and numeric constraints before submit handlers. Required passwords reject whitespace-only values without modifying password bytes.

The shared API client trims JSON string values recursively and multipart metadata on writes. Password/token/secret/API-key fields and uploaded file content remain unchanged. Optional fields are not globally made mandatory. This is a common form and transport layer, not a complete audit of every custom button-driven business rule. Five focused tests cover invalid contacts, optional email behavior, immutable nested normalization, native field checks and multipart preservation. Build passed with the runner config loader; all 84 frontend tests passed. Browser/live API verification is pending.


### [22/11/2026] Provisioning field policy

Provisioning now reflects the Identity handler profile model. Teacher and Academic Manager profiles require campus association, and Student requires a study campus. Parent, Academic Director and Administrator profiles have no campus requirement. Specialty belongs only to Teacher. The UI and service use a shared role policy, ensuring hidden stale values cannot leak into requests. Role-specific labels and a neutral login email replace staff-only labels. The account activation note no longer exposes database internals. Production build and two focused role-policy tests passed. Browser/live API creation was not performed; backend validation behavior is unchanged.


### [22/11/2026] Provisioning password acceptance

Initial passwords no longer default to a shared value. The modal starts and reopens with an empty password; successful creation also clears it. The payload builder rejects blank/weak passwords and leading/trailing whitespace, avoiding mismatches with the existing backend provisioning handler which trims passwords. Password generation is explicit and guarantees uppercase, lowercase and numeric characters. Production build and all three provisioning-policy tests passed. No backend mutation or browser-based account creation was performed.


### [22/11/2026] Account dialog keyboard acceptance

AccountProvisioningView now registers an Escape key handler only while a dialog is open and cleans it up on close/unmount. It ignores IME composition and prevents dismissal during account creation or status mutation. Provisioning close/cancel buttons use the same guard. The production build passed. Browser keyboard behavior was not directly verified.


### [22/11/2026] Account role display acceptance

Status dialogs previously rendered only roles?.join, leaving empty arrays or missing roles blank. Shared accountRoles normalization now supports plural and singular role representations and renders Vietnamese labels. Missing roles are explicitly unavailable, never inferred as Student. Backend query includes UserRoles/Role, but the affected live account response and database assignments were not inspected. Production build passed.


## [23/11/2026] - Local checkpoint acceptance

Checkpoint current admin workspace, account provisioning, role labels, modal dismissal, profile/contact validation, request normalization and related tests.

Verification: Production build passed using Vite runner with createRequire. Validation tests: 8/8 passed. Browser and live API checks not performed.

This checkpoint preserves the existing implementation before further remote integration; it does not claim live API or browser acceptance.

28. **PLAR Learn Phase Theory Height Uncapping, SGK Knowledge Hydration & Pedagogical Knowledge Base Enrichment (`PlarNodeStudioPanel.jsx`, Supabase PostgreSQL `v_eval_content."Materials"`) [21/11/2026]**:
    - **Problem & Root Cause**:
      - Students reported that the theory learning framework in the PLAR Learn phase was truncated/cut short, showing only the beginning snippet compared to the full textbook material available in the SGK curriculum view.
      - Investigation identified two contributing factors:
        1. In the database (`v_eval_content."Materials"`), milestone materials only contained brief 700-character summaries without full GDPT 2018 definitions, equation variants, relative positions, angles, distances, and exam trap alerts.
        2. In the frontend component (`PlarNodeStudioPanel.jsx`), `PassageContextBox` applied an inflexible `max-h-72` clamp on long passages, and the Learn phase only displayed direct material items without falling back to textbook knowledge from `getDefaultLessonTheory` or `getSavedTextbookData`.
    - **Implementation Details**:
      - **SGK Theory Bridge Hydration**: Integrated `getDefaultLessonTheory` and `getSavedTextbookData` into `PlarNodeStudioPanel.jsx` to dynamically retrieve lesson definitions and formulas when rendering Phase Learn.
      - **Height Uncapping & Responsive Expand**: Removed all height restrictions from theory content (`overflow-visible`), and enhanced `PassageContextBox` with an interactive `Xem toàn văn / Thu gọn` toggle and expanded default height (`max-h-[460px]`).
      - **Database Content Enrichment**: Enriched the Math 10 milestone material (`224d7f47-d569-5848-acff-5223f9d2665b`) in Supabase PostgreSQL from 722 characters to 4,270 characters containing comprehensive definitions, equations, theorems, step-by-step methods, and VNU-HCM exam traps.
    - **Verification**: `npm run build` succeeded in 4.38s, Docker container `v-eval-web-client` rebuilt and deployed cleanly.


---

### [22/11/2026] - Dedicated Full-Page PLAR Studio with 4 Phase Tabs, Sticky Sidebar & 9-Subject SGK Theory Hydration
- **Target Files**: `ConnectedRoadmapPage.jsx`, `PlarNodeStudioPanel.jsx`, `Sidebar.jsx`.
- **Key Deliverables**:
  1. Replaced the cramped split-screen roadmap layout with a full-width 3-column Knowledge Map and a dedicated full-width **PLAR Studio** view featuring a horizontal 4-tab phase bar (`Preview`, `Learn`, `Apply`, `Reflect`) and back navigation.
  2. Added `resolveSubjectCode` to correctly map Vietnamese subject names to `GDPT_PRESETS` / `getDefaultLessonTheory` codes across all 9 subjects.
  3. Applied `lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto` to `Sidebar.jsx` so navigation stays anchored while scrolling.
  4. **Verification**: `npm run build` succeeded in `1.81s` (`3081 modules`, `0 Error`).

35. **Pedagogical Role Segregation & Two-Tier Human-in-the-Loop Socratic AI Moderation Architecture (TCH-01) (`Sidebar.jsx`, `App.jsx`, `CurriculumExplorerView.jsx`, `TextbookStandardView.jsx`, `ExamBankView.jsx`, `ExamWorkspaceHeader.jsx`, `AiTutorModerationView.jsx`) [22/11/2026]**:
    - **Problem Statement (TCH-01)**:
      - The Instructor portal navigation inadvertently exposed administrative and curation authoring suites (Curriculum Studio, Textbook Ingestion/Authoring, and Exam Bank Parsing/Authoring) mirroring the Academic Director role.
      - In Core Flow 4 (AI Tutor Moderation), Instructors possessed unconstrained system-wide write access, permitting direct overrides of Golden Exemplars and Cognitive Traps into the shared GraphRAG knowledge base without academic governance.
    - **Pedagogical Role Segregation & Read-Only Enforcement**:
      - *Sidebar Redesign (`Sidebar.jsx`)*: Replaced multi-tier authoring suites in the teacher menu with single, dedicated read-only inquiry entries: Curriculum (`Tra cứu cây kiến thức & Bloom`), Textbook Standard (`Tra cứu SGK chuẩn GDPT 2018`), and Exam Bank (`Kho đề thi đã xuất bản`). Ingestion and Studio routes were removed.
      - *Route Guards (`App.jsx`)*: Intercepted direct navigation to authoring URLs for teachers, automatically redirecting them to their respective standard read-only views (`textbook-standard`, `exam-bank`).
      - *Read-Only Enforcement*:
        - `CurriculumExplorerView.jsx`: Suppressed Studio entry buttons, structural additions, and deletion handlers; enforced `instructorMode = false` on `UnifiedNodeDetailView.jsx`.
        - `TextbookStandardView.jsx`: Suppressed curriculum sync, GDPT reset, textbook deletion, and ingestion navigation; displayed an explicit read-only indicator.
        - `ExamBankView.jsx` & `ExamWorkspaceHeader.jsx`: Suppressed `ExamPageFlowBar`, PDF parsing, Bloom generation, and Studio authoring buttons; locked exam headers against database overwrites and deletions, displaying published exams only.
    - **Two-Tier Human-in-the-Loop Socratic AI Moderation (Core Flow 4) (`AiTutorModerationView.jsx`)**:
      - *Tier 1 — Instructor Layer (`role === 'teacher'`)*:
        - Scoped strictly to assigned teaching classes with dynamic class selector filtering.
        - Replaced direct knowledge graph overwrite permissions with a 2-step pedagogical proposal workbench: **Tab 1: Propose Golden Exemplar** and **Tab 2: Propose Cognitive Trap**, omitting report dismissal actions.
        - Proposals persist with instructor provenance metadata and transition interaction logs to `PENDING_DIRECTOR_REVIEW` state.
      - *Tier 2 — Academic Director Layer (`role === 'director'`)*:
        - Provides campus-wide administrative oversight with a dedicated `Đề xuất GV` queue filter tab.
        - Displays prominent proposal inspection callouts with 1-click execution controls:
          1. **Approve & Overwrite Graph (`✓ Phê Duyệt & Ghi Đè Vào Kho RAG Toàn Trường`)**: Ingests proposed solutions/traps directly into `PatternExemplar` or `PatternTrap` nodes in the shared GraphRAG base.
          2. **Reject Proposal (`✕ Từ Chối Đề Xuất`)**: Dismisses the proposal with pedagogical feedback.
        - Retains full 3-tab direct intervention autonomy across all system interactions.
    - **Verification**: `npm run build` compiled 3081 modules in 1.97s with zero errors; unit tests passed 28/28 (`tests/*.test.js` 22/22, `examStateBridge.test.js` 6/6).

38. **Two-Part Flipped Offline Operational Model (TCH-02) & Teacher Maker-Checker Authorization Architecture (`TeacherScheduleView.jsx`, `OfflineSessionPreparationModal.jsx`, `offlineSessionStore.js`, `TextbookIngestView.jsx`, `CurriculumStudioEditor.jsx`, `ExamWorkspaceHeader.jsx`, `tests/offlineSessionStore.test.js`) [23/11/2026]**:
    - **Problem Statement & Pedagogical Principles**:
      - Offline campus sessions must never repeat raw theoretical lectures from scratch (which are studied autonomously online via P-L-A-R, Socratic AI, and SM-2 notebook).
      - Instead, each offline session operates under a strict two-part flipped model:
        1. **Part 1 (First Half • 45–60 mins)**: Collective class test correction focused on high-error skills and V-ACT exam traps identified through real-time class heatmaps.
        2. **Part 2 (Second Half • 45–60 mins)**: Table-based micro-group remediation (3–5 students per table sharing identical learning gaps), accompanied by targeted ZPD worksheets and direct instructor desk coaching.
      - **Decision Rights Matrix**: Instructors possess 100% autonomous authority over Part 1 and Part 2 offline session preparation without requiring Director approval (since questions and worksheets are derived from pre-approved repositories). Operational modifications (rescheduling, room swaps, substitute teaching) require Academic Manager approval to ensure zero campus-wide physical room collisions.
    - **Implementation Details**:
      - *Two-Part Session Card Architecture (`TeacherScheduleView.jsx`)*: Displays structured visual modules for Part 1 (heatmap-driven focus skills and trap alerts) and Part 2 (table micro-groups and ZPD worksheets) in both Weekly Matrix and Agenda List views.
      - *Offline Session Preparation Modal (`OfflineSessionPreparationModal.jsx`)*: Directly hydrates class heatmap metrics (`practiceService.getClassHeatmap`), highlights low-mastery skills (&lt; 50%), and enables seamless 1-click persistence into `offlineSessionStore.js`.
      - *100% Real Student Roster Synchronization & Stale Cache Cleansing (`offlineSessionStore.js`)*: Resolves actual student roster from PostgreSQL database via `getClassHeatmap` and `getSessionAttendances` (`Trần Thái Thịnh`, `Trần Ngọc Mai`, `Mai Thành Nhân`, `Lê Hoàng Long`, `Nguyễn Hoàng An`, `Phạm Tấn Lộc`), discarding any stale mock data in local storage.
      - *Maker-Checker Curriculum & Exam Bank Refinement*:
        - `TextbookIngestView.jsx`: Enforces read-only inspection for teachers, suppressing PDF file uploads and system-level AI parsing.
        - `CurriculumStudioEditor.jsx` & `ExamWorkspaceHeader.jsx`: Renders dedicated Maker banners, restricting teacher persistence to Draft Save and `Gửi duyệt (PENDING_REVIEW)` without unconstrained system-wide publish or deletion permissions.
    - **Verification**: `npm run build` compiled 3083 modules in 1.15s with zero errors; unit tests passed **30/30 passed 100%** (`tests/*.test.js` 22/22, `examStateBridge.test.js` 6/6, `offlineSessionStore.test.js` 2/2).

39. **Curriculum Explorer User Interface & Pedagogical Refinement for Instructors (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `ExamBankView.jsx`, `ExamWorkspaceHeader.jsx`, `TextbookStandardView.jsx`, `TextbookIngestView.jsx`) [23/11/2026]**:
    - **Architectural Motivation**:
      - Technical system indicators, internal database labels, and raw processing terminology (e.g., `(Read-only)`, `Trọng số: ...%`, `Đã nạp SGK (x trang)`, `CẤU TRÚC PHÂN CẤP BÀI HỌC`, `Bloom L1-L4`) create cognitive clutter and reduce usability for pedagogical practitioners.
      - Instructors need clean, intuitive interfaces prioritizing educational content over underlying software mechanics.
    - **Implementation Details**:
      - *Curriculum Explorer (`CurriculumExplorerView.jsx`)*:
        - Replaced technical `(Read-only)` status badges with an intuitive `Khung chương trình chuẩn` tag.
        - Integrated quick Grade selection pills (`Tất cả`, `Lớp 12`, `Lớp 11`, `Lớp 10`) at the top of the chapter hierarchy, immediately reducing list length from 14+ chapters down to 2–7 chapters for active grade teaching.
        - Engineered Split Independent Scroll architecture (`lg:sticky lg:top-4 lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto`): left chapter navigation and right 3-tier pedagogical detail view scroll independently, guaranteeing that detail content is never dragged out of sight.
        - Added an ergonomic 1-click `Thu gọn hết / Mở tất cả` toggle and compacted chapter card density (`p-2.5 sm:px-3`, `w-7 h-7` badges).
        - Streamlined chapter cards by removing internal weight percentages and raw ingested page counts; replaced with a clean `Sách giáo khoa` indicator and lesson tally.
        - Renamed tree heading to `Danh sách chương` and hid administrator creation buttons (`+ Thêm Chương`) from teacher views.
        - Simplified lesson pattern items by removing `pat.weight` and adopting human-readable mastery categories (`Cần bổ trợ`, `Cần củng cố`, `Đã vững`).
      - *Pedagogical Node Details (`UnifiedNodeDetailView.jsx`)*:
        - Harmonized the 3 knowledge blocks into intuitive pedagogical layers: Core Textbook Theory (`Khối 1: Lý Thuyết Trọng Tâm Chuẩn SGK`), Problem-Solving Methods & Visual Lab (`Khối 2: Phương Pháp Giải & Mô Hình Minh Họa Trực Quan`), and Practice Question Bank (`Khối 3: Ngân Hàng Câu Hỏi Luyện Tập`).
        - Replaced cognitive taxonomy acronyms (L1–L4) with standard educational terms (`Nhận biết`, `Thông hiểu`, `Vận dụng`, `Vận dụng cao`).
      - *System-wide Read-only Badge Harmonization*: Synchronized non-technical, user-friendly labels across `ExamBankView.jsx`, `ExamWorkspaceHeader.jsx`, `TextbookStandardView.jsx`, and `TextbookIngestView.jsx`.
    - **Verification**: `npm run build` compiled 3083 modules in 1.18s with zero errors; unit tests passed **24/24 passed 100%** (`tests/*.test.js`).

40. **3-Way Parent-Teacher-Student Counseling Action Gate Refinement (`EarlyWarningsMentorPanel.jsx`) [23/11/2026]**:
    - **Architectural Motivation**:
      - Initiating formal 3-way pedagogical counseling (`Hẹn Tư Vấn 3 Bên`) requires teacher, student, and parent synchronization. It should be reserved strictly for high-risk critical alerts (Red Alerts) rather than minor weekly pace lags or moderate score target recalibrations (`UNREALISTIC_GOAL`).
    - **Implementation Details**:
      - Constrained the `Hẹn Tư Vấn 3 Bên` action trigger to evaluate `alert.alertType === 'RED'`, removing redundant exposure on goal misalignment alerts.
      - Non-critical alerts now cleanly provide `Ghi Nhận Can Thiệp` to document pedagogical intervention without creating premature calendar commitments.
    - **Verification**: `npm run build` compiled 3083 modules in 1.17s with zero errors; unit tests passed **24/24 passed 100%** (`tests/*.test.js`).

  39. **Comprehensive Teacher Portal Feature Architecture: TCH-03, TCH-04, TCH-05 (`TeacherSubmissionHistoryView.jsx`, `parentTeacherMessagingStore.js`, `ParentEarlyWarningsAndTeacherView.jsx`, `EarlyWarningsMentorPanel.jsx`, `tests/parentTeacherMessagingStore.test.js`) [23/11/2026]**:
      - **Architectural Motivation & Role Segregation Compliance**:
        - *TCH-03 (Student Submission History & Pedagogical Gap Analysis)*: Eliminates single static class constraints by integrating dynamic multi-class rosters (`practiceService.getClasses({ teacherId })`) and hydrating comprehensive tripartite submission categories: (1) Diagnostic Assessments (30 questions, IRT Theta 0 estimation, 4-domain radar charts); (2) Adaptive Practice (ZPD and Topic Quizzes); and (3) Standardized V-ACT Mock Exams (120 questions with proctoring audit trail). Enables teachers to inspect granular question-level errors rendered with LaTeX math expressions (`MathText.jsx`) and attach targeted pedagogical notes.
        - *TCH-04 (Bidirectional Parent-Teacher Messaging)*: Implements reactive asynchronous message bus `parentTeacherMessagingStore.js` with CustomEvent dispatching (`veval:parent-teacher-message`). Bridges Parent Portal (`ParentEarlyWarningsAndTeacherView.jsx`) and Teacher Portal (`EarlyWarningsMentorPanel.jsx`), enabling parents to submit inquiries tied to specific early warnings and empowering teachers to deliver immediate pedagogical guidance back to parents.
        - *TCH-05 (Multi-Tier Early Warning Escalation Governance)*: Enforces strict separation of pedagogical responsibilities: Tier 1–2 alerts (Yellow reminders & Unrealistic goals) are directly mentored by classroom teachers, whereas Tier 3 alerts (Red high-risk, protracted stagnation > 7 days) are routed via a dedicated escalation workflow ("Chuyển Lên Quản Lý Cơ Sở (Họp 3 Bên)") to Campus Managers for institutional 3-way conference coordination.
      - **Verification & Acceptance Metrics**:
        - Test suite `tests/parentTeacherMessagingStore.test.js` verified 100% pass across all messaging and reply flows.
        - Total unit test coverage: 26/26 tests passing in 169ms.
        - Production build: `npm run build` completed in 1.25s (3085 modules transformed, 0 warnings/errors).

41. **Zero Raw GUID Leakage & Real Identity Resolution in Class Micro-Groups Architecture (`ClassMicroGroupsModal.jsx`, `offlineSessionStore.js`, `tests/classMicroGroups.test.js`) [23/11/2026]**:
    - **Architectural Motivation**:
      - Automatic table clustering algorithms partition students into homogeneous capability clusters (3–5 students per table). However, returning raw UUID strings for `CommonWeakSkillIds` caused cards to overflow vertically with dozens of red GUID tags, obscuring student rosters and breaking modal responsiveness.
      - Furthermore, student names must be resolved from real system identities in PostgreSQL via gRPC, and classes containing homonymous students (such as two distinct students sharing the name "Phạm Tấn Lộc") require transparent disambiguation suffixes (`#8A51` vs `#B099`) to prevent instructor confusion.
    - **Implementation Details**:
      - *Concurrent Multi-Source Data Hydration*: In `ClassMicroGroupsModal.jsx`, fetches class micro-groups (`practiceService.getClassMicroGroups`), class heatmap (`practiceService.getClassHeatmap`), and curriculum tree (`contentService.getSkillsTree`) in parallel.
      - *GUID Suppression & Vietnamese Skill Name Resolution*: Built `skillNameMap` resolving GUIDs to clean pedagogical names. Implemented regex check `isRawGuid` ensuring zero raw UUIDs leak into the interface.
      - *Ergonomic Weakness Tag Capping*: Weak skill tags are strictly capped at 2 per table card, with a subtle `+X chuyên đề khác` badge showing all remaining skills on tooltip hover.
      - *Homonym Student Disambiguation*: Built `nameFrequencyMap`; when multiple enrolled students share identical full names, attaches short unique 4-character ID suffixes derived from their PostgreSQL `StudentId` (e.g. `Phạm Tấn Lộc (#8A51)` and `Phạm Tấn Lộc (#B099)`).
    - **Verification & Acceptance Metrics**:
      - New test suite `tests/classMicroGroups.test.js` verified UUID detection, skill name mapping, and homonym disambiguation.
      - Unit test suite: 29/29 tests passed 100% (`node --test tests/*.test.js`).
      - Production build: `npm run build` completed in 1.23s (3085 modules transformed, 0 errors).

42. **Skill-to-Student Drill-down, Targeted Remedial Group Scheduling & Instructor Autonomy (`TeacherDashboardView.jsx`, `ClassMicroGroupsModal.jsx`, `OfflineSessionPreparationModal.jsx`, `remedialSessionStore.js`, `tests/remedialSessionStore.test.js`) [23/11/2026]**:
    - **Architectural Motivation**:
      - In pedagogical active learning and flipped classrooms, instructors must not be presented with generic or uncontextualized clusters. The workflow must seamlessly bridge: **Classroom Context Identification -> Struggling Skill Analysis -> Granular Student Drill-down -> Intentional Micro-Group Partitioning -> Remedial Study Session Scheduling (Offline or Live Q&A)**.
      - Furthermore, instructors require full pedagogical autonomy to reassign students between tables based on in-person classroom observations, and the system must clearly explain mathematical partitioning constraints (e.g. why $N=7$ students partitions into $4 + 3$ instead of $5 + 2$, adhering to the strict pedagogical bounds of $3 \le \text{size} \le 5$).
    - **Implementation Details**:
      - *Pedagogical Alert Drill-down*: Enhanced `TeacherDashboardView.jsx` with class identification metadata (`Lớp: [Tên lớp] • Mã: [Mã lớp] • Sĩ số: [Sĩ số] học sinh`) and student drill-down accordions rendering individual struggling students with avatar, name, and comprehension percentage (< 50%). Passes focus skill and student IDs directly to `ClassMicroGroupsModal`.
      - *Remedial Study Session Subsystem*: Created `remedialSessionStore.js` with CustomEvent bus `veval:remedial-session-scheduled`. Supports configuring session date, time slot presets (morning, afternoon, evening, custom), delivery format (Offline classroom or Live Q&A Online), and instructor guidance notes.
      - *Instructor Table Reassignment Autonomy*: Added quick table switchers (`⇄ Sang Bàn X`) on each student row in both `ClassMicroGroupsModal.jsx` and `OfflineSessionPreparationModal.jsx` with soft capacity warnings.
      - *Mathematical Breakdown Explanation*: Upgraded auto-partition notices to display exact table breakdowns (e.g. `Đã xếp thành công 2 nhóm bàn (Bàn 1: 4 bạn, Bàn 2: 3 bạn) cho 7 học sinh theo chuẩn sư phạm 3 – 5 bạn/bàn!`).
    - **Verification & Acceptance Metrics**:
      - New test suite `tests/remedialSessionStore.test.js` verified storage, multi-group scheduling, and deletion.
      - Total test suite: 31/31 unit tests passed 100% (`node --test tests/*.test.js`).
      - Production build: `npm run build` completed in 1.25s with 3086 modules transformed and 0 errors.

43. **Deterministic Focus Skill Partitioning & Anti-Discrepancy Remedial Clustering Subsystem (`ClassMicroGroupsModal.jsx`, `practiceService.js`, `tests/classMicroGroups.test.js`) [23/11/2026]**:
    - **Architectural Motivation**:
      - When instructors click "Tạo Nhóm Bồi Dưỡng" from a specific pedagogical alert (e.g. "Giải quyết vấn đề Hóa học"), the system previously loaded stale historical database clusters generated by generic K-Means across all 66 skills (which selected generic reading or pronoun skills), causing severe cognitive dissonance between the modal's focus banner and the generated station titles.
    - **Implementation Details**:
      - *Deterministic Focus Skill Partitioning (`partitionStudentsForFocusSkill`)*: When `classData.focusSkill` is present, the subsystem enforces exact alignment: partitions class rosters sorted by their specific mastery in the targeted skill, generates focused station names (`Nhóm 01 - Bàn trọng tâm: [Tên chuyên đề]`), binds relevant weakness tags, and generates targeted 5-question micro-worksheets.
      - *Interactive Re-clustering on Group Size Shift*: Clicking size controls (3, 4, 5 students/table) immediately triggers dynamic re-partitioning preserving focus skill alignment while strictly upholding the $3 \le \text{size} \le 5$ pedagogical constraint.
      - *Dynamic Action CTA Binding*: Upgrades action button text to `Tự Động Xếp Nhóm: [Tên chuyên đề]` and provides granular mathematical breakdown notices.
    - **Verification & Acceptance Metrics**:
      - Verified with new unit test `ClassMicroGroups - partitionStudentsForFocusSkill groups students by designated focus skill` in `tests/classMicroGroups.test.js`.
      - Total test suite: 32/32 unit tests passed 100% (`node --test tests/*.test.js`).
      - Production build: `npm run build` completed in 1.27s with 3086 modules transformed and 0 errors.

44. **Precision Remedial Candidate Filtering, Class-vs-Remedial Scope Toggle & Metric Harmonization (`ClassMicroGroupsModal.jsx`, `TeacherDashboardView.jsx`, `EarlyWarningsMentorPanel.jsx`, `rag-service/.env`, `tests/classMicroGroups.test.js`) [23/11/2026]**:
    - **Architectural Motivation**:
      - When instructors click "Tạo Nhóm Bồi Dưỡng" for a designated skill (such as "Giải quyết vấn đề Hóa học" with 4 struggling students), the system must strictly filter down to candidates needing remediation rather than coercing the entire class (7 students) into multiple remedial stations. Pulling non-struggling or unexamined students into remedial tables violates pedagogical zoning principles.
      - Furthermore, the dashboard header alert ("Chưa đạt: 100% (7 học sinh)") was mathematically disjoint from the drill-down list ("Học sinh chưa đạt (4 em)") because backend aggregation defaulted unexamined students to 0.1 mastery.
    - **Implementation Details**:
      - *Targeted Candidate Roster Isolation*: In `ClassMicroGroupsModal.jsx`, `partitionStudentsForFocusSkill` checks `classData.targetStudentIds` and filters down to the exact subset of struggling candidates ($N = 4$). When $N \le 5$, creates exactly 1 micro-station (`GRP-FOCUS-01`) targeting only the 4 students, leaving other students unbothered.
      - *Remedial Scope Switcher*: Added dual-scope toggle on the modal banner: `🎯 Chỉ [X] học sinh chưa đạt` (default) vs `👥 Cả lớp ([Y] học sinh)`, giving instructors complete autonomy to toggle between specialized remediation and whole-class differentiated instruction.
      - *Metric Harmonization*: In `TeacherDashboardView.jsx`, updated calculation to prioritize actual struggling students count derived from student submissions (`strugglingStudents.length`), presenting a consistent `57% (4 học sinh)` aligned across both the summary card and the drill-down accordion.
      - *Responsive Early Warning Strip Layout*: In `EarlyWarningsMentorPanel.jsx`, updated tier banner container with `w-full` and `flex-col sm:flex-row`, preventing pedagogical tier guidelines from collapsing into vertical single-word columns.
      - *Supabase Pooler Transaction Port Configuration*: Switched `DATABASE_URL` in `rag-service/.env` from port `5432` (Session mode, max 15 clients) to port `6543` (Transaction mode), eliminating `EMAXCONNSESSION` pool exhaustion when running alongside .NET EF Core microservices.
    - **Verification & Acceptance Metrics**:
      - Verified with unit test `ClassMicroGroups - partitionStudentsForFocusSkill filters strictly to target struggling students` in `tests/classMicroGroups.test.js`.
      - Unit test suite: 33/33 tests passed 100% (`node --test tests/*.test.js`).
      - Production build: `npm run build` completed in 1.24s with 3086 modules transformed and 0 errors.

45. **Remedial Schedule Isolation Across Focus Skills, Standard 6-Slot Timetable Harmonization & Bi-directional Reactive Calendar Sync (`ClassMicroGroupsModal.jsx`, `TeacherScheduleView.jsx`, `remedialSessionStore.js`, `tests/remedialSessionStore.test.js`, `tests/classMicroGroups.test.js`) [23/11/2026]**:
    - **Architectural Motivation**:
      - When scheduling remedial sessions across multiple focus skills (e.g. "Giải quyết vấn đề Hóa học" vs "Dạng 1: Cơ chế sinh học trọng tâm"), generic station IDs (`GRP-FOCUS-01`) previously resulted in namespace collision in persistent local storage. Consequently, setting an offline remedial date and ca for Chemistry erroneously leaked and appeared as the active schedule for Biology.
      - Furthermore, arbitrary unstructured time strings (such as "14:00 - 15:30") clashed with the institution's official 6-slot timetable grid. Pedagogical remedial sessions must align with the standardized academic slot periods (Slot 1–6) and immediately project into the Instructor Timetable (`TeacherScheduleView.jsx`) with dedicated visual differentiation without requiring manual page reload.
    - **Implementation Details**:
      - *Deterministic Skill-Slug Namespacing*: In `ClassMicroGroupsModal.jsx`, sanitizes Vietnamese skill names (`replace(/[đĐ]/g, 'd')`, Unicode NFD normalization, hyphen cleanup) to generate unique station IDs: `GRP-${skillSlug}-01` (e.g. `GRP-giai-quyet-van-de-h-01` strictly isolated from `GRP-dang-1-co-che-sinh-h-01`). This eliminates cross-skill data collisions.
      - *Standard 6-Slot Timetable Harmonization*: Defined `STANDARD_ACADEMIC_SLOTS` in `remedialSessionStore.js` with exact time ranges and periods (Slot 1: 07:30–09:30, Slot 2: 09:45–11:45, Slot 3: 13:00–15:00, Slot 4: 15:15–17:15, Slot 5: 18:00–20:00, Slot 6: 20:15–22:30). Replaced freeform buttons in `ClassMicroGroupsModal.jsx` with an interactive 3x2 academic slot grid that binds explicit `slotNo`, `startTime`, and `endTime`.
      - *Bi-directional Reactive Timetable Projection*: In `TeacherScheduleView.jsx`, `loadSchedule` dynamically queries all remedial sessions (`getAllRemedialSessions`) and merges them into the weekly matrix based on date and `slotNo`. Added real-time CustomEvent listeners for `veval:remedial-session-scheduled` and `veval:remedial-session-deleted`.
      - *Dedicated Pastel Purple Remedial Card UI & Modal Drill-Down Context Preservation*:
        - *Weekly Timetable Grid Mode*: Renders high-visibility pastel purple cards with a `⚡ Phụ đạo vi mô` badge, focus skill topic, class/station name, enrolled student count, exact slot time range, room, online/offline mode badge, and a direct 1-click CTA `Xem nhóm phụ đạo`.
        - *Agenda / Timeline Mode*: Extends card with detailed participating student rosters and direct access to micro-group station layouts.
        - *Modal Drill-Down Context Preservation*: Fixed missing context in `handleOpenMicroGroups` and `mappedRemedial` by passing full context (`focusSkill`, `focusSkillId`, `targetGroupId`, `targetStudentIds`, `initialMembers`), and implemented multi-criteria scheduled session resolution (`groupId` or `focusArea` match) in `ClassMicroGroupsModal.jsx`, ensuring that opening the modal from the timetable accurately displays the focus skill banner, candidate roster, and scheduled session badge.
    - **Verification & Acceptance Metrics**:
      - Unit test suite: Added 3 new test cases verifying `STANDARD_ACADEMIC_SLOTS`, cross-class aggregation `getAllRemedialSessions`, and schedule collision prevention between Chemistry and Biology; 36/36 tests passed 100% (`node --test tests/*.test.js`).
      - Production build: `npm run build` completed in 1.13s with 3086 modules transformed and 0 errors.


## [23/11/2026] - Frontend develop merge resolution

Resolved frontend merge with develop ed26426. Preserved local admin workspace, validation, activation gate, API-backed mock exams, schedule subtitle and payment monitoring; integrated upstream teacher tools, student roadmap workspace, reference drawer and textbook tabs. Adopted compact navbar and synchronized mock-exam menu selection.

Verification: Production build passed with Vite runner/createRequire; all 20 test files passed. Targeted Oxlint returned no errors with existing warnings. Browser/live API acceptance remains pending.
