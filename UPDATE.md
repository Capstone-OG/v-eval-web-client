# WEB CLIENT UPDATE

## [22/10/2026] - Flow 1 diagnostic assessment

- Require successful backend submission results; remove local grading/theta/report fallbacks on failed POST.
- Verify campus before loading exam or starting timer; require confirmed profile save when missing. Display saved campus read-only in Navbar.
- Remove in-exam Exit action; warn on closing/reloading during exam and submission.
- Refresh report summary and history; remove overall placement, hardcoded percentiles and row play action; fix zero accuracy and compact report spacing.
- Validation: production build passed; targeted lint has warnings only; four isolated prerequisite checks passed. No authenticated live writes or browser visual verification.
- Backend unchanged. Historical demo data and backend fallback behavior remain outside scope.
