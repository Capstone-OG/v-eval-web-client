# NHẬT KÝ TIẾN ĐỘ HẰNG NGÀY (DAILY LOG) - V-EVAL WEB CLIENT

---

## [09/10/2026] - Nâng Cấp Giao Diện Thi Chẩn Đoán Flow 1, Full-Width Footer, Floating Sidebar & Sửa Bug Azota Proctored

- **Tái Cấu Trúc Bố Cục Trang Dashboard & Public Footer Full-Width (`App.jsx`, `PublicFooter.jsx`)**:
  - **Public Footer Full-Width (`w-full bg-slate-950`)**: Đưa `PublicFooter` ra ngoài wrapper cột phải, đặt ở tầng gốc trang Dashboard trải dài 100% bề ngang màn hình.
  - **Sidebar Tự Động Cuộn Theo Trang (Natural Scroll-up)**: Cấu hình `Sidebar` dạng `sticky top-20` bên trong container giữa, tự động cuộn lên trên theo luồng nội dung khi người dùng cuộn xuống dưới cùng để nhường trọn vẹn diện tích chiều ngang cho `PublicFooter`.
  - **Bổ Sung Khoảng Cách Đệm Thông Thoáng (Bottom Padding Spacing)**: Bổ sung `pb-16 lg:pb-24` cho thẻ `<main>` tránh tình trạng các khối card và nút bấm bị dính sát vào Footer.
- **Di Dời Logo Thương Hiệu & Tinh Chỉnh Thanh Header / Sidebar (`Navbar.jsx`, `Sidebar.jsx`)**:
  - **Đưa Logo Lên Top Navbar**: Chuyển cụm Logo thương hiệu **ĐGNL AI v2.4** cùng phụ đề *"Khảo thí & Luyện thi Thích ứng 4.0"* từ Sidebar lên góc trái trên cùng của thanh Header (`Navbar.jsx`).
  - **Đẩy Danh Mục Sidebar Lên Sát Đỉnh**: Loại bỏ khối logo cũ ở Sidebar, giúp mục *"KHẢO THÍ & LUYỆN TẬP"* được đẩy sát lên đỉnh Sidebar, tối ưu không gian hiển thị danh sách điều hướng.
  - **Giao Diện Sidebar Bo Tròn Nổi (Floating Rounded Card)**: Thiết kế Sidebar dạng Card bo tròn 4 góc `rounded-2xl`, hiệu ứng kính mờ `bg-white/95 backdrop-blur-md`, viền mờ `border-slate-200/80` và đổ bóng `shadow-md shadow-slate-200/40`.
- **Tối Ưu Giao Diện Bài Thi Khảo Sát Năng Lực Flow 1 & Bảo Mật Passcode (`DiagnosticAssessmentPage.jsx`)**:
  - **Phòng Thi Đặt Mã Bảo Mật (Strict Passcode Verification)**: Đặt ô nhập mã phòng thi rỗng `""` mặc định, bắt buộc gõ chính xác Passcode (`VACT2026`, `HCM120`, `LOGIC15`) mới cho phép vào thi, hiển thị thông báo lỗi tức thì nếu gõ sai.
  - **Loại Bỏ Mini-Footer Thừa**: Xóa bỏ toàn bộ khối mini-footer nội bộ trùng lặp trong `DiagnosticAssessmentPage.jsx`, giữ giao diện thi sạch đẹp và sử dụng duy nhất `PublicFooter` của hệ thống.
  - **Live IRT Status Badge**: Di dời chỉ số năng lực IRT `Theta 0: +0.65 (82% Trúng tuyển)` lên Top Navbar kế bên Streak Counter.
  - **Bảng Số Câu Hỏi Bên Phải (Right Question Palette)**: Thiết kế 30 nút số câu hỏi sắc nét. Các câu học sinh đã chọn đáp án được tô đậm nổi bật bằng màu xanh ngọc/xanh lá lục bảo (`bg-emerald-600 text-white font-black border-emerald-400 shadow-md`) kèm chấm trắng trực quan.
  - **Khung Làm Bài Bên Trái (Left Question Area)**: Trình bày nội dung câu hỏi KaTeX MathText, đoạn văn đọc hiểu, các lựa chọn A/B/C/D, cùng cụm nút chuyển câu (`Câu trước`, `Câu kế tiếp`, `Hoàn tất & Nộp bài`).
- **Sửa Triệt Để Bug Pop-up Nộp Bài Tính Nhầm Vi Phạm Rời Tab**:
  - Tách luồng `handlePromptSubmitExam` kích hoạt custom React modal `SubmitConfirmModal` thay cho `window.confirm()` native (vốn làm mất focus cửa sổ trình duyệt).
  - Thêm cờ guard `showSubmitConfirmModalRef` tạm thời vô hiệu hóa bộ giám sát `visibilitychange` & `fullscreenchange` khi popup nộp bài đang mở, giải quyết triệt để lỗi bấm "Hủy" bị cộng số lần rời tab.
- **Chế Độ Thi Giám Sát Azota Proctored (Anti-Cheat & Fullscreen)**:
  - **Toàn Màn Hình (Fullscreen API)**: Tự động yêu cầu chế độ Toàn Màn Hình khi bấm bắt đầu thi.
  - **Phát Hiện Vi Phạm Rời Tab / Mất Focus**: Tự động phát hiện khi học sinh chuyển tab hoặc thoát Fullscreen.
  - **Modal Cảnh Báo Vi Phạm (Overlay Warning Modal)**: Bật giao diện cảnh báo vi phạm màu đỏ, đếm số lần vi phạm (`X/3`) và yêu cầu học sinh bấm quay lại Toàn Màn Hình để tiếp tục làm bài.

---

## [06/10/2026] - Đấu Nối 100% API Real Auth, Loại Bỏ Hoàn Toàn Mock Pre-fill & Tự Động Khôi Phục Phiên Làm Việc

- **Tích Hợp 100% API Thực Tế Cho Phân Hệ Xác Thực (`src/components/auth/`)**:
  - Thay thế toàn bộ mã giả `setTimeout` và hardcode JWT Token trong `WebLoginPage.jsx` và `AuthModal.jsx` bằng các hàm `authService.login()`, `authService.register()`, `authService.verifyOtp()`, `authService.forgotPassword()`, `authService.resetPassword()`.
  - **Xoá Hoàn Toàn Ô Pre-fill Giả Lập**: Đặt lại trạng thái ban đầu của ô Email và Password về chuỗi rỗng `''` (thay vì điền sẵn `minhhoang.vnu@gmail.com` và `••••••••`), đảm bảo form đăng nhập gửi đúng thông tin người dùng gõ tới API thực tế.
  - Kết nối trực tiếp qua API Gateway YARP (`http://localhost:5212`) tới Identity Service (`:5155`).
  - Tự động chuyển đổi vai trò hệ thống (`Student`, `Teacher`, `Manager`, `Parent`) từ mảng `roles` trả về của Backend.
  - Xử lý mã lỗi `Auth.AccountNotActivated` (403) mở tự động modal nhập OTP kích hoạt 6 số.
- **Hoàn Thiện Luồng Đăng Xuất & Khôi Phục Phiên (Session Restoration)**:
  - Cập nhật `handleLogout` gọi `authService.logout()` thu hồi Refresh Token và xóa sạch `tokenStorage`.
  - Bổ sung `useEffect` trên `App.jsx` tự động khôi phục thông tin người dùng và vai trò khi bấm F5 reload ứng dụng.
  - Truyền prop `currentUser` thực tế vào `Navbar.jsx` hiển thị đúng Họ tên & Email thực của người dùng đăng nhập.
- **Kiểm Thử Biên Dịch Nguồn (Build Verification)**:
  - Biên dịch sản phẩm thành công với `npx vite build` trong 1.40s (0 error).

---

## [06/10/2026] - Tái Cấu Trúc Phân Hệ Xác Thực (Auth), Custom Rounded Dropdown & Validation Báo Lỗi Theo Trường

- **Tái Cấu Trúc Mã Nguồn Phân Hệ Auth (`src/components/auth/`)**:
  - Tách `WebLoginPage.jsx` (từ >1,240 dòng monolithic) thành 3 subcomponents độc lập, chuyên biệt và dễ bảo trì:
    - `src/components/auth/LoginForm.jsx`: Chứa form đăng nhập Email/SĐT & Mật khẩu, ghi nhớ đăng nhập, nút Đăng nhập thử 1-Click tự động phân role Backend, và các cổng đăng nhập mạng xã hội (Google ID, Zalo Account).
    - `src/components/auth/RegisterForm.jsx`: Chứa form đăng ký mới với chuyển đổi vai trò (Học sinh vs Phụ huynh), các ô thông tin riêng biệt (Họ tên, Email, SĐT, Mật khẩu, Nhập lại mật khẩu, Thanh đo độ mạnh mật khẩu, Checkbox điều khoản).
    - `src/components/auth/ForgotPasswordModal.jsx`: Modal khôi phục mật khẩu 4 bước (Nhập Email -> Mã xác thực OTP 6 số -> Tạo mật khẩu mới -> Đăng nhập ngay).
  - Tối ưu `WebLoginPage.jsx` chỉ còn ~350 dòng, đóng vai trò trang bao bọc (Page Container) quản lý Navigation Header, Cột học thuật bên trái & ảnh thực tế học sinh THPT Việt Nam.
- **Tùy Biến Menu Thả Xuống Bo Tròn Sang Trọng (Custom Rounded Dropdown Select)**:
  - Thay thế hoàn toàn các thẻ `<select>` mặc định của trình duyệt (bị góc vuông sắc nhọn OS) bằng **Custom Motion Dropdown Component** (`rounded-2xl` popover menu, các ô tùy chọn `rounded-xl` kèm icon `CheckCircle2` khi chọn).
  - Áp dụng đồng bộ cho các ô chọn **Khối Lớp** (*Lớp 12, Lớp 11, Thí sinh tự do*) và **Mục tiêu ĐGNL** (*900+, 800+, 700+*) trong cả `WebLoginPage.jsx` và `AuthModal.jsx`.
- **Phân Quyền Giao Diện Đăng Ký Chuẩn Xác Cho Phụ Huynh**:
  - Tự động ẩn các trường dành riêng cho học sinh (**Khối Lớp** & **Mục tiêu ĐGNL**) khi chuyển sang tab đăng ký vai trò **Phụ huynh** (`role === 'parent'`).
- **Nâng Cấp Hệ Thống Báo Lỗi Validate Form Toàn Diện (Per-field Validation)**:
  - Hiển thị thông báo lỗi đồng thời ngay bên dưới tất cả các ô nhập liệu bị thiếu hoặc không hợp lệ khi bấm Submit (thay vì bắt bấm Submit 5 lần).
  - Đổi màu viền sang đỏ (`border-rose-400 bg-rose-50/50`) giúp nhận biết trực quan tức thì.
  - Tự động xóa dòng báo lỗi và màu viền đỏ realtime khi người dùng bắt đầu gõ điều chỉnh lại thông tin (Clear-on-type).
- **Đồng Bộ Hoàn Toàn Với Modal Nhanh `AuthModal.jsx`**:
  - Áp dụng toàn bộ quy tắc validate, custom dropdown bo tròn và ẩn/hiện trường học sinh cho `AuthModal.jsx`.

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

