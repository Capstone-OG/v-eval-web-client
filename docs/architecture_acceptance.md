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
- Features in-exam question navigator, 45-minute timer, flagging, and embedded AI Socratic Tutor guidance.
- Evaluates student ability across 5 core evaluation domains (Mathematics, Logic Reasoning, Language Arts, Natural Sciences, Social Sciences).
- Employs 2-Parameter Logistic (IRT 2PL) probability scoring and Bayesian Knowledge Tracing initial mastery estimation `P(L_0)`.
- Generates 5-axis Recharts Radar Chart and pedagogically calibrated Socratic AI Commentary.

### 4.2. Flow 2: Dynamic Learning Roadmap (Kahn Topo & FSM)
- Visualized in `HeroBanner.jsx` and `MilestoneCard.jsx`.
- Tracks progressive stage unlocking based on Finite State Machine criteria: Lecture Video completion (`>= 80%`) and Quiz mastery (`>= 60%`).

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

---

## 5. Verification & Acceptance Criteria

1. **Clean Production Build**: Executed `npm run build` with 0 syntax or bundle errors; production artifacts outputted to `dist/` within 781ms.
2. **Linter & Code Health**: `npm run lint` passes with 0 syntax errors across all components and services.
3. **Docker Multi-Stage Validation**: `docker compose config` passes with 0 syntax errors across the entire 6-service microservices constellation.
4. **Repository Sync Automation**: Standalone `Scripts/push.bat` and root `Scripts/` correctly recognize `V-Eval-Web_Client` as a first-class project service.
5. **API Gateway Connectivity**: Full client suite structured and verified to consume all microservices endpoints via API Gateway (`:5212`) entry point.


