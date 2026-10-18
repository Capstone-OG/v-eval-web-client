# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - WEB CLIENT

## [18/10/2026] - Sinh Câu Hỏi Rèn Luyện Thích Ứng Bám Sát Dạng Bài Đang Phân Tích (Zero-Hardcode & Anti-Duplication), Khắc Phục Lỗi Render Markdown Đầu Dòng (Heading ###, In Đậm **, In Nghiêng ***) & Chuẩn Hóa Sư Phạm Phân Biệt STEM (Casio) vs Ngữ Văn / KHXH

- **Sinh Câu Hỏi Rèn Luyện Thích Ứng Bám Sát 100% Tri Thức Dạng Bài Đang Phân Tích (`CurriculumExplorerView.jsx` & `aiService.js`)**:
  - *Kết Nối Trực Tiếp Backend AI Engine & Triệt Tiêu 100% Hardcode / Fallback*:
    + Loại bỏ hoàn toàn toàn bộ mã lệnh hardcode và hàm fallback giả lập (`extractPatternPedagogicalContext`), tuân thủ triệt để nguyên tắc Dữ liệu thật 100% của hệ thống V-Eval.
    + Khắc phục triệt để lỗi tham chiếu biến `selectedLesson` chưa được khai báo trong Panoramic Workspace khiến hàm nhảy vào khối catch; chuẩn hóa trích xuất `currentLessonName` an toàn từ `previewSelectedLessonKey` và `targetPattern.lessonName`.
    + Đấu nối trực tiếp `aiService.generatePatternQuestions` gửi toàn bộ dữ liệu ngữ cảnh: `pattern_name`, `lesson_name`, `domain_name`, `theory_recap`, `solution_method`, `count: 2`, và danh sách đề bài các câu hỏi đã có (`existing_questions`).
  - *Cơ Chế Chống Trùng Lặp Khi Bấm Tạo Nhiều Lần (Anti-Duplication Prompting)*:
    + Thu thập danh sách câu hỏi hiện có trong dạng bài và chuyển giao cho AI Engine; Gemini được chỉ thị bắt buộc khai thác các trích đoạn, khía cạnh cảm thụ hoặc góc độ bài tập mới, không bao giờ lặp lại câu hỏi cũ khi người dùng nhấn tạo nhiều lần.
  - *Tự Động Chọn & Cuộn Đến Câu Hỏi Vừa Sinh*:
    + Khi 2 câu hỏi mới từ Gemini được thêm vào ngân hàng câu hỏi của dạng bài, hệ thống tự động cập nhật số lượng badge câu hỏi và chuyển `activeQuestionIndex` đến ngay câu hỏi vừa được sinh để giáo viên/học sinh kiểm tra và tương tác tức thì.
    + Nếu AI Engine gặp sự cố mạng hoặc lỗi xử lý, hệ thống hiển thị thông báo lỗi minh thị (alert/toast) thay vì ngụy tạo câu hỏi giả.

- **Khắc Phục Triệt Để Lỗi Render Markdown & Ký Tự Đầu Dòng (`MathText.jsx`)**:
  - *Sửa Lỗi Regex Bullet Nuốt Ký Tự In Đậm `**`*:
    + Trước đây, regex bullet `line.match(/^(\s*)(?:[-*•]|\u2022)\s*(?:[-*•]\s*)?(.*)$/)` xem ký tự `*` đầu dòng là bullet point mà không bắt buộc có khoảng trắng, dẫn đến các dòng in đậm bắt đầu bằng `**Ví dụ:**` bị nuốt 2 dấu `**` đầu tiên thành bullet `•`, để lại đuôi `Ví dụ:**` không có cặp mở, render thành `• Ví dụ:**` dạng thô.
    + Cập nhật regex mới: `^(\s*)(?:[-+•\u2022]|\*(?!\*))\s+(?:[-+•\u2022]\s+)?(.*)$`, bảo vệ tuyệt đối chuỗi `**` hoặc `***` không bị nhận nhầm thành bullet marker, bắt buộc phải có khoảng trắng phía sau dấu `*` đơn.
  - *Hỗ Trợ Toàn Diện Markdown Headings (`#`, `##`, `###`, `####`)*:
    + Tự động nhận diện cú pháp heading tiêu chuẩn Markdown và phân cấp font chữ rõ ràng, trang nhã.
    + Nhận diện các thẻ khối sư phạm chuyên dụng:
      * `### 📌 Ví dụ minh họa SGK:`: Render thành **Thẻ Ví Dụ Minh Họa SGK (Teal/Emerald Card)** với viền thanh nhã, huy hiệu nổi bật `📌 VÍ DỤ MINH HỌA SGK`, nền `bg-teal-50/70 border border-teal-200/80`.
      * `### 📝` / `### 📄 Bài toán mẫu áp dụng phương pháp:`: Render thành **Thẻ Bài Toán Mẫu Áp Dụng (Amber Card)** với huy hiệu `📝 BÀI TOÁN MẪU ÁP DỤNG`, nền `bg-amber-50/70 border border-amber-200/80`.
  - *Tự Động Chuẩn Hóa Cặp Dấu In Đậm / In Nghiêng*:
    + Bổ sung bộ xử lý Regex nội dòng hỗ trợ `***bold italic***`, `**bold**`, `*italic*`.
    + Tự động bù cặp mở in đậm đối với các nhãn bị mất dấu mở ở đầu dòng: `([A-ZÀ-Ỹa-zà-ỹ0-9\s&]{2,30}):\*\*` -> `**$1:**`.

- **Chuẩn Hóa Sư Phạm Đa Miền: Phân Biệt Rõ STEM vs Ngữ Văn / KHXH (`CurriculumStudioEditor.jsx` & `CurriculumExplorerView.jsx`)**:
  - *Loại Bỏ Hoàn Toàn Khái Niệm Mẹo Casio Với Môn Ngữ Văn & Khoa Học Xã Hội*:
    + Xây dựng hàm kiểm tra lĩnh vực `isMathOrStemDomain(domain)` nhận diện chính xác các môn Toán, Lý, Hóa, Sinh, Tin học (STEM) so với Ngữ văn, Lịch sử, Địa lí, GDCD, Ngoại ngữ.
    + **Giao diện Studio (`CurriculumStudioEditor.jsx`)**:
      * Đối với môn STEM: Giữ nguyên Thẻ `💡 Kỹ thuật Casio & mẹo tư duy nhanh` (hướng dẫn phím bấm fx-580VN X, fx-880BTG, Table Mode).
      * Đối với môn Ngữ văn / KHXH: Tự động đổi thành Thẻ `💡 Mẹo tư duy & Chiến thuật làm bài (Ngữ văn)` với viền tím violet sư phạm, hướng dẫn chiến thuật đọc hiểu, cấu trúc đoạn văn tổng - phân - hợp, dẫn chứng thực tế và phân bổ thời gian làm bài; tuyệt đối không hiển thị phím bấm máy tính Casio.
    + **Panoramic Workspace (`CurriculumExplorerView.jsx`)**:
      * Đổi tiêu đề thẻ Khối 2: "Bài toán mẫu" -> "Bài mẫu" (cho Ngữ văn).
      * Thẻ mẹo công nghệ hiển thị nhãn `Chiến thuật làm bài` thay cho `Kỹ thuật Casio`.
      * **Khắc phục triệt để lỗi nút `+ AI Tạo Thêm 2 Bài Mẫu` sinh nhầm biến số `$X = 2,07$`**: Nâng cấp kiểm tra lĩnh vực `isStem`: với môn Ngữ văn/KHXH, gọi AI sinh câu hỏi rèn luyện L3 & L4 chuẩn mực về lập ý, phân tích luận điểm, nghệ thuật dẫn chứng và đánh giá tư tưởng nhân văn, loại bỏ hoàn toàn các biến số $X$ và thuật ngữ đại số.
  - *Nâng Cấp Bộ Bóc Tách Khối Sư Phạm (`parseTheoryRecapSections` & `parseSolutionMethodSections`)*:
    + Tự động giải phóng ký tự ngắt dòng `\n` thô (`unescapeLiteralNewlines`) trước khi match regex.
    + Mở rộng regex nhận diện cả icon `📄` và tiêu đề Ngữ văn `### 💡 Mẹo tư duy & Chiến thuật làm bài:`.

- **Kiểm Thử Đóng Gói (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn thành trong 770ms trên Vite 8 và React 19).
