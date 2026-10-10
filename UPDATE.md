# Nhật Ký Cập Nhật (Update Log) - Web Client

## [10/10/2026] - Giao Diện Quản Lý Nhóm Học Tập Vi Mô (Micro Study Groups: 3 - 5 Học Sinh) & Phân Bổ Sơ Đồ Bàn Học Offline

- **Xây Dựng Modal Sơ Đồ Nhóm Bàn Học Vi Mô (`ClassMicroGroupsModal.jsx`)**:
  - Triển khai giao diện phân bổ trạm bàn học offline của lớp (Trần sĩ số 20 học sinh, mỗi nhóm bàn từ 3 đến 5 học sinh).
  - Tích hợp bộ chọn quy mô nhóm bàn (`3 bạn/bàn`, `4 bạn/bàn`, `5 bạn/bàn`) kết nối trực tiếp với thuật toán gom cụm đồng nhất (Homogeneous Clustering) theo lỗ hổng kiến thức.
  - Hiển thị chi tiết từng trạm bàn học: Tên bàn học sư phạm, chủ đề trọng tâm `FocusArea`, tag các kỹ năng yếu chung (`CommonWeakSkills`), danh sách học sinh tại bàn kèm chỉ số thành thạo kiến thức.
  - Tính năng **Phân phối đề luyện tập thích ứng** trực tiếp cho bàn học (`practiceService.assignGroupWorksheet`), hiển thị trạng thái phát đề và thời gian thực.
  - Bổ sung nút xuất file sơ đồ bàn học dạng PDF cho Giảng viên in ra phát tận bàn offline.
- **Nâng Cấp Cổng Điều Hành Học Thuật Cơ Sở (`CampusManagerDashboardView.jsx`)**:
  - Chuẩn hóa danh sách lớp học offline theo cơ chế trần 20 học sinh và số thứ tự tăng dần (`Lớp Nền tảng 01`, `Lớp Nền tảng 02`, `Lớp Tăng tốc 01`, `Lớp Bứt phá 01`).
  - Hiển thị badge sĩ số chuẩn hóa: `Sĩ số: {studentCount}/20`.
  - Tích hợp nút hành động **"Sơ Đồ Nhóm Bàn (3 - 5 Bạn)"** trên từng thẻ lớp học, mở modal tương tác trực tiếp.
  - Bổ sung nút **"Tự Động Gom Cụm AI"** trên thanh công cụ lớp học gọi trực tiếp API K-Means Elbow Method (`practiceService.autoClusterClasses`).
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` thành công 100% (**0 Error, 0 Warning**).
