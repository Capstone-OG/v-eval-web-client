# NHẬT KÝ TIẾN ĐỘ HẰNG NGÀY (DAILY LOG) - V-EVAL WEB CLIENT

---

## [06/10/2026] - Khắc Phục Sự Cố Thông Báo Discord, Thiết Lập CI/CD GitHub Actions & Hoàn Thiện Tích Hợp Web Client
- **Sửa Lỗi Thiếu Thông Báo Discord & Thiết Lập CI/CD GitHub Actions Cho Web Client**:
  - Phát hiện nguyên nhân Web Client trước đó không gửi thông báo về Discord: Repo thiếu hoàn toàn thư mục cấu hình `.github/workflows`.
  - Thiết lập `.github/workflows/discord-commit-tracker.yml`: Tự động bắt sự kiện `push` trên mọi nhánh, bóc tách commit SHA, danh sách file thay đổi kèm emoji chỉ thị, đọc nội dung `UPDATE.md` và gửi tin nhắn embed thời gian thực về webhook Discord hệ thống.
  - Thiết lập `.github/workflows/ci.yml`: Tự động kiểm thử `npm ci` và biên dịch `npm run build` trên Node.js 20.x cho mỗi commit/PR.
- **Kiểm Thử Vận Hành & Build Verification**:
  - Chạy `npm run build` thành công 100% trong 679ms (0 error, 0 warning).
  - Xác nhận 2903 modules Vite được đóng gói hoàn hảo.

---

## [05/10/2026] - Hợp Nhất Giao Diện Xác Thực (TNhan UI/UX) Với Tầng API IAM (ThinhTT), Cấp Quyền Đa Vai Trò
- **Hợp Nhất Toàn Diện Hệ Thống Xác Thực (Auth Subsystem)**:
  - Tiếp nhận và nâng cấp toàn bộ giao diện Auth hiện đại từ nhánh `TNhan`:
    + Split-screen layout 12 cột với ảnh sinh viên thật `vietnamese_student_real.jpg`, thanh ticker tin tức hoạt động thời gian thực (`liveActivities`), và hiệu ứng động mượt mà bằng Framer Motion.
    + Module hóa form đăng nhập (`LoginForm.jsx`), form đăng ký (`RegisterForm.jsx`), modal quên mật khẩu 4 bước OTP (`ForgotPasswordModal.jsx`) và popup modal nhanh (`AuthModal.jsx`).
    + Tích hợp Custom Rounded Select bo góc cao cấp cho lựa chọn Khối Lớp (12, 11, Thí sinh tự do) và Mục tiêu điểm ĐGNL (900+, 800+, 700+).
    + Hiển thị thông báo lỗi trực tiếp từng trường nhập liệu (`fieldErrors`), thanh đo độ mạnh mật khẩu 3 cấp độ (`passStrength`).
  - Đấu nối 100% logic API và Tầng dịch vụ IAM từ nhánh `ThinhTT`:
    + Thay thế toàn bộ mã giả lập `setTimeout` bằng các hàm gọi API thật qua `authService.js` (`POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/verify-account`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`).
    + Tích hợp nạp động danh sách Cơ sở Đào tạo (`GET /api/v1/campuses`) vào dropdown bo tròn trong `RegisterForm.jsx`.
    + Bắt mã lỗi tài khoản chưa kích hoạt (`Auth.AccountNotActivated`) để tự động mở bước xác thực mã OTP 6 số.
    + Bảo toàn 1-Click Demo Login cho 4 vai trò (Học sinh, Giáo viên, Quản lý cơ sở, Phụ huynh) với cơ chế fallback offline an toàn.
- **Bảo Toàn 100% Các Tính Năng Độc Quyền Của Nhánh ThinhTT**:
  - Trang Quản trị Cấp phát Tài khoản IAM (`src/components/admin/AccountProvisioningView.jsx`).
  - Bảng điều khiển Quản lý Học thuật Cơ sở (`src/components/dashboard/CampusManagerDashboardView.jsx`).
  - Bảng điều khiển Phụ huynh (`src/components/dashboard/ParentDashboardView.jsx`).
  - Tầng dịch vụ quản lý User và cấp phát tài khoản (`src/services/userService.js`).
  - Bộ định tuyến trung tâm và quản trị trạng thái phiên làm việc (`src/App.jsx`).

---

## [04/10/2026] - Triển Khai Hoàn Chỉnh Trang Cấp Phát & Quản Lý Tài Khoản Đa Vai Trò (IAM Provisioning Page), Smart RBAC & Móc Nối Backend CSDL
- **Triển Khai Trang Quản Trị Cấp Phát Tài Khoản Đa Vai Trò (`AccountProvisioningView.jsx`)**:
  - Giao diện quản trị cấp cao: Thống kê số lượng tài khoản thời gian thực (Tổng số, Giảng viên, Quản lý, Học sinh & Phụ huynh, Tỷ lệ kích hoạt).
  - Bộ lọc vai trò tức thì (Tất cả, `TEACHER`, `ACADEMIC_MANAGER`, `ACADEMIC_DIRECTOR`, `ADMINISTRATOR`, `PARENT`, `STUDENT`) và ô tìm kiếm thông minh theo Họ tên, Email, Số điện thoại.
  - Bảng dữ liệu người dùng trực quan: Avatar gradient, Huy hiệu vai trò RBAC sắc nét, Cơ sở công tác, Bộ môn chuyên môn, và Nút gạt chuyển đổi trạng thái Khóa / Mở khóa tài khoản thời gian thực gọi trực tiếp API `PATCH /api/v1/users/{id}/toggle-status`.
  - Modal **Cấp Phát Tài Khoản Mới**:
    + Card lựa chọn trực quan 6 vai trò kèm mô tả chức năng chi tiết.
    + Dropdown nạp danh sách cơ sở đào tạo thực tế từ CSDL PostgreSQL (`GET /api/v1/campuses`).
    + Form nhập thông tin cán bộ, chuyên môn phụ trách, bộ tạo mật khẩu ngẫu nhiên an toàn hoặc mật khẩu tùy chỉnh.
    + Hộp thông báo cấp tài khoản thành công kèm nút **"Sao chép thông tin bàn giao"** một chạm để gửi ngay cho cán bộ.
- **Tầng Dịch Vụ Người Dùng Mới (`src/services/userService.js`)**:
  - `getUsers(params)`: Gọi API `GET /api/v1/users` qua Gateway YARP `:5212`.
  - `provisionUser(userData)`: Gọi API `POST /api/v1/users/provision` nạp thẳng vào CSDL PostgreSQL, kích hoạt ngay không cần OTP.
  - `toggleUserStatus(userId)`: Gọi API `PATCH /api/v1/users/{id}/toggle-status`.
- **Tích Hợp Điều Hướng & Trải Nghiệm Người Dùng (`App.jsx`, `Navbar.jsx`, `Sidebar.jsx`, `CampusManagerDashboardView.jsx`)**:
  - Nút chuyển tab **"Cấp Tài Khoản (IAM)"** trên Thanh điều hướng đầu trang và Menu người dùng.
  - Nút liên kết nhanh "Quản lý IAM" trên Bảng điều khiển Quản lý cơ sở (`CampusManagerDashboardView.jsx`).
  - Nối thành công hàm cấp giảng viên nhanh trong bảng điều khiển cơ sở gọi trực tiếp API thật.
- **Phân Định Nghiệp Vụ Đăng Ký & Đăng Nhập Đa Vai Trò (Smart RBAC Architecture)**:
  - Khóa chặt form đăng ký chỉ cho phép 2 vai trò mở tự do: **Học sinh (`STUDENT`)** và **Phụ huynh (`PARENT`)**.
  - Các vai trò nhân sự gồm Giáo viên (`TEACHER`), Quản lý học thuật cơ sở (`ACADEMIC_MANAGER`), Giám đốc đào tạo (`ACADEMIC_DIRECTOR`) và Quản trị viên hệ thống (`ADMINISTRATOR`) được cấp phát nội bộ từ Admin/Quản lý cơ sở.
- **Kiểm Thử Biên Dịch (Build Verification)**:
  - `npm run build` thành công 100% trong 758ms (0 lỗi cú pháp, 0 warnings, toàn bộ bundle được tối ưu hóa).
  - `npm run lint` đạt chuẩn 0 error.

---

## [02/10/2026] - Nâng Cấp Toàn Diện Tầng Dịch Vụ AI Engine (`src/services/aiService.js`) Qua API Gateway
- **Móc Nối Đầy Đủ 14+ API AI Engine Qua Gateway YARP (`http://localhost:5212`)**:
  - **Nhóm 1: Bóc tách Đề thi PDF (Gemini Vision OCR)**:
    - `uploadPdfExam(pdfFile)`: Upload đề thi PDF phân tích nền (`POST /api/ai-engine/upload-pdf`).
    - `getExamJobStatus(jobId)`: Polling tiến độ OCR (`GET /api/ai-engine/jobs/${jobId}`).
    - `getViewExamUrl(jobId)`: URL xem trực quan kết quả đề thi (`/view-exam`).
  - **Nhóm 2: Nạp & Quản Trị Tri Thức SGK / Vector DB (.NET AI Engine)**:
    - `uploadTextbookPdf(file, options)`: Nạp SGK lên đến 250MB (`POST /api/ai-engine/textbooks/upload-pdf`).
    - `getActiveTextbookJob()`: Khôi phục tác vụ nạp SGK khi người dùng F5 (`GET /api/ai-engine/textbooks/active-job`).
    - `getTextbookCheckpoint(fileHash)`: Kiểm tra Checkpoint SHA-256 (`GET /api/ai-engine/textbooks/checkpoint/${fileHash}`).
    - `getTextbookJobStatus(jobId)`: Polling tiến độ bóc tách SGK (`GET /api/ai-engine/textbooks/jobs/${jobId}`).
    - `getTextbookChunks(sourceId)` & `getTextbookChunksByHash(fileHash)`: Danh sách Vector Chunks tri thức SGK.
    - `saveTextbookChunksToDb(dto)`: Lưu Chunks vào Supabase DB schema `v_eval_ai` (`POST /api/ai-engine/textbooks/save-db`).
    - `pingVisionModels(geminiKey)`: Đo kiểm độ trễ & trạng thái các mô hình Vision AI (`GET /api/ai-engine/textbooks/ping-vision`).
    - `getViewTextbookUrl()`: URL trang nạp & xem SGK trực quan (`/view-textbook`).
  - **Nhóm 3: Sinh Đề Thi AI & Chẩn Đoán Năng Lực IRT/BKT (Python FastAPI RAG)**:
    - `generateExam(payload)`: Sinh đề thi AI theo Prompt & chuẩn hóa Bloom 6 cấp độ (`POST /api/v1/diagnostic/generate-exam`).
    - `analyzeDiagnosticSubmission(payload)`: Chẩn đoán năng lực học sinh IRT 2PL, BKT, Radar chart (`POST /api/v1/diagnostic/analyze`).
    - `getDiagnosticConfig()`: Lấy cấu hình ngưỡng phân lớp và tham số (`GET /api/v1/diagnostic/config`).
    - `getViewDiagnosticUrl()`: URL trang khảo sát năng lực chẩn đoán trực quan (`/view-diagnostic`).
  - **Nhóm 4: Gia Sư AI Socratic RAG & SSE Streaming (Token by Token)**:
    - `askSocraticTutor({ question, sessionId })`: Hỏi đáp gia sư dạng Single Request (`POST /api/v1/chat`).
    - `askSocraticTutorStream({ question, sessionId, onToken, onError, onComplete, signal })`: Token Streaming SSE chạy chữ mượt mà như ChatGPT (`POST /api/v1/chat/stream`).
    - `getChatSessions()` & `clearChatSession(sessionId)`: Quản lý phiên hội thoại (`/api/v1/chat/sessions`).
  - **Nhóm 5: Quản trị Tài liệu Tri thức RAG**:
    - `uploadRagDocument(file)`: Nạp tài liệu tri thức RAG (`POST /api/v1/documents/upload`).
- **Phát Triển Trang Khảo Sát Năng Lực 30 Câu Thật Với AI & Content Service (`DiagnosticAssessmentPage.jsx`)**:
  - Xây dựng component trang hoàn chỉnh `src/components/diagnostic/DiagnosticAssessmentPage.jsx`:
    - Setup screen: Hỗ trợ 3 nguồn đề thi linh hoạt:
      + **Đề Có Sẵn (Content Service)**: Lấy trực tiếp từ Database PostgreSQL 30 câu hỏi chuẩn hóa V-ACT kèm bài đọc hiểu (Passages).
      + **Google Gemini AI Cloud**: Sinh 30 câu hỏi mới 100% kèm công thức Toán KaTeX.
      + **Hiệu Chuẩn AI Fast Bank (<500ms)**: Trích xuất siêu tốc 30 câu từ bộ nhớ hiệu chuẩn psychometrics.
    - In-exam testing screen: Đồng hồ 45 phút, ngữ liệu đọc hiểu collapsible, thanh điều hướng 30 câu kèm cờ phân vân, hiển thị công thức KaTeX, tích hợp Gia sư AI Socratic RAG hỗ trợ tư duy từng bước.
    - Result & Psychometrics screen:
      + Điểm thô thực tế ($X/30$), ước lượng năng lực IRT 2PL `\theta_0`, phân lớp học viên (`FOUNDATION`, `ACCELERATION`, `BREAKTHROUGH`).
      + **Phân tích Tốc độ & Chiến thuật (Pacing Analysis)**: Thời gian trung bình/câu, nhóm làm nhanh (&lt;25s), nhóm chuẩn (25-90s), nhóm tốn thời gian (&gt;90s), câu phân vân gắn cờ 🚩.
      + **Biểu Đồ Radar Năng Lực 5 Lĩnh Vực**: Dữ liệu Recharts Radar Chart lấy trực tiếp từ kết quả 30 câu thật không bịa, đối chiếu chuẩn 900+.
      + **Bảng Tra Cứu & Đáp Án Chi Tiết 30 Câu**: Bộ lọc (Tất cả, Đúng, Sai, Phân vân), đối chiếu đáp án của bạn vs đáp án đúng, badge thời gian, ngữ liệu và lời giải chi tiết KaTeX.
  - Tích hợp vào thanh chuyển trang (Top Page Control Bar) của `App.jsx` và liên kết điều hướng từ Landing Page, HeroBanner và Sidebar Dashboard.
- **Tích Hợp Trình Render Toán Học KaTeX Toàn Diện (`MathText.jsx`, `DiagnosticAssessmentPage.jsx`, `DiagnosticTestModal.jsx`)**:
  - Cài đặt thư viện `katex` và nạp stylesheet `katex/dist/katex.min.css` vào `main.jsx` và font Plus Jakarta Sans.
  - Xây dựng component `src/components/common/MathText.jsx` hỗ trợ parse và render chuẩn xác các công thức toán học STEM phức tạp:
    - Ký hiệu delimiters: `$$...$$`, `$...$`, `\[...\]`, `\(...\)`.
    - Tự động nhận diện lệnh LaTeX: phân số `\frac{...}{...}`, căn thức `\sqrt{...}`, vô cực `\infty`, số mũ `x^4 + 2x^2`, tích phân `\int`, hình học `\perp`...
    - Điều chỉnh màu KaTeX thừa hưởng (inherit) đảm bảo độ tương phản cao, hiển thị sắc nét trên cả nền tối Dark Theme và nền sáng Light Theme.
- **Kiểm Thử Biên Dịch**:
  - `npm run build` thành công 100% trong 1.26s, đóng gói hoàn chỉnh các bộ font KaTeX (woff, woff2, ttf).

---

## [01/10/2026] - Kiểm Thử Toàn Diện Tầng Giao Tiếp API Gateway YARP & Đồng Bộ Kiến Trúc Dịch Vụ Frontend

- **Hoàn Thiện Tầng Service Client Tập Trung (`src/services/`)**:
  - `src/services/apiClient.js`: Xây dựng Axios instance chuẩn hóa kết nối cổng Gateway `5212`, tự động đính kèm Bearer token từ `localStorage`, lắng nghe response header `X-Token-Refresh-Required: true` để âm thầm gia hạn token trong nền (Silent Refresh), và xử lý lỗi tập trung.
  - `src/services/authService.js`: Kết nối Identity Service (`/api/auth`, `/api/v1/auth`, `/api/v1/users`, `/api/v1/campuses`) phục vụ các luồng UC 01 - UC 07, UC 10, UC 40 (Đăng nhập, Đăng ký, OTP, Quên/Đổi mật khẩu, Lấy profile người dùng và Danh sách cơ sở).
  - `src/services/contentService.js`: Kết nối Content Service (`/api/v1/content`) phục vụ lấy đề thi khảo sát chẩn đoán năng lực ban đầu 30 câu hỏi (Core Flow 1), cây kỹ năng DAG 12 kỹ năng chuẩn và ngân hàng đề thi.
  - `src/services/practiceService.js`: Kết nối Practice Service (`/api/v1/practice`) phục vụ quy hoạch lộ trình học tập cá nhân hóa (APIs 1-7), nộp bài thi chặng, làm bài Quiz bù và hệ thống lịch học Live Q&A, điểm danh chuyên cần của giáo viên (APIs 8-15).
  - `src/services/aiService.js`: Kết nối AI Engine (`/api/v1/ai`) phục vụ tải lên đề thi PDF phân tích bằng Gemini OCR, theo dõi tiến trình nền và khung chat gia sư AI Socratic Tutor.
  - `src/services/index.js`: Tập hợp và tái xuất (re-export) toàn bộ dịch vụ, sẵn sàng cho các component trong UI sử dụng trực tiếp.
- **Kiểm Thử Biên Dịch & Vận Hành**:
  - `npm run build` thành công 100% trong 619ms, tạo các bundle tĩnh `dist/` sẵn sàng phục vụ trong container Nginx Alpine.
  - Kiểm thử tương thích môi trường cấu hình qua [`.env`](../.env) và [`.env.example`](../.env.example).

---

## [29/09/2026] - Tích Hợp Web Client Vào Hệ Thống V-Eval System-Repo & Cấu Hình Runner Đa Dịch Vụ

- **Đồng Bộ Repository & Cấu Hình Hệ Thống**:
  - Clone mã nguồn nhánh `develop` từ repository `https://github.com/Capstone-OG/v-eval-web-client.git` vào thư mục chuẩn hóa `All Services/V-Eval-Web_Client`.
  - Bổ sung cấu hình tracking vào [`git_config.txt`](../../git_config.txt):
    ```ini
    V-Eval-Web_Client=https://github.com/Capstone-OG/v-eval-web-client.git|develop
    ```
  - Cập nhật [`Scripts/setup/setup.bat`](../../Scripts/setup/setup.bat) bổ sung cờ kiểm tra `package.json` (`IS_NODE=1`) để ngăn chặn việc sinh nhầm giải pháp .NET Clean Architecture cho các dự án Web/Frontend.
- **Xây Dựng Script Push Độc Lập Cho Web Client**:
  - Tạo script [`Scripts/push.bat`](../Scripts/push.bat) chuyên dụng cho Web Client, đồng bộ tính năng với các microservices backend:
    - Kiểm tra đồng bộ lịch sử commit với Remote `origin/develop`.
    - Menu chọn nhanh đẩy mã nguồn (Nhánh hiện tại, Nhánh đã có, hoặc Khởi tạo nhánh mới).
    - Tự động kiểm tra `git status`, tạo commit và push lên GitHub.
- **Cấu Hình Môi Trường Thực Thi Docker & Local Runner**:
  - Soạn thảo [`Dockerfile`](../Dockerfile) đa tầng (Multi-stage build) sử dụng `node:22-alpine` để biên dịch mã nguồn React 19 và `nginx:alpine` phục vụ file tĩnh SPA.
  - Thiết lập [`nginx.conf`](../nginx.conf) hỗ trợ điều hướng SPA Routing (`try_files $uri $uri/ /index.html;`) tránh lỗi 404 khi người dùng tải lại trang.
  - Cập nhật [`docker-compose.yml`](../../docker-compose.yml) khai báo container `v_eval_web_client` phục vụ tại cổng `5173:80`.
  - Cập nhật [`Scripts/run_local/run_local.bat`](../../Scripts/run_local/run_local.bat) bổ sung tùy chọn khởi chạy Web Client (Tùy chọn [1] Full 7 dịch vụ và Tùy chọn [4] Chỉ Web Client cổng 5173).
- **Kiểm Thử Vận Hành & Biên Dịch**:
  - Chạy thành công `npm install` (cài đặt 87 gói phụ thuộc không có lỗ hổng bảo mật).
  - Chạy `npm run build` thành công trong 3.87 giây, xuất bản thư mục `dist/` hoàn chỉnh.
  - Kiểm tra cú pháp Docker compose với `docker compose config` đạt chuẩn 100%.
- **Xây Dựng Phân Hệ Dịch Vụ Kết Nối API Gateway YARP (`src/services/`)**:
  - `src/services/apiClient.js`: Xây dựng HTTP Client chuẩn hóa kết nối cổng Gateway `5212`, tự động đính kèm JWT Bearer Token từ `localStorage`, lắng nghe response header `X-Token-Refresh-Required: true` để âm thầm gia hạn token trong nền (Silent Refresh), và tự động retry khi gặp mã lỗi 401.
  - `src/services/authService.js`: Kết nối Identity Service (`/api/v1/auth`, `/api/v1/users`, `/api/v1/campuses`) phục vụ các luồng UC 01 - UC 07, UC 10, UC 40 (Đăng nhập, Đăng ký, OTP, Quên/Đổi mật khẩu, Lấy profile người dùng và Danh sách cơ sở).
  - `src/services/contentService.js`: Kết nối Content Service (`/api/v1/content`) phục vụ lấy đề thi khảo sát chẩn đoán năng lực ban đầu 30 câu hỏi (Core Flow 1), cây kỹ năng DAG 12 kỹ năng chuẩn và ngân hàng đề thi.
  - `src/services/practiceService.js`: Kết nối Practice Service (`/api/v1/practice`) phục vụ quy hoạch lộ trình học tập cá nhân hóa (APIs 1-7), nộp bài thi chặng, làm bài Quiz bù và hệ thống lịch học Live Q&A, điểm danh chuyên cần của giáo viên (APIs 8-15).
  - `src/services/aiService.js`: Kết nối AI Engine (`/api/ai-engine`) phục vụ tải lên đề thi PDF phân tích bằng Gemini OCR, theo dõi tiến trình nền và khung chat gia sư AI Socratic Tutor.
  - `src/services/index.js`: Tập hợp và tái xuất (re-export) toàn bộ dịch vụ, sẵn sàng cho các component trong UI sử dụng trực tiếp.

