# UPDATE — V-Eval-Web_Client

## [22/11/2026]
- **Nâng Cấp Hiển Thị Lý Thuyết SGK Chuẩn EdTech (`StructuredTheoryRenderer`) Trong Pha Learn PLAR (`PlarNodeStudioPanel.jsx`)**:
  - Bổ sung bộ render lý thuyết có cấu trúc `StructuredTheoryRenderer`: tự động tách tiêu đề `##`, khối mục `###` có thanh nhấn xanh bên trái, danh sách gạch đầu dòng thoáng mắt kết hợp công thức `MathText` KaTeX mượt mà, không còn ký tự `#` thô và ưu tiên 100% học liệu thật từ `v_eval_content."Materials"`.
  - Làm sạch tiền tố `Dạng X:` / `Pattern X:` trên tiêu đề chặng học và danh sách lộ trình (`ConnectedRoadmapPage.jsx`, `PlarNodeStudioPanel.jsx`).
- **Tái Thiết Kế UX Học Tập Learn-First & Khắc Phục Lỗi Thanh Toán (`StudentRoadmapWorkspace.jsx`, `ConnectedRoadmapPage.jsx`, `TuitionPaymentView.jsx`, `curriculumAccess.js`, `paymentService.js`, `PayOsCheckoutModal.jsx`, `Sidebar.jsx`)**:
  - 1 thanh điều hướng mỏng duy nhất, mặc định mở thẳng Trang Học P-L-A-R Studio 4 tab toàn màn hình; tinh gọn lộ trình thành Accordion theo Chương; cố định Sticky Sidebar.
  - Khắc phục triệt để lỗi spam `status/undefined 404`, nhận diện chuẩn trạng thái đã đóng học phí, chặn vòng lặp event vô hạn gây giật màn hình và chuyển `PayOsCheckoutModal` sang **Event-Driven**.
- **Tinh Gọn & Chuẩn Hóa Giao Diện Sách Giáo Khoa Chuẩn & Thanh Điều Hướng Toàn Hệ Thống (`TextbookStandardView.jsx`, `AccountNavbar.jsx`, `MathText.jsx`, `textbookStateBridge.js`)**:
  - Chuyển đổi toàn bộ nhãn `Bloom L1`–`L6` sang tên mức độ nhận thức Tiếng Việt (`Nhận biết`, `Thông hiểu`, `Vận dụng cơ bản`, `Vận dụng cao`, `Đánh giá`, `Sáng tạo`) và sửa dấu tick kép `✓ ✓ Đã duyệt` ➔ `Đã duyệt`.
  - Xóa bỏ thanh chọn `Dạng bài:` ngang bị trùng lặp với cây Mục lục bên trái; thay bằng giao diện Studio 3 Tab (`1. Lý Thuyết & Công Thức`, `2. Ví Dụ & Phương Pháp`, `3. Câu Hỏi & Bài Tập`) kèm `CleanTextbookRenderer`.
  - Chuẩn hóa luồng lọc **Môn học + Khối lớp ➔ Phiên bản SGK**: chọn Môn/Lớp tự động ánh xạ thẳng tới đúng cuốn SGK đã nạp trong CSDL; dropdown chỉ liệt kê phiên bản/bộ sách của đúng Môn & Lớp đó.
  - Mở khóa 2 nút điều hướng `Sang Trang Nạp SGK` và `Mở Studio Biên Soạn` (gỡ thuộc tính `disabled` cứng trước đây).
  - Khôi phục **duy nhất 1 nút thu gọn/mở rộng Sidebar** (`PanelLeftClose` / `PanelLeftOpen`) trên `AccountNavbar.jsx` dùng thống nhất cho toàn bộ các trang.
  - Sửa triệt để lỗi hiển thị ký tự `#` dư thừa ở đầu Tab 2 (do tách `#### 3.` không khớp), lỗi lộ mã thô `\text{ mL/phút}`, `\text{ nhịp/phút}`, dấu `$` lẻ và chỉ số dưới tiếng Việt có dấu cách LaTeX (`CO_{vận\ động}`) trong `MathText.jsx` & `CleanTextbookRenderer`.
  - Nối trực tiếp **Tab 3 (`3. Câu Hỏi & Bài Tập`)** của `TextbookStandardView.jsx` tới API `contentService.getCurriculum()` & `contentService.getQuestionsBySkill(skillId)`, hiển thị đầy đủ câu hỏi trắc nghiệm A/B/C/D, bộ lọc mức độ nhận thức và lời giải từng bước từ CSDL `v_eval_content."Questions"`; sửa `contentService.getSkillsTree()` trỏ về `/api/content/curriculum` triệt tiêu 100% lỗi `404`.
- **Nâng Cấp Toàn Diện Phòng Thi Thử V-ACT & Luyện Tập Thích Ứng ZPD Học Sinh (`StudentMockExamPage.jsx`, `AdaptiveQuizModal.jsx`, `App.jsx`, `Sidebar.jsx`)**:
  - **Luyện Tập Thích Ứng ZPD (`AdaptiveQuizModal.jsx`)**: Gỡ bỏ hoàn toàn UUID giả cứng (`11111111-...`), nâng cấp thành Studio luyện tập 3 pha (Chọn Môn học / Mức độ Nhận biết–Vận dụng cao / 5–20 câu ➔ Làm bài chấm tức thì kèm độ nắm vững BKT & lời giải từng bước + Hỏi Gia sư AI ➔ Tổng kết & lưu lịch sử) lấy trực tiếp từ kho 4,068 câu hỏi thật.
  - **Phòng Thi Thử V-ACT (`StudentMockExamPage.jsx`)**: Xây dựng trang thi thử chuyên biệt (`activeTab === 'mock-exam'`) có **Khóa toàn màn hình + Giám thị chống chuyển tab/thoát fullscreen**, gồm 2 chế độ: (1) **4 Bộ Đề Chính Thức ĐHQG-HCM (2025, 2024, 2022, 2019 — 150 phút)** và (2) **Tổ Hợp Đề Thi Thử Tự Chọn**; quy đổi **thang 1200 V-ACT** & chữa đề chi tiết.
- **Chức Năng Gắn Cờ Báo Lỗi Câu Hỏi & Xóa Mục Lớp Học / Live Q&A (`questionFlagStore.js`, `FlagQuestionModal.jsx`, `FlaggedQuestionsReviewPanel.jsx`, `PlarNodeStudioPanel.jsx`, `AdaptiveQuizModal.jsx`, `StudentMockExamPage.jsx`, `AiTutorModerationView.jsx`, `Sidebar.jsx`, `App.jsx`)**:
  - Học sinh có thể bấm **Báo lỗi & Đổi câu** trực tiếp trên mọi câu hỏi (Lộ trình PLAR Preview/Apply, Luyện tập ZPD, Phòng Thi thử V-ACT) ➔ tự động đổi ngay sang câu hỏi mới và đẩy báo lỗi sang hàng đợi xét duyệt của **Giảng viên / Ban Quản lý**.
  - Giảng viên & Ban Quản lý mở mục **Kiểm duyệt** ➔ Tab **Xét Duyệt Câu Hỏi Bị Gắn Cờ** để **Chuyển đúng miền/dạng bài** (`PUT /api/content/questions/{id}`), **Xóa câu hỏi khỏi ngân hàng** (`DELETE /api/content/questions/{id}`), hoặc **Giữ nguyên**.
  - Gỡ bỏ hoàn toàn mục **Lớp học & Live Q&A** khỏi thanh Sidebar và định tuyến học sinh.
- **Kiểm Thử & Biên Dịch**: `npm run build` thành công 100% (`0 Error`).
