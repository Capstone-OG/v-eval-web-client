# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [09/10/2026] - Nâng Cấp Bố Cục Full-Width Footer, Di Dời Logo Header & Tối Ưu Giao Diện Floating Sidebar

- **Tái Cấu Trúc Bố Cục Trang Dashboard (`App.jsx`)**:
  - **Footer Chiếm Full 100% Chiều Ngang (`PublicFooter.jsx`)**: Đưa `PublicFooter` ra ngoài wrapper cột bên phải, đặt ở tầng gốc trang Dashboard để trải dài 100% chiều ngang màn hình (`w-full bg-slate-950`).
  - **Sidebar Cuộn Theo Trang (Natural Scroll-up)**: Cấu hình `Sidebar` dạng `sticky top-20` bên trong container giữa, tự động cuộn lên trên theo luồng nội dung khi người dùng cuộn xuống dưới cùng để nhường trọn vẹn diện tích chiều ngang cho `PublicFooter`.
  - **Tạo Khoảng Cách Đệm Thông Thoáng (Bottom Spacing)**: Bổ sung `pb-16 lg:pb-24` cho thẻ `<main>` tránh tình trạng các khối card và nút bấm làm bài bị dính sát vào Footer.
- **Di Dời Logo Thương Hiệu & Tinh Chỉnh Thanh Header (`Navbar.jsx` & `Sidebar.jsx`)**:
  - **Đưa Logo Lên Top Navbar**: Chuyển cụm Logo thương hiệu **ĐGNL AI v2.4** cùng phụ đề *"Khảo thí & Luyện thi Thích ứng 4.0"* từ Sidebar lên góc trái trên cùng của thanh Header (`Navbar.jsx`).
  - **Đẩy Danh Mục Sidebar Lên Sát Đỉnh**: Loại bỏ khối logo cũ ở Sidebar, giúp mục *"KHẢO THÍ & LUYỆN TẬP"* được đẩy sát lên đỉnh Sidebar, tối ưu không gian hiển thị danh sách điều hướng.
  - **Giao Diện Sidebar Bo Tròn Nổi (Floating Rounded Card)**: Thiết kế Sidebar dạng Card bo tròn 4 góc `rounded-2xl`, hiệu ứng kính mờ `bg-white/95 backdrop-blur-md`, viền mờ `border-slate-200/80` và đổ bóng `shadow-md shadow-slate-200/40`.
- **Tối Ưu Giao Diện Bài Thi Chẩn Đoán Flow 1 & Bảo Mật Mã Phòng Thi (`DiagnosticAssessmentPage.jsx`)**:
  - **Mã Code Phòng Thi Bảo Mật**: Đặt trạng thái ban đầu của modal nhập mã phòng thi rỗng (`""`), bắt buộc người dùng gõ chính xác Passcode (`VACT2026`, `HCM120`, `LOGIC15`) mới cho phép vào thi, báo lỗi tức thì nếu nhập sai.
  - **Loại Bỏ Footer Thừa Trùng Lặp**: Xóa bỏ toàn bộ khối mini-footer nội bộ bên trong `DiagnosticAssessmentPage.jsx`, giữ giao diện bài thi sạch sẽ và dùng duy nhất `PublicFooter` của hệ thống.
  - **Live IRT Status Badge**: Di dời chỉ số năng lực IRT `Theta 0: +0.65 (82% Trúng tuyển)` lên Top Navbar kế bên Streak Counter.
