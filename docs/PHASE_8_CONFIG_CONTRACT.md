# ContentOS Configuration Contract

The Unified OS may read and contextualize the following authoritative ContentOS configuration layers:

```text
Global Defaults
  ↓
Platform
  ↓
Content Type
  ↓
Account Override
  ↓
Workflow Snapshot
  ↓
Post-level Override
  ↓
Historical Analytics
```

The Unified OS must not silently rewrite the authoritative layer.

A configuration mode of `inherit` means the effective configuration remains derived from the parent platform/content type defaults.

A configuration mode of `custom` means the account owns an isolated configuration for the targeted platform/content type.

Historical post workflow snapshots remain frozen and must not be regenerated merely because account configuration changes later.
