# V-Eval Web Client Update

## [16/11/2026] - Sync pulled student features and repair diagnostic JSX

- Integrated the incoming curriculum/math rendering, tuition and PayOS payment views, diagnostic submission history, and student live classroom/schedule features.
- Preserved TNhan branch changes and added the missing GUID matcher required by practice service helpers.
- Removed an incomplete duplicate trend-chart wrapper that broke JSX parsing in the diagnostic history view.
- Excluded .env.bak from the merge. Vite production build succeeds; only existing chunk-size and dependency eval warnings remain.
