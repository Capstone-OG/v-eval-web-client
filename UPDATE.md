# V-Eval Web Client — Cập Nhật Tiến Độ

## [23/11/2026] - Phê Duyệt Lộ Trình 2 Cấp, Thiết Kế Lại Pha Reflect & Tối Ưu UX Học Tập

- **Luồng Phê Duyệt Lộ Trình 2 Cấp (`ConnectedRoadmapPage.jsx`, `RoadmapApprovalStudioView.jsx`, `Sidebar.jsx`, `App.jsx`, `practiceService.js`)**:
  - Gỡ nút tự tạo/cập nhật lộ trình trên màn hình học sinh; hiển thị banner tiến trình 3 bước duyệt (`Thi đầu vào 30 câu -> Giảng viên tinh chỉnh -> Giám đốc phê duyệt`) và khóa học P-L-A-R cho tới khi lộ trình `ACTIVE`.
  - Xây dựng giao diện `RoadmapApprovalStudioView.jsx` cho **Giảng viên** (`Duyệt lộ trình học sinh`: sửa mục tiêu, thêm/ẩn chặng, đổi thứ tự ưu tiên, ghi chú & gửi duyệt) và **Director / Quản lý học thuật** (`Phê duyệt Lộ trình HS`: kích hoạt `ACTIVE` hoặc trả lại giảng viên).
- **Thiết Kế Lại Pha Reflect, Thẻ Hoàn Thành & Thanh Lọc Lộ Trình (`PlarNodeStudioPanel.jsx`, `ConnectedRoadmapPage.jsx`)**:
  - Thiết kế lại thẻ `Pha R — Reflect` (gợi ý & placeholder tự đổi theo từng nhóm môn) và thẻ **Hoàn Thành Chặng P-L-A-R** (vòng tròn SVG tiến độ thành thạo, 3 thẻ chỉ số thành tích, nhật ký phản tư 2 cột, nút `Sang Chặng Kế Tiếp` luôn ổn định kể cả sau khi F5).
  - Tối ưu thanh lọc lộ trình thành Segmented Control gọn 1 hàng theo thứ tự: `Ưu tiên -> Chưa đánh giá -> Đã đạt OK -> Đã hoàn thành -> Tất cả`.
  - Bổ sung cơ chế giữ mở khóa chặng đang học dở (`LEARN/APPLY/REFLECT/REMEDIAL`) và sửa lỗi mất trạng thái đang xem lý thuyết khi `onNodeEvaluated` làm mới dữ liệu.
- **Công Cụ Nháp Toán & Sửa Lỗi Hiển Thị (`MathScratchpadButton.jsx`, `StudentBookmarkDrawer.jsx`, `MathText.jsx`, `index.css`)**:
  - Thêm nút `Nháp Toán` gọi nhanh Drawer mô phỏng 3D/2D/Đồ thị/FX-580 ngay tại bài học và bài tập.
  - Sửa lỗi dính chữ `vàB`/`cốB` và lỗi lệch cặp ký hiệu toán học trong `MathText.jsx`; thêm `caret-color: transparent` toàn trang cho phần tử không nhập liệu trong `index.css`.
- **Kiểm Thử**: `npm run build` đạt `3096+ modules`, `0 Error`.
