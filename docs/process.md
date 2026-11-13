<!-- Navbar campus data: active campus API + authenticated student profile; confirmed profile PUT on selection. -->
<!-- Submission architecture update: POST results must be validated before result/history writes. Failure returns to the exam with in-memory answers intact. -->
# KIẾN TRÚC & BẢNG THEO DÕI TIẾN ĐỘ CHỦ THỂ (PROCESS & PLANNING) - V-EVAL WEB CLIENT

---

## PHẦN 1: KIẾN TRÚC DỊCH VỤ & CÁC THÀNH PHẦN CẦN TRIỂN KHAI

### 1. Tổng Quan Kiến Trúc Web Client (V-Eval Frontend SPA)
- **Công Nghệ**: React 19 (`react: ^19.2.8`), Vite 8 (`vite: ^8.3.0`), TailwindCSS v4 (`@tailwindcss/vite: ^4.3.3`), Lucide React, Recharts 3, Framer Motion, Canvas Confetti, Oxlint.
- **Cổng Dịch Vụ**: `5173` (Vite Dev Server) / Container `v_eval_web_client` (Nginx Alpine reverse proxy cổng 80 ánh xạ ra 5173).
- **Phân Khối Cấu Trúc Mã Nguồn**:
  - `src/components/layout/`: `Navbar`, `Sidebar` hỗ trợ responsive mobile/desktop và navigation các vai trò.
  - `src/components/landing/`: `PublicLandingPage` giới thiệu nền tảng V-Eval, mô hình đánh giá năng lực V-ACT 2026.
  - `src/components/auth/`: `WebLoginPage` hỗ trợ đăng nhập đa vai trò (Học sinh, Giáo viên, Quản trị viên).
  - `src/components/dashboard/`:
    + `HeroBanner`: Chào mừng học sinh, hiển thị điểm mục tiêu (thang 1200) và chuỗi học tập hàng ngày (streak).
    + `MetricsGrid`: Thẻ chỉ số năng lực, đồ thị mạng nhện Radar V-ACT, ước lượng năng lực IRT theta, và tỷ lệ làm chủ kỹ năng.
    + `MilestoneCard`: Thẻ chặng học tập theo FSM, mở khóa chặng dựa trên điều kiện bài giảng (>= 80%) và bài tập (>= 60%).
    + `AISocraticTutorWidget`: Khung chat trợ lý AI gia sư Socratic tương tác hướng dẫn giải thích câu hỏi.
    + `LiveQnACard`: Phiên hỏi đáp trực tuyến và kết nối cố vấn học tập.
    + `TeacherDashboardView`: Góc nhìn dành riêng cho giáo viên theo dõi tiến độ của học sinh.
  - `src/components/modals/`:
    + `DiagnosticTestModal`: Luồng khảo thí chẩn đoán năng lực ban đầu (Flow 1) tích hợp logic IRT 2PL.
    + `AdaptiveQuizModal`: Luồng luyện tập thích ứng theo Vùng phát triển gần nhất ZPD (Flow 3) và chuỗi Markov ẩn BKT.
    + `RadarChartModal`: Phóng to biểu đồ Radar năng lực chi tiết 3 miền Toán - Văn - Khoa học tự nhiên/xã hội.
    + `AcademicArchitectureModal`: Bảng đối chiếu kiến trúc học thuật và 22 công thức hệ thống V-Eval.
  - `src/data/mockData.js`: Dữ liệu mô phỏng đồng bộ chuẩn hóa theo đặc tả toán học hệ thống V-Eval.
- **Tích Hợp Hệ Thống**:
  - Tích hợp cổng Gateway YARP (`http://localhost:5212`) cho các luồng API Auth, Content, Practice và AI Ingestion/Tutor.
  - Script điều khiển độc lập `Scripts/push.bat` hỗ trợ commit & push trực tiếp từ thư mục Web Client.
  - Cấu hình Docker đa tầng (Multi-stage Build: Node 22 Alpine + Nginx Alpine) tích hợp vào `docker-compose.yml` gốc.

---

## PHẦN 2: BẢNG THEO DÕI TIẾN ĐỘ CHI TIẾT THEO TỪNG MỤC (PROGRESS MATRIX)

| STT | Hạng Mục / Chức Năng | Vị Trí Triển Khai trong Code | Trạng Thái | Tiến Độ (%) | Ghi Chú Chi Tiết |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | **Khởi Tạo Cấu Trúc React 19 & Vite 8** | `package.json`, `vite.config.js` | 🟢 Hoàn thành | 100% | Tích hợp TailwindCSS v4, Oxlint, Lucide Icons |
| 2 | **Hệ Thống Layout & Điều Hướng** | `src/components/layout/` | 🟢 Hoàn thành | 100% | `Navbar`, `Sidebar` với trạng thái active role linh hoạt, chống đè lấn badge và selector |
| 3 | **Trang Chủ Công Khai (Landing Page)** | `src/components/landing/` | 🟢 Hoàn thành | 100% | Hero section, tính năng nổi bật, lộ trình cá nhân hóa |
| 4 | **Xác Thực Đăng Nhập (Web Login)** | `src/components/auth/` | 🟢 Hoàn thành | 100% | Chọn vai trò Học sinh, Giáo viên, Điều phối học vụ |
| 5 | **Bảng Điều Khiển Học Sinh (Dashboard)** | `src/components/dashboard/` | 🟢 Hoàn thành | 100% | `HeroBanner`, `MetricsGrid`, `MilestoneCard` |
| 6 | **Bảng Điều Khiển Giáo Viên** | `TeacherDashboardView.jsx` | 🟢 Hoàn thành | 100% | Danh sách học sinh, phân phối điểm, cảnh báo nguy cơ |
| 7 | **Gia Sư AI Socratic Widget** | `AISocraticTutorWidget.jsx` | 🟢 Hoàn thành | 100% | Giao diện chat gợi mở phương pháp tư duy theo RAG |
| 8 | **Modal Khảo Thí Chẩn Đoán (Flow 1)** | `DiagnosticTestModal.jsx` | 🟢 Hoàn thành | 100% | Giao diện làm bài thi chẩn đoán theo mô hình IRT 2PL |
| 9 | **Modal Luyện Tập Thích Ứng ZPD (Flow 3)** | `AdaptiveQuizModal.jsx` | 🟢 Hoàn thành | 100% | Đề xuất bài tập theo vùng phát triển gần nhất `[0.60, 0.75]` |
| 10 | **Đồ Thị Radar Năng Lực V-ACT** | `RadarChartModal.jsx` | 🟢 Hoàn thành | 100% | Biểu đồ Recharts Radar thang chuẩn hóa 1200 điểm |
| 11 | **Bảng Đối Chiếu Kiến Trúc Học Thuật** | `AcademicArchitectureModal.jsx` | 🟢 Hoàn thành | 100% | Hiển thị 22 công thức toán học và thông số hệ thống |
| 12 | **Dữ Liệu Mô Phỏng Chuẩn Hóa** | `src/data/mockData.js` | 🟢 Hoàn thành | 100% | Mock dữ liệu câu hỏi, chỉ số năng lực, chặng học tập |
| 13 | **Script Push Độc Lập Service** | `Scripts/push.bat` | 🟢 Hoàn thành | 100% | Đồng bộ lịch sử git, chọn nhánh và commit tự động |
| 14 | **Đóng Gói Dockerfile & Nginx** | `Dockerfile`, `nginx.conf` | 🟢 Hoàn thành | 100% | Multi-stage build Node 22 + Nginx SPA routing |
| 15 | **Tích Hợp System-Repo & Runner** | `docker-compose.yml`, `run_local.bat` | 🟢 Hoàn thành | 100% | Đồng bộ khởi chạy local cổng 5173 và Docker compose |
| 16 | **Kết Nối Real API Gateway YARP** | `src/services/` | 🟢 Hoàn thành | 100% | Hoàn thành `apiClient.js`, `authService.js`, `contentService.js`, `practiceService.js` |
| 17 | **Móc Nối Đầy Đủ 14+ API AI Engine** | `src/services/aiService.js` | 🟢 Hoàn thành | 100% | Tích hợp OCR đề thi, nạp SGK 250MB, sinh đề AI Bloom, chẩn đoán IRT/BKT, SSE Streaming |
| 18 | **Trang Khảo Sát 30 Câu Thật Với AI** | `src/components/diagnostic/DiagnosticAssessmentPage.jsx` | 🟢 Hoàn thành | 100% | Trang làm bài 30 câu fetch từ AI Engine/Content Service, đồng hồ, điều hướng, Radar Chart, AI Tutor Drawer |
| 19 | **Động Cơ Render Toán Học KaTeX** | `src/components/common/MathText.jsx` | 🟢 Hoàn thành | 100% | Phân tích và render công thức LaTeX, phân số, số mũ, căn thức, khoảng vô cực cho câu hỏi, đáp án, gia sư AI |
| 20 | **Chế Độ Thi Giám Sát Azota Proctored** | `DiagnosticAssessmentPage.jsx` | 🟢 Hoàn thành | 100% | Fullscreen API, phát hiện rời tab/mất focus, tô đậm câu đã làm bên phải, modal cảnh báo vi phạm |
| 21 | **Trợ Thủ Nhập Mã Phòng Thi Demo & Tự Điền** | `DiagnosticAssessmentPage.jsx` | 🟢 Hoàn thành | 100% | Hiển thị mã phòng thi demo trên card, hỗ trợ 1-click Auto-fill & Copy trong Modal và Banner |
| 22 | **Chuẩn Hóa Sảnh Chẩn Đoán Flow 1 & Phân Định 3-Flow** | `DiagnosticAssessmentPage.jsx` | 🟢 Hoàn thành | 100% | Lọc chỉ giữ đề DIAGNOSTIC 30 câu, loại bỏ quiz củng cố (Flow 2) và đề thi thử 120 câu (Flow 3) khỏi Flow 1 |
| 23 | **Modal Xác Nhận Thi Thử Vãng Lai (Guest Mode Popup)** | `PublicLandingPage.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Popup xác nhận vào thi thử 30 câu miễn phí không cần đăng nhập, điều hướng trực tiếp sang phòng thi độc lập |
| 24 | **Khảo Thí Cho Tài Khoản Đã Đăng Nhập (Flow 1 Logged-in Mode)** | `DiagnosticAssessmentPage.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Tích hợp Sảnh Khảo Thí (Hero Banner, 5 miền năng lực, thẻ đề thi) và Modal xác nhận passcode `VACT2026` |
| 25 | **Nút Thi Thử Ngay Top Header & Modal Xác Thực Passcode** | `Navbar.jsx`, `ExamPasscodeModal.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Tích hợp nút Thi Thử Ngay trên Top Header cạnh Đặc tả Kiến trúc, bật modal thông số 30 câu và xác thực passcode vào thi trực tiếp |
| 26 | **Hệ Thống 3 Sub-Tabs, Biểu Đồ Năng Lực Đa Chiều & Lịch Sử Khảo Thí** | `DiagnosticAssessmentPage.jsx`, `diagnosticData.js` | 🟢 Hoàn thành | 100% | 3 sub-tabs Sảnh Khảo thí, 4 biểu đồ trực quan (Radar 5 miền, Cột độ chính xác, Vùng tiến trình Theta, Đo nhịp độ câu hỏi), bảng lịch sử bài thi và xem lại lời giải chi tiết |
| 27 | **Tách Bạch Ngân Hàng Đề Thi & Tinh Gọn Flow 1 Chỉ Lưu Vết Lịch Sử & Chi Tiết Lần Thi** | `QuestionBankPage.jsx`, `DiagnosticAssessmentPage.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Di chuyển toàn bộ danh mục đề thi & phòng thi xuống sidebar 'Ngân hàng đề & Thi thử'; tinh gọn Flow 1 chỉ tập trung danh sách các lần kiểm tra, click vào 1 lần thi sẽ mở trang phân tích đồ thị chi tiết kèm nút quay lại mượt mà |
| 28 | **Nâng Cấp Lộ Trình Học Cá Nhân Hóa (Flow 2) 9 Môn Thi, Phân Cấp 3 Giai Đoạn & Cây Chương - Bài** | `RoadmapLearningPage.jsx`, `roadmapSubjectsData.js` | 🟢 Hoàn thành | 100% | Phân lớp 9 môn thi vào 3 GĐ dựa vào điểm thi đầu vào; Cây Chương - Bài học; 4 tab học liệu (Video YouTube, Tri thức Panorama SGK & Bẫy ĐGNL, Lịch Live Google Meet, Quiz củng cố) |
| 29 | **Chuẩn Hóa Tên Gọi Menu Sidebar & Nhãn Chức Năng Sang Ngôn Ngữ Người Dùng Trực Quan** | `Sidebar.jsx`, `MetricsGrid.jsx`, `DiagnosticAssessmentPage.jsx`, `AdaptiveQuizModal.jsx` | 🟢 Hoàn thành | 100% | Loại bỏ thuật ngữ kỹ thuật/sư phạm khó hiểu (DAG, ZPD, Socratic, BKT); đổi tên: Tổng quan học tập, Thi đánh giá đầu vào, Lộ trình học cá nhân, Luyện tập thích ứng, Gia sư AI gợi mở; phân nhóm Học tập & Luyện thi, Hỗ trợ & Phân tích |
| 30 | **Màn Hình Cài Đặt Tài Khoản & Hồ Sơ Năng Lực (Account Settings)** | `AccountSettingsPage.jsx`, `authService.js`, `App.jsx`, `Navbar.jsx` | 🟢 Hoàn thành | 100% | Triển khai màn hình Cài đặt tài khoản 5 tabs (Hồ sơ cá nhân, Mục tiêu 1200 điểm, Liên kết phụ huynh Cha/Mẹ & Học bạ điện tử ĐGNL, Đổi mật khẩu, Tùy chọn AI); tích hợp mã kết nối VIP card, bộ chọn avatar 3D và nút in/xuất học bạ PDF |






## [22/10/2026] - Submission progress

| Component | Status | Detail |
|---|---|---|
| Diagnostic submission FE | Completed | Require backend submission ID, theta, placement and per-question grading; no local result fallback. Build passed; targeted lint has warnings only. |


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

| Item | Status | Validation |
|---|---|---|
| Real Navbar campus selector | Implemented | Build passed; authenticated save requires account validation. |


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

| Component | Status | Detail |
|---|---|---|
| Shared diagnostic summary and history presentation | Implemented | Build passed; responsive CSS implemented; browser visual review pending. |


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

# KIẾN TRÚC & BẢNG THEO DÕI TIẾN ĐỘ CHỦ THỂ (PROCESS & PLANNING) - V-EVAL WEB CLIENT

---

## PHẦN 1: KIẾN TRÚC DỊCH VỤ & CÁC THÀNH PHẦN CẦN TRIỂN KHAI

### 1. Tổng Quan Kiến Trúc Web Client (V-Eval Frontend SPA)
- **Công Nghệ**: React 19 (`react: ^19.2.8`), Vite 8 (`vite: ^8.3.0`), TailwindCSS v4 (`@tailwindcss/vite: ^4.3.3`), Lucide React, Recharts 3, Framer Motion, Canvas Confetti, Oxlint.
- **Cổng Dịch Vụ**: `5173` (Vite Dev Server) / Container `v_eval_web_client` (Nginx Alpine reverse proxy cổng 80 ánh xạ ra 5173).
- **Phân Khối Cấu Trúc Mã Nguồn**:
  - `src/components/layout/`: `Navbar`, `Sidebar` hỗ trợ responsive mobile/desktop và navigation các vai trò.
  - `src/components/landing/`: `PublicLandingPage` giới thiệu nền tảng V-Eval, mô hình đánh giá năng lực V-ACT 2026.
  - `src/components/auth/`: `WebLoginPage` hỗ trợ đăng nhập đa vai trò (Học sinh, Giáo viên, Quản trị viên).
  - `src/components/dashboard/`:
    + `HeroBanner`: Chào mừng học sinh, hiển thị điểm mục tiêu (thang 1200) và chuỗi học tập hàng ngày (streak).
    + `MetricsGrid`: Thẻ chỉ số năng lực, đồ thị mạng nhện Radar V-ACT, ước lượng năng lực IRT theta, và tỷ lệ làm chủ kỹ năng.
    + `MilestoneCard`: Thẻ chặng học tập theo FSM, mở khóa chặng dựa trên điều kiện bài giảng (>= 80%) và bài tập (>= 60%).
    + `AISocraticTutorWidget`: Khung chat trợ lý AI gia sư Socratic tương tác hướng dẫn giải thích câu hỏi.
    + `LiveQnACard`: Phiên hỏi đáp trực tuyến và kết nối cố vấn học tập.
    + `TeacherDashboardView`: Góc nhìn dành riêng cho giáo viên theo dõi tiến độ của học sinh.
  - `src/components/modals/`:
    + `DiagnosticTestModal`: Luồng khảo thí chẩn đoán năng lực ban đầu (Flow 1) tích hợp logic IRT 2PL.
    + `AdaptiveQuizModal`: Luồng luyện tập thích ứng theo Vùng phát triển gần nhất ZPD (Flow 3) và chuỗi Markov ẩn BKT.
    + `RadarChartModal`: Phóng to biểu đồ Radar năng lực chi tiết 3 miền Toán - Văn - Khoa học tự nhiên/xã hội.
    + `AcademicArchitectureModal`: Bảng đối chiếu kiến trúc học thuật và 22 công thức hệ thống V-Eval.
  - `src/data/mockData.js`: Dữ liệu mô phỏng đồng bộ chuẩn hóa theo đặc tả toán học hệ thống V-Eval.
  - `src/components/common/`:
    + `MathText.jsx`: Động cơ render KaTeX, nhận diện Markdown, công thức hóa học, khối bảng biến thiên và thẻ đồ thị.
    + `VariationTable.jsx`: Renderer Bảng biến thiên 3 dòng vector HTML/SVG chuẩn SGK GDPT 2018 (mũi tên dốc, vạch kép, cực trị).
    + `MathGraphView.jsx`: Renderer Đồ thị hàm số Oxy vector SVG (bậc 3, phân thức, trùng phương, parabol, dóng nét đứt CĐ/CT, tiệm cận) & Tích hợp đồ thị tương tác Desmos Graphing Calculator.
    + `InteractiveMathRenderer.jsx`: Component độc lập tái sử dụng cao, render live đồ thị hàm số 2D và mô hình hình học không gian 3D (xoay trackball 360°, zoom, modal expand) bằng JSXGraph v1.14.0 nội sinh, loại bỏ hoàn toàn ảnh chụp tĩnh.
    + `GlobalToastContainer.jsx`: Khung chứa và giao diện thẻ thông báo Toast nổi toàn cục (z-[999999]), phân loại 4 trạng thái (Success, Error, Warning, Info), thanh đếm ngược tự động và tạm dừng khi hover.
  - `src/context/`:
    + `ToastContext.jsx`: Context & Singleton điều phối thông báo toàn cục (`toast.success/error/warning/info/dismiss`), bọc an toàn `window.alert` để triệt tiêu vĩnh viễn pop-up chặn luồng của trình duyệt.
  - `src/utils/`:
    + `mathGraphUtils.js`: Bộ tiện ích biên dịch hàm số, thư viện đỉnh không gian chuẩn, bộ giải mã và tuần tự hóa thẻ `[MATH_GRAPH]` và `[MATH_GRAPH_3D]`.
  - `src/components/curriculum/`:
    + `CurriculumExplorerView.jsx`: Cây tri thức phân cấp 3 tầng, không gian Panoramic Workspace, bộ lọc Bloom L1-L4 và duyệt câu hỏi mẫu.
    + `CurriculumStudioEditor.jsx`: Studio hiệu đính sư phạm toàn diện, tích hợp thanh Word Ribbon duy nhất, bố cục 2 cột với sidebar ký hiệu phân cấp.
    + `HierarchicalMathPalette.jsx`: Thanh công cụ ký hiệu phân cấp 3 tầng (Môn -> Chuyên mục -> Chip KaTeX), hỗ trợ thu gọn rail w-11 mỏng nhẹ.
    + `WordStyleFormulaCanvas.jsx`: Canvas soạn thảo trực quan Microsoft Word Equation, dòng văn bản tự nhiên, tiết diện công thức siêu gọn, sửa số tại chỗ.
    + `InteractiveFormulaBuilderModal.jsx`: Trình tạo công thức và đồ thị trực quan (Click-to-Fill Formula Builder) không cần gõ mã LaTeX.
    + `InteractiveMathWorkbenchModal.jsx`: Phòng thí nghiệm MathLab 2D/3D chuyên sâu sử dụng JSXGraph v1.14.0 nội sinh (tùy chỉnh tọa độ X,Y,Z và đổi tên đỉnh không gian, kẻ đường phụ, và bộ 6 chuyên đề đồ thị VD/VDC GDPT 2018).
- **Tích Hợp Hệ Thống**:
  - Tích hợp cổng Gateway YARP (`http://localhost:5212`) cho các luồng API Auth, Content, Practice và AI Ingestion/Tutor.
  - Script điều khiển độc lập `Scripts/push.bat` hỗ trợ commit & push trực tiếp từ thư mục Web Client.
  - Cấu hình Docker đa tầng (Multi-stage Build: Node 22 Alpine + Nginx Alpine) tích hợp vào `docker-compose.yml` gốc.

---

## PHẦN 2: BẢNG THEO DÕI TIẾN ĐỘ CHI TIẾT THEO TỪNG MỤC (PROGRESS MATRIX)

| STT | Hạng Mục / Chức Năng | Vị Trí Triển Khai trong Code | Trạng Thái | Tiến Độ (%) | Ghi Chú Chi Tiết |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | **Khởi Tạo Cấu Trúc React 19 & Vite 8** | `package.json`, `vite.config.js` | 🟢 Hoàn thành | 100% | Tích hợp TailwindCSS v4, Oxlint, Lucide Icons |
| 2 | **Hệ Thống Layout & Điều Hướng** | `src/components/layout/` | 🟢 Hoàn thành | 100% | `Navbar`, `Sidebar` với trạng thái active role linh hoạt |
| 3 | **Trang Chủ Công Khai (Landing Page)** | `src/components/landing/` | 🟢 Hoàn thành | 100% | Hero section, tính năng nổi bật, lộ trình cá nhân hóa |
| 4 | **Xác Thực Đăng Nhập (Web Login)** | `src/components/auth/` | 🟢 Hoàn thành | 100% | Chọn vai trò Học sinh, Giáo viên, Điều phối học vụ |
| 5 | **Bảng Điều Khiển Học Sinh (Dashboard)** | `src/components/dashboard/` | 🟢 Hoàn thành | 100% | `HeroBanner`, `MetricsGrid`, `MilestoneCard` |
| 6 | **Bảng Điều Khiển Giáo Viên** | `TeacherDashboardView.jsx` | 🟢 Hoàn thành | 100% | Danh sách học sinh, phân phối điểm, cảnh báo nguy cơ |
| 7 | **Gia Sư AI Socratic Widget** | `AISocraticTutorWidget.jsx` | 🟢 Hoàn thành | 100% | Giao diện chat gợi mở phương pháp tư duy theo RAG |
| 8 | **Modal Khảo Thí Chẩn Đoán (Flow 1)** | `DiagnosticTestModal.jsx` | 🟢 Hoàn thành | 100% | Giao diện làm bài thi chẩn đoán theo mô hình IRT 2PL |
| 9 | **Modal Luyện Tập Thích Ứng ZPD (Flow 3)** | `AdaptiveQuizModal.jsx` | 🟢 Hoàn thành | 100% | Đề xuất bài tập theo vùng phát triển gần nhất `[0.60, 0.75]` |
| 10 | **Đồ Thị Radar Năng Lực V-ACT** | `RadarChartModal.jsx` | 🟢 Hoàn thành | 100% | Biểu đồ Recharts Radar thang chuẩn hóa 1200 điểm |
| 11 | **Bảng Đối Chiếu Kiến Trúc Học Thuật** | `AcademicArchitectureModal.jsx` | 🟢 Hoàn thành | 100% | Hiển thị 22 công thức toán học và thông số hệ thống |
| 12 | **Dữ Liệu Mô Phỏng Chuẩn Hóa** | `src/data/mockData.js` | 🟢 Hoàn thành | 100% | Mock dữ liệu câu hỏi, chỉ số năng lực, chặng học tập |
| 13 | **Script Push Độc Lập Service** | `Scripts/push.bat` | 🟢 Hoàn thành | 100% | Đồng bộ lịch sử git, chọn nhánh và commit tự động |
| 14 | **Đóng Gói Dockerfile & Nginx** | `Dockerfile`, `nginx.conf` | 🟢 Hoàn thành | 100% | Multi-stage build Node 22 + Nginx SPA routing |
| 15 | **Tích Hợp System-Repo & Runner** | `docker-compose.yml`, `run_local.bat` | 🟢 Hoàn thành | 100% | Đồng bộ khởi chạy local cổng 5173 và Docker compose |
| 16 | **Kết Nối Real API Gateway YARP** | `src/services/` | 🟢 Hoàn thành | 100% | Hoàn thành `apiClient.js`, `authService.js`, `contentService.js`, `practiceService.js` |
| 17 | **Móc Nối Đầy Đủ 14+ API AI Engine** | `src/services/aiService.js` | 🟢 Hoàn thành | 100% | Tích hợp OCR đề thi, nạp SGK 250MB, sinh đề AI Bloom, chẩn đoán IRT/BKT, SSE Streaming |
| 18 | **Trang Khảo Sát 30 Câu Thật Với AI** | `src/components/diagnostic/DiagnosticAssessmentPage.jsx` | 🟢 Hoàn thành | 100% | Trang làm bài 30 câu fetch từ AI Engine/Content Service, đồng hồ, điều hướng, Radar Chart, AI Tutor Drawer |
| 19 | **Động Cơ Render Toán Học KaTeX** | `src/components/common/MathText.jsx` | 🟢 Hoàn thành | 100% | Phân tích và render công thức LaTeX, phân số, số mũ, căn thức, khoảng vô cực cho câu hỏi, đáp án, gia sư AI |
| 20 | **Luồng Đăng Nhập, Đăng Ký & Kích Hoạt OTP Thực Tế** | `src/components/auth/WebLoginPage.jsx`, `src/services/authService.js`, `src/App.jsx` | 🟢 Hoàn thành | 100% | Móc nối trực tiếp Identity Service qua Gateway: Đăng nhập JWT/Refresh Token, Đăng ký học sinh chuẩn FluentValidation, Xác thực OTP 6 số kích hoạt tài khoản, Quên/Đặt lại mật khẩu, Header xác thực trang chủ |
| 21 | **Móc Nối Lộ Trình Học Cá Nhân Hóa Dashboard** | `src/components/dashboard/MilestoneCard.jsx` | 🟢 Hoàn thành | 100% | Gọi `practiceService.getMyRoadmap()`, hiển thị chặng học thực tế từ PostgreSQL, tự động điều hướng sang Khảo sát 30 câu khi chưa có lộ trình |
| 22 | **Phân Quyền Đăng Ký (Học Sinh & Phụ Huynh) & Smart RBAC Login** | `src/components/auth/WebLoginPage.jsx`, `src/App.jsx` | 🟢 Hoàn thành | 100% | Giới hạn đăng ký công khai chỉ cho Học sinh & Phụ huynh; Cán bộ/GV/Admin đăng nhập tại cổng hợp nhất, 1-Click demo 4 vai trò |
| 23 | **Cổng Điều Hành Học Thuật Cơ Sở (Campus Manager Portal)** | `src/components/dashboard/CampusManagerDashboardView.jsx` | 🟢 Hoàn thành | 100% | Quản lý 119 học viên cơ sở, AI Auto-Clustering K-Means/GMM phân 3 nhóm lớp năng lực, phân công giáo viên, cấp tài khoản nội bộ |
| 24 | **Trang Cấp Phát & Quản Trị Tài Khoản Đa Vai Trò (IAM Page)** | `src/components/admin/AccountProvisioningView.jsx` | 🟢 Hoàn thành | 100% | Giao diện quản trị cấp cao: Thống kê số lượng tài khoản, bộ lọc vai trò, bảng dữ liệu, nút gạt khóa/mở, modal cấp phát 6 vai trò kết nối trực tiếp PostgreSQL |
| 25 | **Tầng Dịch Vụ Người Dùng Mới (User Service)** | `src/services/userService.js` | 🟢 Hoàn thành | 100% | Móc nối Gateway YARP `:5212`: `getUsers`, `provisionUser`, `toggleUserStatus`, `getCampuses` |
| 26 | **Cổng Phụ Huynh Theo Dõi Học Tập (Parent Companion Portal)** | `src/components/dashboard/ParentDashboardView.jsx` | 🟢 Hoàn thành | 100% | Theo dõi năng lực IRT (+0.65 Theta), xác suất đỗ Bách Khoa 82%, chuyên cần học tập, và nhận cảnh báo sớm từ AI |
| 27 | **Hợp Nhất Giao Diện Xác Thực (TNhan UI/UX) & Đấu Nối API IAM (ThinhTT)** | `src/components/auth/` | 🟢 Hoàn thành | 100% | Tích hợp layout split-screen, ticker, custom select bo tròn, form modular (`LoginForm`, `RegisterForm`, `ForgotPasswordModal`, `AuthModal`) và đấu nối 100% API `authService` |
| 28 | **Thiết Lập CI/CD & Discord Commit Tracker Web Client** | `.github/workflows/` | 🟢 Hoàn thành | 100% | Thêm workflow `discord-commit-tracker.yml` gửi webhook embed commit về Discord và `ci.yml` kiểm thử build trên Node.js 20 |
| 29 | **Giao Diện Sơ Đồ Nhóm Bàn Học Vi Mô (3 - 5 Bạn)** | `src/components/modals/ClassMicroGroupsModal.jsx` & `CampusManagerDashboardView.jsx` | 🟢 Hoàn thành | 100% | Sơ đồ trạm bàn học offline, thuật toán phân bổ đồng nhất 3-5 em/bàn, phân phối đề luyện tập vi mô thích ứng trực tiếp |
| 30 | **Phân Hệ Dàn Kiến Thức Khung Năng Lực Chuẩn ĐGNL & Tích Hợp Luyện Tập Củng Cố API 19** | `src/components/curriculum/CurriculumExplorerView.jsx`, `contentService.js` & `App.jsx` | 🟢 Hoàn thành | 100% | Duyệt 4 miền năng lực, ngân hàng công thức KaTeX, khối Tri thức liên môn (Cross-Disciplinary GraphRAG), kích hoạt Content Service API 19 luyện tập 5 câu củng cố tức thì |
| 31 | **Xóa Bỏ Hardcode FE & Nạp Dữ Liệu Động Dàn Kiến Thức Từ CSDL (API Gateway)** | `src/components/curriculum/CurriculumExplorerView.jsx`, `src/services/contentService.js` | 🟢 Hoàn thành | 100% | Gỡ bỏ 100% mảng tĩnh `DOMAINS_DATA`, gọi `GET /api/content/curriculum` lấy 4 miền & 12 kỹ năng chuẩn từ Content Service Database |
| 32 | **Cây Tri Thức Phổ Thông 3 Tầng (Chương -> Bài -> Dạng) & 4 Khối Sư Phạm Thích Ứng** | `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Accordion 3 tầng chuẩn SGK GDPT 2018, hiển thị 4 khối sư phạm (Nền tảng, Phương pháp riêng, Video, Quiz thích ứng gom dạng hổng <10%) |
| 33 | **Phân Hệ Hiệu Đính Sư Phạm Dành Riêng Cho Giảng Viên (Instructor Curation Suite)** | `src/components/curriculum/CurriculumExplorerView.jsx` & `contentService.js` | 🟢 Hoàn thành | 100% | Tối đa hóa hỗ trợ chỉnh sửa cho Giảng viên: Bảng ký tự KaTeX 1-click, xem trước thời gian thực Live KaTeX Preview, trợ lý AI chuẩn hóa 3 bước giải, kiểm tra video nhúng, quản trị câu hỏi mẫu và modal nạp SGK AI |
| 34 | **Studio Sư Phạm Chuyên Sâu & Môi Trường Biên Soạn Toàn Diện** | `src/components/curriculum/CurriculumStudioEditor.jsx`, `MathText.jsx`, `CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Studio toàn diện: 3 chế độ xem (Biên soạn, Split 50-50, Review Học sinh), chèn đồ thị SVG/ảnh minh họa, bảng công thức KaTeX đa chủ đề, phân đoạn video Timestamps, quản trị Ngân hàng câu hỏi Bloom L1-L4 |
| 35 | **Khắc Phục Lỗi Màn Trắng & Bọc Error Boundary Toàn Cục** | `CurriculumExplorerView.jsx`, `main.jsx`, `MathText.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Khắc phục triệt để `ReferenceError: weakPrerequisites is not defined`, bọc `RootErrorBoundary` bắt lỗi React toàn cục, thêm null safety cho `MathText`, mở rộng hiển thị Lộ trình cho mọi vai trò |
| 36 | **AI Bóc Tách Tài Liệu (PDF/DOCX) & Tự Động Nhận Diện Dạng Bài Sư Phạm** | `CurriculumExplorerView.jsx`, `CurriculumStudioEditor.jsx`, `aiService.js` | 🟢 Hoàn thành | 100% | Kéo thả PDF/DOCX SGK chuyên đề, AI phân tích nhận diện rõ từng dạng bài, cấp độ Bloom, 4 bước giải KaTeX, bẫy đề thi, mẹo Casio, câu hỏi mẫu và chuyển trực tiếp vào Studio hiệu đính |
| 37 | **Bàn Phím Ảo & Bảng Ký Hiệu KaTeX STEM 10 Danh Mục** | `CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | 120+ công thức toán học chuyên sâu 10 danh mục (Đại số, Đạo hàm, Tích phân, Mũ/Log, Lượng giác, Oxyz, Hệ PT, Logic, Hy Lạp, Xác suất), live preview trên nút và target selection |
| 38 | **Không Gian Làm Việc Bóc Tách Khổ Lớn Toàn Màn Hình 3 Cột** | `CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Fullscreen Panoramic Studio Ingestion Workspace (`max-w-[1580px] h-[95vh]`), phân trang `startPage` - `endPage` (sách 99+ trang), Bloom filter, Live KaTeX Inspector |
| 39 | **Động Cơ Render KaTeX Nâng Cao & Bóc Tách Callout** | `MathText.jsx` | 🟢 Hoàn thành | 100% | Khử lỗi ký tự `\n\n`, tự động bọc KaTeX cho các lệnh LaTeX độc lập (`\Delta`, `\frac`, `\lim`, `x_0`), render thẻ callout cảnh báo Rose Alert và mẹo Casio Indigo Tip |
| 40 | **Tái Cấu Trúc Kiến Trúc Render 2 Tầng & Khắc Phục Lỗi Vỡ Dòng Văn Bản** | `MathText.jsx` | 🟢 Hoàn thành | 100% | Tách riêng tầng Document/Line và tầng Inline Content, xóa bỏ wrapper `block` trên từng mẩu text, chấm dứt hiện tượng xé câu dọc theo công thức/dấu phẩy/dấu ngoặc, khử trùng lặp bullet `• - ` |
| 41 | **Khắc Phục Ký Tự Thoát `\n` & Tự Động Bọc KaTeX Hóa Học** | `MathText.jsx`, `CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Negative lookahead bảo vệ 15 lệnh LaTeX (\neq, \notin), giải phóng 100% ngắt dòng tiếng Việt (\nTrong, \nKiểm, \nBước), tự động bọc KaTeX cho ion đa nguyên tử (OH^-, SO_4^{2-}) và hợp chất (H_2O, HNO_3) |
| 42 | **Kiến Trúc Soạn Thảo Đa Chế Độ: Soạn Thảo Trực Quan (Text In Preview Chuẩn Học Sinh) Song Hành Mã Nguồn LaTeX Thuần (Nhập Nhanh Từ AI)** | `CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Soạn thảo tích hợp Khung Hiển Thị Học Sinh Trực Quan (Text In Preview) thời gian thực, chèn ký hiệu KaTeX STEM 10 danh mục tại vị trí con trỏ (selectionStart), tab Mã Nguồn LaTeX tối ưu paste từ AI |
| 43 | **Tái Cân Đối Bố Cục Không Gian Panoramic Workspace & Ngân Hàng Bài Mẫu Chuyên Sâu (Kèm Nút Sinh Thêm Câu Hỏi AI)** | `CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Tái cấu trúc 2 phân vùng cân xứng (Cột trái 4 cols: Cây Chương & Bài Học + Dạng bài; Khung phải 8 cols: Chia đôi song song Lý thuyết vs Ngân hàng 4 câu hỏi mẫu chuẩn Bloom L1-L4 kèm Interactive Question Switcher, nút bấm dynamic `+ AI Tạo Thêm 2 Bài Mẫu` và banner thống kê tổng lực) |
| 44 | **Tích Hợp Khối Thẻ Ví Dụ Minh Họa SGK (Khối 1) & Bài Toán Mẫu Áp Dụng Phương Pháp (Khối 2)** | `CurriculumStudioEditor.jsx`, `CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Bóc tách độc lập và hiển thị 2 khối thẻ sư phạm chuyên biệt: Thẻ Ví Dụ Minh Họa SGK (Emerald/Teal) trong Khối 1 và Thẻ Bài Toán Mẫu Áp Dụng Phương Pháp (Amber/Orange) trong Khối 2, kết hợp chuẩn hóa parser phân tách nội dung lý thuyết/phương pháp |
| 45 | **Bộ Lọc Phân Cấp Bloom & Duyệt Ngân Hàng 14 Câu Hỏi Trắc Nghiệm (2 L1, 2 L2, 5 L3, 5 L4) Mỗi Dạng Bài** | `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Thanh tab lọc Bloom tương tác (Tất cả, L1, L2, L3 Vận dụng 5 câu, L4 Vận dụng cao 5 câu), hiển thị chi tiết mật độ câu hỏi ở Pane 1 `(L1: 2 • L2: 2 • L3: 5 • L4: 5)` và duyệt toàn bộ ngân hàng câu hỏi vận dụng chuyên sâu |
| 46 | **Bộ Renderer Bảng Biến Thiên Nội Sinh Chuẩn SGK GDPT 2018 (3 Dòng Vector HTML/SVG)** | `src/components/common/VariationTable.jsx` | 🟢 Hoàn thành | 100% | Render vector sắc nét bảng biến thiên 3 dòng (dòng `x`, dòng `y'`, dòng mũi tên biến thiên `y`), hỗ trợ mũi tên dốc `\nearrow`, `\searrow`, vạch kép `||`, vô cực, điểm cực trị và parser khối `[VARIATION_TABLE]` |
| 47 | **Bộ Renderer Đồ Thị Hàm Số Oxy Vector SVG & Dóng Nét Đứt Cực Trị / Tiệm Cận** | `src/components/common/MathGraphView.jsx` | 🟢 Hoàn thành | 100% | Tự động vẽ hệ trục toạ độ Oxy, lưới toạ độ grid, đường cong hàm số (bậc 3, phân thức, trùng phương, parabol), dóng nét đứt tọa độ cực đại, cực tiểu và tiệm cận |
| 48 | **Tích Hợp Đồ Thị Tương Tác Chuẩn Quốc Tế Desmos Graphing Calculator** | `src/components/common/MathGraphView.jsx` | 🟢 Hoàn thành | 100% | Nút chuyển đổi 1-chạm sang Desmos Interactive Calculator nhúng iframe, cho phép giáo viên & học sinh zoom, pan, tra cứu tọa độ cực trị và tiếp tuyến như phần mềm MATLAB/GeoGebra |
| 49 | **Trình Điền Công Thức & Đồ Thị Trực Quan Cho Giảng Viên (Click-to-Fill Formula Builder)** | `src/components/curriculum/InteractiveFormulaBuilderModal.jsx` | 🟢 Hoàn thành | 100% | Loại bỏ hoàn toàn việc gõ mã LaTeX thô; giao diện click chọn mẫu và điền số vào ô (Phân số, Căn thức, Lũy thừa, Tích phân, Giới hạn, Hệ PT, Bảng biến thiên SGK, Đồ thị Oxy) kèm Live KaTeX Preview |
| 50 | **Cơ Chế Dán Ảnh Trực Tiếp Clipboard Ctrl+V & Tải Ảnh Minh Họa Đề Thi** | `src/components/curriculum/CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Bắt sự kiện `onPaste` tự động đọc ảnh chụp màn hình Snipping Tool/Zalo thành Base64 Data URL nhúng tức thì vào nội dung, hỗ trợ nút bấm `🖼️ Dán/Tải Ảnh` đồng bộ trên Khối 1, Khối 2 và Khối 4 |
| 51 | **Tinh Chỉnh Kích Thước Compact, Thoáng Đãng & High-Density UI Cho Panoramic Workspace** | `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Tinh gọn 30% thể tích toàn modal: thu nhỏ padding `p-4`/`p-5` xuống `p-2.5`/`p-3`, font size `text-[11px]`, card dạng bài và lưới đáp án A-D thanh thoát, chuyên nghiệp, xóa bỏ tình trạng to phồng và rối mắt |
| 52 | **Trình Soạn Thảo Sư Phạm Trực Tiếp Kiểu Microsoft Word (Word Document Sheet Canvas) & Tách Riêng Trang LaTeX Thuần** | `src/components/curriculum/CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Xóa bỏ hoàn toàn mô hình 2 ô chia trên dưới "Text In Preview", gõ & sửa trực tiếp tại chỗ trên trang giấy Word A4, thanh Ribbon Toolbar định dạng văn bản & công cụ STEM, thẻ Cảnh báo bẫy & Mẹo Casio sửa trực tiếp, tab riêng biệt cho Mã nguồn LaTeX thuần |
| 53 | **Trình Soạn Thảo Ký Hiệu Trực Quan WYSIWYG & Bộ Công Cụ Hóa Học / Toán Học Thực Tế Chèn Số & Tự Tính Toán** | `src/components/curriculum/InteractiveFormulaBuilderModal.jsx`, `CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Ẩn hoàn toàn mã lệnh `\frac` thô trên trang soạn thảo, hiển thị 100% ký hiệu toán/hóa học thực tế; tích hợp bộ tính toán Hóa học (CM = n/V, C%, m = n×M, Hiệu suất H%), phân số tính toán và đạo hàm số gia tự động |
| 54 | **Khắc Phục Lỗi Render Markdown Đầu Dòng (Heading ###, Bold **, Italic ***) & Chuẩn Hóa Sư Phạm Phân Biệt STEM vs Ngữ Văn / KHXH** | `MathText.jsx`, `CurriculumStudioEditor.jsx`, `CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Sửa regex bullet tránh nuốt `**`, render Callout Card `### 📌` và `### 📄`, chuẩn hóa in đậm/nghiêng; Nhận diện môn học loại bỏ hoàn toàn Mẹo Casio cho môn Ngữ văn/KHXH, chuyển đổi linh hoạt sang Mẹo tư duy & Chiến thuật làm bài; Nâng cấp nút `+ AI Tạo Thêm 2 Bài Mẫu` sinh câu hỏi nghị luận văn học chuẩn mực, xóa bỏ hoàn toàn biến số X định lượng |
| 55 | **AI Sinh Câu Hỏi Rèn Luyện Thích Ứng Bám Sát 100% Dạng Bài Đang Phân Tích (Zero-Hardcode & Anti-Duplication)** | `CurriculumExplorerView.jsx`, `src/services/aiService.js` | 🟢 Hoàn thành | 100% | Kết nối API `POST /api/ai-engine/curriculum/generate-questions`, gửi toàn bộ ngữ cảnh sư phạm (`patternName`, `theoryRecap`, `solutionMethod`, `existing_questions`) để Gemini sinh câu hỏi bám sát 100% tác phẩm văn học & phương pháp giải; loại bỏ 100% code hardcode fallback, chống trùng lặp câu hỏi khi bấm nhiều lần |
| 56 | **Trình Soạn Thảo Ký Hiệu Trực Quan WYSIWYG Như Microsoft Word Equation: Chỉnh Sửa Số Trực Tiếp Trên Công Thức & 1-Click Ribbon** | `src/components/curriculum/WordStyleFormulaCanvas.jsx`, `CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Xây dựng canvas soạn thảo kiểu Microsoft Word Equation: cho phép click trực tiếp vào từng vị trí trên công thức (phân số 2 tầng, căn, số mũ, nồng độ CM/C%) để sửa số hoặc chữ mà không cần textarea hay popup modal; thanh công cụ nổi Math Bubble chèn nhanh 20+ ký hiệu và tự động tính số học; thanh Ribbon 1-click chèn ngay công thức mẫu kích hoạt slot tại chỗ |
| 57 | **Thanh Công Cụ Ký Hiệu Phân Cấp Thu Gọn Bên Trái & Khắc Phục Triệt Để Hiện Tượng Nhảy Dòng / Tiết Diện Lớn** | `src/components/curriculum/HierarchicalMathPalette.jsx`, `WordStyleFormulaCanvas.jsx`, `CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Phân cấp 3 tầng môn học (Toán, Hóa, Lý, Ký hiệu) -> chuyên mục -> chip KaTeX, thu gọn w-11 rail; thanh lọc duplicate toolbars theo nguyên tắc single-version; cấu trúc lại canvas sang paragraph token line flow, thu gọn tiết diện formula text-[13.5px] px-0.5 m-0.5, chống vỡ dòng và rơi rớt dấu câu |
| 58 | **Studio Soạn Thảo Toàn Màn Hình Thay Thế Sidebar App, Thẻ Nổi Rê Chuột 2 Giây KaTeX & Thanh Tra Công Thức Siêu Linh Hoạt 4 Tab** | `src/components/curriculum/CurriculumExplorerView.jsx`, `HierarchicalMathPalette.jsx`, `WordStyleFormulaCanvas.jsx`, `CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Nâng cấp Studio thành trang độc lập toàn màn hình fixed inset-0 z-50 giải phóng 100% chiều ngang; HierarchicalMathPalette đưa lên vị trí sidebar app bên trái có nút thu gọn rail w-11; thẻ nổi hover 2000ms hiển thị công thức to và mô tả sư phạm SGK; thanh tra công thức nổi 4 tab (Cấu trúc, Hóa học, Ký hiệu, Ngoặc & Logic) kèm nhập LaTeX trực tiếp và live KaTeX preview |
| 59 | **Chuẩn Hóa Toàn Diện Studio Sư Phạm: Chèn Tại Con Trỏ, Cây Thư Mục Accordion Trắng Sáng, Nhấp Khoảng Trống Nhảy Cuối Dòng & Xóa Sổ Lỗi Ký Tự** | `src/components/curriculum/WordStyleFormulaCanvas.jsx`, `HierarchicalMathPalette.jsx`, `CurriculumStudioEditor.jsx`, `MathText.jsx` | 🟢 Hoàn thành | 100% | Chèn công thức chính xác tại vị trí con trỏ (active cursor caret) thông qua ref imperative handle; khôi phục giao diện màu trắng sáng thanh lịch cho sidebar ký hiệu; tổ chức cây thư mục Accordion Toggle kèm thanh tìm kiếm tức thì chứa hàng trăm công thức & hợp chất hóa học chuẩn SGK GDPT 2018; tự động nhảy con trỏ về cuối dòng khi nhấp khoảng trống; loại bỏ nút thêm dòng mới thừa thãi (Enter tự tách dòng); khử sạch ký tự gạch chéo ngược cuối dòng (\) và thay thế toàn diện emoji 📝 bằng icon SVG Lucide |
| 60 | **Làm Sạch Tiền Tố 'text' Thừa Trước Công Thức Hóa Học & Ion Trong KaTeX Renderer** | `src/components/common/MathText.jsx` | 🟢 Hoàn thành | 100% | Tự động bóc tách và xóa sạch chữ `text` hoặc `\text` dính liền trước ký hiệu ion hoặc hợp chất hóa học viết hoa ($SO_4^{2-}$, $H_2O$, $Fe^{3+}$), đảm bảo công thức hiển thị sắc nét, không bị KaTeX nghiêng hóa thành biến số toán |
| 61 | **Redesign Hero Banner & Thanh Chọn Miền Chuẩn Tone Trắng Sáng & Tinh Gọn** | `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Chuyển đổi toàn bộ Hero Banner đầu trang từ nền tối sang `bg-white border-slate-200/80 shadow-xs` đồng bộ 100% tone sáng; tinh gọn padding và thu nhỏ stat chips; căn đều 5 miền năng lực trên 1 hàng ngang duy nhất (`lg:grid-cols-5`) |
| 62 | **Khắc Phục Triệt Để Lỗi Mờ / Mất Tương Phản Tab 'Khoa Học Tự Nhiên'** | `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Gỡ bỏ 2 khối cầu blur trang trí nền `blur-3xl`, thiết lập `relative z-10`, chuẩn hóa nền trắng thuần `bg-white`, viền đặc sắc nét và văn bản tương phản cao |
| 63 | **Tái Cấu Trúc Header Chi Tiết Dạng Bài Tránh Chèn Ép Tiêu Đề** | `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Tách hàng 1 (badges + 3 nút) và hàng 2 (tiêu đề full-width), giải phóng hoàn toàn chiều ngang, chống bẻ dòng cụt lủn |
| 64 | **Khắc Phục Lỗi Icon Kim Cương Thẻ Bài Toán Mẫu** | `src/components/common/MathText.jsx`, `CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Regex Unicode `^[^\p{L}\p{N}\s]+` lọc sạch ký tự Unicode thay thế, thay bằng icon SVG Lucide `FileText` và `BookOpen` màu hổ phách |
| 65 | **Đồng Bộ Header Panoramic Workspace Sang Tone Trắng Sáng** | `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Chuyển đổi thanh modal header bóc tách và thanh header dạng bài sang nền trắng `bg-white border-b border-slate-200 text-slate-900` |
| 66 | **Xóa Dòng Linh Hoạt Bằng Phím Backspace Trên Canvas** | `src/components/curriculum/WordStyleFormulaCanvas.jsx` | 🟢 Hoàn thành | 100% | Bắt sự kiện Backspace tại offset 0 hoặc dòng trống, xóa dòng hoặc gộp dòng tự nhiên như Microsoft Word |
| 67 | **Loại Bỏ Đoạn Mẹo Dưới Chân Trang Canvas Soạn Thảo** | `src/components/curriculum/WordStyleFormulaCanvas.jsx` | 🟢 Hoàn thành | 100% | Xóa sạch dòng text hướng dẫn mẹo Word ở footer canvas giúp không gian tinh giản và chuyên nghiệp |
| 68 | **Chống Cắt Cụt '...' Công Thức KaTeX Dài Trong Thanh Tra Nổi** | `src/components/curriculum/WordStyleFormulaCanvas.jsx` | 🟢 Hoàn thành | 100% | Gỡ bỏ class truncate, mở rộng preview container lên 280px kèm cuộn ngang và popup inspector lên max-w-540px |
| 69 | **Khắc Phục Hiện Tượng Chữ Trắng Trên Nền Trắng Khi Tạo Câu Hỏi** | `src/components/curriculum/CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Định nghĩa rõ ràng `text-slate-900 placeholder:text-slate-400 font-medium` cho tất cả các textarea đề bài, đáp án A-D và dialog tạo mới |
| 70 | **Mở Rộng Thư Viện Ký Hiệu & Công Thức Đồ Sộ GDPT 2018 (Lớp 10 - 12)** | `src/components/curriculum/HierarchicalMathPalette.jsx`, `WordStyleFormulaCanvas.jsx` | 🟢 Hoàn thành | 100% | Mở rộng trọn vẹn 7 môn học: Ngữ Văn (Tu từ, Lập luận, Cấu trúc đoạn, Thể thơ), Địa Lý (Dân số, Khí hậu, XNK, Nông nghiệp, Tọa độ), Sinh Học (Di truyền ADN/ARN, Nguyên phân/Giảm phân, Hardy-Weinberg), và Toán Học Oxyz & Xác suất thống kê |
| 71 | **MathLab 2D/3D (JSXGraph Native Engine): Đa Dạng Hình Khối Không Gian, Tùy Chỉnh Đỉnh (X,Y,Z), Kẻ Đường Phụ Tự Do & Hệ Thống Đồ Thị VD/VDC GDPT 2018** | `src/components/curriculum/InteractiveMathWorkbenchModal.jsx`, `CurriculumStudioEditor.jsx`, `CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Thống nhất 100% JSXGraph nội sinh (loại bỏ GeoGebra); toggle sửa tọa độ (X,Y,Z) và đổi tên mọi đỉnh; 9 hình không gian THPT; tự do tạo điểm phụ trên cạnh và kẻ đường phụ; 6 chuyên đề đồ thị VD/VDC (tiệm cận xiên, trị tuyệt đối phức hợp, đạo hàm f'(x), biện luận nghiệm, tích phân diện tích, nhận dạng bộ 3 đồ thị) |
| 72 | **Standalone Live Math Renderer Component (`InteractiveMathRenderer.jsx`), Hệ Thống Tag `[MATH_GRAPH]` & `[MATH_GRAPH_3D]`, Chuẩn Hóa Serialization & Đồng Bộ Tuyệt Đối Giảng Viên - Học Sinh** | `src/components/common/InteractiveMathRenderer.jsx`, `src/utils/mathGraphUtils.js`, `MathText.jsx`, `InteractiveMathWorkbenchModal.jsx`, `AdaptiveQuizModal.jsx` | 🟢 Hoàn thành | 100% | Kiến trúc độc lập tái sử dụng cao; phân tích và render live đồ thị 2D & mô hình 3D xoay 360° (trackball) bằng JSXGraph nội sinh (không dùng ảnh chụp); tích hợp trực tiếp vào MathText cho Quiz học sinh và Studio; chuẩn hóa serialize tọa độ đỉnh tùy biến, điểm phụ, đường kẻ nét đứt/liền; đồng bộ tuyệt đối giữa màn hình soạn thảo và màn hình làm bài của học sinh |
| 73 | **Loại Bỏ Vách Lưới Trắng Bán Phần 3D, Nút Bật/Tắt Trục Oxyz SGK & Chuẩn Hóa Parser KaTeX Thẻ Bài Toán Mẫu** | `InteractiveMathRenderer.jsx`, `InteractiveMathWorkbenchModal.jsx`, `MathText.jsx` | 🟢 Hoàn thành | 100% | Tắt triệt để `xPlaneRear`/`yPlaneRear`/`zPlaneRear` loại bỏ hiện tượng nửa canvas trắng chia đôi màn hình; bổ sung nút chuyển đổi Trục Oxyz trên card 3D; chuẩn hóa regex `isSampleHeadingCallout` và tự động vá dấu sao mở đầu, phục hồi render KaTeX 100% cho các bài toán mẫu SGK |
| 74 | **Động Cơ Bảng Biến Thiên Vector (Hỗ Trợ Tiệm Cận Vạch Kép || & Tự Động Suy Luận Mũi Tên)** | `src/components/common/VariationTable.jsx`, `mathGraphUtils.js`, `MathText.jsx` | 🟢 Hoàn thành | 100% | Bảng biến thiên 3 dòng vector cho hàm đa thức & phân thức hữu tỉ 1/1 và 2/1, vạch kép `||`, tự động suy luận hướng mũi tên biến thiên từ dấu $y'$, lọc ký tự an toàn |
| 75 | **Động Cơ Vẽ Đồ Thị Vi Tích Phân 2D & Tự Động Dựng Tiệm Cận Đứng / Ngang / Xiên & Tâm Đối Xứng I** | `src/components/common/InteractiveMathRenderer.jsx` | 🟢 Hoàn thành | 100% | Vẽ tự động tiệm cận đứng, ngang, xiên nét đứt và tâm đối xứng $I$ cho hàm phân thức, ngắt nét qua tiệm cận (`discontinuous: isRational`), bảo toàn nguyên vẹn bài toán mẫu trong Studio |
| 76 | **Chuẩn Hóa Payload Nạp Tri Thức Client-Side & Khắc Phục Lỗi Validation Error CSDL** | `src/services/contentService.js`, `CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Triển khai `normalizeCorrectOption` và `sanitizeCurriculumPayload`, chuẩn hóa mọi dạng đáp án đúng (`"A."`, `"(B)"`, `"Đáp án C"`, `0..3`) về ký tự đơn `'A'..'D'`, trích xuất chi tiết lỗi Problem Details trên modal nạp CSDL |
| 77 | **Mở Quyền Quản Trị Xóa Chương Học (Cascade Delete Chapter), Xóa Bài Học & Modal Thêm Mới** | `CurriculumExplorerView.jsx`, `src/services/contentService.js` | 🟢 Hoàn thành | 100% | Tích hợp nút xóa thùng rác `Trash2` trên header Chương và Bài học; cảnh báo đệ quy số lượng bài học, dạng bài, câu hỏi trực thuộc; gọi API `DELETE /api/content/curriculum/nodes/{id}`; nút `+ Thêm Chương Mới` và `+ Thêm bài` kèm modal tạo node đồng bộ |
| 78 | **Bộ Lọc Phân Loại Tri Thức Đa Chiều (Phân Môn Riêng Biệt, Khối Lớp & Năm Học Chuẩn GDPT 2018)** | `CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Bộ lọc phân loại: Phân môn riêng biệt (Vật lí, Hóa học, Sinh học, Lịch sử, Địa lí, GDKT & PL, Tiếng Việt, Tiếng Anh, Toán); Khối lớp (Lớp 12, 11, 10); Năm học (2025 - 2026, 2024 - 2025); thống kê khớp thời gian thực và nút đặt lại bộ lọc |
| 79 | **Nền Giấy Ô Ly Vở Học Sinh 2D Phẳng Cho Hình Học Không Gian 3D (Non-3D Notebook Grid)** | `src/index.css`, `InteractiveMathRenderer.jsx`, `InteractiveMathWorkbenchModal.jsx` | 🟢 Hoàn thành | 100% | Chuyển đổi nền canvas hình học không gian 3D từ nền trắng sang nền giấy ô ly 2D phẳng chuẩn vở học sinh THPT (lưới phụ 20px, lưới chính 100px, cố định 2D không chia khối 3D); cấu hình CSS SVG transparent ghi đè JSXGraph canvas |
| 80 | **Tái Cấu Trúc Toàn Diện Hệ Trục Tọa Độ Oxyz 3D Vector & Bật/Tắt Trực Quan** | `InteractiveMathRenderer.jsx`, `InteractiveMathWorkbenchModal.jsx` | 🟢 Hoàn thành | 100% | Thay thế `defaultAxes` của JSXGraph bằng hệ trục 3D vector độc lập: gốc O(0,0,0), tia Ox đỏ, Oy xanh lá, Oz xanh dương kèm mũi tên nhọn và nhãn tọa độ; các tia đối âm nét đứt; nút bật/tắt active tức thì |
| 81 | **Hệ Thống Thông Báo Toàn Cục (Global Toast Notification System) Thay Thế Toàn Bộ Browser Alert** | `src/context/ToastContext.jsx`, `src/components/common/GlobalToastContainer.jsx`, `main.jsx`, `index.css` | 🟢 Hoàn thành | 100% | Kiến trúc Toast toàn cục: Singleton `toast.success/error/warning/info` & React hook `useToast`, container z-[999999], progress bar tự đếm ngược và tạm dừng khi rê chuột, chặn bắt an toàn `window.alert` tự động chuyển đổi thành toast, di chuyển 100% các lệnh alert cũ sang toast |
| 82 | **Hộp Thoại Xác Nhận Xóa In-App Hiện Đại (Zero Native Browser Confirm / Alert)** | `CurriculumExplorerView.jsx`, `CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Xóa bỏ 100% `window.confirm`; xây dựng in-app modal `confirmDeleteDialog` đồng bộ Glassmorphism cảnh báo rủi ro xóa Chương / Bài / Dạng; tích hợp xác nhận 2 chạm (Two-Tap Confirmation) đếm ngược khi xóa câu hỏi trong Studio |
| 83 | **Tinh Gọn Modal Sửa Nhanh (Metadata-Only Quick Edit) & Icon Cây Bút Tinh Tế** | `CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Thay nút chữ "Sửa nhanh" bằng icon button `<Pencil className="w-4 h-4" />`; tái cấu trúc modal chỉ cho phép chỉnh sửa siêu dữ liệu (Tên/tiêu đề, Chương trực thuộc, Khối lớp 10-12, Mức độ Bloom, Trọng số %), loại bỏ 4 tab nội dung chuyên sâu và hướng dẫn mở Studio Sư Phạm |
| 84 | **Tự Động Nạp Dạng Bài Khi Mở Chương & Khắc Phục KaTeX Strict Mode Unicode "Đ"** | `CurriculumExplorerView.jsx`, `MathText.jsx` | 🟢 Hoàn thành | 100% | Bổ sung `strict: 'ignore'` trong `renderKatexHtml` triệt tiêu lỗi ký tự Unicode "Đ" trong math mode; tự động chọn dạng bài đầu tiên khi nhấp vào Chương/Bài học giúp khung bên phải luôn nạp dữ liệu tức thì |
| 85 | **Giai Đoạn 1 Core Flow 4: Gia Sư AI Socratic & GraphRAG Live Streaming** | `AISocraticTutorWidget.jsx`, `AISocraticTutorModal.jsx`, `practiceService.js` | 🟢 Hoàn thành | 100% | Móc nối SSE live stream qua Gateway `:5212`, xử lý Rate Limit 429, render KaTeX MathText, modal chat 2 cột kèm Subgraph Tri thức và cắm cờ Báo cáo vi phạm |
| 86 | **Giai Đoạn 2 Core Flow 4: Tích Hợp Ngữ Cảnh Bài Tập Socratic (ZPD & Diagnostic)** | `AdaptiveQuizModal.jsx`, `AISocraticTutorModal.jsx`, `DiagnosticAssessmentPage.jsx` | 🟢 Hoàn thành | 100% | Nút hỏi gia sư Socratic khi học sinh làm sai, tự động đóng gói ngữ cảnh đề bài & phương án sai, khởi tạo lời dẫn bẻ khóa bẫy ngộ nhận, chuẩn hóa 30 câu khảo thí |
| 87 | **Chuẩn Hóa Luồng Sư Phạm: Xem Lại Đáp Án Sau Khi Nộp Bài Mới Hỏi Gia Sư AI Socratic** | `AdaptiveQuizModal.jsx`, `DiagnosticAssessmentPage.jsx`, `CurriculumExplorerView.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Ẩn nút hỏi AI trong lúc đang làm bài; hiển thị bảng đối chiếu đáp án sau khi hoàn thành bài làm và tích hợp nút hỏi Gia sư AI Socratic cho từng câu hỏi ở màn hình kết quả |
| 88 | **Khắc Phục Lỗi Tương Phản Chữ Tối Trên Nền Tối Của `MathText` & Phân Tích Socratic Bám Sát Đề Bài** | `MathText.jsx`, `DiagnosticAssessmentPage.jsx`, `practiceService.js` | 🟢 Hoàn thành | 100% | Gỡ bỏ `text-slate-700/800/900` cố định để chữ trắng hiển thị rõ nét trên nền tối; sửa lỗi dư `:**` trên thẻ Callout; tự động phân tích phương án chọn sai, đáp án đúng và đạo hàm/định lý cụ thể của từng câu |
| 89 | **Phân Hệ Lịch Sử Làm Bài & Sổ Tay Lỗi Sai Socratic (`SubmissionHistoryView`)** | `SubmissionHistoryView.jsx`, `DiagnosticAssessmentPage.jsx`, `AdaptiveQuizModal.jsx`, `CurriculumExplorerView.jsx`, `practiceService.js`, `Sidebar.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Lưu trữ & đồng bộ lịch sử các bài khảo sát 30 câu, ZPD Quiz, Chuyên đề Quiz; cho phép xem lại chi tiết bảng đáp án của mọi đề đã làm, lọc câu sai trong Sổ tay lỗi sai và hỏi Gia sư AI Socratic từng câu |
| 90 | **Tầng Dịch Vụ API Client Core Flow 5 & Chuẩn Hóa Đường Dẫn Gateway `/api/practice/...`** | `src/services/practiceService.js`, `tests/practiceService.flow5.test.js` | 🟢 Hoàn thành | 100% | Đồng bộ prefix `/api/practice/...` qua YARP Gateway, triển khai 5 API Core Flow 5 (`getStudentDashboard`, `getClassHeatmap`, `forceAggregateClassHeatmap`, `getParentDashboard`, `getCampusComparativeHeatmap`) kèm unit test |
| 91 | **Trung Tâm Phân Tích Học Tập Học Sinh Core Flow 5 (`LearningAnalyticsView`) & Dual Radar 4 Miền** | `LearningAnalyticsView.jsx`, `HeroBanner.jsx`, `MetricsGrid.jsx`, `RadarChartModal.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Đấu nối `getStudentDashboard`, hiển thị Ghost Onboarding UI, Dual Radar 4 miền (Hiện tại vs Đích), chuỗi chuyên cần 7 ngày kèm khiên Freeze, tiến độ DAG và lịch sử thi thử |
| 92 | **Ma Trận Nhiệt Lớp Học 2D Thời Gian Thực & Can Thiệp Nhóm Bàn Vi Mô 1-Click (`TeacherDashboardView`)** | `src/components/dashboard/TeacherDashboardView.jsx` | 🟢 Hoàn thành | 100% | Đấu nối `getClassHeatmap` & `forceAggregateClassHeatmap`, lọc Domain/Mastery/Risk, cảnh báo `CRITICAL_RED`, nhãn phân cực `isBimodal` và CTA 1-Click mở `ClassMicroGroupsModal` |
| 93 | **Cổng Phụ Huynh Đồng Hành (`R_exam` Readiness) & Bản Đồ Nhiệt So Sánh Cơ Sở (`ParentDashboardView`, `CampusManagerDashboardView`)** | `ParentDashboardView.jsx`, `CampusManagerDashboardView.jsx` | 🟢 Hoàn thành | 100% | Đấu nối `getParentDashboard` (chỉ số `R_exam` 3 trụ cột, kỷ luật 12h/tuần, AI Parent Alerts) và `getCampusComparativeHeatmap` (đối sánh 4 miền năng lực giữa các lớp cơ sở) |
| 94 | **Đồng Bộ Hai Chiều Bài Làm Chẩn Đoán Thực Tế Sang Phân Tích Học Tập Core Flow 5, Navbar & Sidebar (`Local History Hydration & Background Sync`)** | `practiceService.js`, `DiagnosticAssessmentPage.jsx`, `LearningAnalyticsView.jsx`, `App.jsx`, `Navbar.jsx`, `Sidebar.jsx`, `tests/practiceService.flow5.test.js` | 🟢 Hoàn thành | 100% | Sửa định danh `user.id`, tự động POST kết quả khảo thí 30 câu lên `Practice Service`, bù đắp tức thì điểm V-ACT thực, `Theta_0`, Radar 4 miền, chuỗi tự học và tên học sinh từ lịch sử bài làm thật khi `needsOnboarding = true`, xóa bỏ số liệu cứng trên Navbar & Sidebar (`6/6 tests pass`) |
| 95 | **Tinh Gọn Khung Chat Gia Sư AI Socratic & Xóa Bỏ Các Thẻ Khái Niệm Cứng (`Mạng Lưới Tri Thức 3-Hop`, `Dạng Bài Archetype`, `ARCH_LOGIC_01`)** | `src/components/modals/AISocraticTutorModal.jsx`, `src/components/dashboard/AISocraticTutorWidget.jsx` | 🟢 Hoàn thành | 100% | Loại bỏ hoàn toàn cột cứng `Mạng Lưới Tri Thức 3-Hop`, `Dạng Bài Archetype`, `Toán logic mệnh đề & suy luận kéo theo`, `ARCH_LOGIC_01`, định lý & bẫy ngộ nhận đảo cố định; chuyển sang giao diện khung chat 1 cột tập trung hiển thị đúng ngữ cảnh câu hỏi thực tế |
| 96 | **Tối Ưu Hóa Số Liệu Dashboard, Tự Động Kích Hoạt Lộ Trình DAG Sau Khảo Sát & Icon Nổi Floating AI Socratic Tutor** | `src/App.jsx`, `MilestoneCard.jsx`, `LearningAnalyticsView.jsx`, `practiceService.js` | 🟢 Hoàn thành | 100% | Thay thế AISocraticTutorWidget cồng kềnh trên dashboard bằng nút nổi FAB góc phải tinh gọn; chuẩn hóa getMyRoadmap kèm studentId và tự động mở khóa chặng học DAG thực tế từ bài thi chẩn đoán đã hoàn thành; ngăn chặn điểm ước tính IRT bị ghi đè về 0; khóa vĩnh viễn màn hình onboarding lặp lại khi đã có lịch sử thi |
| 97 | **Tách Bạch Hội Thoại Tự Do Khỏi Ngữ Cảnh Đề Thi & Khử Bỏ Dummy Options A/B** | `src/components/modals/AISocraticTutorModal.jsx`, `src/services/practiceService.js` | 🟢 Hoàn thành | 100% | Nhận diện chế độ chào hỏi/hỏi tự do; khử triệt để việc tự ý tiêm phương án A/B giả lập; phản hồi sư phạm tự nhiên, không quy chụp học sinh chọn sai khi chỉ nhắn 'hi' |
| 98 | **Bảo Toàn Trạng Thái Đã Thi Chẩn Đoán & Tối Ưu Xử Lý Lỗi Stream Socratic Modal** | `src/components/dashboard/MilestoneCard.jsx`, `src/components/modals/AISocraticTutorModal.jsx`, `src/services/practiceService.js` | 🟢 Hoàn thành | 100% | Nhận diện toàn diện lịch sử thi (recentMockExams, streak, submissions, localStorage) ngăn bắt thi lại chẩn đoán, dọn dẹp isTyping trong onError tránh treo '...', khử bỏ mặc định studentWrongOption/correctOption trong client |
| 99 | **Tự Động Kích Hoạt Lộ Trình Thích Ứng DAG & Floating Socratic FAB** | `src/components/dashboard/MilestoneCard.jsx`, `src/App.jsx` | 🟢 Hoàn thành | 100% | Tách biệt điều kiện kiểm tra đã thi, tự động gọi autoGenRoadmap với diagnosticSubmissionId thực tế, thay thế khối chat cồng kềnh trên Dashboard bằng nút FAB nổi góc phải |
| 100 | **Khắc Phục Lỗi Nuốt Exception SSE & Triệt Tiêu Treo Dấu Ba Chấm `...`** | `src/services/practiceService.js`, `src/components/modals/AISocraticTutorModal.jsx` | 🟢 Hoàn thành | 100% | Tách riêng JSON parse và kích hoạt onError khi có parsed.error, tự động điền tin nhắn sư phạm thân thiện khi stream rỗng trong onComplete, xử lý mã 429 vào bong bóng chat |
| 101 | **Chuẩn Hóa Canvas Công Thức Trực Quan WYSIWYG & Bảng Biến Thiên Lưới `2N - 1` Cột Không Nhảy Layout (`VariationTable.jsx`)** | `WordStyleFormulaCanvas.jsx`, `VariationTable.jsx`, `InteractiveFormulaBuilderModal.jsx`, `CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Chuẩn hóa lưới `2N - 1` cột căn thẳng hàng dọc tuyệt đối giữa `x`, `y'`, `y`; cố định chiều cao dòng và đặt thanh Kéo - Thả ở đáy bảng chống nhảy layout khi click; 1 click đổi dấu `+/-` và `0/||`; sửa lỗi prop `initialTemplateId` mở thẳng tab Bảng Biến Thiên trong modal |
| 102 | **Phòng Thí Nghiệm Hình Học Phẳng 2D Tương Tác 6 Mô Hình Chuẩn SGK & Thẻ `[MATH_GEOMETRY_2D]`** | `InteractiveMathWorkbenchModal.jsx`, `InteractiveMathRenderer.jsx`, `mathGraphUtils.js` | 🟢 Hoàn thành | 100% | 6 mô hình hình học phẳng 2D tương tác, dựng đường cao vuông góc chính xác chống chồng nhãn `H` và `M`, bảng tùy chỉnh tọa độ `(X,Y)` đỉnh & kẻ đường phụ 2D, khắc phục lỗi chữ nghiêng tiếng Việt trên badge `Mô hình:` |
| 103 | **Tái Thiết Kế Thư Viện Công Thức & Hợp Chất Kéo - Thả (`HierarchicalMathPalette.jsx`)** | `HierarchicalMathPalette.jsx`, `WordStyleFormulaCanvas.jsx` | 🟢 Hoàn thành | 100% | Tái thiết kế thư viện 7 môn học sang giao diện Studio Tile hiển thị công thức KaTeX / hợp chất hóa học trực quan ở trung tâm thẻ, hỗ trợ kéo - thả HTML5 (`draggable`) thẳng vào vùng soạn thảo hoặc vào ô Bảng biến thiên |
| 104 | **Bảo Toàn Ô Trống Khi Xóa Chữ & Kéo - Thả Trực Tiếp Vào Ô Con Công Thức (`VariationTable.jsx`, `WordStyleFormulaCanvas.jsx`)** | `VariationTable.jsx`, `WordStyleFormulaCanvas.jsx` | 🟢 Hoàn thành | 100% | Loại bỏ `.filter(Boolean)` làm mất cột khi xóa trắng ô `x`/`y` trên Bảng biến thiên, hiển thị nhãn `Thả số` chờ kéo thả lại; giữ nguyên khung công thức khi xóa trắng và hỗ trợ kéo thả trực tiếp vào từng ô con (tử số, mẫu số, số mũ, căn thức) |
| 105 | **Hoàn Thiện Bảng Biến Thiên Lưới `2N - 1` Cột, Hiển Thị Ký Hiệu `-∞` / `+∞` Trực Quan & Thêm Tiệm Cận Đứng 1-Click** | `src/components/common/VariationTable.jsx` | 🟢 Hoàn thành | 100% | Bổ sung nút `|| Thêm tiệm cận`, hỗ trợ kéo thả thẻ tiệm cận đứng vào khoảng giữa cột hoặc vào cột mốc bất kỳ, hiển thị `-∞` trực quan thay vì mã LaTeX thô `-\infty`, tự động co giãn độ rộng cột chống tràn số |
| 106 | **Tích Hợp AI Sinh Câu Hỏi Trắc Nghiệm Tự Động Bám Sát Dạng Bài (API 16) & Modal `AiQuestionGeneratorModal`** | `src/components/curriculum/CurriculumStudioEditor.jsx`, `aiService.js`, `contentService.js` | 🟢 Hoàn thành | 100% | Bộ đôi nút tác vụ AI tại Khối 4, kiểm tra định danh dạng bài trước khi sinh, modal tùy biến số lượng (1-5 câu) & mức độ Bloom (L1-L4), preview KaTeX trực quan, lưu hàng loạt (Batch Save) vào CSDL qua `POST /api/content/questions` |
| 107 | **Trợ Lý AI Tự Điền Câu Hỏi 1-Click Trong Hộp Thoại Thêm Mới Thủ Công (`NewQuestionDialog`)** | `src/components/curriculum/CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | 1-Click nhờ Gemini AI tự động điền đầy đủ đề bài KaTeX, 4 phương án, đáp án đúng, mức độ Bloom và lời giải chi tiết theo đúng Dạng bài đang mở |
| 108 | **Tái Thiết Kế Thanh Soạn Thảo 2 Dòng Trong Văn Bản & Đưa Dropdown STEM Lên Header Khối (`CurriculumStudioEditor.jsx`)** | `src/components/curriculum/CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Giữ dropdown công cụ STEM độc lập tại Section Header tổng thể của khối; khu vực văn bản chia 2 dòng: Dòng 1 bỏ nút ảnh (hỗ trợ Ctrl+V dán ảnh trực tiếp), giữ `+ Ví Dụ SGK` / bước mới & chế độ xem; Dòng 2 chứa thuần công cụ văn bản (`Bold`, `Italic`, `Tiêu đề`, `List`, `Numbered List`); gộp `Đồ Thị` + `MathLab` thành 1 tùy chọn duy nhất |
| 109 | **Đại Tu Toàn Diện Studio Popup Bộ Công Cụ & STEM Chuyên Sâu (`InteractiveFormulaBuilderModal.jsx` & `StemToolsDropdown`)** | `InteractiveFormulaBuilderModal.jsx`, `CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Nâng cấp modal lên kích thước Studio lớn `max-w-5xl h-[88vh]`, kiến trúc 2 cột: Cột trái sidebar phân nhóm Toán & STEM, cột phải workspace tương tác rộng rãi (VariationTable 700px+, bộ tính nồng độ Hóa học 4 thẻ, phân số trực quan) kèm Live KaTeX Preview Dock nổi; nâng cấp dropdown STEM lên Mega Menu `w-[420px]` banner sang trọng |
| 110 | **Tuyệt Đối Ẩn 100% Mã KaTeX/LaTeX Thô, Chuyên Biệt Hóa Ô Nhập Số / Ký Hiệu Trực Quan & Presets Nạp Mẫu 1-Click** | `src/components/curriculum/InteractiveFormulaBuilderModal.jsx` | 🟢 Hoàn thành | 100% | Xóa bỏ 100% textarea mã LaTeX thô và ký tự $...$, bảo đảm trải nghiệm sư phạm không lộ mã lệnh; nhập số/chữ qua ô con trực quan (tử/mẫu, căn thức, số mũ, tích phân); bộ nút nạp mẫu 1-click dùng ký hiệu tự nhiên (`x₀`, `+∞`, `sin(x)`); Live KaTeX Preview Dock thuần túy hiển thị công thức chuẩn SGK |
| 111 | **Thanh Soạn Thảo Công Thức Toàn Năng Siêu Linh Hoạt, Tự Tính Đáp Số Cho Mọi Phép Toán & Chèn Ký Hiệu Theo Con Trỏ** | `src/components/curriculum/WordStyleFormulaCanvas.jsx`, `src/components/curriculum/CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Thanh soạn thảo công thức toàn năng (Universal Formula Bar) chấp nhận mọi công thức không giới hạn độ phức tạp; Dock xem trước trực quan KaTeX chuẩn SGK tức thì; nút `⚡ Tính` tự động phân tích và tính toán đáp số chuẩn xác cho mọi phép toán (phân số, chia, căn bậc hai, lũy thừa, số học, nồng độ CM/C%); chèn ký hiệu nhận biết vị trí con trỏ (cursor-aware insertion) và bao bọc vùng chọn; nút xóa 1-click & Backspace tự nhiên; xóa sạch 100% nhãn kỹ thuật `LaTeX:` gây phản cảm |
| 112 | **Khung Điền Số Trực Quan Phân Số Chuẩn SGK & Bộ Chuyển Đổi Toán Tự Nhiên Hai Chiều (0% Lộ Mã KaTeX/LaTeX)** | `src/components/curriculum/WordStyleFormulaCanvas.jsx` | 🟢 Hoàn thành | 100% | Bổ sung khung điền số trực quan dạng phân số chuẩn SGK (tử số, gạch ngang, mẫu số, đáp số), căn thức, lũy thừa, hóa học; bộ chuyển đổi hai chiều `latexToNaturalMath` & `naturalMathToLatex` giúp thanh soạn thảo nhận dạng toán tự nhiên (`12/4 = 3`, `√(16) = 4`, `lim(x → x₀)`), tuyệt đối không bao giờ hiển thị mã LaTeX hay ký tự `\` cho giảng viên/người dùng |
| 113 | **Khắc Phục Triệt Để Toàn Bộ Lỗi Import Runtime & Triệt Tiêu Trắng Trang (White Screen)** | `src/components/curriculum/WordStyleFormulaCanvas.jsx` | 🟢 Hoàn thành | 100% | Bổ sung đầy đủ các import còn thiếu (`parseVariationTableString` từ `VariationTable.jsx`, `unescapeLiteralNewlines` từ `MathText.jsx`, `useImperativeHandle` từ React), bảo đảm việc render khối bảng biến thiên `[VARIATION_TABLE]`, chuẩn hóa tài liệu và liên kết imperative handle giữa Studio Editor với Canvas vận hành trơn tru 100%, chấm dứt hoàn toàn lỗi ReferenceError |
| 114 | **Chuẩn Hóa UI Khối 4 Hàng Thẳng Lối, Xóa Bỏ Nút Dán Ảnh & Bảng Công Cụ STEM Trôi Nổi Cạnh Phải Màn Hình** | `src/components/curriculum/CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Căn thẳng hàng 1 dòng header Khối 4 (AI Sinh Câu Hỏi + Thêm Mới), xóa bỏ emoji lặp lại; gỡ nút dán ảnh rời rạc; thống nhất dropdown STEM duy nhất trên thanh Header; bổ sung nút trôi nổi neo cạnh phải màn hình mũi tên `<` mở slide-over drawer toàn bộ công cụ MathLab 2D/3D, Bảng biến thiên, Hóa học và Phân số |
| 115 | **Khắc Phục Lỗi Cú Pháp Import Dấu Phẩy & Tinh Chỉnh Nút STEM Trôi Nổi Cạnh Phải Siêu Gọn Nhẹ** | `src/components/curriculum/CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Bổ sung dấu phẩy cuối `Table2,` triệt tiêu lỗi TS1005 (',' expected); thay thế tab dài 160px bằng mini-tab `< ✨ STEM` siêu gọn nhẹ ~55px x ~20px ôm sát viền phải không che lấn nội dung trang soạn thảo, thu gọn kích thước drawer trượt xuống 380px |
| 116 | **Tối Giản Bảng STEM (Search Đầu Trang, Xóa Icon & GDPT 2018, Chèn Chuẩn Xác Tại Con Trỏ)** | `src/components/curriculum/CurriculumStudioEditor.jsx`, `src/components/curriculum/WordStyleFormulaCanvas.jsx` | 🟢 Hoàn thành | 100% | Gỡ bỏ nút dropdown thừa trên top header; xóa huy hiệu GDPT 2018; thêm ô tìm kiếm trực tiếp (Search); tinh giản danh sách công cụ chỉ hiển thị Tiêu đề và Mô tả (0% icon/emoji); gỡ bỏ dropdown chọn mục; chèn chuẩn xác tại vị trí dòng con trỏ đang đứng thay vì vứt cuối trang |
| 117 | **Loại Bỏ Banner Header Live Preview Xanh Lá & Tối Ưu Không Gian Xem Trước** | `src/components/curriculum/CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Gỡ bỏ hoàn toàn thanh banner 'Giao Diện Trực Quan Học Sinh Nhìn Thấy (Live Preview) - Thời gian thực' màu xanh lá, giải phóng không gian dọc, giúp container học sinh bắt đầu ngay từ trên cùng tinh gọn |
| 118 | **Tách Rời Thẻ Câu Hỏi Linh Hoạt & Co Giãn Khung Chữ Nhật Lời Giải Chi Tiết** | `src/components/curriculum/CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Xóa bỏ max-h-80 gây bó hẹp câu hỏi; tách rời từng card độc lập h-auto; hiển thị đầy đủ 4 phương án A-D; khung chữ nhật lời giải chi tiết tự động co giãn theo dung lượng chữ |
| 119 | **Tinh Gọn Chiều Rộng Sidebar Ký Hiệu Bên Trái & Tiết Kiệm Không Gian Soạn Thảo** | `src/components/curriculum/HierarchicalMathPalette.jsx` | 🟢 Hoàn thành | 100% | Giảm mạnh chiều rộng sidebar từ 336px xuống 240-256px (thu gọn ~30%), nén header 1 dòng, thu nhỏ rail đóng xuống w-10, thẻ công thức nhỏ gọn sắc nét |
| 120 | **Chuyển Đổi Sắp Xếp Danh Sách Công Thức Sang 1 Cột Duy Nhất (Single-Column Formula Rows)** | `src/components/curriculum/HierarchicalMathPalette.jsx` | 🟢 Hoàn thành | 100% | Chuyển toàn bộ danh mục cây thư mục và tìm kiếm từ grid-cols-2 sang 1 cột duy nhất (grid-cols-1), tối ưu diện tích thẻ, công thức KaTeX không bị co cụm và dễ kéo thả |
| 121 | **Tối Ưu Siêu Gọn Chiều Ngang Sidebar, Carousel 3 Môn Học Vòng Lặp Vô Tận & Rê Chuột Giữ Xem Mô Phỏng Chi Tiết** | `src/components/curriculum/HierarchicalMathPalette.jsx` | 🟢 Hoàn thành | 100% | Thu hẹp sidebar xuống w-48/w-52 (192-208px), carousel 3 môn học ngang với 2 nút < > xoay tròn vô tận (modulo loop), thẻ công thức 1 dòng đơn giản và popup hover dwell xem mô phỏng chi tiết |
| 122 | **Đại Tu Toàn Diện Giao Diện Sidebar Ký Hiệu & STEM (Modern Redesign) & Carousel 2 Môn Học Không Tràn Chữ** | `src/components/curriculum/HierarchicalMathPalette.jsx` | 🟢 Hoàn thành | 100% | Redesign toàn bộ sidebar: Header sáng chuẩn Apple, ô tìm kiếm bo tròn, carousel 2 môn song song rộng rãi không tràn chữ T.../H..., thẻ accordion xoay chevron và dòng công thức tinh tế |
| 123 | **Bộ Chuyển Đổi 1 Môn Học Duy Nhất Kèm Hiệu Ứng Slide Trượt Mượt Mà (< >) & 7 Chấm Định Vị Trực Quan** | `src/components/curriculum/HierarchicalMathPalette.jsx` | 🟢 Hoàn thành | 100% | Chuyển sang hiển thị 1 môn học duy nhất ở trung tâm không bao giờ tràn chữ, hiệu ứng slide trượt động mượt mà khi bấm < >, 7 chấm tròn chuyển nhanh và vòng lặp vô hạn |
| 124 | **Loại Bỏ Khối Terminal Đen Thô Kệch & Tích Hợp Render Trực Quan Bảng Biến Thiên Trong Hover Card** | `src/components/curriculum/HierarchicalMathPalette.jsx` | 🟢 Hoàn thành | 100% | Xóa sạch khối terminal code đen thô [VARIATION_TABLE], tích hợp component VariationTable render trực quan bảng biến thiên vector và KaTeX chuẩn sư phạm |
| 125 | **Khắc Phục Lỗi Runtime ReferenceError (hoveredBbtData Is Not Defined)** | `src/components/curriculum/HierarchicalMathPalette.jsx` | 🟢 Hoàn thành | 100% | Bổ sung useMemo hoveredBbtData phân tích khối [VARIATION_TABLE], triệt tiêu hoàn toàn lỗi ReferenceError khi rê chuột xem thẻ hover BBT |
| 126 | **Tối Ưu Trải Nghiệm Tương Tác Thẻ Hover (Hover Bridge, Grace Period & Drag-Drop Trực Tiếp)** | `src/components/curriculum/HierarchicalMathPalette.jsx` | 🟢 Hoàn thành | 100% | Bổ sung hoverCloseTimerRef grace window (320ms), lớp đệm vô hình before: nối liền khoảng hở, pointer-events-auto, hỗ trợ click chèn ngay và kéo thả trực tiếp từ thẻ hover vào bài soạn |
| 127 | **Khắc Phục Lỗi Enter Xuống Dòng, Chèn Snippet, Kéo Thả Span & Di Chuột Sidebar** | `src/components/curriculum/WordStyleFormulaCanvas.jsx`, `HierarchicalMathPalette.jsx` | 🟢 Hoàn thành | 100% | Đồng bộ docLinesRef, guard onBlur chống ghi đè xóa dòng, hỗ trợ onDrop trên span contentEditable, loại bỏ pseudo-element che phủ sidebar |
| 128 | **Tối Ưu Thẻ Hover Portal Body & DataTransfer Drop Fallback** | `src/components/curriculum/HierarchicalMathPalette.jsx`, `WordStyleFormulaCanvas.jsx` | 🟢 Hoàn thành | 100% | Sử dụng createPortal gắn thẻ hover vào body z-99999 độ trễ 80ms, bổ sung text/plain fallback và .includes cho khối BBT |
| 129 | **Khắc Phục Lỗi Runtime ReferenceError (createPortal Is Not Defined)** | `src/components/curriculum/HierarchicalMathPalette.jsx` | 🟢 Hoàn thành | 100% | Bổ sung import { createPortal } from 'react-dom' trên đầu file HierarchicalMathPalette.jsx |
| 130 | **Khắc Phục Lỗi Xóa Hết Chữ Nhấn Backspace/Delete Không Tự Động Xóa Dòng & Thu Hồi Con Trỏ Liền Mạch** | `src/components/curriculum/WordStyleFormulaCanvas.jsx` | 🟢 Hoàn thành | 100% | Sử dụng `docLinesRef.current` triệt tiêu stale closure, cập nhật `tok.text` tức thời trên `onInput`, chuẩn hóa regex khoảng trắng/newline/zero-width space xác nhận dòng trống, xóa dòng tức thì qua `flushSync` và tự động focus cuối dòng liền trước |
| 131 | **Khắc Phục Lỗi Runtime flushSync Is Not Defined & Gộp Dòng Liền Mạch Khi Nhảy Dòng Lên** | `src/components/curriculum/WordStyleFormulaCanvas.jsx` | 🟢 Hoàn thành | 100% | Bổ sung `import { flushSync } from 'react-dom'`, kiểm tra range.startOffset nhận diện đầu dòng, gộp nối các token chữ liền kề thành 1 span duy nhất |
| 132 | **Triển Khai Giao Diện Thanh Toán Học Phí PayOS (VietQR) & Kích Hoạt Lộ Trình Thích Ứng PLAR** | `src/services/paymentService.js`, `PayOsCheckoutModal.jsx`, `TuitionPaymentView.jsx` | 🟢 Hoàn thành | 100% | Tích hợp cổng thanh toán trực tuyến PayOS VietQR, modal thanh toán có polling tự động 3 giây, hiệu ứng pháo hoa mở khóa chặng 1 PLAR, 3 gói đào tạo chuẩn ĐGNL, tích hợp Cổng Phụ Huynh và Sidebar (6/6 tests pass) |
| 133 | **Chuẩn Hóa Ô Nhập Mã OTP Xác Thực & Bỏ Tự Động Điền Sẵn Cho Luồng Kích Hoạt / Đổi Mật Khẩu** | `src/components/auth/WebLoginPage.jsx`, `ForgotPasswordModal.jsx`, `authService.js` | 🟢 Hoàn thành | 100% | Loại bỏ hoàn toàn cơ chế điền sẵn OTP và huy hiệu hiển thị OTP; chuẩn hóa ô nhập số 6 chữ số trống hoàn toàn để người dùng tự nhập mã nhận từ Gmail; phân định rõ modalMode 'activation' vs 'forgot' |
| 134 | **Nâng Cấp Giao Diện Fintech Hiện Đại (Lưới 6 Ô OTP, Đếm Ngược 60s, Step Indicator) & Hoàn Thiện UC 05 / 06** | ForgotPasswordModal.jsx, WebLoginPage.jsx, piClient.js | 🟢 Hoàn thành | 100% | Thay thế ô nhập đơn điệu bằng lưới 6 ô vuông OTP hiện đại (tự nhảy ô, Backspace, Ctrl+V), đếm ngược 60s & nút gửi lại mã, thanh tiến trình 3 bước, kiểm tra độ mạnh mật khẩu thời gian thực, bóc tách lỗi description triệt tiêu [object Object]; 6/6 tests pass; build sạch 100% |
| 135 | **Hợp Nhất Tự Động Nhánh `ThinhTT/feature-curriculum-studio-formula-editor` Vào `develop` & Đồng Bộ Toàn Diện Core Flow 2, 4, 5, PayOS & OTP Auth** | `src/App.jsx`, `src/components/dashboard/ParentDashboardView.jsx`, `src/components/layout/Sidebar.jsx`, `src/components/modals/index.js` | 🟢 Hoàn thành | 100% | Hợp nhất sạch sẽ 100% Curriculum Studio, PayOS VietQR, OTP Auth với Core Flow 4 Socratic AI Tutor và Core Flow 5 Learning Analytics & Heatmaps; `npm test` (9/9 pass), `npm run build` (0 errors) |
| 136 | **Tầng Dịch Vụ API Client Core Flow 6 (`Predictions`, `EarlyWarnings`, `Mistakes SM-2`)** | `src/services/apiClient.js`, `src/services/practiceService.js`, `tests/practiceService.flow6.test.js` | 🟢 Hoàn thành | 100% | Bổ sung `apiClient.patch`, triển khai 13 API Core Flow 6 khớp `snake_case`/`camelCase` DTO của Practice Service kèm lưu trữ trạng thái fallback bền vững và unit test |
| 137 | **Dự Báo Điểm SEM 95%, Toa Thuốc Bù Điểm Knapsack ROI & Modal Luyện Tập Biến Thể (`ScorePredictionPanel`, `PrescriptionPracticeModal`)** | `ScorePredictionPanel.jsx`, `PrescriptionPracticeModal.jsx`, `LearningAnalyticsView.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Thanh khoảng điểm dự kiến thang 1200đ, bảng cân đối thiếu hụt mục tiêu, xếp hạng dạng bài bù điểm tối ưu, modal làm bài biến thể gạch nợ điểm thiếu hụt khi đạt `>= 67%` kèm đối chiếu Gia sư AI |
| 138 | **Trung Tâm Chuông Thông Báo Navbar & Hộp Thư Cảnh Báo Sớm 3 Tầng (`NotificationBellPopover`, `StudentEarlyWarningsCard`)** | `NotificationBellPopover.jsx`, `Navbar.jsx`, `StudentEarlyWarningsCard.jsx`, `LearningAnalyticsView.jsx` | 🟢 Hoàn thành | 100% | Huy hiệu đếm động trên chuông Navbar theo vai trò, bộ lọc 3 tầng cảnh báo/nhắc nhở, xem ghi chú giáo viên cố vấn và đánh dấu đã đọc thời gian thực |
| 139 | **Bảng Điều Phối Cảnh Báo Sớm Cố Vấn, Can Thiệp Sư Phạm & Đặt Lịch Tư Vấn 3 Bên (`EarlyWarningsMentorPanel`)** | `EarlyWarningsMentorPanel.jsx`, `TeacherDashboardView.jsx`, `CampusManagerDashboardView.jsx` | 🟢 Hoàn thành | 100% | 6 thẻ KPI cảnh báo lớp/cơ sở, đối chiếu điểm dự kiến vs mục tiêu, modal ghi nhận biên bản can thiệp (`resolve`) và modal hẹn tư vấn 3 bên hiệu chỉnh mục tiêu khả thi (`schedule-counseling`) |
| 140 | **Sổ Tay Câu Làm Sai, Ôn Tập Định Kỳ (`MistakeNotebookSM2View`) & Điều Hướng Toàn Tuyến 4 Vai Trò** | `MistakeNotebookSM2View.jsx`, `Sidebar.jsx`, `ParentDashboardView.jsx`, `LearningAnalyticsView.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Lọc lỗi sai theo nguyên nhân, ghi chú rút kinh nghiệm, phiên ôn câu hỏi tương tự (`3x -> Nắm vững`), tích hợp Sidebar & Cổng Phụ huynh đồng hành cùng PayOS |
| 141 | **Chuẩn Hóa Ngôn Ngữ Học Tập Thân Thiện Cho Học Sinh & Ẩn Toàn Bộ Thuật Ngữ Kỹ Thuật Nội Bộ** | `LearningAnalyticsView.jsx`, `ScorePredictionPanel.jsx`, `StudentEarlyWarningsCard.jsx`, `MistakeNotebookSM2View.jsx`, `PrescriptionPracticeModal.jsx`, `AdaptiveQuizModal.jsx`, `AISocraticTutorModal.jsx`, `NotificationBellPopover.jsx`, `Sidebar.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Lược bỏ hoàn toàn thuật ngữ nội bộ (`Core Flow 1..6`, `Socratic`, `IRT 2PL`, `BKT P(Lt)`, `SEM`, `Knapsack ROI`, `SM-2`, `BR-04`, `PAT_SKILL_*`, `AUTO_INIT`, nút debug Ghost Onboarding), chuyển sang ngôn ngữ học tập tự nhiên, dễ hiểu cho học sinh |
| 136 | **Phân Chia Cổng Giao Diện Độc Lập Cho 5 Vai Trò (`student`, `parent`, `teacher`, `manager`, `admin`) & Đồng Bộ Template Màu Sắc Chuẩn Trang Chủ (`#FDFBF7`)** | `src/App.jsx`, `src/components/layout/Sidebar.jsx`, `src/components/layout/Navbar.jsx`, `src/components/auth/WebLoginPage.jsx`, `src/components/auth/LoginForm.jsx`, `src/services/authService.js`, `src/components/dashboard/HeroBanner.jsx`, `src/components/diagnostic/DiagnosticAssessmentPage.jsx`, `src/components/diagnostic/SubmissionHistoryView.jsx` | 🟢 Hoàn thành | 100% | Tách biệt hoàn toàn cổng làm việc, menu Sidebar, thanh Subpage Tab cho đủ 5 role (`student`, `parent`, `teacher`, `manager`, `admin`); đồng bộ nền kem sáng `#FDFBF7`, thẻ trắng `bg-white`, dải gradient `from-blue-600 via-indigo-600 to-cyan-500` và điểm nhấn vàng `#FACC15` từ Trang chủ cho toàn bộ các trang (`DiagnosticAssessmentPage`, `SubmissionHistoryView`, `HeroBanner`, `WebLoginPage`); `npm test` (9/9 pass), `npm run build` (0 errors) |
| 137 | **Loại Bỏ 100% Demo / Hardcode / Mock Fallback, Xóa Thư Mục `tests/` & Đấu Nối Trực Tiếp 100% Dữ Liệu Thực Từ Backend API Cho Toàn Bộ 5 Vai Trò** | `src/services/authService.js`, `src/services/userService.js`, `src/services/paymentService.js`, `src/services/practiceService.js`, `src/App.jsx`, `src/components/layout/Navbar.jsx`, `src/components/layout/Sidebar.jsx`, `src/components/auth/LoginForm.jsx`, `src/components/auth/WebLoginPage.jsx`, `src/components/dashboard/*.jsx`, `src/components/modals/*.jsx`, `src/components/payment/TuitionPaymentView.jsx`, `package.json`, `.github/workflows/ci.yml` | 🟢 Hoàn thành | 100% | Gỡ bỏ 100% nút 1-Click Demo Login, thanh chuyển role thủ công, token giả `eyDemoAccessToken123456`, các hàm `buildSeed*` / `getDefaultSeedHistory`, toàn bộ import `mockData.js` và thư mục `tests/`; đấu nối 100% dữ liệu thực từ Backend qua Gateway `:5212` (`GET /api/v1/users/me`, `getStudentDashboard`, `getParentDashboard`, `getClassHeatmap`, `getCampusComparativeHeatmap`, `getCampuses`, `getUsers`, PayOS `/api/practice/payments/...`); `npm run build` (0 errors) |
| 138 | **Đồng Bộ Điều Hướng Đăng Nhập / Đăng Ký Trên Trang Chủ & Kiểm Tra Tính Hợp Lệ Đa Tầng Cho Email Đăng Ký (DNS MX, Chống Email Ảo & Gợi Ý Sửa Tên Miền)** | `src/App.jsx`, `src/utils/emailValidator.js`, `src/services/authService.js`, `src/components/auth/RegisterForm.jsx`, `src/components/auth/WebLoginPage.jsx`, `src/components/auth/ForgotPasswordModal.jsx` | 🟢 Hoàn thành | 100% | Đấu nối `onOpenLogin`, `onOpenRegister` từ `PublicLandingPage` sang `WebLoginPage` (`initialMode`); triển khai `emailValidator.js` kiểm tra cú pháp RFC 5322, quy tắc Gmail (6-30 ký tự), chặn chuỗi lặp giả mạo (`22222`), chặn email ảo 10 phút, gợi ý sửa sai chính tả tên miền 1-Click và kiểm tra trực tuyến bản ghi DNS MX + CSDL (`GET /api/auth/validate-email`); `npm run build` (`3007 modules`, 0 errors) |
| 139 | **Hệ Thống Liên Kết Phụ Huynh - Học Sinh 3 Phương Thức Trực Tiếp Trên Web (Mã Code `VE-XXXXXX` / PIN 6 Số, Link 1-Click & QR Code, Xác Nhận 2 Chiều)** | `src/components/dashboard/StudentParentLinkCard.jsx`, `src/components/dashboard/ParentDashboardView.jsx`, `src/services/userService.js`, `src/App.jsx` | 🟢 Hoàn thành | 100% | Triển khai Trung tâm Liên kết Tài khoản Học sinh 3 Tab trên `ParentDashboardView.jsx` (hỗ trợ cả khi chưa có con và nút `+ Liên kết thêm con`), tự động bắt `?parentLinkCode=` từ Link/QR; triển khai `StudentParentLinkCard.jsx` trên Cổng Học Viên hiển thị Mã `VE-XXXXXX`, PIN 6 số, Link, QR và banner duyệt yêu cầu liên kết 1-Click; `npm run build` (`3008 modules`, 0 errors) |
| 144 | **Tái Cấu Trúc Toàn Diện Thanh Điều Hướng Subpage Segmented Control Hiện Đại, Hỗ Trợ Động Giám Đốc Học Thuật (Director) & Kiểm Tra Email Đa Tầng Cấp Phát Tài Khoản** | `src/App.jsx`, `src/components/admin/AccountProvisioningView.jsx`, `src/utils/emailValidator.js` | 🟢 Hoàn thành | 100% | Tái thiết kế thanh điều hướng theo chuẩn Segmented Control hiện đại (`bg-slate-100/90`, tab active thẻ nổi trắng `bg-white text-blue-700 shadow-sm`), triệt tiêu 100% lỗi ngắt dòng 2 hàng lộn xộn; nhận diện động Cổng Giám Đốc Học Thuật (`ACADEMIC_DIRECTOR`); tích hợp bộ kiểm tra email đa tầng DNS MX và gợi ý sửa lỗi typo `mail.com` -> `gmail.com` trực tiếp vào ô cấp tài khoản; `npm run build` đạt 0 Error |
| 143 | **Phân Hệ Quản Lý Tài Khoản Ngừng Hoạt Động (Soft Delete / Inactive) & Thùng Rác Lưu Trữ** | `src/components/admin/AccountProvisioningView.jsx`, `src/services/userService.js` | 🟢 Hoàn thành | 100% | Tách biệt 2 chế độ xem: "Tài Khoản Đang Hoạt Động" (chỉ hiện active, ẩn tài khoản vô hiệu hóa) vs "Tài Khoản Đã Ngừng Hoạt Động (Ẩn)" (kèm badge đếm realtime); tích hợp 2 Modal xác nhận Ngừng hoạt động (icon UserX, cảnh báo bảo toàn dữ liệu) và Khôi phục hoạt động (icon RotateCcw); hỗ trợ click thẻ thống kê chuyển tab tức thì; `npm run build` đạt 0 Error |
| 144 | **Mở Rộng Không Gian Làm Việc Toàn Màn Hình (`w-full`) Sát Sidebar, Tinh Chỉnh Bảng Tài Khoản 1 Dòng & Hỗ Trợ Query Params Trong `apiClient.js`** | `src/App.jsx`, `src/components/admin/AccountProvisioningView.jsx`, `src/components/dashboard/CampusManagerDashboardView.jsx`, `src/components/dashboard/ParentDashboardView.jsx`, `src/components/payment/TuitionPaymentView.jsx`, `src/services/apiClient.js` | 🟢 Hoàn thành | 100% | Thay thế `max-w-7xl mx-auto` bằng `w-full` đồng bộ với `Navbar` & `Sidebar` triệt tiêu khoảng trống thừa và thanh cuộn ngang; chuẩn hóa `whitespace-nowrap` cho toàn bộ badge vai trò, trạng thái và nút thao tác trên 1 dòng; bổ sung serialize `options.params` (`URLSearchParams`) và `apiClient.patch` trong `apiClient.js`; `npm run build` (`3008 modules`, 0 errors) |

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

| 145 | **Tinh Gọn & Thiết Kế Lại Bố Cục Màn Hình Đăng Nhập (6/6 Cân Xứng, Không Cuộn Trang) + Chuẩn Hóa Lỗi Từ Backend** | `src/utils/apiErrorHandler.js`, `src/services/apiClient.js`, `src/services/authService.js`, `src/utils/emailValidator.js`, `src/components/auth/` | 🟢 Hoàn thành | 100% | Gỡ bỏ thuật ngữ nội bộ (`ZPD`, `IRT`, `DAG`, `CAT`, `Socratic`, `IAM`, `JWT`, `Gateway`, `MX`, `v2.4`) và khung *"Đăng nhập một tài khoản cho mọi vai trò"*; thiết kế lại bố cục `6/6` cân xứng vừa 1 màn hình không scroll; truyền thẳng thông báo lỗi từ BE và fallback sạch khi phản hồi rỗng (`502`/`503`/`504`/offline); `25/25` unit tests pass, `npm run build` sạch |

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

| 146 | **Khắc Phục Lỗi Lịch Sử Làm Bài & Bóc Tách Đề Thi Luyện Tập Thích Ứng ZPD** | `src/services/practiceService.js`, `src/components/modals/AdaptiveQuizModal.jsx` | 🟢 Hoàn thành | 100% | Bỏ tiền tố thừa `/v1/` trong `getDiagnosticHistory` & `getDiagnosticResult` khớp route Controller Practice Service; bóc tách câu hỏi ZPD từ cả `passages[].questions` và `single_questions`; 28/28 tests pass |
