import fs from 'fs'
import crypto from 'crypto'

function assert(c,msg){if(!c) throw new Error(msg)}

const registryText=fs.readFileSync('src/lib/schemaRegistry.js','utf8')
const objectText=registryText.replace(/^export const UOS_SCHEMA\s*=\s*/, '').replace(/;\s*$/,'')
const registry=Function(`return (${objectText})`)()
const tables=Object.keys(registry.tables)
assert(tables.length===87,`Expected 87 UOS tables, got ${tables.length}`)
const mutable=tables.filter(t=>!registry.tables[t].readOnly)
assert(mutable.every(t=>registry.tables[t].columns.some(c=>c.name==='id')),'Every mutable table must expose id')
assert(mutable.every(t=>registry.tables[t].columns.some(c=>c.name==='workspace_id') || !registry.tables[t].workspaceScoped),'Workspace-scoped tables must expose workspace_id')

const core=fs.readFileSync('src/lib/core.js','utf8')
for(const fn of ['listTableRecords','createTableRecord','updateTableRecord','deleteTableRecord']) assert(core.includes(`export async function ${fn}`),`Missing ${fn}`)
const manager=fs.readFileSync('src/pages/DataManager.jsx','utf8')
for(const token of ['createTableRecord','updateTableRecord','deleteTableRecord','listTableRecords','UOS_SCHEMA']) assert(manager.includes(token),`DataManager missing ${token}`)

const original=fs.readFileSync('/mnt/data/orig_cos/ContentOS_guarded/index.html')
const current=fs.readFileSync('public/contentos/index.html')
assert(crypto.createHash('sha256').update(original).digest('hex')===crypto.createHash('sha256').update(current).digest('hex'),'ContentOS hash mismatch')

const protectedTables=tables.filter(t=>registry.tables[t].readOnly)
const report={tables:tables.length,mutableTables:mutable.length,readOnlyTables:protectedTables.length,crudContract:'PASS',contentOSByteForByte:'PASS',fullRuntime:'NOT_VERIFIED',liveSupabase:'NOT_VERIFIED'}
fs.writeFileSync('docs/PHASE_21_VALIDATION_OUTPUT.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
