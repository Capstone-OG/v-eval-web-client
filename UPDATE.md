# UPDATE LOG — V-Eval Web Client

## [24/11/2026] Thanh lọc toàn diện dữ liệu hardcode phân hệ Giảng viên (100% Real Data), Tinh gọn Dashboard & Sư phạm hóa Gia sư AI
- **Thanh lọc triệt để 100% dữ liệu hardcode và fallback tĩnh trong toàn bộ phân hệ Giảng viên (Teacher Role)**:
  - **`TeacherDashboardView.jsx`**: Thay thế các chuỗi tooltip gán cứng số 66 chuyên đề bằng số lượng chuyên đề thực tế động: `${columns.length || 0}`.
  - **`AiTutorModerationView.jsx`**: Xóa bỏ fallback gán cứng `'class_01'` (`class_id: item.class_id || item.classId || null`) tránh rò rỉ đàm thoại vào lớp đầu tiên; xóa bỏ các mã kỹ thuật tiếng Anh giả lập `'PAT_DEFAULT'` và `'TRAP_LOGIC'`; ẩn hoàn toàn thẻ bẫy khi câu hỏi thực tế chưa được phân loại bẫy tư duy.
  - **`TeacherScheduleView.jsx`**: Xóa bỏ fallback phòng học cứng `'Phòng phụ đạo P.204'` và `'Phòng P.204'`; hiển thị trung thực `'Chưa xếp phòng'` hoặc `'Trực tuyến'` khi cơ sở chưa phân bổ phòng.
  - **`ClassMicroGroupsModal.jsx`**: Xóa bỏ phòng học mặc định `'Phòng phụ đạo vi mô P.204'`; tự động liên kết với phòng học thực tế của lớp (`classData?.room`).
  - **`EarlyWarningsMentorPanel.jsx`**: Xóa bỏ địa điểm và điểm mục tiêu đề xuất cứng 850; tự động đề xuất dựa trên điểm mục tiêu thực tế của học sinh (`alert.targetScore` hoặc `alert.currentPredictedScore`).
  - **`TeacherSubmissionHistoryView.jsx`**: Xóa bỏ fallback tên lớp tĩnh `'Lớp nền tảng'` và điểm giả lập 780; hiển thị trung thực `'Lớp phụ trách'` và điểm số thực từ bài làm (`f.score ?? f.rawScore`).
  - **`RoadmapApprovalStudioView.jsx`**: Khởi tạo điểm mục tiêu theo dữ liệu lộ trình thực tế của học sinh (`data?.targetScore`), loại bỏ hoàn toàn số 850 tĩnh.
  - **`AccountSettingsPage.jsx`**: Thay thế toàn bộ các tham chiếu tĩnh từ `mockUser` trong bản xem trước Học bạ điện tử bằng thông tin tài khoản thực tế (`currentUser`).
- **Tối ưu hóa Bảng điều khiển Giảng viên (`TeacherDashboardView.jsx`)**:
  - Thu gọn tầng trên thành **Compact Executive Header** và **Quick Stats Strip** 4 ô; thu gọn cảnh báo đỏ thành Alert Bar thanh lịch.
  - Bộ lọc chuyên đề thông minh chống cuộn ngang 66 cột: Mặc định chế độ **`🔥 Trọng tâm bồi dưỡng`** (Top 8 chuyên đề yếu nhất), chế độ **`🌐 4 Miền Năng Lực`** và chế độ **`📋 Tất cả`**.
  - Bổ sung chế độ xem **Thẻ Học Sinh Trực Quan (`viewFormat === 'cards'`)** kèm nút 1-chạm `[Kèm cặp]` và `[Chi tiết bài làm]`.
- **Sư phạm hóa giao diện Kiểm duyệt Gia sư AI cho Giảng viên (`AiTutorModerationView.jsx`)**:
  - Dọn sạch 100% thuật ngữ kỹ thuật, tinh giản mạng lưới KPI còn 3 thẻ sư phạm thuần Việt cho Giảng viên; giữ nguyên 100% giao diện kỹ thuật cho Giám đốc Học thuật (`isDirector === true`).
  - Phân quyền giới hạn phạm vi đàm thoại strictly theo lớp và học sinh phụ trách; ẩn tab "Toàn bộ" và ẩn hoàn toàn panel xét duyệt câu hỏi bị gắn cờ khỏi Giảng viên.
- **Tối ưu hóa Vite Dev Server (`vite.config.js`)**: Loại bỏ `optimizeDeps.include` thủ công, triệt tiêu lỗi quét dependency scan trên Vite 8, đảm bảo HMR và reload tức thì.
- **Kiểm thử & Biên dịch**:
  - 115/115 unit tests pass 100% (`pass 115, fail 0`).
  - `npm run build` (`vite build`) hoàn thành thành công trong 1.59s (0 errors).
