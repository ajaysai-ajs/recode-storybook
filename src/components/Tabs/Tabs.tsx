import { useId, useRef, useState, type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode, type Ref } from 'react';

import './Tabs.css';

/*
 * Tabs - built from the Figma components "Tabs Trigger" (node 6100:7880) and "Tabs List"
 * (node 6114:828) on the Tabs page.
 *
 * Follows the standard accessible tabs pattern (WAI-ARIA "Tabs"):
 *  - the row of tabs is ONE Tab stop; the arrow keys move between tabs and select them
 *  - Home / End jump to the first / last tab; disabled tabs are skipped
 *  - each tab is linked to its panel, so screen readers announce "tab, 2 of 4, selected"
 */

// ---- Tabs Trigger (the Figma part) ------------------------------------------------------------

/** `Disabled` changes behaviour; `Hover`, `Press` and `Focus` only force the look for previews. */
export type TabsTriggerState = 'Default' | 'Hover' | 'Press' | 'Focus' | 'Disabled';

export interface TabsTriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** The tab text. Figma has no property for it (every tab says "Tab"), but code needs one. */
  label: string;
  /** Figma: State */
  state?: TabsTriggerState;
  /** Figma: isSelected - the tab whose panel is showing (draws the blue underline) */
  isSelected?: boolean;
  /** Lets the parent move keyboard focus to this tab */
  ref?: Ref<HTMLButtonElement>;
}

export function TabsTrigger({ label, state = 'Default', isSelected = false, className, ...rest }: TabsTriggerProps) {
  return (
    <button
      type="button"
      role="tab"
      {...rest}
      className={['rds-tabs__trigger', className].filter(Boolean).join(' ')}
      data-state={state}
      aria-selected={isSelected}
      disabled={state === 'Disabled'}
    >
      {label}
    </button>
  );
}

// ---- Tabs (list + panels) -----------------------------------------------------------------------

export interface TabItem {
  /** A unique id for the tab */
  id: string;
  /** The tab text */
  label: string;
  /** What shows in the panel when this tab is selected */
  content: ReactNode;
  /** Figma: State=Disabled */
  disabled?: boolean;
}

export interface TabsProps {
  /** The tabs, in order */
  items: TabItem[];
  /** The selected tab's id, when your code controls it (use with `onChange`) */
  selectedId?: string;
  /** The tab selected at first, when the tabs manage themselves. Defaults to the first tab. */
  defaultSelectedId?: string;
  /** Called with the id of the tab that was picked */
  onChange?: (id: string) => void;
  /** What the set of tabs is about, for screen readers (e.g. "Account settings") */
  'aria-label': string;
  className?: string;
}

export function Tabs({ items, selectedId, defaultSelectedId, onChange, 'aria-label': ariaLabel, className }: TabsProps) {
  const baseId = useId();
  const firstEnabled = items.find((t) => !t.disabled)?.id;
  const [ownSelected, setOwnSelected] = useState(defaultSelectedId ?? firstEnabled);
  const current = selectedId ?? ownSelected; // controlled if selectedId is given

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (id: string) => {
    if (selectedId === undefined) setOwnSelected(id);
    onChange?.(id);
  };

  // Arrow keys move to the next/previous enabled tab (wrapping round) and select it.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = items.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i >= 0);
    const at = enabled.indexOf(items.findIndex((t) => t.id === current));
    const moves: Record<string, number | undefined> = {
      ArrowRight: enabled[(at + 1) % enabled.length],
      ArrowLeft: enabled[(at - 1 + enabled.length) % enabled.length],
      Home: enabled[0],
      End: enabled[enabled.length - 1],
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    select(items[target].id);
    tabRefs.current[target]?.focus();
  };

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  return (
    <div className={['rds-tabs', className].filter(Boolean).join(' ')}>
      <div className="rds-tabs__list" role="tablist" aria-label={ariaLabel} onKeyDown={onKeyDown}>
        {items.map((tab, index) => {
          const isSelected = tab.id === current;
          return (
            <TabsTrigger
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={tabId(tab.id)}
              label={tab.label}
              isSelected={isSelected}
              state={tab.disabled ? 'Disabled' : 'Default'}
              aria-controls={panelId(tab.id)}
              // Only the selected tab is in the Tab order; the arrow keys reach the rest
              tabIndex={isSelected ? 0 : -1}
              onClick={() => select(tab.id)}
            />
          );
        })}
      </div>

      {items.map((tab) => (
        <div
          key={tab.id}
          id={panelId(tab.id)}
          className="rds-tabs__panel"
          role="tabpanel"
          aria-labelledby={tabId(tab.id)}
          hidden={tab.id !== current}
          // Lets keyboard users Tab from the tabs into the panel even if it has no links
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
