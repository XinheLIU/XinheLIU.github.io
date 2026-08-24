#!/usr/bin/env node
// Read-only content-contract audit (Phase 1).
// Docs: docs/architecture/CONTENT-CONTRACT.md (section 9).
// Usage: node scripts/audit-content.mjs [--repos dir1,dir2,...] [--json out.json] [--exclude glob,...]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const jsYaml = require('js-yaml');

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', 'public', '.deploy_git', '_book', 'dist', 'cache',
  '.vitepress', '.temp', 'tmp', 'docs', 'sources', '.generated',
]);

const ALLOWED_LOCALES = new Set(['en', 'zh-CN']);
const ALLOWED_STATUS = new Set(['draft', 'published', 'archived']);
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const REQUIRED_FIELDS = ['id', 'locale', 'title', 'status', 'created', 'updated'];

function parseArgs(argv) {
  const opts = { repos: null, json: null, exclude: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repos' && argv[i + 1]) opts.repos = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--json' && argv[i + 1]) opts.json = argv[++i];
    else if (a === '--exclude' && argv[i + 1]) opts.exclude = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
const HERE = process.cwd();
const DEFAULT_REPOS = [
  '.',
  '../Coding-with-Agents',
  '../ComputerScience',
  '../Coding-Interview-Questions',
  '../MachineLearning',
];
const repoDirs = (opts.repos ?? DEFAULT_REPOS)
  .map((d) => path.resolve(HERE, d))
  .filter((d) => fs.existsSync(d) && fs.statSync(d).isDirectory());

function collectMdFiles(root) {
  const out = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!EXCLUDE_DIRS.has(e.name)) walk(p);
      } else if (e.name.toLowerCase().endsWith('.md')) {
        out.push(p);
      }
    }
  };
  walk(root);
  return out;
}

function splitFrontmatter(text) {
  const bomless = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const m = bomless.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!m) return { data: null, body: bomless, error: null };
  try {
    const raw = jsYaml.load(m[1]);
    if (raw === null || raw === undefined) return { data: null, body: bomless, error: 'empty frontmatter' };
    if (typeof raw !== 'object' || Array.isArray(raw)) return { data: null, body: bomless, error: 'frontmatter is not a mapping' };
    return { data: raw, body: bomless.slice(m[0].length), error: null };
  } catch (err) {
    return { data: null, body: bomless, error: String(err.message || err) };
  }
}

function isRealDate(s) {
  if (s instanceof Date) return !isNaN(s.getTime());
  if (!DATE_RE.test(s)) return false;
  const [y, mo, d] = s.split('-').map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

function checkCodeFences(body, results, push) {
  let inFence = false;
  body.split(/\r?\n/).forEach((line, idx) => {
    if (line.startsWith('```') || line.startsWith('~~~')) {
      const fenceChar = line[0];
      const rest = line.replace(/^`{3,}|^~{3,}/, '').trim();
      if (!inFence) {
        inFence = true;
        if (!rest) push('code-fence-no-language', 'warning', idx + 1, 'fenced code block has no language');
      } else if (line.startsWith(fenceChar.repeat(3))) {
        inFence = false;
      }
    }
  });
}

function checkImages(repoRoot, fileDir, body, results, push) {
  const re = /!\[[^\]]*\]\(\s*<?([^)>]+)>?\s*(?:"[^"]*")?\s*\)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const target = m[1].trim();
    if (/^(https?:|data:|mailto:|#)/i.test(target)) {
      if (/^https?:/i.test(target)) push('image-remote', 'info', lineOf(body, m.index), `remote image reference: ${target}`);
      continue;
    }
    if (target.startsWith('/')) {
      // Site-absolute reference: renderer-dependent (Hexo source_dir, VitePress base).
      // Existence is not checked here; the portable form is ./assets/...
      push('image-absolute', 'info', lineOf(body, m.index), `site-absolute image reference (renderer-dependent): ${target}`);
      continue;
    }
    const resolved = path.resolve(fileDir, target.split('#')[0].split('?')[0]);
    if (resolved !== repoRoot && !resolved.startsWith(repoRoot + path.sep)) {
      push('image-cross-repo', 'error', lineOf(body, m.index), `image reference escapes repository: ${target}`);
      continue;
    }
    if (!fs.existsSync(resolved)) {
      push('image-missing', 'error', lineOf(body, m.index), `missing image file: ${target}`);
    }
  }
}

function checkContentLinks(body, push) {
  const re = /\]\(\s*content:([^)\s"]*)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const target = m[1];
    const line = lineOf(body, m.index);
    if (!ID_RE.test(target)) {
      push('link-content-malformed', 'error', line, `content: target "${target}" fails id charset`);
    } else {
      push('__link__', 'pending', line, target); // resolved in second pass
    }
  }
}

function checkMermaid(body, push) {
  const re = /\{%\s*(endmermaid|mermaid)[^%]*%\}/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    push('mermaid-legacy-tag', 'warning', lineOf(body, m.index), `legacy Hexo mermaid tag found: ${m[0].trim()}`);
  }
}

function lineOf(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

const filesByRepo = [];
const index = new Map(); // id -> [{repo, file, locale}]

for (const repoRoot of repoDirs) {
  const repoName = path.basename(repoRoot) === '.' ? path.basename(HERE) : path.basename(repoRoot);
  const results = [];
  let currentFile = null;
  const push = (rule, severity, line, message) => results.push({ rule, severity, line, message, file: currentFile });
  const seen = new Map(); // `${id}\u0000${locale}` -> file

  for (const file of collectMdFiles(repoRoot)) {
    const rel = path.relative(repoRoot, file);
    currentFile = rel;
    let text;
    try {
      text = fs.readFileSync(file, 'utf8');
    } catch (err) {
      push('file-read-error', 'error', 0, String(err.message || err));
      continue;
    }
    const { data, body, error } = splitFrontmatter(text);
    if (error) {
      push('meta-frontmatter-invalid', 'error', 1, error);
      continue;
    }
    if (data === null) {
      push('meta-missing-frontmatter', 'info', 1, 'no YAML frontmatter');
      checkCodeFences(body, results, push);
      checkMermaid(body, push);
      checkImages(repoRoot, path.dirname(file), body, results, push);
      checkContentLinks(body, push);
      continue;
    }
    for (const field of REQUIRED_FIELDS) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        push('meta-missing-field', 'error', 1, `missing required field: ${field}`);
      }
    }
    if (typeof data.id === 'string') {
      if (!ID_RE.test(data.id)) push('meta-id-format', 'error', 1, `id "${data.id}" does not match ^[a-z0-9]+(-[a-z0-9]+)*$`);
    }
    if (data.locale !== undefined && !ALLOWED_LOCALES.has(String(data.locale))) {
      push('meta-locale-unknown', 'error', 1, `locale "${data.locale}" not in {en, zh-CN}`);
    }
    if (data.status !== undefined && !ALLOWED_STATUS.has(String(data.status))) {
      push('meta-status-unknown', 'error', 1, `status "${data.status}" not in {draft, published, archived}`);
    }
    const dateKey = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v));
    for (const d of ['created', 'updated']) {
      if (data[d] !== undefined && data[d] !== null && !isRealDate(data[d])) {
        push('meta-date-format', 'error', 1, `${d} "${data[d]}" is not a valid YYYY-MM-DD date`);
      }
    }
    if (isRealDate(data.updated) && isRealDate(data.created) && dateKey(data.updated) < dateKey(data.created)) {
      push('meta-date-order', 'error', 1, `updated ${data.updated} is earlier than created ${data.created}`);
    }
    if (typeof data.id === 'string' && data.locale !== undefined) {
      const key = `${data.id}\u0000${data.locale}`;
      if (seen.has(key)) push('meta-duplicate-id-locale', 'error', 1, `duplicate (id, locale) "${data.id}" / "${data.locale}" — also in ${path.relative(repoRoot, seen.get(key))}`);
      else seen.set(key, file);
      if (ID_RE.test(String(data.id))) {
        if (!index.has(data.id)) index.set(data.id, []);
        index.get(data.id).push({ repo: repoName, file: rel, locale: String(data.locale) });
      }
    }
    checkCodeFences(body, results, push);
    checkMermaid(body, push);
    checkImages(repoRoot, path.dirname(file), body, results, push);
    checkContentLinks(body, push);
  }

  filesByRepo.push({ repoName, repoRoot, results, fileCount: collectMdFiles(repoRoot).length });
}

// Second pass: resolve content: links against the corpus index.
for (const repo of filesByRepo) {
  for (const r of repo.results) {
    if (r.rule === '__link__') {
      const target = r.message;
      if (!index.has(target)) {
        r.rule = 'link-content-unresolved';
        r.severity = 'error';
        r.message = `content: target "${target}" not found in any scanned repository`;
      } else {
        r.rule = 'link-content-resolved';
        r.severity = 'ok';
        r.message = `content: target "${target}" resolved (${index.get(target).map((e) => `${e.repo}/${e.file}`).join(', ')})`;
      }
    }
  }
}

// Manifest validation (collections/*.yml) when present.
function validateManifests(repoRoot) {
  const out = [];
  const dir = path.join(repoRoot, 'collections');
  if (!fs.existsSync(dir)) return out;
  const push = (rule, severity, line, message, file) => out.push({ rule, severity, line, message, file });
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/\.ya?ml$/.test(f)) continue;
    const file = path.join(dir, f);
    const rel = path.relative(repoRoot, file);
    let doc;
    try {
      doc = jsYaml.load(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      push('manifest-invalid-yaml', 'error', 1, `${rel}: ${String(err.message || err)}`, rel);
      continue;
    }
    if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
      push('manifest-invalid-yaml', 'error', 1, `${rel}: root is not a mapping`, rel);
      continue;
    }
    if (!doc.id) push('manifest-missing-id', 'error', 1, `${rel}: missing manifest id`, rel);
    if (!Array.isArray(doc.items)) {
      push('manifest-no-items', 'error', 1, `${rel}: missing items array`, rel);
      continue;
    }
    const itemIds = new Set();
    doc.items.forEach((item, i) => {
      const at = `${rel} item ${i + 1}`;
      if (!item || typeof item !== 'object') {
        push('manifest-item-invalid', 'error', 1, `${at}: item is not a mapping`, rel);
        return;
      }
      if (!item.id || !ID_RE.test(String(item.id))) {
        push('manifest-item-id', 'error', 1, `${at}: missing or invalid item id`, rel);
        return;
      }
      if (itemIds.has(item.id)) push('manifest-duplicate-item', 'error', 1, `${at}: duplicate item id "${item.id}"`, rel);
      itemIds.add(item.id);
      const sources = [];
      if (item.source && typeof item.source === 'object') sources.push(...Object.entries(item.source));
      if (item.content) sources.push(['(content dir)', String(item.content)]);
      if (sources.length === 0) {
        push('manifest-item-source', 'error', 1, `${at}: item must declare "source" or "content"`, rel);
        return;
      }
      for (const [loc, p] of sources) {
        const resolved = path.resolve(repoRoot, String(p));
        if (!fs.existsSync(resolved)) {
          push('manifest-target-missing', 'error', 1, `${at}: source path does not exist: ${p}`, rel);
          continue;
        }
        if (fs.statSync(resolved).isFile()) {
          const { data } = splitFrontmatter(fs.readFileSync(resolved, 'utf8'));
          if (!data || String(data.id) !== String(item.id)) {
            push('manifest-id-mismatch', 'error', 1, `${at}: frontmatter id of ${p} does not match item id "${item.id}"`, rel);
          }
          if (loc !== '(content dir)' && String(data && data.locale) !== loc) {
            push('manifest-locale-mismatch', 'error', 1, `${at}: ${p} declares locale "${data && data.locale}" but manifest maps "${loc}"`, rel);
          }
        }
      }
      if (f === 'series.yml') {
        if (item.published_at && !isRealDate(item.published_at)) {
          push('manifest-published-at', 'error', 1, `${at}: published_at must be YYYY-MM-DD`, rel);
        }
        if (item.mode !== undefined && !['link', 'excerpt', 'full'].includes(item.mode)) {
          push('manifest-mode', 'error', 1, `${at}: mode must be link|excerpt|full`, rel);
        }
      }
    });
  }
  return out;
}

for (const repo of filesByRepo) {
  repo.results.push(...validateManifests(repo.repoRoot));
}

// Deterministic output.
for (const repo of filesByRepo) {
  repo.results.sort((a, b) =>
    a.rule.localeCompare(b.rule) || (a.line - b.line) || a.message.localeCompare(b.message));
  repo.results.forEach((r) => delete r.pending);
}

const summary = {};
let errorCount = 0;
let warningCount = 0;
let infoCount = 0;
for (const repo of filesByRepo) {
  const byRule = {};
  for (const r of repo.results) {
    byRule[r.rule] = (byRule[r.rule] || 0) + 1;
    if (r.severity === 'error') errorCount++;
    else if (r.severity === 'warning') warningCount++;
    else if (r.severity === 'info') infoCount++;
  }
  summary[repo.repoName] = { files: repo.fileCount, results: repo.results.length, byRule };
}

const report = { version: 1, summary, results: filesByRepo.map((r) => ({ repo: r.repoName, results: r.results })) };

// Human-readable output.
console.log(`Content contract audit (v1)`);
console.log(`Repositories scanned: ${filesByRepo.map((r) => r.repoName).join(', ')}`);
console.log(`Totals: ${errorCount} errors, ${warningCount} warnings, ${infoCount} info`);
console.log();
for (const repo of filesByRepo) {
  const byRule = summary[repo.repoName].byRule;
  const keys = Object.keys(byRule).sort();
  if (keys.length === 0) {
    console.log(`[${repo.repoName}] clean`);
    continue;
  }
  console.log(`[${repo.repoName}] ${repo.fileCount} files, ${repo.results.length} findings`);
  for (const k of keys) {
    const sev = repo.results.find((r) => r.rule === k)?.severity ?? '?';
    console.log(`  ${sev.padEnd(7)} ${k}: ${byRule[k]}`);
  }
}

if (opts.json) {
  fs.writeFileSync(path.resolve(HERE, opts.json), JSON.stringify(report, null, 2) + '\n');
  console.log(`\nJSON report written to ${opts.json}`);
}
