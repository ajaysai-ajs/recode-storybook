import { useEffect, useId, useRef, useState, type KeyboardEvent, type ToggleEvent } from 'react';

import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import './SplitButton.css';

/*
 * Split Button - built from the Figma components "Split button" (node 6452:14524),
 * "Split button trigger" (6452:13887) and "Split button divider" (6452:13795).
 *
 * A main action (a real Button) with an attached trigger that opens a menu of related
 * actions. The menu follows the accessible "menu button" pattern:
 *   Enter / Space / Down arrow open it (Up arrow opens it on the last item)
 *   Up / Down move between items, Home / End jump to the ends
 *   Enter picks an item, Escape or Tab closes it; focus then returns to the trigger
 */

/** Figma: appearance - `default` uses the Secondary button look, `primary` the Primary one */
export type SplitButtonAppearance = 'default' | 'primary';
export type SplitButtonSize = 'sm' | 'md';
/** Figma: placement - which edge the menu lines up with */
export type SplitButtonPlacement = 'bottom-start' | 'bottom-end';

export interface SplitButtonItem {
  label: string;
  onSelect: () => void;
  isDisabled?: boolean;
  /** Shows the item in the destructive colour, e.g. "Delete" */
  isDestructive?: boolean;
}

export interface SplitButtonProps {
  /** The main action's text (the Button half) */
  label: string;
  /** What the main action does */
  onClick?: () => void;
  /**
   * The related actions in the menu. Figma only has an empty "Slot" here, so the menu is
   * built from the `menu/*` tokens.
   */
  items: SplitButtonItem[];
  /** Figma: appearance */
  appearance?: SplitButtonAppearance;
  /** Figma: Size */
  size?: SplitButtonSize;
  /** Figma: isOpen - open the menu straight away (for previews) */
  isOpen?: boolean;
  /** Figma: isDisabled - disables both halves */
  isDisabled?: boolean;
  /** Figma: placement */
  placement?: SplitButtonPlacement;
  /** Name of the trigger for screen readers */
  triggerLabel?: string;
  className?: string;
}

export function SplitButton({
  label,
  onClick,
  items,
  appearance = 'default',
  size = 'md',
  isOpen = false,
  isDisabled = false,
  placement = 'bottom-start',
  triggerLabel = 'More options',
  className,
}: SplitButtonProps) {
  const menuId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // Which item gets focus when the menu opens: the first one (click, Enter, Space, Down),
  // the last one (Up), or none (the forced isOpen preview)
  const focusOnOpen = useRef<'first' | 'last' | null>('first');

  const enabledItems = () => [...(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])];

  // Place the menu under the button. It lives in the top layer, so it is positioned against
  // the window using the button group's current position on screen.
  const place = () => {
    const group = groupRef.current?.getBoundingClientRect();
    const menu = menuRef.current;
    if (!group || !menu) return;
    menu.style.top = `${group.bottom}px`;
    if (placement === 'bottom-end') {
      menu.style.left = 'auto';
      menu.style.right = `${document.documentElement.clientWidth - group.right}px`;
    } else {
      menu.style.left = `${group.left}px`;
      menu.style.right = 'auto';
    }
  };

  const openMenu = (focus: 'first' | 'last' | null) => {
    focusOnOpen.current = focus;
    if (!menuRef.current?.matches(':popover-open')) menuRef.current?.showPopover();
  };
  const closeMenu = () => {
    menuRef.current?.hidePopover();
    triggerRef.current?.focus();
  };

  const onToggle = (event: ToggleEvent<HTMLDivElement>) => {
    const nowOpen = event.newState === 'open';
    setOpen(nowOpen);
    if (nowOpen) place();
    else focusOnOpen.current = 'first'; // reset for the next time it opens
  };

  // Once open, move focus into the menu (first or last item)
  useEffect(() => {
    if (!open || !focusOnOpen.current) return;
    const list = enabledItems();
    (focusOnOpen.current === 'last' ? list[list.length - 1] : list[0])?.focus();
  }, [open]);

  // Keep the menu attached while the page scrolls or resizes
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  // The forced isOpen (for previews) opens the menu on first render
  useEffect(() => {
    if (isOpen && !isDisabled) openMenu(null);
  }, [isOpen, isDisabled]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(event.key === 'ArrowUp' ? 'last' : 'first');
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = enabledItems();
    const at = list.indexOf(document.activeElement as HTMLButtonElement);
    const moves: Record<string, number> = {
      ArrowDown: (at + 1) % list.length,
      ArrowUp: (at - 1 + list.length) % list.length,
      Home: 0,
      End: list.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      list[moves[event.key]]?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    } else if (event.key === 'Tab') {
      menuRef.current?.hidePopover(); // Tab closes the menu and moves on as normal
    }
  };

  const buttonVariant = appearance === 'primary' ? 'Primary' : 'Secondary';

  return (
    <div className={['rds-split-button', className].filter(Boolean).join(' ')} data-appearance={appearance} data-size={size}>
      <div ref={groupRef} className="rds-split-button__group" data-disabled={isDisabled || undefined}>
        {/* <PrimaryAction>: the finished Button, with its right corners squared by the CSS */}
        <Button
          className="rds-split-button__action"
          label={label}
          variant={buttonVariant}
          size={size}
          state={isDisabled ? 'Disabled' : 'Default'}
          onClick={onClick}
        />
        <span className="rds-split-button__divider" aria-hidden="true" />
        {/* <SecondaryAction>: opens the menu */}
        <button
          ref={triggerRef}
          type="button"
          className="rds-split-button__trigger"
          data-state={open ? 'selected' : 'default'}
          disabled={isDisabled}
          aria-label={triggerLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          // popoverTarget lets the browser open and close the menu on click (including
          // closing it when you click the trigger again or anywhere outside)
          popoverTarget={menuId}
          onKeyDown={onTriggerKeyDown}
        >
          <Icon icon="arrow_drop_down" />
        </button>
      </div>

      {/* The dropdown menu, shown in the browser's popover layer (always on top) */}
      <div
        ref={menuRef}
        id={menuId}
        className="rds-split-button__menu"
        popover="auto"
        role="menu"
        aria-label={triggerLabel}
        onToggle={onToggle}
        onKeyDown={onMenuKeyDown}
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className="rds-split-button__item"
            data-destructive={item.isDestructive || undefined}
            // Disabled items stay visible (so people know the option exists) but can't be used
            aria-disabled={item.isDisabled || undefined}
            tabIndex={-1}
            onClick={() => {
              if (item.isDisabled) return;
              item.onSelect();
              closeMenu();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
