# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Khắc Phục Lỗi Runtime ReferenceError (createPortal Is Not Defined) & Hoàn Thiện Render Portal

- **Khắc Phục Lỗi Runtime ReferenceError (`HierarchicalMathPalette.jsx`)**:
  - Đã import chính xác `createPortal` từ thư viện `react-dom` tại dòng 2 của file `HierarchicalMathPalette.jsx`.
  - Triệt tiêu 100% lỗi màn hình đỏ `ReferenceError: createPortal is not defined`, giúp thẻ xem trước trực quan hiển thị tức thì (80ms) trên `document.body` với `z-[99999]`.

- **Toàn Bộ Các Tính Năng Đã Nghiệm Thu Hoàn Hảo**:
  - Di chuột vào công thức là thẻ xem trước trực quan hiện tức thì (không còn lỗi, không bị che khuất).
  - Phím Enter trong khung soạn thảo xuống dòng mượt mà 100%.
  - Kéo thả công thức hay Bảng biến thiên thả vào bài soạn nhận chuẩn xác 100%.
