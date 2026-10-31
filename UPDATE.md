# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Khắc Phục Lỗi Runtime flushSync Is Not Defined & Hoàn Thiện Nhảy Dòng Lên (Backspace Line Merge)

- **Khắc Phục Lỗi Runtime flushSync Is Not Defined (`WordStyleFormulaCanvas.jsx`)**:
  - Đã import chính xác `import { flushSync } from 'react-dom';` tại đầu file kèm khối bọc `try/catch` an toàn. Triệt tiêu 100% lỗi runtime âm thầm ngắt quãng luồng xử lý xóa và nhảy dòng của phím Backspace.
  - *Nhận diện đầu dòng chuẩn xác*: Đo lường cả `sel.anchorOffset === 0` và `range.startOffset === 0` để nhận biết thời điểm con trỏ ở đầu dòng để nhảy dòng lên trên.
  - *Gộp các token chữ liền kề*: Nối chuỗi văn bản giữa hai dòng khi nhảy lên thành 1 span duy nhất, định vị con trỏ ngay vị trí nối cực kỳ mượt mà.
