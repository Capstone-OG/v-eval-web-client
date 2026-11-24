# [24/11/2026]

- Fixed `ConnectedRoadmapPage.jsx` fallback skill-name hydration by indexing `dom.skills[]` in addition to `dom.chapters[].lessons[].patterns[]`.
- Fixed `StudentScheduleView.jsx` to filter Term & Course dropdowns strictly by the student's enrolled classes and paid tuition (`paymentService.getStudentTuitionStatus`) instead of showing all global catalog courses.
- Fixed `TeacherScheduleView.jsx` to load only the logged-in teacher's assigned classes (`getClasses({ teacherId, termId })`), matching the KPI card and Academic Manager's class list.
- Upgraded `RoadmapApprovalStudioView.jsx`, `Sidebar.jsx`, `App.jsx`, and `practiceService.js` to support the 3-tier roadmap approval workflow (`Teacher` -> `Academic Manager` scoped by `campusId` with `Escalate to Director` -> `Academic Director` cross-campus).
- Refined `AccountSettingsPage.jsx` so student-only fields (`Phụ huynh đại diện`, `Tùy chọn Học tập & AI`) are hidden for Teacher/Manager/Director/Admin/Parent, and campus scope labels/editability match each role.
- Verified with `npm run build` (0 errors).
