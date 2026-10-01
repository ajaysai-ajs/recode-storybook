import { DELETE_ICON, DOWNLOAD_ICON, FILE_TYPE_ICONS } from './fileIcons';
import './FilePicker.css';

/*
 * File card - built from the Figma component "File card" (File picker page, node 6474:311).
 * Shows one file - type icon, name and size - and its upload state. The companion to File
 * picker: stack one card per file underneath it (in a list, so screen readers can count them).
 */

export type FileCardType = 'Generic' | 'PDF' | 'Image' | 'Audio' | 'Video';
export type FileCardState = 'Default' | 'Uploading' | 'Error';

export interface FileCardProps {
  /** Figma: File name. Long names are cut to one line with "…" (hover shows the full name). */
  fileName: string;
  /** Figma: File size, e.g. "9.8 KB" */
  fileSize?: string;
  /** Figma: Show file size */
  showFileSize?: boolean;
  /** Figma: File type - picks the icon */
  fileType?: FileCardType;
  /** Figma: State */
  state?: FileCardState;
  /** Uploading: how far along, from 0 to 100 */
  uploadProgress?: number;
  /** Figma: Error message - shown when state is Error */
  errorMessage?: string;
  /** Figma: Download action - the download button only shows when you pass this */
  onDownload?: () => void;
  /** Figma: Delete action - the delete button only shows when you pass this */
  onDelete?: () => void;
  className?: string;
}

export function FileCard({
  fileName,
  fileSize,
  showFileSize = true,
  fileType = 'Generic',
  state = 'Default',
  uploadProgress = 0,
  errorMessage = 'Error uploading file',
  onDownload,
  onDelete,
  className,
}: FileCardProps) {
  const progress = Math.min(100, Math.max(0, Math.round(uploadProgress)));

  return (
    <div className={['rds-file-card', className].filter(Boolean).join(' ')} data-state={state}>
      <svg className="rds-file-card__type-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d={FILE_TYPE_ICONS[fileType]} />
      </svg>

      <div className="rds-file-card__stack">
        <span className="rds-file-card__name" title={fileName}>
          {fileName}
        </span>
        {showFileSize && fileSize && <span className="rds-file-card__meta">{fileSize}</span>}

        {state === 'Uploading' && (
          <div
            className="rds-file-card__progress"
            role="progressbar"
            aria-label={`Uploading ${fileName}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            {/* The filled part; its width is the progress (a value, not a design size) */}
            <div className="rds-file-card__indicator" style={{ width: `${progress}%` }} />
          </div>
        )}

        {state === 'Error' && (
          // role="alert": screen readers announce a failed upload as soon as it appears
          <span className="rds-file-card__error" role="alert">
            {errorMessage}
          </span>
        )}
      </div>

      {(onDownload || onDelete) && (
        <div className="rds-file-card__actions">
          {onDownload && (
            <button type="button" className="rds-file-card__action" aria-label={`Download ${fileName}`} onClick={onDownload}>
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d={DOWNLOAD_ICON} />
              </svg>
            </button>
          )}
          {onDelete && (
            <button type="button" className="rds-file-card__action" aria-label={`Delete ${fileName}`} onClick={onDelete}>
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d={DELETE_ICON} />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
