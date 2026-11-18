# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [19/11/2026] - Nâng Cấp Toàn Diện Trải Nghiệm Giao Diện Cổng Phụ Huynh & Lịch Sử Bài Thi Của Con (Parent Companion Portal & Submission History)

- **Tái Cấu Trúc Toàn Diện Hero Header & Thông Tin Ngữ Cảnh Con ([`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx))**:
  - Khắc phục triệt để tình trạng 2 banner màu xanh đậm cồng kềnh xếp chồng lên nhau gây nặng nề và rời rạc thị giác.
  - Tích hợp trực tiếp các chip thông tin trường lớp của con (`Trường THPT`, `Khối lớp`, `Ngành mục tiêu NV1`) ngay dưới tên học sinh trong Hero Header (`from-slate-900 via-indigo-950 to-blue-950`), giúp phụ huynh nhanh chóng nhận diện bối cảnh học tập của con.
  - Loại bỏ hoàn toàn khối giáo viên hiển thị tạm bợ, chật chội trôi nổi bên trong Hero Banner.
- **Tinh Tế Hóa Khối Thanh Toán Học Phí PayOS (Tuition Ribbon) ([`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx))**:
  - Chuyển đổi từ banner gradient xanh đậm 200px cồng kềnh thành ribbon thông báo tài chính thanh lịch với tông màu sáng dịu (`bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200/80`).
  - Tích hợp biểu tượng `ShieldCheck`, nhãn dịch vụ học tập, mức học phí rõ ràng (5.000 ₫) và nút kêu gọi hành động VietQR quét mã tức thì.
- **Nâng Cấp Thiết Kế 4 Thẻ Chỉ Số Trọng Tâm (4 Metric Cards Grid) ([`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx))**:
  - Đồng bộ hóa cấu trúc 4 thẻ (`Mức Độ Sẵn Sàng Thi`, `Giờ Tự Học Tuần Này`, `Chuỗi Ngày Chuyên Cần`, `Độ Phủ Kiến Thức ĐGNL`) với icon badge màu ngữ nghĩa bo cong (`w-8 h-8 rounded-xl`), số liệu đậm nét và nhãn trạng thái sinh động.
  - Cập nhật hàm thông minh `getTierInfo` phân loại chuẩn xác 4 cấp bậc sẵn sàng (`NOT_READY`, `PREPARING`, `ACCELERATING`, `READY`), loại bỏ hoàn toàn lỗi hiển thị sai lệch khi điểm thấp (19.2/100) bị gắn nhãn màu xanh "Sẵn sàng".
- **Hài Hòa Hóa 3 Trụ Cột Đánh Giá Năng Lực & Khối Giáo Viên Phụ Trách ([`ParentDashboardView.jsx`](./src/components/dashboard/ParentDashboardView.jsx))**:
  - Thiết kế từng trụ cột thành các khối thẻ micro tinh tế với số thứ tự đánh dấu (1, 2, 3), thanh đo gradient mượt mà và lời giải thích ngắn gọn, dễ hiểu.
  - Đưa khối thông tin giáo viên phụ trách về đúng vị trí tại cột phải trong card `Giáo Viên Phụ Trách & Cố Vấn Học Vụ`: hiển thị avatar ký tự, tên giảng viên phụ trách thật hoặc nhãn trung thực *"Chưa có giáo viên phụ trách"*, số điện thoại liên hệ, thông tin lớp học và nút *"Đăng Ký Lịch Trao Đổi 1-1 Với Giáo Viên"*.
- **Chuẩn Hóa Giao Diện Lịch Sử Bài Thi Của Con ([`SubmissionHistoryView.jsx`](./src/components/diagnostic/SubmissionHistoryView.jsx))**:
  - **Đồng bộ Hero Header sang chủ đề Navy-Indigo sang trọng**: Chuyển banner sang tông màu `from-slate-900 via-indigo-950 to-blue-950` đồng điệu với trang Tổng quan, bổ sung thanh chọn nhanh con đa năng linh hoạt.
  - **Triệt tiêu thuật ngữ kỹ thuật khó hiểu**:
    - Chuyển đổi hiển thị chỉ số toán học psychometrics khô khan (`Theta IRT: -1.8333`) sang phân cấp sư phạm nhân văn và dễ hiểu qua hàm `formatThetaDisplay` (*"Khởi đầu nền tảng - Cần gia đình kèm cặp ôn tập thêm"* / *"Đạt chuẩn"* / *"Vượt trội"*).
    - Xóa bỏ hậu tố kỹ thuật tiếng Anh `(DIAGNOSTIC)` trong tên bài thi; chuẩn hóa các nhãn phân loại thành *"Khảo sát ĐGNL (30 câu)"*, *"Luyện tập thích ứng"*, *"Chuyên đề"*.
    - Làm mới thông điệp: loại bỏ các thuật ngữ developer như *"phân tích tư duy Socratic"*, thay bằng *"hướng dẫn giải chi tiết và gợi ý phương pháp giải"*.
  - **Khắc phục lỗi đếm lệch câu làm sai (0 câu vs 26 câu)**: Tính toán chính xác tổng số câu làm chưa đúng (`summaryStats.totalWrong = totalQuestions - totalCorrect`) trên toàn bộ các bài thi, hiển thị trung thực `26 câu` và bổ sung hướng dẫn người dùng bấm vào bài làm để tải chi tiết câu hỏi vào sổ tay.
- **Kiểm Thử & Biên Dịch**:
  - `npm run build`: Hoàn thành trong 1.15s, 0 lỗi biên dịch.
  - `node --test tests/*.test.js`: Đạt **22/22 tests passed**.
