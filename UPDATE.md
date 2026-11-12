# UPDATE

### [13/11/2026] - Student portal UI and history checkpoint

- Checkpoint pending frontend presentation work: compact account header/menu with red logout, role-aware greetings, shared mobile sidebar and grouped student navigation.
- Include API-backed diagnostic entry guidance, colorful progress card, 7:3 setup-card layout and readable parent-link controls.
- Separate diagnostic entry from categorized history. Diagnostic history is server-backed; practice history is explicitly browser-local; mock history awaits a BE list API. Stabilize curriculum loading and width behavior without backend changes.
- Final validation before commit: all 21 existing tests passed, lint exited zero with warnings, production build passed with existing bundle-size/jsxgraph eval warnings, and git diff whitespace check passed. Browser/live API and reported layout issue remain unverified directly.
- Commit scope is lowercase frontend only. Root repository pending merge, uppercase frontend and backend service changes are excluded. No push performed.

- Student curriculum now opens from catalog into a spacious lesson workspace with larger text, content tabs, outline, existing practice/AI actions. Staff two-column editing retained; build/lint and 21 tests passed. Browser verification pending; no commit/push.

- Student catalog defaults to first chapter/lesson open, others collapsed; sibling expansion is exclusive. Staff add/edit controls remain separate. Build passed.

- Corrected catalog expansion: opened chapters/lessons stay open independently; only their own heading toggles them. Supersedes previous exclusive accordion. Build passed.

- Reading outline now lists only current-chapter lessons/patterns with clear grouping and current-item highlight; other chapters are chosen from the catalog. Build passed.

- Teacher portal: dedicated overview/navigation; retained staff curriculum tools; live exam bank, class mastery/history and warning resolution with explicit unavailable/error states. No sample classes/global alerts; BE assigned-class discovery and mentor scoping remain dependencies. 24 tests, lint and build passed; browser/API checks pending. FE-only, no commit/push.

- Commit checkpoint: student curriculum workspace and teacher portal changes with documentation and 24 passing tests; frontend repository only. Root pending merge and backend changes excluded. User will push.
