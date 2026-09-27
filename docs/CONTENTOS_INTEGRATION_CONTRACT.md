# ContentOS Integration Contract

1. ContentOS remains the authoritative subsystem.
2. Unified OS may reference ContentOS accounts by stable IDs.
3. Unified OS must not copy account definitions, workflow definitions, post records, KPI definitions, analytics history, intelligence state, permissions, or snapshots into parallel tables.
4. A project-to-account link is relationship metadata, not a replacement ContentOS entity.
5. Changes made inside ContentOS remain governed by ContentOS.
6. Changes to the Unified OS project do not rewrite historical ContentOS data.
7. Any future deeper integration must be additive and backward-compatible.
