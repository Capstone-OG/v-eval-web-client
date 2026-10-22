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
