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

