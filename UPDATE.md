# Nhật Ký Cập Nhật (Update Log) - Web Client

## [09/10/2026] - Mở Rộng Client Service: Bổ Sung Tích Hợp API Phân Cụm Lớp Chuyên Đề & Nhóm Học Tập Vi Mô (3 - 5 Học Sinh)

- **Mở Rộng Dịch Vụ `practiceService.js`**:
  - Bổ sung `autoClusterClasses(campusId, maxK = 6)`: Gọi API `POST /api/v1/practice/classes/auto-cluster` tạo các lớp chuyên đề dựa trên thuật toán K-Means/Elbow Method.
  - Bổ sung `autoPartitionMicroGroups(classId, preferredGroupSize = 4)`: Gọi API `POST /api/v1/practice/classes/{classId}/micro-groups/auto-partition` chia học sinh trong lớp thành các nhóm vi mô 3 - 5 bạn theo lỗ hổng kiến thức.
  - Bổ sung `getClassMicroGroups(classId)`: Gọi API `GET /api/v1/practice/classes/{classId}/micro-groups` tra cứu danh sách và thành viên các nhóm học tập vi mô.
  - Bổ sung `assignGroupWorksheet(classId, groupId, worksheetId, worksheetTitle)`: Gọi API `POST /api/v1/practice/classes/{classId}/micro-groups/{groupId}/assign-worksheet` phân phối đề luyện tập thích ứng theo nhóm.
- **Kiểm Thử Đóng Gói (Build Verification)**:
  - Chạy `npm run build` thành công 100% (**0 Error, 0 Warning**).
