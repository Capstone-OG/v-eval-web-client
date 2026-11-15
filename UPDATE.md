# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [15/11/2026] - Triển Khai Phân Hệ Kiểm Duyệt Gia Sư AI & Tái Thiết Kế Toàn Diện Bố Cục Trang Chủ Quản Lý Học Thuật Đồng Bộ Ngôn Ngữ Student Portal

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
- **Dữ Liệu Supabase & API Client ([`practiceService.js`](./src/services/practiceService.js))**:
  - Mở rộng 3 phương thức API: `overrideTutorExemplar`, `addTutorNovelTrap`, `resolveTutorReport`.
  - Cập nhật 3 bản ghi mẫu vào bảng `v_eval_ai.ai_tutor_interaction_logs` trên Supabase bảo đảm màn hình nạp dữ liệu thực tức thì.
- **Kiểm Thử & Biên Dịch**:
  - `npm run build`: Thành công 100% trong 1.10s.
  - `node --test`: 31/31 unit tests pass.
  - `npm run lint`: 0 lỗi linter.
