import { useMemo, useState, type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes } from 'react';

import { Checkbox } from '../Checkbox/Checkbox';
import './Table.css';

/*
 * Table - built from the Figma components on the Table page:
 *   "Sort"         (node 6122:26785) - the up/down sort arrows
 *   "Table Header" (node 6126:26771) - a column header cell
 *   "Table Cell"   (node 6126:26772) - a body cell
 * Figma has no assembled table, so <Table> below puts the parts together: a real HTML
 * <table> (screen readers can move by row and column), sortable columns and row selection.
 */

// ---- Sort -----------------------------------------------------------------------------------

export type SortOrder = 'Default' | 'ascending' | 'descending';
/** Only forces the look for previews. In a table the header button shows the focus ring. */
export type SortState = 'Default' | 'Focus';

export interface SortProps {
  /** Figma: sortOrder - which arrow is dark. Default = not sorted, both arrows light. */
  sortOrder?: SortOrder;
  /** Figma: State */
  state?: SortState;
}

/** The two small arrows. Decorative: the header tells screen readers the order with aria-sort. */
export function Sort({ sortOrder = 'Default', state = 'Default' }: SortProps) {
  return (
    <span className="rds-table-sort" data-sort-order={sortOrder} data-state={state} aria-hidden="true">
      {/* Two 6x3 triangles, as drawn in Figma */}
      <svg viewBox="0 0 16 16" focusable="false">
        <path className="rds-table-sort__up" d="M5 7 8 4l3 3Z" />
        <path className="rds-table-sort__down" d="M5 9 8 12l3-3Z" />
      </svg>
    </span>
  );
}

// ---- Table Header ---------------------------------------------------------------------------

/**
 * Figma: State. `Hover` only forces the look for previews. `Checkbox` is really a different
 * kind of header: a "select all rows" checkbox instead of the label.
 */
export type TableHeaderState = 'Default' | 'Hover' | 'Checkbox';

export interface TableHeaderProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'onChange'> {
  /** Figma: Label. For the Checkbox state it becomes the checkbox's name for screen readers. */
  label: string;
  /** Figma: State */
  state?: TableHeaderState;
  /** Which way this column is sorted (Figma: the nested Sort's sortOrder). */
  sortOrder?: SortOrder;
  /**
   * Makes the header a sort button and shows the Sort arrows. Leave it out for columns that
   * can't be sorted.
   */
  onSort?: () => void;
  /** Checkbox state: all rows selected */
  isChecked?: boolean;
  /** Checkbox state: some rows selected */
  isIndeterminate?: boolean;
  /** Checkbox state: called when the checkbox is clicked */
  onCheckedChange?: (checked: boolean) => void;
}

export function TableHeader({
  label,
  state = 'Default',
  sortOrder = 'Default',
  onSort,
  isChecked = false,
  isIndeterminate = false,
  onCheckedChange,
  className,
  ...rest
}: TableHeaderProps) {
  const classes = ['rds-table__header', className].filter(Boolean).join(' ');

  if (state === 'Checkbox') {
    return (
      <th {...rest} scope="col" className={classes} data-state="Checkbox">
        <Checkbox
          aria-label={label}
          isChecked={isChecked}
          isIndeterminate={isIndeterminate}
          onChange={(event) => onCheckedChange?.(event.target.checked)}
        />
      </th>
    );
  }

  const isSortable = Boolean(onSort);
  return (
    <th
      {...rest}
      scope="col"
      className={classes}
      data-state={state}
      data-sortable={isSortable || undefined}
      // Tells screen readers how the column is sorted. Only set on the sorted column.
      aria-sort={sortOrder === 'Default' ? undefined : sortOrder}
    >
      {isSortable ? (
        // The whole header is the button, so it is easy to click. Enter or Space sorts.
        <button type="button" className="rds-table__sort-button" onClick={onSort}>
          <span className="rds-table__header-label">{label}</span>
          <Sort sortOrder={sortOrder} />
        </button>
      ) : (
        <span className="rds-table__header-label">{label}</span>
      )}
    </th>
  );
}

// ---- Table Cell -----------------------------------------------------------------------------

/** Figma: Content */
export type TableCellContent = 'Text' | 'Badge' | 'Text and secondary' | 'Checkbox';

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'onChange'> {
  /** Figma: Label - the cell's value */
  label?: string;
  /** Figma: Secondary - a muted second line (Text and secondary, Checkbox) */
  secondary?: string;
  /** Figma: Content */
  content?: TableCellContent;
  /** Badge content: the badges to show, e.g. <Badge label="Active" appearance="success" /> */
  badges?: ReactNode;
  /** Checkbox content: is the row selected */
  isChecked?: boolean;
  /** Checkbox content: called when the checkbox is clicked */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Checkbox content: the checkbox's name for screen readers. Defaults to "Select <label>".
   * Needed when the cell shows the checkbox on its own.
   */
  checkboxLabel?: string;
}

export function TableCell({
  label,
  secondary,
  content = 'Text',
  badges,
  isChecked = false,
  onCheckedChange,
  checkboxLabel,
  className,
  children,
  ...rest
}: TableCellProps) {
  // The label and the optional muted line under it
  const text =
    label || secondary ? (
      <span className="rds-table__cell-text">
        {label && <span className="rds-table__cell-label">{label}</span>}
        {secondary && content !== 'Text' && <span className="rds-table__cell-secondary">{secondary}</span>}
      </span>
    ) : null;

  let body: ReactNode = children;
  if (children === undefined) {
    if (content === 'Badge') body = <span className="rds-table__cell-badges">{badges}</span>;
    else if (content === 'Checkbox')
      body = (
        <span className="rds-table__cell-checkbox">
          <Checkbox
            aria-label={checkboxLabel ?? `Select ${label ?? 'row'}`}
            isChecked={isChecked}
            onChange={(event) => onCheckedChange?.(event.target.checked)}
          />
          {text}
        </span>
      );
    else body = text;
  }

  return (
    <td {...rest} className={['rds-table__cell', className].filter(Boolean).join(' ')} data-content={content}>
      {body}
    </td>
  );
}

// ---- Table (assembled) ----------------------------------------------------------------------

export interface TableColumn<Row> {
  /** A unique name for the column (also the default sort key) */
  key: string;
  /** The header label */
  label: string;
  /** Can people sort by this column? */
  isSortable?: boolean;
  /** The value to sort by. Defaults to row[key]. */
  sortValue?(row: Row): string | number;
  /** What to show in the cell - usually a <TableCell>. Defaults to a Text cell with row[key]. */
  cell?(row: Row): ReactNode;
}

export interface TableSort {
  key: string;
  order: SortOrder;
}

export interface TableProps<Row extends { id: string }> {
  /** Describes the table for screen readers (and on screen, unless isCaptionHidden) */
  caption: string;
  /** Hide the caption visually; screen readers still read it */
  isCaptionHidden?: boolean;
  columns: TableColumn<Row>[];
  rows: Row[];
  /** Which column is sorted when the table first shows */
  defaultSort?: TableSort;
  /** Called when someone sorts a column */
  onSortChange?: (sort: TableSort) => void;
  /** Adds a first column of checkboxes to select rows, with "select all" in the header */
  isSelectable?: boolean;
  /** The ids of the rows selected when the table first shows */
  defaultSelectedIds?: string[];
  /** Called with the ids of the selected rows whenever the selection changes */
  onSelectionChange?: (ids: string[]) => void;
  /** Used for each row's checkbox name, e.g. row => row.name gives "Select Acme Ltd" */
  getRowLabel?: (row: Row) => string;
  className?: string;
}

// Clicking a header steps through: not sorted -> ascending -> descending -> not sorted
const NEXT_ORDER: Record<SortOrder, SortOrder> = {
  Default: 'ascending',
  ascending: 'descending',
  descending: 'Default',
};

function readValue<Row>(row: Row, column: TableColumn<Row>): string | number {
  if (column.sortValue) return column.sortValue(row);
  const value = (row as Record<string, unknown>)[column.key];
  return typeof value === 'number' ? value : String(value ?? '');
}

export function Table<Row extends { id: string }>({
  caption,
  isCaptionHidden = false,
  columns,
  rows,
  defaultSort,
  onSortChange,
  isSelectable = false,
  defaultSelectedIds = [],
  onSelectionChange,
  getRowLabel = (row) => row.id,
  className,
}: TableProps<Row>) {
  const [sort, setSort] = useState<TableSort | undefined>(defaultSort);
  const [selected, setSelected] = useState(() => new Set(defaultSelectedIds));

  // The rows in display order. The original array is never changed.
  const sortedRows = useMemo(() => {
    const column = columns.find((c) => c.key === sort?.key);
    if (!sort || !column || sort.order === 'Default') return rows;
    const direction = sort.order === 'ascending' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = readValue(a, column);
      const y = readValue(b, column);
      // Numbers compare as numbers; text compares so that "CT-2" comes before "CT-10"
      const result =
        typeof x === 'number' && typeof y === 'number'
          ? x - y
          : String(x).localeCompare(String(y), undefined, { numeric: true });
      return result * direction;
    });
  }, [rows, columns, sort]);

  const sortBy = (key: string) => {
    const order = NEXT_ORDER[sort?.key === key ? sort.order : 'Default'];
    const next = { key, order };
    setSort(next);
    onSortChange?.(next);
  };

  const updateSelection = (next: Set<string>) => {
    setSelected(next);
    onSelectionChange?.([...next]);
  };

  const toggleRow = (id: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    updateSelection(next);
  };

  const selectedCount = rows.filter((row) => selected.has(row.id)).length;
  const allSelected = rows.length > 0 && selectedCount === rows.length;

  return (
    <table className={['rds-table', className].filter(Boolean).join(' ')}>
      <caption className="rds-table__caption" data-hidden={isCaptionHidden || undefined}>
        {caption}
      </caption>
      <thead>
        <tr>
          {isSelectable && (
            <TableHeader
              className="rds-table__select"
              state="Checkbox"
              label="Select all rows"
              isChecked={allSelected}
              isIndeterminate={selectedCount > 0 && !allSelected}
              onCheckedChange={(checked) => updateSelection(checked ? new Set(rows.map((r) => r.id)) : new Set())}
            />
          )}
          {columns.map((column) => (
            <TableHeader
              key={column.key}
              label={column.label}
              sortOrder={sort?.key === column.key ? sort.order : 'Default'}
              onSort={column.isSortable ? () => sortBy(column.key) : undefined}
            />
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row) => {
          const isSelected = selected.has(row.id);
          return (
            <tr key={row.id} className="rds-table__row" data-selected={isSelected || undefined}>
              {isSelectable && (
                <TableCell
                  className="rds-table__select"
                  content="Checkbox"
                  checkboxLabel={`Select ${getRowLabel(row)}`}
                  isChecked={isSelected}
                  onCheckedChange={(checked) => toggleRow(row.id, checked)}
                />
              )}
              {columns.map((column) => (
                <ColumnCell key={column.key} row={row} column={column} />
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Renders one column's cell for a row (the column's own cell, or a plain Text cell). */
function ColumnCell<Row>({ row, column }: { row: Row; column: TableColumn<Row> }) {
  if (column.cell) return <>{column.cell(row)}</>;
  return <TableCell label={String(readValue(row, column))} />;
}
