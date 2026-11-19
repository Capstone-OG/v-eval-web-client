# UPDATE - V-Eval-Web_Client

## [19/11/2026]
- **Khắc Phục Triệt Để Lỗi Tạp Nhiễm Tri Thức Chéo Môn Học & Chéo Chương (`CurriculumExplorerView.jsx`, `UnifiedNodeDetailView.jsx`, `textbookStateBridge.js`)**:
  - *Bộ Lọc Phạm Vi Tri Thức 4 Lớp (Strict Scoping Hierarchy)*:
    + Cập nhật các hàm `getMatchedChunksForChapter`, `getMatchedChunksForLesson`, `getMatchedChunksForPattern` với cơ chế nhận diện môn học tự động (`detectSubjectFromContext`, `isSubjectCompatible`) và cô lập theo Chương (`parentChapter`) và Bài học (`parentLesson`).
    + Triệt tiêu hoàn toàn lỗi hiển thị 46 chunks tạp nhiễm (chứa cả Bất phương trình bậc hai một ẩn từ Chương 2, Hình học toạ độ từ Chương 4 và Phân lớp electron từ Hóa học 10 vào Dạng 1 của Bài 1: Không gian mẫu và biến cố trong Chương 10 Toán học). Đúng 19 trang tri thức chuẩn xác của Bài 1 được nạp vào Khối 1.
  - *Siết Chặt Thuật Toán So Khớp Mờ (`isFuzzyLabelMatch`)*:
    + Nâng cấp thuật toán so khớp nhãn: Đối với nhãn ngắn (`` `minWords \le 2` ``), yêu cầu trùng khớp 100% số từ khóa có nghĩa; đối với nhãn dài hơn, yêu cầu trùng khớp tối thiểu 60% (`Math.ceil(minWords * 0.6)`), loại bỏ triệt để các trường hợp match bừa bãi do trùng tiếp đầu ngữ.
  - *Hàng Rào Bảo Vệ Chống Chéo Môn Trong `buildTheoryFromChunks`*:
    + Tích hợp bộ lọc từ khóa chuyên biệt theo môn học: Khi tổng hợp lý thuyết Toán học, tự động loại trừ các đoạn văn bản chứa thuật ngữ Hóa học (electron, orbital, phân lớp, este, halogen...); khi tổng hợp Hóa học, loại trừ các công thức hình học toạ độ và bất phương trình.
  - *Tích Hợp Quick Pattern Switcher Pills Cho Khung Chương Trình (`UnifiedNodeDetailView.jsx`)*:
    + Bổ sung thanh chọn Dạng bài nhanh ngay dưới tiêu đề của `UnifiedNodeDetailView`, cho phép giáo viên và học sinh chuyển đổi 1-click giữa các Dạng bài của Bài học, đồng bộ 100% với giao diện Sách Giáo Khoa chuẩn.
- **Đồng Nhất Kiến Trúc 3 Tầng Sư Phạm & Phân Định Lý Thuyết Riêng Từng Dạng Bài (`TextbookStandardView.jsx`, `TextbookIngestView.jsx`)**:
  - Tái cấu trúc chuẩn hóa giao diện Sách Giáo Khoa theo đúng 3 tầng sư phạm chuẩn của `UnifiedNodeDetailView.jsx`: Khối 1 (Lý thuyết trọng tâm chuẩn SGK), Khối 2 (Phương pháp giải chi tiết & bài toán mẫu), Khối 3 (Ngân hàng câu hỏi SGK) và Khối 4 (Đoạn trích OCR).
  - Tích hợp Quick Pattern Switcher pills, khắc phục triệt để nút AI sinh lý thuyết & mở rộng nội dung bị liệt (`isEdited: true`, `targetPatIdx`, Pedagogical Synthesis Fallback).
- **Kiểm Thử Vận Hành & Biên Dịch**:
  - `npm run build`: Hoàn thành biên dịch sạch sẽ trong 3.06s với 3054 modules transformed (0 Warning, 0 Error).
