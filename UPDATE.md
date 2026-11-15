# NHẬT KÝ CẬP NHẬT (UPDATE LOG) - V-EVAL WEB CLIENT

## [15/11/2026] - Triển Khai Phân Hệ Kiểm Duyệt Báo Cáo Gia Sư AI & Tái Thiết Kế Bố Cục Đồng Bộ Chuẩn Student Portal (Core Flow 4: Human-in-the-Loop & GraphRAG Feedback)

- **Tái Thiết Kế Toàn Diện Giao Diện Quản Lý Học Thuật Đồng Bộ Ngôn Ngữ Student Portal ([`AiTutorModerationView.jsx`](./src/components/dashboard/AiTutorModerationView.jsx), [`CampusManagerDashboardView.jsx`](./src/components/dashboard/CampusManagerDashboardView.jsx), [`Sidebar.jsx`](./src/components/layout/Sidebar.jsx))**:
  - **Hero Banner Học Thuật Sang Trọng**: Thay thế banner nền tối cũ bằng dải gradient xanh dương - chàm hoàng gia (`from-blue-700 via-indigo-700 to-blue-900`) đồng bộ với [`HeroBanner.jsx`](./src/components/dashboard/HeroBanner.jsx) của học sinh, tích hợp hiệu ứng orb tán xạ vàng `#FACC15` và ngọc bích `cyan-400`.
  - **Thẻ Kính Mờ GraphRAG Monitor**: Bổ sung khung giám sát thời gian thực với độ tin cậy Socratic 97.6%, dung lượng tri thức 142 Exemplars / 68 Traps và trạng thái đồng bộ CSDL.
  - **Chuẩn Hóa 4 Thẻ KPI Theo Phong Cách [`MetricsGrid.jsx`](./src/components/dashboard/MetricsGrid.jsx)**: 4 thẻ đối xứng có nhãn micro-tag in hoa, badge màu trạng thái, số liệu 3D sắc nét và nút footer 1-click lọc nhanh danh sách.
  - **Không Gian Đối Soát & Thẩm Định Split-Pane**:
    - Cột hàng đợi: Card trắng `rounded-3xl` cao cấp, viền trái mang màu trạng thái (đỏ chờ xử lý, xanh đã giải quyết), avatar chữ cái viết tắt học sinh và hiển thị nguyên văn lý do khiếu nại.
    - Cột thẩm định: Hiển thị công thức KaTeX qua [`MathText.jsx`](./src/components/common/MathText.jsx), đối chiếu trực quan đáp án đúng CSDL (xanh) vs đáp án học sinh chọn sai (đỏ), bong bóng chat Socratic và bàn làm việc 3 tab can thiệp sư phạm.
  - **Khắc Phục Co Cắt Chữ Sidebar**: Rút gọn badge từ `Core Flow 4` thành `Flow 4`, giải quyết triệt để lỗi co cắt chữ trên thanh điều hướng Sidebar.
- **Dữ Liệu Supabase & API Client ([`practiceService.js`](./src/services/practiceService.js))**:
  - Bổ sung 3 phương thức API: `overrideTutorExemplar`, `addTutorNovelTrap`, và `resolveTutorReport`.
  - Cập nhật 3 bản ghi mẫu vào bảng `v_eval_ai.ai_tutor_interaction_logs` trên Supabase bảo đảm màn hình nạp dữ liệu thực tức thì.
- **Kiểm Thử & Biên Dịch**:
  - `npm run build`: Thành công 100% trong 1.09s.
  - `node --test`: 31/31 unit tests pass.
  - `npm run lint`: 0 lỗi linter.
