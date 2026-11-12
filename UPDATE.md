# UPDATE

## [12/11/2026] - Tinh Gọn Giao Diện Đăng Nhập & Chuẩn Hóa Xử Lý Lỗi Lấy Trực Tiếp Từ Backend

- **Tinh gọn nội dung màn hình Đăng nhập / Đăng ký ([`WebLoginPage.jsx`](./src/components/auth/WebLoginPage.jsx), [`LoginForm.jsx`](./src/components/auth/LoginForm.jsx), [`RegisterForm.jsx`](./src/components/auth/RegisterForm.jsx), [`AuthModal.jsx`](./src/components/auth/AuthModal.jsx), [`emailValidator.js`](./src/utils/emailValidator.js))**:
  - Gỡ bỏ các thuật ngữ kỹ thuật, mô hình toán và hạ tầng nội bộ (`ZPD`, `IRT 3PL`/`2PL`, `IRT Theta`, `DAG Topo`, `CAT`, `BKT`, `AI Socratic Tutor`, `IAM Backend`, `JWT`, `API Gateway (:5212)`, `v2.4 Live`, mã cơ sở và chuỗi kỹ thuật `MX`/`DNS NXDOMAIN`), thay bằng ngôn ngữ tự nhiên, thân thiện với học viên và phụ huynh.
  - Thu gọn khoảng cách header, khung ảnh và cột trái/phải để màn hình đăng nhập hiển thị trọn vẹn trong một khung nhìn desktop mà không cần cuộn trang xuống.
- **Truyền tải trực tiếp thông báo lỗi từ Backend ([`apiErrorHandler.js`](./src/utils/apiErrorHandler.js), [`apiClient.js`](./src/services/apiClient.js), [`authService.js`](./src/services/authService.js))**:
  - Bổ sung helper `extractBackendErrorMessage` & `formatApiError` ưu tiên trích xuất nguyên văn thông báo lỗi từ Backend (`error.description`, `errors[]`, ASP.NET `ValidationProblemDetails`, `message`, `detail`, `title`, plain text) thay vì tự định nghĩa lại ở FE.
  - Chỉ hiển thị thông báo dự phòng dễ hiểu khi proxy/mạng không trả về nội dung đọc được (ví dụ phản hồi `502`/`503`/`504` rỗng, trang HTML lỗi hoặc rớt mạng), loại bỏ tình trạng hiển thị thô `HTTP Error 502`.
  - Đồng bộ route fallback `/api/v1/identity/auth/...` cho `forgotPassword`, `verifyResetOtp`, `resetPassword` trong `authService.js`.
- **Kiểm thử & Biên dịch**:
  - Thêm unit test [`tests/apiErrorHandler.test.js`](./tests/apiErrorHandler.test.js); chạy `node --test tests/*.test.js src/**/*.test.js` đạt **25/25 pass**, `npm run lint` đạt 0 errors, `npm run build` thành công 100%.
