import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';

import { Button } from '../Button/Button';
import './AlertDialog.css';

/*
 * Alert Dialog - built from the Figma component "Alert dialog" (Alert Dialog page, node
 * 6438:797) and its parts: "Dialog header" (6330:1569), "Dialog footer" (6330:1622),
 * "Dialog close" (6333:1807) and the "Dialog body" examples.
 *
 * It is a real <dialog> opened with showModal(), so the browser does the hard parts: it sits
 * above everything, the page behind can't be clicked or tabbed to, and Tab stays inside.
 * role="alertdialog" tells screen readers it needs a response.
 */

export type AlertDialogAppearance = 'default' | 'warning' | 'danger';
export type AlertDialogSize = 'small' | 'medium' | 'large' | 'x-large' | 'full-screen';

export interface AlertDialogProps {
  /** Figma: Title (in Dialog header) */
  title: string;
  /** Figma: the body slot - the message. Plain text, or paragraphs (<p>) for longer messages. */
  children?: ReactNode;
  /** Figma: appearance - adds the status icon; danger also makes Confirm destructive (red) */
  appearance?: AlertDialogAppearance;
  /** Figma: size - the width. full-screen fills the window. */
  size?: AlertDialogSize;
  /** Figma: showBody */
  showBody?: boolean;
  /** Figma: showFooter */
  showFooter?: boolean;
  /** Figma: hasCloseButton (in Dialog header) */
  hasCloseButton?: boolean;
  /** Is the dialog open? Your code controls this. */
  isOpen?: boolean;
  /** Called when the person closes it: Cancel, the close (x) button, or Escape */
  onClose?: () => void;
  /** Called when the person presses Confirm */
  onConfirm?: () => void;
  /** Text of the confirm button - say what it does, e.g. "Delete" */
  confirmLabel?: string;
  /** Text of the cancel button */
  cancelLabel?: string;
  /**
   * Show the dialog in the page instead of on top of it, like on the Figma canvas. Only for
   * docs and previews - real dialogs should always be modal.
   */
  isModal?: boolean;
  className?: string;
}

export function AlertDialog({
  title,
  children,
  appearance = 'default',
  size = 'small',
  showBody = true,
  showFooter = true,
  hasCloseButton = true,
  isOpen = false,
  onClose,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isModal = true,
  className,
}: AlertDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();
  const hasBody = showBody && children != null;

  // Open and close the real dialog when isOpen changes
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isModal) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      // Start on the safest choice (Cancel), so pressing Enter by accident does no harm
      cancelRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close(); // the browser puts focus back where it was before opening
    }
  }, [isOpen, isModal]);

  // Close it properly if it is removed from the page while open
  useEffect(() => () => dialogRef.current?.close(), []);

  // Escape: let your code decide (it sets isOpen to false), instead of the browser closing it.
  // We catch the key ourselves, and also the browser's own "cancel" (e.g. the Android back
  // gesture), which fires when a real Escape isn't handled here.
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose?.();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape' && isModal) handleCancel(event);
  };

  // A long message scrolls. A scrolling area must be reachable with the keyboard, so it
  // becomes focusable only while it actually scrolls.
  const [bodyScrolls, setBodyScrolls] = useState(false);
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const check = () => setBodyScrolls(body.scrollHeight > body.clientHeight);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(body);
    return () => observer.disconnect();
  }, [hasBody, isOpen]);

  const dialog = (
    <dialog
      ref={dialogRef}
      className={['rds-alert-dialog', className].filter(Boolean).join(' ')}
      data-appearance={appearance}
      data-size={size}
      role="alertdialog"
      aria-modal={isModal || undefined}
      aria-labelledby={titleId}
      aria-describedby={hasBody ? bodyId : undefined}
      // In a preview it is simply shown; a modal one is opened by showModal() above
      open={isModal ? undefined : true}
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
    >
      {/* ---- Dialog header ---- */}
      <div className="rds-alert-dialog__header">
        <div className="rds-alert-dialog__title-row">
          {appearance !== 'default' && <StatusIcon appearance={appearance} />}
          <h2 id={titleId} className="rds-alert-dialog__title">
            {/* The icon is only visual, so screen readers hear the status as a word instead */}
            {appearance !== 'default' && (
              <span className="rds-alert-dialog__status">{appearance === 'warning' ? 'Warning: ' : 'Danger: '}</span>
            )}
            {title}
          </h2>
        </div>
        {hasCloseButton && <DialogClose onClick={onClose} />}
      </div>

      {/* ---- Dialog body ---- */}
      {hasBody && (
        <div
          ref={bodyRef}
          id={bodyId}
          className="rds-alert-dialog__body"
          tabIndex={bodyScrolls ? 0 : undefined}
        >
          {typeof children === 'string' ? <p>{children}</p> : children}
        </div>
      )}

      {/* ---- Dialog footer: Cancel and Confirm on the right ---- */}
      {showFooter && (
        <div className="rds-alert-dialog__footer">
          <Button ref={cancelRef} variant="Outline" label={cancelLabel} onClick={onClose} />
          <Button
            variant={appearance === 'danger' ? 'Destructive' : 'Primary'}
            label={confirmLabel}
            onClick={onConfirm}
          />
        </div>
      )}
    </dialog>
  );

  // A preview sits on its own dimmed panel, like the Figma frame
  return isModal ? dialog : <div className="rds-alert-dialog-preview" data-size={size}>{dialog}</div>;
}

// ---- Dialog close ---------------------------------------------------------------------------

/** Only forces the look for previews; real buttons get these from the browser. */
export type DialogCloseState = 'default' | 'hover' | 'press' | 'focus';

export interface DialogCloseProps {
  /** Figma: state */
  state?: DialogCloseState;
  onClick?: () => void;
}

/** The close (x) button in the dialog header. */
export function DialogClose({ state = 'default', onClick }: DialogCloseProps) {
  return (
    <button type="button" className="rds-alert-dialog__close" data-state={state} aria-label="Close" onClick={onClick}>
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M16 1.61143L14.3886 0L8 6.38857L1.61143 0L0 1.61143L6.38857 8L0 14.3886L1.61143 16L8 9.61143L14.3886 16L16 14.3886L9.61143 8L16 1.61143Z" />
      </svg>
    </button>
  );
}

/** The warning / danger triangles from the Figma Dialog header (exported as drawn). */
function StatusIcon({ appearance }: { appearance: 'warning' | 'danger' }) {
  return (
    <svg className="rds-alert-dialog__icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path
        d={
          appearance === 'warning'
            ? 'M0 20H20L10 0L0 20ZM10.9091 16.8421H9.09091V14.7368H10.9091V16.8421ZM10.9091 12.6316H9.09091V8.42105H10.9091V12.6316Z'
            : 'M10 0L0 20H20L10 0ZM11 16.6667H9V14.4444H11V16.6667ZM11 12.2222H9V7.77778H11V12.2222Z'
        }
      />
    </svg>
  );
}
