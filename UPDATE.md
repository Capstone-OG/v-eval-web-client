# UPDATE - V-Eval-Web_Client

## [17/11/2026]
- **Khắc phục triệt để hiện tượng Sector 1 trống lý thuyết & Đồng bộ hóa toàn diện tri thức SGK từ Supabase Database**:
  - **Tự động Hydrate Chunks vào React State (`filledChunks`)**:
    - Khi khởi tạo component hoặc khi hoàn tất Bước 2 ("Quét sâu nội dung"), tự động gọi `loadChunksForSource` nạp toàn bộ 122 trang/chunks từ Supabase Database vào state giao diện.
    - Tự động nhận diện khi người dùng upload hoặc chọn lại file PDF đã từng được nạp (`SGK VL 10 CD.pdf`), lập tức kết nối và hiển thị tri thức mà không cần người dùng quét lại từ đầu.
  - **Thuật toán Khớp Lý Thuyết Đa Tầng Cực Kỳ Chuẩn Xác (`currentLessonChunks`)**:
    - *Tầng 1 (Ưu tiên tuyệt đối)*: Khớp theo khoảng trang bài học (`c.pageNumber >= activeLesson.pageStart && c.pageNumber <= activeLesson.pageEnd`). Bài 1 (Trang 15–20) khớp chuẩn xác 6 trang lý thuyết gồm Tốc độ, Vận tốc, Vectơ vận tốc $\vec{v} = \frac{\Delta \vec{d}}{\Delta t}$ và thực hành đo tốc độ.
    - *Tầng 2*: Khớp theo tiêu đề bài học đã chuẩn hóa.
    - *Tầng 3*: Khớp theo từ khóa cốt lõi trong nội dung bài.
    - *Tầng 4*: Khớp theo khoảng trang của toàn bộ Chương đang chọn.
    - *Tầng 5 (Fallback an toàn)*: Hiển thị 12 chunks gần nhất của cuốn sách, đảm bảo Sector 1 **tuyệt đối không bao giờ để trắng**.
  - **Nâng Cấp Giao Diện Sector 1 Tiện Ích & Trực Quan**:
    - Bộ chuyển đổi chế độ xem linh hoạt: `[📖 Bài này (6 đoạn)]` vs `[🌐 Toàn bộ SGK (122 trang)]`.
    - Thanh tìm kiếm tức thì theo từ khóa, định nghĩa, công thức KaTeX kèm nút xóa tìm kiếm nhanh.
    - Nút `[⚡ Nạp ngay từ CSDL Supabase]` hỗ trợ nạp nóng dữ liệu tức thì.
    - Nút `[Sao chép đoạn]` (sao chép KaTeX vào clipboard) và nút `[Đưa vào Studio]` (mở trực tiếp sang `CurriculumStudioEditor`).
  - **Tách riêng 2 phân hệ rõ ràng**: Phân hệ 1 (Parse & Nạp SGK Mới - 2-Stage Pipeline) không hiển thị nội dung sách cũ kế bên; Phân hệ 2 (Kho & Studio SGK 5 Sector) chuyên sâu cho việc tra cứu, biên soạn và sinh bài tập theo 6 cấp độ Bloom.
- **Kiểm thử**: `npm run build` (`vite build`) đạt `✓ built in 1.26s` với 0 lỗi biên dịch.
