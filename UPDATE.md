# UPDATE — V-Eval-Web_Client

## [23/11/2026]
- **Tối Ưu Hóa Trải Nghiệm Người Dùng & Loại Bỏ Thuật Ngữ Kỹ Thuật Khung Chương Trình Cho Phân Hệ Giảng Viên (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `ExamBankView.jsx`, `ExamWorkspaceHeader.jsx`, `TextbookStandardView.jsx`, `TextbookIngestView.jsx`)**:
  - *Tái cấu trúc giao diện Tra cứu Khung chương trình (`CurriculumExplorerView.jsx`)*:
    + Loại bỏ nhãn kỹ thuật `(Read-only)`, thay thế badge thành `Khung chương trình chuẩn` với biểu tượng trực quan, thanh nhã.
    + Đổi thanh tìm kiếm sang thông điệp thân thiện: `Tìm kiếm chương, bài học, dạng bài...` (loại bỏ từ kỹ thuật KaTeX).
    + Chuyển đổi nhãn phân loại năng lực sang thuật ngữ sư phạm: `Cần bổ trợ (<10%)`, `Cần củng cố (<60%)`, `Đã nắm vững (≥60%)`.
    + Chuẩn hóa tiêu đề cây học liệu thành `Danh sách chương & bài học` (loại bỏ cụm từ kỹ thuật `CẤU TRÚC PHÂN CẤP BÀI HỌC`).
    + Ẩn hoàn toàn nút quản trị `+ Thêm Chương` đối với vai trò Giảng viên (chỉ hiển thị cho Quản trị viên/Giám đốc học thuật).
    + Tinh giản thẻ chương học: Loại bỏ dòng thông tin kỹ thuật `Trọng số: ...%` và số trang phân đoạn `Đã nạp SGK (x trang)`, thay bằng huy hiệu `Sách giáo khoa` chuẩn mực và số lượng bài học trực quan.
    + Tinh giản danh sách bài học và dạng bài: Thay thẻ `dạng` thô thành `dạng bài`, bỏ hoàn toàn số liệu trọng số `pat.weight`, hiển thị nhãn `Dạng bài` và phân mức nhận thức sư phạm rõ ràng (`Cần bổ trợ`, `Cần củng cố`, `Đã vững`).
    + Tối ưu thông điệp trạng thái trống: Hướng dẫn người dùng chọn bài học/dạng bài từ danh sách thay cho thuật ngữ kỹ thuật cây phân cấp.
  - *Chuẩn hóa hiển thị chi tiết sư phạm (`UnifiedNodeDetailView.jsx`)*:
    + Loại bỏ nhãn `Trọng số: 5%` và thông tin phân mảnh `Khớp x trang SGK DB`, thay bằng huy hiệu `Nội dung chuẩn SGK`.
    + Ẩn nút `Mở Studio Sư Phạm` khi Giảng viên ở chế độ tra cứu.
    + Khối 1: Chuẩn hóa thành `Khối 1: Lý Thuyết Trọng Tâm Chuẩn SGK`, huy hiệu `Kiến thức cốt lõi`, loại bỏ thuật ngữ CSDL SGK.
    + Khối 2: Đổi thành `Khối 2: Phương Pháp Giải & Mô Hình Minh Họa Trực Quan`, huy hiệu `Mô hình trực quan`, loại bỏ các tên thư viện kỹ thuật nội bộ.
    + Khối 3: Đổi thành `Khối 3: Ngân Hàng Câu Hỏi Luyện Tập`; bộ lọc nhận thức hiển thị nhãn sư phạm đầy đủ (`Tất cả`, `Nhận biết`, `Thông hiểu`, `Vận dụng`, `Vận dụng cao`) thay vì mã kỹ thuật `L1`, `L2`, `L3`, `L4`; các câu hỏi hiển thị đúng tên mức độ nhận thức.
  - *Đồng bộ loại bỏ nhãn `(Read-only)` trên toàn hệ thống học liệu*:
    + `ExamBankView.jsx`: Đổi thành `Kho đề thi chuẩn đã xuất bản`.
    + `ExamWorkspaceHeader.jsx`: Đổi thành `Chế độ xem đề thi`.
    + `TextbookStandardView.jsx`: Đổi thành `Tra cứu SGK chuẩn GDPT 2018`.
    + `TextbookIngestView.jsx`: Đổi thành `Chế độ tra cứu tài liệu học liệu` và huy hiệu `CHẾ ĐỘ TRA CỨU`.
- **Tối Ưu Hóa Giao Diện & Đồng Bộ 100% Dữ Liệu Học Sinh Thực Tế Cho Buổi Học Offline (TCH-02) (`TeacherScheduleView.jsx`, `OfflineSessionPreparationModal.jsx`, `offlineSessionStore.js`, `tests/offlineSessionStore.test.js`)**:
  - *Tái thiết kế Modal Chuẩn bị Buổi học*: Loại bỏ toàn bộ thuật ngữ kỹ thuật nội bộ (`Mô hình lớp học đảo ngược`, `Giảng viên tự quyết 100%`, `ZPD`, `Vi mô`, `Heatmap`, `WS-ZPD-ENG-01`).
  - Giao diện phân tách 2 tab gọn gàng: `1. Chữa bài chung cả lớp` và `2. Nhóm học tập tại bàn`.
  - Kết nối trực tiếp danh sách học sinh thực tế từ CSDL (`Trần Thái Thịnh`, `Trần Ngọc Mai`, `Mai Thành Nhân`, `Lê Hoàng Long`, `Nguyễn Hoàng An`, `Phạm Tấn Lộc`), tự động chia bàn học cân đối; tự động thanh lọc bộ nhớ cache cũ.
  - Tinh giản thẻ ca học trên Thời khóa biểu: Rút gọn thành 2 mục `1. Chữa bài chung` và `2. Nhóm tại bàn`; nút hành động đổi thành `Chuẩn bị buổi học`.
- **Chuẩn Hóa Phân Quyền Maker - Checker Học Liệu & Đề Thi Cho Role Teacher (`TextbookIngestView.jsx`, `TextbookStudioView.jsx`, `CurriculumStudioEditor.jsx`, `ExamWorkspaceHeader.jsx`, `App.jsx`)**:
  - Áp dụng cơ chế phân quyền Maker cho Giảng viên: Cho phép biên soạn bản nháp và gửi duyệt (`PENDING_REVIEW`), ẩn nút xuất bản và xóa học liệu cấp hệ thống.
- **Kiểm Thử & Biên Dịch**:
  - `npm run build`: Hoàn thành 100% trong 1.18s (`3083 modules transformed`, `0 Error`).
  - Unit tests: **24/24 unit tests passed 100%** (`tests/*.test.js`).
