import { useEffect, useId, useState, type ReactNode } from 'react';

import './Alert.css';

/*
 * Alert - built from the Figma component "Alert" (Alert page, node 3815:597), a "flag":
 *   default  - white surface, dismissible with the close (x) button
 *   success / destructive / warning / info - filled, and expand/collapse with the chevron
 * isOpen shows the description and actions.
 */

export type AlertAppearance = 'default' | 'success' | 'destructive' | 'warning' | 'info';

export interface AlertProps {
  /** Figma: Title */
  title: string;
  /** Figma: Description */
  description?: string;
  /** Figma: Show description */
  showDescription?: boolean;
  /** Figma: Show icon */
  showIcon?: boolean;
  /** Figma: appearance */
  appearance?: AlertAppearance;
  /**
   * Figma: isOpen - show the description and actions. Status alerts can be opened and closed
   * with the chevron; this sets where they start.
   */
  isOpen?: boolean;
  /** Called when a status alert is expanded or collapsed */
  onOpenChange?: (isOpen: boolean) => void;
  /** Called when the close (x) button of a default alert is pressed */
  onDismiss?: () => void;
  /** Links or buttons shown under the description when open (Figma: the actions row) */
  actions?: ReactNode;
  /**
   * The icon before the title. Defaults to the status icon for the appearance (from the
   * Figma "Component 1" icon set): info, check_circle or warning.
   */
  icon?: ReactNode;
  className?: string;
}

export function Alert({
  title,
  description,
  showDescription = true,
  showIcon = true,
  appearance = 'default',
  isOpen = false,
  onOpenChange,
  onDismiss,
  actions,
  icon,
  className,
}: AlertProps) {
  const bodyId = useId();
  const [open, setOpen] = useState(isOpen);
  useEffect(() => setOpen(isOpen), [isOpen]); // follow the prop if it changes

  const isStatus = appearance !== 'default';
  // A default alert has no toggle, so it shows its details whenever isOpen is set
  const showBody = (isStatus ? open : isOpen) && ((showDescription && description) || actions);

  const toggle = () => {
    setOpen(!open);
    onOpenChange?.(!open);
  };

  return (
    <div
      className={['rds-alert', className].filter(Boolean).join(' ')}
      data-appearance={appearance}
      // Urgent alerts interrupt screen readers; the others wait for a pause
      role={appearance === 'destructive' || appearance === 'warning' ? 'alert' : 'status'}
    >
      {showIcon && (
        <span className="rds-alert__icon" aria-hidden="true">
          {icon ?? <StatusIcon appearance={appearance} />}
        </span>
      )}

      <div className="rds-alert__content">
        <div className="rds-alert__header">
          <p className="rds-alert__title">{title}</p>

          {isStatus ? (
            // Status alerts: the chevron shows or hides the details
            <button
              type="button"
              className="rds-alert__button"
              aria-label={open ? 'Show less' : 'Show more'}
              aria-expanded={open}
              aria-controls={bodyId}
              onClick={toggle}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M4.94 5.53L8 8.58333L11.06 5.53L12 6.47L8 10.47L4 6.47L4.94 5.53Z" />
              </svg>
            </button>
          ) : (
            // Default alerts: the x dismisses it
            onDismiss && (
              <button type="button" className="rds-alert__button" aria-label="Dismiss" onClick={onDismiss}>
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path d="M12.6667 4.27333L11.7267 3.33333L8 7.06L4.27333 3.33333L3.33333 4.27333L7.06 8L3.33333 11.7267L4.27333 12.6667L8 8.94L11.7267 12.6667L12.6667 11.7267L8.94 8L12.6667 4.27333Z" />
                </svg>
              </button>
            )
          )}
        </div>

        <div id={bodyId} className="rds-alert__body" hidden={!showBody}>
          {showDescription && description && <p className="rds-alert__description">{description}</p>}
          {actions && <div className="rds-alert__actions">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

/** The Figma status icons (Material info / check_circle / warning), drawn in the text colour. */
function StatusIcon({ appearance }: { appearance: AlertAppearance }) {
  if (appearance === 'success') {
    return (
      <svg viewBox="0 0 16 16" focusable="false">
        <path d="M8 1.33333C4.32 1.33333 1.33333 4.32 1.33333 8C1.33333 11.68 4.32 14.6667 8 14.6667C11.68 14.6667 14.6667 11.68 14.6667 8C14.6667 4.32 11.68 1.33333 8 1.33333ZM6.66667 11.3333L3.33333 8L4.27333 7.06L6.66667 9.44667L11.7267 4.38667L12.6667 5.33333L6.66667 11.3333Z" />
      </svg>
    );
  }
  if (appearance === 'destructive' || appearance === 'warning') {
    return (
      <svg viewBox="0 0 16 16" focusable="false">
        <path d="M0.666667 14.3333H15.3333L8 1.66667L0.666667 14.3333ZM8.66667 12.3333H7.33333V11H8.66667V12.3333ZM8.66667 9.66667H7.33333V7H8.66667V9.66667Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" focusable="false">
      <path d="M10 1.66667C5.4 1.66667 1.66667 5.4 1.66667 10C1.66667 14.6 5.4 18.3333 10 18.3333C14.6 18.3333 18.3333 14.6 18.3333 10C18.3333 5.4 14.6 1.66667 10 1.66667ZM10.8333 14.1667H9.16667V9.16667H10.8333V14.1667ZM10.8333 7.5H9.16667V5.83333H10.8333V7.5Z" />
    </svg>
  );
}
