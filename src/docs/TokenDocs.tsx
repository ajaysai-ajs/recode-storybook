import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';

import {
  absoluteOf,
  collection,
  groupBy,
  px,
  semanticOf,
  valueIn,
  type Theme,
  type Token,
} from './tokens';
import './docs.css';

/*
 * Building blocks for the Foundations docs pages. Everything renders from src/tokens/tokens.json,
 * so the pages stay in sync with Figma after `npm run tokens`.
 *
 * Blocks are pinned to data-theme="light" so they stay legible inside Storybook's docs UI;
 * colour tables show the light and dark values side by side instead.
 */

const THEMES: Theme[] = ['light', 'dark'];

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="sb-unstyled tk" data-theme="light">
      {children}
    </div>
  );
}

function TokenName({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(`var(${name})`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };
  return (
    <button type="button" className="tk-name" onClick={copy} title={`Copy var(${name})`}>
      {copied ? 'Copied!' : name}
    </button>
  );
}

function Swatch({ color, size = 'md' }: { color: string; size?: 'sm' | 'md' }) {
  return <span className={`tk-swatch tk-swatch--${size}`} style={{ '--tk-swatch': color } as CSSProperties} />;
}

function Meta({ children }: { children: ReactNode }) {
  return <span className="tk-meta">{children}</span>;
}

// ---- Colours ------------------------------------------------------------------------------

/** Raw palettes: one row per hue, light on top and dark below. */
export function RawPalettes() {
  const groups = groupBy(collection('raw-colors').tokens);
  return (
    <Frame>
      {groups.map(([hue, tokens]) => (
        <section key={hue || 'base'} className="tk-palette">
          <h4 className="tk-palette__title">{hue || 'base'}</h4>
          {THEMES.map((theme) => (
            <div key={theme} className="tk-palette__row">
              <span className="tk-palette__mode">{theme}</span>
              {tokens.map((t) => (
                <div key={t.name} className="tk-palette__cell" title={`${t.name}\n${t.figmaPath}\n${valueIn(t, theme)}`}>
                  <Swatch color={valueIn(t, theme)} />
                  {theme === 'light' && <span className="tk-palette__step">{t.name.split('-').pop()}</span>}
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </Frame>
  );
}

/** Light/dark colour table for any collection of colour tokens. */
export function ColorTable({ tokens }: { tokens: Token[] }) {
  return (
    <div className="tk-table-wrap">
      <table className="tk-table">
        <thead>
          <tr>
            <th>Light</th>
            <th>Dark</th>
            <th>Token</th>
            <th>Figma</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.name}>
              {THEMES.map((theme) => (
                <td key={theme} className="tk-table__swatch">
                  <Swatch color={valueIn(t, theme)} />
                  <Meta>{valueIn(t, theme)}</Meta>
                </td>
              ))}
              <td>
                <TokenName name={t.name} />
              </td>
              <td>
                <Meta>{t.figmaPath}</Meta>
              </td>
              <td>
                <code className="tk-code">{t.css}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SemanticColors() {
  const groups = groupBy(collection('semantic').tokens);
  return (
    <Frame>
      {groups.map(([group, tokens]) => (
        <section key={group} className="tk-section">
          <h4 className="tk-section__title">{group}</h4>
          <ColorTable tokens={tokens} />
        </section>
      ))}
    </Frame>
  );
}

// ---- Typography ---------------------------------------------------------------------------

const TEXT_STYLES = [
  { className: 'heading-1', label: 'Heading 1', prefix: '--heading-1' },
  { className: 'heading-2', label: 'Heading 2', prefix: '--heading-2' },
  { className: 'heading-3', label: 'Heading 3', prefix: '--heading-3' },
  { className: 'heading-4', label: 'Heading 4', prefix: '--heading-4' },
  { className: 'paragraph', label: 'Paragraph', prefix: '--paragraph-regular' },
  { className: 'paragraph-small', label: 'Paragraph small', prefix: '--paragraph-small' },
  { className: 'paragraph-mini', label: 'Paragraph mini', prefix: '--paragraph-mini' },
  { className: 'monospaced', label: 'Monospaced', prefix: '--monospaced' },
];

export function TextStyles() {
  const tokens = collection('typography').tokens;
  const spec = (prefix: string, prop: string) => tokens.find((t) => t.name === `${prefix}-${prop}`)?.value;
  return (
    <Frame>
      <div className="tk-type">
        {TEXT_STYLES.map((s) => (
          <div key={s.className} className="tk-type__row">
            <div className="tk-type__meta">
              <strong>{s.label}</strong>
              <code className="tk-code">.{s.className}</code>
              <Meta>
                {spec(s.prefix, 'font-size')} / {spec(s.prefix, 'line-height')} · weight{' '}
                {/* small & mini share the paragraph weight */}
                {spec(s.prefix, 'weight') ?? spec('--paragraph-regular', 'weight')} · tracking{' '}
                {spec(s.prefix, 'letter-spacing')}
              </Meta>
            </div>
            <p className={s.className}>The quick brown fox jumps over the lazy dog</p>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function tokensIn(group: string) {
  return collection('typography').tokens.filter((t) => t.figmaPath.startsWith(group));
}

export function FontFamilies() {
  return (
    <Frame>
      <div className="tk-grid">
        {tokensIn('font definitions/').map((t) => (
          <div key={t.name} className="tk-card">
            <div className="tk-card__sample" style={{ fontFamily: `var(${t.name})`, fontSize: 32 }}>
              Aa Bb Cc 0123
            </div>
            <TokenName name={t.name} />
            <Meta>{t.value}</Meta>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function FontSizes() {
  return (
    <Frame>
      <div className="tk-list">
        {tokensIn('absolute/font size/').map((t) => (
          <div key={t.name} className="tk-list__row">
            <div className="tk-list__label">
              <TokenName name={t.name} />
              <Meta>{t.value}</Meta>
            </div>
            <span className="tk-ellipsis" style={{ fontSize: `var(${t.name})`, lineHeight: 1.2 }}>
              Design tokens
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function FontWeights() {
  return (
    <Frame>
      <div className="tk-grid">
        {tokensIn('absolute/font weight/').map((t) => (
          <div key={t.name} className="tk-card">
            <div className="tk-card__sample" style={{ fontWeight: `var(${t.name})`, fontSize: 28 }}>
              Aa
            </div>
            <TokenName name={t.name} />
            <Meta>{t.value}</Meta>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function TypeTable({ group }: { group: string }) {
  return (
    <Frame>
      <ValueTable tokens={tokensIn(group)} />
    </Frame>
  );
}

// ---- Dimensions ---------------------------------------------------------------------------

function ValueTable({ tokens }: { tokens: Token[] }) {
  return (
    <div className="tk-table-wrap">
      <table className="tk-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Value</th>
            <th>CSS</th>
            <th>Figma</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.name}>
              <td>
                <TokenName name={t.name} />
              </td>
              <td>
                <strong className="tk-value">{t.value}</strong>
              </td>
              <td>
                <code className="tk-code">{t.css}</code>
              </td>
              <td>
                <Meta>{t.figmaPath}</Meta>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Horizontal bars for spacing / padding / gap / sizing scales. */
export function ScaleBars({ id, set = 'semantic' }: { id: string; set?: 'semantic' | 'absolute' }) {
  const tokens = set === 'semantic' ? semanticOf(id) : absoluteOf(id);
  const sorted = [...tokens].sort((a, b) => px(a.value) - px(b.value));
  return (
    <Frame>
      <div className="tk-list">
        {sorted.map((t) => (
          <div key={t.name} className="tk-list__row">
            <div className="tk-list__label">
              <TokenName name={t.name} />
              <Meta>
                {t.value}
                {t.css.startsWith('var(') ? ` · ${t.css}` : ''}
              </Meta>
            </div>
            <span className="tk-bar" style={{ width: `min(var(${t.name}), 100%)` }} />
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function RadiusScale() {
  return (
    <Frame>
      <div className="tk-grid">
        {semanticOf('border-radii').map((t) => (
          <div key={t.name} className="tk-card">
            <div className="tk-radius" style={{ borderRadius: `var(${t.name})` }} />
            <TokenName name={t.name} />
            <Meta>{t.value}</Meta>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function BorderScale() {
  return (
    <Frame>
      <div className="tk-grid">
        {semanticOf('border').map((t) => {
          const isRing = t.name.startsWith('--ring');
          const style: CSSProperties = isRing
            ? { boxShadow: `0 0 0 var(${t.name}) var(--ring)` }
            : { border: `var(${t.name}) solid var(--border-strong)` };
          return (
            <div key={t.name} className="tk-card">
              <div className="tk-border" style={style} />
              <TokenName name={t.name} />
              <Meta>{t.value}</Meta>
            </div>
          );
        })}
      </div>
    </Frame>
  );
}

export function ShadowScale() {
  const composites = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  return (
    <Frame>
      <div className="tk-grid tk-grid--roomy">
        {composites.map((size) => (
          <div key={size} className="tk-card tk-card--flat">
            <div className="tk-shadow" style={{ boxShadow: `var(--shadow-${size})` }} />
            <TokenName name={`--shadow-${size}`} />
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function OpacityScale({ set = 'semantic' }: { set?: 'semantic' | 'absolute' }) {
  const tokens = set === 'semantic' ? semanticOf('opacity') : absoluteOf('opacity');
  return (
    <Frame>
      <div className="tk-grid">
        {tokens.map((t) => (
          <div key={t.name} className="tk-card">
            <div className="tk-opacity">
              <span style={{ opacity: `var(${t.name})` }} />
            </div>
            <TokenName name={t.name} />
            <Meta>{t.value}</Meta>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function DimensionTable({ id, set }: { id: string; set?: 'semantic' | 'absolute' }) {
  const tokens = set === 'semantic' ? semanticOf(id) : set === 'absolute' ? absoluteOf(id) : collection(id).tokens;
  return (
    <Frame>
      <ValueTable tokens={tokens} />
    </Frame>
  );
}

// ---- Component tokens ---------------------------------------------------------------------

export function ComponentTokens() {
  const all = collection('components').tokens;
  const components = useMemo(() => groupBy(all).map(([name]) => name), [all]);
  const [component, setComponent] = useState('');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const visible = all.filter(
    (t) =>
      (!component || t.figmaPath.startsWith(`${component}/`)) &&
      (!q || t.name.includes(q) || t.figmaPath.toLowerCase().includes(q) || t.css.includes(q)),
  );
  const groups = groupBy(visible);

  return (
    <Frame>
      <div className="tk-toolbar">
        <input
          className="tk-input"
          type="search"
          placeholder="Search tokens, e.g. button hover"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search component tokens"
        />
        <select
          className="tk-input"
          value={component}
          onChange={(e) => setComponent(e.target.value)}
          aria-label="Filter by component"
        >
          <option value="">All components ({components.length})</option>
          {components.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Meta>{visible.length} tokens</Meta>
      </div>

      {groups.map(([name, tokens]) => (
        <details key={name} className="tk-details" open={Boolean(component || q)}>
          <summary>
            <strong>{name}</strong> <Meta>{tokens.length} tokens</Meta>
            <code className="tk-code">src/tokens/css/components/{name.replace(/\s+/g, '-')}.css</code>
          </summary>
          <div className="tk-table-wrap">
            <table className="tk-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Light</th>
                  <th>Dark</th>
                  <th>CSS</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t.name}>
                    <td>
                      <TokenName name={t.name} />
                      <Meta>{t.figmaPath}</Meta>
                    </td>
                    {THEMES.map((theme) => (
                      <td key={theme} className="tk-table__swatch">
                        {t.type === 'color' && <Swatch color={valueIn(t, theme)} size="sm" />}
                        <Meta>{valueIn(t, theme)}</Meta>
                      </td>
                    ))}
                    <td>
                      <code className="tk-code">{t.css}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </Frame>
  );
}
