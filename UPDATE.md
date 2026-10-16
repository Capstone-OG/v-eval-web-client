# Nhật Ký Cập Nhật (Update Log) - Web Client

## [16/10/2026] - Trình Diễn Chuyên Biệt Thẻ Ví Dụ Minh Họa SGK (Khối 1), Bài Toán Mẫu (Khối 2) & Bộ Lọc Bloom L1-L4 Duyệt Ngân Hàng 14 Câu Hỏi Trắc Nghiệm

- **Nâng Cấp Giao Diện Panoramic Workspace (`CurriculumExplorerView.jsx`)**:
  - *Khối 1 (Kiến Thức Nền Tảng SGK)*:
    - Hiển thị Lý thuyết chuyên sâu chuẩn SGK GDPT 2018 (Khái niệm đa đoạn, 4 quy tắc vàng, bảng ngoại lệ oxy hóa $H_2O_2, KO_2, OF_2, NaH$, lưu ý thi cử).
    - **Thẻ Card Chuyên Biệt: Ví Dụ Minh Họa SGK (`📌 Ví Dụ Minh Họa SGK:`)**: Nằm ngay bên dưới phần lý thuyết với viền xanh Teal/Emerald, hiển thị bài toán ví dụ minh họa công thức kèm phân tích và lời giải chi tiết KaTeX.
  - *Khối 2 (Phương Pháp Giải Chi Tiết & Bẫy)*:
    - Hiển thị Quy trình các bước giải thuật toán chuẩn mực.
    - **Thẻ Card Chuyên Biệt: Bài Toán Mẫu Áp Dụng Phương Pháp (`📝 Bài Toán Mẫu Áp Dụng Phương Pháp:`)**: Nằm ngay sau các bước giải với gradient hổ phách/cam ấm áp, trình bày bài toán mẫu giải chi tiết bám sát theo từng Bước 1, Bước 2, Bước 3.
    - Card Bẫy đề thi ĐGNL (Rose Alert) và Card Kỹ thuật Casio & Mẹo tư duy nhanh (Indigo Tip).
  - *Khối 4 (Ngân Hàng Bài Mẫu Chuyên Sâu & Bộ Lọc Bloom Phân Cấp)*:
    - **Thanh Tab Lọc Bloom Trực Quan**: `[Tất cả (14)]`, `[L1: Nhận biết (2)]`, `[L2: Thông hiểu (2)]`, `[L3: Vận dụng (5 câu)]`, `[L4: Vận dụng cao (5 câu)]`. Cho phép giáo viên lọc và duyệt mượt mà từng câu trong số 4-5 câu vận dụng mà không bị rối mắt.
    - Tab pills tương tác chuyển đổi giữa các câu hỏi trong nhóm được chọn kèm nút điều hướng phân trang `← Câu trước` / `Câu tiếp theo →`.
    - Nút bấm `+ AI Tạo Thêm 2 Bài Mẫu` cho phép giáo viên sinh thêm câu hỏi rèn luyện tức thì.
  - *Phân Vùng 1 (Điều Hướng Phân Cấp)*:
    - Hiển thị huy hiệu mật độ câu hỏi chi tiết theo cấp độ Bloom `(L1: 2 • L2: 2 • L3: 5 • L4: 5)` và nhãn chuẩn hóa `Chuẩn ĐGNL: L3 (5 câu) • L4 (5 câu)`.
- **Bộ Xử Lý Phân Tách Nội Dung Sư Phạm (`CurriculumStudioEditor.jsx`)**:
  - Xuất bản hàm `parseTheoryRecapSections(rawTheory)`: Tách riêng phần lý thuyết cốt lõi và phần ví dụ minh họa `### 📌 Ví dụ minh họa SGK:`.
  - Nâng cấp hàm `parseSolutionMethodSections(rawMethod)`: Tách riêng thuật toán giải, bài toán mẫu `### 📝 Bài toán mẫu áp dụng phương pháp:`, bẫy đề thi và mẹo Casio.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, thời gian build 732ms).
