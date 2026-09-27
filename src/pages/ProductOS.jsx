import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createEntity, listEntities } from '../lib/core'
import { useWorkspace } from '../lib/workspace'

const TABS = [
  ['overview','Overview'], ['products','Products'], ['prd','PRD'], ['requirements','Requirements'], ['epics','Epics'],
  ['features','Features'], ['releases','Releases'], ['bugs','Bugs'], ['qa','QA'], ['feedback','Feedback'],
  ['support','Support'], ['analytics','Product Analytics'], ['subscriptions','Subscriptions'], ['team','Team'], ['assets','Technical Assets']
]
const FEATURE_STATUS = ['idea','discovery','spec','ready','in_development','qa','beta','released','deprecated']
const BUG_STATUS = ['open','in_progress','blocked','fixed','verified','closed','wont_fix']
const BUG_SEVERITY = ['critical','high','medium','low']
const QA_STATUS = ['not_run','passed','failed','blocked']
const TICKET_STATUS = ['new','open','pending','resolved','closed']

export default function ProductOS(){
  const { id: routeProjectId } = useParams()
  const { workspace } = useWorkspace()
  const [tab,setTab]=useState('overview'), [loading,setLoading]=useState(true), [error,setError]=useState('')
  const [projects,setProjects]=useState([])
  const [data,setData]=useState({products:[],prds:[],requirements:[],epics:[],features:[],releases:[],bugs:[],qaCases:[],qaRuns:[],qaResults:[],feedback:[],support:[],analytics:[],subscriptions:[],team:[],assets:[]})
  const [projectId,setProjectId]=useState(routeProjectId||'')

  async function load(){
    if(!workspace)return
    setLoading(true);setError('')
    try{
      const [projects,products,prds,requirements,epics,features,releases,bugs,qaCases,qaRuns,qaResults,feedback,support,analytics,subscriptions,team,assets]=await Promise.all([
        listEntities('uos_projects',workspace.id),
        listEntities('uos_product_products',workspace.id),
        listEntities('uos_product_prds',workspace.id),
        listEntities('uos_product_requirements',workspace.id),
        listEntities('uos_product_epics',workspace.id),
        listEntities('uos_product_features',workspace.id),
        listEntities('uos_product_releases',workspace.id),
        listEntities('uos_product_bugs',workspace.id),
        listEntities('uos_product_qa_cases',workspace.id),
        listEntities('uos_product_qa_runs',workspace.id),
        listEntities('uos_product_qa_results',workspace.id),
        listEntities('uos_product_feedback',workspace.id),
        listEntities('uos_product_support_tickets',workspace.id),
        listEntities('uos_product_analytics_events',workspace.id),
        listEntities('uos_product_subscriptions',workspace.id),
        listEntities('uos_product_team',workspace.id),
        listEntities('uos_product_technical_assets',workspace.id),
      ])
      setProjects(projects); if(routeProjectId)setProjectId(routeProjectId)
      setData({products,prds,requirements,epics,features,releases,bugs,qaCases,qaRuns,qaResults,feedback,support,analytics,subscriptions,team,assets})
    }catch(e){setError(e.message||'تعذر تحميل Product / SaaS OS')}
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[workspace?.id,routeProjectId])

  const scope = useMemo(()=>{
    if(!projectId)return data
    const f=k=>data[k].filter(x=>!x.project_id||x.project_id===projectId)
    return Object.fromEntries(Object.keys(data).map(k=>[k,f(k)]))
  },[data,projectId])

  async function add(table,payload){
    try{setError(''); await createEntity(table,{workspace_id:workspace.id, project_id:projectId||payload.project_id||null,...payload}); await load();}
    catch(e){setError(e.message||'تعذر الحفظ')}
  }

  const projectName = projects.find(p=>p.id===projectId)?.name
  return <div>
    <header className="page-head"><div><div className="eyebrow">PRODUCT / SAAS OS · PHASE 11</div><h1>{projectName?`${projectName} · Product OS`:'Product / SaaS OS'}</h1><p className="muted">PRD → Requirements → Epics → Features → Releases → QA → Support → Product Analytics، مع اعتماد Tasks وFinance وProjects الحالية بدل تكرارها.</p></div><div className="actions">{projectId&&<Link className="secondary" to={`/projects/${projectId}`}>العودة للمشروع</Link>}</div></header>
    {error&&<div className="error" style={{marginBottom:14}}>{error}</div>}
    {loading?<div className="card">جاري تحميل Product OS…</div>:<>
      <div className="chip-picker finance-tabs">{TABS.map(([k,l])=><button type="button" key={k} className={`chip selectable ${tab===k?'selected':''}`} onClick={()=>setTab(k)}>{l}</button>)}</div>
      {!routeProjectId&&<div className="card" style={{marginBottom:16}}><div className="form-grid"><label>Project<select value={projectId} onChange={e=>setProjectId(e.target.value)}><option value="">كل المشاريع</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><div className="muted" style={{alignSelf:'end'}}>الـProduct OS يمكن استخدامه عالميًا أو داخل Project محدد.</div></div></div>}
      {tab==='overview'&&<Overview data={scope}/>} 
      {tab==='products'&&<Products items={scope.products} onAdd={p=>add('uos_product_products',p)}/>} 
      {tab==='prd'&&<PRDs items={scope.prds} onAdd={p=>add('uos_product_prds',p)}/>} 
      {tab==='requirements'&&<Requirements items={scope.requirements} onAdd={p=>add('uos_product_requirements',p)}/>} 
      {tab==='epics'&&<Epics items={scope.epics} onAdd={p=>add('uos_product_epics',p)}/>} 
      {tab==='features'&&<Features items={scope.features} epics={scope.epics} onAdd={p=>add('uos_product_features',p)}/>} 
      {tab==='releases'&&<Releases items={scope.releases} products={scope.products} onAdd={p=>add('uos_product_releases',p)}/>} 
      {tab==='bugs'&&<Bugs items={scope.bugs} features={scope.features} releases={scope.releases} onAdd={p=>add('uos_product_bugs',p)}/>} 
      {tab==='qa'&&<QA cases={scope.qaCases} runs={scope.qaRuns} results={scope.qaResults} onAddCase={p=>add('uos_product_qa_cases',p)} onAddRun={p=>add('uos_product_qa_runs',p)} onAddResult={p=>add('uos_product_qa_results',p)}/>} 
      {tab==='feedback'&&<Feedback items={scope.feedback} onAdd={p=>add('uos_product_feedback',p)}/>} 
      {tab==='support'&&<Support items={scope.support} onAdd={p=>add('uos_product_support_tickets',p)}/>} 
      {tab==='analytics'&&<ProductAnalytics items={scope.analytics} onAdd={p=>add('uos_product_analytics_events',p)}/>} 
      {tab==='subscriptions'&&<Subscriptions items={scope.subscriptions} onAdd={p=>add('uos_product_subscriptions',p)}/>} 
      {tab==='team'&&<Team items={scope.team} onAdd={p=>add('uos_product_team',p)}/>} 
      {tab==='assets'&&<Assets items={scope.assets} onAdd={p=>add('uos_product_technical_assets',p)}/>} 
    </>}
  </div>
}

function Overview({data}){
  const rows=[['Products',data.products.length],['PRDs',data.prds.length],['Requirements',data.requirements.length],['Epics',data.epics.length],['Features',data.features.length],['Releases',data.releases.length],['Bugs',data.bugs.length],['QA Cases',data.qaCases.length],['Support Tickets',data.support.length],['Feedback',data.feedback.length]]
  const openBugs=data.bugs.filter(x=>!['closed','wont_fix','verified'].includes(x.status)).length
  const openTickets=data.support.filter(x=>!['closed','resolved'].includes(x.status)).length
  return <section><div className="grid grid-4">{rows.slice(0,8).map(([l,v])=><div className="metric" key={l}><div className="muted">{l}</div><strong>{v}</strong></div>)}</div><div className="section grid grid-2"><div className="card"><div className="section-head"><h2>Release / QA attention</h2><span className={`status-badge ${openBugs?'bad':'good'}`}>{openBugs?`${openBugs} bugs need attention`:'No open bugs'}</span></div><p className="muted">Open bugs: {openBugs}. Open support tickets: {openTickets}. QA results: {data.qaResults.length}.</p></div><div className="card"><div className="section-head"><h2>Architecture rule</h2><span className="status-badge good">Shared Core</span></div><p className="muted">Features may create/link Shared Core Tasks. Releases may group Features and Bugs. Finance remains the single ledger. Content remains in existing ContentOS.</p></div></div></section>
}

function Products({items,onAdd}){const [f,setF]=useState({name:'',slug:'',status:'draft',description:''});return <Crud title="Products" items={items} fields={['name','slug','status','description']} form={f} setForm={setF} onAdd={()=>{if(!f.name)return;onAdd(f);setF({name:'',slug:'',status:'draft',description:''})}} select={{status:['draft','active','paused','deprecated']}}/>}
function PRDs({items,onAdd}){const [f,setF]=useState({title:'',version:'1.0',problem:'',users:'',goals:'',non_goals:'',assumptions:'',risks:'',dependencies:'',acceptance_criteria:'',metrics:''});return <Crud title="PRD" items={items} fields={['title','version','problem','users','goals','non_goals','acceptance_criteria','metrics']} form={f} setForm={setF} onAdd={()=>{if(!f.title)return;onAdd(f);setF({title:'',version:'1.0',problem:'',users:'',goals:'',non_goals:'',assumptions:'',risks:'',dependencies:'',acceptance_criteria:'',metrics:''})}}/>}
function Requirements({items,onAdd}){const [f,setF]=useState({title:'',type:'functional',description:'',priority:'medium',status:'draft'});return <Crud title="Requirements" items={items} fields={['title','type','priority','status','description']} form={f} setForm={setF} onAdd={()=>{if(!f.title)return;onAdd(f);setF({title:'',type:'functional',description:'',priority:'medium',status:'draft'})}} select={{type:['functional','non_functional','business','technical'],priority:['critical','high','medium','low'],status:['draft','ready','implemented','validated','rejected']}}/>}
function Epics({items,onAdd}){const [f,setF]=useState({title:'',description:'',status:'planned'});return <Crud title="Epics" items={items} fields={['title','status','description']} form={f} setForm={setF} onAdd={()=>{if(!f.title)return;onAdd(f);setF({title:'',description:'',status:'planned'})}} select={{status:['planned','in_progress','done','cancelled']}}/>}
function Features({items,epics,onAdd}){const [f,setF]=useState({title:'',epic_id:'',status:'idea',priority:'medium',problem:'',description:'',acceptance_criteria:'',metrics:''});return <section className="section grid grid-2"><FormCard title="Feature" fields={f} setFields={setF} labels={{title:'العنوان',epic_id:'Epic',status:'Lifecycle',priority:'Priority',problem:'Problem',description:'Description',acceptance_criteria:'Acceptance Criteria',metrics:'Metrics'}} selects={{epic_id:[['','بدون Epic'],...epics.map(x=>[x.id,x.title])],status:FEATURE_STATUS.map(x=>[x,x]),priority:['critical','high','medium','low'].map(x=>[x,x])}} onSubmit={()=>{if(!f.title)return;onAdd(f);setF({title:'',epic_id:'',status:'idea',priority:'medium',problem:'',description:'',acceptance_criteria:'',metrics:''})}}/><ListCard title="Features" items={items} render={x=><div><div className="between"><strong>{x.title}</strong><span className="chip">{x.status}</span></div><div className="muted">{x.priority} · Epic: {epics.find(e=>e.id===x.epic_id)?.title||'—'}</div></div>}/></section>}
function Releases({items,products,onAdd}){const [f,setF]=useState({name:'',version:'',product_id:'',status:'planned',release_date:'',notes:''});return <section className="section grid grid-2"><FormCard title="Release" fields={f} setFields={setF} labels={{name:'Name',version:'Version',product_id:'Product',status:'Status',release_date:'Release Date',notes:'Notes'}} selects={{product_id:[['','بدون Product'],...products.map(x=>[x.id,x.name])],status:['planned','in_progress','ready','released','rolled_back'].map(x=>[x,x])}} onSubmit={()=>{if(!f.name)return;onAdd(f);setF({name:'',version:'',product_id:'',status:'planned',release_date:'',notes:''})}}/><ListCard title="Releases" items={items} render={x=><div><div className="between"><strong>{x.name}</strong><span className="chip">{x.version||'—'}</span></div><div className="muted">{x.status} · {x.release_date||'بدون تاريخ'}</div></div>}/></section>}
function Bugs({items,features,releases,onAdd}){const [f,setF]=useState({title:'',severity:'medium',priority:'medium',environment:'',steps:'',expected:'',actual:'',reproduction:'',linked_feature_id:'',release_id:'',status:'open'});return <section className="section grid grid-2"><FormCard title="Bug" fields={f} setFields={setF} labels={{title:'Title',severity:'Severity',priority:'Priority',environment:'Environment',steps:'Steps',expected:'Expected',actual:'Actual',reproduction:'Reproduction',linked_feature_id:'Feature',release_id:'Release',status:'Status'}} selects={{severity:BUG_SEVERITY.map(x=>[x,x]),priority:['critical','high','medium','low'].map(x=>[x,x]),linked_feature_id:[['','بدون Feature'],...features.map(x=>[x.id,x.title])],release_id:[['','بدون Release'],...releases.map(x=>[x.id,x.name])],status:BUG_STATUS.map(x=>[x,x])}} onSubmit={()=>{if(!f.title)return;onAdd(f);setF({title:'',severity:'medium',priority:'medium',environment:'',steps:'',expected:'',actual:'',reproduction:'',linked_feature_id:'',release_id:'',status:'open'})}}/><ListCard title="Bugs" items={items} render={x=><div><div className="between"><strong>{x.title}</strong><span className={`status-badge ${['critical','high'].includes(x.severity)?'bad':'good'}`}>{x.severity}</span></div><div className="muted">{x.status} · {x.environment||'—'}</div></div>}/></section>}
function QA({cases,runs,results,onAddCase,onAddRun,onAddResult}){const [c,setC]=useState({title:'',description:'',steps:'',expected:'',feature_id:''});const [r,setR]=useState({name:'',release_id:'',environment:'',started_at:''});const [o,setO]=useState({run_id:'',case_id:'',status:'not_run',evidence:'',notes:''});return <section className="section"><div className="grid grid-3"><FormCard title="Test Case" fields={c} setFields={setC} labels={{title:'Title',description:'Description',steps:'Steps',expected:'Expected',feature_id:'Feature ID'}} onSubmit={()=>{if(!c.title)return;onAddCase(c);setC({title:'',description:'',steps:'',expected:'',feature_id:''})}}/><FormCard title="Test Run" fields={r} setFields={setR} labels={{name:'Name',release_id:'Release ID',environment:'Environment',started_at:'Started At'}} onSubmit={()=>{if(!r.name)return;onAddRun(r);setR({name:'',release_id:'',environment:'',started_at:''})}}/><FormCard title="Result" fields={o} setFields={setO} labels={{run_id:'Run ID',case_id:'Case ID',status:'Status',evidence:'Evidence',notes:'Notes'}} selects={{status:QA_STATUS.map(x=>[x,x])}} onSubmit={()=>{if(!o.run_id||!o.case_id)return;onAddResult(o);setO({run_id:'',case_id:'',status:'not_run',evidence:'',notes:''})}}/></div><div className="section grid grid-3"><ListCard title="Test Cases" items={cases} render={x=><div><strong>{x.title}</strong><div className="muted">{x.description||'—'}</div></div>}/><ListCard title="Test Runs" items={runs} render={x=><div><strong>{x.name}</strong><div className="muted">{x.environment||'—'} · {x.started_at||'—'}</div></div>}/><ListCard title="Results" items={results} render={x=><div><span className={`status-badge ${x.status==='passed'?'good':x.status==='failed'?'bad':''}`}>{x.status}</span><div className="muted">Case: {x.case_id}</div></div>}/></div></section>}
function Feedback({items,onAdd}){const [f,setF]=useState({title:'',source:'user',status:'new',priority:'medium',description:'',linked_feature_id:''});return <section className="section grid grid-2"><FormCard title="Feedback" fields={f} setFields={setF} labels={{title:'Title',source:'Source',status:'Status',priority:'Priority',description:'Description',linked_feature_id:'Feature ID'}} selects={{source:['user','support','sales','analytics','internal'].map(x=>[x,x]),status:['new','reviewing','accepted','rejected','planned','done'].map(x=>[x,x]),priority:['critical','high','medium','low'].map(x=>[x,x])}} onSubmit={()=>{if(!f.title)return;onAdd(f);setF({title:'',source:'user',status:'new',priority:'medium',description:'',linked_feature_id:''})}}/><ListCard title="Feedback" items={items} render={x=><div><div className="between"><strong>{x.title}</strong><span className="chip">{x.status}</span></div><div className="muted">{x.source} · {x.priority}</div></div>}/></section>}
function Support({items,onAdd}){const [f,setF]=useState({title:'',type:'request',priority:'medium',status:'new',customer:'',description:'',sla_due_at:''});return <section className="section grid grid-2"><FormCard title="Support Ticket" fields={f} setFields={setF} labels={{title:'Title',type:'Type',priority:'Priority',status:'Status',customer:'Customer',description:'Description',sla_due_at:'SLA Due'}} selects={{type:['request','complaint','dispute','question','bug'].map(x=>[x,x]),priority:['critical','high','medium','low'].map(x=>[x,x]),status:TICKET_STATUS.map(x=>[x,x])}} onSubmit={()=>{if(!f.title)return;onAdd(f);setF({title:'',type:'request',priority:'medium',status:'new',customer:'',description:'',sla_due_at:''})}}/><ListCard title="Tickets" items={items} render={x=><div><div className="between"><strong>{x.title}</strong><span className="chip">{x.status}</span></div><div className="muted">{x.type} · {x.priority} · {x.customer||'—'}</div></div>}/></section>}
function ProductAnalytics({items,onAdd}){const [f,setF]=useState({event_name:'',metric:'',value:'',source:'manual',occurred_at:new Date().toISOString().slice(0,16),metadata:'{}'});return <section className="section grid grid-2"><FormCard title="Product Analytics Event" fields={f} setFields={setF} labels={{event_name:'Event',metric:'Metric',value:'Value',source:'Source',occurred_at:'Occurred At',metadata:'Metadata JSON'}} selects={{source:['manual','import','api','hybrid'].map(x=>[x,x])}} onSubmit={()=>{if(!f.event_name)return;let metadata={};try{metadata=JSON.parse(f.metadata||'{}')}catch{metadata={raw:f.metadata}};onAdd({...f,value:Number(f.value||0),metadata,occurred_at:new Date(f.occurred_at||Date.now()).toISOString()});setF({event_name:'',metric:'',value:'',source:'manual',occurred_at:new Date().toISOString().slice(0,16),metadata:'{}'})}}/><ListCard title="Analytics Events" items={items} render={x=><div><div className="between"><strong>{x.event_name}</strong><span className="chip">{x.metric||'event'}</span></div><div className="muted">{x.value} · {x.source} · {x.occurred_at}</div></div>}/></section>}
function Subscriptions({items,onAdd}){const [f,setF]=useState({name:'',plan:'',status:'active',price:'',billing_cycle:'monthly',started_at:'',renewal_at:''});return <section className="section grid grid-2"><FormCard title="Subscription" fields={f} setFields={setF} labels={{name:'Customer / Name',plan:'Plan',status:'Status',price:'Price',billing_cycle:'Billing Cycle',started_at:'Started',renewal_at:'Renewal'}} selects={{status:['trial','active','paused','cancelled'].map(x=>[x,x]),billing_cycle:['monthly','quarterly','yearly'].map(x=>[x,x])}} onSubmit={()=>{if(!f.name)return;onAdd({...f,price:Number(f.price||0)});setF({name:'',plan:'',status:'active',price:'',billing_cycle:'monthly',started_at:'',renewal_at:''})}}/><ListCard title="Subscriptions" items={items} render={x=><div className="between"><span>{x.name}<small className="muted"> · {x.plan||'—'}</small></span><strong>{x.price||0}</strong></div>}/></section>}
function Team({items,onAdd}){const [f,setF]=useState({name:'',role:'',email:'',status:'active'});return <section className="section grid grid-2"><FormCard title="Team Member" fields={f} setFields={setF} labels={{name:'Name',role:'Role',email:'Email',status:'Status'}} selects={{status:['active','inactive'].map(x=>[x,x])}} onSubmit={()=>{if(!f.name)return;onAdd(f);setF({name:'',role:'',email:'',status:'active'})}}/><ListCard title="Team" items={items} render={x=><div><strong>{x.name}</strong><div className="muted">{x.role||'—'} · {x.email||'—'}</div></div>}/></section>}
function Assets({items,onAdd}){const [f,setF]=useState({name:'',type:'repository',url:'',status:'active',notes:''});return <section className="section grid grid-2"><FormCard title="Technical Asset" fields={f} setFields={setF} labels={{name:'Name',type:'Type',url:'URL',status:'Status',notes:'Notes'}} selects={{status:['active','archived','deprecated'].map(x=>[x,x])}} onSubmit={()=>{if(!f.name)return;onAdd(f);setF({name:'',type:'repository',url:'',status:'active',notes:''})}}/><ListCard title="Technical Assets" items={items} render={x=><div className="between"><span>{x.name}<small className="muted"> · {x.type}</small></span>{x.url&&<a href={x.url} target="_blank" rel="noreferrer">↗</a>}</div>}/></section>}

function Crud({title,items,fields,form,setForm,onAdd,select={}}){return <section className="section grid grid-2"><FormCard title={title} fields={form} setFields={setForm} labels={Object.fromEntries(fields.map(x=>[x,x]))} selects={select} onSubmit={onAdd}/><ListCard title={title} items={items} render={x=><div><strong>{x.title||x.name||x.slug||'—'}</strong><div className="muted">{fields.filter(f=>f!=='title'&&f!=='name').slice(0,3).map(f=>`${f}: ${x[f]||'—'}`).join(' · ')}</div></div>}/></section>}
function FormCard({title,fields,setFields,labels,selects={},onSubmit}){return <div className="card"><h2>{title}</h2><form onSubmit={e=>{e.preventDefault();onSubmit()}}><div className="form-stack">{Object.keys(fields).map(k=>selects[k]?<label key={k} className="muted">{labels[k]||k}<select value={fields[k]} onChange={e=>setFields({...fields,[k]:e.target.value})}>{selects[k].map(o=>Array.isArray(o)?<option key={o[0]} value={o[0]}>{o[1]}</option>:<option key={o} value={o}>{o}</option>)}</select></label>:<label key={k} className="muted">{labels[k]||k}<textarea rows={['description','problem','goals','non_goals','acceptance_criteria','metrics','steps','expected','actual','reproduction','notes','body','metadata'].includes(k)?3:1} value={fields[k]??''} onChange={e=>setFields({...fields,[k]:e.target.value})}/></label>)}</div><button className="primary" style={{marginTop:10}}>حفظ</button></form></div>}
function ListCard({title,items,render}){return <div className="card"><div className="section-head"><h2>{title}</h2><span className="muted">{items.length}</span></div>{items.slice(0,50).map((x,i)=><div className="list-row" key={x.id||i}>{render(x)}</div>)}{!items.length&&<div className="muted">لا توجد سجلات بعد.</div>}</div>}
