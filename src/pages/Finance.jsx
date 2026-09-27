import { useEffect, useMemo, useState } from 'react'
import { createEntity, listEntities, logRecurringPayment } from '../lib/core'
import { useWorkspace } from '../lib/workspace'

const TYPES=[
  ['income','دخل'],['expense','مصروف'],['transfer','تحويل'],['refund','استرداد'],
  ['adjustment','تسوية'],['debt_payment','سداد دين'],['debt_received','تحصيل دين'],
]
const ACCOUNT_TYPES=[['cash','نقدي'],['bank','بنك'],['card','بطاقة'],['wallet','محفظة'],['savings','توفير'],['other','أخرى']]
const DEBT_TYPES=[['owed_by_me','عليّ'],['owed_to_me','لي']]
const FREQUENCIES=[['weekly','أسبوعي'],['monthly','شهري'],['quarterly','ربع سنوي'],['yearly','سنوي']]

export default function Finance(){
  const {workspace}=useWorkspace()
  const [tab,setTab]=useState('overview')
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [accounts,setAccounts]=useState([])
  const [categories,setCategories]=useState([])
  const [transactions,setTransactions]=useState([])
  const [budgets,setBudgets]=useState([])
  const [recurring,setRecurring]=useState([])
  const [debts,setDebts]=useState([])
  const [savings,setSavings]=useState([])
  const [projects,setProjects]=useState([])
  const [accountForm,setAccountForm]=useState({name:'',type:'cash',currency:'EGP',opening_balance:'0'})
  const [categoryForm,setCategoryForm]=useState({name:'',kind:'expense'})
  const [txForm,setTxForm]=useState({amount:'',type:'expense',description:'',account_id:'',category_id:'',project_id:'',occurred_at:new Date().toISOString().slice(0,16)})
  const [budgetForm,setBudgetForm]=useState({category_id:'',project_id:'',amount:'',period_start:firstOfMonth(),period_end:lastOfMonth()})
  const [recurringForm,setRecurringForm]=useState({name:'',amount:'',type:'expense',frequency:'monthly',next_due:'',account_id:'',category_id:''})
  const [debtForm,setDebtForm]=useState({name:'',direction:'owed_by_me',principal:'',remaining:'',due_date:'',counterparty:''})
  const [savingForm,setSavingForm]=useState({name:'',target_amount:'',current_amount:'0',due_date:''})

  async function load(){
    if(!workspace)return
    setLoading(true); setError('')
    try{
      const [a,c,t,b,r,d,s,p]=await Promise.all([
        listEntities('uos_fin_accounts',workspace.id,'created_at'),
        listEntities('uos_fin_categories',workspace.id,'created_at'),
        listEntities('uos_fin_transactions',workspace.id,'occurred_at'),
        listEntities('uos_fin_budgets',workspace.id,'period_start'),
        listEntities('uos_fin_recurring',workspace.id,'next_due'),
        listEntities('uos_fin_debts',workspace.id,'due_date'),
        listEntities('uos_fin_savings_goals',workspace.id,'due_date'),
        listEntities('uos_projects',workspace.id,'created_at'),
      ])
      setAccounts(a); setCategories(c); setTransactions(t); setBudgets(b); setRecurring(r); setDebts(d); setSavings(s); setProjects(p)
    }catch(e){ setError(e.message||'تعذر تحميل البيانات المالية') }
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[workspace?.id])

  const accountBalances=useMemo(()=>{
    const m=Object.fromEntries(accounts.map(a=>[a.id,Number(a.opening_balance||0)]))
    for(const r of transactions){
      const amount=Number(r.amount||0)
      if(r.type==='income'||r.type==='refund'||r.type==='debt_received'){
        if(r.to_account_id && m[r.to_account_id]!==undefined)m[r.to_account_id]+=amount
        else if(r.from_account_id && m[r.from_account_id]!==undefined)m[r.from_account_id]+=amount
      }else if(r.type==='expense'||r.type==='debt_payment'){
        if(r.from_account_id && m[r.from_account_id]!==undefined)m[r.from_account_id]-=amount
      }else if(r.type==='transfer'){
        if(r.from_account_id && m[r.from_account_id]!==undefined)m[r.from_account_id]-=amount
        if(r.to_account_id && m[r.to_account_id]!==undefined)m[r.to_account_id]+=amount
      }else if(r.type==='adjustment' && r.from_account_id && m[r.from_account_id]!==undefined){m[r.from_account_id]+=amount}
    }
    return m
  },[accounts,transactions])
  const totals=useMemo(()=>transactions.reduce((a,r)=>{
    const amount=Number(r.amount||0)
    if(r.type==='income'||r.type==='debt_received'||r.type==='refund')a.income+=amount
    else if(r.type==='expense'||r.type==='debt_payment')a.expense+=amount
    else if(r.type==='transfer')a.transfer+=amount
    return a
  },{income:0,expense:0,transfer:0}),[transactions])
  const netWorth=useMemo(()=>Object.values(accountBalances).reduce((a,v)=>a+v,0),[accountBalances])
  const openDebts=debts.filter(d=>d.status!=='closed')
  const savingsProgress=savings.reduce((n,s)=>n+Math.min(Number(s.current_amount||0),Number(s.target_amount||0)),0)
  const currentMonthKey=new Date().toISOString().slice(0,7)
  const currentMonthSpend=transactions.filter(t=>String(t.occurred_at||'').slice(0,7)===currentMonthKey && ['expense','debt_payment'].includes(t.type)).reduce((a,t)=>a+Number(t.amount||0),0)

  async function logPayment(recurringItem){
    try{setError(''); await logRecurringPayment(recurringItem.id, `${recurringItem.id}:${recurringItem.next_due||new Date().toISOString().slice(0,10)}`); await load()}catch(e){setError(e.message||'تعذر تسجيل الدفعة')}
  }
  async function createRecord(table,data){
    try{setError(''); await createEntity(table,{workspace_id:workspace.id,...data}); await load()}catch(e){setError(e.message||'تعذر حفظ السجل')}
  }
  async function submitAccount(e){e.preventDefault(); if(!accountForm.name)return; await createRecord('uos_fin_accounts',{...accountForm,opening_balance:Number(accountForm.opening_balance||0),active:true}); setAccountForm({name:'',type:'cash',currency:workspace?.base_currency||'EGP',opening_balance:'0'})}
  async function submitCategory(e){e.preventDefault(); if(!categoryForm.name)return; await createRecord('uos_fin_categories',{...categoryForm,active:true}); setCategoryForm({name:'',kind:'expense'})}
  async function submitTx(e){e.preventDefault(); if(!txForm.amount)return; const amount=Number(txForm.amount); const base={amount,type:txForm.type,description:txForm.description||null,occurred_at:new Date(txForm.occurred_at||Date.now()).toISOString(),category_id:txForm.category_id||null,project_id:txForm.project_id||null,source_entity_type:'manual_entry',source_entity_id:crypto.randomUUID(),external_id:crypto.randomUUID(),sync_status:'manual'}; if(txForm.type==='transfer'){base.from_account_id=txForm.account_id||null; base.to_account_id=null}else if(['income','refund','debt_received'].includes(txForm.type)){base.to_account_id=txForm.account_id||null}else if(['expense','debt_payment','adjustment'].includes(txForm.type)){base.from_account_id=txForm.account_id||null} await createRecord('uos_fin_transactions',base); setTxForm({amount:'',type:'expense',description:'',account_id:'',category_id:'',project_id:'',occurred_at:new Date().toISOString().slice(0,16)}) }
  async function submitBudget(e){e.preventDefault(); if(!budgetForm.amount)return; await createRecord('uos_fin_budgets',{...budgetForm,amount:Number(budgetForm.amount),category_id:budgetForm.category_id||null,project_id:budgetForm.project_id||null}); setBudgetForm({category_id:'',project_id:'',amount:'',period_start:firstOfMonth(),period_end:lastOfMonth()})}
  async function submitRecurring(e){e.preventDefault(); if(!recurringForm.name||!recurringForm.amount)return; await createRecord('uos_fin_recurring',{...recurringForm,amount:Number(recurringForm.amount),account_id:recurringForm.account_id||null,category_id:recurringForm.category_id||null,active:true}); setRecurringForm({name:'',amount:'',type:'expense',frequency:'monthly',next_due:'',account_id:'',category_id:''})}
  async function submitDebt(e){e.preventDefault(); if(!debtForm.name||!debtForm.principal)return; await createRecord('uos_fin_debts',{...debtForm,principal:Number(debtForm.principal),remaining:Number(debtForm.remaining||debtForm.principal),status:'open'}); setDebtForm({name:'',direction:'owed_by_me',principal:'',remaining:'',due_date:'',counterparty:''})}
  async function submitSaving(e){e.preventDefault(); if(!savingForm.name||!savingForm.target_amount)return; await createRecord('uos_fin_savings_goals',{...savingForm,target_amount:Number(savingForm.target_amount),current_amount:Number(savingForm.current_amount||0),status:'active'}); setSavingForm({name:'',target_amount:'',current_amount:'0',due_date:''})}

  const tabs=[['overview','نظرة عامة'],['ledger','Ledger'],['accounts','الحسابات'],['budgets','الميزانيات'],['recurring','المتكرر'],['debts','الديون'],['savings','التوفير'],['categories','التصنيفات']]
  return <div>
    <header className="page-head"><div><div className="eyebrow">FINANCE OS · PHASE 4</div><h1>المالية</h1><p className="muted">Ledger واحد كمصدر للحركات المالية، مع ربط المشاريع والميزانيات والديون وأهداف التوفير.</p></div><div className="actions"><button className="primary" onClick={()=>setTab('ledger')}>+ حركة مالية</button></div></header>
    {error&&<div className="error" style={{marginBottom:14}}>{error}</div>}
    <div className="chip-picker finance-tabs">{tabs.map(([k,l])=><button type="button" key={k} className={`chip selectable ${tab===k?'selected':''}`} onClick={()=>setTab(k)}>{l}</button>)}</div>
    {loading?<div className="card section">جاري تحميل Finance OS…</div>:<>
      {tab==='overview'&&<Overview totals={totals} netWorth={netWorth} balances={accountBalances} accounts={accounts} debts={openDebts} savings={savings} savingsProgress={savingsProgress} currentMonthSpend={currentMonthSpend} budgets={budgets}/>} 
      {tab==='ledger'&&<LedgerForm txForm={txForm} setTxForm={setTxForm} accounts={accounts} categories={categories} projects={projects} onSubmit={submitTx} transactions={transactions}/>} 
      {tab==='accounts'&&<AccountsForm form={accountForm} setForm={setAccountForm} accounts={accounts} balances={accountBalances} onSubmit={submitAccount}/>} 
      {tab==='budgets'&&<BudgetsForm form={budgetForm} setForm={setBudgetForm} categories={categories} projects={projects} budgets={budgets} transactions={transactions} onSubmit={submitBudget}/>} 
      {tab==='recurring'&&<RecurringForm form={recurringForm} setForm={setRecurringForm} accounts={accounts} categories={categories} recurring={recurring} onSubmit={submitRecurring} onLogPayment={logPayment}/>} 
      {tab==='debts'&&<DebtsForm form={debtForm} setForm={setDebtForm} debts={debts} onSubmit={submitDebt}/>} 
      {tab==='savings'&&<SavingsForm form={savingForm} setForm={setSavingForm} savings={savings} onSubmit={submitSaving}/>} 
      {tab==='categories'&&<CategoriesForm form={categoryForm} setForm={setCategoryForm} categories={categories} onSubmit={submitCategory}/>} 
    </>}
  </div>
}

function Overview({totals,netWorth,accounts,balances,debts,savings,savingsProgress,currentMonthSpend,budgets}){
 const budgetTotal=budgets.filter(b=>new Date(b.period_start)<=new Date()&&new Date(b.period_end)>=new Date()).reduce((a,b)=>a+Number(b.amount||0),0)
 return <>
   <section className="grid grid-4">
    <Metric label="صافي الحسابات" value={money(netWorth)} />
    <Metric label="الدخل" value={money(totals.income)} />
    <Metric label="المصروفات" value={money(totals.expense)} alert={totals.expense>totals.income}/>
    <Metric label="مصروف الشهر" value={money(currentMonthSpend)} alert={budgetTotal>0&&currentMonthSpend>budgetTotal}/>
   </section>
   <section className="section grid grid-2">
    <div className="card"><div className="section-head"><h2>الحسابات</h2><span className="muted">{accounts.length} حساب</span></div>{accounts.map(a=><div className="list-row between" key={a.id}><span>{a.name}<span className="muted"> · {a.currency}</span></span><strong>{money(balances[a.id]||0)}</strong></div>)}{!accounts.length&&<div className="muted">لم يتم إنشاء حسابات بعد.</div>}</div>
    <div className="card"><div className="section-head"><h2>الانتباه</h2></div><div className="list-row between"><span>ديون مفتوحة</span><strong>{debts.length}</strong></div><div className="list-row between"><span>أهداف توفير</span><strong>{savings.length}</strong></div><div className="list-row between"><span>ميزانيات نشطة</span><strong>{budgets.length}</strong></div><div className="list-row between"><span>إجمالي التوفير الحالي</span><strong>{money(savingsProgress)}</strong></div></div>
   </section>
 </>
}
function LedgerForm({txForm,setTxForm,accounts,categories,projects,onSubmit,transactions}){return <section className="section">
 <div className="card"><div className="section-head"><h2>تسجيل حركة</h2><span className="muted">Project Finance يستخدم نفس الـLedger</span></div><form onSubmit={onSubmit}>
  <div className="form-grid"><input type="number" min="0" step="0.01" placeholder="المبلغ" value={txForm.amount} onChange={e=>setTxForm({...txForm,amount:e.target.value})} required/><select value={txForm.type} onChange={e=>setTxForm({...txForm,type:e.target.value})}>{TYPES.map(([k,l])=><option value={k} key={k}>{l}</option>)}</select><select value={txForm.account_id} onChange={e=>setTxForm({...txForm,account_id:e.target.value})}><option value="">الحساب</option>{accounts.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select></div>
  <div className="form-grid" style={{marginTop:8}}><select value={txForm.category_id} onChange={e=>setTxForm({...txForm,category_id:e.target.value})}><option value="">التصنيف</option>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select><select value={txForm.project_id} onChange={e=>setTxForm({...txForm,project_id:e.target.value})}><option value="">المشروع</option>{projects.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select><input type="datetime-local" value={txForm.occurred_at} onChange={e=>setTxForm({...txForm,occurred_at:e.target.value})}/></div>
  <input style={{width:'100%',marginTop:8,padding:10,border:'1px solid var(--border)',borderRadius:9}} placeholder="الوصف" value={txForm.description} onChange={e=>setTxForm({...txForm,description:e.target.value})}/><button className="primary" style={{marginTop:8}}>تسجيل الحركة</button>
 </form></div>
 <div className="card" style={{marginTop:14}}><div className="section-head"><h2>آخر الحركات</h2><span className="muted">{transactions.length}</span></div>{transactions.slice(0,30).map(r=><div className="list-row between" key={r.id}><span>{r.description||labelType(r.type)}<small className="muted"> · {new Date(r.occurred_at).toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'})}</small></span><strong className={positive(r.type)?'income':'expense'}>{money(r.amount)}</strong></div>)}{!transactions.length&&<div className="muted">لا توجد حركات.</div>}</div>
 </section>}
function AccountsForm({form,setForm,accounts,balances,onSubmit}){return <section className="section grid grid-2"><div className="card"><h2>حساب جديد</h2><form onSubmit={onSubmit}><div className="form-grid"><input placeholder="اسم الحساب" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{ACCOUNT_TYPES.map(([k,l])=><option value={k} key={k}>{l}</option>)}</select><input value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})} placeholder="EGP"/></div><input type="number" step="0.01" style={{width:'100%',marginTop:8,padding:10,border:'1px solid var(--border)',borderRadius:9}} placeholder="الرصيد الافتتاحي" value={form.opening_balance} onChange={e=>setForm({...form,opening_balance:e.target.value})}/><button className="primary" style={{marginTop:8}}>إضافة الحساب</button></form></div><div className="card"><h2>الحسابات الحالية</h2>{accounts.map(a=><div className="list-row between" key={a.id}><span><strong>{a.name}</strong><small className="muted"> · {a.type} · {a.currency}</small></span><strong>{money(balances[a.id]||0)}</strong></div>)}{!accounts.length&&<div className="muted">لا توجد حسابات.</div>}</div></section>}
function BudgetsForm({form,setForm,categories,projects,budgets,transactions,onSubmit}){const spent=(b)=>transactions.filter(t=>t.category_id===b.category_id&&String(t.occurred_at||'').slice(0,10)>=b.period_start&&String(t.occurred_at||'').slice(0,10)<=b.period_end&&['expense','debt_payment'].includes(t.type)).reduce((a,t)=>a+Number(t.amount||0),0); return <section className="section grid grid-2"><div className="card"><h2>ميزانية</h2><form onSubmit={onSubmit}><div className="form-grid"><select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">كل التصنيفات</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={form.project_id} onChange={e=>setForm({...form,project_id:e.target.value})}><option value="">كل المشاريع</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><input type="number" step="0.01" placeholder="المبلغ" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></div><div className="form-grid" style={{marginTop:8}}><input type="date" value={form.period_start} onChange={e=>setForm({...form,period_start:e.target.value})}/><input type="date" value={form.period_end} onChange={e=>setForm({...form,period_end:e.target.value})}/><button className="primary">حفظ</button></div></form></div><div className="card"><h2>الميزانيات</h2>{budgets.map(b=>{const use=spent(b);const pct=b.amount?Math.min(100,Math.round(use/b.amount*100)):0;return <div className="list-row" key={b.id}><div className="between"><span>{categories.find(c=>c.id===b.category_id)?.name||'كل التصنيفات'}</span><strong>{money(use)} / {money(b.amount)}</strong></div><div className="budget-bar"><span style={{width:`${pct}%`}}/></div></div>})}{!budgets.length&&<div className="muted">لا توجد ميزانيات.</div>}</div></section>}
function RecurringForm({form,setForm,accounts,categories,recurring,onSubmit,onLogPayment}){return <section className="section grid grid-2"><div className="card"><h2>حركة متكررة</h2><form onSubmit={onSubmit}><div className="form-grid"><input placeholder="الاسم" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><input type="number" step="0.01" placeholder="المبلغ" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="expense">مصروف</option><option value="income">دخل</option></select></div><div className="form-grid" style={{marginTop:8}}><select value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})}>{FREQUENCIES.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select><input type="date" value={form.next_due} onChange={e=>setForm({...form,next_due:e.target.value})}/><select value={form.account_id} onChange={e=>setForm({...form,account_id:e.target.value})}><option value="">الحساب</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div><select style={{width:'100%',marginTop:8,padding:10,border:'1px solid var(--border)',borderRadius:9}} value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">التصنيف</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><button className="primary" style={{marginTop:8}}>حفظ</button></form></div><div className="card"><h2>المتكرر</h2>{recurring.map(r=><div className="list-row between" key={r.id}><span>{r.name}<small className="muted"> · {r.frequency} · {r.next_due||'بدون تاريخ'}{r.last_payment?` · Last ${r.last_payment}`:''}</small></span><span className="actions"><strong>{money(r.amount)}</strong><button className="secondary" type="button" onClick={()=>onLogPayment(r)}>Log Payment</button></span></div>)}{!recurring.length&&<div className="muted">لا توجد حركات متكررة.</div>}</div></section>}
function DebtsForm({form,setForm,debts,onSubmit}){return <section className="section grid grid-2"><div className="card"><h2>دين جديد</h2><form onSubmit={onSubmit}><div className="form-grid"><input placeholder="اسم الدين" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><select value={form.direction} onChange={e=>setForm({...form,direction:e.target.value})}>{DEBT_TYPES.map(([k,l])=><option value={k} key={k}>{l}</option>)}</select><input placeholder="الطرف" value={form.counterparty} onChange={e=>setForm({...form,counterparty:e.target.value})}/></div><div className="form-grid" style={{marginTop:8}}><input type="number" step="0.01" placeholder="الأصل" value={form.principal} onChange={e=>setForm({...form,principal:e.target.value})} required/><input type="number" step="0.01" placeholder="المتبقي" value={form.remaining} onChange={e=>setForm({...form,remaining:e.target.value})}/><input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/></div><button className="primary" style={{marginTop:8}}>حفظ</button></form></div><div className="card"><h2>الديون</h2>{debts.map(d=><div className="list-row between" key={d.id}><span>{d.name}<small className="muted"> · {d.direction==='owed_by_me'?'عليّ':'لي'} · {d.counterparty||'—'}</small></span><strong>{money(d.remaining)}</strong></div>)}{!debts.length&&<div className="muted">لا توجد ديون.</div>}</div></section>}
function SavingsForm({form,setForm,savings,onSubmit}){return <section className="section grid grid-2"><div className="card"><h2>هدف توفير</h2><form onSubmit={onSubmit}><div className="form-grid"><input placeholder="اسم الهدف" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><input type="number" step="0.01" placeholder="المستهدف" value={form.target_amount} onChange={e=>setForm({...form,target_amount:e.target.value})} required/><input type="number" step="0.01" placeholder="الحالي" value={form.current_amount} onChange={e=>setForm({...form,current_amount:e.target.value})}/></div><input type="date" style={{marginTop:8,width:'100%',padding:10,border:'1px solid var(--border)',borderRadius:9}} value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/><button className="primary" style={{marginTop:8}}>حفظ</button></form></div><div className="card"><h2>الأهداف</h2>{savings.map(s=>{const pct=s.target_amount?Math.min(100,Math.round(Number(s.current_amount)/Number(s.target_amount)*100)):0;return <div className="list-row" key={s.id}><div className="between"><span>{s.name}</span><strong>{money(s.current_amount)} / {money(s.target_amount)}</strong></div><div className="budget-bar"><span style={{width:`${pct}%`}}/></div></div>})}{!savings.length&&<div className="muted">لا توجد أهداف توفير.</div>}</div></section>}
function CategoriesForm({form,setForm,categories,onSubmit}){return <section className="section grid grid-2"><div className="card"><h2>تصنيف مالي</h2><form onSubmit={onSubmit}><div className="form-grid" style={{gridTemplateColumns:'2fr 1fr auto'}}><input placeholder="اسم التصنيف" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><select value={form.kind} onChange={e=>setForm({...form,kind:e.target.value})}><option value="expense">مصروف</option><option value="income">دخل</option><option value="both">الاثنان</option></select><button className="primary">إضافة</button></div></form></div><div className="card"><h2>التصنيفات</h2>{categories.map(c=><div className="list-row between" key={c.id}><span>{c.name}</span><span className="chip">{c.kind}</span></div>)}{!categories.length&&<div className="muted">لا توجد تصنيفات.</div>}</div></section>}
function Metric({label,value,alert}){return <div className={`metric ${alert?'alert':''}`}><div className="muted">{label}</div><strong>{value}</strong></div>}
function money(v){return `${Number(v||0).toLocaleString('ar-EG',{maximumFractionDigits:2})} EGP`}
function labelType(t){return TYPES.find(x=>x[0]===t)?.[1]||t}
function positive(t){return ['income','refund','debt_received'].includes(t)}
function firstOfMonth(){const d=new Date(); return new Date(d.getFullYear(),d.getMonth(),1).toISOString().slice(0,10)}
function lastOfMonth(){const d=new Date(); return new Date(d.getFullYear(),d.getMonth()+1,0).toISOString().slice(0,10)}
