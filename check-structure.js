#!/usr/bin/env node
/**
 * check-structure.js
 *
 * Structural + type-safety integrity check — no test framework needed.
 *
 *  1. Core loader files exist
 *  2. schemas.js require() paths are valid   (parsed dynamically)
 *  3. virtuals.js require() paths are valid  (parsed dynamically)
 *  4. schema folders on disk are imported    (orphan detection)
 *  5. per-schema folder internals are in order
 *  6. types/index.d.ts barrel exports resolve
 *  7. TypeScript type check on the public API (tsc --noEmit)
 *
 * Run: node check-structure.js   |   npm test
 */

'use strict';

const fs            = require('fs');
const path          = require('path');
const { spawnSync } = require('child_process');

const ROOT = __dirname;
const CI    = process.env.GITHUB_ACTIONS === 'true';
let passed = 0;
let failed = 0;

// ── Helpers ──────────────────────────────────────────────────────

function ok(label) {
  console.log(`  \x1b[32m✓\x1b[0m  ${label}`);
  passed++;
}

// Encode a GitHub Actions annotation property value (title, file, …)
function _encProp(s) {
  return String(s)
    .replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')
    .replace(/:/g, '%3A').replace(/,/g, '%2C');
}
// Encode the annotation message
function _encMsg(s) {
  return String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
/**
 * Emit a GitHub Actions workflow annotation.
 * @param {'error'|'warning'|'notice'} level
 * @param {string} file  Repo-relative path (may be empty)
 * @param {string} title Short title shown in the UI
 * @param {string} message Full detail message
 */
function annotate(level, file, title, message) {
  if (!CI) return;
  const parts = [];
  if (file)  parts.push(`file=${_encProp(file)}`);
  if (title) parts.push(`title=${_encProp(title)}`);
  process.stdout.write(`::${level} ${parts.join(',')}::${_encMsg(message)}\n`);
}

/**
 * @param {string} label  Human-readable label printed to console
 * @param {string} [detail]  Extra detail appended with →
 * @param {string} [file]   Repo-relative file path for the annotation (optional)
 */
function fail(label, detail = '', file = '') {
  console.error(`  \x1b[31m✗\x1b[0m  ${label}${detail ? `  →  ${detail}` : ''}`);
  failed++;
  annotate('error', file, label, detail || label);
}

function warn(label) {
  console.warn(`  \x1b[33m⚠\x1b[0m  ${label}`);
}

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

function exists(rel) {
  const abs = path.join(ROOT, rel);
  return fs.existsSync(abs);
}

/**
 * Extract all string arguments passed to require() in a source file
 * that start with the given prefix.
 */
function extractRequires(filePath, prefix = '') {
  const src = fs.readFileSync(filePath, 'utf8');
  const re = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  const results = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    if (!prefix || m[1].startsWith(prefix)) results.push(m[1]);
  }
  return results;
}

/**
 * Resolve a require() string (relative to ROOT) to an array of
 * candidate absolute paths (with/without .js extension).
 */
function resolveRequire(req) {
  const abs = path.resolve(ROOT, req);
  return [abs, abs + '.js'];
}

// ── 1. Core loader files ─────────────────────────────────────────

section('Core files');

const CORE_FILES = [
  'index.js',
  'schemas.js',
  'virtuals.js',
  'utils.js',
  'index.d.ts',
  'types/index.d.ts',
  'types/generics.d.ts',
  'constants/index.js',
  'constants/index.d.ts',
];
for (const f of CORE_FILES) {
  exists(f) ? ok(f) : fail(f, 'missing core file', f);
}

// ── 2. schemas.js — dynamic require discovery ────────────────────

section('schemas.js — require paths (dynamic)');

const schemasJsRequires = extractRequires(path.join(ROOT, 'schemas.js'), './schemas/');

for (const req of schemasJsRequires) {
  const candidates = resolveRequire(req);
  if (candidates.some(c => fs.existsSync(c))) {
    ok(req);
  } else {
    fail(req, 'file not found on disk', 'schemas.js');
  }
}

// ── 3. virtuals.js — dynamic require discovery ───────────────────

section('virtuals.js — virtual file paths (dynamic)');

const virtualsJsRequires = extractRequires(path.join(ROOT, 'virtuals.js'), './schemas/');

for (const req of virtualsJsRequires) {
  const candidates = resolveRequire(req);
  if (candidates.some(c => fs.existsSync(c))) {
    ok(req);
  } else {
    fail(req, 'file not found on disk', 'virtuals.js');
  }
}

// ── Build combined referenced-file set ───────────────────────────
// Used by orphan detection. Normalised to absolute path (no extension).

const allRefs = new Set(
  [...schemasJsRequires, ...virtualsJsRequires].flatMap(resolveRequire)
);

// ── 4. Orphan detection ───────────────────────────────────────────
//
// Every DIRECTORY inside schemas/ must have at least one of its files
// referenced in schemas.js or virtuals.js. A folder with zero references
// is an orphan — it won't be loaded at runtime and is invisible to consumers.
//
// Separate check: if a <name>.virtuals.js exists in a folder but is NOT
// registered in virtuals.js, warn (virtual populate would silently not fire).

section('schema folders — orphan detection');

const schemasDir = path.join(ROOT, 'schemas');

for (const entry of fs.readdirSync(schemasDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const name    = entry.name;
  const dir     = path.join(schemasDir, name);
  const allFiles = fs.readdirSync(dir).map(f => path.join(dir, f));

  // Is any file in this folder referenced?
  const anyReferenced = allFiles.some(f => allRefs.has(f) || allRefs.has(f.replace(/\.js$/, '')));

  if (anyReferenced) {
    ok(`${name}/ — referenced`);
  } else {
    fail(`${name}/`, 'orphaned — no file in this folder is imported by schemas.js or virtuals.js');
  }

  // Virtuals cross-check: .virtuals.js present but not in virtuals.js?
  const virtualsFile = path.join(dir, `${name}.virtuals.js`);
  if (fs.existsSync(virtualsFile)) {
    const registered = virtualsJsRequires.some(req => {
      const abs = path.resolve(ROOT, req);
      return abs === virtualsFile || abs + '.js' === virtualsFile;
    });
    if (!registered) {
      fail(
        `${name}/${name}.virtuals.js`,
        'exists but is NOT registered in virtuals.js — virtual populate will not fire',
        'virtuals.js'
      );
    }
  }
}

// ── 5. Per-schema folder internals ───────────────────────────────
//
// Each folder must have <name>.js (required) and <name>.schema.d.ts (required
// except for LEGACY_BUNDLES). .types.d.ts and .virtuals.js are optional.

section('schema folders — internal structure');

// Folders that are multi-schema legacy bundles: skip the .schema.d.ts check
// because their types are split across individual sub-files.
const LEGACY_BUNDLES = new Set(['_misc']);

for (const entry of fs.readdirSync(schemasDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const name      = entry.name;
  const dir       = path.join(schemasDir, name);
  const js        = path.join(dir, `${name}.js`);
  const schemaD   = path.join(dir, `${name}.schema.d.ts`);
  const typesD    = path.join(dir, `${name}.types.d.ts`);
  const virtualsJ = path.join(dir, `${name}.virtuals.js`);

  fs.existsSync(js) ? ok(`${name}/${name}.js`) : fail(`${name}/${name}.js`, 'missing entrypoint', `schemas/${name}/${name}.js`);

  if (LEGACY_BUNDLES.has(name)) {
    warn(`${name}/${name}.schema.d.ts (skipped — legacy multi-schema bundle)`);
  } else {
    fs.existsSync(schemaD)
      ? ok(`${name}/${name}.schema.d.ts`)
      : fail(`${name}/${name}.schema.d.ts`, 'missing raw doc types', `schemas/${name}/${name}.schema.d.ts`);
  }

  if (!fs.existsSync(typesD))    warn(`${name}/${name}.types.d.ts (optional — no front-facing types)`);
  if (!fs.existsSync(virtualsJ)) warn(`${name}/${name}.virtuals.js (optional — no virtuals)`);
}

// ── 6. types/index.d.ts — barrel exports ─────────────────────────
//
// Dynamically parsed: every `export * from '...'` must resolve on disk.

section('types/index.d.ts — barrel exports (dynamic)');

const barrel   = fs.readFileSync(path.join(ROOT, 'types/index.d.ts'), 'utf8');
const exportRe = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
let m;
while ((m = exportRe.exec(barrel)) !== null) {
  const from = m[1];
  const abs  = path.resolve(ROOT, 'types', from);
  if ([abs, abs + '.d.ts', abs + '.ts'].some(c => fs.existsSync(c))) {
    ok(`export * from '${from}'`);
  } else {
    fail(`export * from '${from}'`, `no file found at ${path.relative(ROOT, abs)}`, 'types/index.d.ts');
  }
}

// ── 7. TypeScript type check ──────────────────────────────────────
//
// Write a tiny consumer .ts that imports the public API surface
// (types barrel + constants), then runs `tsc --noEmit` on it.
// Any broken import, missing type, or re-export collision will surface here.

section('TypeScript type check (tsc --noEmit)');

const tmpFile  = path.join(ROOT, '_check_types_tmp.ts');
const tscBin   = path.join(ROOT, 'node_modules', '.bin', 'tsc');

// Dynamically collect all export sources from the barrel to verify
// each individual types file is also clean in isolation.
const barrelSources = [];
const barrelRe2 = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
let m2;
while ((m2 = barrelRe2.exec(barrel)) !== null) {
  const absD = path.resolve(ROOT, 'types', m2[1]);
  // Only include paths that actually exist as .d.ts
  const candidate = [absD, absD + '.d.ts'].find(c => fs.existsSync(c));
  if (candidate) barrelSources.push(path.relative(ROOT, candidate).replace(/\\/g, '/'));
}

const tmpContent = [
  '// Auto-generated by check-structure.js — do not commit',
  "import type * as PublicTypes from './types/index';",
  "import type * as Generics    from './types/generics';",
  "import { CURRENCY_VALUES, RARITY_VALUES, PRIME_TIERS } from './constants/index';",
  '',
  '// Spot-check: ensure key types are accessible from the barrel',
  'declare const _u: PublicTypes.User;',
  'declare const _c: PublicTypes.CosmeticItem;',
  'declare const _i: PublicTypes.InventoryItem;',
  'declare const _r: PublicTypes.Rarity;',
  'declare const _cur: PublicTypes.Currency;',
  '',
  '// Spot-check: constants must be readonly arrays',
  'const _cv: readonly string[] = CURRENCY_VALUES;',
  'const _rv: readonly string[] = RARITY_VALUES;',
  'const _pt: readonly string[] = PRIME_TIERS;',
  '',
  'export {};',
].join('\n') + '\n';

fs.writeFileSync(tmpFile, tmpContent);

const tscArgs = [
  '--noEmit',
  '--strict',
  '--esModuleInterop',
  '--moduleResolution', 'node',
  '--target', 'ES2020',
  '--lib', 'ES2020',
  tmpFile,
];

// On Windows, the tsc bin is a cmd wrapper; use node to call the JS directly.
const tscJs      = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
const tscResult  = spawnSync(
  process.execPath,          // node
  [tscJs, ...tscArgs],
  { encoding: 'utf8', cwd: ROOT }
);

fs.unlinkSync(tmpFile);     // always clean up

const tscOutput = (tscResult.stdout + tscResult.stderr).trim();

if (tscResult.status === 0) {
  ok('public API types resolve without errors');
  ok('barrel exports (User, CosmeticItem, InventoryItem, Rarity, Currency) are accessible');
  ok('constants import is valid and typed as readonly arrays');
} else {
  // Filter out the tmp filename from output for clarity
  const cleaned = tscOutput
    .replace(new RegExp(tmpFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '<tmp>')
    .replace(/_check_types_tmp\.ts/g, '<tmp>');
  fail('TypeScript detected errors in the public type surface', '', 'types/index.d.ts');
  console.error(cleaned.split('\n').map(l => `     ${l}`).join('\n'));
  // Emit one annotation per tsc diagnostic line so they appear inline in CI
  if (CI) {
    const tscLineRe = /\(\d+,\d+\):\s+error\s+(TS\d+):\s+(.+)$/;
    for (const line of tscOutput.split('\n')) {
      const m = tscLineRe.exec(line);
      if (m) annotate('error', 'types/index.d.ts', m[1], m[2].trim());
    }
  }
}

// ── Summary ───────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
if (failed === 0) {
  console.log(`\x1b[32m\x1b[1m  All ${passed} checks passed.\x1b[0m`);
} else {
  console.log(`\x1b[32m  ${passed} passed\x1b[0m  \x1b[31m${failed} failed\x1b[0m`);
}
console.log();

process.exit(failed > 0 ? 1 : 0);

