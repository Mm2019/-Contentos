// Shared error handling (G-005). Every data-layer function should throw or
// return an AppError instead of a raw Supabase/Postgres error object, so
// every page can render the same Arabic error banner regardless of source.

export class AppError extends Error {
  constructor(message, { code = 'unknown', cause = null, field = null } = {}) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.field = field
    this.cause = cause
  }
}

// Maps a Supabase/Postgres error into an Arabic-friendly AppError.
export function fromSupabaseError(error, fallbackMessage = 'حدث خطأ غير متوقع') {
  if (!error) return null
  const msg = error.message || ''
  if (error.code === '23505' || msg.includes('duplicate key')) {
    return new AppError('هذا العنصر موجود بالفعل', { code: 'conflict', cause: error })
  }
  if (error.code === '23503') {
    return new AppError('لا يمكن إتمام العملية بسبب ارتباط ببيانات أخرى', { code: 'fk_violation', cause: error })
  }
  if (error.code === '42501' || msg.toLowerCase().includes('row-level security')) {
    return new AppError('لا تملك صلاحية القيام بهذا الإجراء', { code: 'forbidden', cause: error })
  }
  return new AppError(msg || fallbackMessage, { code: error.code || 'unknown', cause: error })
}

// Small helper so pages can write: const [data, err] = await safe(query)
export async function safe(promise) {
  try {
    const { data, error } = await promise
    if (error) return [null, fromSupabaseError(error)]
    return [data, null]
  } catch (e) {
    if (e instanceof AppError) return [null, e]
    return [null, fromSupabaseError(null, e?.message)]
  }
}
