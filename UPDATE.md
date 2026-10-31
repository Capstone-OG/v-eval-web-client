# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Khắc Phục Triệt Để Lỗi Xóa Hết Chữ Nhấn Phím Xóa Không Tự Động Xóa Dòng & Thu Hồi Con Trỏ Liền Mạch

- **Khắc Phục Lỗi Xóa Dòng Khi Trống Nội Dung (`WordStyleFormulaCanvas.jsx`)**:
  - *Loại Bỏ Stale Closure*: Chuyển toàn bộ thao tác tìm vị trí (`findIndex`), lọc bỏ dòng (`filter`) và ghép dòng (`slice`) từ state cũ sang `currentLines = docLinesRef.current || docLines`, khắc phục 100% hiện tượng dòng mới tạo hoặc mới sửa không tìm thấy `lineIdx`.
  - *Đồng Bộ State Tức Thời Trên `onInput`*: Cập nhật `tok.text` trực tiếp vào `docLinesRef.current` ngay khi gõ/xóa mà không gây re-render DOM, giúp điều kiện kiểm tra dòng rỗng luôn phản ánh chính xác trạng thái DOM thực tế.
  - *Chuẩn Hóa Nhận Diện Dòng Trống*: Lọc sạch các ký tự khoảng trắng, xuống dòng, `\u00A0` và zero-width space `\u200B`.
  - *Tự Động Xóa Dòng & Di Chuyển Con Trỏ*: Khi nhấn Backspace hoặc Delete trên dòng đã xóa hết chữ, dòng được loại bỏ tức thì qua `flushSync` và con trỏ chuột được tự động chuyển về cuối dòng liền trước một cách mượt mà.
