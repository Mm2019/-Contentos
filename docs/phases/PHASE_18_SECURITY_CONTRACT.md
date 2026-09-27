# Phase 18 — Security Contract

## Security Boundary

Supabase Auth + RLS + database authorization are authoritative. UI guards are convenience only.

## Workspace Roles

- owner — derived from `uos_workspaces.owner_id`
- admin
- manager
- editor
- contributor
- viewer

## Project Permissions

`uos_project_members` provides optional project-level overrides. If no explicit project members exist, workspace membership applies. Project owners are derived from `uos_projects.owner_id`.

## Finance Restrictions

Finance visibility/edit/export can be granted explicitly through `uos_finance_permissions`. Manager/Admin/Owner remain privileged by role.

## ContentOS Account Boundary

`uos_content_account_permissions` is an overlay for the Unified OS bridge only. Existing ContentOS-native permissions remain authoritative for ContentOS data and behavior.

## Audit

`uos_audit_log` is written by database triggers. Client roles cannot directly insert/update/delete audit records. Audit visibility is restricted to manager/admin/owner roles.

## Action Authorization

`uos_authorize_action()` is a server-side authorization helper for workspace, project, finance, and audit actions.

## Known Runtime Limitation

Live Supabase policy execution and browser runtime remain NOT VERIFIED in the current build environment.
