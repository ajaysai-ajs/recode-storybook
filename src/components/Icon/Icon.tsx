import type { SVGProps } from 'react';

import { RDS_ICONS, type RdsIconName } from './icons';
import './Icon.css';

/*
 * Icon - built from the Figma component "RDS Icon" (node 6341:6385).
 * Size comes from --icon-size and colour from --icon-fg. To change them for one use,
 * set those variables (or `color`) on the icon or on a parent.
 */

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Figma: icon */
  icon: RdsIconName;
  /**
   * Text for screen readers. Leave it out when the icon is decoration next to visible text
   * (the icon is then hidden from screen readers); set it when the icon is the only content.
   */
  label?: string;
}

export function Icon({ icon, label, className, ...rest }: IconProps) {
  return (
    <svg
      {...rest}
      className={['rds-icon', className].filter(Boolean).join(' ')}
      viewBox="0 0 24 24"
      focusable="false"
      // Meaningful icons are announced as an image with a name; decorative ones are skipped.
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={RDS_ICONS[icon]} />
    </svg>
  );
}
