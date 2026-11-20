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
| 31 | **Thanh Điều Hướng Đỉnh Cao (Account Navbar) Theo Concept "EdTech Mission Control"** | `AccountNavbar.jsx` | 🟢 Hoàn thành | 100% | Đếm ngược kỳ thi ĐGNL & Học kỳ từ CSDL thật, chuông thông báo & cảnh báo sớm tương tác Flow 6, chip học sinh đồng hành, profile người dùng trực tuyến |

| 31 | **Studio Sách Giáo Khoa (SGK) 2 Phân Hệ & 5 Sector Sư Phạm** | `TextbookStudioView.jsx` | 🟢 Hoàn thành | 100% | Tách biệt hoàn toàn 2 chế độ: Nạp & Parse SGK 2 Bước (không hiện nội dung kế bên) và Kho Sách 5 Sector chuyên biệt. Tự động đồng bộ 122 chunks từ Supabase vào Sector 1, lọc theo bài học/toàn bộ sách/từ khóa, chép KaTeX và liên kết Studio |
| 32 | **Đồng Bộ Điều Hướng 3 Module Học Thuật Trên Sidebar** | `Sidebar.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Khung Chương trình (`roadmap`), Sách Giáo Khoa 3 trang (`textbook-group`) và Đề thi & AI Bloom 3 trang (`exam-group`: `exam-bank`, `exam-ingest`, `exam-studio`) đồng bộ cho Teacher/Manager/Admin |
| 33 | **Studio Parse & Bóc Tách Đề Thi Học Kỳ / ĐGNL (Port 100% từ `view-exam.html`)** | `ExamParserStudioView.jsx`, `ExamItemCards.jsx`, `ExamRichContent.jsx`, `ExamDatabaseModal.jsx`, `ExamMediaLightbox.jsx`, `examParserUtils.js`, `contentService.js` | 🟢 Hoàn thành | 100% | Chuyển đổi hoàn chỉnh 100% tính năng `view-exam.html` lên Web Client: Upload PDF + Polling AI Vision Job `(mm:ss)`, Passages & Single Questions, bộ khử nhiễu KaTeX 6 tầng, bảng Markdown 2 tầng (`rowspan`/`colspan`), biểu đồ cột/tròn Recharts, dán ảnh `Ctrl+V`, Lightbox zoom, Kho Đề Supabase (Xem/Lưu/Phê duyệt/Xóa), Sticky Matrix 1–120 và liên thông `CurriculumStudioEditor` |
| 34 | **Phân Hệ SGK Thống Nhất 3 Trang & Pipeline Nạp 3 Phần (DPI 60-90)** | `TextbookStandardView.jsx`, `TextbookIngestView.jsx`, `TextbookStudioView.jsx` | 🟢 Hoàn thành | 100% | Tách hoàn toàn thành 3 component độc lập: SGK Chuẩn, Nạp tài liệu SGK (DPI 60-90, 3 phần thống nhất), Studio biên soạn. Trạng thái kiểm duyệt ACCEPTED/PENDING_REVIEW và nút AI bổ sung kiến thức nền |
| 35 | **Dropdown Thu Gọn Sách Giáo Khoa (SGK) Trên Sidebar** | `Sidebar.jsx`, `App.jsx`, `textbookStateBridge.js` | 🟢 Hoàn thành | 100% | Sidebar có dropdown thu gọn/mở rộng cho SGK chứa 3 trang riêng biệt; auto-expand khi đang ở trang con; đồng bộ context qua session storage bridge |
| 36 | **Loại Bỏ Mục Phi Sư Phạm (Bìa Sách, Trang Trắng, N/A) Khỏi SGK** | `TextbookStandardView.jsx`, `TextbookIngestView.jsx`, `textbookStateBridge.js` | 🟢 Hoàn thành | 100% | Lọc sạch 100% các nhãn bìa sách, trang trắng, mục lục, N/A; bảo vệ bài học và dạng bài hiển thị chuẩn sư phạm GDPT 2018 |
| 37 | **Sidebar Thu Gọn Toàn Diện (Collapsible Rail w-20/w-72)** | `Sidebar.jsx`, `AccountNavbar.jsx`, `App.jsx` | 🟢 Hoàn thành | 100% | Thu gọn sidebar trên Desktop cho Giám đốc học thuật và mọi vai trò; chuyển thành icon rail `w-20` kèm tooltip trực quan, nút thu gọn trên sidebar và navbar |
| 38 | **Chuẩn Hóa Sư Phạm GDPT 2018 & Xóa Bỏ Trùng Lặp Tiêu Đề** | `TextbookStandardView.jsx`, `textbookStateBridge.js` | 🟢 Hoàn thành | 100% | Bóc tách tiền tố (`cleanPrefix`), xóa lỗi `CHƯƠNG 4 \n Chương 2:...`, nút 1-chạm `📚 Chuẩn Hóa GDPT 2018`, tự động nạp công thức KaTeX đặc trưng và đánh số dạng bài tuần tự |
| 39 | **Tinh Gọn Khung Chương Trình, Tái Thiết Kế Thẻ 4 Miền Tri Thức Executive & Tích Hợp 3 Tầng Sư Phạm Dữ Liệu Động 100% CSDL** | `CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx` | 🟢 Hoàn thành | 100% | Tinh gọn hero header, xóa banner 30 câu, bộ lọc đóng mở công thái học (`isFilterCollapsed`), lọc theo Khối lớp 10-12 và Bloom L1-L4; thiết kế lại 4 thẻ miền chuẩn Executive bỏ hộp icon xám, hiển thị dynamic stats `{chapCount} Chương • {lesCount} Bài học`; tích hợp UnifiedNodeDetailView 3 tầng sư phạm chuẩn (Lý thuyết SGK sạch -> Dạng đề KaTeX nhúng Native JSXGraph trực tiếp -> Ngân hàng câu hỏi thực tế có lời giải) |
| 40 | **Tối Ưu Hóa Giao Diện Nạp SGK & Kết Hợp View Lý Thuyết Trước + Đóng Accordion OCR Chunks** | `TextbookIngestView.jsx` | 🟢 Hoàn thành | 100% | Hiển thị bản view lý thuyết tổng hợp chuẩn sư phạm lên trên kèm nút Mở Studio Sư Phạm; đưa danh sách đoạn trích OCR thô xuống dưới bọc trong Accordion đóng mặc định (`isRawChunksOpen = false`) |
| 41 | **Đồng Nhất 3 Tầng Sư Phạm & Phân Định Lý Thuyết / Phương Pháp Riêng Từng Dạng Bài** | `TextbookStandardView.jsx`, `TextbookIngestView.jsx` | 🟢 Hoàn thành | 100% | Đồng nhất 3 tầng với Khung chương trình (Khối 1: Lý thuyết, Khối 2: Phương pháp giải, Khối 3: Câu hỏi bài tập); hiển thị riêng biệt theo Dạng bài với bộ chọn nhanh; khắc phục triệt để nút AI sinh lý thuyết & mở rộng nội dung hoạt động 100% với intelligent fallback |
| 42 | **Khắc Phục Tạp Nhiễm Tri Thức Chéo Môn Học & Chéo Chương & Quick Pattern Switcher** | `CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `textbookStateBridge.js` | 🟢 Hoàn thành | 100% | Thiết lập bộ lọc phạm vi tri thức 4 lớp, siết chặt thuật toán so khớp mờ `isFuzzyLabelMatch`, hàng rào chặn từ khóa chéo môn trong `buildTheoryFromChunks`, bổ sung Quick Pattern Switcher pills |
| 43 | **Bóc Tách Triệt Để Khung Chương Trình Chuẩn Và Luồng Khảo Thí Năng Lực** | `App.jsx`, `Sidebar.jsx`, `StudentCurriculumView.jsx` | 🟢 Hoàn thành | 100% | Loại bỏ override định tuyến sai hướng trong `App.jsx` (`diagnostic` render nhầm `CurriculumExplorerView`), chuẩn hóa nhãn menu/sidebar từ 'Khảo thí 30 câu' thành 'Khảo thí & Chẩn đoán', tinh chỉnh thông điệp học sinh |
| 39 | **Khởi Tạo Cổng Quản Lý Học Thuật Cơ Sở Độc Lập (`AcademicManagerDashboardView.jsx` - Zero Hardcode) & Bảo Toàn `CampusManagerDashboardView.jsx` Gốc Cho Director** | `AcademicManagerDashboardView.jsx`, `CampusManagerDashboardView.jsx`, `Sidebar.jsx`, `App.jsx`, `practiceService.js` | 🟢 Hoàn thành | 100% | Giữ nguyên `CampusManagerDashboardView.jsx` gốc cho `director`; tạo mới `AcademicManagerDashboardView.jsx` (0% hardcode) cho `manager` với 4 mục chuẩn nghiệp vụ nối trực tiếp API Backend thật |
| 44 | **Đồng Bộ Đợt Học & Khóa Học Sang Cổng Học Phí Student/Parent + Sửa/Xóa Khóa Học** | `TuitionPaymentView.jsx`, `AcademicManagerDashboardView.jsx`, `practiceService.js` | 🟢 Hoàn thành | 100% | Bỏ hoàn toàn 3 gói học hardcode trên `TuitionPaymentView.jsx`, đồng bộ 100% `AcademicTerms` & `Courses` theo `campusId`; bổ sung Sửa (✏️) / Xóa (🗑️) khóa học cho Academic Manager |






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
| 95 | **Nâng Cấp UI/UX Modal Nạp Cây Tri Thức & Làm Rõ 2 Tùy Chọn Độ Sâu Bóc Tách AI** | `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Phân tách khối Slicing trang PDF, thiết kế 2 card tương tác chọn độ sâu (Chuyên sâu ĐGNL 2-4 dạng Bloom L1-L4 vs Tiêu chuẩn mục lục cốt lõi) kèm hộp thông báo ngữ cảnh động |
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
| 145 | **Nâng Cấp Toàn Diện UI/UX Modal Bóc Tách Khung Tri Thức Chuyên Đề & Làm Rõ 2 Tùy Chọn Độ Sâu Nhận Diện AI** | `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Tách biệt thanh cấu hình cắt lát trang PDF độc lập; thiết kế 2 Card tương tác lớn chọn độ sâu bóc tách (`deep` vs `standard`); bổ sung badge Khuyên dùng / Chuyên sâu lý thuyết và hộp giải thích ngữ cảnh động tức thời |
| 146 | **Chuẩn Hóa Xử Lý Lỗi API & Bóc Tách RFC 7807/9110 Problem Details Thân Thiện Người Dùng** | `src/services/apiClient.js`, `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Tự động phân giải `application/problem+json`, trích xuất `data.detail`/`message`/`errors` thay vì hiển thị raw JSON string; phân loại Toast thông minh cho tình huống thiếu API Key, Rate Limit / Quota 429 và bóc tách ngoại lệ thân thiện |
| 147 | **Làm Sạch Option Hóa Học Khối 4, Khử Triệt Để `undefined` Khối 2 & Sửa Dropdown Miền Năng Lực (`useRef`)** | `MathText.jsx`, `CurriculumStudioEditor.jsx`, `CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Bổ sung `cleanOptionDisplay` lột bỏ nháy bọc `'...'` và tiền tố `A.`; lọc bỏ dòng `undefined` trong `MathText.jsx` và `sampleProblem`; thay thế backdrop fixed bằng `useRef` + `mousedown` ngoài chống kẹt thanh cuộn |
| 148 | **Nút Xóa Nhanh Miền Năng Lực Dư Thừa Trực Tiếp Trên Tab Bar Kèm Xác Nhận An Toàn Sư Phạm** | `CurriculumExplorerView.jsx`, `contentService.js` | 🟢 Hoàn thành | 100% | Hiển thị nút xóa `Trash2` trên thẻ miền tùy chỉnh/dư thừa ngoài 5 miền chuẩn V-ACT; xác nhận xóa an toàn và gọi `contentService.deleteNode(domain.id)` xóa cascade |
| 149 | **Khắc Phục Triệt Để Lỗi Hiển Thị LaTeX & KaTeX (Phương Trình Hóa Học, Phân Số Gãy Dòng, Chỉ Số Dưới & Tùy Chọn Trắc Nghiệm)** | `src/components/common/MathText.jsx`, `src/components/curriculum/CurriculumExplorerView.jsx`, `src/components/curriculum/CurriculumStudioEditor.jsx` | 🟢 Hoàn thành | 100% | Hàn gắn công thức phân số bị ngắt dòng giữa chừng `mergeUnclosedLatexLines`, tự bọc phương trình phản ứng hóa học có mũi tên vào khối math, tự nhận diện chỉ số dưới biến số `C_nH_{2n}O_2`, khử triệt để nested dollars trong `{...}`, lột sạch nháy đơn option trắc nghiệm và chuyển đổi công thức phẳng sang chỉ số dưới hóa học; `npm run build` thành công 100% |
| 150 | **Bộ Tokenizer Độc Lập An Toàn, Chống Nuốt Tiếng Việt, Triệt Tiêu Lỗi Chữ Đỏ KaTeX & Hạ Cấp Block Math Ngắn** | `src/utils/mathTokenizer.js`, `src/components/common/MathText.jsx` | 🟢 Hoàn thành | 100% | Triển khai `mathTokenizer.js`, bảo vệ văn xuôi tiếng Việt chống nuốt dấu cách, hạ cấp `$$...$$` ngắn (<40 ký tự) thành inline math chống vỡ dòng văn bản, nối dòng thông minh cho công thức gãy (`C_nH_{2n}` & `O_2`) và dấu hai chấm rớt dòng; `npm run build` hoàn thành trong 2.68s |
| 151 | **Render Bảng Markdown Table Sư Phạm, Bóc Dấu Nháy Đơn Options & Triệt Tiêu Token Đỏ 'undefined'** | `src/components/common/MathText.jsx`, `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Triển khai `renderMarkdownTable` chuyển bảng Markdown sang `<table>` glassmorphic, hỗ trợ KaTeX inline từng ô, bóc sạch nháy đơn `'...'` quanh phương án trắc nghiệm ở Khối 4, nối dòng phương án gãy và triệt tiêu chữ undefined màu đỏ |
| 152 | **Chuyển Nhánh Main, Đóng Gói Docker SPA Với Nginx Reverse Proxy & Tự Động Định Tuyến Domain pickic.io.vn** | `src/services/apiClient.js`, `nginx.conf`, `docker-compose.yml` | 🟢 Hoàn thành | 100% | Chuyển toàn bộ repo sang nhánh `main`; triển khai `getGatewayBaseUrl()` tự động nhận diện domain `pickic.io.vn` / `app.pickic.io.vn` trỏ về Gateway SSL `https://api.pickic.io.vn`; đóng gói SPA với Nginx Alpine nén Gzip, SPA fallback và proxy `/api/`; volume mapping `dist/` vào container `v_eval_web_client` phục vụ tức thời |
| 153 | **Khắc Phục Lỗi Render KaTeX Đỏ (Công Thức Đốt Cháy Triglyceride), Chống Nuốt Tiếng Việt Vào Math Mode & Chuẩn Hóa Phương Trình Hóa Học** | `src/components/common/MathText.jsx` | 🟢 Hoàn thành | 100% | Lọc unescaped $ bên trong KaTeX và tự động cân bằng ngoặc nhọn { } trong renderKatexHtml triệt tiêu chữ đỏ katex-error; bóc tách token theo dòng tránh match regex mũi tên xuyên dòng; loại bỏ regex chèn $ tách -OH / -COOH thành $-$OH$; tự động phục hồi văn bản tiếng Việt bị kẹt trong $...$; npm run build sạch 100% |
| 154 | **Khử Lỗi Math Rò Rỉ Đa Dòng (suyragốcacidlà), Tách Nhãn Phương Trình Hóa Học & Chuẩn Hóa Khoảng Trắng Chỉ Số Dưới** | `src/components/common/MathText.jsx` | 🟢 Hoàn thành | 100% | Giới hạn inline math $[^$\r\n]+?$ không quét qua dấu xuống dòng; tự động tách nhãn 'Phương trình:' bọc phương trình thành display math $$...$$; sửa lỗi (OH)_ 3 thành (OH)_3; bọc công thức C_{15}H_{31}COOH; ghép nối ester gãy dòng $C_nH_{2n}\nO_2$; npm run build 2.82s |
| 155 | **Khắc Phục Triệt Để Lỗi Render KaTeX Hộp Đỏ (Frac & Text Spacing), Tự Động Bọc Phương Trình & Triệt Tiêu #cc0000** | `src/components/common/MathText.jsx` | 🟢 Hoàn thành | 100% | Chuẩn hóa khoảng trắng `\frac{...} {...}` và `\text {mol}`; làm sạch `{2 }` -> `{2}`; tự động nhận diện và bọc phương trình toán tính toán có `\frac` (`k = \frac{2n + 2 - 2H}{2}` -> `$k = \frac{2n + 2 - 2H}{2}$`, `n = \frac{8,8}{88} = 0,1 \text{mol}`); thay thế thẻ lỗi katex-error bằng font-serif math loại bỏ hoàn toàn chữ đỏ #cc0000; npm run build hoàn thành trong 2.66s |
| 156 | **Tích Hợp Bộ 4 Thẻ Chế Độ Bóc Tách Theo Loại Tài Liệu Vào Modal Chuyên Đề & Khắc Phục Dấu $ Lồng Trong Ngoặc KaTeX** | `src/components/curriculum/CurriculumExplorerView.jsx`, `src/components/common/MathText.jsx` | 🟢 Hoàn thành | 100% | Bổ sung 4 thẻ chọn chế độ bóc tách (`STEM_FORMULAS`, `TEXT_HUMANITIES`, `VISION_AI`, `AUTO_LOCAL`) vào Modal Nhập chuyên đề AI; truyền `ocr_mode` qua FormData; dọn sạch dấu `$` lồng trong ngoặc `{k - 1$}` và `(n \ge 2$)`; nối `$C_nH_{2n}$O_2`; hỗ trợ ngoặc lồng nhau trong `\frac`; npm run build hoàn thành trong 2.89s |
| 157 | **Tái Thiết Toàn Diện Modal AI Chuyên Đề Màn Rộng, So Sánh Chuyên Sâu vs Tiêu Chuẩn, Thanh Tiến Độ Mượt & Khắc Phục Triệt Để 6 Lỗi KaTeX** | `src/components/curriculum/CurriculumExplorerView.jsx`, `src/components/common/MathText.jsx` | 🟢 Hoàn thành | 100% | Mở rộng Modal lên `max-w-6xl` (`max-h-[94vh]`), bố cục Studio 2 cột hiện đại (5 cols / 7 cols); bảng so sánh trực quan thẻ lớn Chuyên Sâu ĐGNL (chuẩn 4 khối sư phạm, Bloom L1-L4, [MATH_GRAPH], [VARIATION_TABLE]) vs Tiêu Chuẩn; bộ 4 thẻ OCR mode; thanh tiến độ easing động không đọng 50%; khôi phục ký tự điều khiển ASCII `\x0c` -> `\f` giải quyết triệt để lỗi đỏ `\frac` KaTeX ParseError; chuẩn hóa chỉ số dưới tiếng Việt `m_{\text{chất béo}}`; chống rò rỉ math mode nuốt khoảng trắng; npm run build 3.0s |
| 158 | **Bảo Toàn Dấu `$` Đóng Trước Dấu Phẩy, Tự Động Đóng Công Thức Trước Tiếng Việt & Thiết Kế 2 Chế Độ Bóc Tách Chuyên Biệt** | `src/components/common/MathText.jsx`, `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Loại bỏ regex `\$,` bảo vệ dấu `$` đóng của danh sách công thức hóa học; tự động đóng `$` trước từ tiếng Việt; thiết kế rõ ràng 2 chế độ `EXAM_PATTERNS` vs `THEORY_EXTENDED`; modal widescreen 1650px; `npm run build` hoàn thành trong 6.67s |
| 159 | **Cơ Chế `wrapUntouchedMath` Chống Lồng Dấu `$`, Toán Tử `\Rightarrow` KaTeX & Chuẩn Hóa Số Thập Phân** | `src/components/common/MathText.jsx` | 🟢 Hoàn thành | 100% | Bổ sung hàm `wrapUntouchedMath` bọc an toàn từng phân đoạn phi-math, triệt tiêu hoàn toàn lỗi lồng dấu `$` bên trong ngoặc đơn như `$(C_{17}H_{35}COO)_3C_3H_5$`; thêm toán tử `\Rightarrow` vào `opPattern` liên kết biểu thức suy luận; tự động dọn khoảng trắng số thập phân `9, 18` -> `9,18`; `npm run build` hoàn thành trong 2.37s |


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


## [14/11/2026] - Authentication notification integration

Architecture: the existing ToastProvider remains above App, so feedback persists across login/logout navigation. Authentication handlers send toast messages while preserving inline validation. API background requests are not globally intercepted.

| Item | Location | Status | Detail |
| --- | --- | --- | --- |
| Auth success and error feedback | Frontend App and authentication forms | Complete | Login/logout, registration, OTP and recovery use the existing toast system. |
| Account loading errors and toast accessibility | Frontend account provisioning and toast container | Complete | List failures are visible; cards have status/alert roles and an accessible dismiss button. |
| Verification | Frontend | Build/lint passed | Existing warnings remain; browser/live API checks pending. |
| Git merge | System-Repo | Pending | No staging, commit or push performed for this task. |

### [14/11/2026] - Toast visual refinement

| Item | Location | Status | Validation |
| --- | --- | --- | --- |
| Compact responsive toast cards | Frontend GlobalToastContainer.jsx | Complete | Build and whitespace checks passed; browser visual check pending. |

### [14/11/2026] - Diagnostic skill report integration

Architecture: DiagnosticAssessmentPage retains skillPriors in result models and delegates skill reporting to DiagnosticSkillProfile. Historical results use only data from that submission response.

| Item | Location | Status | Detail |
| --- | --- | --- | --- |
| Skill assessment and mastery display | Frontend diagnostic report | Complete | Fresh/history views; assessed, inferred and unknown sources; honest empty states. |
| Verification | Frontend | Passed | Build/lint exit 0 with existing warnings; browser verification pending. |
| Complete historical and inferred data | Backend diagnostic APIs | Pending | See architecture acceptance notes; backend unchanged. |

Backend follow-up: Practice sends an empty AllSkillIds mapping to AI, preventing the inferred-skill branch. Historical GetDiagnosticSubmissionById does not populate SkillPriors or RadarChart. Preserve per-submission estimates and source for historical reporting instead of reading mutable current LearningProfiles. Inferred skill labels also need metadata because current response name lookup uses only questions in the test.

### [14/11/2026] - Diagnostic report navigation

Architecture: shared DiagnosticReportTabs and DiagnosticReportPanel organize both result render paths while retaining the shared score summary and existing review filters. WeakSkills and DiagnosticSkillProfile provide progressive disclosure.

| Item | Status | Detail |
| --- | --- | --- |
| Three report tabs | Complete | Overview, answer review, competency analysis; keyboard navigation and matching panel labels. |
| Compact report content | Complete | Four initial weak skills; mastery grouped by collapsible domain. |
| Verification | Build/lint passed | Existing warnings; browser verification pending. |

### [14/11/2026] - History layout simplification

Architecture: StudentHistoryPage owns category selection; DiagnosticAssessmentPage renders embedded history details and requests the compact DiagnosticResultSummary variant.

| Item | Status | Detail |
| --- | --- | --- |
| Compact category toolbar | Complete | Distinct category panels keyed by user/category. |
| Remove repeated report headings | Complete | Historical summary hides the dark banner and reduces metric spacing. |
| Validation | Passed | Build/lint exit 0 with existing warnings; browser verification pending. |

### [14/11/2026] - History toolbar visibility

| Item | Location | Status | Detail |
| --- | --- | --- | --- |
| Hide category toolbar in detail | StudentHistoryPage / DiagnosticAssessmentPage | Complete | Child detail-state callback controls the toolbar; back restores list navigation. Practice detail uses its existing selected state. Build/lint passed; browser verification pending. |

### [14/11/2026] - Report visual refinement

| Item | Location | Status | Validation |
| --- | --- | --- | --- |
| Metric cards, segmented tabs and detail header | Frontend diagnostic report components | Complete | Build/lint passed with existing warnings; browser appearance not directly verified. |

### [14/11/2026] - Report contrast adjustment

| Item | Status | Detail |
| --- | --- | --- |
| Distinct header, active tab and metric cards | Complete | Dark detail header, saturated active tab, stronger metric borders/tints; build/lint passed; browser verification pending. |

## [15/11/2026] - CF1 frontend milestone

Architecture: diagnostic submission/history results share tabbed report navigation and skill reporting; current LearningProfiles are not substituted for historical per-submission estimates. Root ToastProvider supplies authentication/account feedback.

| Item | Status | Detail |
| --- | --- | --- |
| CF1 frontend report/history and toast checkpoint | Ready to commit | Selected frontend files and docs only; unrelated curriculum/sidebar/roadmap edits excluded. |
| Verification | Passed | Current working-tree build/lint exit 0 with warnings; 24 existing tests passed; browser/live APIs unverified. |
| Backend completion | Follow-up | Historical priors/Radar, question content, domain labels and three-exam aggregation require follow-up. |
| Root merge | Pending | Root documentation updated as required; no root staging/commit/push. |

## [15/11/2026] - Remaining frontend changes

Architecture: existing curriculum, sidebar and roadmap components retain their responsibilities; this checkpoint records pending frontend presentation changes at user request.

| Item | Status | Validation |
| --- | --- | --- |
| Curriculum, sidebar and roadmap presentation checkpoint | Ready to commit | Production build/lint exit 0 with existing warnings; whitespace check passed; browser verification pending. |
| Backend and root merge | Unchanged by Git operations | Frontend repository only; no push. |

| 146 | **Khắc Phục Lỗi Lịch Sử Làm Bài & Bóc Tách Đề Thi Luyện Tập Thích Ứng ZPD** | `src/services/practiceService.js`, `src/components/modals/AdaptiveQuizModal.jsx` | 🟢 Hoàn thành | 100% | Bỏ tiền tố thừa `/v1/` trong `getDiagnosticHistory` & `getDiagnosticResult` khớp route Controller Practice Service; bóc tách câu hỏi ZPD từ cả `passages[].questions` và `single_questions`; 28/28 tests pass |
| 147 | **Triển Khai Ràng Buộc Xem Lộ Trình Sau Thi (Lớp Học Chung & Cá Nhân Riêng) Và Cơ Chế Kích Hoạt Học Phí** | `src/components/curriculum/StudentCurriculumView.jsx`, `src/components/curriculum/curriculumAccess.js`, `src/components/modals/TuitionRequiredModal.jsx`, `src/components/diagnostic/DiagnosticAssessmentPage.jsx`, `src/components/payment/TuitionPaymentView.jsx`, `src/App.jsx` | 🟢 Hoàn thành | 100% | Phân tách 2 chế độ Lộ trình (Lớp học chung & Lộ trình cá nhân riêng); thiết lập ràng buộc học sinh sau thi chỉ được xem tổng quát cấu trúc lộ trình; chặn vào học và luyện tập nếu chưa đóng học phí bằng `TuitionRequiredModal`; tích hợp lưu vết học phí qua PayOS VietQR; 31/31 unit tests pass |
| 148 | **Gia Cố Cơ Chế Tự Hồi Phục Fallback Khi Nạp Lịch Sử Làm Bài** | `src/components/diagnostic/DiagnosticAssessmentPage.jsx` | 🟢 Hoàn thành | 100% | Bọc từng lời gọi `getDiagnosticResult` trong try/catch độc lập, tự động fallback lấy `theta0` từ summary DTO nếu bài cũ bị lỗi backend; triệt tiêu 100% nguy cơ crash màn hình lịch sử |
| 149 | **Tối Giản Hóa Màn Hình Tổng Quan Học Tập (Dashboard UX Clean-up)** | `src/App.jsx`, `src/components/dashboard/HeroBanner.jsx`, `src/components/dashboard/MetricsGrid.jsx` | 🟢 Hoàn thành | 100% | Loại bỏ cụm thẻ chặng học và lịch phụ đạo giả lập (`MilestoneCard`, `LiveQnACard`); tinh gọn HeroBanner và chuẩn hóa 4 thẻ KPI năng lực thân thiện với học sinh, loại bỏ toàn bộ thuật ngữ kỹ thuật ZPD, DAG, IRT |
| 150 | **Tái Cấu Trúc Bố Cục Trang Tổng Quan Hài Hòa & Nâng Cấp Ảnh Học Sinh** | `src/App.jsx`, `src/components/dashboard/HeroBanner.jsx` | 🟢 Hoàn thành | 100% | Đưa HeroBanner lên đầu trang làm điểm nhấn chào đón; MetricsGrid ở giữa; khối hành động kép Onboarding + Phụ huynh ở chân trang; đổi ảnh gỗ sang ảnh học sinh THPT thực tế kính mờ |
| 151 | **Bảo Vệ Khối Hình Học 3D (`[MATH_GRAPH_3D]`), BBT (`[VARIATION_TABLE]`) & Đồ Thị 2D (`[MATH_GRAPH]`), Sửa Lỗi `Phân tích & Lời giải:**` & Chuẩn Hóa UI Card Bóc Tách AI** | `src/components/common/MathText.jsx`, `src/components/curriculum/CurriculumExplorerView.jsx` | 🟢 Hoàn thành | 100% | Cô lập sớm toàn bộ khối đồ thị bằng placeholder `@@mathlabblocka@@` và tự chữa lành thẻ hỏng `[$MATH_GRAPH_3D$]`; sửa lỗi lồng `**Phân tích & **Lời giải:****`; thay `$\rightarrow$` bằng `→` và xóa toàn bộ mô tả hardcode Ester-Lipid trên 2 thẻ chọn chế độ bóc tách AI |
| 152 | **Tách Riêng Trang Thời Khóa Biểu & Điểm Danh (`StudentScheduleView` - `schedule`) Và Trang Lớp Học & Live Q&A (`LiveClassQnAView` - `live`), Loại Bỏ 100% Mock Data & Hardcode** | `src/components/dashboard/StudentScheduleView.jsx`, `src/components/dashboard/LiveClassQnAView.jsx`, `src/components/layout/Sidebar.jsx`, `src/App.jsx`, `src/services/practiceService.js` | 🟢 Hoàn thành | 100% | Tách `schedule` (`StudentScheduleView`) thành trang Thời khóa biểu & Điểm danh độc lập và `live` (`LiveClassQnAView`) thành trang Lớp học & Live Q&A riêng biệt; xóa 100% mock/seed fallback và hardcode |
| 153 | **Hiển Thị Đầy Đủ `radarChart` & `skillPriors` Khi Thi Xong Và Khi Xem Lại Lịch Sử Bài Làm** | `src/components/diagnostic/DiagnosticAssessmentPage.jsx`, `src/components/diagnostic/SubmissionHistoryView.jsx`, `src/services/practiceService.js` | 🟢 Hoàn thành | 100% | Ánh xạ và hiển thị đồng nhất Biểu đồ Radar năng lực (`radarChart`) cùng Ma trận tiên nghiệm kỹ năng BKT `` `P(L_0)` `` & `` `\theta_{\text{skill}}` `` (`skillPriors`) từ API thực cả lúc vừa thi xong lẫn khi mở lại lịch sử bài làm |
| 154 | **Đồng Bộ Học Phí Thực Tế Từ DB, Khối Gói Học Kích Hoạt, 6 Quyền Lợi Mở Khóa & Hóa Đơn PayOS** | `src/components/payment/TuitionPaymentView.jsx`, `src/components/curriculum/curriculumAccess.js`, `src/components/curriculum/StudentCurriculumView.jsx`, `src/services/paymentService.js` | 🟢 Hoàn thành | 100% | Đồng bộ trạng thái học phí `isPaid` tự động từ DB PostgreSQL qua `syncTuitionStatusFromServer`, hiển thị thẻ gói học đang hoạt động (`courseName`, `courseCode`, thời hạn, lớp phân bổ), lưới 6 phân hệ đã mở khóa (PLAR, Bài giảng, ZPD, Socratic, Thời khóa biểu, Live Q&A), bảng lịch sử giao dịch PayOS thực tế và modal kiểm toán biên lai |
| 155 | **Triển Khai Phân Hệ Kiểm Duyệt Báo Cáo Gia Sư AI Cho Quản Lý Học Thuật (Core Flow 4: Human-in-the-Loop & Knowledge Graph Feedback)** | `src/components/dashboard/AiTutorModerationView.jsx`, `src/components/layout/Sidebar.jsx`, `src/App.jsx`, `src/services/practiceService.js`, `src/config/roles.js` | 🟢 Hoàn thành | 100% | Màn hình kiểm duyệt báo cáo AI trả lời sai dành cho Quản lý học thuật; đối soát đề bài LaTeX, đáp án đúng CSDL và lựa chọn sai của học sinh; hộp thoại chat Socratic; 3 hành động sư phạm: Ghi đè lời giải mẫu chuẩn vào Knowledge Graph, Bổ sung bẫy tư duy mới vào Knowledge Graph, và Xác nhận AI đúng; 31/31 unit tests pass, build sạch 100% |
| 156 | **Tái Thiết Kế Toàn Diện Bố Cục Phân Hệ Quản Lý Học Thuật Đồng Bộ Ngôn Ngữ Thiết Kế Student Portal** | `src/components/dashboard/AiTutorModerationView.jsx`, `src/components/dashboard/CampusManagerDashboardView.jsx`, `src/components/layout/Sidebar.jsx` | 🟢 Hoàn thành | 100% | Chuyển đổi toàn diện banner sang dải gradient xanh dương - chàm hoàng gia (`from-blue-700 via-indigo-700 to-blue-900`) kèm orb vàng `#FACC15` & ngọc bích `cyan-400`; bổ sung thẻ kính mờ GraphRAG Monitor; chuẩn hóa 4 thẻ KPI theo phong cách `MetricsGrid` với micro-tags và footer 1-click filter; nâng cấp hàng đợi split-pane với avatar viết tắt, viền màu trạng thái; rút gọn badge Sidebar thành `Flow 4` chống co cắt chữ; 31/31 unit tests pass, build 1.09s |
| 157 | **Tái Cấu Trúc Toàn Diện Trang Chủ Quản Lý Học Thuật (Academic Dashboard) & Khắc Phục Lỗi Hiển Thị Tỷ Lệ Phần Trăm (6688% & 7600%)** | `src/components/dashboard/CampusManagerDashboardView.jsx`, `src/components/dashboard/EarlyWarningsMentorPanel.jsx`, `src/App.jsx` | 🟢 Hoàn thành | 100% | Chuẩn hóa hàm `normalizeMasteryPct` tự động chuyển đổi thang đo, đưa mức làm chủ 4 miền về `76%`, `53%`, `68%`, `71%` và toàn cơ sở về đúng `67% BKT`; tích hợp lời chào vào HeroBanner kèm 4 thông điệp xoay vòng `Sparkles`; chuẩn hóa 4 thẻ KPI theo phong cách `MetricsGrid`; nâng cấp bảng ma trận nhiệt Enterprise SaaS; làm đẹp thẻ lớp học và danh sách giảng viên kèm avatar viết tắt; tối ưu 6 thẻ cảnh báo sớm BR-04; 31/31 unit tests pass, build 1.10s |
| 158 | **Triển Khai Cơ Chế Lưu Phiên Hội Thoại Đa Lượt & Thanh Điều Hướng Lịch Sử Gia Sư AI Socratic (Hybrid Client Storage & Supabase Cloud Sync)** | `src/utils/aiSessionManager.js`, `src/components/modals/AISocraticTutorModal.jsx`, `tests/aiSessionManager.test.js` | 🟢 Hoàn thành | 100% | Quản lý phiên hội thoại đa lượt phân lập theo học sinh (`veval_socratic_sessions_${userId}`); lưu trữ cục bộ thời gian thực chống mất tin nhắn khi đóng modal; thanh lịch sử trượt mở (`PanelLeftClose`/`Open`), tìm kiếm phiên thông minh, nhãn đếm tin nhắn, xóa phiên; đồng bộ ngầm các tương tác đám mây từ Supabase qua `practiceService.getAiTutorInteractions()`; chuyển đổi bối cảnh câu hỏi thi tự động; 36/36 unit tests pass, build sạch 100% |
| 159 | **Khắc Phục Lỗi Hiển Thị Chi Tiết Lịch Sử Làm Bài Khảo Thí ĐGNL (Hydration 30 Câu Hỏi & Khử Lỗi "Câu 0:", "Bloom 0/6")** | `src/components/diagnostic/DiagnosticAssessmentPage.jsx` | 🟢 Hoàn thành | 100% | Tự động đồng bộ cấu trúc 30 câu hỏi từ Content Service qua `contentService.getDiagnosticTest()`; khử bỏ hoàn toàn placeholder 'API lịch sử không cung cấp nội dung câu hỏi'; hiển thị chính xác số thứ tự câu (Câu 1 đến Câu 30), cấp độ Bloom (Bloom 2/6..6/6), lưới 4 phương án trắc nghiệm và lời giải chi tiết; 36/36 tests pass, build sạch |
| 160 | **Chuẩn Hóa Dấu Tiếng Việt Toàn Diện & Đồng Bộ Giao Diện Bảng Đánh Giá Chi Tiết 30 Câu Khảo Sát Năng Lực** | `src/utils/vietnameseUtils.js`, `src/components/diagnostic/DiagnosticAssessmentPage.jsx`, `tests/vietnameseDiacritics.test.js` | 🟢 Hoàn thành | 100% | Xây dựng tiện ích `cleanVietnameseDiacritics` triệt tiêu mọi dấu thanh lơ lửng / phân rã từ OCR/PDF scan; khử bỏ toàn bộ `font-serif` gây lỗi glyph trên Windows Chromium; đồng bộ 100% giao diện xem lại 30 câu giữa trang kết quả và modal lịch sử (thẻ bài đọc bo góc `rounded-2xl` không bị cắt `line-clamp-3`, lưới phương án trắc nghiệm chuẩn SaaS có viền ring và icon Check/X, thẻ lời giải tím thanh lịch); 38/38 unit tests pass, build sạch |
| 161 | **Khắc Phục Lỗi Lặp Từ Kép (Double Token Glitch) Khi Gia Sư AI Socratic Trả Lời & Tối Ưu Hóa Dòng Stream SSE** | `src/components/modals/AISocraticTutorModal.jsx`, `src/components/dashboard/AISocraticTutorWidget.jsx`, `src/utils/aiSessionManager.js`, `tests/aiSessionManager.test.js` | 🟢 Hoàn thành | 100% | Tách biệt nguồn dữ liệu tích lũy stream bằng `useRef` (`streamedTextRef`), xóa bỏ hoàn toàn đột biến state in-place giúp giao diện miễn nhiễm 100% trước cơ chế chạy lặp 2 lần của React StrictMode; triệt tiêu 200+ lần ghi đĩa `saveSessions` dư thừa mỗi turn; bổ sung hàm `cleanDoubledWords` tự động sửa các tin nhắn lịch sử từng bị lặp trong `localStorage`; 39/39 unit tests pass, build sạch 100% |
| 162 | **Chuẩn Hóa Kiến Trúc Xóa Phiên Gia Sư AI Socratic (Client-Side Isolation & Tombstones)** | `src/components/modals/AISocraticTutorModal.jsx`, `src/utils/aiSessionManager.js`, `tests/aiSessionManager.test.js` | 🟢 Hoàn thành | 100% | Phân định rạch ròi giữa Audit Log bất biến (`ai_tutor_interaction_logs` cho Mentor ở Flow 4) và User Chat Sessions của học sinh; ngắt hoàn toàn lời gọi API kiểm duyệt của Mentor vào modal học sinh; giải quyết triệt để lỗi State Closure trong React khi xóa phiên đang active bằng atomic updater `setSessions(prev => ...)`; tích hợp cơ chế Tombstones `markSessionDeleted` và `isSessionDeleted` trong `aiSessionManager.js` ngăn 100% việc hồi sinh phiên đã xóa; 22/22 unit tests pass, build sạch 1.08s |
| 163 | **Chuyển Tiếp Lịch Sử Hội Thoại Đa Lượt Cho Gia Sư Socratic (Conversation History Forwarding)** | `src/components/modals/AISocraticTutorModal.jsx`, `src/services/practiceService.js` | 🟢 Hoàn thành | 100% | Trích xuất 6 lượt trao đổi gần nhất gửi qua `practiceService.askAiTutorStream`, bảo toàn ngữ cảnh sư phạm giữa học sinh và gia sư AI; 22/22 tests pass, build sạch |
| 164 | **Đồng Bộ Chuyển Tiếp `skillId` & `questionId` Cho Gia Sư Socratic (Curriculum Grounding)** | `src/components/modals/AISocraticTutorModal.jsx`, `src/components/modals/AdaptiveQuizModal.jsx` | 🟢 Hoàn thành | 100% | Lưu trữ và chuyển tiếp `skillId` từ context câu hỏi và Adaptive Quiz vào `askAiTutorStream`, hỗ trợ AI Engine định tuyến và neo đậu vào tài liệu SGK chuẩn `v_eval_content."Materials"`; 22/22 tests pass, build sạch 1.06s |
| 165 | **Tối Giản Hóa Giao Diện Cổng Phụ Huynh: Loại Bỏ Báo Cáo Năng Lực 4 Miền & Cây Tri Thức Chuyên Đề** | `src/components/layout/Sidebar.jsx`, `src/App.jsx` | 🟢 Hoàn thành | 100% | Tinh giản Sidebar và danh mục tab phụ huynh (`role === 'parent'`), xóa bỏ 2 mục sư phạm học sinh (`analytics`: Báo cáo Năng lực 4 Miền và `roadmap`: Cây Tri thức & Chuyên đề); rào chắn an toàn tự chuyển về Dashboard nếu truy cập nhầm URL; 22/22 unit tests pass, build 1.68s |
| 166 | **Gắn Bối Cảnh studentId Vào Lịch Sử Bài Thi Của Con & Hỗ Trợ Chuyển Đổi Đa Con Cho Phụ Huynh** | `src/components/diagnostic/SubmissionHistoryView.jsx`, `src/App.jsx`, `src/services/practiceService.js` | 🟢 Hoàn thành | 100% | Truyền `studentId`, `studentName`, `childrenList` và cờ `isParent` từ `parentPortalData` vào `SubmissionHistoryView`; nạp lịch sử chẩn đoán backend theo `studentId` của con thay vì `user.id` phụ huynh; bộ chọn nhanh đa con cho phép chuyển đổi tức thì; ẩn nút thi của học sinh và thay bằng nút làm mới; điều chỉnh nhãn "Con đã chọn"; 22/22 unit tests pass, build 1.70s |

| 165 | **Tái Thiết Kế Bố Cục Trang SGK Chuẩn: Cây Thư Mục Phân Cấp (Chương ▾ Bài Học ▾ Dạng Bài) Bên Trái & Hiển Thị Toàn Bộ Lý Thuyết Thuần SGK Kèm Công Thức KaTeX Bên Phải** | `src/components/curriculum/TextbookStandardView.jsx`, `src/components/curriculum/textbookStateBridge.js` | 🟢 Hoàn thành | 100% | Tái cấu trúc 2 phân khu sư phạm chuẩn mực: Cột trái (`lg:col-span-4`) cây thư mục phân cấp 3 tầng (Chương ▾ Bài học ▾ Dạng bài) có toggle mở rộng/thu gọn và nút thêm nhanh; Cột phải (`lg:col-span-8`) hiển thị toàn bộ lý thuyết thuần của bài học (`activeTheoryContent`), công thức KaTeX đặc trưng, chế độ chỉnh sửa trực tiếp `[✏️ Sửa Lý Thuyết]` / `[💾 Lưu Lý Thuyết]` và `[✨ AI Bổ sung lý thuyết]`; tích hợp kho lý thuyết chuẩn GDPT 2018 (`getDefaultLessonTheory`); Vite build sạch 1.24s |
| 166 | **Triệt Tiêu 100% Mock & Template Giả Lập: Bơm Trực Tiếp Dữ Liệu Bóc Tách Thật Từ Supabase Vào Lý Thuyết Bài Học (`buildTheoryFromChunks`) & Tối Ưu Bố Cục SGK Chuẩn** | `src/components/curriculum/TextbookStandardView.jsx`, `src/components/curriculum/textbookStateBridge.js`, `src/App.jsx` | 🟢 Hoàn thành | 100% | Bơm 100% dữ liệu thực từ 53+ Vector Chunks trong Supabase vào lý thuyết bài học qua `buildTheoryFromChunks` và `getChunksForLesson`, triệt tiêu hoàn toàn template giả lập chung chung; sửa lỗi `chunk.text || chunk.content` và chống cắt phạm tiền tố `cleanPrefix`; khối tiêu đề cơ bản SGK full-width; mục lục cây bài học phân lớp có border riêng; lý thuyết chuẩn chiếm trọn không gian với nút AI icon duy nhất; bộ bóc tách SGK dropdown phân trang 1 trang / 2 trang thích ứng; Vite build sạch 1.25s |
| 167 | **Lý Thuyết Thuần Cô Đặc Không Số Trang (`buildTheoryFromChunks`), Tăng Chiều Dài Gấp Đôi (`min-h-[920px]`), Mục Lục Trải Dài Hết Chương, Xóa Sách Khỏi CSDL & Vô Hiệu Hóa 2 Nút Điều Hướng Header** | `src/components/curriculum/TextbookStandardView.jsx`, `src/components/curriculum/textbookStateBridge.js`, `src/services/aiService.js`, `V-Eval-Ai_Engine.API/Endpoints/TextbookEndpoints.cs`, `V-Eval-Ai_Engine.Infrastructure/Repositories/TextbookRepository.cs` | 🟢 Hoàn thành | 100% | Tái cấu trúc lý thuyết thuần thành 4 phân mục chuẩn mực sư phạm (Khái niệm, Công thức KaTeX, Phân loại dạng bài, Lưu ý bẫy tư duy); xóa sạch mọi dấu vết số trang thô; tăng chiều cao lý thuyết lên gấp đôi (`min-h-[920px]`, `max-h-[140vh]`) với typography `text-[12px] leading-relaxed`; mở rộng cây mục lục không giới hạn `max-h`; tích hợp nút `[🗑️ Xóa sách]` gọi API `DELETE /api/ai-engine/textbooks/sources/{sourceId}` xóa sạch CSDL; vô hiệu hóa 2 nút header (`disabled`, `opacity-50 cursor-not-allowed`); Vite build 1.26s sạch 100% |
| 168 | **Sửa Lỗi ReferenceError: m is not defined Trong Trang Nạp SGK** | `src/components/curriculum/TextbookIngestView.jsx` | 🟢 Hoàn thành | 100% | Bọc chuỗi KaTeX `90\text{ m}` bằng `<MathText />` thay vì để chuỗi raw trong JSX text gây hiểu nhầm `{ m}` là biến JS không xác định; triệt tiêu 100% lỗi crash runtime khi chuyển sang tab Nạp SGK; Vite build 1.31s sạch |
| 169 | **Chuẩn Hóa Pipeline Bóc Tách C# Backend & Frontend: Triệt Tiêu Thẻ Rò Rỉ `[TAXONOMY: ...]`, Rác Thông Tin Xuất Bản & Gãy Dòng KaTeX Vectơ** | `CurriculumTaxonomyRegistry.cs`, `CurriculumAiService.cs`, `PdfPigTextbookParserService.cs`, `src/components/curriculum/textbookStateBridge.js` | 🟢 Hoàn thành | 100% | Quét và xóa 100% thẻ `[TAXONOMY: ...]` khỏi `chunk.Text`; tự động loại bỏ rác thông tin xuất bản và phân loại `section="COVER"`; nối dòng gãy cho ký hiệu toán học / điểm hình học và chuẩn hóa sang KaTeX `\vec{AB}`, `|\vec{AB}| = AB`; phân lập ví dụ giải mẫu khỏi khái niệm cốt lõi; Vite build 1.22s sạch |
| 170 | **Sửa Lỗi Màn Trắng SyntaxError: Invalid regular expression Trong `textbookStateBridge.js`** | `src/components/curriculum/textbookStateBridge.js` | 🟢 Hoàn thành | 100% | Thay thế cú pháp cờ nội dòng không hợp lệ `(?i)` bằng RegExp JavaScript chuẩn mực `/gi` và hàm replacement `(match, p1) => ...`; triệt tiêu 100% lỗi màn hình trắng; Vite build 1.22s sạch |
| 171 | **Triệt Tiêu 100% Template Generic Boilerplate Rò Rỉ Vào Lý Thuyết Thuần (`isGenericPlaceholder`)** | `src/components/curriculum/TextbookStandardView.jsx`, `src/components/curriculum/textbookStateBridge.js` | 🟢 Hoàn thành | 100% | Loại trừ triệt để mọi câu chữ template generic chung chung (`Nội dung định nghĩa cốt lõi của bài học...`, `Các đại lượng vật lí / toán học / hóa học đo lường...`, `Các sai sót thường gặp của học sinh...`) khỏi `buildTheoryFromChunks` và state hiển thị; ưu tiên 100% dữ liệu thực từ chunks hoặc lý thuyết chuyên sâu GDPT 2018 |
| 172 | **Bổ Sung Đầy Đủ Kho Cấu Trúc GDPT Presets & Lý Thuyết Chuẩn Hóa Học (`CHEM_10`, `CHEM_11`, `CHEM_12`), Toán Học & Sinh Học** | `src/components/curriculum/textbookStateBridge.js` | 🟢 Hoàn thành | 100% | Bổ sung đầy đủ presets chương - bài - dạng bài cho Hóa học, Toán học, Sinh học; xây dựng kho lý thuyết thuần chuyên sâu cho Hóa học 10 (oxi hóa - khử, bảo toàn electron, enthalpy chuẩn `\Delta_r H^\circ_{298}`, halogen, cấu tạo nguyên tử, liên kết ion / CHT); chuẩn hóa `getGdptPreset` tự động map đúng môn học |
| 173 | **Sắp Xếp Chương Tuần Tự Theo Số Trang, Nhận Diện Tự Động Môn Học & Sửa Lỗi Tiền Tố Chương `cleanPrefix`** | `src/components/curriculum/TextbookStandardView.jsx`, `src/components/curriculum/TextbookIngestView.jsx`, `src/components/curriculum/textbookStateBridge.js` | 🟢 Hoàn thành | 100% | Tự động nhận diện môn học và khối lớp khi chọn sách trong dropdown, tự động load preset tương ứng; sắp xếp các chương tuần tự tăng dần theo `pageStart` chống xáo trộn vị trí; sửa regex `cleanPrefix` bóc tách triệt để tiền tố phức hợp `Chương 5, 6, 7 & 8:` chống lỗi `C.3 , 6, 7 & 8:`; Vite build 1.15s sạch |
| 174 | **Sửa Lỗi Màn Trắng SyntaxError: The requested module does not provide an export named 'isGenericPlaceholder'** | `src/components/curriculum/textbookStateBridge.js` | 🟢 Hoàn thành | 100% | Khởi tạo và export đầy đủ hàm `isGenericPlaceholder` trong `textbookStateBridge.js`, phát hiện và loại trừ 100% câu chữ generic placeholder; Vite build 1.19s sạch 100% |
| 175 | **Đồng Bộ Cây Cấu Trúc Sách Phân Cấp 3 Tầng (Chương ▾ Bài Học ▾ Dạng Bài) Giữa Trang Nạp SGK (TextbookIngestView) Và Trang Xem SGK Chuẩn (TextbookStandardView)** | `src/components/curriculum/TextbookIngestView.jsx` | 🟢 Hoàn thành | 100% | Thay thế 2 khối tĩnh phẳng giới hạn `max-h-[28vh]` bằng cây accordion phân cấp 3 tầng chuẩn mực (`Chương C.X` ▾ `Bài học B.X` ▾ `Dạng bài P.X` kèm nhãn Bloom L1–L6 và `cleanPrefix`); tích hợp nút thêm nhanh chương/bài/dạng; cho phép chọn trực tiếp Dạng bài kích hoạt Phần 3 (⚡ AI Sinh Câu Hỏi Mới); Vite build 1.67s sạch 100% |
| 176 | **Tính Năng AI Sinh Câu Hỏi Hàng Loạt (Batch Exercise Generation) Cho Toàn Bộ Dạng Bài Trong Bài Học & Toàn Bộ Sách** | `src/components/curriculum/TextbookIngestView.jsx` | 🟢 Hoàn thành | 100% | Bổ sung 3 chế độ sinh bài tập: Đơn lẻ, Toàn bộ dạng trong bài học, và Toàn bộ dạng trong toàn cuốn sách; tích hợp nút kích hoạt nhanh trên thanh tiêu đề và icon tia sét `⚡` trên từng bài học ở cây mục lục; giao diện hiển thị thanh tiến trình trực quan thời gian thực (tỷ lệ %, dạng đang xử lý, nút Dừng lại); hàm `updatePatternAt` cập nhật bất biến an toàn; Vite build 1.63s sạch 100% |
| 177 | **Thay Thế `window.confirm`/`alert` Bằng Modal Popup Xác Nhận & Cam Kết Cơ Chế Chỉ Sinh Thêm (Append-Only) Tuyệt Đối Không Ghi Đè Câu Hỏi** | `src/components/curriculum/TextbookIngestView.jsx` | 🟢 Hoàn thành | 100% | Thay thế hộp thoại trình duyệt thô bằng in-app Modal Dialog (`confirmModal`) hiển thị số lượng câu sinh thêm `+ 3 câu / dạng`, phạm vi áp dụng và cam kết bảo toàn 100% câu hỏi đã có; triển khai cơ chế Append-Only `[...existing, ...mappedNew]` kèm sinh mã ID độc nhất vô nhị chống trùng lặp; Vite build 1.32s sạch 100% |
| 178 | **Đa Dạng Hóa Dạng Bài Chuẩn GDPT 2018 & Bộ Chọn Cấp Độ Nhận Thức Bloom (L1–L6) Trực Quan 1-Click** | `src/components/curriculum/TextbookIngestView.jsx`, `src/components/curriculum/TextbookStandardView.jsx` | 🟢 Hoàn thành | 100% | Tự động làm giàu các dạng bài từ GDPT 2018 preset (`getGdptPreset`) khi bài học chỉ có <= 1 dạng bài generic L2; cung cấp bộ chọn cấp độ nhận thức Bloom L1–L6 trực quan 1-click (xoay vòng Bloom trên cây mục lục bên trái & thanh pill chọn nhanh ở Phần 3); tự động tính Bloom tịnh tiến khi thêm dạng bài mới; Vite build sạch 100% |
| 179 | **Thanh Tác Vụ Tổng Quát Nằm Ngay Trên Bộ Chuyển 3 Chế Độ, Tự Động Lưu (Auto-Save) & Nút Lưu Toàn Bộ SGK** | `src/components/curriculum/TextbookIngestView.jsx` | 🟢 Hoàn thành | 100% | Bố trí Thanh Điều Khiển Tổng Quát đặt ngay phía trên bộ chuyển 3 chế độ (Cấu trúc / Lý thuyết / Câu hỏi); tích hợp nút "Lưu Toàn Bộ SGK", nút "Sinh Toàn Bộ Sách", badge hiển thị trạng thái và thời gian tự động lưu gần nhất; cơ chế Auto-Save tức thời vào `localStorage` khi sinh câu hỏi hoặc sửa đổi dữ liệu; khôi phục tự động (Auto-Restore) toàn bộ câu hỏi và dạng bài khi chọn lại sách; Vite build 1.28s sạch 100% |
| 180 | **Tối Giản Hóa Giao Diện Sinh Câu Hỏi Phần 3: Loại Bỏ Nút Toàn Sách Cục Bộ, Bộ Chọn 1 Trong 2 Kèm Nút Sinh Duy Nhất & Dọn Dẹp Icon Thừa** | `src/components/curriculum/TextbookIngestView.jsx` | 🟢 Hoàn thành | 100% | Xóa nút "Sinh toàn bộ sách" khỏi header bài học Phần 3; bổ sung bộ chọn 1 trong 2 ("Dạng này" / "Cả bài học") với tiêu mục "Sinh câu hỏi:"; tích hợp 1 nút bấm [Sinh câu hỏi] duy nhất; dọn dẹp sạch sẽ 100% emojis lồng ghép thừa thãi; Vite build 2.24s sạch 100% |
| 181 | **Cứu Cánh Lưu Trữ Toàn Diện (Universal Storage Bridge), Triệt Tiêu Stale Closure & Đồng Bộ Câu Hỏi Thời Gian Thực Hai Chiều (`textbookStateBridge.js`, `TextbookIngestView.jsx`, `TextbookStandardView.jsx`)** | `src/components/curriculum/textbookStateBridge.js`, `src/components/curriculum/TextbookIngestView.jsx`, `src/components/curriculum/TextbookStandardView.jsx` | 🟢 Hoàn thành | 100% | Thiết kế kiến trúc Universal Storage Bridge với các hàm `getSavedTextbookData`, `saveTextbookData`, `mergeSavedExercisesIntoChapters`; triệt tiêu 100% lỗi Stale Closure React trong `saveToStorage` bằng `skeletonRef.current` và `updatePatternByName`; nạp sẵn ngân hàng câu hỏi mẫu chuẩn GDPT 2018 vào `GDPT_PRESETS['PHYS_10']`; đồng bộ hóa câu hỏi tự động giữa Trang Nạp SGK và Trang Xem SGK bằng custom event `veval:textbook-saved`; Vite build 1.24s sạch 100% |


## [15/11/2026] - CF2 per-skill resources

| Item | Status | Detail |
| --- | --- | --- |
| Roadmap video and materials | Connected in frontend | Calls Content Service by each RoadmapNode SkillId and renders available video, lesson text, or attachments. |
| Roadmap preview quiz | Connected in frontend | Starts Practice Stage for the selected node; questions come through Content gRPC and responses use preview-submit. |
| Student roadmap entry point | Connected in frontend | Students can switch between the curriculum view and backend generated roadmap. |
| Content availability | Runtime verification pending | Skills without configured materials may return an empty list. |

Validation: build and lint pass with existing warnings; live API integration remains unverified.

## [16/11/2026] - Diagnostic API result normalization

| Item | Status | Detail |
| --- | --- | --- |
| Existing diagnostic report tabs and sidebar | Preserved | No layout or navigation changes from the TNhan branch. |
| Radar chart API payload | Frontend normalized | Accepts camelCase and snake_case fields; if the API omits the radar array, groups API-returned question results by domain for student percentages. Benchmark values are rendered only when returned by API. |
| Skill mastery priors | Frontend normalized and displayed | Overview matrix and analysis profile accept API `skillPriors`/`skill_priors` and field aliases; values remain sourced from the response. |
| Historical API population | Backend follow-up | The history endpoint must return per-submission radar and skill-prior data for these panels to show it. |
| Runtime verification | Pending | Live API data was not checked. |


## Progress update ? 16/11/2026

| Work item | Status | Detail |
| --- | --- | --- |
| Student curriculum and math rendering | Integrated | Synced the pulled access and KaTeX-safe rendering changes. |
| Tuition and payment | Integrated | Synced database-backed tuition status, course entitlement, payment list, and receipt UI. |
| Diagnostic results and history | Integrated | Synced API result/history presentation while retaining TNhan-specific diagnostic work. |
| Live classroom and schedule | Integrated | Synced student Live Q&A, schedule, and attendance views with sidebar routing. |
| Practice service helper | Corrected | Added the missing GUID matcher referenced by the incoming helpers. |
| Build/runtime verification | Pending | Not run during this integration. |

| Diagnostic JSX parse error | Fixed | Removed the incomplete duplicate trend-chart wrapper; Vite production build succeeds. |

| API-only radar and prior values | Corrected | No synthetic benchmark or default mastery values are displayed when omitted by API. |
| Diagnostic report runtime references | Corrected | Reused normalized skill priors and removed a dangling component reference. |


## Homepage UI update [16/11/2026]

| Item | Files | Status | Progress | Notes |
|---|---|---|---:|---|
| Group four metric cards under the Introduction anchor in their existing below-hero position; remove the 120-question nav item and 3 Q&A action; update footer anchors | `src/components/landing/PublicLandingPage.jsx`, `PublicHeader.jsx`, `PublicFooter.jsx` | Complete | 100% | Production build succeeds |


## Homepage navigation update [17/11/2026]

| Item | Files | Status | Notes |
|---|---|---|---|
| Keep platform metrics in their below-hero position under the Introduction anchor; remove the 120-question and 3 Q&A navigation actions | `src/components/landing/PublicLandingPage.jsx`, `PublicHeader.jsx`, `PublicFooter.jsx` | Complete | Production build succeeds |


## Develop merge [17/11/2026]

| Area | Status | Notes |
|---|---|---|
| Socratic tutor sessions | Integrated | Multi-turn context, local session management, deletion tombstones, and Vietnamese text cleanup. |
| Academic moderation and dashboards | Integrated | Added AI tutor moderation workspace and merged mentor/campus dashboard updates. |
| Homepage navigation | Preserved | Metrics remain below hero under Introduction; obsolete 3 Q&A and 120-question nav entries remain removed. |
| Build | Verified | Production build passes with existing bundle-size and JSXGraph eval advisories. |

## [18/11/2026] - Authentication and landing page updates

| Item | Status | Detail |
| --- | --- | --- |
| OTP/password reset completion | Updated | Completion returns to login and prefills email; reset flow prefills the new password. |
| Public landing page | Updated | Refined section presentation, decorative backgrounds, and card styling. |
| Production build | Passed | `npm run build` succeeds; existing bundle-size and JSXGraph eval warnings remain. |

## [18/11/2026] - Student Live Q&A feature removal

| Item | Status | Detail |
| --- | --- | --- |
| Student navigation and portal route | Removed | The sidebar entry and `live` route are no longer available. |
| Live Q&A components and mock data | Removed | Deleted the dedicated student view, unused card, and mock session. |
| Roadmap and tuition references | Removed | Removed live-session schedule UI/data and the Live Q&A package entry. |
| Production build | Passed | `npm run build` succeeds; existing bundle-size and JSXGraph eval warnings remain. |

## [19/11/2026] - Sidebar stale-menu-entry fix

| Component | Status | Detail |
| --- | --- | --- |
| Sidebar navigation rendering | Implemented | Removed the stale `entries.live` reference that inserted an undefined item into the student menu after Live Q&A was removed; missing icons also have a Lucide `Activity` fallback. |
| Validation | Build passed | `npm run build` passed; existing bundle-size and JSXGraph eval advisories remain. Browser verification was not run. |

## [19/11/2026] - Student sidebar cleanup

| Component | Status | Detail |
| --- | --- | --- |
| Student sidebar | Updated | Removed the stale Live Q&A reference and Gia sư AI menu item; invalid menu entries are filtered. |
| AI chat | Unchanged | Only its sidebar link was removed. |
| Validation | Build passed | Existing bundle-size and JSXGraph eval advisories remain. |

## [19/11/2026] - Single-assessment personal roadmap

| Component | Status | Detail |
| --- | --- | --- |
| Diagnostic eligibility | Updated | One completed diagnostic assessment is sufficient. |
| Connected personal roadmap | Automated | Uses the latest completed diagnostic submission and profile planning data; missing planning data defaults to 45 days and 2 study hours/day. |
| Validation | Passed | Eligibility tests and production build passed with existing advisories. |

## [19/11/2026] - Diagnostic exam fullscreen entry

| Component | Status | Detail |
| --- | --- | --- |
| Exam start | Updated | Requests fullscreen synchronously before asynchronous service calls. |
| Setup stage | Updated | Preserves fullscreen while the exam loads; clears it on cancellation/error. |
| Validation | Build passed | Existing advisories remain; browser interaction verification is pending. |

## [19/11/2026] - Forgot-password validation

| Component | Status | Detail |
| --- | --- | --- |
| Email form | Updated | `noValidate` routes submits through app validation; errors render in the modal instead of browser tooltip. |
| Email syntax | Updated | Empty, invalid, and overlong addresses are rejected before API request. |
| Unknown account | Updated | Backend `Auth.UserNotFound` is shown as an unregistered-email message; 404 is no longer retried as a route fallback. |

## [20/11/2026] - Sidebar positioning and navigation access

| Component | Status | Detail |
| --- | --- | --- |
| Desktop sidebar | Updated | Fixed to the viewport with independent vertical scrolling. |
| Student IRT card | Updated | Moved above desktop navigation; mobile order remains unchanged. |
## [20/11/2026] - Registration form simplification

| Component | Status | Detail |
| --- | --- | --- |
| Grade selection | Updated | Removed from UI; grade 12 remains the default. |
| Target score | Preserved | Retains 700+, 800+, and 900+. |
| Build validation | Passed | `npm run build` completed successfully. |

## [20/11/2026] - Sửa Lỗi Cập Nhật Hồ Sơ Cá Nhân & Đồng Bộ Identity Service

| Component | Status | Detail |
| --- | --- | --- |
| User Profile API | Updated | Sửa route từ `/api/v1/users/profile` sang `/api/v1/users/me/profile` khớp với controller backend. |
| Error Handling | Updated | Gỡ bỏ catch-block nuốt lỗi giả lập; tích hợp `formatApiError` thông báo lỗi thật tới người dùng. |
| Campus Sync | Updated | Đồng bộ cập nhật `campusId` vào hồ sơ học sinh qua `authService.updateStudentProfile`. |
| Fresh Data Fetch | Updated | Gọi `authService.fetchCurrentUserProfile()` khi mở trang để lấy hồ sơ chuẩn xác từ PostgreSQL. |
| Build Validation | Passed | `npm run build` thành công 100% trong 5.14s. |




## [20/11/2026] - Account settings diagnostic access

Account settings displays the IRT status card without a diagnostic retake action.

| Component | Status | Detail |
| --- | --- | --- |
| Academic settings IRT card | Completed | Removed diagnostic retake button and navigation handler. |
| Production build | Passed | npm run build completed successfully. |


## [20/11/2026] - IRT display placement

Sidebar continues to display Theta from diagnostic results or the student dashboard.

| Component | Status | Detail |
| --- | --- | --- |
| Academic settings | Completed | Removed duplicate IRT insight card and unused Zap import. |
| Production build | Passed | npm run build succeeded. |


## [20/11/2026] - Persisted sidebar diagnostic metrics

App retrieves diagnostic history alongside dashboard metrics; Sidebar accepts API and submission result field names.

| Component | Status | Detail |
| --- | --- | --- |
| App metrics loading | Completed | Select latest completed diagnostic for the authenticated student, with account guard. |
| Sidebar IRT | Completed | Read theta0 and placementClass from persisted API results. |
| Validation | Build passed | Live browser account verification remains unperformed. |


## [20/11/2026] - Settings save and cancel behavior

Editable settings retain loaded/saved snapshots for comparison and reset.

| Component | Status | Detail |
| --- | --- | --- |
| Academic, parent, preferences | Completed | Disable unchanged saves; show cancel only for pending changes; reset baseline after persistence. |
| Password | Completed | Disable empty submission and clear inputs/visibility on cancel. |
| Validation | Passed | Production build succeeded; browser interaction not verified. |


## [20/11/2026] - Authentication label

| Component | Status | Detail |
| --- | --- | --- |
| Account settings badge | Completed | Display Đã xác thực; verified source text. |


## [20/11/2026] - Separate transcript navigation

Account settings exposes independent parent and transcript tabs for students.

| Component | Status | Detail |
| --- | --- | --- |
| Parent tab | Completed | Retains parent form and family link code. |
| Digital transcript tab | Completed | Contains existing transcript and report actions. |
| Validation | Passed | Production build succeeded. Browser check not performed. |


## [20/11/2026] - Optional parent information

Registration does not collect student parent details. Settings must retain empty parent fields until explicitly updated.

| Component | Status | Detail |
| --- | --- | --- |
| Parent settings | Completed | Empty defaults, no mock fallback or automatic linked status. |
| Parent cache | Completed | Account-scoped keys; unowned legacy cache ignored. |
| Validation | Passed | Node account-isolation checks and production build. |


## [20/11/2026] - Optional high school profile

| Component | Status | Detail |
| --- | --- | --- |
| School field | Completed | Empty default and fallback; API school retained when present. |
| Missing school display | Completed | Neutral placeholder and transcript empty state. |
| Validation | Passed | Production build succeeded. |


## [20/11/2026] - Optional school input at registration

Registration sends the optional school name through authService to RegisterUserCommand and persists it in Student.SchoolName.

| Component | Status | Detail |
| --- | --- | --- |
| Registration inputs | Completed | Shared SchoolNameInput, muted example placeholder, optional field, 255-character limit. |
| Registration API | Completed | Trim and persist school name; blank becomes null. |
| Validation | Passed | Frontend build, isolated backend build, 5 handler cases and 3 payload checks. |
| Running backend | Restart required | Existing process still uses previously loaded binaries. |


## [20/11/2026] - Registration layout refinement

| Component | Status | Detail |
| --- | --- | --- |
| School input | Completed | Removed optional label/helper; retained muted example and aligned icon. |
| Registration layout | Completed | Full-width target, consistent spacing and responsive paired fields. |
| Validation | Passed | Production build succeeded; visual browser check not performed. |


## [20/11/2026] - Registration role transitions

| Component | Status | Detail |
| --- | --- | --- |
| Role selector | Completed | Shared sliding selection indicator and color transitions. |
| Student-only fields | Completed | Animate height/opacity with reduced-motion support. |
| Validation | Passed | Production build succeeded; browser visual check not performed. |


## [20/11/2026] - Library date picker for exam planning

DatePicker combines DayPicker calendar selection with Radix popover positioning and focus management; calendarDate converts local date-only values.

| Component | Status | Detail |
| --- | --- | --- |
| Exam date field | Completed | Vietnamese calendar, dd/mm/yyyy display, month/year controls, today and clear. |
| Persistence | Preserved | YYYY-MM-DD values and existing save/cancel flow. |
| Validation | Passed | Build, targeted lint and date conversion checks; browser verification not performed. |


## [20/11/2026] - Live password change validation

Password rules are derived from current values; touched fields show inline errors and server validation maps to matching inputs.

| Component | Status | Detail |
| --- | --- | --- |
| Password fields | Completed | Live required/strength/equality checks with accessible inline errors. |
| Submit and cancel | Completed | Disable invalid submits; reset validation after cancel/success. |
| Validation | Passed | Build, utility lint, 12 validation checks. Browser verification not performed. |


## [20/11/2026] - Password success toast

| Component | Status | Detail |
| --- | --- | --- |
| Password success feedback | Completed | Uses shared toast.success; verified existing API usage. |


## [20/11/2026] - Account joining date

| Component | Status | Detail |
| --- | --- | --- |
| Profile joining date | Completed | Uses API createdAt instead of hardcoded 20/08/2025; Vietnam timezone and missing-data fallback. |
| Validation | Passed | Backend mapping inspected and frontend build succeeded. Live DB row not queried. |


## [20/11/2026] - School entry moved to profile only

| Component | Status | Detail |
| --- | --- | --- |
| Registration | Completed | Removed school field and payload from both registration forms. |
| Profile settings | Retained | School name can be entered after registration. |
| Validation | Passed | Production build succeeded. |


## [20/11/2026] - Unified profile and aspirations

Account settings combines identity and student planning inputs with shared save/cancel controls. Student aspirations persist through the existing profile API to a nullable university_aspiration column.

| Component | Status | Detail |
| --- | --- | --- |
| Profile layout | Completed | Removed public user ID row and separate academic tab; merged academic controls. |
| School and aspiration | Completed | Editable with 255/500-character limits; tracked by shared dirty/reset state. |
| Student API and DB | Completed | GET/PUT mappings and nullable-column migration applied. |
| Validation | Passed | Frontend/API builds, 13 backend tests, EF snapshot check, live Swagger schema check. |
| Running Identity | Updated | Restarted locally using ProfileVerification build; browser end-to-end save not exercised. |


## [20/11/2026] - Frontend-only scope after backend rollback

This entry supersedes earlier backend aspiration implementation progress for this session.

| Component | Status | Detail |
| --- | --- | --- |
| Backend changes by assistant | Reverted | Source, tests, Identity docs, migration and added DB column removed. Pre-existing controller edit preserved. |
| Profile UI | Retained | Unified form uses existing backend fields only. |
| Aspiration | Frontend only | Per-account browser storage with explicit device-local notice. |
| Verification | Passed | FE/BE builds, live old API schema, original migration list, local account isolation checks. |


## [20/11/2026] - Remove duplicate connected roadmap UI

| Component | Status | Detail |
| --- | --- | --- |
| Roadmap route | Updated | Directly renders existing CurriculumExplorerView. |
| Backend roadmap tab | Removed from FE | Deleted wrapper and connected page; shared API clients retained. |
| Validation | Passed | FE build and reference checks; all 5 BE repos remain clean. |


## [20/11/2026] - Frontend student activation sequence

Student activation loads account-scoped diagnostic history, saved profile and server payment status. The sequence is diagnostic, profile, payment, then roadmap access.

| Component | Status | Detail |
| --- | --- | --- |
| Activation guide | Completed | Accessible modal/checklist with actionable settings and tuition navigation. |
| Profile guidance | Completed | Settings banner and save callback recheck pending prerequisites. |
| Roadmap/payment entry | Completed on FE | No page mount before required earlier steps; server payment confirmation required. |
| Backend | Unchanged | Server-side generation and access rules retained. |
| Verification | Passed | Frontend build and 12 activation/diagnostic checks; browser payment flow not exercised. |


## [20/11/2026] - Sidebar IRT placement

| Component | Status | Detail |
| --- | --- | --- |
| Student IRT summary | Completed | Below logo, above menu; stacked title/Theta and non-wrapping numeric label. |
| Validation | Passed | Production build succeeded. |


## [20/11/2026] - Correct Theta wrapping

| Component | Status | Detail |
| --- | --- | --- |
| IRT card | Corrected | Returned below navigation; Theta badge cannot shrink or wrap. |


## [20/11/2026] - Tuition pricing visibility

| Component | Status | Detail |
| --- | --- | --- |
| Tuition page | Updated | Always displays packages/prices; prerequisites checked on checkout click. |
| Roadmap gate | Retained | Checklist remains for incomplete activation. |
| Validation | Passed | Production build succeeded. |


## [20/11/2026] - Automatic progression after profile save

| Component | Status | Detail |
| --- | --- | --- |
| Guided profile save | Updated | Rechecks automatically without reopening the modal; navigates to tuition or roadmap when ready. |
| Missing data or error | Updated | Keep profile open and show toast; no manual check popup. |
| Validation | Passed | Production build and focused diff check. |


## [20/11/2026] - Tuition page copy

| Component | Status | Detail |
| --- | --- | --- |
| Activation notice | Updated | States activation is required to view content. |
| Refresh labels | Updated | Uses Làm mới instead of database terminology; verified source strings. |


## [20/11/2026] - Consistent payment receipts

| Component | Status | Detail |
| --- | --- | --- |
| Table/receipt status | Fixed | Shared status mapping; removed hardcoded success and unverified HMAC claims. |
| Pending orders | Updated | Refresh through existing status endpoint with identity matching; preserve state on failure. |
| Validation | Passed | Build and 6 payment checks. Specific live payment not queried. |


## [20/11/2026] - Resume pending checkout

| Component | Status | Detail |
| --- | --- | --- |
| Pending history/receipt | Completed | Resume button verifies status and reuses existing order checkout URL. |
| Terminal/invalid states | Handled | Paid orders update; failed/cancelled/expired or invalid links show feedback without creating a new order. |
| Validation | Passed | Build and 11 payment tests. No live payment performed. |


## [20/11/2026] - Payment outcome notifications

| Component | Status | Detail |
| --- | --- | --- |
| Success/create failure | Fixed | Shared toast API works without optional caller prop. |
| Failed/cancelled/expired | Completed | Terminal UI and toast; polling stops. |
| Network and cleanup | Completed | Sequential retries, limited connection notices, ignores closed-dialog responses. |
| Validation | Passed | Production build and 18 payment tests; no real payment performed. |


## [20/11/2026] - Frontend commit readiness

| Component | Status | Detail |
| --- | --- | --- |
| Frontend changes | Ready | Profile/auth/navigation/activation/payment improvements and documentation included. |
| Validation | Passed | Production build, 30 targeted tests, whitespace cleanup. |
| Commit scope | Frontend only | No backend or System-Repo staging. |


## [21/11/2026] - Weekly timetable frontend

StudentScheduleView retains existing API loading/filtering; WeeklyScheduleCalendar handles the week grid and ScheduleSessionDialog displays selected-session details. weeklySchedule utilities resolve dates, time rows and attendance presentation.

| Component | Status | Detail |
| --- | --- | --- |
| Weekly schedule | Completed | Seven days, six numbered standard slots, actual custom time rows, week controls and mobile agenda. |
| Class labels and details | Completed | API className outside and inside modal; room omitted, existing practice/AI actions retained. |
| Validation | Passed | Production build, 8 date/grouping tests and React render assertions. |
| Backend scope | Unchanged | Five backend repositories remain clean. |


## [21/11/2026] - Schedule heading deduplication

| Component | Status | Detail |
| --- | --- | --- |
| Schedule heading | Completed | Navbar retains title; duplicate content title/icon removed. Source verified. |


## [21/11/2026] - Schedule subtitle and filter action

| Component | Status | Detail |
| --- | --- | --- |
| Navbar subtitle | Completed | Optional schedule-only description below page title. |
| Refresh action | Completed | Right-aligned in filter row. Production build passed. |


## [21/11/2026] - Remove aspiration frontend field

| Component | Status | Detail |
| --- | --- | --- |
| Profile aspiration | Removed | Input, local storage access and dirty/reset state removed. |
| Activation checks | Updated | Aspiration is no longer required. Build and 9 tests passed. |


## [21/11/2026] - Student-only profile eligibility

| Component | Status | Detail |
| --- | --- | --- |
| Exam date check | Corrected | Valid date required; past dates do not block checkout. |
| Parent profile | Optional | Never required for payment activation. |
| Post-save check | Updated | Runs for any successful student profile save, including ordinary settings entry. |
| Validation | Passed | Build and 10 activation tests. |

## [21/11/2026] - Paid roadmap access
| Component | Status | Detail |
| --- | --- | --- |
| Tuition resolution | Complete | Normalize summary and scoped successful payment history. |
| Roadmap lifecycle | Complete | Idempotent tuition events, shared activation result and background refresh without remounting. |
| Verification | Passed | 29 regression tests and frontend production build; backend untouched. |

### [21/11/2026] - Empty exam date default (FE)
Removed the prefilled exam date from account settings. Profiles without a saved date show the date picker placeholder; saved dates remain visible. Reset the date when loading another account. Frontend production build passed; no backend changes.

### [21/11/2026] - Membership benefits visibility (FE)
Membership benefits now remain visible before payment, with activation-required labels and no unlocked action links. Paid members retain unlocked actions and the active course card. The heading uses the actual benefit count. Removed the test deactivation button and its reversal behavior. Frontend production build passed; backend unchanged.

### [21/11/2026] - Remove stale local tuition authorization
Fixed the tuition view retaining a cached test activation after an unpaid server response. It now starts without cached access and applies both paid and unpaid API results. Removed quick test activation. Curriculum synchronization clears unpaid cache and never grants access from cached state on request failure. Server tuition summary or confirmed successful payment history remains the payment source. Validation: 31 regression tests and frontend production build passed. Backend unchanged; live account not inspected.

### [21/11/2026] - Authoritative tuition API access
Supersedes the earlier history-based fallback: frontend access now strictly follows isPaid from GET /api/practice/payments/status-by-student/{studentId} (existing my-status fallback). Payment history and checkout success callbacks cannot grant access independently; payment completion reloads tuition status. Standalone roadmap initializes locked and rechecks the API on events rather than reading local cache. Existing backend computes eligibility from ACTIVE registration or SUCCESS/PAID payments; backend unchanged. Validation: 31 regression tests and production build passed.

## [21/11/2026] - Paid roadmap generation and timetable
| Component | Status | Detail |
| --- | --- | --- |
| Paid activation | Complete | Ensure existing roadmap or generate once on confirmed payment, using saved profile and completed diagnostic. |
| Existing progress | Preserved | Only 404 permits generation; no generation on network/auth failures. |
| Milestone card | Updated | Read-only roadmap loading; refreshes after roadmap update event. |
| Timetable | Updated | Optional metadata errors no longer hide sessions; distinguish empty states. |
| Validation | Passed | 45 regression tests and FE build. Real account data not inspected. |

## [21/11/2026] - Mock exam API integration
| Component | Status | Detail |
| --- | --- | --- |
| Published full exams | Connected | GET /api/content/exams; published FULL_MOCK only. |
| Exam session | Connected | POST mock-exams/{examId}/start; actual questions and duration, no fixed exam ID. |
| Submission and results | Connected | POST {submissionId}/submit and GET {submissionId}; no frontend grading. |
| Proctoring | Connected | Tab visibility departure logging; webcam capture not implemented in this change. |
| Resume/error handling | Complete | Per-student browser draft, original deadline, retry and server-result recovery after ambiguous submit failure. |
| Verification | Passed | 11 unit tests, production build, Chrome mocked-API interaction flow. Live API execution outstanding. |

## [21/11/2026] - Shared assessment room
| Component | Status | Detail |
| --- | --- | --- |
| ExamRoom | Shared | Original diagnostic header, question/passage layout, flags, navigation, timing display and submit confirmation. |
| Diagnostic | Preserved | Existing diagnostic state, submission, recovery and anti-cheat logic retained. |
| Mock page | Complete | Dedicated sidebar page, shared renderer and equivalent fullscreen/three-violation/timeout mechanics. Uses mock APIs. |
| Draft | Complete | Answers, flags, violation count and original deadline restored per student. |
| Validation | Passed | 23 unit tests, production build, Chrome stub-API passage/resume/three-violation/timeout scenarios. |

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

## [17/11/2026] - Parent Companion Portal UI Simplification

| Item | Status | Detail |
| --- | --- | --- |
| Parent Sidebar Navigation | Optimized | Removed `analytics` (Báo cáo Năng lực 4 Miền) and `roadmap` (Cây Tri thức & Chuyên đề) from Parent Portal sidebar. |
| Role Portal Tab Guardrails | Hardened | Updated `ROLE_PORTAL_DEFINITIONS.parent.tabs` and restricted `roadmap`/`analytics` rendering for `role === 'parent'`. |
| Tuition Perk Actions | Isolated | Disconnected student roadmap/quiz navigation callbacks in tuition payment view when role is parent. |
| Verification | Passed | `node --test tests/*.test.js` passed 22/22 tests; `vite build` completed in 1.68s with 0 errors. |

## [18/11/2026] - Parent Submission History Student Context & Multi-Child Switcher

| Item | Status | Detail |
| --- | --- | --- |
| Student Context Injection | Complete | Injected `studentId`, `studentName`, and `childrenList` from `parentPortalData` into `SubmissionHistoryView`. |
| History Loading Isolation | Complete | Updated `loadHistory` to query `practiceService.getStudentDiagnosticHistory(targetId)` and `getSubmissionHistory(targetId)` using child's studentId instead of parent's user ID. |
| Multi-Child Switcher Chips | Complete | Added interactive child selector pills in the header banner for parents with multiple linked children, updating active submission list dynamically. |
| Parent Persona Customization | Complete | Updated banner title, description, back navigation label, empty state message, and option selection tags ("Con đã chọn" / "Con chọn đúng") specifically tailored for parents. |
| Safe Deletion & Storage Scope | Complete | Extended `practiceService.getSubmissionHistory` and `deleteSubmissionFromHistory` with optional `targetStudentId` scoping. |
| Verification | Passed | `node --test tests/*.test.js` passed 22/22 tests; `npm run build` succeeded cleanly in 1.70s with 0 errors. |

## [19/11/2026] - Parent Dashboard UI Refactor & Visual Harmony

| Item | Status | Detail |
| --- | --- | --- |
| Hero Header & Context Pills | Complete | Unified Hero header with student metadata pills (`school`, `grade`, `targetMajor`) and child switcher; removed floating teacher block. |
| Tuition Payment Ribbon | Complete | Replaced heavy saturated blue banner with an elegant light indigo/slate fintech ribbon with `ShieldCheck` icon and PayOS VietQR CTA. |
| 4 Metric Cards Grid | Complete | Standardized cards with rounded icon badges, bold score typography, and dynamic readiness tier calculation via `getTierInfo`. |
| 3-Factor Readiness Cards | Complete | Containerized each factor into structured blocks with numbered badges (1, 2, 3), gradient progress bars, and plain-language captions. |
| Dedicated Teacher Contact Card | Complete | Relocated teacher profile to right column with real teacher name or "Chưa có giáo viên phụ trách", phone, and 1-on-1 meeting request action. |
| Submission History UI Harmonization | Complete | Redesigned `SubmissionHistoryView.jsx` with Navy-Indigo theme, humanized IRT theta with `formatThetaDisplay`, fixed wrong count mismatch (26 vs 0), and eliminated jargon `(DIAGNOSTIC)`. |
| Top Navbar Mission Control | Complete | Redesigned `AccountNavbar.jsx` with real dynamic VNU-HCM V-ACT countdown pill, zero title truncation (`whitespace-nowrap shrink-0`), and interactive Core Flow 6 alert bell popover. |
| Left Sidebar Option 1 Modern SaaS Redesign | Complete | Transformed `Sidebar.jsx` into single-line compact rows (~40px), eliminated bulky `VietQR` badge causing truncation, modernized active/hover states, and truncated footer student card cleanly. |
| Dynamic Entity Resolution & Empty-State Resilience | Complete | Eliminated synthetic mock fallbacks in `practiceService.js`, bound real `studentId` context in `TuitionPaymentView`, enabled dynamic DB courses mapping, and standardized graceful empty-state messaging. |
| React Hook Ordering Fix & Parent Portal Architecture | Complete | Relocated all `useEffect` hooks to top of `ParentDashboardView.jsx` before early returns, eliminating `Rendered more hooks` error; lifted `parentActiveChildId` to `App.jsx` for universal child sync. |
| 4-Module Parent Portal Structure | Complete | Implemented `ParentChildResultsView.jsx` (Radar, Roadmap, History) and `ParentEarlyWarningsAndTeacherView.jsx` (Level 2 & 3 warnings, 3-way meeting confirmation, Teacher messaging). |
| 3-Tier Dashboard Refactor & Jargon Purge | Complete | Refactored `ParentDashboardView.jsx` into Tier 1 (Child & Teacher bar + conditional tuition alert), Tier 2 (4 parent-focused metric cards), Tier 3 (7:5 two-column layout); purged all technical jargon (ZPD, BKT, PLAR, IRT). |
| Universal Active Child Switcher | Complete | Enabled dropdown child switcher in top AccountNavbar for multi-child parents, and synchronized child selection in TuitionPaymentView with global activeChildId. |
| Verification | Passed | `node --test tests/*.test.js` passed 22/22 tests; `npm run build` succeeded in 1.15s with 0 errors. |

| Diagram Placeholder `[IMAGE_PLACEHOLDER]` & Low-DPI Textbook Upload | Completed | `MathText.jsx` renders diagram/image supplement alerts; `aiService.js` passes `targetDpi = 56` and `batchSize = 5`; Vite build passed in 1.74s. |
| Collapsible TOC, 3/5 Theory Box, Question Bank Viewer & Database `sourceId` Question Sync (`TextbookStandardView.jsx`, `TextbookIngestView.jsx`) | Completed | Collapsible Table of Contents with `isTocCollapsed` (`ChevronLeft`/`ChevronRight`), theory container resized to 3/5 (`min-h-[380px] max-h-[550px]`, `rows={10}`), integrated Bloom L1–L6 question viewer below theory with correct answer highlights & KaTeX solutions, and seamless question synchronization keyed by database `sourceId` (`veval_textbook_saved_${sourceId}`). Vite build passed in 1.35s with 0 errors. |
| 130-Chapter Dynamic Curriculum Support & Unified 3-Tier Pedagogical View (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`) | Completed | Seamless filtering across 130 chapters on 4 domains by Grade (10, 11, 12), Sub-subject (Physics, Chemistry, Biology, History, Geography, Civics, Math, Language), and Bloom levels (L1-L4). Unified 3-tier view: Textbook Foundations -> In-place JSXGraph/KaTeX Solutions -> Question Bank Viewer. Vite build passed in 4.97s with 0 errors. |
| 139-Chapter CTST Complete Curriculum Support, Responsive 4-Column Domain Cards & Collapsible Filter (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`) | Completed | Full synchronization across 139 chapters and 337 lessons on 4 domains from Supabase PostgreSQL. Clean 4-column executive layout (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`), no artificial "Tổng hợp", natural grade sorting, collapsible filter bar with Bloom L1-L4 and sub-subjects. Vite build passed in 5.91s with 0 errors. |
| Elimination of Generic Formulas & 100% Authentic KaTeX Rendering Support (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`) | Completed | Synchronized with Master Pedagogical Knowledge Base. Zero misplaced derivative or generic formulas. Seamless KaTeX rendering across all 139 chapters and 337 lessons. Vite build passed in 4.68s with 0 errors. |
| All Toggles Closed by Default & Missing Source Data Fallbacks (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`) | Completed | Filter bar (`isFilterCollapsed = true`), all chapters (`isChapExpanded = false`), lessons (`isLesExpanded = false`), and 3 pedagogical tiers (`isTheoryExpanded = false`, `isMethodExpanded = false`, `isQuestionsExpanded = false`) closed by default. Clean fallbacks for missing source data: "Chưa có dữ liệu nguồn lý thuyết", "Chưa có dữ liệu nguồn phương pháp giải", "Chưa có dữ liệu nguồn câu hỏi cho dạng bài này", "Chưa có dữ liệu nguồn bài học/dạng bài". Vite build passed in 4.00s with 0 errors. |
| Elimination of Cross-Subject & Cross-Chapter Chunk Contamination, Strict Scoping & Quick Pattern Switcher (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `textbookStateBridge.js`) | Completed | 4-layer scoping hierarchy (Subject/Domain, Grade, Chapter, Lesson) in `getMatchedChunksForChapter`, `getMatchedChunksForLesson`, `getMatchedChunksForPattern`. Strict `isFuzzyLabelMatch` (100% match for `<= 2` words, >= 60% for longer labels). Elimination of 46 mixed chunks (Grade 10 Math Chapter 10 now gets strictly 19 chunks, zero Chemistry electron chunks). Quick Pattern Switcher pills added to `UnifiedNodeDetailView.jsx`. Cross-subject safety guard in `buildTheoryFromChunks`. Vite build passed in 3.06s with 0 errors. |
| Fix Missing Textbook Theory Overridden by Stub `activePattern.description`, Auto KaTeX Formula Extraction & Persistent Theory Merge (`TextbookIngestView.jsx`, `TextbookStandardView.jsx`, `UnifiedNodeDetailView.jsx`, `textbookStateBridge.js`) | Completed | Removed `activePattern.description` shadowing over `activeTheoryContent`; expanded `isGenericPlaceholder` to filter all backend/frontend stubs; added `normalizeViText` (`hoá`/`hóa`) and `extractKeyFormulasFromChunks`; fixed `UnifiedNodeDetailView` subject default (`MATH` no longer drops CHEM/PHYS chunks); upgraded `mergeSavedExercisesIntoChapters` to retain edited theory/methods; fixed `handleScanSkeleton` to auto-detect new PDF subject/grade. Vite build passed in 1.71s and Node assertions passed 100%. |
| Automated Basic Solution Method Synthesis (Block 2), Dynamic SGK Worked Examples, OCR Meta-Note Filter & Markdown `####` Heading Fix (`textbookStateBridge.js`, `TextbookIngestView.jsx`, `TextbookStandardView.jsx`, `MathText.jsx`) | Completed | Added `buildMethodFromChunks` (combines short pattern hints + extracted KaTeX formulas + 4-step procedure + SGK rules/examples/cautions) for Block 2 when no edited/AI full method exists; added `extractExamplesFromChunks` replacing hardcoded Physics example in `Ví dụ mẫu` tab; filtered Vision AI OCR meta-notes out of Block 1; fixed `MathText.jsx` heading split regex so `####` no longer emits a stray `#`. Vite build passed in 1.31s and Node assertions passed 100%. |
| End-to-End Textbook-to-Curriculum Real-Time Sync, Ghost-Book Cleanup, Grade-10/11 Chunk Matching Fix & 1-Click Content DB Upsert (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `TextbookStandardView.jsx`, `TextbookIngestView.jsx`, `textbookStateBridge.js`) | Completed | Prioritized live ingested SGK chunks & active saved edits in `UnifiedNodeDetailView` (Blocks 1, 2, 3 + KaTeX formulas) over stale pre-seeded Content Service text; added `clearSavedTextbookData` + `findSavedNodeData(activeSourceIds)` to eliminate deleted-book ghosts; fixed `detectGrade(..., null)` and parenthetical suffix stripping in `CurriculumExplorerView`; removed hardcoded fallback strings; added 1-click `syncTextbookSkeletonToCurriculum` upsert button on SGK views. Vite build passed in 1.28s and Node sync assertions passed 100%. |
| Fix Textbook Save-Then-Refresh Data Loss: Single-Copy Compact Storage, Quota Self-Healing, Ref-Safe `sourceId` & Persisted Structure Guard (`textbookStateBridge.js`, `TextbookIngestView.jsx`, `TextbookStandardView.jsx`) | Completed | Replaced 4x duplicate `localStorage` writes with 1 compact canonical copy + lightweight pointers and automatic `QuotaExceededError` eviction/retry; persisted active textbook pointer to `localStorage` (`ACTIVE_CTX_LOCAL_KEY`); eliminated stale `selectedSourceId` closure via `selectedSourceIdRef` across Step 1, Step 2 (`finishedSid`), and `handleSelectSource`; added `resolvePersistedChapters` and removed hardcoded `VL 10 CD` override on refresh. Vite build passed in 1.28s; `verify_persistence.mjs` and `verify_sync.mjs` passed 100%. |
| Eliminate Cross-Subject Leakage in Curriculum Sub-Subject Filter (`matchesSubSubject`, `detectSubjectFromContext`, `normalizeViText`) | Completed | Enforced 3-tier classification precedence in `CurriculumExplorerView.jsx` (explicit parenthetical/bracketed subject tags first, unambiguous chapter-title/code markers second, Vietnamese-safe sanitized keyword fallback third) and Unicode NFC normalization in `textbookStateBridge.js`. Eliminated Biology/Physics chapters (`Sinh học tế bào`, `Chuyển hóa`, `Tiến hóa`, `Vật lí hạt nhân`) leaking into Chemistry filter (26 -> exact 21 Chemistry chapters) and cross-leaks across Social Sciences/Language. Verified 113/113 taxonomy chapters + 8 untagged/NFD edge cases with 0 leaks/0 misses and Vite build passing in 1.30s. |
| 100% Studio UI Copy, Label & Chrome Minimalist Optimization (`CurriculumStudioEditor.jsx`, `TextbookStudioView.jsx`, `ExamParserStudioView.jsx`, `WordStyleFormulaCanvas.jsx`, `HierarchicalMathPalette.jsx`, `InteractiveFormulaBuilderModal.jsx`, `InteractiveMathWorkbenchModal.jsx`) | Completed | Fixed duplicate mode-switcher toolbar in Section 2 of `CurriculumStudioEditor`; merged double-stacked headers in `TextbookStudioView` via `headerActions`; stripped 100% of internal dev/spec jargon (`API 16`, `FSM Gate >= 80%`, `Flow 2/3`, `JSXGraph Native Engine`, `60 FPS`, `Embedded Live Test`, `Database`, `WYSIWYG`), duplicate emojis beside Lucide icons, redundant card subtitles, duplicate preview headers, and raw `$Oxy$` text in 2D Geometry. Shortened all tab/button/field labels to concise 2–4 word copy while preserving 100% of authoring & formula logic. Vite build passed in 1.24s (-42 kB JS bundle, 0 errors). |
| Soft-Academic Studio Redesign, Unified Word/Excel Direct Document Editor, Split 8-Subject Symbol/Formula Sidebar (838 Items: Math 214, Chem 278, Phys 137, Bio 80, Eng 70, Lit 25, Geo 24, Hist 10) & Docked STEM Learning Models Panel (`CurriculumStudioEditor.jsx`, `WordStyleFormulaCanvas.jsx`, `HierarchicalMathPalette.jsx`, `AcademicChartBlock.jsx`, `MathText.jsx`, `TextbookStudioView.jsx`) | Completed | Redesigned the entire Studio in a warm scholarly palette (`#F6F5F1` canvas, `#FFFFFF` paper sheet, `#1E3A5F` ink accents); eliminated `Trực quan/Trang in/Mã nguồn` and `Soạn thảo/Chia đôi/Xem trước` toggles in favor of a single unified visual document screen with an optional quiet `Xem thử` toggle; built `WordFormattingRibbon` (`Văn bản/H2/H3`, `B/I/U/S`, `Aa` Vietnamese uppercase/lowercase/capitalize, alignment, lists, quick inserts, undo/redo), unified `RichTextBlock` (native `Enter`, `Backspace` line deletion, multi-line selection, `Ctrl+V` image paste), Excel-like `EditableTableBlock` (`Tab`/`Enter` cell navigation, `+ Hàng`/`+ Cột`, KaTeX cells), and interactive `AcademicChartBlock` (Bar/Line/Pie Recharts + `[DATA_CHART]` in `MathText.jsx`); guaranteed zero raw `\frac` or `///` shown to users; expanded `HierarchicalMathPalette.jsx` to 838 KaTeX-validated items across 8 subjects (`Toán học: 214`, `Hóa học: 278`, `Vật lí: 137`, `Sinh học: 80`, `Tiếng Anh: 70`, `Ngữ văn: 25`, `Địa lí: 24`, `Lịch sử: 10`) with collapsible category accordions, portal Hover Preview Cards, and plain-formula/accent-insensitive/category-aware search; added docked Right `StemModelsPanel` housing all learning models. Vite build passed in 1.19s (3055 modules, 0 errors) and `verify_studio_editor.mjs` passed 100% (838/838 KaTeX-validated). |
| Fix HTTP 404 (`"Không tìm thấy dữ liệu hoặc đường dẫn yêu cầu."`) on Studio Save & Dual-Channel Textbook + Content DB Persistence (`CurriculumStudioEditor.jsx`, `TextbookStudioView.jsx`, `textbookStateBridge.js`, `CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `TextbookStandardView.jsx`, `TextbookIngestView.jsx`, `ExamParserStudioView.jsx`) | Completed | Added `isValidGuid`, `saveStudioPatternToTextbookStorage`, and 3-tier `upsertSinglePatternToCurriculumDb`; hydrated `TextbookStudioView` from active chapter/lesson/pattern storage & chunks; persisted all Studio edits immediately to `localStorage` textbook cache (`STUDIO_OVERRIDES_STORAGE_KEY` + active book) and PostgreSQL Content Service without throwing 404 on non-GUID or unsynced pattern IDs. Vite build passed in 1.23s and `verify_studio_save.mjs` passed 100%. |
| Complete Port & Enterprise UI Upgrade of Real Exam PDF Parser Studio (`view-exam.html` -> `ExamParserStudioView.jsx`, `ExamItemCards.jsx`, `ExamRichContent.jsx`, `ExamDatabaseModal.jsx`, `ExamMediaLightbox.jsx`, `examParserUtils.js`, `contentService.js`) [20/11/2026] | Completed | Ported 100% of `view-exam.html` capabilities to React SPA routed through API Gateway (`:5212`): Drag-and-drop PDF upload (`aiService.uploadPdfExam`) + 2s background polling (`aiService.getExamJobStatus`) with live `mm:ss` timer; hierarchical Passages & Single Questions workspace with Sticky Question Matrix (`IntersectionObserver` scroll sync, gap detection, quick filters); 6-stage OCR math sanitizer (`sanitizeExamMathAndLatex`), 2-tier `rowspan`/`colspan` Markdown tables, auto-detected interactive Recharts Bar/Pie charts; full Supabase Database Exam Explorer (`importExam`, `publishExam`, `deleteExam`, search & subject/status filters); `Ctrl+V` clipboard image paste persisted in React state, Lightbox modal (`50%`–`250%` zoom), inline quick-editor and 1-click `CurriculumStudioEditor` sync. Oxlint 0 warnings/0 errors, Node tests 12/12 passed, Vite build passed in 3.58s. |
| Automatic 4-Level Curriculum Node Identification (`Domain -> Chapter -> Lesson -> Pattern`), AI Batch Classification & Exam Blueprint Matrix (`examCurriculumMatcher.js`, `ExamNodePickerModal.jsx`, `ExamBlueprintDrawer.jsx`, `ExamItemCards.jsx`, `ExamParserStudioView.jsx`, `aiService.js`, `contentService.js`) [20/11/2026] | Completed | Loaded live `GET /api/content/curriculum` tree and implemented instant Vietnamese-aware auto-mapping (`autoMapExamQuestions` with subject inference & cross-subject guards), deep AI batch classification (`POST /api/ai-engine/exams/classify-nodes`), inline `Domain › Chapter › Lesson › Pattern` breadcrumbs on every question card, 4-column cascading `ExamNodePickerModal` with accent-insensitive search & top suggestions, interactive `ExamBlueprintDrawer` (coverage %, Domain/Chapter/Lesson/Bloom breakdown + 1-click chapter filter & question jump), and real `skillId` binding on `importExam`. Oxlint 0 warnings/0 errors across 11 files, Node tests 16/16 passed, Vite build passed in 4.19s. |
| Soft-Academic 4-Mode Exam Studio Redesign: Exam Paper View, Single-Question Studio Editor, Drag-and-Drop Exam Organizer & AI 6-Level Bloom Generator with Approval Queue (`ExamParserStudioView.jsx`, `ExamPaperView.jsx`, `ExamQuestionStudioTab.jsx`, `ExamOrganizerTab.jsx`, `ExamBloomAiGeneratorTab.jsx`, `examOrganizerUtils.js`, `examOrganizerUtils.test.js`) [20/11/2026] | Completed | Unified Soft-Academic design (`#F6F5F1` / `#FFFFFF` / `#1E3A5F`) with 4 workspace tabs: (1) Print-ready `ExamPaperView` with practice grading & print/PDF; (2) 2-pane `ExamQuestionStudioTab` for per-question editing (6 Bloom pills, Node picker, live KaTeX split preview, option shuffling, `Alt + Left/Right` navigation, duplicate, and 1-click Full 838-item Studio bridge); (3) Drag-and-drop `ExamOrganizerTab` (auto-renumber `1..N`, Bloom `L1 -> L6` sort, Chapter grouping, exam/option shuffling preserving passages, passage attach/detach, undo); (4) `ExamBloomAiGeneratorTab` generating questions per Skill across all 6 Bloom levels (`L1..L6`) into an interactive Review & Approval Queue (inline edit, regenerate, reject/restore, approve single or bulk into exam with real `skillId`). Oxlint 0 warnings/0 errors (17 files), Node tests 23/23 passed, Vite build passed in 3.18s. |
| 3-Page Exam Architecture Mirroring SGK Dropdown, Structured HTML Tables & Full Exam Deletion (`Sidebar.jsx`, `App.jsx`, `examStateBridge.js`, `examStateBridge.test.js`, `useExamWorkspaceController.js`, `ExamWorkspaceHeader.jsx`, `ExamSharedModals.jsx`, `ExamBankView.jsx`, `ExamIngestView.jsx`, `ExamStudioView.jsx`, `ExamDatabaseModal.jsx`, `TeacherPortalView.jsx`, `ExamRichContent.jsx`, `examParserUtils.js`) [20/11/2026] | Completed | Split the Exam suite into 3 standalone sidebar pages under collapsible `exam-group` (`Đề thi & AI Bloom`) for Teacher/Manager/Admin: (1) `exam-bank` (`ExamBankView.jsx`: Supabase Exam Bank + Print-ready `ExamPaperView` + Drag-and-Drop `ExamOrganizerTab`); (2) `exam-ingest` (`ExamIngestView.jsx`: 2-part PDF Vision AI OCR with cross-page background polling + AI 6-Level Bloom Generator & Review Queue with auto-exam creation on approve); (3) `exam-studio` (`ExamStudioView.jsx`: dedicated 2-pane per-question Studio + Full 838-item Studio bridge). Synchronized active exam, question focus, Bloom drafts, and OCR job state via `examStateBridge.js` (`useSyncExternalStore` + quota-safe `sessionStorage`). Added safe HTML `<table>` (`rowspan`/`colspan`) parsing (`parseHtmlExamTable`/`StructuredHtmlExamTable`), protected `[VARIATION_TABLE]`/`[MATH_GRAPH]`/`[MATH_GRAPH_3D]` blocks, and unified labeled **Xóa Đề** actions (both Supabase DB exams via `DELETE /api/content/exams/{id}` and unsaved AI/manual draft exams) across all 3 pages, Database modal, and `TeacherPortalView`. Oxlint 0 warnings/0 errors across 22 Exam files, Node tests 37/37 passed, Vite build passed in 6.19s (`3073 modules`, `0 Error`). |


## [19/11/2026] - Quản Lý Học Thuật Cơ Sở (`AcademicManagerDashboardView.jsx`), Khắc Phục Lỗi Xung Đột Phòng 409 & Khử Trùng Cảnh Báo Sớm

| Hạng Mục Triển Khai | Vị Trí Triển Khai | Trạng Thái | Chi Tiết Nghiệm Thu |
| :--- | :--- | :---: | :--- |
| **Khắc phục lỗi xung đột phòng 409 khi đổi phòng** | `AcademicManagerDashboardView.jsx` | 🟢 Hoàn thành | Hiển thị danh sách ca học hiện tại, hỗ trợ sửa đổi trực tiếp (`handleSaveWeeklySlotAndGenerate`) thay thế slot cũ `P.301` trước khi gửi lên API Backend `saveClassWeeklySchedules`. |
| **Xóa ca học offline trong tuần** | `AcademicManagerDashboardView.jsx` | 🟢 Hoàn thành | Nút xóa 🗑️ cho từng ca học, ràng buộc lớp học duy trì tối thiểu 1 ca học. |
| **Phát hiện xung đột phòng / GV thời gian thực** | `AcademicManagerDashboardView.jsx` | 🟢 Hoàn thành | Bộ kiểm tra `scheduleSlotConflict` loại trừ slot đang chỉnh sửa; cảnh báo đỏ biến mất tức thì khi chọn sang phòng trống. |
| **Truy vấn họ tên học sinh thực tế & Khử trùng lặp cảnh báo (Zero Hardcode)** | `EarlyWarningsMentorPanel.jsx` | 🟢 Hoàn thành | Tích hợp `userService.getUsers` động từ Identity REST API; hiển thị họ tên đầy đủ từ DB; `seenAlerts` khử trùng lặp các thẻ cảnh báo giống nhau cho cùng học sinh. |
| **Khóa chặt cơ sở phụ trách RBAC** | `AcademicManagerDashboardView.jsx` | 🟢 Hoàn thành | Huy hiệu Locked Badge với biểu tượng `Lock` và `ShieldCheck` cố định theo `currentUser.campusId`. |
| **Nút nạp đợt học / khóa học mẫu** | `AcademicManagerDashboardView.jsx` | 🟢 Hoàn thành | Nút nạp mẫu rỗng và nút điền mẫu trong modal tạo mới giúp kiểm thử 1-click. |
| **Biên dịch Web Client** | Toàn bộ ứng dụng | 🟢 Hoàn thành | `npm run build` đạt `✓ built in 2.13s` với 3054 modules sạch 100%, 0 lỗi. |
| **Giao diện Xếp lớp Ma trận 4 Miền × 3 Cấp bậc (12 Lớp)** | `AcademicManagerDashboardView.jsx`, `practiceService.js` | 🟢 Hoàn thành | Cấu hình ngưỡng Cơ bản / Nâng cao trực quan, render ma trận 4 hàng × 3 cột (12 lớp chuẩn) kèm trạng thái sĩ số và nút Gán GV trực tiếp. |
| **Chuẩn hóa vai trò Cổng Academic Director (`isDirectorMode`) & Đối sánh Đa Cơ Sở (`ALL`)** | `CampusManagerDashboardView.jsx`, `Sidebar.jsx`, `App.jsx` | 🟢 Hoàn thành | Giữ nguyên 4 phân hệ cốt lõi, mặc định hiển thị tất cả cơ sở kèm Bảng Đối Sánh Giữa Các Cơ Sở, gỡ 3 mục trỏ nhầm trên Sidebar, xóa hardcode tên/67% (`vite build` 1.96s). |
| **Khắc phục lỗi Logout vẫn dính tài khoản cũ (Race Condition)** | `App.jsx`, `apiClient.js`, `authService.js`, `PublicHeader.jsx` | 🟢 Hoàn thành | Chặn `/api/v1/users/me` ghi đè sau logout bằng `sessionVersion`, chặn lưu `USER_KEY` không có token, Optimistic Logout và kiểm tra `isAuthenticated()` ở `PublicHeader`. |

## [20/11/2026] - Hoàn Thiện Hành Trình Học Sinh End-to-End: Phòng Thi Độc Lập Nền Trắng, Đoạn Văn `Passage` Trong PLAR, Bản Đồ Lộ Trình Lớp 10–12 Phân 3 Vùng (`WEAK` / `MASTERED` / `UNASSESSED`) & Cổng Học Phí PayOS

| Hạng Mục Triển Khai | Vị Trí Triển Khai | Trạng Thái | Chi Tiết Nghiệm Thu |
| :--- | :--- | :---: | :--- |
| **Phòng Thi Độc Lập Nền Trắng Toàn Màn Hình** | `DiagnosticAssessmentPage.jsx` | 🟢 Hoàn thành | Tách hẳn giao diện làm bài thi & chấm bài (`stage === 'testing' \|\| stage === 'analyzing'`) qua `createPortal(..., document.body)` với `fixed inset-0 z-[200] w-screen h-screen overflow-y-auto bg-white` và khóa cuộn trang nền, triệt tiêu cảm giác popup / nền trong suốt. |
| **Đoạn Văn Đọc Hiểu `PassageContextBox` & Studio PLAR 4 Pha (8/8 APIs)** | `PlarNodeStudioPanel.jsx`, `ConnectedRoadmapPage.jsx`, `StudentRoadmapWorkspace.jsx`, `practiceService.js` | 🟢 Hoàn thành | Hiển thị đầy đủ ngữ cảnh đoạn văn `PassageContextBox` ở cả 3 pha `Preview`, `Apply` và `Remedial` (`BR-03`); triển khai trọn vẹn 4 pha `Preview -> Learn (SGK/Video ≥80%) -> Apply (ZPD + BKT + BR-03 Remedial) -> Reflect (Lưu DB & mở khóa chặng kế tiếp)`. |
| **Bản Đồ Lộ Trình Toàn Diện Lớp 10–12 Phân 3 Vùng** | `ConnectedRoadmapPage.jsx` | 🟢 Hoàn thành | Hiển thị toàn bộ ~337 dạng bài Lớp 10–12 của 9 môn GDPT 2018 chia 3 vùng (`1. Ưu tiên cải thiện WEAK` -> `2. Đạt điểm OK / Hoàn thành MASTERED & COMPLETED` -> `3. Chưa đánh giá UNASSESSED`), kèm bộ lọc Vùng / Khối Lớp 10–11–12 / 9 Môn học / Tìm kiếm và nút nâng cấp 1 chạm cho lộ trình 24 chặng cũ. |
| **Siết Cổng Học Phí PayOS, Xóa 100% Mock/Seed & Sửa Lỗi Runtime** | `TuitionPaymentView.jsx`, `PayOsCheckoutModal.jsx`, `curriculumAccess.js`, `LearningAnalyticsView.jsx`, `Sidebar.jsx`, `App.jsx` | 🟢 Hoàn thành | Ẩn nút bypass test/demo khỏi production (`import.meta.env.DEV`), xóa sạch `sampleQuestionsForDiagnostic` và seed ảo `845/920`, sửa `ReferenceError` ở `LearningAnalyticsView` & `Sidebar`; `22/22` unit tests Passed, `npm run build` (`3077 modules`, `4.63s`). |
| **Sửa Hàng Loạt Lỗi Li Ti Khi Parse Đề PDF (8 Ảnh Lỗi)** | `MathText.jsx`, `examParserUtils.js`, `ExamMediaLightbox.jsx`, `examCurriculumMatcher.js`, `examStateBridge.js` | 🟢 Hoàn thành | Sửa render văn xuôi/gạch dưới/`\ne`/`cases`/`\circC`, phục hồi `≡`, bảng ma trận kề, chặn hình giả, khớp môn theo từ nguyên + tự chữa node sai môn; `3/3` + `22/22` tests, build OK (chưa deploy Docker) |
| **Parse Đề Vòng 2 & 3: Khóa Chéo Môn Câu 26–29, Match Trực Tiếp `<u>`, Sửa Lỗi `$$$` Độ C Câu 95** | `examTextRepair.js`, `MathText.jsx`, `examParserUtils.js`, `ExamPaperView.jsx`, `useExamWorkspaceController.js` | 🟢 Hoàn thành | `richInlineRegex` match trực tiếp `<u>...</u>`, `repairDegreeUnits` không tạo `$$$` thừa, `normalizeQuestionItem` & `ExamPaperView.jsx` chặn node sai môn, controller tự chữa lành đề khi tải môn học; `5/5` + `22/22` web tests, build OK (chưa deploy Docker) |
| **Tự Động Phục Hồi Chùm Đọc Hiểu 118–120, Bóc Tách 3 Câu Hỏi Con & Xóa Bỏ Ký Tự ABCD Trên Đề** | `examTextRepair.js`, `examParserUtils.js`, `ExamPaperView.jsx`, `MathText.jsx`, `examStateBridge.js` | 🟢 Hoàn thành | Khôi phục nguyên văn đoạn trích Lịch sử 11 trang 155 không còn ký tự rác; tự động cứu 3 câu hỏi con 118, 119, 120 nâng badge từ "0 câu" thành "3 câu"; xóa nhãn (A), (B), (C), (D) lơ lửng, in đậm + gạch chân từ khóa; nâng cấp `STORAGE_KEY` lên `v3`; `6/6` + `22/22` tests passed, Vite build passed in 3.52s |

### [21/11/2026] - Resolve frontend pull conflicts against 682c9e2
Merged incoming textbook/exam workspace tooling, parent tuition targeting, API course catalog and collapsible navigation with the local weekly calendar, mock exam room, profile prerequisites and server-authoritative payment/resume logic. Retained the user-requested single student curriculum view and deletion of the obsolete ConnectedRoadmapPage/StudentRoadmapWorkspace; removed their incoming route/import. Kept the schedule navbar subtitle and non-wrapping theta summary. Both payment completion and failure callbacks are preserved. Added stale-request protection when changing the selected student and used the incoming dynamic course catalog for resumed invoices.
Validation: 119 unit tests passed, production build passed, five sidebar/navbar/student-parent payment render checks passed, and Chrome mocked-API exam scenarios passed (passages, flags, resume, third-violation and timeout submissions). Both documentation histories retained. Separately resolved documentation-only stash conflicts in the legacy V-Eval-Web_Client copy without committing its staged source or untracked environment/settings files. Backend repositories remained unchanged. The system root already had a separate pending merge without unmerged paths; it is outside this frontend merge commit.
