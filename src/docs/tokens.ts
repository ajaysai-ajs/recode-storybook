import manifest from '../tokens/tokens.json';

export type Theme = 'light' | 'dark';

export interface Token {
  /** CSS custom property, e.g. `--primary` */
  name: string;
  /** Variable path in Figma, e.g. `primary/default` */
  figmaPath: string;
  type: 'color' | 'number' | 'string';
  scopes: string[];
  /** Value as written in the CSS file (often a `var()` alias) */
  css: string;
  /** Fully resolved value in the default (light) theme */
  value: string;
  /** Present only when the value differs between themes */
  themes?: Record<Theme, string>;
}

export interface Collection {
  id: string;
  figmaName: string;
  title: string;
  modes: string[];
  tokens: Token[];
}

export const collections = manifest.collections as Collection[];

export function collection(id: string): Collection {
  const found = collections.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown token collection "${id}"`);
  return found;
}

export const valueIn = (token: Token, theme: Theme) => token.themes?.[theme] ?? token.value;

/** Group tokens by the leading segments of their Figma path. */
export function groupBy(tokens: Token[], depth = 1): [string, Token[]][] {
  const groups = new Map<string, Token[]>();
  for (const t of tokens) {
    const segments = t.figmaPath.split('/');
    const key = segments.length > depth ? segments.slice(0, depth).join(' / ') : '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }
  return [...groups];
}

/** Tokens from the "semantic" group of a primitive collection (spacing, gap, radius…). */
export const semanticOf = (id: string) =>
  collection(id).tokens.filter((t) => t.figmaPath.startsWith('semantic/'));

export const absoluteOf = (id: string) =>
  collection(id).tokens.filter((t) => t.figmaPath.startsWith('absolute/'));

export const px = (value: string) => Number.parseFloat(value) || 0;
