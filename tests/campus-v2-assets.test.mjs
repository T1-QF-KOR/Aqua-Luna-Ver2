// Check the actual entrypoint graph and every background/portrait used by it.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const index = await fs.readFile(new URL('index.html', root), 'utf8');
const campus = await fs.readFile(new URL('campus.html', root), 'utf8');
assert.equal(index, campus, 'Both supported entrypoints must load the same build');
const paths = new Set();
for (const match of index.matchAll(/(?:src|href)="([^"]+)"/g)) paths.add(new URL(match[1], root));
const scripts = [...index.matchAll(/<script defer src="([^"]+)">/g)].map(m => m[1]);
assert.deepEqual(scripts.map(s => s.split('/').at(-1)), ['world.js', 'encounters.js', 'wardrobe.js', 'radioEpisodes.js', 'radio.js', 'relationships.js', 'romance.js', 'economy.js', 'social.js', 'dialogue.js', 'dialogue-compat.js', 'messages.js', 'composition.js', 'dateActivities.js', 'outings.js', 'peopleEvents.js', 'smallEvents.js', 'state.js', 'scenes.js', 'semester.js', 'school.js', 'summer.js', 'autumn.js', 'winter.js', 'holidays.js', 'endings.js', 'audio.js', 'game.js']);
assert.ok(scripts.every(s => s.startsWith('src/campus-v2/')));
const cssURL = new URL('src/campus-v2/game.css', root), css = await fs.readFile(cssURL, 'utf8');
for (const match of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)) paths.add(new URL(match[1], cssURL));
const source = await fs.readFile(new URL('src/campus-v2/game.js', root), 'utf8');
const mapSource = source.match(/const bg = (\{[\s\S]*?\});/)[1];
const backgrounds = vm.runInNewContext(`(${mapSource})`);
for (const value of Object.values(backgrounds)) paths.add(new URL(`assets/environment/${value}`, root));
const context = { structuredClone }; context.window = context; vm.createContext(context);
for (const script of scripts.filter(s => !s.endsWith('/game.js'))) vm.runInContext(await fs.readFile(new URL(script, root), 'utf8'), context);
for (const file of Object.values(context.AquaAudio.tracks)) paths.add(new URL(file, root));
paths.add(new URL('assets/audio/CREDITS.md', root));
for (const outfits of Object.values(context.AquaWardrobe.catalog)) for (const file of Object.values(outfits)) paths.add(new URL(`assets/heroines/${file}`, root));
for (const [id, scene] of Object.entries(context.AQUA_SCENES)) assert.ok(backgrounds[scene.background], `Unknown background in ${id}`);
for (const person of Object.keys(context.AquaWorld.people)) for (const destination of context.AquaSocial.destinations) for (let variant = 0; variant < 4; variant++) {
  const data = context.AquaOutings.build(context.AquaState.initial(), { person, destination: destination.id, variant });
  assert.ok(backgrounds[data.background], `Unknown date background: ${person}/${destination.id}/${variant}`);
  assert.equal(data.lines.find(line => line.choice)?.choice.length, 2, 'Every date has two choices');
}
const missing = [];
for (const path of paths) {
  try { if (!(await fs.stat(path)).size) missing.push({ path: path.pathname, reason: 'empty' }); }
  catch (error) { if (error.code !== 'ENOENT') throw error; missing.push({ path: path.pathname, reason: 'missing' }); }
}
const payloadFolders = ['assets/campus-v2/', 'assets/environment/', 'assets/heroines/', 'assets/fonts/', 'assets/ui/', 'assets/audio/'];
const buildScript = await fs.readFile(new URL('scripts/build-exe.ps1',root),'utf8');
assert.match(buildScript, /'audio'/, 'Windows payload must include soundtrack and credits');
for (const path of [...paths].filter(p => p.pathname.includes('/assets/'))) {
  const relative = path.href.slice(root.href.length);
  assert.ok(payloadFolders.some(folder => relative.startsWith(folder)), `Asset outside packaged collections: ${relative}`);
}
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
await fs.writeFile(new URL('qa/campus-v2/asset-results.json', root), JSON.stringify({date, passed:missing.length===0, missing, resourceCount:paths.size, scriptOrder:scripts, entrypointsMatch:true, paths:[...paths].map(p=>p.href.slice(root.href.length)), scope:'Static entrypoint, source graph, art paths, and packaging collections. Not network or native EXE execution.'},null,2)+'\n');
assert.equal(missing.length, 0, `Unavailable assets:\n${missing.map(item=>`${item.reason}: ${item.path}`).join('\n')}`);
console.log(`PASS ${paths.size} resources, matching entrypoints, script dependency order, and payload collections`);
