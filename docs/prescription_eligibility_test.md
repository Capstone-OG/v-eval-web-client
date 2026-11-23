# Prescription visibility test - [24/11/2026]

Open Student > Báo cáo & Dự báo điểm > Dự báo điểm & Bài tập tăng điểm. Inspect Network responses for my-roadmap and my-forecast. Use the signed-in student's roadmap; dashboard progress is not used.

| API roadmap counters | Prediction / target | Expected |
| --- | --- | --- |
| totalMilestones 3, completedMilestones 2 | 850 / 900 | Hide prescription; keep forecasts |
| totalMilestones 3, completedMilestones 3 | 850 / 900 | Show prescription |
| totalMilestones 3, completedMilestones 3 | 900 / 900 | Hide prescription |
| totalMilestones 3, completedMilestones 3 | 950 / 900 | Hide prescription |
| Missing/failed roadmap or zero total | 850 / 900 | Hide prescription |
| Completed roadmap | Missing/null/blank prediction or target | Hide prescription |

Use real test accounts when available. To test without changing BE/database, use DevTools Network local response overrides on the two GET responses. Preserve the response structure, roadmapId, studentId and prescriptions array; change only the listed counters and forecast/target fields. For missing-score tests remove the original score field. Reload between cases. Remove overrides afterward.

Check both full and compact panels wherever rendered. The full section is titled "Đơn học tập cải thiện điểm". Eligible responses with an empty prescriptions array show an empty recommendation state. Block my-roadmap and reload: forecast may remain, but prescription must be hidden. Switching accounts/refreshing must not expose the previous account's recommendations.

Scope: visibility only. Existing quiz modal is unchanged; P-L-A-R navigation is separate.

Automated checks: node tests/prescriptionEligibility.test.js; node tests/practiceService.flow6.test.js; npm run build -- --configLoader native.