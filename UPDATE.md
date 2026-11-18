# V-Eval Web Client Update

## [19/11/2026] - Sidebar navigation cleanup

- Removed the stale `entries.live` reference that caused the student sidebar crash, filtered invalid entries, and added a fallback icon for valid items missing an icon.
- Removed only the student-facing Gia sư AI sidebar entry; the existing AI chat experience remains unchanged.
- `npm run build` passed; existing bundle-size and JSXGraph eval advisories remain.
