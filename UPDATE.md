# UPDATE

## [14/11/2026] - Bảo Vệ Tuyệt Đối Khối Hình Học 3D (`[MATH_GRAPH_3D]`), Bảng Biến Thiên (`[VARIATION_TABLE]`) & Đồ Thị 2D (`[MATH_GRAPH]`), Sửa Lỗi `Phân tích & Lời giải:**` & Chuẩn Hóa Thẻ Chọn Độ Sâu Bóc Tách AI

- **Chuẩn Hóa Giao Diện Thẻ Chọn Chế Độ Bóc Tách AI ([`CurriculumExplorerView.jsx`](./src/components/curriculum/CurriculumExplorerView.jsx))**:
  - Thay thế ký hiệu LaTeX thô `$\rightarrow$` bằng mũi tên Unicode `→` và xóa bỏ hoàn toàn các mô tả hardcode chuyên đề Ester - Lipid trên cả 2 thẻ `Chuyên Dạng Đề & Bài Toán Thực Chiến` và `Chuyên Lý Thuyết Thuần & Dạng Mở Rộng`.
- **Cô Lập Sớm Khối Hình Học 3D/2D & Sửa Lỗi Tiêu Đề `Phân tích & Lời giải:**` ([`MathText.jsx`](./src/components/common/MathText.jsx))**:
  - Tự động phục hồi các thẻ bị bọc nhầm dấu `$` (`[ $MATH_GRAPH_3D$ ]` -> `[MATH_GRAPH_3D]`) và cô lập toàn bộ các khối `[MATH_GRAPH_3D]`, `[MATH_GRAPH]`, `[VARIATION_TABLE]`, `[MATH_GEOMETRY_2D]` bằng placeholder chữ thường `@@mathlabblocka@@` ngay ở đầu hàm `normalizeMathString(text)`.
  - Khắc phục lỗi regex tiêu đề làm biến dạng `**Phân tích & Lời giải:**` thành `**Phân tích & **Lời giải:****` (hiển thị dư `**` trên UI).
- **Kiểm Thử & Biên Dịch**:
  - Chạy `npm run build` thành công 100% trong 1.41s, 0 lỗi cú pháp.
