# NHẬT KÝ TIẾN ĐỘ HẰNG NGÀY (DAILY LOG) - V-EVAL WEB CLIENT

---

## [19/10/2026] - Tái Cấu Trúc Header Chi Tiết Dạng Bài Tránh Chèn Ép Tiêu Đề, Khắc Phục Triệt Để Lỗi Mờ Tab 'Khoa Học Tự Nhiên' & Redesign Hero Banner Tone Trắng Sáng

- **Tái Cấu Trúc Header Chi Tiết Dạng Bài Tránh Chèn Ép Tiêu Đề (`CurriculumExplorerView.jsx`)**:
  - *Khắc Phục Lỗi Tiêu Đề Bị Bóp Nghẹt, Bẻ Thành 3 Dòng*:
    + Trước đây header chi tiết dạng bài gom chung meta badges và tiêu đề `h2` trong cùng một khối flex bên trái, đặt ngang hàng với 3 nút chức năng bên phải (`Mở Studio`, `Sửa nhanh`, `Luyện tập củng cố`). Do 3 nút này chiếm tới ~500px, tiêu đề dạng bài (như "Nhận biết sự kiện lịch sử") bị ép vào phần không gian hẹp còn lại ~180px, dẫn đến vỡ dòng thành 3 đoạn chữ cụt lủn rất xấu xí.
    + Tách cấu trúc header thành 2 hàng phân cấp rõ ràng:
      * **Hàng 1 (Top Bar)**: Meta badges (`Mã Dạng`, `Trọng số`, `Mức độ Bloom`) bố trí gọn gàng bên trái; 3 nút hành động căn chỉnh bên phải.
      * **Hàng 2 (Full-Width Title)**: Tiêu đề `h2` (`text-xl lg:text-2xl font-black text-slate-900`) độc chiếm 100% bề ngang khung nhìn, hiển thị liền mạch trên 1 dòng duy nhất, không bao giờ bị chèn ép hay vỡ chữ.

- **Khắc Phục Triệt Để Lỗi Mờ/Mất Tương Phản Tab 'Khoa Học Tự Nhiên' (`CurriculumExplorerView.jsx`)**:
  - *Nguyên Nhân Sự Cố*: Vệt trang trí nền `bg-cyan-50/70 blur-3xl` đặt tại vị trí `left-1/3 bottom-0` nằm trực tiếp bên dưới tab thứ 3 "Khoa học tự nhiên". Do tab dùng nền bán trong suốt `bg-slate-50/70`, bộ lọc Gaussian blur làm sai lệch cơ chế khử răng cưa subpixel font-smoothing của trình duyệt Blink/Chromium, đồng thời nhuộm mờ màu cyan lên viền, chữ và biểu tượng `Atom`, khiến tab thứ 3 trông nhợt nhạt và bị mờ hẳn so với 4 tab còn lại.
  - *Giải Pháp Triệt Để*:
    + Gỡ bỏ hoàn toàn 2 khối cầu blur trang trí nền (`bg-cyan-50/70 blur-3xl` và `bg-indigo-50/70 blur-3xl`), giữ nền thẻ `bg-white` phẳng, sạch và tinh khôi 100%.
    + Bổ sung lớp ngữ cảnh xếp chồng độc lập `relative z-10` cho lưới chứa 5 tab miền năng lực (`lg:grid-cols-5`).
    + Chuyển đổi các tab chưa kích hoạt sang nền trắng thuần `bg-white hover:bg-slate-50`, viền đặc sắc nét `border border-slate-200 hover:border-slate-300`, chữ `text-slate-800 font-bold group-hover:text-slate-900` và icon box `bg-slate-100/90 text-slate-600`, đảm bảo cả 5 miền năng lực đồng nhất, sắc nét, tương phản cao trên mọi màn hình.

- **Redesign Toàn Diện Hero Banner & Thanh Chọn Miền Kiến Thức Chuẩn Tone Trắng Sáng (`CurriculumExplorerView.jsx`)**:
  - *Khắc Phục Lệch Tone Màu "Trên Đen Dưới Trắng"*:
    + Trước đây banner đầu trang sử dụng gradient nền tối (`bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900`) tương phản đột ngột và lệch tone hoàn toàn so với toàn bộ giao diện nền sáng của hệ thống.
    + Chuyển đổi 100% sang **Tone Trắng Sáng Thanh Lịch**: `bg-white border border-slate-200/80 rounded-2xl shadow-xs`.
  - *Thiết Kế Tinh Gọn, Đơn Giản & Hiện Đại*:
    + Giảm padding cồng kềnh từ `p-8` xuống `p-5 lg:p-6` giúp tiết kiệm chiều cao màn hình, thông thoáng và vừa vặn khung nhìn.
    + Title `text-xl lg:text-2xl font-black text-slate-900`, badge `bg-indigo-50 text-indigo-700` nhỏ gọn, tinh tế.
    + Chuyển 2 khối thống kê "Cấu trúc phân cấp" và "Trọng số chuẩn hóa 1.200 Điểm" từ dạng hộp to thành các chip ngang compact `px-3.5 py-2 rounded-xl bg-slate-50/90 border border-slate-200/80` căn thẳng hàng với tiêu đề.
  - *Căn Đều 5 Miền Năng Lực Trên 1 Hàng Ngang Duy Nhất (`lg:grid-cols-5`)*:
    + Thay thế lưới `grid-cols-4` (vốn làm miền thứ 5 "Sử dụng Ngôn ngữ" bị rớt xuống hàng 2 cô độc) bằng lưới 5 cột hoàn hảo `lg:grid-cols-5`.
    + Tab kích hoạt (Active): Nền `bg-indigo-50/90 border-2 border-indigo-600 text-slate-900 shadow-sm ring-2 ring-indigo-500/15`, icon đổi sang gradient màu rực rỡ.
    + Tab chưa kích hoạt: Nền `bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs`, sắc nét và ổn định.

- **Loại Bỏ Hoàn Toàn Chữ 'text' Thừa Trước Công Thức Hóa Học & Ion (`MathText.jsx`)**:
  - *Nguyên Nhân Sự Cố*: Trong đề bài hoặc đáp án chứa ion hóa học (ví dụ: `Số oxi hóa của sulfur (S) trong ion textSO_4^{2-} là:`), các lệnh LaTeX `\text` bị mất backslash hoặc không có ngoặc nhọn khiến chữ "text" bị KaTeX hiển thị nghiêng dạng biến số toán học ($textSO_4^{2-}$).
  - *Cơ Chế Làm Sạch Tinh Vi*: Bổ sung bộ lọc trong hàm `normalizeMathString`:
    + `str = str.replace(/(?:\\text|\btext)(?=[A-Z])/g, '');`
    + `str = str.replace(/(?:\\text|\btext)\{([A-Z][a-zA-Z0-9_+\-^]*)\}/g, '$1');`
    Tự động tách bỏ tiền tố `text` / `\text` khi đứng liền trước các ký hiệu hóa học viết hoa ($SO_4^{2-}$, $H_2O$, $Fe^{3+}$, $KMnO_4$), khôi phục công thức hóa học gốc hiển thị trong trẻo, sắc nét 100%.

- **Chèn Công Thức Ngay Tại Vị Trí Con Trỏ (Active Caret Precision Insertion - `WordStyleFormulaCanvas.jsx` & `CurriculumStudioEditor.jsx`)**:
  - *Khắc Phục Lỗi Chèn Rơi Xuống Cuối Văn Bản*: Trước đây khi giáo viên đang soạn thảo trên canvas WYSIWYG và nhấp chọn ký hiệu từ sidebar hoặc thanh tra, hệ thống không tìm thấy `textarea` nên fallback nối chuỗi vào cuối văn bản (`. a/b a/b a/b`).
  - *Giải Pháp Bắt Con Trỏ Tinh Vi*:
    + Nâng cấp `WordStyleFormulaCanvas` bằng `forwardRef` và `useImperativeHandle`, xuất bản phương thức `insertSnippet(latexSnippet)`.
    + Theo dõi liên tục vị trí con trỏ `activePositionRef.current = { lineId, tokenId, offset }` thông qua các sự kiện `onKeyUp`, `onMouseUp`, `onFocus`, `onInput`.
    + Khi giáo viên nhấp chọn ký hiệu, hệ thống chia tách chính xác đoạn text token hiện tại tại `offset`, chèn token công thức `formulaToken` vào ngay vị trí con trỏ và tự động đưa tiêu điểm ra sau công thức mới chèn để giáo viên tiếp tục gõ văn bản liền mạch.
    + Kết nối `theoryCanvasRef` và `methodCanvasRef` trong `CurriculumStudioEditor.jsx`, tự động điều hướng luồng chèn vào đúng canvas đang kích hoạt.

- **Khôi Phục Giao Diện Trắng Sáng Thanh Lịch (Clean White Tone Reversion - `HierarchicalMathPalette.jsx`)**:
  - *Loại Bỏ Hoàn Toàn Giao Diện Tối (Dark Theme)*: Chuyển toàn bộ khung thanh công cụ từ `bg-slate-900` sang tone màu trắng sáng sang trọng `bg-white border-r border-slate-200 text-slate-800 shadow-sm`.
  - *Chuẩn Hóa Bộ Nhận Diện Sư Phạm Nền Sáng*:
    + Header và thanh lọc danh mục: Nền `bg-slate-50/90 border-slate-200`, chữ `text-slate-800`.
    + Nút môn học (Toán, Hóa, Lý, Ký hiệu): Nút kích hoạt `bg-cyan-600 text-white font-bold shadow-xs`, nút không kích hoạt `bg-white text-slate-600 hover:bg-slate-100 border-slate-200/80`.
    + Nút công thức: Nền sáng nhẹ `bg-slate-50 hover:bg-cyan-50/80 border border-slate-200 hover:border-cyan-400 text-slate-700 hover:text-cyan-900 shadow-2xs`.
    + Thẻ nổi 2 giây (Hover Card): Nền trắng mờ cao cấp `bg-white/98 text-slate-900 border-2 border-cyan-500 shadow-2xl`, khung KaTeX nền `bg-slate-50 text-cyan-900`.

- **Cây Thư Mục Accordion Toggles & Kho Tàng Ký Hiệu, Hợp Chất Đồ Sộ (`HierarchicalMathPalette.jsx`)**:
  - *Cấu Trúc Accordion Toggle Cây Thư Mục (Folder Tree Navigation)*:
    + Thay thế thanh cuộn ngang đơn điệu bằng các thư mục Accordion có thể mở/đóng linh hoạt (`ChevronDown` / `ChevronRight`).
    + Hiển thị nhãn đếm số lượng công thức trong từng mục (ví dụ: `12`, `14`, `16`).
    + Tên nút ngắn gọn, súc tích (chỉ chứa ký hiệu hoặc tên viết tắt: `a/b`, `√x`, `H₂SO₄`, `SO₄²⁻`, `NaOH`, `x²`, `∫`, `lim`, `sin`, `cos`...), bố trí lưới 2 cột gọn gàng, tăng gấp 5 lần mật độ hiển thị mà không gây rối mắt.
  - *Bổ Sung Thanh Tìm Kiếm Tức Thì (Instant Search Filter)*:
    + Tích hợp ô tìm kiếm `🔍 Tìm nhanh H2SO4, NaOH, √x, a/b, sin...` ở đầu sidebar, lọc trực tiếp hàng trăm công thức trong thời gian thực.
  - *Thư Viện Hóa Học & Toán Học Chuyên Sâu GDPT 2018*:
    + **Toán Học**: Đại số & Căn thức, Đạo hàm & Khảo sát hàm số, Tích phân & Giới hạn, Lượng giác, Mũ & Logarit, Hình học Không gian & Oxyz, Số phức & Xác suất.
    + **Hóa Học**: Axit vô cơ & hữu cơ, Bazơ & Kiềm, Muối, Oxit, Hợp chất hữu cơ, Cation & Anion, Số oxi hóa, Mũi tên phản ứng, Công thức tính nồng độ & mol.
    + **Vật Lý**: Dao động cơ, Sóng cơ & âm, Điện xoay chiều, Sóng ánh sáng & Lượng tử, Hạt nhân nguyên tử.
    + **Ký Hiệu & Logic**: Toàn bộ ký hiệu toán học, ký tự Hy Lạp, tập hợp và hệ phương trình.

- **Tự Động Nhảy Con Trỏ Về Cuối Dòng Khi Nhấp Khoảng Trống (Whitespace Click Focus - `WordStyleFormulaCanvas.jsx`)**:
  - Bổ sung hàm xử lý `handleLineRowClick` trên từng dòng văn bản: Nếu người dùng nhấp chuột vào vùng đệm trống bên phải hoặc khoảng trắng của dòng, hệ thống tự động tìm thẻ text cuối dòng, kích hoạt `focus()` và kéo con trỏ về cuối chữ bằng `Selection.collapse()`.

- **Loại Bỏ Nút "+ Thêm dòng mới" Dư Thừa & Xóa Bỏ Dấu Gạch Chéo Ngược Đuôi Dòng (`\`)**:
  - *Bỏ Nút Dư Thừa*: Thao tác bấm `Enter` đã hỗ trợ tách dòng mới mượt mà, loại bỏ nút bấm rườm rà dưới chân canvas.
  - *Xóa Sổ Ký Tự `\` Cuối Dòng*: Bổ sung hàm lọc `sanitizeLineText` và regex stripping trên `WordStyleFormulaCanvas.jsx` và `MathText.jsx`, loại bỏ hoàn toàn các ký tự `\` hoặc `/` thừa ở cuối câu.

- **Khắc Phục Lỗi Hiển Thị Emoji `📝`**:
  - Thay thế biểu tượng cảm xúc `📝` bằng các icon vector Lucide sắc nét (`FileEdit`, `FileText`, `BookOpen`, `AlertTriangle`, `Sparkles`), đảm bảo hiển thị 100% đồng nhất trên mọi hệ điều hành Windows và trình duyệt.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` hoàn thành 100% (**0 Error, 0 Warning**, hoàn tất trong 773ms trên Vite 8 và React 19).
  - Hỗ trợ phím Enter tách dòng tự nhiên như Microsoft Word.

- **Kiểm Thử Vận Hành (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn tất trong 777ms trên Vite 8 và React 19).

---

## [18/10/2026] - Khắc Phục Lỗi Render Markdown Đầu Dòng (Heading ###, In Đậm **, In Nghiêng ***) & Chuẩn Hóa Sư Phạm Phân Biệt STEM (Casio) vs Ngữ Văn / KHXH

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
      * **Khắc phục lỗi nút `+ AI Tạo Thêm 2 Bài Mẫu` sinh nhầm biến số `$X = 2,07$`**: Hàm `handleAddAiPracticeQuestions` trước đây hardcode mẫu bài toán định lượng STEM (phản ứng, khảo sát, đại lượng $X = 2,07$). Đã nâng cấp kiểm tra `isStem`: với môn Ngữ văn/KHXH, tự động sinh 2 câu hỏi rèn luyện L3 & L4 chuẩn mực về lập ý, phân tích luận điểm, nghệ thuật dẫn chứng và đánh giá tư tưởng nhân văn, loại bỏ hoàn toàn các biến số $X$ và thuật ngữ đại số.
  - *Nâng Cấp Bộ Bóc Tách Khối Sư Phạm (`parseTheoryRecapSections` & `parseSolutionMethodSections`)*:
    + Tự động giải phóng ký tự ngắt dòng `\n` thô (`unescapeLiteralNewlines`) trước khi match regex.
    + Mở rộng regex nhận diện cả icon `📄` và tiêu đề Ngữ văn `### 💡 Mẹo tư duy & Chiến thuật làm bài:`.

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

- **Kiểm Thử Đóng Gói (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn thành trong 2.30s trên Vite 8 và React 19).

---

## [17/10/2026] - Trình Soạn Thảo Ký Hiệu Trực Quan WYSIWYG (Không Lộ Mã Lệnh), Bộ Công Cụ Hóa Học & Toán Học Thực Tế Chèn Số & Tự Động Tính Toán Kết Quả (Interactive Smart Science Calculator), Loại Bỏ Hoàn Toàn Text In Preview Thụ Động, Tách Riêng Trang LaTeX Thuần, Bộ Renderer Đồ Thị Oxy / Bảng Biến Thiên Nội Sinh & Desmos Calculator

- **Trình Soạn Thảo Ký Hiệu Trực Quan WYSIWYG & Bộ Công Cụ Hóa Học / Toán Học Thực Tế (`CurriculumStudioEditor.jsx` & `InteractiveFormulaBuilderModal.jsx`)**:
  - *Giải Quyết Triệt Để Phàn Nàn Của Người Dùng Về Mã Code `\frac` ("frag")*:
    + Người dùng phản hồi việc nhìn thấy mã code LaTeX thô như `` `\frac{...}{...}` ``, `` `\lim` ``, `` `\Delta` ``, `` `$` `` trong khung soạn thảo gây ức chế, không giống trải nghiệm Microsoft Word, và yêu cầu công thức phải là ký hiệu thực sự có thể chèn số vào và tính toán.
    + **Chế Độ Ký Hiệu Trực Quan WYSIWYG (Mặc định)**: Toàn bộ nội dung bài học hiển thị 100% bằng ký hiệu toán học và hóa học chuẩn sách giáo khoa (phân số có thanh ngang tử/mẫu, căn thức, đạo hàm số gia, nồng độ mol), tuyệt đối không để lộ bất kỳ mã lệnh cú pháp `\frac` hay dấu `$` nào.
    + Nút chuyển đổi linh hoạt: `` `[Xem Ký Hiệu Thật (WYSIWYG)]` `` ⟷ `` `[Gõ Văn Bản Bàn Phím]` `` cho phép giáo viên tùy ý lựa chọn khi cần gõ văn bản thuần hoặc thao tác trực quan.
  - *Bộ Công Cụ Hóa Học Thực Tế: Chèn Số Vào Công Thức & Tự Động Tính Toán*:
    + **🧪 Nồng độ mol dung dịch ($C_M = \frac{n}{V}$)**: Nhập số mol $n$ (mol) và thể tích $V$ (Lít) -> Hệ thống tự động tính toán $C_M = n / V$ (M) và hiển thị ký hiệu thật `` `C_M = \frac{n}{V} = \frac{0.2}{0.5} = 0.4\text{ M}` ``.
    + **💧 Nồng độ phần trăm ($C\% = \frac{m_{ct}}{m_{dd}} \times 100\%$)**: Nhập $m_{ct}$ (g) và $m_{dd}$ (g) -> Tự động tính toán ra $C\%$.
    + **⚖️ Khối lượng chất ($m = n \times M$)**: Nhập số mol $n$ và khối lượng mol $M$ -> Tự động tính ra khối lượng $m$ (gam).
    + **⚡ Hiệu suất phản ứng ($H = \frac{m_{tt}}{m_{lt}} \times 100\%$)**: Nhập $m_{tt}$ (thực tế) và $m_{lt}$ (lý thuyết) -> Tự động tính ra $H\%$.
    + Tùy chọn chèn: Cho phép giáo viên lựa chọn chèn chỉ công thức thay số hoặc chèn toàn bộ chuỗi tính toán kèm đáp số hoàn chỉnh vào bài học.
  - *Bộ Tính Toán Phân Số & Đạo Hàm Số Gia Tự Động*:
    + **➗ Phân số tính toán ($A/B$)**: Nhập số vào ô Tử số và Mẫu số -> Tự động rút gọn và tính ra kết quả (ví dụ: `` `\frac{12}{4} = 3` ``).
    + **🎯 Đạo hàm bằng số gia ($f'(x_0) = \lim_{\Delta x \to 0}\frac{\Delta y}{\Delta x}$)**: Hỗ trợ nhập hàm số $f(x)$ và điểm $x_0$, tự động hiển thị quy trình số gia và tính toán ra kết quả đạo hàm như trong ví dụ SGK.
  - *Nút Thao Tác Nhanh Trên Thanh Ribbon Word Toolbar*:
    + Bổ sung 2 nút chuyên dụng: `` `🧪 Hóa Học & Nồng Độ` `` và `` `➗ Phân Số & Tính Toán` `` trên thanh công cụ của cả Khối 1 và Khối 2 để giáo viên mở nhanh bộ chèn số và tính toán chỉ với 1 click.

- **Trình Soạn Thảo Sư Phạm Trực Tiếp Kiểu Microsoft Word (Word Document Sheet Canvas - `CurriculumStudioEditor.jsx`)**:
  - *Chấm Dứt Hoàn Toàn Mô Hình Chia Ô Thụ Động Cũ ("Gõ Ô Trên - Preview Ô Dưới")*:
    + Theo phản hồi từ người dùng, mô hình chia 2 ô (ô nhập liệu phía trên và ô đọc chỉ xem "Text In Preview" phía dưới) làm đứt gãy luồng tư duy sư phạm và gây bất tiện khi phải cuộn lên cuộn xuống để sửa lỗi.
    + Xóa bỏ triệt để 100% các ô "Text In Preview" thụ động trên cả Khối 1 (Lý thuyết SGK) và Khối 2 (Phương pháp giải, Bẫy đề thi & Mẹo Casio).
  - *Trải Nghiệm Gõ & Sửa Trực Tiếp Tại Chỗ Như Microsoft Word (In-Place Document Canvas)*:
    + **Thanh Ribbon Word Toolbar Chuẩn Quốc Tế**: Tích hợp các nút định dạng văn bản trực quan: In đậm (Bold `` `**` ``), In nghiêng (Italic `` `*` ``), Tiêu đề (Heading `` `###` ``), Danh sách gạch đầu dòng (`` `-` ``), Danh sách đánh số thứ tự (`` `1.` ``).
    + **Tích Hợp Tiện Ích Toán Học STEM 1-Chạm**: Các nút chèn nhanh `` `✨ Điền Công Thức` `` (mở Interactive Formula Builder), `` `📊 Bảng Biến Thiên` `` (chèn preset SGK 3 dòng), `` `📈 Đồ Thị Hàm Số` `` (chèn đồ thị Oxy / Desmos), `` `🖼️ Dán (Ctrl+V) / Tải Ảnh` `` và nút `` `+ Thêm Bước mới` `` (tự động đếm số bước tiếp theo).
    + **Trang Giấy Word Canvas Trắng Tinh**: Thiết kế trang tài liệu chuẩn A4 có bóng đổ thanh lịch (`shadow-md border border-slate-300 rounded-2xl`), cho phép giáo viên gõ, xóa, chèn ảnh và sửa trực tiếp tại chỗ không giới hạn.
    + **Nút Chuyển Đổi Nhanh Linh Hoạt**: Cụm nút `` `✍️ Sửa Trực Tiếp` `` ⟷ `` `👁️ Xem Trang In / Học Sinh` `` ngay trên đầu trang giấy giúp giáo viên chuyển đổi chỉ trong 1 click để kiểm tra thành phẩm KaTeX thực tế mà học sinh sẽ nhìn thấy khi in hoặc học trực tuyến.
  - *Hộp Thẻ Cảnh Báo & Mẹo Casio Tương Tác Trực Tiếp*:
    + **Thẻ Bẫy Đề Thi ĐGNL**: Chuyển thành Thẻ Cảnh Báo Sư Phạm màu hồng ấm áp (`bg-rose-50/60 border-2 border-rose-200`), cho phép gõ và sửa trực tiếp nội dung bẫy đề thi bên trong thẻ, có nút chèn ký hiệu KaTeX và thêm nhanh mục bẫy.
    + **Thẻ Kỹ Thuật Casio & Mẹo Tư Duy Nhanh**: Chuyển thành Thẻ Mẹo Công Nghệ màu tím Indigo (`bg-indigo-50/60 border-2 border-indigo-200`), gõ và sửa trực tiếp bên trong thẻ, có nút chèn nhanh mẫu mẹo Casio `[Menu 8]` và phím tắt KaTeX.
  - *Tách Riêng Trang Mã Nguồn LaTeX Thuần Độc Lập Dành Cho AI*:
    + Tách biệt hoàn toàn thành một tab riêng biệt: `` `⚡ Trang Mã Nguồn LaTeX Thuần (Dành Cho AI)` ``, giao diện Dark Mode (`bg-slate-900`) chuyên dụng cho việc dán nhanh toàn văn mã nguồn Markdown / LaTeX thô từ ChatGPT, Gemini hoặc AI Engine.
    + Khi chuyển qua lại giữa Trang Mã Nguồn LaTeX và Trình Soạn Thảo Word Trực Tiếp, dữ liệu được tự động đồng bộ hai chiều mượt mà 100%.

- **Bộ Renderer Bảng Biến Thiên Nội Sinh Chuẩn SGK GDPT 2018 (`VariationTable.jsx`)**:
  - *Kết Cấu 3 Dòng Sư Phạm Chuẩn Mực*: Render bảng biến thiên vector HTML/SVG 3 dòng phân định sắc nét gồm: dòng `` `x` ``, dòng dấu đạo hàm `` `y'` ``, dòng chiều biến thiên `` `y` `` với mũi tên dốc lên `` `\nearrow` `` và dốc xuống `` `\searrow` ``.
  - *Xóa Bỏ Nhược Điểm Ảnh Scan Mờ Nhòe*: Hiển thị vector sắc nét 100% trên mọi độ phân giải màn hình (Retina / 4K), hỗ trợ đầy đủ các ký hiệu toán học đặc biệt như vô cực (`` `-\infty` ``, `` `+\infty` ``), vạch kép không xác định `` `||` ``, điểm cực đại, cực tiểu.
  - *Parser Chuẩn Hóa Cú Pháp Khối*: Tự động bóc tách khối nội dung dạng `` `[VARIATION_TABLE]...[/VARIATION_TABLE]` `` với cấu trúc dòng `` `x: ...` ``, `` `y_prime: ...` ``, `` `y: ...` ``.

- **Bộ Renderer Đồ Thị Hàm Số Oxy & Tích Hợp Đồ Thị Tương Tác Desmos Calculator (`MathGraphView.jsx`)**:
  - *Đồ Thị Hàm Số Vector SVG*: Tự động vẽ hệ trục toạ độ Oxy, gốc toạ độ O, mũi tên định hướng, lưới toạ độ phụ (grid), vạch chia đơn vị toạ độ, và đường cong giải tích liên tục cho các hàm số toán học THPT phổ biến:
    + Hàm bậc 3: `` `y = ax^3 + bx^2 + cx + d` ``
    + Hàm phân thức bậc nhất trên bậc nhất: `` `y = \frac{ax+b}{cx+d}` `` (tự động vẽ 2 đường tiệm cận đứng và tiệm cận ngang dạng nét đứt màu đỏ / xanh)
    + Hàm trùng phương: `` `y = ax^4 + bx^2 + c` ``
    + Parabol bậc 2: `` `y = ax^2 + bx + c` ``
  - *Dóng Nét Đứt Tọa Độ Cực Trị*: Tự động dóng đường nét đứt (dashed line) từ điểm cực đại `` `(x_{CĐ}; y_{CĐ})` `` và cực tiểu `` `(x_{CT}; y_{CT})` `` vuông góc về 2 trục tọa độ Ox, Oy kèm nhãn tọa độ KaTeX rõ nét.
  - *Tích Hợp Đồ Thị Tương Tác Chuẩn Quốc Tế Kiểu MATLAB / Desmos*: Bổ sung nút chuyển đổi 1-chạm giữa chế độ SVG tĩnh và chế độ **Interactive Desmos Graphing Calculator** (nhúng iframe Desmos trực quan), cho phép giáo viên và học sinh trực tiếp zoom in/out, pan chuyển động, tra cứu toạ độ điểm cực trị, tiếp tuyến và nghiệm của phương trình toán học một cách sinh động, chuyên nghiệp.
  - *Hỗ Trợ Cú Pháp Khối Đồ Thị*: Nhận diện thẻ `` `[GRAPH: type=cubic | formula=y=x^3-3x+1 | cd=(1,4) | ct=(-1,0)]` ``.

- **Bộ Nhận Diện & Render Toán Học Toàn Cục (`MathText.jsx`)**:
  - Mở rộng regex tách khối nhận diện song song cả khối `` `[VARIATION_TABLE]...[/VARIATION_TABLE]` `` và thẻ `` `[GRAPH: ...]` ``.
  - Tự động mount `<VariationTable />` và `<MathGraphView />` đồng bộ trên toàn bộ nền tảng: Khối 1 (Lý thuyết nền tảng), Khối 2 (Phương pháp giải), Khối 4 (Đề bài câu hỏi mẫu, Lời giải chi tiết) và Khung Trợ lý Gia sư AI Socratic.

- **Trình Điền Công Thức & Đồ Thị Trực Quan Cho Giảng Viên (Click-to-Fill Formula Builder - `InteractiveFormulaBuilderModal.jsx`)**:
  - *Giải Phóng Giảng Viên Khỏi Rào Cản Mã LaTeX Thô*: Giảng viên không cần nhớ hoặc gõ các đoạn mã cú pháp phức tạp như `` `\frac{a}{b}` ``, `` `\sqrt[n]{x}` ``, `` `\int_{a}^{b} f(x)dx` ``.
  - *Trải Nghiệm Click-to-Fill Dễ Dàng*: Giảng viên chỉ cần nhấp vào công thức mong muốn, hệ thống sẽ mở modal chuyên biệt với các ô điền số / ký tự tương ứng:
    + Phân số: Điền ô Tử số và ô Mẫu số.
    + Căn thức: Điền ô Bậc căn và ô Biểu thức dưới căn.
    + Lũy thừa / Chỉ số: Điền Cơ số, Số mũ trên, Chỉ số dưới.
    + Tích phân: Điền Cận dưới, Cận trên, Biểu thức hàm số `` `f(x)` ``, Biến vi phân `` `dx` ``.
    + Giới hạn: Điền Biến tiến tới (ví dụ: `` `x \to x_0` ``) và Biểu thức.
    + Hệ phương trình: Điền Phương trình 1, Phương trình 2.
    + Bảng biến thiên SGK: 4 mẫu Presets phổ biến (Bậc 3 `` `a > 0` ``, Bậc 3 `` `a < 0` ``, Phân thức `` `ad - bc > 0` ``, Trùng phương) kèm tuỳ chỉnh các dòng tọa độ.
    + Đồ thị hàm số: Chọn dạng hàm, phương trình toán học và toạ độ cực trị.
  - *Khung Xem Trước KaTeX Thời Gian Thực (Live Preview)*: Cập nhật trực quan công thức toán học ngay khi gõ từng con số; phím tắt `` `Ctrl + Enter` `` để chèn tức thì vào vị trí con trỏ chuột, phím `` `Esc` `` để đóng.

- **Cơ Chế Dán Trực Tiếp Ảnh Chụp Màn Hình (Ctrl+V) & Tải Tệp Minh Họa Đề Thi (`CurriculumStudioEditor.jsx`)**:
  - Bắt sự kiện clipboard `` `onPaste` `` trên toàn bộ các khung soạn thảo (Lý thuyết Khối 1, Phương pháp giải Khối 2, Bẫy đề thi, Mẹo Casio, Đề bài mẫu Khối 4, Lời giải mẫu Khối 4).
  - Tự động phát hiện Blob hình ảnh từ Snipping Tool, Zalo, clipboard và chuyển đổi sang Base64 Data URL qua `` `FileReader` ``, chèn ngay cú pháp Markdown ảnh `` `![Ảnh minh họa](data:image/...)` `` vào đúng vị trí con trỏ.
  - Bổ sung nút bấm `` `🖼️ Dán/Tải Ảnh` `` trên thanh công cụ nhanh của mọi khối soạn thảo để tải ảnh minh họa trực tiếp từ máy tính.
  - Đính kèm đầy đủ thanh công cụ tiện ích nhanh: `` `✨ Điền Công Thức` ``, `` `📊 Bảng Biến Thiên` ``, `` `📈 Đồ Thị Hàm Số` ``, `` `🖼️ Dán/Tải Ảnh` ``.

- **Tinh Chỉnh Kích Thước Tinh Gọn, Thoáng Đãng & Thiết Kế Mật Độ Cao Cho Panoramic Workspace Modal (`CurriculumExplorerView.jsx`)**:
  - *Giải Quyết Tình Trạng To Phồng & Rối Mắt*: Người dùng phản hồi giao diện modal bóc tách toàn cảnh 3 cột có kích thước các thành phần khá to (padding `p-4`, `p-5`, font chữ lớn, card bài mẫu và các ô đáp án chiếm nhiều diện tích), gây choán ngợp khi hiển thị danh sách 5 bài học, 10 dạng bài và 40 câu hỏi.
  - *Thiết Kế Lại Theo Tiêu Chuẩn Compact & High-Density Studio UI*:
    + **Header & Summary Banner**: Thu gọn padding từ `p-4 sm:p-5` xuống `px-4 py-2.5 sm:px-5 sm:py-3`, icon Wand giảm còn `w-8 h-8`, title `text-xs sm:text-sm font-extrabold`. Banner thành công giảm padding xuống `px-4 py-2`, icon Check `w-7 h-7`, nút "Phân Tích Tệp Khác" thanh mảnh `px-2.5 py-1 text-[11px]`.
    + **Cột 1 (Điều Hướng Phân Cấp - 4 Cols / 33%)**: Thu gọn Tầng 1 (Chương & Bài học) với padding `p-2.5`, chữ bài học `text-[11px]`, badge số dạng và bài mẫu `text-[9.5px]`. Tầng 2 (Dạng bài học thuật) tối ưu card dạng bài thành `p-2 rounded-xl text-[11px]`, font tiêu đề `text-[11px] leading-snug`, badge phân loại/trọng số/số bài `text-[9px] px-1.5 py-0.2`, nút mở Studio `text-[10px]`.
    + **Cột 2 (Khối 1 & Khối 2 - Sư Phạm Nền Tảng)**: Header dạng bài tinh gọn `px-4 py-2`, nút "Mở Trong Studio Sư Phạm" thu nhỏ `px-2.5 py-1 text-[11px]`. Các ô Định lý SGK, Ví dụ minh họa, Thuật toán giải Khối 2, Bẫy đề thi và Casio giảm padding còn `p-2.5` và `p-2`, font chữ `text-[11px]`, giúp bao quát toàn bộ lý thuyết và phương pháp mà không cần cuộn trang nhiều lần.
    + **Cột 3 (Khối 4 - Ngân Hàng Bài Mẫu Chuyên Sâu)**: Thanh tabs cấp độ Bloom và pills câu hỏi (Câu 1, Câu 2...) thu gọn chiều cao với padding `py-0.5` / `py-1`, text `text-[10.5px]`. Lưới 4 phương án A-B-C-D được tối ưu với padding `p-1.5 px-2 rounded-lg text-[11px]`, badge chữ cái `w-3.5 h-3.5 text-[9px]`, khung lời giải chi tiết `p-2.5 text-[11px]`.
    + **Modal Footer**: Giảm padding còn `px-4 py-2 sm:px-5 sm:py-2.5`, kích thước các nút Đóng / Nạp PostgreSQL vừa vặn, thanh lịch.
  - *Trải Nghiệm Trực Quan*: Toàn bộ modal thu gọn ~30% thể tích, hiển thị sắc nét, thoáng đãng, chuyên nghiệp và tối ưu hóa không gian hiển thị thông tin học thuật.

- **Kiểm Thử Đóng Gói Toàn Diện (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn thành trong 829ms trên Vite 8 và React 19).

---

## [16/10/2026] - Tái Cân Đối Bố Cục Không Gian Panoramic Workspace, Thẻ Ví Dụ Minh Họa SGK & Bài Toán Mẫu Áp Dụng (Khối 1 & Khối 2), Mở Rộng Ngân Hàng Bài Mẫu Chuyên Sâu Đa Cấp Độ

- **Tích Hợp Khối Thẻ Ví Dụ Minh Họa SGK (Khối 1) & Bài Toán Mẫu Áp Dụng Phương Pháp (Khối 2) Chuẩn Sư Phạm**:
  - *Tách Biệt Nội Dung Bằng Parser Chuyên Sâu (`CurriculumStudioEditor.jsx`)*:
    + Bổ sung hàm xuất khẩu `parseTheoryRecapSections`: Phân tách chuỗi `theoryRecap` thành `{ theory, example }` dựa trên điểm neo `### 📌 Ví dụ minh họa SGK:`.
    + Nâng cấp hàm xuất khẩu `parseSolutionMethodSections`: Phân tách chuỗi `solutionMethod` thành `{ method, sampleProblem, traps, casio }` sử dụng regex lookahead phân định rõ ràng giữa các bước giải thuật, `### 📝 Bài toán mẫu áp dụng phương pháp:`, `### ⚠️ Các bẫy đề thi`, và `### 💡 Kỹ thuật Casio & mẹo tư duy nhanh`.
  - *Hiển Thị Thẻ Trực Quan Độc Lập Nổi Bật (`CurriculumExplorerView.jsx`)*:
    + **Khối 1 (Kiến Thức Nền Tảng SGK)**: Bên dưới phần định lý và công thức, bố trí Thẻ **📌 Ví Dụ Minh Họa SGK** với viền gradient Emerald/Teal dịu mát, huy hiệu "VÍ DỤ SGK", bài toán ngữ cảnh và lời giải KaTeX từng bước.
    + **Khối 2 (Phương Pháp Giải Chi Tiết & Bẫy)**: Bên dưới các bước giải thuật (Bước 1, Bước 2, Bước 3...), hiển thị Thẻ **📝 Bài Toán Mẫu Áp Dụng Phương Pháp** với viền gradient Amber/Orange ấm áp, huy hiệu "BÀI TOÁN MẪU ÁP DỤNG", minh họa cách áp dụng trực tiếp thuật toán vào bài tập cụ thể, đặt trước khối Callout Bẫy đề thi (Rose Alert) và Mẹo Casio (Indigo Tip).
    + Toàn bộ nội dung công thức, phương trình phản ứng hóa học và ký hiệu được render mượt mà qua `<MathText />`.
- **Tái Cân Đối Toàn Diện Bố Cục Không Gian Panoramic Workspace (`CurriculumExplorerView.jsx`)**:
  - *Giải Quyết Triệt Để Tình Trạng Mất Cân Đối*: Xóa bỏ hoàn toàn bố cục 3 cột cũ gây lệch diện tích (Cột 1 và Cột 2 bị trống 70% không gian đáy, Cột 3 dồn toàn bộ 4 khối sư phạm cuộn dài vô tận).
  - *Chuyển Đổi Sang Bố Cục 2 Phân Vùng Cân Xứng (2-Master-Pane Layout)*:
    - **Phân Vùng 1: Cột Trái Điều Hướng Phân Cấp (4 Cols / ~33% width)**:
      + *Tầng 1 (Cây Chương & Bài Học)*: Chiếm tối đa 40% chiều cao, hiển thị danh sách Chương và Bài học với badge tổng hợp số lượng Dạng bài và tổng số Bài toán mẫu (`X dạng • Y bài mẫu`).
      + *Tầng 2 (Danh Mục Dạng Bài Của Bài Học)*: Chiếm 60% chiều cao còn lại với thanh cuộn độc lập, tích hợp bộ lọc Bloom L1 - L4, hiển thị badge phân loại, trọng số và **huy hiệu nổi bật số lượng bài mẫu chuyên sâu (`🎯 X bài mẫu chuyên sâu`)**.
    - **Phân Vùng 2: Khung Chính Chi Tiết Sư Phạm & Ngân Hàng Bài Mẫu (8 Cols / ~67% width)**:
      + *Top Banner Thống Kê Tổng Lực*: Hiển thị tự động tổng số bài tập mẫu chuyên sâu trên toàn bộ chuyên đề: `X Chương • Y Bài học • Z Dạng bài chi tiết • W Bài tập mẫu chuyên sâu`.
      + *Khung Chia Đôi Song Song 2 Cột Cân Đối (50% - 50%)*:
        * **Cột Trái (Kiến Thức & Phương Pháp Sư Phạm)**: Hiển thị Khối 1 (Lý thuyết SGK nền tảng & Thẻ Ví Dụ Minh Họa SGK), Khối 2 (Phương pháp giải, Thẻ Bài Toán Mẫu Áp Dụng Phương Pháp, Bẫy đề thi ĐGNL Rose Alert, Mẹo Casio Indigo Tip), và Khối 3 (Thời lượng video bài giảng khuyến nghị).
        * **Cột Phải (Ngân Hàng Bài Mẫu & Luyện Tập Chuyên Sâu - Khối 4)**: Hiển thị toàn bộ bộ sưu tập 4 câu hỏi trắc nghiệm chuẩn Bloom L1-L4.
- **Tính Năng Động: Sinh Thêm Bài Tập Rèn Luyện AI Tức Thì (`+ AI Tạo Thêm 2 Bài Mẫu`)**:
  - Tích hợp nút bấm gradient tím-xanh `+ AI Tạo Thêm 2 Bài Mẫu` ngay trên header của Khối 4.
  - Cho phép giáo viên nhấp 1 phát để sinh tức thì 2 bài tập rèn luyện (L3 Vận dụng & L4 Vận dụng cao) bám sát lý thuyết và phương pháp giải của dạng bài hiện tại.
  - Tự động cập nhật tổng số câu hỏi trên thanh tab và focus ngay vào câu hỏi mới sinh.
- **Bộ Chuyển Đổi Câu Hỏi Mẫu Tương Tác & Bộ Lọc Cấp Độ Bloom Thông Minh (Khối 4)**:
  - Thanh bộ lọc Bloom theo tab trực quan: `[Tất cả (14)]`, `[L1: Nhận biết (2)]`, `[L2: Thông hiểu (2)]`, `[L3: Vận dụng (5 câu)]`, `[L4: Vận dụng cao (5 câu)]`.
  - Giúp giáo viên nhanh chóng lọc và duyệt riêng từng nhóm câu hỏi, đặc biệt là nhóm 4-5 câu Vận dụng (L3) và Vận dụng cao (L4) mà không bị choáng ngợp hay rối mắt.
  - Thanh tab pills trực quan cho từng câu hỏi trong nhóm được chọn: `[Câu 1 • L1: Nhận biết]`, `[Câu 2 • L2: Thông hiểu]`, `[Câu 3 • L3: Vận dụng]`, `[Câu 4 • L4: Vận dụng cao]`...
  - Hiển thị đầy đủ: Đề bài KaTeX, lưới 4 phương án A-B-C-D với phương án đúng được viền xanh ngọc Emerald kèm icon Check, và khung Lời giải chi tiết KaTeX từng bước.
  - Tích hợp thanh điều hướng phân trang câu hỏi `← Câu trước` / `Câu tiếp theo →`.
  - Hiển thị thẻ phân bổ chi tiết mật độ câu hỏi ở Pane 1: `(L1: 2 • L2: 2 • L3: 5 • L4: 5)` và `Chuẩn ĐGNL: L3 (5 câu) • L4 (5 câu)`.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn thành trong 732ms).

---

## [15/10/2026] - Nâng Cấp Cây Tri Thức Phân Cấp 3 Tầng, Studio Sư Phạm Chuyên Sâu (Curriculum Studio Editor), Bàn Phím KaTeX STEM 10 Danh Mục, Không Gian Bóc Tách Khổ Lớn 3 Cột, Khắc Phục Lỗi Màn Trắng & KaTeX

- **Kiến Trúc Soạn Thảo Đa Chế Độ: Soạn Thảo Trực Quan (Text In Preview Chuẩn Học Sinh) Song Hành Mã Nguồn LaTeX Thuần (Nhập Nhanh Từ AI) (`CurriculumStudioEditor.jsx`)**:
  - *Giải Phóng Giáo Viên Khỏi Rào Cản Kỹ Thuật*: Không ép buộc giáo viên phải cắt vụn bài giảng thành 4 ô form rời rạc (Định nghĩa, Công thức, Quy tắc, Hình ảnh) gây mất mạch tư duy sư phạm. Hệ thống trang bị 2 chế độ soạn thảo chuyên sâu:
    1. Chế độ **Soạn Thảo Trực Quan (Text In Preview - Chuẩn Học Sinh)** (Mặc định):
       - Cho phép giáo viên soạn thảo tự nhiên, hỗ trợ chèn nhanh cấu trúc: `+ Khối công thức $$...$$`, `+ Gạch đầu dòng`.
       - Tích hợp trực tiếp **Khung Hiển Thị Trực Quan (Text In Preview - Giao Diện Học Sinh Thấy)** song hành ngay bên dưới ô soạn thảo. Khung này sử dụng `<MathText />` render thời gian thực các công thức toán học KaTeX thật (phân số, căn thức, giới hạn, tích phân, đồ thị minh họa), mô phỏng chuẩn xác 100% thẻ lý thuyết mà học sinh sẽ trải nghiệm.
    2. Chế độ **Mã Nguồn LaTeX Thuần (Nhập Nhanh Từ AI)**:
       - Trang bị khung soạn thảo monospace nền tối chuyên dụng, tối ưu cho thao tác copy-paste nhanh 1-chạm kết quả trích xuất từ Gemini / ChatGPT / AI Engine mà không phải chuyển đổi thủ công.
  - *Cơ Chế Chèn Ký Hiệu KaTeX STEM Chuẩn Xác Tại Vị Trí Con Trỏ (Cursor-Precision Insertion Engine)*:
    - Bổ sung `useRef` quản lý `textareaRefs` theo dõi vị trí con trỏ chuột (`selectionStart` / `selectionEnd`) trên từng ô soạn thảo đang active.
    - Khi giáo viên click vào bất kỳ ký hiệu nào trên Bảng KaTeX STEM 10 danh mục (hơn 120+ công thức toán học), công thức tự động chèn đúng vào vị trí con trỏ chuột đang đứng và tự động khôi phục focus, chấm dứt hoàn toàn hiện tượng công thức bị nối đuôi về cuối văn bản.
  - *Áp Dụng Cho Cả Khối 1 (Lý Thuyết Nền Tảng) & Khối 2 (Phương Pháp Giải Chuyên Biệt)*:
    - Ở Khối 2, chế độ trực quan cung cấp khung soạn bước giải kèm xem trước thẻ Bẫy đề thi ĐGNL (Rose Alert) và Mẹo Casio (Indigo Tip) sống động, song song với chế độ mã nguồn LaTeX thuần để nạp nhanh từ AI.

- **Tái Cấu Trúc Toàn Diện Động Cơ Render KaTeX & Sửa Triệt Để Lỗi Vỡ Dòng Văn Bản (`MathText.jsx`)**:
  - *Nguyên Nhân Vỡ Dòng Từng Chữ (Sentence Shattering Root Cause)*: Trước đó, hàm `MathText` chia chuỗi toàn cục theo ký tự phân cách toán học trước, sau đó bọc mỗi mẩu text trung gian (dấu phẩy, dấu chấm, dấu ngoặc, từ ngữ) vào một thẻ `display: block` (`span className="block leading-relaxed"`). Điều này khiến câu văn bị xé nhỏ thành hàng chục dòng dọc riêng biệt cho từng dấu chấm, dấu phẩy và công thức toán.
  - *Tách Biệt Hai Tầng Render (Line-Level vs Inline-Level)*: Tái cấu trúc kiến trúc phân tích thành 2 tầng độc lập:
    1. Tầng dòng (Line-Level): Chỉ bóc tách các dòng ngắt `\n` thực sự, nhận diện Khối cảnh báo Callout (`### ⚠️`, `### 💡`), Dòng bước giải (`Bước 1:`, `**Bước 1:**`), và Danh sách dấu chấm/dấu gạch.
    2. Tầng nội dòng (Inline-Level): Toàn bộ văn bản, công thức toán (`$...$`, `\(...\)`), chữ in đậm (`**...**`), và ảnh Markdown (`![alt](url)`) bên trong một dòng đều được render dưới dạng inline thuần túy (`<span>`, `<strong>`, `<img>`), tuyệt đối không chứa thẻ `block` nào, đảm bảo câu văn và công thức toán học/hóa học tuôn chảy mượt mà trên cùng một dòng.
  - *Khắc Phục Lỗi Trùng Lặp Bullet (`• - `)*: Cập nhật biểu thức chính quy bóc tách danh sách để cắt bỏ hoàn toàn dấu gạch ngang đầu dòng `- ` hoặc bullet trùng lặp, chỉ hiển thị duy nhất 1 bullet chấm tròn màu Indigo `•` thanh lịch, thẳng hàng hoàn hảo.
  - *Khắc Phục Triệt Để Ký Tự Thoát `\n` Bị Hiển Thị Thô*:
    - Trước đó, biểu thức `replace(/\\n(?![a-zA-Z])/g, '\n')` chặn tất cả các chữ cái đứng sau `\n`, dẫn đến các từ tiếng Việt như `\nTrong`, `\nKiểm`, `\nBước 2:` không bao giờ được unescape mà hiển thị trần trụi dạng text thô `.\nTrong` và `.\nBước`.
    - Nâng cấp negative lookahead chính xác chỉ bảo vệ đúng 15 lệnh LaTeX thực sự bắt đầu bằng `\n` (`` `\neq` ``, `` `\notin` ``, `` `\nabla` ``, `` `\nu` ``, v.v.), giải phóng 100% các từ tiếng Việt và ngắt dòng thực sự, giúp chia đoạn và chia bước giải rõ ràng, ngăn nắp.
    - Xuất hàm helper `unescapeLiteralNewlines` đồng bộ vào `CurriculumStudioEditor.jsx` để textarea nhập liệu cũng tự động giải phóng `\n` thành Enter xuống dòng thực tế, giúp giảng viên soạn thảo cực kỳ trực quan.
  - *Tự Động Nhận Diện & Bọc KaTeX Cho Công Thức Hóa Học & Ion Đa Nguyên Tử*:
    - Tự động bọc KaTeX cho các ion đơn/đa nguyên tử có điện tích: `` `H^+` ``, `` `OH^-` ``, `` `SO_4^{2-}` ``, `` `NO_3^-` ``, `` `Fe^{3+}` ``, `` `Na^+` ``.
    - Tự động bọc KaTeX cho các hợp chất có chỉ số dưới: `` `H_2O` ``, `` `H_2SO_4` ``, `` `HNO_3` ``, `` `CO_2` ``, `` `Fe_2O_3` ``, `` `KMnO_4` `` ngay cả khi người dùng hoặc AI không gõ cặp dấu `$`.
  - *Hỗ Trợ Danh Sách Thụt Lề & Phân Cấp*: Hỗ trợ thụt lề nhiều cấp cho danh sách lồng nhau và danh sách đánh số (`1.`, `2)`).
  - *Xử Lý Inline Thông Minh*: Đối với các chuỗi ngắn không chứa cấu trúc dòng (như phương án trắc nghiệm A-D, tiêu đề, công thức rời), `MathText` tự động render dưới dạng `<span>` nội dòng để tránh vi phạm cấu trúc DOM React (`div cannot appear as child of span`).
- **Khắc Phục Triệt Để Lỗi Hiển Thị KaTeX & Chuỗi Ký Tự (`MathText.jsx`)**:
  - Xử lý triệt để ký tự thoát `\n\n` bị hiển thị thô thành text (`str.replace(/\\n/g, '\n')`).
  - Tự động bọc KaTeX cho các lệnh LaTeX độc lập (`\Delta`, `\frac`, `\lim`, `\int`, `\alpha`, `x_0`, v.v.) nằm ngoài khối `$...$`, loại bỏ hoàn toàn tình trạng mã LaTeX xuất hiện dạng chuỗi code thô.
  - Bóc tách và render các khối Callout cảnh báo sư phạm (`### ⚠️ Các bẫy đề thi:` thành thẻ cảnh báo Rose Alert, `### 💡 Mẹo Casio:` thành thẻ mẹo Indigo Tip) và các bước giải nổi bật `**Bước X:**`.
- **Bàn Phím Ảo & Bảng Ký Hiệu Công Thức KaTeX STEM Chuyên Sâu 10 Danh Mục (`CurriculumStudioEditor.jsx`)**:
  - Mở rộng từ 10 ký tự cơ bản lên hơn 120+ công thức toán học chuyên sâu trải dài 10 danh mục:
    1. Đại số & Giải tích cơ bản
    2. Đạo hàm & Tiếp tuyến
    3. Tích phân & Giới hạn
    4. Mũ & Logarit
    5. Lượng giác
    6. Hình học & Không gian Oxyz (vectơ, tích có hướng, khoảng cách, mặt cầu)
    7. Hệ phương trình & Dấu ngoặc
    8. Tập hợp & Logic
    9. Ký tự Hy Lạp (Alpha, Beta, Delta, Omega, Pi, Theta...)
    10. Xác suất & Thống kê (Chỉnh hợp, Tổ hợp, Xác suất có điều kiện, Kỳ vọng, Phương sai)
  - Render trực tiếp KaTeX sống động trên từng nút bấm preview.
  - Thêm bộ chọn mục tiêu chèn thông minh (`Khối 1: Nền tảng SGK`, `Khối 2: Phương pháp giải`, `Bẫy đề thi`, `Mẹo Casio`, `Khối 4: Câu hỏi mẫu`, `Lời giải mẫu`) tự động theo dõi con trỏ focus của người dùng và hỗ trợ chèn ở cả Khối 1, Khối 2 và Khối 4.
  - Bổ sung hàm regex `parseSolutionMethodSections` tự động bóc tách các mục nhúng `### ⚠️` và `### 💡` vào đúng các ô nhập liệu chuyên biệt.
- **Không Gian Làm Việc Bóc Tách Tài Liệu Khổ Lớn Toàn Màn Hình 3 Cột (Fullscreen Panoramic Ingestion Studio - `CurriculumExplorerView.jsx`)**:
  - Nâng cấp modal chật hẹp cũ thành Workspace Studio kích thước cực đại (`max-w-[1580px] h-[95vh]`).
  - Hỗ trợ tài liệu lớn (sách 99+ trang, giáo trình chuyên đề) với bộ lọc phạm vi trang linh hoạt: `Toàn bộ tài liệu` hoặc `Chỉ định phạm vi trang` (`startPage` đến `endPage`), tránh tràn RAM và giới hạn token.
  - Bổ sung tùy chọn độ sâu phân tích (`Mặc định` hoặc `Chuyên sâu ĐGNL VNU-HCM & TN THPT (Chi tiết từng dạng & bẫy)`).
  - Layout 3 cột trực quan chuyên nghiệp:
    - Cột 1: Cây mục lục Chương & Bài học (kèm thống kê tổng số Dạng bài).
    - Cột 2: Danh mục Dạng bài học thuật theo bài học được chọn, tích hợp bộ lọc mức độ Bloom (Tất cả, L1, L2, L3, L4).
    - Cột 3: Chi tiết dạng bài & Thanh tra KaTeX sống động (Live KaTeX Pattern Inspector) xem trước 4 khối sư phạm và mở trực tiếp vào Studio.
- **Phân Hệ AI Bóc Tách Tài Liệu (PDF/DOCX) & Tự Động Nhận Diện Dạng Bài Sư Phạm (`CurriculumExplorerView.jsx`, `aiService.js`)**:
  - *Bộ Tiếp Nhận Đa Định Dạng Tài Liệu*: Hỗ trợ kéo & thả tệp sách giáo khoa hoặc tài liệu chuyên đề (.pdf, .docx, .txt) hoặc nhập trích đoạn mục lục/chuyên đề với thanh tiến trình trực quan 4 bước: `1. Đọc tệp & OCR` -> `2. Phân tích Chương - Bài` -> `3. Nhận diện Dạng bài` -> `4. Chuẩn hóa KaTeX`.
  - *Móc Nối API Gateway & AI Engine*: Tích hợp `aiService.extractCurriculumFromDocument` gọi trực tiếp `POST /api/ai-engine/curriculum/extract` (.NET 9 C#).
  - *Khu Vực Duyệt Dạng Bài Trực Quan (Pattern Showcase Accordion)*: Hiển thị toàn bộ cây tri thức bóc tách được (Số chương, số bài, số dạng bài), kèm các huy hiệu nhận diện phân loại dạng toán, cấp độ Bloom, kỹ năng cốt lõi và xem trước 4 khối sư phạm (Nền tảng SGK, Phương pháp KaTeX từng bước, Đề thi trắc nghiệm mẫu).
  - *Chuyển Tiếp Trực Tiếp Vào Studio*: Tích hợp nút "Mở Trong Studio" trên từng Dạng bài bóc tách được, cho phép giảng viên nhảy thẳng vào Studio toàn màn hình để kiểm tra, tinh chỉnh và thêm hình ảnh minh họa trước khi lưu vào CSDL.
  - *Nạp Trực Tiếp Vào PostgreSQL*: Nút "Nạp Vào CSDL PostgreSQL" gọi `contentService.importCurriculum` (`POST /api/content/curriculum/import`) lưu toàn bộ cây phân cấp vào database với 0 giá trị hardcode.
- **Trợ Lý AI Tri Thức Nhận Diện & Chuẩn Hóa Dạng Bài Trong Studio (`CurriculumStudioEditor.jsx`)**:
  - *Tích Hợp API `aiService.analyzePatternWithAi`*: Nút bấm **"AI Nhận Diện Dạng Bài"** gửi tên dạng bài hiện tại lên động cơ AI Knowledge (`POST /api/v1/documents/analyze-pattern`).
  - *Tự Động Điền & Tối Ưu Nội Dung Sư Phạm*: Tự động nhận diện bản chất toán học (Tham số m, Cực trị, Tiệm cận, Tối ưu thực tế, Không gian Oxyz...), điền quy trình 4 bước KaTeX, bẫy đề thi ĐGNL thường gặp, mẹo Casio fx-580/fx-880 và sinh câu hỏi trắc nghiệm chuẩn Bloom kèm lời giải chi tiết.
  - *Banner Phân Loại Sư Phạm*: Hiển thị banner chuyên nghiệp ghi rõ phân loại dạng bài, kỹ năng cốt lõi và cấp độ Bloom.
- **Khắc Phục Triệt Để Lỗi Màn Trắng (White Screen Fix) & Tăng Cường Bền Vững Runtime**:
  - Khắc phục `ReferenceError: weakPrerequisites is not defined` tại `CurriculumExplorerView.jsx:1303` bằng cách bổ sung bộ lọc dạng bài tiên quyết vùng trũng `<10%` đồng bộ từ `skillMasteryMap`.
  - Bọc `RootErrorBoundary` toàn cục tại `src/main.jsx` bắt mọi ngoại lệ render của React, hiển thị giao diện báo lỗi chi tiết cùng nút khôi phục reload/xóa cache.
  - Bổ sung type safety cho `MathText.jsx` với kiểm tra nghiêm ngặt `typeof text !== 'string'`.
  - Mở rộng hiển thị tab Lộ trình (`roadmap`) trên `App.jsx` cho mọi vai trò (Học sinh, Giáo viên, Quản trị viên).

- **Triển Khai Studio Sư Phạm Chuyên Sâu Toàn Diện (Curriculum Studio Editor & Authoring Environment)**:
  - Đáp ứng yêu cầu nghiệp vụ chuyên sâu của giảng viên: thay vì modal nhập liệu đơn sơ chật hẹp, chuyển đổi sang không gian Studio toàn màn hình (`CurriculumStudioEditor.jsx`) hỗ trợ tải nặng và đa dạng nội dung:
    - *3 Chế Độ Xem Linh Hoạt (View Mode Switcher)*:
      + `Biên soạn (Editor)`: Toàn màn hình tập trung soạn thảo lý thuyết, bẫy đề thi, Casio và câu hỏi.
      + `Chia đôi (Split 50-50)`: Nửa trái soạn thảo - nửa phải hiển thị Live Preview tức thời theo thời gian thực.
      + `Review Học sinh (Live Preview)`: Mô phỏng chính xác 100% giao diện học sinh nhìn thấy và trải nghiệm học tập dạng bài.
    - *Bảng Ký Tự Toán Học Đa Chủ Đề (KaTeX Palette)*: Phân loại theo 3 nhóm chuyên sâu: Đại số & Giải tích, Hình học & Không gian Oxyz, Logic & Tập hợp.
    - *Bộ Công Cụ Chèn Hình Ảnh & Thư Viện Đồ Thị (Diagram Gallery & Image Uploader)*: Hỗ trợ chèn trực tiếp link hình ảnh đồ thị hàm bậc ba, bảng biến thiên, hình chóp tam giác S.ABC, hệ trục Oxyz vào các khối lý thuyết và đề bài trắc nghiệm.
    - *Nâng Cấp Động Cơ Render Toán Học (`MathText.jsx`)*: Bổ sung bộ phân tích và render Markdown Image `![alt](url)` tự động, hiển thị hình ảnh đồ thị sắc nét, bo góc và hiệu ứng bóng đổ chuẩn sách giáo khoa.
    - *Trình Quản Lý Video Bài Giảng & Bảng Phân Đoạn Thời Gian (Timestamps Table)*: Cho phép xem thử video nhúng trực tiếp và thêm/sửa/xóa các mốc thời gian phân đoạn video (ví dụ: `00:00 Lý thuyết`, `03:15 Phương pháp`, `07:30 Ví dụ mẫu`).
    - *Studio Quản Trị Ngân Hàng Câu Hỏi Thích Ứng (API 16-18)*: Tải danh sách câu hỏi thuộc dạng bài từ PostgreSQL, hỗ trợ xem chi tiết, xóa câu hỏi và mở Dialog thêm câu hỏi mới với 4 bậc Bloom (L1 Nhận biết - L4 Vận dụng cao), 4 phương án A-D và lời giải chi tiết KaTeX.
    - *Tích Hợp Chặt Chẽ Với Cây Tri Thức (`CurriculumExplorerView.jsx`)*: Nút "Mở Studio Biên Soạn Sư Phạm" trên thanh công cụ, trên từng dạng bài và trong modal thêm mới cho phép chuyển đổi mượt mà giữa cây tri thức và Studio.
- **Tái Thiết Kế Cột Trái Cây Tri Thức 3 Tầng (Accordion Tree Navigation)**:
  - Chuyển đổi danh sách kỹ năng phẳng thành Accordion phân cấp 3 tầng chuẩn sư phạm SGK GDPT 2018:
    - *Tầng 1 (Chương học)*: Hiển thị tên chương, mã chuyên đề, số lượng bài học, trọng số, hỗ trợ đóng/mở linh hoạt.
    - *Tầng 2 (Bài học cụ thể)*: Hiển thị tên bài, biểu tượng sách, số lượng dạng bài con, hỗ trợ đóng/mở lồng nhau.
    - *Tầng 3 (Dạng bài cụ thể)*: Thẻ chọn dạng bài trực quan với mã code, chuẩn Bloom, nút sửa nhanh và hệ thống huy hiệu năng lực cá nhân:
      + `🚨 Hổng kiến thức (<10%)`: Màu đỏ đậm, nhấp nháy cảnh báo cần phục hồi vi mô ngay.
      + `⚠️ Vùng trũng (<60%)`: Màu vàng cam, cảnh báo kỹ năng chưa đạt chuẩn.
      + `✅ Đã vững (≥60%)`: Màu xanh ngọc, biểu thị kỹ năng đã thành thạo.
- **Xóa Bỏ Toàn Bộ Dữ Liệu Mẫu Hardcode Trên Frontend**:
  - Loại bỏ hoàn toàn các GUID hardcode mẫu trong `skillMasteryMap`. Toàn bộ chỉ số năng lực được trích xuất động từ kết quả khảo sát `diagData.skill_scores` hoặc `roadmapData.nodes`.
  - Loại bỏ hoàn toàn các câu hỏi giả fabricated trong fallback của `handleLaunchAdaptiveQuiz`. Nếu ngân hàng đề chưa có câu hỏi, hiển thị thông báo trạng thái cập nhật từ Ban Chuyên Môn/AI.
- **Hoàn Thiện 4 Khối Nội Dung Sư Phạm Cho Từng Dạng Bài (Cột Phải)**:
  - *Khối 1: Kiến thức nền tảng & Điều kiện tiên quyết (SGK Chuẩn)*: Định lý, định nghĩa, điều kiện đủ và đồ thị DAG liên kết.
  - *Khối 2: Phương pháp giải chuyên biệt từng bước & Công thức KaTeX*: Trình bày quy trình giải (Bước 1 -> Bước 2 -> Bước 3), ngân hàng công thức toán học KaTeX, các bẫy đề thi ĐGNL, kỹ thuật Casio và thẻ GraphRAG liên môn.
  - *Khối 3: Video bài giảng phương pháp & Lời giải mẫu chi tiết*: Video lecture preview kèm thời lượng (chuẩn FSM Gate ≥ 80%) và bài toán mẫu trắc nghiệm có lời giải chi tiết từng bước.
  - *Khối 4: Luyện tập củng cố thích ứng (API 19 Content Service)*: Tự động phát hiện các dạng bài tiên quyết liên kết đang bị hổng (&lt;10%) và tự động gom thêm câu hỏi từ dạng tiên quyết vào đề luyện tập để học sinh chữa dứt điểm gốc rễ.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - `npm run build` thành công 100% (**0 Error, 0 Warning**, hoàn thành trong 3.91s).


---

## [14/10/2026] - Triển Khai Phân Hệ Dàn Kiến Thức Khung Năng Lực Chuẩn ĐGNL & Tích Hợp Luyện Tập Củng Cố API 19

- **Xây Dựng Giao Diện Phân Hệ Dàn Kiến Thức (`src/components/curriculum/CurriculumExplorerView.jsx`)**:
  - Tích hợp 4 miền năng lực cốt lõi theo cấu trúc chuẩn ĐGNL ĐHQG-HCM (Ngôn ngữ, Toán học & Logic, Phân tích số liệu, Khoa học Tự nhiên & Xã hội).
  - Tích hợp công cụ tìm kiếm theo từ khóa kỹ năng, công thức toán học và mô hình liên môn.
  - Hiển thị ngân hàng công thức KaTeX chuẩn hóa (Đạo hàm, Tích phân Newton-Leibniz, Logic Boole De Morgan, Arrhenius, Hardy-Weinberg...) thông qua component `MathText`.
  - Tích hợp khối **Tri thức liên môn (Cross-Disciplinary GraphRAG)** mô tả sự kế thừa mô hình toán học giải quyết các bài toán Vật lý, Hóa học, Sinh học và Phân tích số liệu.
  - Thẻ bài giảng video mini-preview kèm giảng viên và thời lượng.
  - Câu hỏi mẫu chuẩn V-ACT kèm lời giải chi tiết từng bước.
- **Tích Hợp Modal Luyện Tập Củng Cố Tức Thì (Content Service API 19 Runner)**:
  - Nút bấm **"Luyện tập 5 câu củng cố"** gọi trực tiếp `contentService.createAdaptiveQuiz` (`POST /api/content/exams/quiz`).
  - Giao diện làm bài trắc nghiệm thích ứng trực tiếp trên modal: Hỗ trợ render KaTeX cho câu hỏi và phương án, bộ đếm câu, nộp bài chấm điểm thời gian thực, bảng tổng kết điểm và xem lại lời giải chi tiết.
- **Mở Rộng Tầng Dịch Vụ `contentService.js`**:
  - Bổ sung `createAdaptiveQuiz(payload)` gọi `POST /api/content/exams/quiz` bên Content Service.
  - Bổ sung `getQuestionsBySkill(skillId)` gọi `GET /api/content/questions/by-skill/{skillId}`.
- **Tích Hợp Điều Hướng Dashboard Học Sinh (`App.jsx` & `Sidebar.jsx`)**:
  - Điều hướng tab `roadmap` hiển thị trực tiếp `CurriculumExplorerView`.
  - Liên kết thẻ Metric DAG trên Dashboard chuyển thẳng vào Dàn kiến thức.
- **Xóa Bỏ Hoàn Toàn Dữ Liệu Hardcode `DOMAINS_DATA` Trên Frontend**:
  - Gỡ bỏ 100% mảng dữ liệu tĩnh `DOMAINS_DATA` trong `CurriculumExplorerView.jsx`.
  - Kết nối động trực tiếp với API Content Service thông qua `contentService.getCurriculum()` (`GET /api/content/curriculum`).
  - Tự động map các biểu tượng icon (`Cpu`, `BookOpen`, `Atom`, `BarChart2`, `Layers`), tiêu đề, chuyên đề, công thức KaTeX và câu hỏi mẫu được nạp từ cơ sở dữ liệu.
  - Bổ sung màn hình nạp (Loading Skeleton & Spinner) mượt mà khi truy vấn dữ liệu từ API Gateway.
- **Tích Hợp Đo Lường Năng Lực Cá Nhân & Định Vị Vùng Trũng Động (Dynamic Mastery Detection)**:
  - Bổ sung banner thông báo tương tác trong `CurriculumExplorerView`: Nếu học viên chưa thi khảo sát, hiển thị banner cảnh báo khung chuẩn 120 câu kèm nút chuyển nhanh sang tab Khảo sát 30 câu.
  - Sau khi học viên hoàn thành bài thi khảo sát, tự động tính toán và gắn badge cờ đỏ `⚠️ Vùng trũng (Mastery: X%)` cho các kỹ năng có độ thành thạo dưới 60%, cờ xanh `✅ Đã vững` cho các kỹ năng đạt chuẩn.
  - Bổ sung callout đề xuất củng cố tức thì tại chi tiết kỹ năng yếu để gọi API 19 Content Service.
- **Hợp Nhất Phân Hệ Khảo Sát Năng Lực Đầu Vào Vào Chung Dashboard (Tab-based Flow 1)**:
  - Loại bỏ hoàn toàn cơ chế tách rời toàn màn hình gây đứt gãy luồng người dùng (`setCurrentPage('diagnostic')`).
  - Tích hợp `DiagnosticAssessmentPage` (chế độ `embedded = true`) trực tiếp vào khung nội dung chính khi `activeTab === 'diagnostic'`.
  - Giữ vững thanh `Navbar` phía trên và `Sidebar` bên trái, cho phép học sinh chuyển đổi linh hoạt giữa Dashboard tổng quan, Khảo thí chẩn đoán và Dàn kiến thức mà không bị mất ngữ cảnh làm việc.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` thành công 100% (**0 Error, 0 Warning**).

---

## [10/10/2026] - Giao Diện Quản Lý Nhóm Học Tập Vi Mô (Micro Study Groups: 3 - 5 Học Sinh) & Phân Bổ Sơ Đồ Bàn Học Offline
- **Thiết Kế Modal Sơ Đồ Nhóm Bàn Học Vi Mô ([`ClassMicroGroupsModal.jsx`](../src/components/modals/ClassMicroGroupsModal.jsx))**:
  - Xây dựng component modal hiển thị sơ đồ phân bổ bàn học offline của lớp (Trần sĩ số tối đa 20 em, mỗi bàn 3 - 5 học sinh).
  - Tích hợp bộ chọn quy mô bàn học (`3 bạn/bàn`, `4 bạn/bàn`, `5 bạn/bàn`) với thuật toán gom cụm đồng nhất (Homogeneous Clustering) theo lỗ hổng kiến thức.
  - Hiển thị danh sách các trạm bàn học: Tên bàn học sư phạm, chủ đề trọng tâm `FocusArea`, tag các kỹ năng yếu chung (`CommonWeakSkills`), danh sách học sinh tại bàn kèm chỉ số thành thạo kiến thức.
  - Tích hợp tính năng **Phân phối đề luyện tập thích ứng** trực tiếp cho bàn học (`practiceService.assignGroupWorksheet`), hiển thị trạng thái phát đề và thời gian thực.
  - Bổ sung nút xuất file sơ đồ bàn học dạng PDF cho Giảng viên in ra phát tận bàn offline.
- **Nâng Cấp Cổng Điều Hành Học Thuật Cơ Sở ([`CampusManagerDashboardView.jsx`](../src/components/dashboard/CampusManagerDashboardView.jsx))**:
  - Chuẩn hóa danh sách lớp học offline theo cơ chế trần 20 học sinh và số thứ tự tăng dần (`Lớp Nền tảng 01`, `Lớp Nền tảng 02`, `Lớp Tăng tốc 01`, `Lớp Bứt phá 01`).
  - Hiển thị badge sĩ số chuẩn hóa: `Sĩ số: {studentCount}/20`.
  - Tích hợp nút hành động **"Sơ Đồ Nhóm Bàn (3 - 5 Bạn)"** trên từng thẻ lớp học, mở modal tương tác trực tiếp.
  - Bổ sung nút **"Tự Động Gom Cụm AI"** trên thanh công cụ lớp học gọi trực tiếp API K-Means Elbow Method (`practiceService.autoClusterClasses`).
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` thành công 100% (**0 Error, 0 Warning**).

---

## [09/10/2026] - Mở Rộng Client Service: Bổ Sung Tích Hợp API Phân Cụm Lớp Chuyên Đề & Nhóm Học Tập Vi Mô (3 - 5 Học Sinh)
- **Cập Nhật Tầng Dịch Vụ `practiceService.js`**:
  - Bổ sung phương thức `autoClusterClasses(campusId, maxK = 6)` gọi `POST /api/v1/practice/classes/auto-cluster` phục vụ tự động phân cụm tạo lớp chuyên đề theo K-Means/Elbow Method.
  - Bổ sung phương thức `autoPartitionMicroGroups(classId, preferredGroupSize = 4)` gọi `POST /api/v1/practice/classes/{classId}/micro-groups/auto-partition` tự động chia học sinh trong lớp thành các nhóm vi mô 3 - 5 bạn theo lỗ hổng kiến thức.
  - Bổ sung phương thức `getClassMicroGroups(classId)` gọi `GET /api/v1/practice/classes/{classId}/micro-groups` lấy sơ đồ bàn học và danh sách nhóm vi mô cho dashboard giáo viên.
  - Bổ sung phương thức `assignGroupWorksheet(classId, groupId, worksheetId, worksheetTitle)` gọi `POST /api/v1/practice/classes/{classId}/micro-groups/{groupId}/assign-worksheet` phân phối đề luyện tập thích ứng theo nhóm.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` thành công 100% (**0 Error, 0 Warning**).

---

## [08/10/2026] - Đồng Bộ Tinh Gọn Tầng Dịch Vụ: Loại Bỏ Các Lời Gọi API Live Streaming Tại Client
- **Loại Bỏ Các Phương Thức Gọi API Live Streaming Trong `practiceService.js`**:
  - Gỡ bỏ các hàm gọi API tương ứng với các endpoint vừa được xóa: `createLiveSession`, `getMyLiveSchedule`, `joinLiveSession`, `markTeacherAttendance`, `getTeacherSchedule`, `updateRecordingUrl`, `cancelLiveSession`.
  - Giữ lại phương thức phân công giáo viên lớp học `assignTeacher`.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` thành công 100% (**0 Error, 0 Warning**).

---

## [06/10/2026] - Khắc Phục Sự Cố Thông Báo Discord, Thiết Lập CI/CD GitHub Actions & Hoàn Thiện Tích Hợp Web Client
- **Sửa Lỗi Thiếu Thông Báo Discord & Thiết Lập CI/CD GitHub Actions Cho Web Client**:
  - Phát hiện nguyên nhân Web Client trước đó không gửi thông báo về Discord: Repo thiếu hoàn toàn thư mục cấu hình `.github/workflows`.
  - Thiết lập `.github/workflows/discord-commit-tracker.yml`: Tự động bắt sự kiện `push` trên mọi nhánh, bóc tách commit SHA, danh sách file thay đổi kèm emoji chỉ thị, đọc nội dung `UPDATE.md` và gửi tin nhắn embed thời gian thực về webhook Discord hệ thống.
  - Thiết lập `.github/workflows/ci.yml`: Tự động kiểm thử `npm ci` và biên dịch `npm run build` trên Node.js 20.x cho mỗi commit/PR.
- **Kiểm Thử Vận Hành & Build Verification**:
  - Chạy `npm run build` thành công 100% trong 679ms (0 error, 0 warning).
  - Xác nhận 2903 modules Vite được đóng gói hoàn hảo.

---

## [05/10/2026] - Hợp Nhất Giao Diện Xác Thực (TNhan UI/UX) Với Tầng API IAM (ThinhTT), Cấp Quyền Đa Vai Trò
- **Hợp Nhất Toàn Diện Hệ Thống Xác Thực (Auth Subsystem)**:
  - Tiếp nhận và nâng cấp toàn bộ giao diện Auth hiện đại từ nhánh `TNhan`:
    + Split-screen layout 12 cột với ảnh sinh viên thật `vietnamese_student_real.jpg`, thanh ticker tin tức hoạt động thời gian thực (`liveActivities`), và hiệu ứng động mượt mà bằng Framer Motion.
    + Module hóa form đăng nhập (`LoginForm.jsx`), form đăng ký (`RegisterForm.jsx`), modal quên mật khẩu 4 bước OTP (`ForgotPasswordModal.jsx`) và popup modal nhanh (`AuthModal.jsx`).
    + Tích hợp Custom Rounded Select bo góc cao cấp cho lựa chọn Khối Lớp (12, 11, Thí sinh tự do) và Mục tiêu điểm ĐGNL (900+, 800+, 700+).
    + Hiển thị thông báo lỗi trực tiếp từng trường nhập liệu (`fieldErrors`), thanh đo độ mạnh mật khẩu 3 cấp độ (`passStrength`).
  - Đấu nối 100% logic API và Tầng dịch vụ IAM từ nhánh `ThinhTT`:
    + Thay thế toàn bộ mã giả lập `setTimeout` bằng các hàm gọi API thật qua `authService.js` (`POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/verify-account`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`).
    + Tích hợp nạp động danh sách Cơ sở Đào tạo (`GET /api/v1/campuses`) vào dropdown bo tròn trong `RegisterForm.jsx`.
    + Bắt mã lỗi tài khoản chưa kích hoạt (`Auth.AccountNotActivated`) để tự động mở bước xác thực mã OTP 6 số.
    + Bảo toàn 1-Click Demo Login cho 4 vai trò (Học sinh, Giáo viên, Quản lý cơ sở, Phụ huynh) với cơ chế fallback offline an toàn.
- **Bảo Toàn 100% Các Tính Năng Độc Quyền Của Nhánh ThinhTT**:
  - Trang Quản trị Cấp phát Tài khoản IAM (`src/components/admin/AccountProvisioningView.jsx`).
  - Bảng điều khiển Quản lý Học thuật Cơ sở (`src/components/dashboard/CampusManagerDashboardView.jsx`).
  - Bảng điều khiển Phụ huynh (`src/components/dashboard/ParentDashboardView.jsx`).
  - Tầng dịch vụ quản lý User và cấp phát tài khoản (`src/services/userService.js`).
  - Bộ định tuyến trung tâm và quản trị trạng thái phiên làm việc (`src/App.jsx`).

---

## [04/10/2026] - Triển Khai Hoàn Chỉnh Trang Cấp Phát & Quản Lý Tài Khoản Đa Vai Trò (IAM Provisioning Page), Smart RBAC & Móc Nối Backend CSDL
- **Triển Khai Trang Quản Trị Cấp Phát Tài Khoản Đa Vai Trò (`AccountProvisioningView.jsx`)**:
  - Giao diện quản trị cấp cao: Thống kê số lượng tài khoản thời gian thực (Tổng số, Giảng viên, Quản lý, Học sinh & Phụ huynh, Tỷ lệ kích hoạt).
  - Bộ lọc vai trò tức thì (Tất cả, `TEACHER`, `ACADEMIC_MANAGER`, `ACADEMIC_DIRECTOR`, `ADMINISTRATOR`, `PARENT`, `STUDENT`) và ô tìm kiếm thông minh theo Họ tên, Email, Số điện thoại.
  - Bảng dữ liệu người dùng trực quan: Avatar gradient, Huy hiệu vai trò RBAC sắc nét, Cơ sở công tác, Bộ môn chuyên môn, và Nút gạt chuyển đổi trạng thái Khóa / Mở khóa tài khoản thời gian thực gọi trực tiếp API `PATCH /api/v1/users/{id}/toggle-status`.
  - Modal **Cấp Phát Tài Khoản Mới**:
    + Card lựa chọn trực quan 6 vai trò kèm mô tả chức năng chi tiết.
    + Dropdown nạp danh sách cơ sở đào tạo thực tế từ CSDL PostgreSQL (`GET /api/v1/campuses`).
    + Form nhập thông tin cán bộ, chuyên môn phụ trách, bộ tạo mật khẩu ngẫu nhiên an toàn hoặc mật khẩu tùy chỉnh.
    + Hộp thông báo cấp tài khoản thành công kèm nút **"Sao chép thông tin bàn giao"** một chạm để gửi ngay cho cán bộ.
- **Tầng Dịch Vụ Người Dùng Mới (`src/services/userService.js`)**:
  - `getUsers(params)`: Gọi API `GET /api/v1/users` qua Gateway YARP `:5212`.
  - `provisionUser(userData)`: Gọi API `POST /api/v1/users/provision` nạp thẳng vào CSDL PostgreSQL, kích hoạt ngay không cần OTP.
  - `toggleUserStatus(userId)`: Gọi API `PATCH /api/v1/users/{id}/toggle-status`.
- **Tích Hợp Điều Hướng & Trải Nghiệm Người Dùng (`App.jsx`, `Navbar.jsx`, `Sidebar.jsx`, `CampusManagerDashboardView.jsx`)**:
  - Nút chuyển tab **"Cấp Tài Khoản (IAM)"** trên Thanh điều hướng đầu trang và Menu người dùng.
  - Nút liên kết nhanh "Quản lý IAM" trên Bảng điều khiển Quản lý cơ sở (`CampusManagerDashboardView.jsx`).
  - Nối thành công hàm cấp giảng viên nhanh trong bảng điều khiển cơ sở gọi trực tiếp API thật.
- **Phân Định Nghiệp Vụ Đăng Ký & Đăng Nhập Đa Vai Trò (Smart RBAC Architecture)**:
  - Khóa chặt form đăng ký chỉ cho phép 2 vai trò mở tự do: **Học sinh (`STUDENT`)** và **Phụ huynh (`PARENT`)**.
  - Các vai trò nhân sự gồm Giáo viên (`TEACHER`), Quản lý học thuật cơ sở (`ACADEMIC_MANAGER`), Giám đốc đào tạo (`ACADEMIC_DIRECTOR`) và Quản trị viên hệ thống (`ADMINISTRATOR`) được cấp phát nội bộ từ Admin/Quản lý cơ sở.
- **Kiểm Thử Biên Dịch (Build Verification)**:
  - `npm run build` thành công 100% trong 758ms (0 lỗi cú pháp, 0 warnings, toàn bộ bundle được tối ưu hóa).
  - `npm run lint` đạt chuẩn 0 error.

---

## [02/10/2026] - Nâng Cấp Toàn Diện Tầng Dịch Vụ AI Engine (`src/services/aiService.js`) Qua API Gateway
- **Móc Nối Đầy Đủ 14+ API AI Engine Qua Gateway YARP (`http://localhost:5212`)**:
  - **Nhóm 1: Bóc tách Đề thi PDF (Gemini Vision OCR)**:
    - `uploadPdfExam(pdfFile)`: Upload đề thi PDF phân tích nền (`POST /api/ai-engine/upload-pdf`).
    - `getExamJobStatus(jobId)`: Polling tiến độ OCR (`GET /api/ai-engine/jobs/${jobId}`).
    - `getViewExamUrl(jobId)`: URL xem trực quan kết quả đề thi (`/view-exam`).
  - **Nhóm 2: Nạp & Quản Trị Tri Thức SGK / Vector DB (.NET AI Engine)**:
    - `uploadTextbookPdf(file, options)`: Nạp SGK lên đến 250MB (`POST /api/ai-engine/textbooks/upload-pdf`).
    - `getActiveTextbookJob()`: Khôi phục tác vụ nạp SGK khi người dùng F5 (`GET /api/ai-engine/textbooks/active-job`).
    - `getTextbookCheckpoint(fileHash)`: Kiểm tra Checkpoint SHA-256 (`GET /api/ai-engine/textbooks/checkpoint/${fileHash}`).
    - `getTextbookJobStatus(jobId)`: Polling tiến độ bóc tách SGK (`GET /api/ai-engine/textbooks/jobs/${jobId}`).
    - `getTextbookChunks(sourceId)` & `getTextbookChunksByHash(fileHash)`: Danh sách Vector Chunks tri thức SGK.
    - `saveTextbookChunksToDb(dto)`: Lưu Chunks vào Supabase DB schema `v_eval_ai` (`POST /api/ai-engine/textbooks/save-db`).
    - `pingVisionModels(geminiKey)`: Đo kiểm độ trễ & trạng thái các mô hình Vision AI (`GET /api/ai-engine/textbooks/ping-vision`).
    - `getViewTextbookUrl()`: URL trang nạp & xem SGK trực quan (`/view-textbook`).
  - **Nhóm 3: Sinh Đề Thi AI & Chẩn Đoán Năng Lực IRT/BKT (Python FastAPI RAG)**:
    - `generateExam(payload)`: Sinh đề thi AI theo Prompt & chuẩn hóa Bloom 6 cấp độ (`POST /api/v1/diagnostic/generate-exam`).
    - `analyzeDiagnosticSubmission(payload)`: Chẩn đoán năng lực học sinh IRT 2PL, BKT, Radar chart (`POST /api/v1/diagnostic/analyze`).
    - `getDiagnosticConfig()`: Lấy cấu hình ngưỡng phân lớp và tham số (`GET /api/v1/diagnostic/config`).
    - `getViewDiagnosticUrl()`: URL trang khảo sát năng lực chẩn đoán trực quan (`/view-diagnostic`).
  - **Nhóm 4: Gia Sư AI Socratic RAG & SSE Streaming (Token by Token)**:
    - `askSocraticTutor({ question, sessionId })`: Hỏi đáp gia sư dạng Single Request (`POST /api/v1/chat`).
    - `askSocraticTutorStream({ question, sessionId, onToken, onError, onComplete, signal })`: Token Streaming SSE chạy chữ mượt mà như ChatGPT (`POST /api/v1/chat/stream`).
    - `getChatSessions()` & `clearChatSession(sessionId)`: Quản lý phiên hội thoại (`/api/v1/chat/sessions`).
  - **Nhóm 5: Quản trị Tài liệu Tri thức RAG**:
    - `uploadRagDocument(file)`: Nạp tài liệu tri thức RAG (`POST /api/v1/documents/upload`).
- **Phát Triển Trang Khảo Sát Năng Lực 30 Câu Thật Với AI & Content Service (`DiagnosticAssessmentPage.jsx`)**:
  - Xây dựng component trang hoàn chỉnh `src/components/diagnostic/DiagnosticAssessmentPage.jsx`:
    - Setup screen: Hỗ trợ 3 nguồn đề thi linh hoạt:
      + **Đề Có Sẵn (Content Service)**: Lấy trực tiếp từ Database PostgreSQL 30 câu hỏi chuẩn hóa V-ACT kèm bài đọc hiểu (Passages).
      + **Google Gemini AI Cloud**: Sinh 30 câu hỏi mới 100% kèm công thức Toán KaTeX.
      + **Hiệu Chuẩn AI Fast Bank (<500ms)**: Trích xuất siêu tốc 30 câu từ bộ nhớ hiệu chuẩn psychometrics.
    - In-exam testing screen: Đồng hồ 45 phút, ngữ liệu đọc hiểu collapsible, thanh điều hướng 30 câu kèm cờ phân vân, hiển thị công thức KaTeX, tích hợp Gia sư AI Socratic RAG hỗ trợ tư duy từng bước.
    - Result & Psychometrics screen:
      + Điểm thô thực tế ($X/30$), ước lượng năng lực IRT 2PL `\theta_0`, phân lớp học viên (`FOUNDATION`, `ACCELERATION`, `BREAKTHROUGH`).
      + **Phân tích Tốc độ & Chiến thuật (Pacing Analysis)**: Thời gian trung bình/câu, nhóm làm nhanh (&lt;25s), nhóm chuẩn (25-90s), nhóm tốn thời gian (&gt;90s), câu phân vân gắn cờ 🚩.
      + **Biểu Đồ Radar Năng Lực 5 Lĩnh Vực**: Dữ liệu Recharts Radar Chart lấy trực tiếp từ kết quả 30 câu thật không bịa, đối chiếu chuẩn 900+.
      + **Bảng Tra Cứu & Đáp Án Chi Tiết 30 Câu**: Bộ lọc (Tất cả, Đúng, Sai, Phân vân), đối chiếu đáp án của bạn vs đáp án đúng, badge thời gian, ngữ liệu và lời giải chi tiết KaTeX.
  - Tích hợp vào thanh chuyển trang (Top Page Control Bar) của `App.jsx` và liên kết điều hướng từ Landing Page, HeroBanner và Sidebar Dashboard.
- **Tích Hợp Trình Render Toán Học KaTeX Toàn Diện (`MathText.jsx`, `DiagnosticAssessmentPage.jsx`, `DiagnosticTestModal.jsx`)**:
  - Cài đặt thư viện `katex` và nạp stylesheet `katex/dist/katex.min.css` vào `main.jsx` và font Plus Jakarta Sans.
  - Xây dựng component `src/components/common/MathText.jsx` hỗ trợ parse và render chuẩn xác các công thức toán học STEM phức tạp:
    - Ký hiệu delimiters: `$$...$$`, `$...$`, `\[...\]`, `\(...\)`.
    - Tự động nhận diện lệnh LaTeX: phân số `\frac{...}{...}`, căn thức `\sqrt{...}`, vô cực `\infty`, số mũ `x^4 + 2x^2`, tích phân `\int`, hình học `\perp`...
    - Điều chỉnh màu KaTeX thừa hưởng (inherit) đảm bảo độ tương phản cao, hiển thị sắc nét trên cả nền tối Dark Theme và nền sáng Light Theme.
- **Kiểm Thử Biên Dịch**:
  - `npm run build` thành công 100% trong 1.26s, đóng gói hoàn chỉnh các bộ font KaTeX (woff, woff2, ttf).

---

## [01/10/2026] - Kiểm Thử Toàn Diện Tầng Giao Tiếp API Gateway YARP & Đồng Bộ Kiến Trúc Dịch Vụ Frontend

- **Hoàn Thiện Tầng Service Client Tập Trung (`src/services/`)**:
  - `src/services/apiClient.js`: Xây dựng Axios instance chuẩn hóa kết nối cổng Gateway `5212`, tự động đính kèm Bearer token từ `localStorage`, lắng nghe response header `X-Token-Refresh-Required: true` để âm thầm gia hạn token trong nền (Silent Refresh), và xử lý lỗi tập trung.
  - `src/services/authService.js`: Kết nối Identity Service (`/api/auth`, `/api/v1/auth`, `/api/v1/users`, `/api/v1/campuses`) phục vụ các luồng UC 01 - UC 07, UC 10, UC 40 (Đăng nhập, Đăng ký, OTP, Quên/Đổi mật khẩu, Lấy profile người dùng và Danh sách cơ sở).
  - `src/services/contentService.js`: Kết nối Content Service (`/api/v1/content`) phục vụ lấy đề thi khảo sát chẩn đoán năng lực ban đầu 30 câu hỏi (Core Flow 1), cây kỹ năng DAG 12 kỹ năng chuẩn và ngân hàng đề thi.
  - `src/services/practiceService.js`: Kết nối Practice Service (`/api/v1/practice`) phục vụ quy hoạch lộ trình học tập cá nhân hóa (APIs 1-7), nộp bài thi chặng, làm bài Quiz bù và hệ thống lịch học Live Q&A, điểm danh chuyên cần của giáo viên (APIs 8-15).
  - `src/services/aiService.js`: Kết nối AI Engine (`/api/v1/ai`) phục vụ tải lên đề thi PDF phân tích bằng Gemini OCR, theo dõi tiến trình nền và khung chat gia sư AI Socratic Tutor.
  - `src/services/index.js`: Tập hợp và tái xuất (re-export) toàn bộ dịch vụ, sẵn sàng cho các component trong UI sử dụng trực tiếp.
- **Kiểm Thử Biên Dịch & Vận Hành**:
  - `npm run build` thành công 100% trong 619ms, tạo các bundle tĩnh `dist/` sẵn sàng phục vụ trong container Nginx Alpine.
  - Kiểm thử tương thích môi trường cấu hình qua [`.env`](../.env) và [`.env.example`](../.env.example).

---

## [29/09/2026] - Tích Hợp Web Client Vào Hệ Thống V-Eval System-Repo & Cấu Hình Runner Đa Dịch Vụ

- **Đồng Bộ Repository & Cấu Hình Hệ Thống**:
  - Clone mã nguồn nhánh `develop` từ repository `https://github.com/Capstone-OG/v-eval-web-client.git` vào thư mục chuẩn hóa `All Services/V-Eval-Web_Client`.
  - Bổ sung cấu hình tracking vào [`git_config.txt`](../../git_config.txt):
    ```ini
    V-Eval-Web_Client=https://github.com/Capstone-OG/v-eval-web-client.git|develop
    ```
  - Cập nhật [`Scripts/setup/setup.bat`](../../Scripts/setup/setup.bat) bổ sung cờ kiểm tra `package.json` (`IS_NODE=1`) để ngăn chặn việc sinh nhầm giải pháp .NET Clean Architecture cho các dự án Web/Frontend.
- **Xây Dựng Script Push Độc Lập Cho Web Client**:
  - Tạo script [`Scripts/push.bat`](../Scripts/push.bat) chuyên dụng cho Web Client, đồng bộ tính năng với các microservices backend:
    - Kiểm tra đồng bộ lịch sử commit với Remote `origin/develop`.
    - Menu chọn nhanh đẩy mã nguồn (Nhánh hiện tại, Nhánh đã có, hoặc Khởi tạo nhánh mới).
    - Tự động kiểm tra `git status`, tạo commit và push lên GitHub.
- **Cấu Hình Môi Trường Thực Thi Docker & Local Runner**:
  - Soạn thảo [`Dockerfile`](../Dockerfile) đa tầng (Multi-stage build) sử dụng `node:22-alpine` để biên dịch mã nguồn React 19 và `nginx:alpine` phục vụ file tĩnh SPA.
  - Thiết lập [`nginx.conf`](../nginx.conf) hỗ trợ điều hướng SPA Routing (`try_files $uri $uri/ /index.html;`) tránh lỗi 404 khi người dùng tải lại trang.
  - Cập nhật [`docker-compose.yml`](../../docker-compose.yml) khai báo container `v_eval_web_client` phục vụ tại cổng `5173:80`.
  - Cập nhật [`Scripts/run_local/run_local.bat`](../../Scripts/run_local/run_local.bat) bổ sung tùy chọn khởi chạy Web Client (Tùy chọn [1] Full 7 dịch vụ và Tùy chọn [4] Chỉ Web Client cổng 5173).
- **Kiểm Thử Vận Hành & Biên Dịch**:
  - Chạy thành công `npm install` (cài đặt 87 gói phụ thuộc không có lỗ hổng bảo mật).
  - Chạy `npm run build` thành công trong 3.87 giây, xuất bản thư mục `dist/` hoàn chỉnh.
  - Kiểm tra cú pháp Docker compose với `docker compose config` đạt chuẩn 100%.
- **Xây Dựng Phân Hệ Dịch Vụ Kết Nối API Gateway YARP (`src/services/`)**:
  - `src/services/apiClient.js`: Xây dựng HTTP Client chuẩn hóa kết nối cổng Gateway `5212`, tự động đính kèm JWT Bearer Token từ `localStorage`, lắng nghe response header `X-Token-Refresh-Required: true` để âm thầm gia hạn token trong nền (Silent Refresh), và tự động retry khi gặp mã lỗi 401.
  - `src/services/authService.js`: Kết nối Identity Service (`/api/v1/auth`, `/api/v1/users`, `/api/v1/campuses`) phục vụ các luồng UC 01 - UC 07, UC 10, UC 40 (Đăng nhập, Đăng ký, OTP, Quên/Đổi mật khẩu, Lấy profile người dùng và Danh sách cơ sở).
  - `src/services/contentService.js`: Kết nối Content Service (`/api/v1/content`) phục vụ lấy đề thi khảo sát chẩn đoán năng lực ban đầu 30 câu hỏi (Core Flow 1), cây kỹ năng DAG 12 kỹ năng chuẩn và ngân hàng đề thi.
  - `src/services/practiceService.js`: Kết nối Practice Service (`/api/v1/practice`) phục vụ quy hoạch lộ trình học tập cá nhân hóa (APIs 1-7), nộp bài thi chặng, làm bài Quiz bù và hệ thống lịch học Live Q&A, điểm danh chuyên cần của giáo viên (APIs 8-15).
  - `src/services/aiService.js`: Kết nối AI Engine (`/api/ai-engine`) phục vụ tải lên đề thi PDF phân tích bằng Gemini OCR, theo dõi tiến trình nền và khung chat gia sư AI Socratic Tutor.
  - `src/services/index.js`: Tập hợp và tái xuất (re-export) toàn bộ dịch vụ, sẵn sàng cho các component trong UI sử dụng trực tiếp.

