import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import ts from '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js';

const root = process.cwd();
const failures = [];
const warnings = [];
const ok = [];

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist'].includes(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const sourceFiles = walk(path.join(root, 'src')).filter(f => /\.(js|jsx|mjs|cjs)$/.test(f));
for (const file of sourceFiles) {
  const code = fs.readFileSync(file, 'utf8');
  const res = ts.transpileModule(code, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
    reportDiagnostics: true,
    fileName: file,
  });
  if (res.diagnostics?.length) {
    failures.push(`${path.relative(root, file)}: ${res.diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, ' ')).join('; ')}`);
  }
}
ok.push(`Syntax/transpile: ${sourceFiles.length} JS/JSX files parsed`);

const localExts = ['.js', '.jsx', '.mjs', '.cjs'];
for (const file of sourceFiles) {
  const code = fs.readFileSync(file, 'utf8');
  const re = /(?:import\s+(?:[^'";]+?\s+from\s+)?|export\s+[^'";]+?\s+from\s+)['"](\.[^'"]+)['"]/g;
  let m;
  while ((m = re.exec(code))) {
    const base = path.resolve(path.dirname(file), m[1]);
    const candidates = [base, ...localExts.map(e => base + e), ...localExts.map(e => path.join(base, `index${e}`))];
    if (!candidates.some(fs.existsSync)) failures.push(`Missing local import: ${path.relative(root, file)} -> ${m[1]}`);
  }
}
ok.push('Local relative imports resolved');

const main = fs.readFileSync(path.join(root, 'src/main.jsx'), 'utf8');
const importedPages = [...main.matchAll(/import\s+(\w+)\s+from\s+'(\.\/pages\/[^']+)'/g)];
for (const [, , spec] of importedPages) {
  const base = path.resolve(root, 'src', spec.replace(/^\.\//, ''));
  if (![base + '.jsx', base + '.js', base].some(fs.existsSync)) failures.push(`Missing page import: ${spec}`);
}
ok.push(`Routes/imports inspected: ${importedPages.length} page imports`);

const sqlDir = path.join(root, 'sql');
const migrations = fs.readdirSync(sqlDir).filter(f => /^\d{3}_.+\.sql$/.test(f)).sort();
const nums = migrations.map(f => Number(f.slice(0, 3)));
for (let n = 10; n <= 22; n++) if (!nums.includes(n)) failures.push(`Missing migration ${String(n).padStart(3, '0')}`);
for (let i = 1; i < nums.length; i++) if (nums[i] === nums[i - 1]) failures.push(`Duplicate migration number ${nums[i]}`);
ok.push(`Migration chain: ${migrations.length} numbered SQL migrations`);

const sqlAll = migrations.map(f => fs.readFileSync(path.join(sqlDir, f), 'utf8')).join('\n');
const created = new Set([...sqlAll.matchAll(/create\s+table(?:\s+if\s+not\s+exists)?\s+(uos_[A-Za-z0-9_]+)/gi)].map(m => m[1].toLowerCase()));
const referenced = new Set([...sqlAll.matchAll(/references\s+(uos_[A-Za-z0-9_]+)/gi)].map(m => m[1].toLowerCase()));
for (const t of referenced) if (!created.has(t)) failures.push(`Missing FK target table: ${t}`);
ok.push(`Cross-module table references: ${referenced.size} checked`);

const duplicateContentTables = [...sqlAll.matchAll(/create\s+table(?:\s+if\s+not\s+exists)?\s+(content_[A-Za-z0-9_]+)/gi)].map(m => m[1]);
if (duplicateContentTables.length) failures.push(`Duplicate ContentOS tables found: ${[...new Set(duplicateContentTables)].join(', ')}`);
ok.push('No active content_* table definitions in Unified OS SQL');

const named = new Set([...sqlAll.matchAll(/'((?:uos)_[a-z0-9_]+)'/gi)].map(m => m[1].toLowerCase()));
for (const t of created) {
  const direct = new RegExp(`alter\\s+table[^;]*\\b${t}\\b[^;]*enable\\s+row\\s+level\\s+security`, 'is').test(sqlAll);
  if (!direct && !named.has(t)) failures.push(`No static RLS coverage marker: ${t}`);
}
ok.push(`RLS coverage markers: ${created.size} UOS tables`);

const originalZip = '/mnt/data/ContentOS_fixed_cross_browser.zip';
if (fs.existsSync(originalZip)) {
  const tmp = '/tmp/contentos-original-phase20';
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  execFileSync('unzip', ['-q', originalZip, '-d', tmp]);
  const originalIndex = walk(tmp).find(f => path.basename(f) === 'index.html' && f.includes('contentos'));
  if (!originalIndex) warnings.push('Original ContentOS index.html not located by static extractor');
  else {
    const h1 = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'public/contentos/index.html'))).digest('hex');
    const h2 = crypto.createHash('sha256').update(fs.readFileSync(originalIndex)).digest('hex');
    if (h1 !== h2) failures.push(`ContentOS hash mismatch: ${h1} != ${h2}`);
    else ok.push(`ContentOS SHA-256: ${h1}`);
  }
}

const requiredRoutes = ['/', '/projects', '/finance', '/personal', '/contentos', '/contentos/configuration', '/contentos/analytics', '/contentos/intelligence', '/product', '/commerce', '/marketplace', '/knowledge', '/learning', '/habits', '/fitness', '/home', '/intelligence', '/system/security', '/system/recovery'];
for (const route of requiredRoutes) if (!main.includes(`path="${route}"`)) failures.push(`Required route missing: ${route}`);
ok.push(`Required route matrix: ${requiredRoutes.length} routes`);

const state = fs.readFileSync(path.join(root, 'docs/CURRENT_STATE.md'), 'utf8');
if (!/Phase 14 intentionally skipped/i.test(state)) failures.push('Phase 14 skip is not recorded in CURRENT_STATE.md');
else ok.push('Phase 14 skip recorded');

console.log(JSON.stringify({ ok, warnings, failures }, null, 2));
if (failures.length) process.exit(2);
