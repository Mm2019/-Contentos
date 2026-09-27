// Centralized validation (G-004). Used both for simple form checks and for
// validating a publishing record's field values against its effective field
// definitions (see contentService.resolveEffectiveConfig) before allowing a
// stage transition — this is the "required fields complete" half of C-010.

export function required(value, label) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${label} مطلوب`
  }
  return null
}

export function isUrl(value) {
  if (!value) return null
  try { new URL(value); return null } catch { return 'الرابط غير صالح' }
}

export function isNumber(value, label) {
  if (value === null || value === undefined || value === '') return null
  return Number.isNaN(Number(value)) ? `${label} يجب أن يكون رقمًا` : null
}

// Validates a map of {field_key: value} against resolved field definitions.
// Returns { valid: boolean, errors: {field_key: message} }
export function validateFieldValues(fieldDefs, values) {
  const errors = {}
  for (const f of fieldDefs) {
    const v = values?.[f.key]
    if (f.required) {
      const e = required(v, f.label_ar)
      if (e) { errors[f.key] = e; continue }
    }
    if (f.field_type === 'url' && v) {
      const e = isUrl(v)
      if (e) errors[f.key] = e
    }
    if (f.field_type === 'number' && v) {
      const e = isNumber(v, f.label_ar)
      if (e) errors[f.key] = e
    }
  }
  return { valid: Object.keys(errors).length === 0, errors }
}

// C-010 approval-gate precondition check: required fields complete AND
// required tasks complete. Approval status is checked separately by the
// caller (content_publishing_approvals row), since it is a human action.
export function canAdvanceStage({ fieldDefs, fieldValues, taskDefs, taskStatus }) {
  const { valid: fieldsOk, errors: fieldErrors } = validateFieldValues(fieldDefs, fieldValues)
  const requiredTasks = taskDefs.filter(t => t.required)
  const doneKeys = new Set((taskStatus || []).filter(t => t.done).map(t => t.task_key))
  const missingTasks = requiredTasks.filter(t => !doneKeys.has(t.key))
  return {
    canAdvance: fieldsOk && missingTasks.length === 0,
    fieldErrors,
    missingTasks,
  }
}
