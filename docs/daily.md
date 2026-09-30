# NHẬT KÝ TIẾN ĐỘ HẰNG NGÀY (DAILY LOG) - V-EVAL WEB CLIENT

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

