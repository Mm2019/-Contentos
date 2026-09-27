# Phase 6 — Project Profiles + Enabled Modules

## Current Phase
Phase 6 — Project Profiles + Enabled Modules

## Goal
Turn Projects into configurable instances with a Project Profile and an explicit set of Enabled Modules. The Project Dashboard must adapt to the enabled modules and must not force every project to expose every subsystem.

## Dependencies
- Phase 2 Shared Unified OS Core
- Phase 3 Global Navigation + Command Center
- Phase 4 Finance foundation
- Phase 5 Personal OS
- Existing ContentOS preserved as the authoritative content subsystem

## Implemented
- Project profile catalog with the 14 profiles defined by the Master Prompt.
- Project module catalog grouped into Core, Content, Growth, Product, Operations, and Commerce.
- `uos_projects.project_profile_id` for durable profile linkage while retaining `project_profile` for backward compatibility.
- `uos_projects.module_config_version` for configuration version tracking.
- Profile presets populate sensible default enabled modules.
- Project creation supports profile selection and module customization.
- Existing projects can be reconfigured from Project Detail.
- Project Detail renders only the modules actually enabled for that project.
- ContentOS entry is shown only when `ContentOS` is enabled and points to the preserved original ContentOS application.
- Quick Actions now use the same profile registry instead of hard-coded module arrays.
- No new ContentOS data model or duplicate content engine was introduced.

## Files
- `src/lib/projectModules.js`
- `src/pages/Projects.jsx`
- `src/pages/ProjectDetail.jsx`
- `src/pages/ModuleHub.jsx`
- `src/components/QuickActions.jsx`
- `src/main.jsx`
- `sql/013_project_profiles_modules.sql`
- `docs/PHASE_6_REPORT.md`
- `docs/PHASE_6_ACCEPTANCE.md`

## Acceptance
- Profile presets are deterministic and reusable.
- Enabled Modules are stored on the Project instance, not on a copied subsystem.
- Project Detail does not render disabled modules.
- Reconfiguring a project increments `module_config_version`.
- Existing ContentOS file remains byte-identical to the original baseline.
- Static duplicate-ContentOS scan remains clear.

## Verification
- ContentOS SHA-256 preservation: PASS
- Static duplicate ContentOS schema scan: PASS
- Project profile/module references: PASS
- ZIP integrity: pending after packaging
- Vite build: NOT VERIFIED because dependencies are not available in the execution environment
- Live Supabase migration: NOT VERIFIED
- Browser smoke test: NOT VERIFIED

## Next Phase
Phase 7 — ContentOS Unified Integration, while preserving the original ContentOS architecture and behavior.
