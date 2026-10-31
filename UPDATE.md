# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Khắc Phục Hiện Tượng Di Chuột Không Hiện Thẻ (React createPortal) & Kéo Thả 100% Ăn (DataTransfer Fallback)

- **Khắc Phục Hiện Tượng Di Chuột Vào Không Hiện Thẻ (`HierarchicalMathPalette.jsx`)**:
  - Dùng `createPortal(..., document.body)` gắn trực tiếp thẻ xem trước vào `<body>` với `z-[99999]`, thoát hoàn toàn khỏi các hạn chế cắt viền `overflow: hidden` của sidebar.
  - Tối ưu độ trễ hiển thị xuống chỉ còn **80ms**, di chuột vào bất kỳ công thức hay Bảng biến thiên nào là thẻ lập tức xuất hiện ngay cạnh con trỏ.

- **Khắc Phục Triệt Để Kéo Thả Không Ăn (`WordStyleFormulaCanvas.jsx`)**:
  - Bổ sung fallback `text/plain` và `Text` trong `handleDropSnippetOnCanvas`, đảm bảo 100% trình duyệt đều truyền và nhận dữ liệu kéo thả thành công.
  - Nhận diện linh hoạt khối `[VARIATION_TABLE]`, chèn Bảng biến thiên hoặc công thức toán trực tiếp vào bài soạn mượt mà mà không làm bật popup Studio che chữ.

- **Đã Kiểm Thử & Nghiệm Thu**:
  - Phím Enter xuống dòng hoạt động trơn tru.
  - Di chuột vào công thức lập tức hiện bảng xem trước trực quan.
  - Kéo thả công thức hay Bảng biến thiên thả vào đâu cũng ăn 100%.
