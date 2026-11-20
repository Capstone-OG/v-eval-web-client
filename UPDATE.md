# V-Eval Web Client Update

## [20/11/2026] - Hồ sơ, hướng dẫn kích hoạt và thanh toán học viên

- Gộp hồ sơ và mục tiêu thi cử, hỗ trợ Lưu/Hủy theo thay đổi, nhập trường THPT và nguyện vọng; nguyện vọng và thông tin phụ huynh cục bộ tách theo tài khoản. Bỏ dữ liệu phụ huynh/trường/ngày gia nhập mẫu; ngày gia nhập lấy từ API hiện có.
- Bổ sung lịch tiếng Việt DayPicker/Radix, validation trực tiếp đổi mật khẩu và toast; tinh chỉnh đăng ký, khôi phục mật khẩu, chuyển vai trò và bố cục sidebar/IRT.
- Sau bài đầu vào, hướng dẫn hoàn thiện hồ sơ → thanh toán → mở lộ trình; lưu hồ sơ xong tự kiểm tra bước tiếp theo. Trang học phí luôn hiển thị bảng giá, kiểm tra hồ sơ khi thanh toán.
- Bỏ màn Roadmap backend/video/quiz trùng lặp trên FE; giữ trang chương trình/lộ trình cá nhân và các thay đổi giao diện học tập hiện có.
- Đồng nhất trạng thái lịch sử/biên lai, kiểm tra lại đơn chờ và hỗ trợ tiếp tục thanh toán cùng đơn. Toast thành công/thất bại/hủy/hết hạn dùng hệ thống chung; polling tuần tự, bỏ qua phản hồi sau đóng modal và phân biệt lỗi mạng.
- Chỉ commit FE. Backend, schema DB và các repo dịch vụ không thuộc commit này.
- Kiểm tra: npm run build thành công; 30 test đầu vào, activation, trạng thái/tiếp tục thanh toán và polling đã qua; dọn khoảng trắng cuối dòng. Chưa kiểm tra thanh toán thật hoặc luồng trình duyệt end-to-end.
