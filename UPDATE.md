# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [17/11/2026] - Tối Giản Hóa Giao Diện Cổng Phụ Huynh: Loại Bỏ Báo Cáo Năng Lực 4 Miền & Cây Tri Thức Chuyên Đề Khỏi Sidebar & Điều Hướng

- **Tinh Gọn Điều Hướng Sidebar Phụ Huynh ([`Sidebar.jsx`](./src/components/layout/Sidebar.jsx))**:
  - Loại bỏ 2 mục điều hướng sư phạm chuyên sâu của học sinh khỏi nhóm *Không Gian Phụ Huynh*:
    - Mục `id: 'analytics'` ("Báo cáo Năng lực 4 Miền" - Biểu đồ tiến bộ & Dự báo điểm).
    - Mục `id: 'roadmap'` ("Cây Tri thức & Chuyên đề" - Theo dõi lộ trình học của con).
  - Tối ưu thanh Sidebar của phụ huynh tập trung 100% vào các tính năng đồng hành cốt lõi: **Tổng quan Đồng hành (`dashboard`)**, **Lịch sử Bài thi của Con (`history`)**, và **Đóng Học phí & Gói học (`tuition`)** qua cổng PayOS.
- **Chuẩn Hóa Danh Mục Tab Cổng Phụ Huynh & Rào Chắn Điều Hướng ([`App.jsx`](./src/App.jsx))**:
  - Cập nhật cấu hình `ROLE_PORTAL_DEFINITIONS.parent.tabs`, loại bỏ các tab `analytics` và `roadmap`.
  - Thiết lập rào chắn `activeTab === 'roadmap' && role !== 'parent'` và `activeTab === 'analytics' && role !== 'parent'`, tự động điều hướng an toàn về `ParentDashboardView` khi phụ huynh truy cập nhầm các đường dẫn học tập của học sinh.
  - Ngắt các callback điều hướng lộ trình/luyện tập học sinh khỏi màn hình thanh toán học phí khi phụ huynh xem giao diện `TuitionPaymentView`.
- **Kiểm Thử & Biên Dịch Toàn Diện**:
  - `npm run build`: Biên dịch thành công 100% trong 1.68s, 0 lỗi.
  - `node --test tests/*.test.js`: Đạt **22/22 unit tests pass 100%**.
