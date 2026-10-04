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

---

## 5. Verification & Acceptance Criteria

1. **Clean Production Build**: Executed `npm run build` with 0 syntax or bundle errors; production artifacts outputted to `dist/` within 681ms.
2. **Linter & Code Health**: `npm run lint` passes with 0 syntax errors across all components and services.
3. **Docker Multi-Stage Validation**: `docker compose config` passes with 0 syntax errors across the entire 6-service microservices constellation.
4. **Repository Sync Automation**: Standalone `Scripts/push.bat` and root `Scripts/` correctly recognize `V-Eval-Web_Client` as a first-class project service.
5. **API Gateway Connectivity**: Full client suite structured and verified to consume all microservices endpoints via API Gateway (`:5212`) entry point.


