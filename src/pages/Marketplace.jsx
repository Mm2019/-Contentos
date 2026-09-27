import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createEntity, listEntities } from '../lib/core'
import { useWorkspace } from '../lib/workspace'

const TABS = [
  ['overview','Overview'], ['listings','Listings'], ['categories','Categories'], ['deals','Deals'],
  ['verification','Verification'], ['trust','Trust'], ['reviews','Reviews'], ['reports','Reports'],
  ['disputes','Disputes'], ['safety','Safety']
]
const LISTING_STATUS = ['draft','pending_review','published','paused','sold','archived','rejected']
const DEAL_STATUS = ['initiated','negotiating','accepted','paid','completed','cancelled','disputed','refunded']
const VERIFICATION_STATUS = ['pending','submitted','verified','rejected','expired']
const REPORT_STATUS = ['open','reviewing','actioned','dismissed','closed']
const DISPUTE_STATUS = ['opened','investigating','resolution_proposed','resolved','rejected','escalated']
const SAFETY_STATUS = ['open','monitoring','resolved','dismissed']
const SEVERITY = ['critical','high','medium','low']

export default function Marketplace(){
  const { id: routeProjectId } = useParams()
  const { workspace } = useWorkspace()
  const [tab,setTab] = useState('overview')
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  const [projects,setProjects] = useState([])
  const [projectId,setProjectId] = useState(routeProjectId || '')
  const [data,setData] = useState({listings:[],categories:[],deals:[],verification:[],trust:[],reviews:[],reports:[],disputes:[],safety:[]})

  async function load(){
    if(!workspace) return
    setLoading(true); setError('')
    try{
      const [projects,listings,categories,deals,verification,trust,reviews,reports,disputes,safety] = await Promise.all([
        listEntities('uos_projects',workspace.id),
        listEntities('uos_marketplace_listings',workspace.id),
        listEntities('uos_marketplace_categories',workspace.id),
        listEntities('uos_marketplace_deals',workspace.id),
        listEntities('uos_marketplace_verifications',workspace.id),
        listEntities('uos_marketplace_trust_scores',workspace.id),
        listEntities('uos_marketplace_reviews',workspace.id),
        listEntities('uos_marketplace_reports',workspace.id),
        listEntities('uos_marketplace_disputes',workspace.id),
        listEntities('uos_marketplace_safety_events',workspace.id),
      ])
      setProjects(projects)
      if(routeProjectId) setProjectId(routeProjectId)
      setData({listings,categories,deals,verification,trust,reviews,reports,disputes,safety})
    }catch(e){ setError(e.message || 'تعذر تحميل Marketplace OS') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load() },[workspace?.id,routeProjectId])

  const scope = useMemo(()=>{
    if(!projectId) return data
    const filter = items => items.filter(x => !x.project_id || x.project_id === projectId)
    return Object.fromEntries(Object.keys(data).map(key=>[key,filter(data[key])]))
  },[data,projectId])

  async function add(table,payload){
    try{
      setError('')
      await createEntity(table,{workspace_id:workspace.id,project_id:projectId || payload.project_id || null,...payload})
      await load()
    }catch(e){ setError(e.message || 'تعذر الحفظ') }
  }

  const projectName = projects.find(p=>p.id===projectId)?.name
  return <div>
    <header className="page-head">
      <div>
        <div className="eyebrow">MARKETPLACE OS · PHASE 13</div>
        <h1>{projectName ? `${projectName} · Marketplace OS` : 'Marketplace OS'}</h1>
        <p className="muted">Listings → category-aware attributes → Deals → Verification / Trust → Reviews / Reports → Disputes / Safety. Commerce Orders and Finance Ledger remain their own sources of truth.</p>
      </div>
      <div className="actions">{projectId && <Link className="secondary" to={`/projects/${projectId}`}>العودة للمشروع</Link>}</div>
    </header>
    {error && <div className="error" style={{marginBottom:14}}>{error}</div>}
    {loading ? <div className="card">جاري تحميل Marketplace OS…</div> : <>
      <div className="chip-picker finance-tabs">{TABS.map(([k,l])=><button type="button" key={k} className={`chip selectable ${tab===k?'selected':''}`} onClick={()=>setTab(k)}>{l}</button>)}</div>
      {!routeProjectId && <div className="card" style={{marginBottom:16}}><div className="form-grid"><label>Project<select value={projectId} onChange={e=>setProjectId(e.target.value)}><option value="">كل المشاريع</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><div className="muted" style={{alignSelf:'end'}}>Marketplace يعمل على مستوى Workspace أو Project. User/People identity تُشار إليها كـreference ولا نكرر People أو Customers هنا.</div></div></div>}
      {tab==='overview' && <Overview data={scope}/>} 
      {tab==='listings' && <Listings items={scope.listings} categories={scope.categories} onAdd={p=>add('uos_marketplace_listings',p)}/>} 
      {tab==='categories' && <Categories items={scope.categories} onAdd={p=>add('uos_marketplace_categories',p)}/>} 
      {tab==='deals' && <Deals items={scope.deals} listings={scope.listings} onAdd={p=>add('uos_marketplace_deals',p)}/>} 
      {tab==='verification' && <Verification items={scope.verification} onAdd={p=>add('uos_marketplace_verifications',p)}/>} 
      {tab==='trust' && <Trust items={scope.trust} onAdd={p=>add('uos_marketplace_trust_scores',p)}/>} 
      {tab==='reviews' && <Reviews items={scope.reviews} listings={scope.listings} onAdd={p=>add('uos_marketplace_reviews',p)}/>} 
      {tab==='reports' && <Reports items={scope.reports} listings={scope.listings} onAdd={p=>add('uos_marketplace_reports',p)}/>} 
      {tab==='disputes' && <Disputes items={scope.disputes} deals={scope.deals} onAdd={p=>add('uos_marketplace_disputes',p)}/>} 
      {tab==='safety' && <Safety items={scope.safety} listings={scope.listings} deals={scope.deals} onAdd={p=>add('uos_marketplace_safety_events',p)}/>} 
    </>}
  </div>
}

function Overview({data}){
  const live = data.listings.filter(x=>x.status==='published').length
  const openDeals = data.deals.filter(x=>!['cancelled','completed','refunded'].includes(x.status)).length
  const pendingVerification = data.verification.filter(x=>['pending','submitted'].includes(x.status)).length
  const safety = data.safety.filter(x=>!['resolved','dismissed'].includes(x.status)).length
  const disputes = data.disputes.filter(x=>!['resolved','rejected'].includes(x.status)).length
  return <section>
    <div className="grid grid-4">
      <Metric title="Listings" value={data.listings.length}/>
      <Metric title="Published" value={live}/>
      <Metric title="Open Deals" value={openDeals}/>
      <Metric title="Safety Attention" value={safety}/>
    </div>
    <div className="section grid grid-3">
      <div className="card"><div className="section-head"><h2>Trust / Verification</h2><span className={`status-badge ${pendingVerification?'bad':'good'}`}>{pendingVerification?`${pendingVerification} pending`:'Clear'}</span></div><p className="muted">Verification: {data.verification.length}. Trust records: {data.trust.length}.</p></div>
      <div className="card"><div className="section-head"><h2>Disputes</h2><span className={`status-badge ${disputes?'bad':'good'}`}>{disputes || 'None'}</span></div><p className="muted">Open disputes: {disputes}. Reports: {data.reports.length}.</p></div>
      <div className="card"><div className="section-head"><h2>Source-of-truth rules</h2><span className="status-badge good">Shared Core</span></div><p className="muted">Listings / marketplace states live here. Commerce owns Orders and Customers. Finance owns money. People owns identity. ContentOS owns content.</p></div>
    </div>
  </section>
}

function Listings({items,categories,onAdd}){
  const [f,setF]=useState({title:'',category_id:'',seller_ref:'',description:'',status:'draft',attributes:'{}',price:'',currency:'EGP',location:'',external_id:''})
  return <section className="section grid grid-2">
    <FormCard title="Listing" fields={f} setFields={setF} labels={{title:'Title',category_id:'Category',seller_ref:'Seller Reference',description:'Description',status:'Status',attributes:'Category Attributes JSON',price:'Price',currency:'Currency',location:'Location',external_id:'External ID'}} selects={{category_id:[['','بدون Category'],...categories.map(x=>[x.id,x.name])],status:LISTING_STATUS.map(x=>[x,x])}} onSubmit={()=>{if(!f.title)return;let attributes={};try{attributes=JSON.parse(f.attributes||'{}')}catch{attributes={raw:f.attributes}};onAdd({...f,attributes,price:Number(f.price||0)});setF({title:'',category_id:'',seller_ref:'',description:'',status:'draft',attributes:'{}',price:'',currency:'EGP',location:'',external_id:''})}}/>
    <ListCard title="Listings" items={items} render={x=>{const c=categories.find(v=>v.id===x.category_id); return <div><div className="between"><strong>{x.title}</strong><span className={`status-badge ${x.status==='published'?'good':x.status==='rejected'?'bad':''}`}>{x.status}</span></div><div className="muted">{c?.name||'No category'} · {x.price||0} {x.currency||'EGP'} · {x.location||'—'}</div></div>}}/>
  </section>
}

function Categories({items,onAdd}){
  const [f,setF]=useState({name:'',slug:'',parent_id:'',attribute_schema:'{}',status:'active',description:''})
  return <section className="section grid grid-2"><FormCard title="Category" fields={f} setFields={setF} labels={{name:'Name',slug:'Slug',parent_id:'Parent Category ID',attribute_schema:'Attribute Schema JSON',status:'Status',description:'Description'}} selects={{status:[['active','active'],['hidden','hidden'],['archived','archived']]}} onSubmit={()=>{if(!f.name)return;let schema={};try{schema=JSON.parse(f.attribute_schema||'{}')}catch{schema={raw:f.attribute_schema}};onAdd({...f,attribute_schema:schema});setF({name:'',slug:'',parent_id:'',attribute_schema:'{}',status:'active',description:''})}}/><ListCard title="Categories" items={items} render={x=><div><div className="between"><strong>{x.name}</strong><span className="chip">{x.status}</span></div><div className="muted">{x.slug||'—'} · schema keys: {Object.keys(x.attribute_schema||{}).length}</div></div>}/></section>
}

function Deals({items,listings,onAdd}){
  const [f,setF]=useState({listing_id:'',buyer_ref:'',seller_ref:'',status:'initiated',agreed_amount:'',currency:'EGP',commerce_order_id:'',finance_transaction_id:'',expires_at:'',notes:''})
  return <section className="section grid grid-2"><FormCard title="Deal" fields={f} setFields={setF} labels={{listing_id:'Listing ID',buyer_ref:'Buyer Reference',seller_ref:'Seller Reference',status:'Status',agreed_amount:'Agreed Amount',currency:'Currency',commerce_order_id:'Commerce Order ID',finance_transaction_id:'Finance Transaction ID',expires_at:'Expires At',notes:'Notes'}} selects={{listing_id:[['','بدون Listing'],...listings.map(x=>[x.id,x.title])],status:DEAL_STATUS.map(x=>[x,x])}} onSubmit={()=>{if(!f.listing_id)return;onAdd({...f,agreed_amount:Number(f.agreed_amount||0)});setF({listing_id:'',buyer_ref:'',seller_ref:'',status:'initiated',agreed_amount:'',currency:'EGP',commerce_order_id:'',finance_transaction_id:'',expires_at:'',notes:''})}}/><ListCard title="Deals" items={items} render={x=><div><div className="between"><strong>{listings.find(l=>l.id===x.listing_id)?.title||x.listing_id}</strong><span className={`status-badge ${['disputed','cancelled'].includes(x.status)?'bad':''}`}>{x.status}</span></div><div className="muted">{x.agreed_amount||0} {x.currency||'EGP'} · Buyer: {x.buyer_ref||'—'} · Seller: {x.seller_ref||'—'}</div></div>}/></section>
}

function Verification({items,onAdd}){
  const [f,setF]=useState({subject_type:'person',subject_ref:'',method:'manual',status:'pending',submitted_at:'',verified_at:'',expires_at:'',reviewer_ref:'',notes:''})
  return <section className="section grid grid-2"><FormCard title="Verification" fields={f} setFields={setF} labels={{subject_type:'Subject Type',subject_ref:'Subject Reference',method:'Method',status:'Status',submitted_at:'Submitted At',verified_at:'Verified At',expires_at:'Expires At',reviewer_ref:'Reviewer Reference',notes:'Notes'}} selects={{subject_type:['person','seller','buyer','business','listing'].map(x=>[x,x]),status:VERIFICATION_STATUS.map(x=>[x,x]),method:['manual','document','platform','other'].map(x=>[x,x])}} onSubmit={()=>{if(!f.subject_ref)return;onAdd(f);setF({subject_type:'person',subject_ref:'',method:'manual',status:'pending',submitted_at:'',verified_at:'',expires_at:'',reviewer_ref:'',notes:''})}}/><ListCard title="Verification Records" items={items} render={x=><div><div className="between"><strong>{x.subject_ref}</strong><span className={`status-badge ${x.status==='verified'?'good':['rejected','expired'].includes(x.status)?'bad':''}`}>{x.status}</span></div><div className="muted">{x.subject_type} · {x.method} · reviewer: {x.reviewer_ref||'—'}</div></div>}/></section>
}

function Trust({items,onAdd}){
  const [f,setF]=useState({subject_type:'person',subject_ref:'',trust_score:'0',risk_level:'medium',verification_state:'unverified',signals:'{}',reviewed_at:'',notes:''})
  return <section className="section grid grid-2"><FormCard title="Trust Score" fields={f} setFields={setF} labels={{subject_type:'Subject Type',subject_ref:'Subject Reference',trust_score:'Trust Score',risk_level:'Risk Level',verification_state:'Verification State',signals:'Signals JSON',reviewed_at:'Reviewed At',notes:'Notes'}} selects={{subject_type:['person','seller','buyer','business','listing'].map(x=>[x,x]),risk_level:SEVERITY.map(x=>[x,x]),verification_state:['unverified','pending','verified','rejected'].map(x=>[x,x])}} onSubmit={()=>{if(!f.subject_ref)return;let signals={};try{signals=JSON.parse(f.signals||'{}')}catch{signals={raw:f.signals}};onAdd({...f,trust_score:Number(f.trust_score||0),signals});setF({subject_type:'person',subject_ref:'',trust_score:'0',risk_level:'medium',verification_state:'unverified',signals:'{}',reviewed_at:'',notes:''})}}/><ListCard title="Trust Records" items={items} render={x=><div><div className="between"><strong>{x.subject_ref}</strong><span className={`status-badge ${Number(x.trust_score)>=70?'good':Number(x.trust_score)<40?'bad':''}`}>{x.trust_score}/100</span></div><div className="muted">risk: {x.risk_level} · verification: {x.verification_state}</div></div>}/></section>
}

function Reviews({items,listings,onAdd}){
  const [f,setF]=useState({listing_id:'',reviewer_ref:'',reviewee_ref:'',rating:'5',body:'',status:'published'})
  return <section className="section grid grid-2"><FormCard title="Review" fields={f} setFields={setF} labels={{listing_id:'Listing ID',reviewer_ref:'Reviewer Reference',reviewee_ref:'Reviewee Reference',rating:'Rating (1-5)',body:'Review',status:'Status'}} selects={{listing_id:[['','بدون Listing'],...listings.map(x=>[x.id,x.title])],rating:['1','2','3','4','5'].map(x=>[x,x]),status:['pending','published','hidden','removed'].map(x=>[x,x])}} onSubmit={()=>{if(!f.reviewer_ref||!f.reviewee_ref)return;onAdd({...f,rating:Number(f.rating||5)});setF({listing_id:'',reviewer_ref:'',reviewee_ref:'',rating:'5',body:'',status:'published'})}}/><ListCard title="Reviews" items={items} render={x=><div><div className="between"><strong>{x.rating}/5</strong><span className="chip">{x.status}</span></div><div className="muted">{x.body||'—'} · reviewer: {x.reviewer_ref}</div></div>}/></section>
}

function Reports({items,listings,onAdd}){
  const [f,setF]=useState({target_type:'listing',target_id:'',reporter_ref:'',reason:'',severity:'medium',status:'open',notes:''})
  return <section className="section grid grid-2"><FormCard title="Report" fields={f} setFields={setF} labels={{target_type:'Target Type',target_id:'Target ID',reporter_ref:'Reporter Reference',reason:'Reason',severity:'Severity',status:'Status',notes:'Notes'}} selects={{target_type:['listing','person','deal','review','category'].map(x=>[x,x]),severity:SEVERITY.map(x=>[x,x]),status:REPORT_STATUS.map(x=>[x,x])}} onSubmit={()=>{if(!f.target_id||!f.reporter_ref)return;onAdd(f);setF({target_type:'listing',target_id:'',reporter_ref:'',reason:'',severity:'medium',status:'open',notes:''})}}/><ListCard title="Reports" items={items} render={x=><div><div className="between"><strong>{x.reason||'Marketplace report'}</strong><span className={`status-badge ${['critical','high'].includes(x.severity)?'bad':''}`}>{x.severity}</span></div><div className="muted">{x.target_type}: {x.target_id} · {x.status}</div></div>}/></section>
}

function Disputes({items,deals,onAdd}){
  const [f,setF]=useState({deal_id:'',opened_by_ref:'',reason:'',status:'opened',claimed_amount:'',currency:'EGP',resolution:'',finance_transaction_id:'',resolved_at:''})
  return <section className="section grid grid-2"><FormCard title="Dispute" fields={f} setFields={setF} labels={{deal_id:'Deal ID',opened_by_ref:'Opened By Reference',reason:'Reason',status:'Status',claimed_amount:'Claimed Amount',currency:'Currency',resolution:'Resolution',finance_transaction_id:'Finance Transaction ID',resolved_at:'Resolved At'}} selects={{deal_id:[['','بدون Deal'],...deals.map(x=>[x.id,x.id])],status:DISPUTE_STATUS.map(x=>[x,x])}} onSubmit={()=>{if(!f.opened_by_ref)return;onAdd({...f,claimed_amount:Number(f.claimed_amount||0)});setF({deal_id:'',opened_by_ref:'',reason:'',status:'opened',claimed_amount:'',currency:'EGP',resolution:'',finance_transaction_id:'',resolved_at:''})}}/><ListCard title="Disputes" items={items} render={x=><div><div className="between"><strong>{x.reason||'Dispute'}</strong><span className={`status-badge ${['opened','investigating','escalated'].includes(x.status)?'bad':''}`}>{x.status}</span></div><div className="muted">amount: {x.claimed_amount||0} {x.currency||'EGP'} · opened by: {x.opened_by_ref}</div></div>}/></section>
}

function Safety({items,listings,deals,onAdd}){
  const [f,setF]=useState({event_type:'risk_flag',target_type:'listing',target_id:'',severity:'medium',status:'open',action_taken:'',detected_by:'manual',notes:''})
  return <section className="section grid grid-2"><FormCard title="Safety Event" fields={f} setFields={setF} labels={{event_type:'Event Type',target_type:'Target Type',target_id:'Target ID',severity:'Severity',status:'Status',action_taken:'Action Taken',detected_by:'Detected By',notes:'Notes'}} selects={{event_type:['risk_flag','fraud_signal','unsafe_meetup','content_safety','verification_failure','policy_violation'].map(x=>[x,x]),target_type:['listing','person','deal','review','report'].map(x=>[x,x]),severity:SEVERITY.map(x=>[x,x]),status:SAFETY_STATUS.map(x=>[x,x]),detected_by:['manual','rule','system','report'].map(x=>[x,x])}} onSubmit={()=>{if(!f.target_id)return;onAdd(f);setF({event_type:'risk_flag',target_type:'listing',target_id:'',severity:'medium',status:'open',action_taken:'',detected_by:'manual',notes:''})}}/><ListCard title="Safety Events" items={items} render={x=><div><div className="between"><strong>{x.event_type}</strong><span className={`status-badge ${['critical','high'].includes(x.severity)?'bad':''}`}>{x.severity}</span></div><div className="muted">{x.target_type}: {x.target_id} · {x.status} · {x.detected_by}</div></div>}/></section>
}

function Metric({title,value}){return <div className="metric"><div className="muted">{title}</div><strong>{value}</strong></div>}
function FormCard({title,fields,setFields,labels,selects={},onSubmit}){return <div className="card"><h2>{title}</h2><form onSubmit={e=>{e.preventDefault();onSubmit()}}><div className="form-stack">{Object.keys(fields).map(k=>selects[k]?<label key={k} className="muted">{labels[k]||k}<select value={fields[k]??''} onChange={e=>setFields({...fields,[k]:e.target.value})}>{selects[k].map(o=>Array.isArray(o)?<option key={o[0]} value={o[0]}>{o[1]}</option>:<option key={o} value={o}>{o}</option>)}</select></label>:<label key={k} className="muted">{labels[k]||k}<textarea rows={['description','attributes','attribute_schema','notes','body','signals','reason','resolution','action_taken'].includes(k)?3:1} value={fields[k]??''} onChange={e=>setFields({...fields,[k]:e.target.value})}/></label>)}</div><button className="primary" style={{marginTop:10}}>حفظ</button></form></div>}
function ListCard({title,items,render}){return <div className="card"><div className="section-head"><h2>{title}</h2><span className="muted">{items.length}</span></div>{items.slice(0,50).map((x,i)=><div className="list-row" key={x.id||i}>{render(x)}</div>)}{!items.length&&<div className="muted">لا توجد سجلات بعد.</div>}</div>}
