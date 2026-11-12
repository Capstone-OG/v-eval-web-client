# UPDATE

### [12/11/2026] - Merge develop into diagnostic frontend branch

- Resolve 24 conflicted frontend files from develop 115eace. Integrate incoming role portals, curriculum/authoring, payment, notifications, expanded API services and structured math rendering; preserve the local diagnostic assessment lifecycle, profile helpers, account settings and remember-me behavior.
- Wire the retained diagnostic page into the new portal with the signed-in user and account-specific component key. Student history uses the owned server-backed diagnostic view. Remove incoming shared latest-result loading and prevent seeded/unowned local submission history from reappearing.
- Combine API query params and PATCH support with proactive token refresh, session-only login, session generation guards and diagnostic privacy cleanup. Refresh preserves the user and selected storage without creating a new login session. Add diagnostic API aliases required by the retained assessment.
- Fix conditional React hooks in incoming MathGraphView and math-workbench modal. Install the declared jsxgraph dependency; retain its incoming package/lock contract.
- Validation: production build passed; npm run lint exited zero with warnings; all 21 tests passed (17 diagnostic/privacy, 2 Flow 6 and 2 merge integration cases). Build warns about bundle size and direct eval inside jsxgraph. Browser/live API/visual behavior was not verified.
- Scope: frontend and progress documentation only. No backend code or configuration backups changed. System-Repo and uppercase frontend have separate merge state; their service code is outside this resolution.

- V-Eval approved transparent logo integrated into the public/login headers, sidebar, mobile navbar and dark footer through a shared responsive component. Build passed; browser appearance not verified.

- Frontend merge/branding checkpoint ready for commit: 21 tests passed, lint exited zero, production build passed. Includes resolved develop integration and approved V-Eval logo. Root merge and backend excluded; no push.
