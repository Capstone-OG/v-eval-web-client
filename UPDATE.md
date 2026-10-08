# Nhật Ký Cập Nhật (Update Log) - V-Eval Web Client

## [08/10/2026] - Đồng Bộ Tinh Gọn Tầng Dịch Vụ: Gỡ Bỏ Các Lời Gọi API Live Streaming

- **Loại Bỏ Các Phương Thức Gọi API Live Streaming (`practiceService.js`)**:
  - Gỡ bỏ 7 hàm gọi API tương ứng với phân hệ Live Session đã decommission tại backend: `createLiveSession`, `getMyLiveSchedule`, `joinLiveSession`, `markTeacherAttendance`, `getTeacherSchedule`, `updateRecordingUrl`, `cancelLiveSession`.
  - Giữ lại hàm nghiệp vụ điều phối lớp học `assignTeacher`.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Biên dịch và đóng gói thành công 100% bằng Vite (`npm run build`) với **0 Error, 0 Warning**.
  - Toàn bộ các module ứng dụng vận hành ổn định.
