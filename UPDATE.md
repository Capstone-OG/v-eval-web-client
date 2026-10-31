# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [01/11/2026] - Khắc Phục Triệt Để 4 Sự Cố: Enter Xuống Dòng, Chèn Snippet, Kéo Thả Bị Chặn & Di Chuột Sidebar

- **Khắc Phục Lỗi Enter Không Xuống Dòng & Chèn Công Thức Không Ăn (`WordStyleFormulaCanvas.jsx`)**:
  - Bổ sung ref đồng bộ `docLinesRef` tức thời trong `commitDocLines`, triệt tiêu hoàn toàn lỗi stale closure state trong React.
  - Bổ sung điều kiện chặn `onBlur` tự hủy (`if (targetTok.text === newText) return;`), ngăn chặn việc ô nhập liệu cũ khi mất nét focus ghi đè xóa mất dòng mới tạo hoặc công thức vừa chèn.
  - Hàm `handleInsertNewLineAfter` đọc trực tiếp text DOM thời gian thực `spanEl.textContent`, cắt tách chính xác văn bản trước/sau con trỏ và chuyển focus sang dòng mới tức thì.

- **Khắc Phục Lỗi Kéo Thả Không Ăn Vào Soạn Thảo (`WordStyleFormulaCanvas.jsx`)**:
  - Bổ sung trực tiếp `onDragOver` và `onDrop` vào từng thẻ inline `<span contentEditable>`.
  - Giáo viên và học sinh có thể kéo thả công thức hoặc Bảng biến thiên trực tiếp vào giữa câu chữ, đầu dòng, cuối dòng hay toàn bộ trang soạn thảo đều nhận 100%.

- **Khắc Phục Hiện Tượng Di Chuột Lại Không Hiện Bảng Hiển Thị (`HierarchicalMathPalette.jsx`)**:
  - Loại bỏ hoàn toàn lớp phủ `before:` ở tầng `z-[999]` từng đè lên các nút ở sidebar cướp sự kiện chuột.
  - Tối ưu thời gian phản hồi hiển thị xuống 150ms siêu nhạy, bổ sung kiểm tra an toàn `if (!item) return;` trong các hàm xử lý kéo thả và click chuột.

- **Đại Tu Toàn Diện Giao Diện Sidebar Ký Hiệu & STEM**:
  - Header trắng tinh khôi chuẩn Apple / Linear, huy hiệu `Sparkles` và tiêu đề `Ký Hiệu & STEM`.
  - Ô tìm kiếm bo tròn `rounded-xl` màu phấn nhã nhặn, viền tím tương tác êm ái.
  - Hiệu ứng trượt chuyển môn học mượt mà 1 môn học duy nhất kèm dải 7 chấm định vị.
