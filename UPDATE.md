# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [27/10/2026] - Khởi Tạo Bộ Unit Test Cho Token Storage Client Và Tích Hợp CI Test

- **Khởi Tạo Bộ Unit Test Cho Token Storage (`tests/tokenStorage.test.js`, 3 Tests)**:
  - Tận dụng chuẩn Node.js Native Test Runner (`node:test`, `node:assert/strict`) tương thích hoàn toàn môi trường ESM / Node 20 / Node 24.
  - Triển khai bộ 3 unit test cho module quản lý phiên làm việc & JWT `tokenStorage`:
    - Kiểm thử lưu trữ và trích xuất Access Token & Refresh Token hợp lệ.
    - Kiểm thử tuần tự hóa và giải mã đối tượng thông tin người dùng (`user profile`) từ Storage.
    - Kiểm thử dọn sạch toàn bộ khóa chứng thực khi đăng xuất (`clearTokens`).
  - Cập nhật an toàn `import.meta.env?.VITE_API_GATEWAY_URL` trong [`apiClient.js`](./src/services/apiClient.js) hỗ trợ chạy test mượt mà ở cả môi trường Node và Vite.
  - Bổ sung lệnh `"test": "node --test"` vào `package.json` (chạy hoàn thành 100% trong ~90ms).
- **Tích Hợp Tự Động Hóa CI/CD Workflow**:
  - Bổ sung bước thực thi `npm test` vào `.github/workflows/ci.yml` trước bước build ứng dụng.
