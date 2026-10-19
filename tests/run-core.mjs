// Run with Node.js 18+: node tests/run-core.mjs
// Executes logic suites without a browser; this does not certify visual layout.
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { Blob } from 'node:buffer';
const root = new URL('../', import.meta.url);
const source = ['data','story','courses','journeys','activities','engine'];
const suites = {};
let assets;
for (const name of ['engine','story','courses','activities','growth','intro','bond','pacing']) {
  const output = { textContent: '' }, saved = new Map();
  const context = { console, Blob, document: { getElementById: () => output, body: { dataset: {} } }, localStorage: { getItem: k => saved.get(k) ?? null, setItem: (k,v) => saved.set(k,v), removeItem: k => saved.delete(k) } };
  context.window = context;
  vm.createContext(context);
  for (const file of source) vm.runInContext(await fs.readFile(new URL(`src/${file}.js`,root),'utf8'),context,{filename:file+'.js'});
  vm.runInContext(await fs.readFile(new URL(`tests/${name}.test.js`,root),'utf8'),context,{filename:name+'.test.js'});
  suites[name] = output.textContent;
  assets = context.LunaData.assetPaths;
}
const missing=[];
for (const asset of assets) { try { await fs.access(new URL(asset,root)); } catch { missing.push(asset); } }
for (const file of (await fs.readdir(new URL('src/',root))).filter(f=>f.endsWith('.js'))) new vm.Script(await fs.readFile(new URL(`src/${file}`,root),'utf8'),{filename:file});
const passed=Object.values(suites).every(s=>!s.includes('FAIL'))&&!missing.length;
const report={date:'2026-10-11',runtime:'Node.js VM; DOM output stub; no browser rendering',passed,suites,assetPaths:assets.length,missing,syntax:'passed',browserVisualQA:'not run: CUA Safari cgWindowNotFound'};
await fs.writeFile(new URL('qa/core-results-2026-10-11.json',root),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed,suites:Object.fromEntries(Object.entries(suites).map(([k,v])=>[k,v.split('\n').find(l=>/\d+\/\d+ passed/.test(l))])),assetPaths:assets.length,missing}));
if (!passed) throw Error('Core regression failed; see qa/core-results-2026-10-11.json');
export default report;
