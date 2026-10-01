# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [01/10/2026] - Kiểm Thử Toàn Diện Tầng Giao Tiếp API Gateway YARP & Đồng Bộ Kiến Trúc Dịch Vụ Frontend

- **Tầng Giao Tiếp API Gateway Chuẩn Hóa (`src/services/`)**:
  - Hoàn thiện HTTP Client trung tâm [`src/services/apiClient.js`](./src/services/apiClient.js) tích hợp Axios interceptor đính kèm JWT Bearer Token, bắt header `X-Token-Refresh-Required` của Gateway để kích hoạt Silent Refresh trong nền mà không ngắt quãng phiên làm việc.
  - Hoàn thiện 4 client microservice:
    - [`authService.js`](./src/services/authService.js): Xác thực đa vai trò, refresh token qua Identity Service (`/api/auth`, `/api/v1/auth`, `/api/v1/users`).
    - [`contentService.js`](./src/services/contentService.js): Truy vấn ngân hàng câu hỏi, đề thi khảo sát chẩn đoán 30 câu hỏi qua Content Service (`/api/v1/content`).
    - [`practiceService.js`](./src/services/practiceService.js): Đồng bộ lộ trình học tập cá nhân hóa, nộp bài kiểm tra chặng, lịch Live Q&A qua Practice Service (`/api/v1/practice`).
    - [`aiService.js`](./src/services/aiService.js): Tương tác gia sư Socratic và theo dõi tiến trình OCR đề thi qua AI Engine (`/api/v1/ai`).
- **Kiểm Thử Biên Dịch & Vận Hành (Verification & Build)**:
  - Kiểm thử `npm run build` thành công 100% trong 619ms, tạo các bundle tĩnh `dist/` sẵn sàng phục vụ trong container Nginx Alpine.
  - Kiểm thử tương thích môi trường cấu hình qua [`.env`](./.env) và [`.env.example`](./.env.example).
