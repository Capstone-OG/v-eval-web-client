# UPDATE - V-EVAL WEB CLIENT

## [23/11/2026]
- **Lọc Chuẩn Xác Đối Tượng Học Sinh Bồi Dưỡng Chuyên Đề & Cơ Chế Chuyển Đổi Phạm Vi (`ClassMicroGroupsModal.jsx`, `tests/classMicroGroups.test.js`)**:
  - Khắc phục triệt để hiện tượng cả lớp 7 học sinh bị kéo vào nhóm bồi dưỡng Hóa học dù chỉ có 4 bạn chưa đạt: hàm `partitionStudentsForFocusSkill` ưu tiên lọc chuẩn xác theo `targetStudentIds` (học sinh có điểm bài làm < 50%).
  - Khi sĩ số cần bồi dưỡng $\le 5$ bạn (4 bạn), hệ thống tự động tạo đúng **1 bàn học vi mô kèm riêng (4 bạn)** với trọng tâm chuyên đề "Giải quyết vấn đề Hóa học", không kéo các bạn khác vào bàn.
  - Tích hợp bộ chuyển đổi phạm vi linh hoạt trên banner chuyên đề: `🎯 Chỉ [X] học sinh chưa đạt` (mặc định) và `👥 Cả lớp ([Y] học sinh)`, trao toàn quyền tự chủ cho Giảng viên.
  - Bổ sung test case `ClassMicroGroups - partitionStudentsForFocusSkill filters strictly to target struggling students` (33/33 tests passed 100%).
- **Đồng Bộ Số Liệu Thống Kê Cảnh Báo Sư Phạm (`TeacherDashboardView.jsx`)**:
  - Đồng bộ con số hiển thị giữa thẻ tóm tắt và danh sách khoan sâu: ưu tiên tính tỷ lệ chưa đạt theo số lượng học sinh thực tế làm bài bị điểm < 50% (`57% (4 học sinh)`), triệt tiêu sự mâu thuẫn hiển thị `100% (7 học sinh)`.
- **Sửa Lỗi Tràn Layout & Co Hẹp Dải Phân Cấp Sư Phạm (`EarlyWarningsMentorPanel.jsx`)**:
  - Cải tiến container dải phân cấp sư phạm với `w-full` và `flex-col sm:flex-row`, đảm bảo mô tả hướng dẫn hiển thị giãn dòng tự nhiên (`leading-relaxed`), chống bóp nghẹt thành cột hẹp.
- **Cấu Hình Supabase Transaction Mode Pooler Cho RAG Service (`All Services/V-Eval-Ai_Engine/rag-service/.env`)**:
  - Chuyển đổi cổng `DATABASE_URL` từ `5432` sang `6543`, giải quyết triệt để lỗi `FATAL: (EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15`.
- **Kiểm Thử & Biên Dịch**:
  - 33/33 unit tests passed 100%.
  - `npm run build`: Hoàn thành 100% trong 1.24s, 3086 modules transformed, 0 lỗi.
