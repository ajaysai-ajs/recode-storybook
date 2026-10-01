import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react';

import { Button } from '../Button/Button';
import { CLOUD_UPLOAD_ICON } from './fileIcons';
import './FilePicker.css';

/*
 * File picker - built from the Figma component "File picker" (File picker page, node 6467:493).
 * Lets people choose files from their device, by clicking or by dragging files onto it.
 * As in Figma, it does NOT list the chosen files - show those with File card underneath.
 *
 * Under the hood it is a real <input type="file"> (hidden), so the browser's own file
 * chooser opens. We draw our own button or drop area on top.
 */

export type FilePickerType = 'Field' | 'Dropzone';
/**
 * `Disabled` and `Error` change behaviour. `Hover`, `Focus` and `Dragover` only force the
 * look for previews - in real use they happen when you hover, tab to or drag files over it.
 */
export type FilePickerState = 'Default' | 'Hover' | 'Focus' | 'Dragover' | 'Disabled' | 'Error';

export interface FilePickerProps {
  /** Figma: Type - a compact field with a button, or a large drop area */
  type?: FilePickerType;
  /** Figma: State */
  state?: FilePickerState;
  /** Figma: Label - show the label above */
  showLabel?: boolean;
  /**
   * Figma: Label text. Always give one: if the label is hidden it is still read by screen
   * readers.
   */
  labelText: string;
  /** Figma: Description - show the hint (or error message) below */
  showDescription?: boolean;
  /** Figma: Description text - e.g. allowed types and sizes. With state Error, the error message. */
  descriptionText?: string;
  /** Figma: Prompt - the Dropzone's message */
  prompt?: string;
  /** Figma: Field text - shown next to the button in a Field (e.g. "2 files selected") */
  fieldText?: string;
  /** The Field's button text */
  buttonLabel?: string;
  /** Which files can be chosen, like the HTML accept attribute: ".pdf,image/*" */
  accept?: string;
  /** Allow choosing more than one file */
  multiple?: boolean;
  /** For forms: the field name */
  name?: string;
  /** Called with the chosen or dropped files (only the ones that match `accept`) */
  onFilesSelected?: (files: File[]) => void;
  /** Called with dropped files that don't match `accept` */
  onFilesRejected?: (files: File[]) => void;
  className?: string;
}

/** Does this file match an accept list like ".pdf,image/*,application/zip"? */
export function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) return name.endsWith(rule); // by extension
      if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1)); // e.g. image/*
      return type === rule; // exact type, e.g. application/pdf
    });
}

export function FilePicker({
  type = 'Field',
  state = 'Default',
  showLabel = true,
  labelText,
  showDescription = true,
  descriptionText,
  prompt = 'Drag and drop files, or browse',
  fieldText = 'No files selected',
  buttonLabel = 'Choose files',
  accept,
  multiple = true,
  name,
  onFilesSelected,
  onFilesRejected,
  className,
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const controlId = useId();
  const textId = useId();
  const descriptionId = useId();
  const [isDragging, setIsDragging] = useState(false);

  const isDisabled = state === 'Disabled';
  const isError = state === 'Error';
  const hasDescription = showDescription && Boolean(descriptionText);
  // Dragging files over it shows the Dragover look
  const shownState = isDisabled ? 'Disabled' : isDragging ? 'Dragover' : state;

  const openChooser = () => inputRef.current?.click();

  // Sort files into the ones we accept and the ones we don't
  const handleFiles = (list: FileList | null) => {
    const files = [...(list ?? [])];
    const accepted = files.filter((file) => matchesAccept(file, accept));
    const rejected = files.filter((file) => !matchesAccept(file, accept));
    const kept = multiple ? accepted : accepted.slice(0, 1);
    if (kept.length) onFilesSelected?.(kept);
    if (rejected.length) onFilesRejected?.(rejected);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = ''; // so choosing the same file again still counts as a change
  };

  // ---- Drag and drop (both types are drop targets, as in Figma) ----
  const dropHandlers = {
    onDragOver: (event: DragEvent) => {
      if (isDisabled) return;
      event.preventDefault(); // without this the browser would open the file instead
      setIsDragging(true);
    },
    onDragLeave: (event: DragEvent) => {
      // Moving between the icon and the text inside also fires dragleave - ignore that
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
    },
    onDrop: (event: DragEvent) => {
      if (isDisabled) return;
      event.preventDefault();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
  };

  // The label is read first, then the button text: "Attachments, Choose files"
  const describedBy = [type === 'Field' ? textId : null, hasDescription ? descriptionId : null].filter(Boolean).join(' ');

  return (
    <div
      className={['rds-file-picker', className].filter(Boolean).join(' ')}
      data-type={type}
      data-state={shownState}
    >
      <span id={labelId} className="rds-file-picker__label" data-hidden={!showLabel || undefined}>
        {labelText}
      </span>

      {/* The real file input, hidden. Our button or drop area opens it. */}
      <input
        ref={inputRef}
        className="rds-file-picker__input"
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        disabled={isDisabled}
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleChange}
      />

      {type === 'Field' ? (
        <div className="rds-file-picker__control" {...dropHandlers}>
          <Button
            id={controlId}
            variant="Secondary"
            size="sm"
            label={buttonLabel}
            state={isDisabled ? 'Disabled' : 'Default'}
            aria-labelledby={`${labelId} ${controlId}`}
            aria-describedby={describedBy || undefined}
            onClick={openChooser}
          />
          <span id={textId} className="rds-file-picker__field-text">
            {fieldText}
          </span>
        </div>
      ) : (
        // The whole drop area is one big button: click, Enter or Space opens the chooser
        <button
          id={controlId}
          type="button"
          className="rds-file-picker__control"
          disabled={isDisabled}
          aria-labelledby={`${labelId} ${controlId}`}
          aria-describedby={describedBy || undefined}
          onClick={openChooser}
          {...dropHandlers}
        >
          <svg className="rds-file-picker__icon" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
            <path d={CLOUD_UPLOAD_ICON} />
          </svg>
          <span className="rds-file-picker__prompt">{prompt}</span>
        </button>
      )}

      {hasDescription && (
        <p id={descriptionId} className="rds-file-picker__description">
          {/* The red colour isn't enough on its own, so screen readers hear "Error:" first */}
          {isError && <span className="rds-file-picker__hidden">Error: </span>}
          {descriptionText}
        </p>
      )}
    </div>
  );
}
