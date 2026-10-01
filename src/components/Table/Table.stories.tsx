import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Badge, type BadgeAppearance } from '../Badge/Badge';
import {
  Sort,
  Table,
  TableCell,
  TableHeader,
  type SortOrder,
  type SortState,
  type TableCellContent,
  type TableColumn,
  type TableHeaderState,
} from './Table';

// ---- Sample data ------------------------------------------------------------------------------

interface Contract {
  id: string;
  client: string;
  renewed: string;
  status: 'Active' | 'Pending' | 'Expired' | 'Draft';
  value: number;
}

const CONTRACTS: Contract[] = [
  { id: 'CT-10482', client: 'Northwind Traders', renewed: 'Renewed 12 Mar', status: 'Active', value: 48000 },
  { id: 'CT-2091', client: 'Acme Ltd', renewed: 'Renewed 3 Jan', status: 'Pending', value: 12500 },
  { id: 'CT-7730', client: 'Globex', renewed: 'Renewed 28 Feb', status: 'Expired', value: 91000 },
  { id: 'CT-315', client: 'Initech', renewed: 'Not renewed', status: 'Draft', value: 7200 },
];

const STATUS_APPEARANCE: Record<Contract['status'], BadgeAppearance> = {
  Active: 'success',
  Pending: 'warning',
  Expired: 'danger',
  Draft: 'neutral',
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const COLUMNS: TableColumn<Contract>[] = [
  { key: 'id', label: 'Contract ID', isSortable: true },
  {
    key: 'client',
    label: 'Client',
    isSortable: true,
    cell: (row) => <TableCell content="Text and secondary" label={row.client} secondary={row.renewed} />,
  },
  {
    key: 'status',
    label: 'Status',
    cell: (row) => (
      <TableCell content="Badge" badges={<Badge label={row.status} appearance={STATUS_APPEARANCE[row.status]} showIcon={false} />} />
    ),
  },
  { key: 'value', label: 'Value', isSortable: true, cell: (row) => <TableCell label={money.format(row.value)} /> },
];

// ---- Meta -------------------------------------------------------------------------------------

const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A table shows structured data in rows and columns so people can scan, compare and ' +
          'sort it - contracts, invoices, users. Use it when every row has the same fields. ' +
          'For a few key/value pairs, or content people read rather than compare, use a list ' +
          'or cards instead.\n\n' +
          'Figma has the parts - **Table Header**, **Table Cell** and **Sort** - and `Table` ' +
          'puts them together. Click a sortable header (or focus it and press Enter) to sort: ' +
          'ascending, descending, then back to the original order. Turn on `isSelectable` for a ' +
          'column of checkboxes with "select all" in the header. Always give a `caption`: ' +
          'screen readers use it to tell tables apart. Wide tables can go inside a Scroll Area.',
      },
    },
  },
  args: {
    caption: 'Contracts',
    columns: COLUMNS,
    rows: CONTRACTS,
    getRowLabel: (row: Contract) => row.id,
    onSortChange: fn(),
    onSelectionChange: fn(),
  },
  argTypes: {
    columns: { control: false },
    rows: { control: false },
    getRowLabel: { control: false },
  },
} satisfies Meta<typeof Table<Contract>>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- Assembled table --------------------------------------------------------------------------

export const Default: Story = {};

export const Sorted: Story = { args: { defaultSort: { key: 'value', order: 'descending' } } };

export const Selectable: Story = { args: { isSelectable: true, defaultSelectedIds: ['CT-2091'] } };

export const HiddenCaption: Story = { args: { isCaptionHidden: true } };

// ---- The Figma parts --------------------------------------------------------------------------

/** Parts must sit inside a real table to be valid HTML, so the previews wrap them in one. */
function PartsTable({ label, children }: { label: string; children: ReactNode }) {
  return (
    <table className="rds-table" style={{ width: 'auto' }}>
      <caption className="rds-table__caption">{label}</caption>
      {children}
    </table>
  );
}

// Figma draws the parts 220px wide; there is no 220 size token, so the previews use 256.
const cellWidth: CSSProperties = { width: 'var(--size-256)' };

const HEADER_STATES: TableHeaderState[] = ['Default', 'Hover', 'Checkbox'];

export const HeaderStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <PartsTable label="Table Header states">
      <thead>
        <tr>
          {HEADER_STATES.map((state) => (
            <TableHeader
              key={state}
              style={state === 'Checkbox' ? undefined : cellWidth}
              state={state}
              label={state === 'Checkbox' ? 'Select all rows' : `Contract ID (${state})`}
              onSort={fn()}
            />
          ))}
          <TableHeader style={cellWidth} label="Not sortable" />
        </tr>
      </thead>
    </PartsTable>
  ),
};

const CONTENTS: TableCellContent[] = ['Text', 'Badge', 'Text and secondary', 'Checkbox'];

export const CellContents: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <PartsTable label="Table Cell contents">
      <tbody>
        {CONTENTS.map((content) => (
          <tr key={content}>
            <TableCell
              style={cellWidth}
              content={content}
              label="CT-10482"
              secondary="Renewed 12 Mar"
              badges={
                <>
                  <Badge label="Label" appearance="neutral" showIcon={false} />
                  <Badge label="Label" appearance="information" showIcon={false} />
                  <Badge label="Label" appearance="discovery" showIcon={false} />
                </>
              }
            />
            <TableCell className="paragraph-mini" label={content} />
          </tr>
        ))}
      </tbody>
    </PartsTable>
  ),
};

const ORDERS: SortOrder[] = ['Default', 'ascending', 'descending'];
const SORT_STATES: SortState[] = ['Default', 'Focus'];

export const SortStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: 'var(--gap-lg) var(--gap-xl)', alignItems: 'center' }}>
      <span />
      {ORDERS.map((order) => (
        <strong key={order} className="paragraph-mini">{order}</strong>
      ))}
      {SORT_STATES.map((state) => (
        <div key={state} style={{ display: 'contents' }}>
          <strong className="paragraph-mini">{state}</strong>
          {ORDERS.map((order) => (
            <Sort key={order} sortOrder={order} state={state} />
          ))}
        </div>
      ))}
    </div>
  ),
};

// ---- Behaviour tests --------------------------------------------------------------------------

/** The Contract ID of each body row, top to bottom */
function rowIds(canvasElement: HTMLElement) {
  return [...canvasElement.querySelectorAll('tbody tr')].map((row) => row.querySelector('td')?.textContent);
}

export const SortingByClickAndKeyboard: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('table', { name: 'Contracts' })).toBeInTheDocument();

    const header = canvas.getByRole('columnheader', { name: 'Contract ID' });
    const button = within(header).getByRole('button', { name: 'Contract ID' });
    await expect(header).not.toHaveAttribute('aria-sort');

    // Click: ascending, and "CT-315" comes before "CT-2091" (numbers inside text sort as numbers)
    await userEvent.click(button);
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(rowIds(canvasElement)).toEqual(['CT-315', 'CT-2091', 'CT-7730', 'CT-10482']);
    await expect(args.onSortChange).toHaveBeenLastCalledWith({ key: 'id', order: 'ascending' });

    // Enter on the focused header: descending
    await userEvent.keyboard('{Enter}');
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect(rowIds(canvasElement)).toEqual(['CT-10482', 'CT-7730', 'CT-2091', 'CT-315']);

    // Space: back to the original order
    await userEvent.keyboard(' ');
    await expect(header).not.toHaveAttribute('aria-sort');
    await expect(rowIds(canvasElement)).toEqual(CONTRACTS.map((c) => c.id));

    // Sorting another column moves aria-sort to it
    const value = canvas.getByRole('columnheader', { name: 'Value' });
    await userEvent.click(within(value).getByRole('button'));
    await expect(value).toHaveAttribute('aria-sort', 'ascending');
    await expect(rowIds(canvasElement)[0]).toBe('CT-315');

    // Columns that can't be sorted have no button
    await expect(within(canvas.getByRole('columnheader', { name: 'Status' })).queryByRole('button')).toBeNull();
  },
};

export const SelectingRows: Story = {
  args: { isSelectable: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole('checkbox', { name: 'Select all rows' });
    const first = canvas.getByRole('checkbox', { name: 'Select CT-10482' });

    // One row: "select all" shows the dash (some selected)
    await userEvent.click(first);
    await expect(first).toBeChecked();
    await expect(first.closest('tr')).toHaveAttribute('data-selected');
    await expect((selectAll as HTMLInputElement).indeterminate).toBe(true);
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith(['CT-10482']);

    // Select all, then clear all
    await userEvent.click(selectAll);
    await expect(canvas.getAllByRole('checkbox', { name: /^Select CT-/ }).every((box) => (box as HTMLInputElement).checked)).toBe(true);
    await expect(selectAll).toBeChecked();
    await userEvent.click(selectAll);
    await expect(first).not.toBeChecked();
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith([]);

    // Space on a focused row checkbox toggles it
    first.focus();
    await userEvent.keyboard(' ');
    await expect(first).toBeChecked();
  },
};
