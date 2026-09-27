import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createEntity, listEntities } from '../lib/core'
import { useWorkspace } from '../lib/workspace'

const TABS = [
  ['overview','Overview'], ['products','Products'], ['variants','Variants'], ['inventory','Inventory'],
  ['orders','Orders'], ['customers','Customers'], ['suppliers','Suppliers'], ['returns','Returns'],
  ['promotions','Promotions'], ['campaigns','Campaigns'],
]

const ORDER_STATUS = ['pending','confirmed','processing','packed','shipped','delivered','cancelled','returned','refunded']
const PRODUCT_STATUS = ['idea','draft','ready','published','archived']
const INVENTORY_STATUS = ['good','low','critical','out']

export default function Commerce(){
  const { id: routeProjectId } = useParams()
  const { workspace } = useWorkspace()
  const [tab,setTab] = useState('overview')
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  const [projects,setProjects] = useState([])
  const [projectId,setProjectId] = useState(routeProjectId || '')
  const [data,setData] = useState({products:[],variants:[],inventory:[],orders:[],orderItems:[],customers:[],suppliers:[],returns:[],promotions:[],campaigns:[]})

  async function load(){
    if(!workspace) return
    setLoading(true); setError('')
    try{
      const [projects,products,variants,inventory,orders,orderItems,customers,suppliers,returns,promotions,campaigns] = await Promise.all([
        listEntities('uos_projects',workspace.id),
        listEntities('uos_commerce_products',workspace.id),
        listEntities('uos_commerce_variants',workspace.id),
        listEntities('uos_commerce_inventory',workspace.id),
        listEntities('uos_commerce_orders',workspace.id),
        listEntities('uos_commerce_order_items',workspace.id),
        listEntities('uos_commerce_customers',workspace.id),
        listEntities('uos_commerce_suppliers',workspace.id),
        listEntities('uos_commerce_returns',workspace.id),
        listEntities('uos_commerce_promotions',workspace.id),
        listEntities('uos_commerce_campaigns',workspace.id),
      ])
      setProjects(projects)
      if(routeProjectId) setProjectId(routeProjectId)
      setData({products,variants,inventory,orders,orderItems,customers,suppliers,returns,promotions,campaigns})
    }catch(e){ setError(e.message || 'تعذر تحميل Commerce OS') }
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
        <div className="eyebrow">COMMERCE OS · PHASE 12</div>
        <h1>{projectName ? `${projectName} · Commerce OS` : 'Commerce OS'}</h1>
        <p className="muted">Products → Variants → Inventory → Orders → Customers / Suppliers → Returns → Promotions → Campaigns. Finance remains the single financial ledger.</p>
      </div>
      <div className="actions">{projectId && <Link className="secondary" to={`/projects/${projectId}`}>العودة للمشروع</Link>}</div>
    </header>
    {error && <div className="error" style={{marginBottom:14}}>{error}</div>}
    {loading ? <div className="card">جاري تحميل Commerce OS…</div> : <>
      <div className="chip-picker finance-tabs">{TABS.map(([k,l])=><button type="button" key={k} className={`chip selectable ${tab===k?'selected':''}`} onClick={()=>setTab(k)}>{l}</button>)}</div>
      {!routeProjectId && <div className="card" style={{marginBottom:16}}><div className="form-grid"><label>Project<select value={projectId} onChange={e=>setProjectId(e.target.value)}><option value="">كل المشاريع</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><div className="muted" style={{alignSelf:'end'}}>Commerce يمكن أن يعمل على مستوى Workspace أو داخل Project محدد.</div></div></div>}
      {tab==='overview' && <Overview data={scope}/>} 
      {tab==='products' && <Products items={scope.products} suppliers={scope.suppliers} onAdd={p=>add('uos_commerce_products',p)}/>} 
      {tab==='variants' && <Variants items={scope.variants} products={scope.products} onAdd={p=>add('uos_commerce_variants',p)}/>} 
      {tab==='inventory' && <Inventory items={scope.inventory} variants={scope.variants} onAdd={p=>add('uos_commerce_inventory',p)}/>} 
      {tab==='orders' && <Orders items={scope.orders} customers={scope.customers} onAdd={p=>add('uos_commerce_orders',p)}/>} 
      {tab==='customers' && <Customers items={scope.customers} onAdd={p=>add('uos_commerce_customers',p)}/>} 
      {tab==='suppliers' && <Suppliers items={scope.suppliers} onAdd={p=>add('uos_commerce_suppliers',p)}/>} 
      {tab==='returns' && <Returns items={scope.returns} orders={scope.orders} onAdd={p=>add('uos_commerce_returns',p)}/>} 
      {tab==='promotions' && <Promotions items={scope.promotions} products={scope.products} onAdd={p=>add('uos_commerce_promotions',p)}/>} 
      {tab==='campaigns' && <Campaigns items={scope.campaigns} products={scope.products} onAdd={p=>add('uos_commerce_campaigns',p)}/>} 
    </>}
  </div>
}

function Overview({data}){
  const activeProducts = data.products.filter(x=>x.status==='published').length
  const openOrders = data.orders.filter(x=>!['cancelled','returned','refunded'].includes(x.status)).length
  const returns = data.returns.filter(x=>!['refunded','rejected'].includes(x.status)).length
  const lowStock = data.inventory.filter(x=>['low','critical','out'].includes(x.stock_status)).length
  return <section>
    <div className="grid grid-4">
      <Metric title="Products" value={data.products.length}/>
      <Metric title="Published" value={activeProducts}/>
      <Metric title="Open Orders" value={openOrders}/>
      <Metric title="Stock Attention" value={lowStock}/>
    </div>
    <div className="section grid grid-2">
      <div className="card"><div className="section-head"><h2>Commerce Attention</h2><span className={`status-badge ${lowStock?'bad':'good'}`}>{lowStock?`${lowStock} stock alerts`:'No stock alerts'}</span></div><p className="muted">Open orders: {openOrders}. Active returns: {returns}. Customers: {data.customers.length}. Suppliers: {data.suppliers.length}.</p></div>
      <div className="card"><div className="section-head"><h2>Source-of-truth rules</h2><span className="status-badge good">Shared Core</span></div><p className="muted">Orders belong to Commerce, financial movements belong to the single Finance Ledger, Tasks remain Shared Core, and Content marketing assets remain in existing ContentOS.</p></div>
    </div>
  </section>
}
function Metric({title,value}){return <div className="metric"><div className="muted">{title}</div><strong>{value}</strong></div>}

function Products({items,suppliers,onAdd}){
  const [f,setF]=useState({name:'',sku:'',category:'',type:'physical',supplier_id:'',cost:'',price:'',status:'draft',description:'',assets:''})
  return <section className="section grid grid-2"><FormCard title="Product" fields={f} setFields={setF} labels={{name:'Name',sku:'SKU',category:'Category',type:'Type',supplier_id:'Supplier ID',cost:'Cost',price:'Price',status:'Status',description:'Description',assets:'Assets / URLs'}} selects={{type:['physical','digital','service'].map(x=>[x,x]),status:PRODUCT_STATUS.map(x=>[x,x])}} onSubmit={()=>{if(!f.name)return;onAdd({...f,cost:Number(f.cost||0),price:Number(f.price||0)});setF({name:'',sku:'',category:'',type:'physical',supplier_id:'',cost:'',price:'',status:'draft',description:'',assets:''})}}/>
  <ListCard title="Products" items={items} render={x=><div><div className="between"><strong>{x.name}</strong><span className="chip">{x.status}</span></div><div className="muted">{x.sku||'No SKU'} · {x.category||'—'} · {x.price||0}</div></div>}/></section>
}

function Variants({items,products,onAdd}){
  const [f,setF]=useState({product_id:'',sku:'',name:'',attributes:'{}',cost:'',price:'',barcode:'',status:'active'})
  return <section className="section grid grid-2"><FormCard title="Product Variant" fields={f} setFields={setF} labels={{product_id:'Product ID',sku:'SKU',name:'Variant Name',attributes:'Attributes JSON',cost:'Cost',price:'Price',barcode:'Barcode',status:'Status'}} selects={{status:['active','inactive','archived'].map(x=>[x,x])}} onSubmit={()=>{if(!f.product_id||!f.name)return;let attributes={};try{attributes=JSON.parse(f.attributes||'{}')}catch{attributes={raw:f.attributes}};onAdd({...f,attributes,cost:Number(f.cost||0),price:Number(f.price||0)});setF({product_id:'',sku:'',name:'',attributes:'{}',cost:'',price:'',barcode:'',status:'active'})}}/><ListCard title="Variants" items={items} render={x=><div><strong>{products.find(p=>p.id===x.product_id)?.name||x.product_id}</strong><div className="muted">{x.name} · {x.sku||'—'} · {x.price||0}</div></div>}/></section>
}

function Inventory({items,variants,onAdd}){
  const [f,setF]=useState({variant_id:'',on_hand:'0',reserved:'0',damaged:'0',returned:'0',location:'',reorder_point:'0',stock_status:'good'})
  return <section className="section grid grid-2"><FormCard title="Inventory" fields={f} setFields={setF} labels={{variant_id:'Variant ID',on_hand:'On Hand',reserved:'Reserved',damaged:'Damaged',returned:'Returned',location:'Location',reorder_point:'Reorder Point',stock_status:'Stock Status'}} selects={{stock_status:INVENTORY_STATUS.map(x=>[x,x])}} onSubmit={()=>{if(!f.variant_id)return;onAdd({...f,on_hand:Number(f.on_hand||0),reserved:Number(f.reserved||0),damaged:Number(f.damaged||0),returned:Number(f.returned||0),reorder_point:Number(f.reorder_point||0)});setF({variant_id:'',on_hand:'0',reserved:'0',damaged:'0',returned:'0',location:'',reorder_point:'0',stock_status:'good'})}}/><ListCard title="Inventory" items={items} render={x=>{const available=Math.max(Number(x.on_hand||0)-Number(x.reserved||0)-Number(x.damaged||0),0);return <div><div className="between"><strong>{variants.find(v=>v.id===x.variant_id)?.name||x.variant_id}</strong><span className={`status-badge ${['critical','out'].includes(x.stock_status)?'bad':'good'}`}>{x.stock_status}</span></div><div className="muted">On hand: {x.on_hand} · Reserved: {x.reserved} · Available: {available} · Returned: {x.returned}</div></div>}}/></section>
}

function Orders({items,customers,onAdd}){
  const [f,setF]=useState({order_number:'',customer_id:'',status:'pending',currency:'EGP',subtotal:'0',discount:'0',shipping:'0',tax:'0',total:'0',finance_transaction_id:'',campaign_id:'',notes:''})
  return <section className="section grid grid-2"><FormCard title="Order" fields={f} setFields={setF} labels={{order_number:'Order Number',customer_id:'Customer ID',status:'Status',currency:'Currency',subtotal:'Subtotal',discount:'Discount',shipping:'Shipping',tax:'Tax',total:'Total',finance_transaction_id:'Finance Transaction ID (optional)',campaign_id:'Campaign ID (optional)',notes:'Notes'}} selects={{status:ORDER_STATUS.map(x=>[x,x])}} onSubmit={()=>{if(!f.order_number)return;onAdd({...f,subtotal:Number(f.subtotal||0),discount:Number(f.discount||0),shipping:Number(f.shipping||0),tax:Number(f.tax||0),total:Number(f.total||0)});setF({order_number:'',customer_id:'',status:'pending',currency:'EGP',subtotal:'0',discount:'0',shipping:'0',tax:'0',total:'0',finance_transaction_id:'',campaign_id:'',notes:''})}}/><ListCard title="Orders" items={items} render={x=><div><div className="between"><strong>{x.order_number}</strong><span className="chip">{x.status}</span></div><div className="muted">{customers.find(c=>c.id===x.customer_id)?.name||'No customer'} · {x.currency} {x.total}</div></div>}/></section>
}

function Customers({items,onAdd}){const [f,setF]=useState({name:'',email:'',phone:'',type:'individual',status:'active',notes:''});return <section className="section grid grid-2"><FormCard title="Customer" fields={f} setFields={setF} labels={{name:'Name',email:'Email',phone:'Phone',type:'Type',status:'Status',notes:'Notes'}} selects={{type:['individual','business'].map(x=>[x,x]),status:['active','inactive','blocked'].map(x=>[x,x])}} onSubmit={()=>{if(!f.name)return;onAdd(f);setF({name:'',email:'',phone:'',type:'individual',status:'active',notes:''})}}/><ListCard title="Customers" items={items} render={x=><div><strong>{x.name}</strong><div className="muted">{x.type} · {x.email||x.phone||'—'} · {x.status}</div></div>}/></section>}

function Suppliers({items,onAdd}){const [f,setF]=useState({name:'',contact_name:'',email:'',phone:'',status:'active',notes:''});return <section className="section grid grid-2"><FormCard title="Supplier" fields={f} setFields={setF} labels={{name:'Name',contact_name:'Contact',email:'Email',phone:'Phone',status:'Status',notes:'Notes'}} selects={{status:['active','inactive','blocked'].map(x=>[x,x])}} onSubmit={()=>{if(!f.name)return;onAdd(f);setF({name:'',contact_name:'',email:'',phone:'',status:'active',notes:''})}}/><ListCard title="Suppliers" items={items} render={x=><div><strong>{x.name}</strong><div className="muted">{x.contact_name||'—'} · {x.email||x.phone||'—'} · {x.status}</div></div>}/></section>}

function Returns({items,orders,onAdd}){const [f,setF]=useState({order_id:'',status:'requested',reason:'',amount:'0',received_at:'',refunded_at:'',notes:''});return <section className="section grid grid-2"><FormCard title="Return" fields={f} setFields={setF} labels={{order_id:'Order ID',status:'Status',reason:'Reason',amount:'Amount',received_at:'Received At',refunded_at:'Refunded At',notes:'Notes'}} selects={{status:['requested','approved','received','rejected','refunded'].map(x=>[x,x])}} onSubmit={()=>{if(!f.order_id)return;onAdd({...f,amount:Number(f.amount||0)});setF({order_id:'',status:'requested',reason:'',amount:'0',received_at:'',refunded_at:'',notes:''})}}/><ListCard title="Returns" items={items} render={x=><div><div className="between"><strong>{orders.find(o=>o.id===x.order_id)?.order_number||x.order_id}</strong><span className="chip">{x.status}</span></div><div className="muted">{x.reason||'—'} · {x.amount}</div></div>}/></section>}

function Promotions({items,products,onAdd}){const [f,setF]=useState({name:'',code:'',type:'percentage',value:'0',starts_at:'',ends_at:'',status:'draft',product_id:'',min_order_value:'0'});return <section className="section grid grid-2"><FormCard title="Promotion" fields={f} setFields={setF} labels={{name:'Name',code:'Code',type:'Type',value:'Value',starts_at:'Starts',ends_at:'Ends',status:'Status',product_id:'Product ID',min_order_value:'Minimum Order'}} selects={{type:['percentage','fixed','free_shipping'].map(x=>[x,x]),status:['draft','scheduled','active','expired','paused'].map(x=>[x,x])}} onSubmit={()=>{if(!f.name)return;onAdd({...f,value:Number(f.value||0),min_order_value:Number(f.min_order_value||0)});setF({name:'',code:'',type:'percentage',value:'0',starts_at:'',ends_at:'',status:'draft',product_id:'',min_order_value:'0'})}}/><ListCard title="Promotions" items={items} render={x=><div><div className="between"><strong>{x.name}</strong><span className="chip">{x.status}</span></div><div className="muted">{x.code||'—'} · {x.type} {x.value}</div></div>}/></section>}

function Campaigns({items,products,onAdd}){const [f,setF]=useState({name:'',type:'product',status:'draft',starts_at:'',ends_at:'',budget:'0',product_id:'',notes:''});return <section className="section grid grid-2"><FormCard title="Campaign" fields={f} setFields={setF} labels={{name:'Name',type:'Type',status:'Status',starts_at:'Starts',ends_at:'Ends',budget:'Budget',product_id:'Product ID',notes:'Notes'}} selects={{type:['product','seasonal','discount','retention','launch','other'].map(x=>[x,x]),status:['draft','scheduled','active','paused','completed'].map(x=>[x,x])}} onSubmit={()=>{if(!f.name)return;onAdd({...f,budget:Number(f.budget||0)});setF({name:'',type:'product',status:'draft',starts_at:'',ends_at:'',budget:'0',product_id:'',notes:''})}}/><ListCard title="Campaigns" items={items} render={x=><div><div className="between"><strong>{x.name}</strong><span className="chip">{x.status}</span></div><div className="muted">{x.type} · Budget {x.budget||0}</div></div>}/></section>}

function FormCard({title,fields,setFields,labels,selects={},onSubmit}){return <div className="card"><h2>{title}</h2><form onSubmit={e=>{e.preventDefault();onSubmit()}}><div className="form-stack">{Object.keys(fields).map(k=>selects[k]?<label key={k} className="muted">{labels[k]||k}<select value={fields[k]} onChange={e=>setFields({...fields,[k]:e.target.value})}>{selects[k].map(o=>Array.isArray(o)?<option key={o[0]} value={o[0]}>{o[1]}</option>:<option key={o} value={o}>{o}</option>)}</select></label>:<label key={k} className="muted">{labels[k]||k}<textarea rows={['description','notes','assets','reason'].includes(k)?3:1} value={fields[k]??''} onChange={e=>setFields({...fields,[k]:e.target.value})}/></label>)}</div><button className="primary" style={{marginTop:10}}>حفظ</button></form></div>}
function ListCard({title,items,render}){return <div className="card"><div className="section-head"><h2>{title}</h2><span className="muted">{items.length}</span></div>{items.slice(0,50).map((x,i)=><div className="list-row" key={x.id||i}>{render(x)}</div>)}{!items.length&&<div className="muted">لا توجد سجلات بعد.</div>}</div>}
