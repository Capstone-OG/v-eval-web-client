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
  - `src/components/curriculum/`:
    + `CurriculumExplorerView.jsx`: Cây tri thức phân cấp 3 tầng, không gian Panoramic Workspace, bộ lọc Bloom L1-L4 và duyệt câu hỏi mẫu.
    + `CurriculumStudioEditor.jsx`: Studio hiệu đính sư phạm toàn diện, chế độ Text In Preview, bàn phím ảo KaTeX STEM 10 danh mục, dán ảnh màn hình clipboard Ctrl+V.
    + `InteractiveFormulaBuilderModal.jsx`: Trình tạo công thức và đồ thị trực quan (Click-to-Fill Formula Builder) không cần gõ mã LaTeX.
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



