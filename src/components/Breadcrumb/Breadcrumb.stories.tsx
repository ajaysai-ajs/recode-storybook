import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Breadcrumb, BreadcrumbItem, type BreadcrumbLink, type BreadcrumbState, type BreadcrumbVariant } from './Breadcrumb';

const TRAIL: BreadcrumbLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'Projects', href: '#projects' },
  { label: 'Design System', href: '#design-system' },
  { label: 'Components', href: '#components' },
  { label: 'Navigation', href: '#navigation' },
  { label: 'Breadcrumb', href: '#breadcrumb' },
];

const VARIANTS: BreadcrumbVariant[] = ['Link', 'Current', 'Ellipsis'];
const STATES: BreadcrumbState[] = ['Default', 'Hover'];

/** Items render <li>, so previews of single items sit inside a list. */
const List = ({ children }: { children: ReactNode }) => (
  <ol style={{ display: 'flex', gap: 'var(--breadcrumb-gap)', margin: 0, padding: 0, listStyle: 'none' }}>{children}</ol>
);

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A breadcrumb shows where the current page sits in the site hierarchy and lets people ' +
          'jump back up to any level. Use it on pages two or more levels deep; it complements, ' +
          'not replaces, the main navigation.\n\n' +
          'The last item is the current page (plain text, marked "current page" for screen ' +
          'readers). Long trails collapse the middle into "…", which expands when pressed. The ' +
          'trail is a navigation landmark named "Breadcrumb".\n\n' +
          '`BreadcrumbItem` is the single Figma part, exported for custom layouts.',
      },
    },
  },
  args: { items: TRAIL.slice(0, 4), maxItems: 5 },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- The assembled trail --------------------------------------------------------------------

export const Default: Story = {};
export const TwoLevels: Story = { args: { items: TRAIL.slice(0, 2) } };
/** More items than `maxItems`: the middle collapses into "…" - press it to show them all. */
export const Collapsed: Story = { args: { items: TRAIL } };

// ---- The Figma part, every variant x state -----------------------------------------------------

const grid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 'var(--gap-lg) var(--gap-2xl)', alignItems: 'center' };

export const ItemVariants: Story = {
  render: () => (
    <div style={grid}>
      <span />
      {STATES.map((s) => (
        <strong key={s} className="paragraph-mini">{s}</strong>
      ))}
      {VARIANTS.map((variant) => (
        <div key={variant} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{variant}</strong>
          {STATES.map((state) => (
            <List key={state}>
              <BreadcrumbItem
                variant={variant}
                state={state}
                label={variant === 'Ellipsis' ? 'Show more breadcrumbs' : 'Components'}
                href="#components"
              />
            </List>
          ))}
        </div>
      ))}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

export const StructureIsAccessible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Breadcrumb' });
    const items = within(nav).getAllByRole('listitem');
    await expect(items).toHaveLength(4);

    // Earlier levels are links; the last is the current page, not a link
    await expect(canvas.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#home');
    await expect(canvas.queryByRole('link', { name: 'Components' })).not.toBeInTheDocument();
    await expect(canvas.getByText('Components')).toHaveAttribute('aria-current', 'page');
  },
};

export const EllipsisExpands: Story = {
  args: { items: TRAIL },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Collapsed: Home, …, Navigation, Breadcrumb
    await expect(canvas.queryByRole('link', { name: 'Projects' })).not.toBeInTheDocument();

    // The "…" is reachable with the keyboard and expands the trail
    await userEvent.tab(); // Home
    await userEvent.tab(); // …
    const ellipsis = canvas.getByRole('button', { name: 'Show 3 more breadcrumbs' });
    await expect(ellipsis).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    // The hidden levels appear, and focus lands on the first of them (not lost)
    await expect(canvas.getByRole('link', { name: 'Projects' })).toHaveFocus();
    await expect(canvas.queryByRole('button', { name: /more breadcrumbs/ })).not.toBeInTheDocument();
  },
};
