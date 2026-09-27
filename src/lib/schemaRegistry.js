export const UOS_SCHEMA = {
  "tables": {
    "uos_project_content_accounts": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "content_account_id",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "source_table",
          "type": "text",
          "required": false,
          "default": "'content_os_data'"
        },
        {
          "name": "source_path",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "active",
          "type": "boolean",
          "required": false,
          "default": "true"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_habit_weekly_reviews": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "week_start",
          "type": "date",
          "required": true,
          "default": null
        },
        {
          "name": "week_end",
          "type": "date",
          "required": true,
          "default": null
        },
        {
          "name": "summary",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "wins",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "misses",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "blockers",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "next_focus",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fitness_recovery": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "recorded_at",
          "type": "date",
          "required": false,
          "default": "current_date"
        },
        {
          "name": "sleep_hours",
          "type": "numeric",
          "required": false,
          "default": null
        },
        {
          "name": "energy_level",
          "type": "int",
          "required": false,
          "default": null
        },
        {
          "name": "soreness_level",
          "type": "int",
          "required": false,
          "default": null
        },
        {
          "name": "stress_level",
          "type": "int",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_workspaces": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "owner_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "base_currency",
          "type": "text",
          "required": false,
          "default": "'EGP'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": false,
      "protectedDelete": true,
      "readOnly": true
    },
    "uos_areas": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "parent_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": false,
          "default": "'area'"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "owner_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_projects": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "project_type",
          "type": "text",
          "required": false,
          "default": "'other'"
        },
        {
          "name": "project_profile",
          "type": "text",
          "required": false,
          "default": "'Personal / Research'"
        },
        {
          "name": "area_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'idea'"
        },
        {
          "name": "priority",
          "type": "text",
          "required": false,
          "default": "'normal'"
        },
        {
          "name": "owner_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "start_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "target_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "vision",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "mission",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "business_model",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "revenue_model",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "cost_model",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "enabled_modules",
          "type": "jsonb",
          "required": false,
          "default": "'[]'::jsonb"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_tasks": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "area_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "parent_task_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'backlog'"
        },
        {
          "name": "priority",
          "type": "text",
          "required": false,
          "default": "'normal'"
        },
        {
          "name": "assignee_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "due_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "start_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "estimated_minutes",
          "type": "int",
          "required": false,
          "default": null
        },
        {
          "name": "actual_minutes",
          "type": "int",
          "required": false,
          "default": null
        },
        {
          "name": "tags",
          "type": "jsonb",
          "required": false,
          "default": "'[]'::jsonb"
        },
        {
          "name": "dependencies",
          "type": "jsonb",
          "required": false,
          "default": "'[]'::jsonb"
        },
        {
          "name": "blocked_by",
          "type": "jsonb",
          "required": false,
          "default": "'[]'::jsonb"
        },
        {
          "name": "related_entity_type",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "related_entity_id",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "recurring",
          "type": "jsonb",
          "required": false,
          "default": null
        },
        {
          "name": "completed_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_goals": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "area_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "parent_goal_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "level",
          "type": "text",
          "required": false,
          "default": "'goal'"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "target_value",
          "type": "numeric",
          "required": false,
          "default": null
        },
        {
          "name": "current_value",
          "type": "numeric",
          "required": false,
          "default": null
        },
        {
          "name": "due_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_events": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "event_type",
          "type": "text",
          "required": false,
          "default": "'event'"
        },
        {
          "name": "starts_at",
          "type": "timestamptz",
          "required": true,
          "default": null
        },
        {
          "name": "ends_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "location",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "related_entity_type",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "related_entity_id",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_resources": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "url",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "category",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "area_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'new'"
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "tags",
          "type": "jsonb",
          "required": false,
          "default": "'[]'::jsonb"
        },
        {
          "name": "rating",
          "type": "int",
          "required": false,
          "default": null
        },
        {
          "name": "source",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "date_added",
          "type": "date",
          "required": false,
          "default": "current_date"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_notes": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "body",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "area_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_decisions": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "rationale",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "decision",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "decided_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "owner_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_reviews": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "review_type",
          "type": "text",
          "required": false,
          "default": "'weekly'"
        },
        {
          "name": "period_start",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "period_end",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "summary",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "metrics",
          "type": "jsonb",
          "required": false,
          "default": "'{}'::jsonb"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_content_links": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "contentos_entity_type",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "contentos_entity_id",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "label",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_workspace_members": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "user_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "role",
          "type": "text",
          "required": false,
          "default": "'viewer'"
        },
        {
          "name": "active",
          "type": "boolean",
          "required": false,
          "default": "true"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": false,
      "protectedDelete": true,
      "readOnly": true
    },
    "uos_project_members": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "user_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "role",
          "type": "text",
          "required": false,
          "default": "'viewer'"
        },
        {
          "name": "active",
          "type": "boolean",
          "required": false,
          "default": "true"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_finance_permissions": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "user_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "can_view",
          "type": "boolean",
          "required": false,
          "default": "true"
        },
        {
          "name": "can_edit",
          "type": "boolean",
          "required": false,
          "default": "false"
        },
        {
          "name": "can_export",
          "type": "boolean",
          "required": false,
          "default": "false"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": true,
      "readOnly": true
    },
    "uos_content_account_permissions": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "content_account_id",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "user_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "role",
          "type": "text",
          "required": false,
          "default": "'viewer'"
        },
        {
          "name": "active",
          "type": "boolean",
          "required": false,
          "default": "true"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": true,
      "readOnly": true
    },
    "uos_audit_log": {
      "columns": [
        {
          "name": "id",
          "type": "bigint",
          "required": false,
          "default": "as identity primary key"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "actor_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "action",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "entity_table",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "entity_id",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "old_values",
          "type": "jsonb",
          "required": false,
          "default": null
        },
        {
          "name": "new_values",
          "type": "jsonb",
          "required": false,
          "default": null
        },
        {
          "name": "reason",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "source",
          "type": "text",
          "required": false,
          "default": "'database_trigger'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": false,
      "protectedDelete": true,
      "readOnly": true
    },
    "uos_project_profiles": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "key",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "default_modules",
          "type": "jsonb",
          "required": false,
          "default": "'[]'::jsonb"
        },
        {
          "name": "active",
          "type": "boolean",
          "required": false,
          "default": "true"
        },
        {
          "name": "version",
          "type": "int",
          "required": false,
          "default": "1"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": false,
      "protectedDelete": false,
      "readOnly": true
    },
    "uos_project_module_catalog": {
      "columns": [
        {
          "name": "key",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "label",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "module_group",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "route",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "subsystem",
          "type": "boolean",
          "required": false,
          "default": "false"
        },
        {
          "name": "active",
          "type": "boolean",
          "required": false,
          "default": "true"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": false,
      "protectedDelete": false,
      "readOnly": true
    },
    "uos_habits": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": false,
          "default": "'boolean'"
        },
        {
          "name": "frequency",
          "type": "text",
          "required": false,
          "default": "'daily'"
        },
        {
          "name": "target",
          "type": "numeric",
          "required": false,
          "default": null
        },
        {
          "name": "active",
          "type": "boolean",
          "required": false,
          "default": "true"
        },
        {
          "name": "category",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "start_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "goal",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_habit_logs": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "habit_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "log_date",
          "type": "date",
          "required": true,
          "default": null
        },
        {
          "name": "actual_value",
          "type": "numeric",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "trigger",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_learning_courses": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "area_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "skill",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "progress",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_learning_modules": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "course_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "sort_order",
          "type": "int",
          "required": false,
          "default": "0"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_learning_lessons": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "course_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "module_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "duration_minutes",
          "type": "int",
          "required": false,
          "default": null
        },
        {
          "name": "watched_minutes",
          "type": "int",
          "required": false,
          "default": "0"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'not_started'"
        },
        {
          "name": "skill",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "resource_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "completed_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fitness_programs": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "goal",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "start_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "end_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fitness_phases": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "program_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "sort_order",
          "type": "int",
          "required": false,
          "default": "0"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fitness_workouts": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "program_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "phase_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "week_number",
          "type": "int",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'planned'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fitness_exercises": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "category",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "instructions",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fitness_sessions": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "workout_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "started_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "duration_minutes",
          "type": "int",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'planned'"
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fitness_measurements": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "measured_at",
          "type": "date",
          "required": false,
          "default": "current_date"
        },
        {
          "name": "weight_kg",
          "type": "numeric",
          "required": false,
          "default": null
        },
        {
          "name": "body_fat_pct",
          "type": "numeric",
          "required": false,
          "default": null
        },
        {
          "name": "resting_hr",
          "type": "int",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_home_rooms": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": false,
          "default": "'custom'"
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_home_maintenance": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "issue",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "room_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "category",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "priority",
          "type": "text",
          "required": false,
          "default": "'normal'"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'open'"
        },
        {
          "name": "estimated_cost",
          "type": "numeric",
          "required": false,
          "default": null
        },
        {
          "name": "actual_cost",
          "type": "numeric",
          "required": false,
          "default": null
        },
        {
          "name": "technician",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "due_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "completed_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "related_inventory_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "related_shopping_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "related_finance_transaction_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_home_inventory": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "kind",
          "type": "text",
          "required": false,
          "default": "'asset'"
        },
        {
          "name": "quantity",
          "type": "numeric",
          "required": false,
          "default": "1"
        },
        {
          "name": "unit",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "stock_status",
          "type": "text",
          "required": false,
          "default": "'good'"
        },
        {
          "name": "room_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_home_shopping": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "item",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "quantity",
          "type": "numeric",
          "required": false,
          "default": "1"
        },
        {
          "name": "estimated_cost",
          "type": "numeric",
          "required": false,
          "default": null
        },
        {
          "name": "purchased",
          "type": "boolean",
          "required": false,
          "default": "false"
        },
        {
          "name": "purchased_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "inventory_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "maintenance_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "linked_transaction_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "source_entity",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "source_id",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "sync_status",
          "type": "text",
          "required": false,
          "default": "'pending'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_marketplace_categories": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "parent_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "slug",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "attribute_schema",
          "type": "jsonb",
          "required": false,
          "default": "'{}'::jsonb"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_marketplace_listings": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "category_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "seller_ref",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "attributes",
          "type": "jsonb",
          "required": false,
          "default": "'{}'::jsonb"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'draft'"
        },
        {
          "name": "price",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "currency",
          "type": "text",
          "required": false,
          "default": "'EGP'"
        },
        {
          "name": "location",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "external_id",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_marketplace_deals": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "listing_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "buyer_ref",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "seller_ref",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'initiated'"
        },
        {
          "name": "agreed_amount",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "currency",
          "type": "text",
          "required": false,
          "default": "'EGP'"
        },
        {
          "name": "commerce_order_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "finance_transaction_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "expires_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_marketplace_verifications": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "subject_type",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "subject_ref",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "method",
          "type": "text",
          "required": false,
          "default": "'manual'"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'pending'"
        },
        {
          "name": "submitted_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "verified_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "expires_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "reviewer_ref",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_marketplace_trust_scores": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "subject_type",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "subject_ref",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "trust_score",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "risk_level",
          "type": "text",
          "required": false,
          "default": "'medium'"
        },
        {
          "name": "verification_state",
          "type": "text",
          "required": false,
          "default": "'unverified'"
        },
        {
          "name": "signals",
          "type": "jsonb",
          "required": false,
          "default": "'{}'::jsonb"
        },
        {
          "name": "reviewed_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_marketplace_reviews": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "listing_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "reviewer_ref",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "reviewee_ref",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "rating",
          "type": "integer",
          "required": true,
          "default": null
        },
        {
          "name": "body",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'pending'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_marketplace_reports": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "target_type",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "target_id",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "reporter_ref",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "reason",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "severity",
          "type": "text",
          "required": false,
          "default": "'medium'"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'open'"
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_marketplace_disputes": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "deal_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "opened_by_ref",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "reason",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'opened'"
        },
        {
          "name": "claimed_amount",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "currency",
          "type": "text",
          "required": false,
          "default": "'EGP'"
        },
        {
          "name": "resolution",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "finance_transaction_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "resolved_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_marketplace_safety_events": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "event_type",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "target_type",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "target_id",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "severity",
          "type": "text",
          "required": false,
          "default": "'medium'"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'open'"
        },
        {
          "name": "action_taken",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "detected_by",
          "type": "text",
          "required": false,
          "default": "'manual'"
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_schema_registry": {
      "columns": [
        {
          "name": "id",
          "type": "boolean",
          "required": false,
          "default": "true"
        },
        {
          "name": "current_version",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "minimum_compatible_version",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_by",
          "type": "uuid",
          "required": false,
          "default": null
        }
      ],
      "workspaceScoped": false,
      "protectedDelete": true,
      "readOnly": true
    },
    "uos_migration_log": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "version",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "migration_name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "checksum",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'applied'"
        },
        {
          "name": "applied_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "applied_by",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        }
      ],
      "workspaceScoped": false,
      "protectedDelete": true,
      "readOnly": true
    },
    "uos_recovery_snapshots": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "snapshot_type",
          "type": "text",
          "required": false,
          "default": "'manual'"
        },
        {
          "name": "schema_version",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "created_by",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'ready'"
        },
        {
          "name": "table_count",
          "type": "integer",
          "required": false,
          "default": "0"
        },
        {
          "name": "row_count",
          "type": "bigint",
          "required": false,
          "default": "0"
        },
        {
          "name": "manifest",
          "type": "jsonb",
          "required": false,
          "default": "'{}'::jsonb"
        },
        {
          "name": "checksum",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "restored_to_workspace_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "completed_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        }
      ],
      "workspaceScoped": false,
      "protectedDelete": true,
      "readOnly": true
    },
    "uos_recovery_items": {
      "columns": [
        {
          "name": "id",
          "type": "bigint",
          "required": false,
          "default": "as identity primary key"
        },
        {
          "name": "snapshot_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "table_name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "row_count",
          "type": "bigint",
          "required": false,
          "default": "0"
        },
        {
          "name": "payload",
          "type": "jsonb",
          "required": false,
          "default": "'[]'::jsonb"
        },
        {
          "name": "checksum",
          "type": "text",
          "required": true,
          "default": null
        }
      ],
      "workspaceScoped": false,
      "protectedDelete": true,
      "readOnly": true
    },
    "uos_recovery_runs": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "snapshot_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "restored_to_workspace_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "action",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'started'"
        },
        {
          "name": "started_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "completed_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "actor_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "summary",
          "type": "jsonb",
          "required": false,
          "default": "'{}'::jsonb"
        },
        {
          "name": "error",
          "type": "text",
          "required": false,
          "default": null
        }
      ],
      "workspaceScoped": false,
      "protectedDelete": true,
      "readOnly": true
    },
    "uos_global_intelligence_events": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "kind",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "severity",
          "type": "text",
          "required": false,
          "default": "'info'"
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "summary",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "confidence",
          "type": "text",
          "required": false,
          "default": "'medium'"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'open'"
        },
        {
          "name": "evidence",
          "type": "jsonb",
          "required": false,
          "default": "'[]'::jsonb"
        },
        {
          "name": "source_entities",
          "type": "jsonb",
          "required": false,
          "default": "'[]'::jsonb"
        },
        {
          "name": "fingerprint",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "detected_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_knowledge_ideas": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'raw_idea'"
        },
        {
          "name": "source",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "idea_type",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "target_entity_type",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "target_entity_id",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_learning_skills": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "category",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "target_level",
          "type": "numeric",
          "required": false,
          "default": null
        },
        {
          "name": "current_level",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_learning_study_sessions": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "course_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "lesson_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "skill_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "event_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "task_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "scheduled_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "duration_minutes",
          "type": "int",
          "required": false,
          "default": null
        },
        {
          "name": "actual_minutes",
          "type": "int",
          "required": false,
          "default": "0"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'planned'"
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_products": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "slug",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'draft'"
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_prds": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "product_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "version",
          "type": "text",
          "required": false,
          "default": "'1.0'"
        },
        {
          "name": "problem",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "users",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "goals",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "non_goals",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "assumptions",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "risks",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "dependencies",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "acceptance_criteria",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "metrics",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_requirements": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "prd_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": false,
          "default": "'functional'"
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "priority",
          "type": "text",
          "required": false,
          "default": "'medium'"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'draft'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_epics": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "requirement_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'planned'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_features": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "epic_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "task_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'idea'"
        },
        {
          "name": "priority",
          "type": "text",
          "required": false,
          "default": "'medium'"
        },
        {
          "name": "problem",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "acceptance_criteria",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "metrics",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_releases": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "product_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "version",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'planned'"
        },
        {
          "name": "release_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_bugs": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "linked_feature_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "release_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "severity",
          "type": "text",
          "required": false,
          "default": "'medium'"
        },
        {
          "name": "priority",
          "type": "text",
          "required": false,
          "default": "'medium'"
        },
        {
          "name": "environment",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "steps",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "expected",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "actual",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "reproduction",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "assignee_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'open'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_qa_cases": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "feature_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "steps",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "expected",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_qa_runs": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "release_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "environment",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "started_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "completed_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "release_ready",
          "type": "boolean",
          "required": false,
          "default": "false"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_qa_results": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "run_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "case_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'not_run'"
        },
        {
          "name": "evidence",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "recorded_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_feedback": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "linked_feature_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "source",
          "type": "text",
          "required": false,
          "default": "'user'"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'new'"
        },
        {
          "name": "priority",
          "type": "text",
          "required": false,
          "default": "'medium'"
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_support_tickets": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "title",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": false,
          "default": "'request'"
        },
        {
          "name": "priority",
          "type": "text",
          "required": false,
          "default": "'medium'"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'new'"
        },
        {
          "name": "customer",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "sla_due_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_analytics_events": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "product_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "event_name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "metric",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "value",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "source",
          "type": "text",
          "required": false,
          "default": "'manual'"
        },
        {
          "name": "occurred_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "metadata",
          "type": "jsonb",
          "required": false,
          "default": "'{}'::jsonb"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_subscriptions": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "plan",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "price",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "billing_cycle",
          "type": "text",
          "required": false,
          "default": "'monthly'"
        },
        {
          "name": "started_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "renewal_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_team": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "role",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "email",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_product_technical_assets": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": false,
          "default": "'repository'"
        },
        {
          "name": "url",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_commerce_products": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "supplier_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "sku",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "category",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": false,
          "default": "'physical'"
        },
        {
          "name": "cost",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "price",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'draft'"
        },
        {
          "name": "assets",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_commerce_variants": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "product_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "sku",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "attributes",
          "type": "jsonb",
          "required": false,
          "default": "'{}'::jsonb"
        },
        {
          "name": "cost",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "price",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "barcode",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_commerce_inventory": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "variant_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "on_hand",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "reserved",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "damaged",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "returned",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "location",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "reorder_point",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "stock_status",
          "type": "text",
          "required": false,
          "default": "'good'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_commerce_customers": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "email",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "phone",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": false,
          "default": "'individual'"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_commerce_suppliers": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "contact_name",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "email",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "phone",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_commerce_orders": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "customer_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "order_number",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'pending'"
        },
        {
          "name": "currency",
          "type": "text",
          "required": false,
          "default": "'EGP'"
        },
        {
          "name": "subtotal",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "discount",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "shipping",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "tax",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "total",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "finance_transaction_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "campaign_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "source_entity_type",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "source_entity_id",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "external_id",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_commerce_order_items": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "order_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "variant_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "quantity",
          "type": "numeric",
          "required": false,
          "default": "1"
        },
        {
          "name": "unit_price",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "discount",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "line_total",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_commerce_returns": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "order_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'requested'"
        },
        {
          "name": "reason",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "amount",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "received_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "refunded_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "finance_transaction_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_commerce_promotions": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "product_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "code",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": false,
          "default": "'percentage'"
        },
        {
          "name": "value",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "min_order_value",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "starts_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "ends_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'draft'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_commerce_campaigns": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "product_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": false,
          "default": "'product'"
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'draft'"
        },
        {
          "name": "starts_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "ends_at",
          "type": "timestamptz",
          "required": false,
          "default": null
        },
        {
          "name": "budget",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "notes",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fin_accounts": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": false,
          "default": "'cash'"
        },
        {
          "name": "currency",
          "type": "text",
          "required": false,
          "default": "'EGP'"
        },
        {
          "name": "opening_balance",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "active",
          "type": "boolean",
          "required": false,
          "default": "true"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fin_categories": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "kind",
          "type": "text",
          "required": false,
          "default": "'expense'"
        },
        {
          "name": "parent_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "active",
          "type": "boolean",
          "required": false,
          "default": "true"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fin_transactions": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "occurred_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "amount",
          "type": "numeric",
          "required": true,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "from_account_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "to_account_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "category_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "area_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "description",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "recurring_source_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "debt_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "shopping_item_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "subscription_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "source_entity_type",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "source_entity_id",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "external_id",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "linked_transaction_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "sync_status",
          "type": "text",
          "required": false,
          "default": "'unlinked'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fin_budgets": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "category_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "project_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "period_start",
          "type": "date",
          "required": true,
          "default": null
        },
        {
          "name": "period_end",
          "type": "date",
          "required": true,
          "default": null
        },
        {
          "name": "amount",
          "type": "numeric",
          "required": true,
          "default": null
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fin_recurring": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "amount",
          "type": "numeric",
          "required": true,
          "default": null
        },
        {
          "name": "type",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "frequency",
          "type": "text",
          "required": false,
          "default": "'monthly'"
        },
        {
          "name": "next_due",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "account_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "category_id",
          "type": "uuid",
          "required": false,
          "default": null
        },
        {
          "name": "active",
          "type": "boolean",
          "required": false,
          "default": "true"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fin_debts": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "direction",
          "type": "text",
          "required": false,
          "default": "'owed_by_me'"
        },
        {
          "name": "principal",
          "type": "numeric",
          "required": true,
          "default": null
        },
        {
          "name": "remaining",
          "type": "numeric",
          "required": true,
          "default": null
        },
        {
          "name": "due_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "counterparty",
          "type": "text",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'open'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    },
    "uos_fin_savings_goals": {
      "columns": [
        {
          "name": "id",
          "type": "uuid",
          "required": false,
          "default": "gen_random_uuid()"
        },
        {
          "name": "workspace_id",
          "type": "uuid",
          "required": true,
          "default": null
        },
        {
          "name": "name",
          "type": "text",
          "required": true,
          "default": null
        },
        {
          "name": "target_amount",
          "type": "numeric",
          "required": true,
          "default": null
        },
        {
          "name": "current_amount",
          "type": "numeric",
          "required": false,
          "default": "0"
        },
        {
          "name": "due_date",
          "type": "date",
          "required": false,
          "default": null
        },
        {
          "name": "status",
          "type": "text",
          "required": false,
          "default": "'active'"
        },
        {
          "name": "created_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        },
        {
          "name": "updated_at",
          "type": "timestamptz",
          "required": false,
          "default": "now()"
        }
      ],
      "workspaceScoped": true,
      "protectedDelete": false,
      "readOnly": false
    }
  },
  "protected": [
    "uos_audit_log",
    "uos_content_account_permissions",
    "uos_finance_permissions",
    "uos_migration_log",
    "uos_recovery_items",
    "uos_recovery_runs",
    "uos_recovery_snapshots",
    "uos_schema_registry",
    "uos_workspace_members",
    "uos_workspaces"
  ],
  "readonly": [
    "uos_audit_log",
    "uos_content_account_permissions",
    "uos_finance_permissions",
    "uos_migration_log",
    "uos_project_module_catalog",
    "uos_project_profiles",
    "uos_recovery_items",
    "uos_recovery_runs",
    "uos_recovery_snapshots",
    "uos_schema_registry",
    "uos_workspace_members",
    "uos_workspaces"
  ]
};
