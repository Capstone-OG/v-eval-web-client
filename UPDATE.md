# V-Eval Web Client Update

## [21/11/2026] - Student schedule, activation and V-ACT mock exams

- Replace the session list with a weekly calendar, numbered slots, filters and session details showing class, attendance, worksheets, ZPD and tutor actions.
- Remove aspiration from profile and eligibility checks; leave unsaved exam date empty. Parent information remains optional for checkout.
- Use tuition API isPaid for access, clear stale local activation, remove test activation and prevent repeated tuition events/roadmap remounts.
- After verified paid activation, reuse an existing roadmap or generate a missing one from saved profile and completed diagnostic. Preserve existing progress.
- Connect published FULL_MOCK exam listing and mock start/submit/result/proctoring APIs. Reuse the diagnostic exam room, flags, navigation, confirmation and timing display.
- Match diagnostic fullscreen, warning, three-violation and timeout submission behavior; retain per-student answers, flags and original deadline when resuming.
- Simplify account, roadmap, payment and history wording; remove redundant banners, visible attempt IDs and license claims.
- Validation: 75 related unit tests passed; latest production build passed. Chrome stub-API checks passed navigation, passage, flags, resume, grading, violations and timeout.
- Live catalog read confirmed three unpublished FULL_MOCK records and no published mock exams. No exam publication or live test submission performed.
- Frontend only; no backend source changes. Existing dependency build warnings remain.
