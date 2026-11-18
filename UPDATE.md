# UPDATE - V-Eval-Web_Client

## [18/11/2026]
- **Kiến Trúc Universal Storage Bridge, Triệt Tiêu Stale Closure & Đồng Bộ Câu Hỏi Thời Gian Thực Hai Chiều (`./src/components/curriculum/textbookStateBridge.js`, `./src/components/curriculum/TextbookIngestView.jsx`, `./src/components/curriculum/TextbookStandardView.jsx`)**:
  - *Chẩn đoán & Khắc phục triệt để lỗi mất câu hỏi*:
    + Triệt tiêu lỗi Stale Closure React trong `saveToStorage`: sử dụng `skeletonRef = useRef(skeleton)` và luôn cập nhật `skeletonRef.current` trước khi lưu vào persistent storage, loại bỏ hiện tượng async loop ghi đè skeleton rỗng lên `localStorage`.
    + Loại bỏ lỗi lệch chỉ số mảng (Index Mismatch): thay thế truy cập chỉ số `chapters[cIdx]` bằng hàm `updatePatternByName(chapterTitle, lessonTitle, patternName, updater)` định vị tuyệt đối theo tên chương, bài học và dạng bài.
    + Khắc phục trạng thái rỗng khi Mount: `TextbookStandardView.jsx` tự động nạp dữ liệu câu hỏi từ `getSavedTextbookData(sourceId, fileName)` và hợp nhất sâu qua `mergeSavedExercisesIntoChapters` ngay khi component khởi tạo.
  - *Cứu cánh lưu trữ Universal Storage Bridge*:
    + Hàm `getSavedTextbookData` tra cứu đa tầng qua `sourceId` CSDL Supabase, `fileName` và fallback mặc định across `localStorage` và `sessionStorage`.
    + Hàm `saveTextbookData` ghi đồng thời vào nhiều khóa và phát sự kiện `window.dispatchEvent(new CustomEvent('veval:textbook-saved', { detail }))`.
    + Tích hợp listener `veval:textbook-saved` giúp phản hồi tức thì hai chiều: AI sinh câu hỏi ở Trang Nạp là Trang Xem hiển thị ngay lập tức mà không cần F5.
  - *Nạp sẵn bộ câu hỏi mẫu chuẩn GDPT 2018*: Bổ sung ngân hàng câu hỏi mẫu hoàn chỉnh kèm công thức KaTeX, đáp án A/B/C/D và lời giải chi tiết cho `PHYS_10` Bài 1 và Bài 2 trong `GDPT_PRESETS`.
- **Thu Gọn Thanh Mục Lục Cấu Trúc SGK Linh Hoạt Tương Tự Sidebar (`./src/components/curriculum/TextbookStandardView.jsx`)**:
  - *Cơ chế thu gọn `isTocCollapsed`*: Tích hợp nút thu gọn (`ChevronLeft`) trên thanh tiêu đề mục lục bên trái.
  - *Thu nhỏ thành cột dọc tinh tế*: Khi thu gọn, cột mục lục co lại thành dải thanh dọc (`lg:col-span-1`) hiển thị nút mở rộng (`ChevronRight`) và tiêu đề xoay dọc `Mục Lục SGK ({count} Chương)`, giải phóng toàn bộ diện tích ngang cho cột nội dung lý thuyết và câu hỏi mở rộng sang `lg:col-span-11`.
  - *Nút shortcut mở nhanh*: Bổ sung nút `[Mục lục]` với icon `ChevronRight` trên thanh header bài học giúp giáo viên/học sinh mở lại cây mục lục 1-click tức thì.
  - *Tự động mở rộng 2 trang OCR song song*: Khi mục lục hoặc sidebar thu gọn (`isSidebarCollapsed || isTocCollapsed`), bộ trích xuất OCR tự động hiển thị 2 trang sách song song (`pageSize = 2`).
- **Thu Nhỏ Ô Lý Thuyết Còn 3/5 Tỉ Lệ Chuẩn (`./src/components/curriculum/TextbookStandardView.jsx`)**:
  - Giới hạn chiều cao ô hiển thị lý thuyết chuẩn xuống ~3/5 (từ `min-h-[920px] max-h-[140vh]` còn `min-h-[380px] max-h-[550px] overflow-y-auto`, làm tròn xuống 550px) giúp bố cục cân đối và cuộn mượt mà.
  - Ở chế độ chỉnh sửa trực tiếp lý thuyết (`isEditingTheory`), điều chỉnh ô `textarea` từ `rows={16}` xuống `rows={10}` tương ứng tỉ lệ 3/5.
- **Bổ Sung Phân Hệ Ngân Hàng Câu Hỏi & Bài Tập SGK Trực Tiếp Dưới Ô Lý Thuyết (`./src/components/curriculum/TextbookStandardView.jsx`)**:
  - *Header phân hệ câu hỏi*: Hiển thị tổng số câu hỏi thực tế (`{activeLessonExercises.length} câu`), định danh bài học và huy hiệu phân hóa Bloom Taxonomy L1–L6.
  - *Bộ lọc phạm vi & cấp độ nhận thức*: Cho phép lọc `[Cả bài]` hoặc `[Dạng bài đang chọn]`, kèm các pill lọc nhanh theo 6 cấp độ Bloom (L1. Nhớ, L2. Hiểu, L3. Vận dụng, L4. Phân tích, L5. Đánh giá, L6. Sáng tạo).
  - *Thẻ bài tập chi tiết*: Render đề bài toán học qua `<MathText />`, 4 phương án trắc nghiệm A/B/C/D với đáp án đúng được làm nổi bật viền xanh ngọc `ring-1 ring-emerald-400` kèm icon `CheckCircle2`.
  - *Phương pháp & Lời giải chi tiết*: Nút đóng/mở xem phương pháp và lời giải chi tiết kèm icon bóng đèn `Lightbulb`.
  - *Empty State thân thiện*: Nếu bài học chưa có bài tập, hiển thị hướng dẫn kèm nút `[Đến Trang Nạp SGK để sinh câu hỏi]` điều hướng trực tiếp sang tab `ingest`.
- **Tối Giản Hóa Giao Diện Sinh Câu Hỏi Phần 3: Loại Bỏ Nút Toàn Sách Cục Bộ, Bộ Chọn 1 Trong 2 Kèm Nút Sinh Duy Nhất & Dọn Dẹp Icon Thừa (`./src/components/curriculum/TextbookIngestView.jsx`)**:
  - *Xóa nút "Sinh toàn bộ sách" khỏi header bài học*: Đưa chức năng toàn sách lên thanh điều khiển tổng quát trên cùng.
  - *Bộ chọn phạm vi 1 trong 2*: Bổ sung thanh chọn gọn gàng `Sinh câu hỏi:` cho phép chọn `[Dạng này]` hoặc `[Cả bài học ({count})]`.
  - *Nút `[Sinh câu hỏi]` duy nhất*: Thay thế cụm 3 nút cồng kềnh bằng 1 nút duy nhất thực thi theo phạm vi đã chọn, tích hợp trạng thái xoay vòng `Đang sinh...`.
  - *Dọn dẹp triệt để icon và text dư thừa*: Quy chuẩn 100% về icon SVG Lucide tinh tế (`Sparkles`, `RefreshCw`).
- **Thanh Tác Vụ Tổng Quát Nằm Ngay Trên Bộ Chuyển 3 Chế Độ, Tự Động Lưu (Auto-Save) & Nút Lưu Toàn Bộ SGK (`./src/components/curriculum/TextbookIngestView.jsx`)**:
  - Đặt thanh tổng quát công thái học ngay trên bộ chuyển 3 chế độ với nút `[Lưu Toàn Bộ SGK]` và `[Sinh Cho Toàn Bộ Sách]`.
  - Tự động lưu tức thì vào persistent storage khi sinh câu hỏi hoặc sửa đổi, kèm badge thời gian `Đã lưu lúc HH:mm:ss`.
- **Đa Dạng Hóa Dạng Bài Chuẩn GDPT 2018 & Bộ Chọn Cấp Độ Nhận Thức Bloom (L1–L6) Trực Quan 1-Click (`./src/components/curriculum/TextbookIngestView.jsx`, `./src/components/curriculum/TextbookStandardView.jsx`)**:
  - Tự động nạp 2-4 dạng bài GDPT 2018 đa cấp độ Bloom (L1-L4) khi bóc tách chỉ có 1 dạng mặc định.
  - Huy hiệu `L{bloomLevel} ▾` trên cây mục lục cho phép click xoay vòng cấp độ Bloom tức thì.
- **Thay Thế `window.confirm`/`alert` Bằng Modal Popup Xác Nhận & Cam Kết Cơ Chế Chỉ Sinh Thêm (Append-Only) Tuyệt Đối Không Ghi Đè Câu Hỏi (`./src/components/curriculum/TextbookIngestView.jsx`)**:
  - Modal Dialog Tailwind UI hiện đại với cam kết bảo toàn nguyên vẹn 100% câu hỏi cũ.
- **Kiểm Thử Vận Hành**: `npm run build` (`vite build`) đạt `✓ built in 1.24s` với 3053 modules sạch 100%, 0 lỗi.
