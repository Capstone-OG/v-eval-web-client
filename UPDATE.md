# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [20/10/2026] - Khắc Phục Lỗi Icon Bài Toán Mẫu, Tone Trắng Panoramic Workspace, Xóa Dòng Bằng Backspace, Chống Cắt Công Thức & Mở Rộng Thư Viện Ký Hiệu GDPT 2018 Toàn Diện

- **Khắc Phục Triệt Để Lỗi Icon Kim Cương '' Tại Thẻ 'Bài toán mẫu áp dụng phương pháp:' (`MathText.jsx` & `CurriculumStudioEditor.jsx`)**:
  - *Nguyên Nhân Sự Cố*: Ký tự emoji `📝` hoặc icon UTF-8 gốc khi qua các tầng tuần tự hóa bị giải mã sai thành mã thay thế Unicode `\uFFFD` (hiển thị hình thoi chấm hỏi `` trên trình duyệt).
  - *Giải Pháp Xử Lý Tinh Vi*: Bổ sung Unicode-aware regex `^[^\p{L}\p{N}\s]+` tự động bóc tách sạch sẽ mọi ký tự lỗi/thay thế đứng đầu tiêu đề, chuẩn hóa nhãn tiêu đề về `Bài toán mẫu áp dụng phương pháp:`.
  - Thay thế toàn bộ biểu tượng bị lỗi bằng vector icon Lucide `FileText` và `BookOpen` màu hổ phách (`amber-600`) viền bo tròn sắc nét, tương thích 100% trên mọi nền tảng.

- **Đồng Bộ Hoàn Toàn Header Bar Panoramic Workspace & Dạng Bài Sang Tone Trắng Sáng (`CurriculumExplorerView.jsx`)**:
  - *Loại Bỏ Vết Nền Tối Lạc Tone*: Chuyển đổi thanh tiêu đề modal `h2` bóc tách tài liệu (dòng 2490) và thanh header dạng bài (dòng 2830) từ dải gradient màu tối `bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900` sang nền trắng thanh lịch `bg-white border-b border-slate-200 text-slate-900`.
  - Chấm dứt hoàn toàn tình trạng "trên đen dưới trắng", tạo sự liền mạch thẩm mỹ 100% theo chuẩn hệ thống.

- **Loại Bỏ Hoàn Toàn Đoạn Văn Bản Mẹo Không Cần Thiết Dưới Chân Trang (`WordStyleFormulaCanvas.jsx`)**:
  - Đã xóa sạch dòng hướng dẫn: `💡 Gõ văn bản như Word • Bấm Enter để xuống dòng • Nhấp khoảng trống tự nhảy trỏ về cuối dòng • Nhấp công thức để sửa số tại chỗ` theo đúng yêu cầu, giữ cho canvas soạn thảo tinh giản và thông thoáng.

- **Hỗ Trợ Xóa Dòng Linh Hoạt Bằng Phím Backspace (`WordStyleFormulaCanvas.jsx`)**:
  - *Cơ Chế Xử Lý*: Hiện thực hàm `handleDeleteLine(lineIndex)` và gắn bộ lắng nghe phím `Backspace` trên các span `contentEditable`.
  - Khi người dùng bấm Backspace tại đầu dòng (offset 0) hoặc trên một dòng trống, hệ thống tự động xóa dòng hiện tại hoặc gộp nội dung vào cuối dòng liền trước, điều hướng con trỏ chính xác về vị trí nối dòng, mang lại trải nghiệm gõ phím mượt mà như Microsoft Word thật.

- **Khắc Phục Hiện Tượng Bị Cắt Cụt '...' Khi Công Thức Quá Dài Trong Thanh Tra Nổi (`WordStyleFormulaCanvas.jsx`)**:
  - *Nguyên Nhân*: Thẻ xem trước KaTeX bên trong popup inspector trước đây bị giới hạn cứng `max-w-[140px]` và mang class `truncate`, làm các biểu thức toán học hoặc phản ứng hóa học dài bị cắt ngang bằng dấu ba chấm `...`.
  - *Giải Pháp*: Gỡ bỏ hoàn toàn `truncate` khỏi vùng render KaTeX; mở rộng kích thước container xem trước lên `max-w-[280px]` kèm thanh cuộn ngang `overflow-x-auto scrollbar-none`; nâng bề rộng tối đa của popup thanh tra từ 420px lên `max-w-[540px]`, đảm bảo công thức hiển thị đầy đủ, không bao giờ bị cắt cụt.

- **Khắc Phục Triệt Để Hiện Tượng Chữ Trắng Trên Nền Trắng Khi Tạo Câu Hỏi Mới (`CurriculumStudioEditor.jsx`)**:
  - *Nguyên Nhân*: Thẻ cha cấp cao của Studio mang class `text-slate-100`, dẫn đến các thẻ `<textarea>` và `<input>` (phương án A, B, C, D và lời giải chi tiết) trong Khối 4 và modal `NewQuestionDialog` bị kế thừa màu chữ trắng trên nền thẻ `bg-white`, khiến người dùng không nhìn thấy chữ khi nhập liệu.
  - *Khắc Phục*: Thêm rõ ràng các thuộc tính màu sắc độc lập `text-slate-900 placeholder:text-slate-400 font-medium` cho tất cả các trường nhập liệu đề bài, 4 phương án trắc nghiệm A-D, và form tạo câu hỏi mới.

- **Mở Rộng Thư Viện Ký Hiệu & Công Thức Toàn Diện Chuẩn GDPT 2018 Lớp 10 - 12 (`HierarchicalMathPalette.jsx` & `WordStyleFormulaCanvas.jsx`)**:
  - Mở rộng kho tàng công thức và ký hiệu bao phủ đầy đủ tất cả các môn học phổ thông:
    - **Ngữ Văn**: Biện pháp tu từ (So sánh, Ẩn dụ, Hoán dụ, Nhân hóa, Điệp ngữ, Nói quá, Nói giảm nói tránh, Liệt kê, Tương phản, Câu hỏi tu từ); Thao tác lập luận (Giải thích, Phân tích, Chứng minh, Bác bỏ, Bình luận, So sánh); Cấu trúc đoạn văn (Diễn dịch, Quy nạp, Tổng-Phân-Hợp, Song hành, Móc xích, Phép thế, Phép nối); Thể loại thơ (Lục bát, Song thất lục bát, Thất ngôn bát cú Đường luật, Thơ tự do) và 6 phong cách ngôn ngữ.
    - **Địa Lý**: Dân số & lao động (Mật độ dân số, Tỉ suất gia tăng tự nhiên, Tỉ lệ thành thị, Thất nghiệp); Khí hậu & thủy văn (Biên độ nhiệt, Nhiệt độ trung bình, Lượng mưa, Cân bằng ẩm, Lưu lượng nước); Kinh tế & XNK (Cán cân XNK, Tỉ số XK/NK, Tỉ trọng cơ cấu %, Tốc độ tăng trưởng, GDP/người); Nông nghiệp & tài nguyên (Năng suất, Sản lượng, Bình quân lương thực, Độ che phủ rừng); Kỹ năng biểu đồ & Tọa độ cực Việt Nam.
    - **Sinh Học**: Di truyền phân tử (Số lượng nucleotit $N = 2A + 2G$, Chiều dài $L$, Khối lượng $M$, Chu kỳ xoắn $C$, Liên kết hidro $H$, Liên kết hóa trị $HT$, mARN, Số axit amin); Nguyên phân & Giảm phân (Số tế bào $2^k$, NST cung cấp, Giao tử đực/cái, Hiệu suất thụ tinh); Quy luật di truyền & Quần thể (F2 Menđen 3:1 & 9:3:3:1, Cân bằng Hardy-Weinberg, Tần số alen $p, q$, Tần số hoán vị gen $f$).
    - **Toán Học Nâng Cao**: Hình học Oxyz (Phương trình tổng quát mặt phẳng, PT tham số & chính tắc đường thẳng, Mặt cầu, Khoảng cách điểm đến mp, Thể tích tứ diện); Xác suất & Thống kê GDPT 2018 (Xác suất có điều kiện $P(A|B)$, Công thức Bayes & xác suất toàn phần, Kỳ vọng $E(X)$, Phương sai $V(X)$, Độ lệch chuẩn $\sigma(X)$, Trung bình mẫu ghép nhóm).

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn tất trong 788ms trên Vite 8 và React 19).
