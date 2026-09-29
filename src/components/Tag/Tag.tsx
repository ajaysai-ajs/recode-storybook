import type { ReactNode } from 'react';

import './Tag.css';

/*
 * Tag - built from the Figma components "RDS Tag" (node 6226:6905) and
 * "RDS Tag Remove Button" (node 6224:6034).
 * A compact label for keywords, filters or selected items. Can be removable.
 */

export const TAG_COLORS = [
  'standard',
  'grey',
  'grey subtle',
  'blue',
  'blue subtle',
  'red',
  'red subtle',
  'yellow',
  'yellow subtle',
  'green',
  'green subtle',
  'teal',
  'teal subtle',
  'purple',
  'purple subtle',
  'magenta',
  'magenta subtle',
  'orange',
  'orange subtle',
  'lime',
  'lime subtle',
] as const;

export type TagColor = (typeof TAG_COLORS)[number];
export type TagAppearance = 'default' | 'rounded';
/** Only forces the look for previews; real tags get hover and press from the browser. */
export type TagState = 'Default' | 'Hover' | 'Press' | 'Focus';

export interface TagProps {
  /** Figma: tagText */
  tagText: string;
  /** Figma: appearance - `rounded` is a pill shape */
  appearance?: TagAppearance;
  /** Figma: color */
  color?: TagColor;
  /** Figma: state */
  state?: TagState;
  /** Figma: elemBefore - show a slot before the text (needs `elemBeforeIcon`) */
  elemBefore?: boolean;
  /** Figma: elemBeforeIcon - the icon or avatar to show before the text */
  elemBeforeIcon?: ReactNode;
  /** Figma: isRemovable - show the remove (x) button */
  isRemovable?: boolean;
  /** Called when the remove button is pressed */
  onRemove?: () => void;
  className?: string;
}

export function Tag({
  tagText,
  appearance = 'default',
  color = 'standard',
  state = 'Default',
  elemBefore = false,
  elemBeforeIcon,
  isRemovable = false,
  onRemove,
  className,
}: TagProps) {
  return (
    <span
      className={['rds-tag', className].filter(Boolean).join(' ')}
      data-appearance={appearance}
      data-color={color}
      data-state={state}
    >
      {elemBefore && elemBeforeIcon && (
        <span className="rds-tag__before" aria-hidden="true">
          {elemBeforeIcon}
        </span>
      )}
      <span className="rds-tag__text">{tagText}</span>
      {isRemovable && (
        // A real button so it can be reached with Tab and pressed with Enter/Space.
        // The name says which tag it removes, since "Remove" alone is unclear in a list.
        <button type="button" className="rds-tag__remove" aria-label={`Remove ${tagText}`} onClick={onRemove}>
          {/* Same "x" as the Figma remove button: two 1.5px strokes with round ends */}
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M4 4L12 12M12 4L4 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
