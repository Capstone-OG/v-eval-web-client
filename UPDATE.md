# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT SERVICE

## [11/11/2026] - Chuyển Nhánh Main, Đóng Gói Docker SPA Với Nginx Reverse Proxy & Tự Động Định Tuyến Domain pickic.io.vn

- **Tự Động Phân Giải Domain API Gateway Đa Môi Trường ([`apiClient.js`](./src/services/apiClient.js))**:
  - Triển khai hàm `getGatewayBaseUrl()`:
    - Khi truy cập từ domain triển khai `pickic.io.vn` hoặc `app.pickic.io.vn`: Tự động trỏ toàn bộ API về `https://api.pickic.io.vn` với kết nối mã hóa SSL/TLS 100%, chấm dứt hoàn toàn lỗi Mixed Content.
    - Khi truy cập từ máy local (`localhost:5173`): Giữ nguyên fallback trỏ về cổng phát triển nội bộ `http://localhost:5212` (`VITE_API_GATEWAY_URL`).
  - Cập nhật toàn bộ các phương thức `request()` và `apiClient.getBaseUrl()` (dùng cho Server-Sent Events SSE Socratic Tutor) tự động gọi `getGatewayBaseUrl()`.

- **Cấu Hình Nginx Alpine Đóng Gói Production ([`nginx.conf`](./nginx.conf))**:
  - Kích hoạt nén **Gzip** (`gzip on`, level 6) cho toàn bộ file tĩnh (JS, CSS, JSON, SVG, XML) giảm thiểu băng thông tải trang.
  - Cấu hình điều hướng SPA `try_files $uri $uri/ /index.html` đảm bảo định tuyến client-side router không bị 404 khi F5.
  - Bổ sung cấu hình Reverse Proxy `location /api/` trỏ trực tiếp tới `http://v-eval-gateway:5212/api/` bên trong Docker Network với các thiết lập WebSocket Upgrade và timeout 600s phục vụ xử lý luồng AI dài hạn.

- **Đóng Gói & Tối Ưu Hóa Docker Volume ([`docker-compose.yml`](../../docker-compose.yml))**:
  - Ánh xạ trực tiếp thư mục `dist/` đã build vào Nginx `/usr/share/nginx/html:ro` và `nginx.conf` vào `/etc/nginx/conf.d/default.conf:ro`.
  - Giúp việc cập nhật frontend diễn ra tức thì sau `npm run build` mà không cần tốn thời gian rebuild toàn bộ Docker Image.

- **Kiểm Thử & Nghiệm Thu Trực Tuyến**:
  - `npm run build` hoàn thành trong **2.36 giây** (3015 modules transformed, 0 Error, 0 Warning).
  - Kiểm thử truy cập công khai qua Cloudflare Tunnel:
    - `https://pickic.io.vn` ➔ HTTP/2 200 OK.
    - `https://app.pickic.io.vn` ➔ HTTP/2 200 OK.
