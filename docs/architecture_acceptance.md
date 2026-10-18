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

---

## 5. Verification & Acceptance Criteria

1. **Clean Production Build**: Executed `npm run build` with 0 syntax or bundle errors; production artifacts outputted to `dist/` within 743ms on Vite 8 and React 19.
2. **Linter & Code Health**: `npm run lint` passes with 0 syntax errors across all components and services.
3. **Docker Multi-Stage Validation**: `docker compose config` passes with 0 syntax errors across the entire 6-service microservices constellation.
4. **Repository Sync Automation**: Standalone `Scripts/push.bat` and root `Scripts/` correctly recognize `V-Eval-Web_Client` as a first-class project service.
5. **API Gateway Connectivity**: Full client suite structured and verified to consume all microservices endpoints via API Gateway (`:5212`) entry point.



