# Phase 22 — Knowledge + Learning Parity

## Goal
Bring the supplied Notion Knowledge & Resource OS functionality into Unified OS without duplicating Shared Core resources, notes, tasks, goals, calendar or areas.

## Implemented
- Bookmark Types entity
- Knowledge Categories entity
- Full Meetings entity
- Meeting ↔ Task relations
- Meeting ↔ Decision relations
- Resource description / why-saved / category / bookmark-type relations
- Idea category / resource / next-action / task relations
- Event status / category / area / why-attend / takeaways / follow-up
- Notion-style resource statuses: Inbox / Reading / Reference / Archived
- Notion-style idea statuses: Inbox / Exploring / Active / Parked / Done
- Knowledge Inbox source view
- Quick Capture parity
- Knowledge home tabs / board / calendar-style agenda
- Resource → Idea conversion
- Idea → Task creation
- Meeting action-item linking
- Learning progress / remaining-time / module and course aggregates
- Study-session scheduling from lesson context
- Templates / capture presets for Resource, Idea, Meeting and Event

## Architectural rule
Resources remain the canonical Shared Core resource entity. Notes remain canonical Shared Core notes. Tasks and Decisions remain Shared Core. Events remain the canonical Calendar/Event entity.
