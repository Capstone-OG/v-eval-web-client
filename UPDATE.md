# V-Eval Web Client Update

## [16/11/2026] - Sync pulled student features into TNhan branch

- Integrated the incoming curriculum/math rendering, tuition and PayOS payment views, diagnostic submission history, and student live classroom/schedule features.
- Preserved TNhan branch changes while resolving the pulled feature set. Added the missing `GUID_REGEX` definition required by the practice service helpers.
- Excluded `.env.bak` from the merge because it may contain environment secrets.
- Build and runtime checks were not run in this sync.
