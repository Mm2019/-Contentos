# Phase 15 — Knowledge + Learning Contract

## Source-of-truth rules

- `uos_resources` remains the single Resource/Bookmark entity from Shared Core.
- `uos_notes` remains the single Notes entity from Shared Core.
- No separate bookmarks database is introduced.
- Learning courses/modules/lessons remain the existing Learning entities.
- Skills are a reusable master entity.
- Study Sessions are specialized execution records and may reference Shared Core Tasks/Events instead of duplicating them.
- Ideas are specialized lifecycle records and can later be promoted to Project/Feature/Content/Product/Task/Resource via relations rather than copying records.

## Knowledge scope

- Workspace-wide records are supported.
- Project-scoped Resources, Notes and Ideas are supported.

## Learning scope

- Course → Module/Chapter → Lesson remains canonical.
- Language learning uses the same Learning OS and Skill entity.
- Lesson progress is time-weighted where duration is available.
- Study Sessions can reference course, lesson, skill, event and task.

## Explicit non-goals

- No duplicate ContentOS data.
- No duplicate Task database.
- No separate Calendar database.
- No separate Bookmark database.
