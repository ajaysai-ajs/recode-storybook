/**
 * Builds CSS custom properties from the Figma Variables export in /Figma.
 *
 *   node scripts/build-tokens.mjs
 *
 * Input:  Figma/<collection>/<Mode>.tokens.json   (Figma "Export variables", DTCG format)
 * Output: src/tokens/css/**            one CSS file per collection (components split per component)
 *         src/tokens/tokens.json       resolved manifest used by the Storybook docs pages
 *
 * Naming: the CSS variable name is the Figma "code syntax" (WEB) of each variable, so what
 * designers see in Dev Mode is what you write in code. Variables without code syntax get a
 * name derived from their Figma path. Primitives under an "absolute" group that have no code
 * syntax are treated as private and inlined into the tokens that reference them.
 *
 * Aliases are emitted as var(--other-token), so switching raw colors to the Dark mode
 * re-themes every semantic and component token automatically.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'Figma');
const OUT = path.join(ROOT, 'src', 'tokens');
const OUT_CSS = path.join(OUT, 'css');

/** Figma collection folder -> output file and fallback name prefix. Order = import order. */
const COLLECTIONS = [
  { dir: 'raw colors', out: 'foundations/colors.css', title: 'Raw colors', prefix: 'color' },
  { dir: 'typography', out: 'foundations/typography.css', title: 'Typography', prefix: '' },
  { dir: 'spacing', out: 'foundations/spacing.css', title: 'Spacing', prefix: 'spacing' },
  { dir: 'padding', out: 'foundations/padding.css', title: 'Padding', prefix: 'padding' },
  { dir: 'gap', out: 'foundations/gap.css', title: 'Gap', prefix: 'gap' },
  { dir: 'sizing', out: 'foundations/sizing.css', title: 'Sizing', prefix: 'size' },
  { dir: 'border radii', out: 'foundations/radius.css', title: 'Border radii', prefix: 'radius' },
  { dir: 'border', out: 'foundations/border.css', title: 'Border widths & rings', prefix: 'border' },
  { dir: 'opacity', out: 'foundations/opacity.css', title: 'Opacity', prefix: 'opacity' },
  { dir: 'shadows', out: 'foundations/shadows.css', title: 'Shadows', prefix: 'shadow' },
  { dir: 'semantic', out: 'semantic/colors.css', title: 'Semantic colors', prefix: '' },
  { dir: 'components', out: 'components', title: 'Component tokens', prefix: '', splitByComponent: true },
];

/** The first mode found in this list is the default (:root); others become [data-theme="…"]. */
const DEFAULT_MODES = ['Light', 'Default', 'Mode 1'];

/**
 * Manual name fixes for variables whose Figma code syntax is missing or clashes.
 * Key: "<collection>:<figma/path>", value: CSS variable name.
 */
const NAME_OVERRIDES = {
  // No code syntax in Figma
  'typography:font definitions/font-family-headings': '--font-headings',
  'typography:font definitions/font-family-body': '--font-body',
  'typography:paragraph/paragraph-weight': '--paragraph-regular-weight',
  'typography:paragraph/paragraph-medium-weight': '--paragraph-medium-weight',
  'typography:paragraph/paragraph-bold-weight': '--paragraph-bold-weight',
};

/**
 * Groups whose Figma code syntax is ignored in favour of path-derived names.
 * "badge legacy" still carries the old --badge-* code syntax, which the new "badge" now uses.
 */
const DERIVE_NAMES_FOR = ['components:badge legacy/'];

/** Figma font style names -> numeric font-weight. */
const FONT_STYLE_WEIGHTS = {
  thin: 100, extralight: 200, light: 300, regular: 400, normal: 400,
  medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900,
};

const UNITLESS_SCOPES = new Set(['OPACITY', 'FONT_STYLE', 'FONT_WEIGHT']);

// ---------------------------------------------------------------------------
// Load

const warnings = new Set();
const warn = (msg) => warnings.add(msg);

const slug = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function readCollection(cfg) {
  const dir = path.join(SRC, cfg.dir);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tokens.json'));
  const modes = files.map((f) => {
    const json = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    return { name: json.$extensions?.['com.figma.modeName'] ?? f.replace('.tokens.json', ''), json };
  });
  modes.sort((a, b) => rankMode(a.name) - rankMode(b.name));
  return modes;
}

function rankMode(name) {
  const i = DEFAULT_MODES.indexOf(name);
  return i === -1 ? DEFAULT_MODES.length : i;
}

function flatten(json) {
  const out = [];
  (function walk(node, p) {
    if (node && typeof node === 'object' && '$value' in node) {
      out.push({ path: p, node });
      return;
    }
    if (node && typeof node === 'object')
      for (const [k, child] of Object.entries(node)) if (!k.startsWith('$')) walk(child, [...p, k]);
  })(json, []);
  return out;
}

/** tokens keyed by "<collection>:<path/with/slashes>" */
const tokens = new Map();
const collections = [];

for (const cfg of COLLECTIONS) {
  const modes = readCollection(cfg);
  const col = { ...cfg, modes: modes.map((m) => m.name), keys: [] };
  collections.push(col);
  for (const mode of modes) {
    for (const { path: p, node } of flatten(mode.json)) {
      const key = `${cfg.dir}:${p.join('/')}`;
      let t = tokens.get(key);
      if (!t) {
        const ext = node.$extensions ?? {};
        t = {
          key,
          collection: cfg.dir,
          path: p,
          type: node.$type,
          scopes: ext['com.figma.scopes'] ?? [],
          codeSyntax: ext['com.figma.codeSyntax']?.WEB,
          values: {},
        };
        tokens.set(key, t);
        col.keys.push(key);
      }
      t.values[mode.name] = node;
    }
  }
}

// ---------------------------------------------------------------------------
// Naming

function normalizeCodeSyntax(web) {
  const m = /^\s*var\(\s*(-{0,2})([^)\s]+)\s*\)\s*$/.exec(web);
  const name = m ? m[2] : web.trim();
  return `--${name.replace(/^-+/, '')}`;
}

function derivedName(t, cfg) {
  const parts = t.path.filter((seg, i) => !(i === 0 && (seg === 'absolute' || seg === 'semantic'))).map(slug);
  let name = parts.join('-');
  if (cfg.prefix && !name.startsWith(cfg.prefix + '-')) name = `${cfg.prefix}-${name}`;
  return `--${name}`;
}

const cfgByDir = Object.fromEntries(COLLECTIONS.map((c) => [c.dir, c]));

for (const t of tokens.values()) {
  const cfg = cfgByDir[t.collection];
  const overridden = NAME_OVERRIDES[t.key];
  if (overridden) {
    t.name = overridden;
  } else if (DERIVE_NAMES_FOR.some((prefix) => t.key.startsWith(prefix))) {
    t.name = derivedName(t, cfg);
  } else if (t.codeSyntax) {
    t.name = normalizeCodeSyntax(t.codeSyntax);
    if (!/^var\(--/.test(t.codeSyntax.trim())) warn(`Fixed code syntax "${t.codeSyntax}" -> ${t.name}  (${t.key})`);
  } else if (t.path[0] === 'absolute' && Object.keys(t.values).length === 1) {
    t.inline = true; // private primitive: no code syntax, single mode
  } else {
    t.name = derivedName(t, cfg);
  }
}

// ---------------------------------------------------------------------------
// Resolution

/** Find the token an alias points to. */
function aliasTarget(t, node) {
  const v = node.$value;
  if (typeof v === 'string' && /^\{.+\}$/.test(v)) {
    const ref = v.slice(1, -1).split('.').join('/');
    const target = tokens.get(`${t.collection}:${ref}`);
    if (!target) warn(`Unresolved reference ${v} in ${t.key}`);
    return target;
  }
  const alias = node.$extensions?.['com.figma.aliasData'];
  if (alias) {
    const target = tokens.get(`${alias.targetVariableSetName}:${alias.targetVariableName}`);
    if (!target) warn(`Unresolved alias ${alias.targetVariableSetName}/${alias.targetVariableName} in ${t.key} (using raw value)`);
    return target;
  }
  return undefined;
}

function modeFor(target, mode) {
  return target.values[mode] ? mode : Object.keys(target.values)[0];
}

const round = (n) => Number(n.toFixed(4));

function isUnitless(t) {
  return t.scopes.some((s) => UNITLESS_SCOPES.has(s));
}

function fontStyleToWeight(str) {
  return FONT_STYLE_WEIGHTS[str.toLowerCase().replace(/[\s_-]+/g, '')];
}

function literal(t, node) {
  const v = node.$value;
  switch (t.type) {
    case 'color': {
      if (typeof v !== 'object') return String(v);
      const a = round(v.alpha ?? 1);
      if (a === 1) return v.hex.toUpperCase();
      const [r, g, b] = v.components.map((c) => Math.round(c * 255));
      return `rgb(${r} ${g} ${b} / ${a})`;
    }
    case 'number': {
      // Zero keeps its unit so tokens stay valid inside calc()/min() with other lengths.
      const n = round(v);
      return isUnitless(t) ? String(n) : `${n}px`;
    }
    case 'string': {
      const weight = fontStyleToWeight(v);
      return weight ? String(weight) : `"${v}"`;
    }
    default:
      return String(v);
  }
}

/** CSS value for token t in `mode`: var(--alias) when possible, else a literal. */
function cssValue(t, mode, seen = new Set()) {
  const node = t.values[modeFor(t, mode)];
  if (seen.has(t.key)) {
    warn(`Circular alias at ${t.key}`);
    return literal(t, node);
  }
  seen.add(t.key);
  const target = aliasTarget(t, node);
  if (!target) return literal(t, node);
  if (target.inline) return cssValue(target, mode, seen);
  if (target.name === t.name) {
    warn(`Self-referencing name ${t.name} (${t.key} -> ${target.key}); inlined`);
    return cssValue(target, mode, seen);
  }
  return `var(${target.name})`;
}

/** Fully resolved literal (for docs). */
function resolvedValue(t, mode, seen = new Set()) {
  const node = t.values[modeFor(t, mode)];
  if (seen.has(t.key)) return literal(t, node);
  seen.add(t.key);
  const target = aliasTarget(t, node);
  return target ? resolvedValue(target, mode, seen) : literal(t, node);
}

// ---------------------------------------------------------------------------
// Collision check

const allModes = () => [...new Set(collections.flatMap((c) => c.modes))];
const sameEverywhere = (a, b) => allModes().every((m) => resolvedValue(a, m) === resolvedValue(b, m));
const directAliasOf = (a, b) => Object.values(a.values).every((node) => aliasTarget(a, node) === b);

const byName = new Map();
for (const t of tokens.values()) {
  if (t.inline) continue;
  const prev = byName.get(t.name);
  if (!prev) {
    byName.set(t.name, t);
    continue;
  }
  if (directAliasOf(t, prev) || (prev.collection === t.collection && sameEverywhere(t, prev))) {
    // e.g. components:input/placeholder -> semantic:input/placeholder, both --input-placeholder
    t.duplicateOf = prev.key;
    continue;
  }
  // Real clash: a token whose Figma path matches the name keeps it; the other is renamed.
  const owns = (x) => derivedName(x, cfgByDir[x.collection]) === x.name;
  const [winner, loser] = owns(prev) || !owns(t) ? [prev, t] : [t, prev];
  let renamed = derivedName(loser, cfgByDir[loser.collection]);
  if (renamed === winner.name) renamed = renamed.replace(/^--/, `--${slug(loser.collection)}-`);
  warn(`Name collision ${t.name}: ${prev.key} vs ${t.key} -> ${loser.key} renamed to ${renamed}`);
  loser.name = renamed;
  byName.set(winner.name, winner);
  byName.set(renamed, loser);
}

// ---------------------------------------------------------------------------
// Emit CSS

const HEADER = `/* Generated by scripts/build-tokens.mjs from /Figma - do not edit by hand. */\n`;

function groupLabel(t) {
  return t.path.slice(0, -1).join(' / ') || '(root)';
}

function declarations(keys, mode, onlyChanged) {
  let out = '';
  let lastGroup = null;
  for (const key of keys) {
    const t = tokens.get(key);
    if (t.inline || t.duplicateOf) continue;
    if (onlyChanged && cssValue(t, mode) === cssValue(t, collectionsDefault(t))) continue;
    if (!t.values[mode] && onlyChanged) continue;
    const g = groupLabel(t);
    if (g !== lastGroup) {
      out += `${lastGroup === null ? '' : '\n'}  /* ${g} */\n`;
      lastGroup = g;
    }
    out += `  ${t.name}: ${cssValue(t, mode)};\n`;
  }
  return out;
}

function collectionsDefault(t) {
  return collections.find((c) => c.dir === t.collection).modes[0];
}

/** Composite shadows: shadow/<size>/{x,y,blur,spread,color} or shadow/<size>/<layer>/{…} */
function shadowComposites(col) {
  const groups = new Map();
  for (const key of col.keys) {
    const t = tokens.get(key);
    if (t.path[0] !== 'semantic' || t.inline) continue;
    const prop = t.path.at(-1);
    const layerPath = t.path.slice(1, -1); // [size] or [size, layer]
    const size = layerPath[0];
    const layerId = layerPath.slice(1).join('/') || '0';
    if (!groups.has(size)) groups.set(size, new Map());
    const layers = groups.get(size);
    if (!layers.has(layerId)) layers.set(layerId, {});
    layers.get(layerId)[prop] = t.name;
  }
  let out = '\n  /* composite box-shadows */\n';
  for (const [size, layers] of groups) {
    const value = [...layers.values()]
      .map((l) => `var(${l.x}) var(${l.y}) var(${l.blur}) var(${l.spread}) var(${l.color})`)
      .join(', ');
    out += `  --shadow-${slug(size)}: ${value};\n`;
  }
  return out;
}

const THEMED_SCOPE = ':root,\n[data-theme]';

function writeFile(rel, content) {
  const file = path.join(OUT_CSS, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return rel.replace(/\\/g, '/');
}

fs.rmSync(OUT_CSS, { recursive: true, force: true });
const imports = [];

for (const col of collections) {
  const isFoundation = col.out.startsWith('foundations/');
  // Foundations only change per mode; everything that aliases them is re-declared on any
  // [data-theme] element so nested themes (e.g. a dark card on a light page) resolve correctly.
  const scope = !isFoundation
    ? THEMED_SCOPE
    : col.modes.length > 1
      ? `:root,\n[data-theme="${slug(col.modes[0])}"]`
      : ':root';

  if (col.splitByComponent) {
    const byComponent = new Map();
    for (const key of col.keys) {
      const c = tokens.get(key).path[0];
      if (!byComponent.has(c)) byComponent.set(c, []);
      byComponent.get(c).push(key);
    }
    const compImports = [];
    for (const [component, keys] of byComponent) {
      const rel = `${col.out}/${slug(component)}.css`;
      writeFile(rel, `${HEADER}/* Component: ${component} */\n\n${scope} {\n${declarations(keys, col.modes[0])}}\n`);
      compImports.push(`@import './${slug(component)}.css';`);
    }
    imports.push(writeFile(`${col.out}/index.css`, `${HEADER}\n${compImports.join('\n')}\n`));
    continue;
  }

  let css = `${HEADER}/* ${col.title} - Figma collection "${col.dir}" */\n\n`;
  const colorScheme = col.modes.length > 1 ? `  color-scheme: ${slug(col.modes[0])};\n` : '';
  css += `${scope} {\n${colorScheme}${declarations(col.keys, col.modes[0])}`;
  if (col.dir === 'shadows') css += shadowComposites(col);
  css += `}\n`;
  for (const mode of col.modes.slice(1)) {
    const body = declarations(col.keys, mode, true);
    if (body) css += `\n/* ${mode} mode */\n[data-theme="${slug(mode)}"] {\n  color-scheme: ${slug(mode)};\n${body}}\n`;
  }
  imports.push(writeFile(col.out, css));
}

writeFile(
  'index.css',
  `${HEADER}/* Import this one file to get every token. Set data-theme="dark" on any element to switch modes. */\n\n` +
    imports.map((i) => `@import './${i}';`).join('\n') +
    '\n',
);

// ---------------------------------------------------------------------------
// Manifest for docs

// Theme modes come from multi-mode collections (raw colors: Light/Dark). Every token is resolved
// against them, so semantic and component colors also get their dark value.
const themeModes = [...new Set(collections.filter((c) => c.modes.length > 1).flatMap((c) => c.modes))];

const manifest = {
  generatedFrom: 'Figma',
  themes: themeModes.map(slug),
  collections: collections.map((col) => ({
    id: slug(col.dir),
    figmaName: col.dir,
    title: col.title,
    modes: col.modes,
    tokens: col.keys
      .map((k) => tokens.get(k))
      .filter((t) => !t.inline && !t.duplicateOf)
      .map((t) => {
        const entry = {
          name: t.name,
          figmaPath: t.path.join('/'),
          type: t.type,
          scopes: t.scopes,
          css: cssValue(t, col.modes[0]),
          value: resolvedValue(t, col.modes[0]),
        };
        const perTheme = themeModes.map((m) => [slug(m), resolvedValue(t, m)]);
        if (new Set(perTheme.map(([, v]) => v)).size > 1) entry.themes = Object.fromEntries(perTheme);
        return entry;
      }),
  })),
};
fs.writeFileSync(path.join(OUT, 'tokens.json'), JSON.stringify(manifest, null, 2) + '\n');

// ---------------------------------------------------------------------------
// Report

const emitted = [...tokens.values()].filter((t) => !t.inline && !t.duplicateOf).length;
const inlined = [...tokens.values()].filter((t) => t.inline).length;
console.log(`Tokens: ${tokens.size} read, ${emitted} emitted as CSS variables, ${inlined} private primitives inlined.`);
console.log(`Wrote ${imports.length} entry files + index.css to ${path.relative(ROOT, OUT_CSS)}`);
if (warnings.size) {
  console.log(`\n${warnings.size} warning(s):`);
  for (const w of warnings) console.log('  - ' + w);
}
