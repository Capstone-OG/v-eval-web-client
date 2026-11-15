# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [15/11/2026] - Triển Khai Quản Lý Phiên Hội Thoại Đa Lượt Cho Gia Sư AI Socratic & Tái Thiết Kế Toàn Diện Bố Cục Trang Chủ Quản Lý Học Thuật Đồng Bộ Ngôn Ngữ Student Portal

- **Khắc Phục Lỗi Hiển Thị Chi Tiết Lịch Sử Làm Bài Khảo Thí ĐGNL ([`DiagnosticAssessmentPage.jsx`](./src/components/diagnostic/DiagnosticAssessmentPage.jsx))**:
  - **Khắc phục triệt để placeholder `"API lịch sử không cung cấp nội dung câu hỏi."`**: Nâng cấp hàm `openHistoryExam` trực tiếp tiêu thụ DTO giàu dữ liệu (`data.questions`) được làm giàu tự động từ backend Practice Service thông qua pipeline gRPC với Content Service (`q.content`, `q.options`, `q.explanation`, `q.passageContent`, `q.passageTitle`).
  - **Khử bỏ hoàn toàn lỗi `"Câu 0:"` và `"Bloom 0/6"`**: Tự động kế thừa thứ tự câu và độ khó Bloom chuẩn hóa từ backend (`q.questionOrder` và `q.difficultyLevel`), kết hợp bộ đệm an toàn theo chỉ mục (`idx + 1`) không phụ thuộc vào chuỗi hardcode.
  - **Hiển thị đầy đủ lưới 4 phương án A/B/C/D, ngữ cảnh bài đọc & Lời giải chi tiết**: Tái tạo trọn vẹn bảng câu hỏi với đầy đủ công thức toán học LaTeX render qua KaTeX, đánh dấu nổi bật phương án đúng (xanh lục), phương án học sinh chọn sai (đỏ), và hiển thị ngữ cảnh bài đọc hiểu (`passage_content`).
- **Quản Lý Phiên Hội Thoại Đa Lượt Gia Sư AI Socratic ([`aiSessionManager.js`](./src/utils/aiSessionManager.js), [`AISocraticTutorModal.jsx`](./src/components/modals/AISocraticTutorModal.jsx), [`aiSessionManager.test.js`](./tests/aiSessionManager.test.js))**:
  - **Kiến Trúc Lưu Trữ Lai Đa Tầng (Hybrid Progressive Persistence)**: Xây dựng module `aiSessionManager` lưu trữ phiên cục bộ theo từng định danh học sinh (`veval_socratic_sessions_${userId}`), bảo toàn 100% dòng suy nghĩ và chuỗi tin nhắn khi học sinh đóng modal, tải lại trang hay đổi câu hỏi.
  - **Thanh Lịch Sử Trượt Mở (Collapsible Session History Drawer)**: Thiết kế cột lịch sử phiên hỏi đáp bên trái (`w-72 sm:w-80`) với nút bật/tắt linh hoạt (`PanelLeftClose`/`PanelLeftOpen`), đếm tổng số phiên, nút tạo mới `+ Bắt đầu phiên hỏi mới` và thanh tìm kiếm nhanh theo câu hỏi/chuyên đề.
  - **Gộp & Đồng Bộ Ngầm Đám Mây Supabase**: Tự động kết nối `practiceService.getAiTutorInteractions()` tải các tương tác lịch sử từ bảng `v_eval_ai.ai_tutor_interaction_logs` trên Supabase, gộp vào danh sách phiên mà không làm gián đoạn hội thoại hiện hành.
  - **Tự Động Kế Thừa Bối Cảnh Câu Hỏi**: Khi mở từ câu trắc nghiệm làm sai (`initialContext`), tự động nạp phiên cũ nếu đã từng hỏi hoặc khởi tạo phiên mới gắn chặt đề bài KaTeX và phương án chọn sai.
  - **Không Gian Đối Thoại Đa Nhiệm Mở Rộng**: Tự động co giãn kích thước modal lên `max-w-5xl h-[90vh]` khi mở thanh lịch sử và `max-w-3xl` khi thu gọn.
  - **Khắc Phục Lỗi Vi Phạm React Rules of Hooks**: Tái cấu trúc toàn bộ khai báo hooks lên đầu component `AISocraticTutorModal.jsx`, di chuyển `if (!isOpen) return null` xuống ngay trước `return JSX`, chấm dứt triệt để lỗi *"Rendered more hooks than during the previous render"* khi mở modal.
- **Tái Thiết Kế Toàn Diện Bố Cục Trang Chủ Quản Lý Học Thuật ([`CampusManagerDashboardView.jsx`](./src/components/dashboard/CampusManagerDashboardView.jsx), [`EarlyWarningsMentorPanel.jsx`](./src/components/dashboard/EarlyWarningsMentorPanel.jsx), [`App.jsx`](./src/App.jsx))**:
  - **Khắc Phục Triệt Để Lỗi Phần Trăm (6688% BKT & 7600%)**: Xây dựng hàm chuẩn hóa `normalizeMasteryPct` tự động nhận diện thang đo thập phân (0-1) hoặc phần trăm (0-100), đưa mức làm chủ 4 miền về đúng `76%`, `53%`, `68%`, `71%` và chỉ số toàn cơ sở về đúng **`67% BKT`** (chấm dứt hoàn toàn lỗi hiển thị `6688%` và `7600%`).
  - **Tích Hợp Lời Chào Vào Flagship HeroBanner**: Loại bỏ dòng chữ thô bên ngoài, tích hợp lời chào trang trọng *"Chào mừng Quản lý Học thuật, Nguyễn Duy Khôi!"* cùng dải chuyển động luân phiên 4 thông điệp sư phạm (`Sparkles`), chip năng lực vàng `#FACC15` và thẻ kính mờ điều phối cơ sở.
  - **Chuẩn Hóa 4 Thẻ KPI Symmetrical Theo Phong Cách [`MetricsGrid.jsx`](./src/components/dashboard/MetricsGrid.jsx)**: 4 thẻ đối xứng (Học viên hoạt động, Giảng viên cơ sở, Quy mô lớp học, Năng lực toàn cơ sở) có micro-tags, badge trạng thái và footer điều hướng.
  - **Nâng Cấp Bảng Ma Trận Nhiệt Đối Sánh 4 Miền Cấp Cơ Sở (Flow 5)**: Bảng dữ liệu Enterprise SaaS với thanh đo sĩ số lớp trực quan, ô năng lực bo góc hiển thị rõ % làm chủ và % học sinh yếu, nhãn rủi ro sư phạm và nút hành động *"Sơ Đồ Bàn Vi Mô"* hiệu ứng chuyển màu cao cấp.
  - **Tối Ưu Hóa 2 Cột Lớp Học Offline & Đội Ngũ Giảng Viên**: Thẻ lớp học hiển thị tiến độ ZPD chuẩn hóa, danh sách giảng viên bổ sung avatar chữ cái viết tắt, badge trạng thái tài khoản màu chuẩn (`Active` xanh lục, `Locked` đỏ nhạt) và khung thông tin quy trình bảo mật IAM.
  - **Nâng Cấp Bảng Điều Phối Cảnh Báo Sớm 3 Tầng**: Tinh chỉnh 6 thẻ thống kê phân tầng cảnh báo BR-04 với phong cách `card-shadow` hiện đại và bộ lọc danh sách mượt mà.
- **Phân Hệ Kiểm Duyệt Báo Cáo Gia Sư AI Socratic ([`AiTutorModerationView.jsx`](./src/components/dashboard/AiTutorModerationView.jsx), [`Sidebar.jsx`](./src/components/layout/Sidebar.jsx))**:
  - Giao diện kiểm duyệt đàm thoại AI dành riêng cho Quản lý học thuật với 4 KPI thời gian thực, hàng đợi split-pane, đối soát đáp án KaTeX, chat Socratic và 3 hành động sư phạm can thiệp Knowledge Graph.
  - Rút gọn badge Sidebar thành `Flow 4` giải quyết triệt để lỗi co cắt chữ trên thanh điều hướng Sidebar.
- **Kiểm Thử & Biên Dịch**:
  - `npm run build`: Thành công 100% trong 1.19s.
  - `node --test`: Đạt 36/36 unit tests pass (bao gồm 5 bài test chuyên sâu cho `aiSessionManager`).
  - `npm run lint`: 0 lỗi linter.
