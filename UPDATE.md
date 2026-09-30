# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [29/09/2026] - Khởi Tạo Cấu Hình Dịch Vụ, Đóng Gói Docker & Tích Hợp System Runner

- **Thiết Lập Script Push Độc Lập**:
  - Tạo [`Scripts/push.bat`](./Scripts/push.bat) hỗ trợ kiểm tra đồng bộ lịch sử git, chọn nhánh và commit push trực tiếp từ thư mục dịch vụ.
- **Đóng Gói Docker & Nginx SPA**:
  - Soạn thảo [`Dockerfile`](./Dockerfile) đa tầng (Node 22 Alpine build + Nginx Alpine serve) và cấu hình [`nginx.conf`](./nginx.conf) hỗ trợ fallback URL cho SPA routing.
- **Hệ Thống Tài Liệu Chuẩn Hóa**:
  - Khởi tạo bộ 3 tài liệu theo quy chuẩn: [`docs/daily.md`](./docs/daily.md), [`docs/process.md`](./docs/process.md), và [`docs/architecture_acceptance.md`](./docs/architecture_acceptance.md).
- **Xây Dựng Phân Hệ Dịch Vụ Kết Nối API Gateway YARP (`src/services/`)**:
  - Khởi tạo [`src/services/apiClient.js`](./src/services/apiClient.js) tích hợp cơ chế tự động đính kèm JWT, bắt header `X-Token-Refresh-Required` của Gateway để gia hạn ngầm (Silent Refresh), và xử lý lỗi tập trung.
  - Xây dựng 4 service giao tiếp với 4 microservices qua Gateway: [`authService.js`](./src/services/authService.js) (Identity), [`contentService.js`](./src/services/contentService.js) (Content), [`practiceService.js`](./src/services/practiceService.js) (Practice), [`aiService.js`](./src/services/aiService.js) (AI Engine).
  - Khởi tạo [`src/services/index.js`](./src/services/index.js) xuất khẩu toàn diện và cấu hình biến môi trường [`.env`](./.env) trỏ về `http://localhost:5212`.

