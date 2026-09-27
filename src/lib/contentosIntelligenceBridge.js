const INTELLIGENCE_FUNCTIONS = [
  'analyticsIntelligenceReport',
  'getContentLearning',
  'normalizeContentLearning',
  'getAllAnalyticsRecords',
  'createContentLearningSignal',
  'updateContentLearningSignal',
]

function issue(severity, code, message){ return { severity, code, message } }

async function loadContentOSFrame(){
  return new Promise((resolve, reject)=>{
    const frame=document.createElement('iframe')
    frame.src='/contentos/index.html'
    frame.title='ContentOS Intelligence Scanner'
    frame.style.position='fixed'
    frame.style.width='1px'
    frame.style.height='1px'
    frame.style.opacity='0'
    frame.style.pointerEvents='none'
    frame.style.border='0'
    const timeout=setTimeout(()=>{ frame.remove(); reject(new Error('ContentOS intelligence scanner timed out.')) }, 12000)
    frame.onload=()=>{
      clearTimeout(timeout)
      setTimeout(()=>{
        try { resolve({frame, win:frame.contentWindow}) } catch(e){ frame.remove(); reject(e) }
      }, 250)
    }
    frame.onerror=()=>{ clearTimeout(timeout); frame.remove(); reject(new Error('Unable to load the original ContentOS.')) }
    document.body.appendChild(frame)
  })
}

function parseStoredPlan(win){
  try{
    const raw=win.localStorage.getItem('cos_v8')
    if(!raw) return null
    const plan=JSON.parse(raw)
    return plan && typeof plan==='object' ? plan : null
  }catch(e){ return null }
}

function flattenLearning(plan, win){
  try{
    if(typeof win.getContentLearning==='function') return win.getContentLearning(plan)
  }catch(e){}
  const raw=Array.isArray(plan?._contentLearning)?plan._contentLearning:[]
  return raw
}

export async function scanContentOSIntelligence(){
  const loaded=await loadContentOSFrame()
  const {frame,win}=loaded
  try{
    const issues=[]
    const checks=[]
    const missing=INTELLIGENCE_FUNCTIONS.filter(name=>typeof win[name]!=='function')
    if(missing.length) issues.push(issue('error','INTELLIGENCE_FUNCTIONS_MISSING',`Missing original ContentOS intelligence functions: ${missing.join(', ')}.`))

    const plan=parseStoredPlan(win)
    const learning=flattenLearning(plan,win)
    const schemaVersion=plan?._contentLearningSchemaVersion || null
    const records=typeof win.getAllAnalyticsRecords==='function' && plan ? win.getAllAnalyticsRecords(plan) : []
    let report=null
    if(plan && typeof win.analyticsIntelligenceReport==='function'){
      try{ report=win.analyticsIntelligenceReport(plan,records) }
      catch(e){ issues.push(issue('error','INTELLIGENCE_REPORT_FAILED',`Original intelligence report failed: ${e?.message||String(e)}`)) }
    }

    if(plan && typeof win.analyticsIntelligenceReport==='function'){
      const controlled=win.analyticsIntelligenceReport(plan,Array.isArray(records)?records:[])
      if(!controlled || typeof controlled!=='object' || !Array.isArray(controlled.recommendations)){
        issues.push(issue('error','INTELLIGENCE_REPORT_SHAPE_INVALID','Original intelligence report did not return the expected report structure.'))
      }
    }

    const requiredPipeline=[
      {name:'Analytics → Patterns', ok: typeof win.analyticsIntelligenceReport==='function'},
      {name:'Patterns → Learning Signals', ok: typeof win.getContentLearning==='function' && typeof win.createContentLearningSignal==='function'},
      {name:'Learning Signals → Review', ok: typeof win.updateContentLearningSignal==='function'},
      {name:'Recommendations → Traceable Evidence', ok: Array.isArray(report?.recommendations) && report.recommendations.every(r=>r && r.type && r.title && r.text)},
    ]
    requiredPipeline.forEach((item,i)=>checks.push({key:`pipeline-${i}`,ok:item.ok,label:item.name}))
    checks.push({key:'schema',ok:Boolean(schemaVersion),label:`Learning schema version ${schemaVersion||'missing'}`})
    checks.push({key:'report',ok:!issues.some(i=>i.code==='INTELLIGENCE_REPORT_FAILED'||i.code==='INTELLIGENCE_REPORT_SHAPE_INVALID'),label:'Original intelligence report executes read-only'})
    checks.push({key:'functions',ok:missing.length===0,label:'Original ContentOS intelligence functions available'})

    if(report?.recommendations?.some(r=>!r?.type || !r?.title || !r?.text)){
      issues.push(issue('error','RECOMMENDATION_TRACEABILITY_GAP','At least one recommendation is missing type/title/text metadata.'))
    }

    return {
      scannedAt:new Date().toISOString(),
      source:'Existing ContentOS · cos_v8 + original intelligence engine',
      schemaVersion,
      counts:{
        analyticsRecords:Array.isArray(records)?records.length:0,
        learningSignals:learning.length,
        proposed:learning.filter(x=>x.status==='proposed').length,
        accepted:learning.filter(x=>x.status==='accepted').length,
        applied:learning.filter(x=>x.status==='applied').length,
        rejected:learning.filter(x=>x.status==='rejected').length,
        recommendations:Array.isArray(report?.recommendations)?report.recommendations.length:0,
        anomalies:Array.isArray(report?.anomalies)?report.anomalies.length:0,
      },
      report: report ? {
        count:report.count,
        avg:report.avg,
        recentAvg:report.recentAvg,
        previousAvg:report.previousAvg,
        trend:report.trend,
        recommendations:report.recommendations||[],
        anomalies:report.anomalies||[],
      } : null,
      learning:learning.slice(0,20).map(x=>({id:x.id,title:x.title,status:x.status,source:x.source,createdAt:x.createdAt,evidenceCount:Array.isArray(x.evidence)?x.evidence.length:0})),
      checks,
      issues,
    }
  } finally {
    frame.remove()
  }
}
