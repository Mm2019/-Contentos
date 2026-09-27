const CONTENTOS_SRC = '/contentos/index.html'

function waitForLoad(frame, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const started = Date.now()
    const check = () => {
      try {
        if (frame.contentWindow?.loadData && frame.contentWindow?.getEffectiveContentConfig) {
          resolve(frame.contentWindow)
          return
        }
      } catch (e) {
        // Same-origin access is expected. Keep polling until timeout.
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error('ContentOS configuration bridge timed out.'))
        return
      }
      setTimeout(check, 150)
    }
    check()
  })
}

export async function withContentOSWindow(callback) {
  const frame = document.createElement('iframe')
  frame.title = 'ContentOS configuration validator'
  frame.src = CONTENTOS_SRC
  frame.style.position = 'fixed'
  frame.style.width = '1px'
  frame.style.height = '1px'
  frame.style.opacity = '0'
  frame.style.pointerEvents = 'none'
  frame.style.border = '0'
  document.body.appendChild(frame)
  try {
    const win = await waitForLoad(frame)
    return await callback(win)
  } finally {
    frame.remove()
  }
}

function issue(severity, code, message, meta = {}) {
  return { severity, code, message, ...meta }
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export async function scanContentOSConfiguration() {
  return withContentOSWindow(async (win) => {
    const loaded = await win.loadData()
    const plan = loaded?.data || {}
    const platforms = Array.isArray(plan._platforms) ? plan._platforms : []
    const accounts = Array.isArray(plan._accounts) ? plan._accounts : []
    const posts = typeof win.getAllPosts === 'function' ? win.getAllPosts(plan) : []
    const issues = []
    const checks = []

    checks.push({ key: 'load', ok: !!loaded?.data, label: 'ContentOS source loaded' })
    checks.push({ key: 'source', ok: !!loaded?.source, label: `Source: ${loaded?.source || 'unknown'}` })

    const platformById = new Map(platforms.map((p) => [String(p.id), p]))
    const contentTypesByKey = new Map()
    platforms.forEach((platform) => {
      ;(platform.contentTypes || []).forEach((ct) => {
        contentTypesByKey.set(`${platform.id}:${ct.id}`, ct)
      })
    })

    let configEntries = 0
    let customOverrides = 0
    let approvalStages = 0
    let snapshotPosts = 0
    let legacyPosts = 0
    let analyticsEntries = 0
    let analyticsSnapshots = 0

    for (const account of accounts) {
      const config = account?.contentConfig
      if (!isObject(config)) {
        issues.push(issue('info', 'ACCOUNT_NO_CONFIG', `Account ${account?.name || account?.id || 'unknown'} has no contentConfig; it will inherit platform defaults.`, { accountId: account?.id }))
        continue
      }

      for (const [platformId, byType] of Object.entries(config)) {
        if (!isObject(byType)) {
          issues.push(issue('error', 'CONFIG_INVALID_PLATFORM', `Account ${account?.name || account?.id} has an invalid configuration container for platform ${platformId}.`, { accountId: account?.id, platformId }))
          continue
        }
        if (!platformById.has(String(platformId))) {
          issues.push(issue('error', 'CONFIG_UNKNOWN_PLATFORM', `Account ${account?.name || account?.id} references missing platform ${platformId}.`, { accountId: account?.id, platformId }))
        }

        for (const [contentTypeId, rawCfg] of Object.entries(byType)) {
          configEntries += 1
          const cfg = isObject(rawCfg) ? rawCfg : {}
          const ct = contentTypesByKey.get(`${platformId}:${contentTypeId}`)
          if (!ct) {
            issues.push(issue('error', 'CONFIG_UNKNOWN_CONTENT_TYPE', `Account ${account?.name || account?.id} references missing content type ${contentTypeId} under ${platformId}.`, { accountId: account?.id, platformId, contentTypeId }))
            continue
          }

          const mode = cfg.mode || 'inherit'
          if (!['inherit', 'custom'].includes(mode)) {
            issues.push(issue('error', 'CONFIG_UNKNOWN_MODE', `Unknown account configuration mode '${mode}'.`, { accountId: account?.id, platformId, contentTypeId }))
          }
          if (mode === 'custom') {
            customOverrides += 1
            if (!Array.isArray(cfg.stages)) {
              issues.push(issue('error', 'CUSTOM_STAGES_NOT_ARRAY', `Custom workflow for ${account?.name || account?.id} / ${ct.name || contentTypeId} is not an array.`, { accountId: account?.id, platformId, contentTypeId }))
            }
          }

          if (!isObject(cfg.taskOverrides)) {
            issues.push(issue('error', 'TASK_OVERRIDES_INVALID', `taskOverrides must be an object.`, { accountId: account?.id, platformId, contentTypeId }))
          }
          if (!isObject(cfg.fieldOverrides)) {
            issues.push(issue('error', 'FIELD_OVERRIDES_INVALID', `fieldOverrides must be an object.`, { accountId: account?.id, platformId, contentTypeId }))
          }

          const kpiMode = cfg.kpiMode || 'inherit'
          if (!['inherit', 'custom'].includes(kpiMode)) {
            issues.push(issue('error', 'KPI_MODE_INVALID', `Unknown KPI mode '${kpiMode}'.`, { accountId: account?.id, platformId, contentTypeId }))
          }
          if (kpiMode === 'custom' && !Array.isArray(cfg.postKpis)) {
            issues.push(issue('error', 'CUSTOM_KPIS_NOT_ARRAY', `Custom KPIs must be an array.`, { accountId: account?.id, platformId, contentTypeId }))
          }

          const analytics = isObject(cfg.analytics) ? cfg.analytics : null
          if (analytics?.mode && !['inherit', 'custom'].includes(analytics.mode)) {
            issues.push(issue('error', 'ANALYTICS_MODE_INVALID', `Unknown analytics mode '${analytics.mode}'.`, { accountId: account?.id, platformId, contentTypeId }))
          }

          if (typeof win.getEffectiveContentConfig === 'function') {
            const effective = win.getEffectiveContentConfig(plan, account, platformId, contentTypeId)
            const expectedSource = mode === 'custom' ? 'account' : 'platform'
            if (effective?.source !== expectedSource) {
              issues.push(issue('error', 'EFFECTIVE_SOURCE_MISMATCH', `Effective configuration source does not match inheritance mode.`, { accountId: account?.id, platformId, contentTypeId }))
            }
            if (mode === 'inherit' && !deepEqual(effective?.stages || [], ct.stages || [])) {
              issues.push(issue('error', 'INHERIT_STAGE_DRIFT', `Inherited stages differ from platform/content-type defaults.`, { accountId: account?.id, platformId, contentTypeId }))
            }
            if (kpiMode === 'inherit' && !deepEqual(effective?.postKpis || [], ct.postKpis || [])) {
              issues.push(issue('error', 'INHERIT_KPI_DRIFT', `Inherited KPIs differ from platform/content-type defaults.`, { accountId: account?.id, platformId, contentTypeId }))
            }
          }
        }
      }
    }

    for (const post of posts) {
      if (Array.isArray(post?._workflow) && post._workflow.length) {
        snapshotPosts += 1
        for (const stage of post._workflow) {
          if (stage?.requiresApproval) approvalStages += 1
          if (!stage?.id || !stage?.name) {
            issues.push(issue('error', 'SNAPSHOT_STAGE_INVALID', `Post ${post?.id || 'unknown'} contains an invalid workflow stage snapshot.`, { postId: post?.id }))
          }
        }
        if (typeof post.approvals !== 'object' || Array.isArray(post.approvals)) {
          issues.push(issue('error', 'APPROVAL_STATE_INVALID', `Post ${post?.id || 'unknown'} has invalid approvals state.`, { postId: post?.id }))
        }
      } else {
        legacyPosts += 1
      }
    }

    const analyticsMap = isObject(plan._analytics) ? plan._analytics : {}
    Object.values(analyticsMap).forEach((record) => {
      ;(record?.entries || []).forEach((entry) => {
        analyticsEntries += 1
        if (entry?.definitionSnapshot) analyticsSnapshots += 1
      })
    })
    if (analyticsEntries && analyticsEntries !== analyticsSnapshots) {
      issues.push(issue('warning', 'ANALYTICS_SNAPSHOT_GAPS', `${analyticsEntries - analyticsSnapshots} historical analytics entries do not contain a definitionSnapshot.`, { missing: analyticsEntries - analyticsSnapshots }))
    }

    const versioning = isObject(plan._versioning) ? plan._versioning : {}
    if (!versioning.schemaVersion || !versioning.currentVersion) {
      issues.push(issue('warning', 'VERSIONING_METADATA_MISSING', 'ContentOS versioning metadata is incomplete.'))
    }

    const counts = {
      accounts: accounts.length,
      platforms: platforms.length,
      configEntries,
      customOverrides,
      posts: posts.length,
      snapshotPosts,
      legacyPosts,
      approvalStages,
      analyticsEntries,
      analyticsSnapshots,
    }

    checks.push({ key: 'accounts', ok: accounts.length > 0, label: `${accounts.length} Content Accounts` })
    checks.push({ key: 'configs', ok: !issues.some((i) => i.severity === 'error' && i.code.startsWith('CONFIG_')), label: `${configEntries} account configuration entries` })
    checks.push({ key: 'snapshots', ok: !issues.some((i) => i.severity === 'error' && i.code.startsWith('SNAPSHOT_')), label: `${snapshotPosts} workflow snapshots` })
    checks.push({ key: 'analytics', ok: analyticsEntries === analyticsSnapshots || analyticsEntries === 0, label: `${analyticsSnapshots}/${analyticsEntries || 0} analytics entries have definition snapshots` })

    return {
      scannedAt: new Date().toISOString(),
      source: loaded?.source || 'unknown',
      updatedAt: loaded?.updatedAt || null,
      counts,
      checks,
      issues,
    }
  })
}
