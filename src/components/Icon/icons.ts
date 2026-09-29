/*
 * Path data for the icons in the Figma "RDS Icon" set (Tag page, node 6341:6385).
 * Figma redrew these from Material Design Icons on a 24x24 grid, so every path here uses
 * a 0 0 24 24 viewBox. Copied exactly from the Figma export.
 */
export const RDS_ICONS = {
  check: 'M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z',
  remove: 'M19 13H5V11H19V13Z',
  clear:
    'M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z',
  expand_more: 'M16.59 8.59L12 13.17L7.41 8.59L6 10L12 16L18 10L16.59 8.59Z',
  expand_less: 'M12 8L6 14L7.41 15.41L12 10.83L16.59 15.41L18 14L12 8Z',
  chevron_left: 'M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z',
  chevron_right: 'M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z',
  arrow_drop_down: 'M7 10L12 15L17 10H7Z',
  arrow_drop_up: 'M7 14L12 9L17 14H7Z',
  unfold_more:
    'M12 5.83L15.17 9L16.58 7.59L12 3L7.41 7.59L8.83 9L12 5.83ZM12 18.17L8.83 15L7.42 16.41L12 21L16.59 16.41L15.17 15L12 18.17Z',
} as const;

export type RdsIconName = keyof typeof RDS_ICONS;

/*
 * Glyphs used inside other Figma components that are not part of the RDS Icon set.
 * Each lists its own viewBox because Figma exported them at different sizes.
 */
export const EXTRA_GLYPHS = {
  /** Link, target=_blank. Material "open_in_new", exported at 14x14. */
  open_in_new: {
    viewBox: '0 0 14 14',
    d: 'M11.0833 11.0833H2.91667V2.91667H7V1.75H2.91667C2.26917 1.75 1.75 2.275 1.75 2.91667V11.0833C1.75 11.725 2.26917 12.25 2.91667 12.25H11.0833C11.725 12.25 12.25 11.725 12.25 11.0833V7H11.0833V11.0833ZM8.16667 1.75V2.91667H10.2608L4.52667 8.65083L5.34917 9.47333L11.0833 3.73917V5.83333H12.25V1.75H8.16667Z',
  },
  /** The generic placeholder glyph Figma puts in empty icon slots (Button, Icon Button…). */
  placeholder: {
    viewBox: '0 0 16 16',
    d: 'M9.33333 8L8 9.33333L6.66667 8L8 6.66667L9.33333 8ZM8 4L9.41333 5.41333L11.08 3.74667L8 0.666667L4.92 3.74667L6.58667 5.41333L8 4ZM4 8L5.41333 6.58667L3.74667 4.92L0.666667 8L3.74667 11.08L5.41333 9.41333L4 8ZM12 8L10.5867 9.41333L12.2533 11.08L15.3333 8L12.2533 4.92L10.5867 6.58667L12 8ZM8 12L6.58667 10.5867L4.92 12.2533L8 15.3333L11.08 12.2533L9.41333 10.5867L8 12Z',
  },
} as const;
