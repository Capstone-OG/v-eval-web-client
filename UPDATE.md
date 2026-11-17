# UPDATE - V-Eval-Web_Client

## [18/11/2026]
- **Sửa Lỗi Màn Trắng SyntaxError: The requested module does not provide an export named 'isGenericPlaceholder' (`./src/components/curriculum/textbookStateBridge.js`, `./src/components/curriculum/TextbookStandardView.jsx`)**:
  - Triển khai và export đầy đủ hàm `isGenericPlaceholder(text)` trong `textbookStateBridge.js`.
  - Quét và loại trừ 100% các câu chữ văn mẫu generic template rò rỉ (`Nội dung định nghĩa cốt lõi của bài học...`, `Các đại lượng vật lí / toán học / hóa học đo lường...`, `Ý nghĩa thực tiễn & Bẫy tư duy trong đề thi...`) khỏi giao diện lý thuyết và pipeline bóc tách; triệt tiêu hoàn toàn lỗi màn hình trắng.
- **Triệt Tiêu 100% Mock & Template Giả Lập: Lý Thuyết Thuần Cô Đặc Không Số Trang, Tăng Chiều Dài Gấp Đôi & Mục Lục Mở Rộng Hết Chương (`./src/components/curriculum/TextbookStandardView.jsx`, `./src/components/curriculum/textbookStateBridge.js`)**:
  - *Lý thuyết thuần cô đặc, không ghi số trang (`buildTheoryFromChunks`)*: Loại bỏ hoàn toàn nhãn số trang thô (`#### 📄 Trang X (SGK Gốc)`), lọc sạch bài tập vụn vặt và câu trùng lặp (`seenSentences`). Tổng hợp và cô đặc tri thức thực tế từ CSDL thành 4 phân mục chuẩn mực:
    1. Khái Niệm & Định Nghĩa Trọng Tâm (định nghĩa cốt lõi, hiện tượng, quy luật khoa học)
    2. Công Thức & Phương Trình Đặc Trưng (công thức toán, lý, phương trình phản ứng KaTeX)
    3. Phân Loại Dạng Bài & Trọng Tâm Vận Dụng (phương pháp giải theo dạng bài bóc tách)
    4. Lưu Ý Sư Phạm & Bẫy Tư Duy (điều kiện áp dụng, các bẫy tư duy thường gặp)
  - *Không gian đọc mở rộng gấp đôi*: Tăng chiều cao vùng lý thuyết thuần lên gấp đôi (`min-h-[920px]`, `max-h-[140vh]`), cỡ chữ nhỏ lại tinh gọn (`text-[12px] leading-relaxed`) cho trải nghiệm nghiên cứu liền mạch, chuyên sâu.
  - *Mục lục trải dài đến hết số lượng chương*: Gỡ bỏ giới hạn `max-h-[75vh]` và thanh cuộn cục bộ ở cột trái, cho phép cây mục lục tự động mở rộng theo toàn bộ danh sách chương và bài học.
  - *Làm sạch tiêu đề đa chuyên đề (`cleanPrefix`)*: Xử lý triệt để các tiêu đề phức tạp như `Chuyên đề 4, 5, 6, 7 & 8: Pin điện - Điện phân`, không còn hiện tượng sót dấu phẩy lơ lửng `, 6, 7 & 8: Pin điện...`.
- **Chuẩn Hóa Triệt Để Pipeline Bóc Tách: Khử Thẻ Rò Rỉ `[TAXONOMY: ...]`, Rác Xuất Bản & Gãy Dòng KaTeX (`./src/components/curriculum/textbookStateBridge.js`)**:
  - *Khử sạch 100% thẻ rò rỉ `[TAXONOMY: ...]`*: Quét sạch mọi thẻ taxonomy còn sót lại trong dữ liệu CSDL cũ.
  - *Lọc bỏ rác thông tin xuất bản*: Phát hiện và loại trừ toàn bộ dòng thông tin tác giả, tổng chủ biên, nhà xuất bản, bản quyền không để lẫn vào dạng bài học.
  - *Nối dòng gãy KaTeX & chuẩn hóa vectơ*: Nối liền các ký tự/biến số toán học bị tách rời dòng (`A,`, `B`, `| AB |`); chuẩn hóa sang KaTeX `\vec{AB}`, `|\vec{AB}| = AB`; phân lập bài toán giải mẫu khỏi khối khái niệm cốt lõi.
- **Tính Năng Xóa Sách Khỏi CSDL & Vô Hiệu Hóa 2 Nút Điều Hướng Header**:
  - *Xóa cuốn sách khỏi CSDL*: Thêm nút `[🗑️ Xóa sách]` kèm modal xác nhận an toàn tại khối banner tổng quan; gọi API `DELETE /api/ai-engine/textbooks/sources/{sourceId}` xóa sạch vector chunks và bản ghi metadata trong Supabase PostgreSQL (`v_eval_ai."KnowledgeSources"` và `"KnowledgeVectorChunks"`).
  - *Vô hiệu hóa 2 nút điều hướng trên Header*: Vô hiệu hóa nút `[Sang Trang Nạp SGK]` và `[Mở Studio Biên Soạn]` với `disabled` và `opacity-50 cursor-not-allowed`, điều hướng người dùng sử dụng menu phân hệ chuyên biệt trên Sidebar.
- **Sửa Lỗi ReferenceError: m is not defined Trong Trang Nạp SGK (`./src/components/curriculum/TextbookIngestView.jsx`)**:
  - Bọc chuỗi KaTeX `90\text{ m}` bằng `<MathText />` thay vì để chuỗi thô trong JSX text gây hiểu nhầm `{ m}` là biến JS không xác định; triệt tiêu 100% lỗi crash runtime khi mở trang Nạp SGK.
- **Kiểm Thử Vận Hành**: `npm run build` (`vite build`) đạt `✓ built in 1.19s` với 3053 modules sạch 100%, 0 lỗi.
