import { useState } from 'react';
import UploadOutlineIcon from '@mattermost/compass-icons/components/upload-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import type { GraphOption } from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import {
  problemSummary,
  type CannedPayload,
  type ImportProblems,
} from '../importMvpModel';
import ImportedOptionsTree from './ImportedOptionsTree';
import styles from './MvpImportOptions.module.scss';

/** The currently-applied option set (null = no options yet). */
export interface AppliedState {
  options: GraphOption[];
  fileName: string;
  count: number;
  /** True when this apply overwrote an existing set of options. */
  replaced: boolean;
  /** How many options existed before the replace (for the caution copy). */
  replacedCount?: number;
}

export interface MvpImportOptionsProps {
  applied: AppliedState | null;
  error: ImportProblems | null;
  /** An import/replace just happened and can still be undone. */
  hasUndo: boolean;
  /** The canned "file" the demo band currently has selected. */
  selectedFile: CannedPayload;
  onImport: () => void;
  onUndo: () => void;
  onDismissError: () => void;
  /** Acknowledge the import confirmation without undoing. */
  onDismissConfirmation: () => void;
  onAddManual: (label: string) => void;
}

/**
 * The Options row of the Definition panel for a Hierarchical attribute, with the
 * lightweight inline import folded in. The entire plan/apply flow collapses to a
 * SINGLE action: pick a file → Import. A valid file applies immediately and shows
 * the hierarchy inline with a confirmation + Undo; an invalid file applies
 * nothing and shows a compact inline error. There is no preview page, no
 * acknowledgement checkbox, and no separate commit button anywhere — Undo is the
 * safety net in place of an acknowledge gate.
 */
export default function MvpImportOptions({
  applied,
  error,
  hasUndo,
  selectedFile,
  onImport,
  onUndo,
  onDismissError,
  onDismissConfirmation,
  onAddManual,
}: MvpImportOptionsProps) {
  const [manual, setManual] = useState('');

  const fileChip = (
    <span className={styles['file']}>
      <Icon size="16" glyph={<FileTextOutlineIcon />} />
      <span className={styles['file__name']}>{selectedFile.fileName}</span>
      <span className={styles['file__kind']}>{selectedFile.kindLabel}</span>
    </span>
  );

  const commitManual = () => {
    const value = manual.trim();
    if (!value) return;
    onAddManual(value);
    setManual('');
  };

  return (
    <div className={styles['options']}>
      {/* Inline error — nothing was applied. Lists every problem, compactly. */}
      {error && (
        <SectionNotice
          type="Danger"
          title={`Couldn't import — ${problemSummary(error)}`}
          description={
            <ul className={styles['problems']}>
              {error.details.map((line, i) => (
                <li key={i} className={styles['problems__item']}>
                  {line}
                </li>
              ))}
            </ul>
          }
          secondaryButtonLabel="Choose another file"
          onSecondaryAction={onDismissError}
        />
      )}

      {/* Confirmation / replace caution — the Undo safety net. */}
      {applied && hasUndo && !error && (
        <SectionNotice
          type={applied.replaced ? 'Warning' : 'Success'}
          title={`Imported ${applied.count} ${applied.count === 1 ? 'option' : 'options'} from ${applied.fileName}`}
          description={
            applied.replaced
              ? `This replaced the previous ${applied.replacedCount} ${applied.replacedCount === 1 ? 'option' : 'options'}.`
              : undefined
          }
          secondaryButtonLabel="Undo"
          onSecondaryAction={onUndo}
          onDismiss={onDismissConfirmation}
        />
      )}

      {applied ? (
        <>
          <ImportedOptionsTree options={applied.options} />
          {/* Re-import replaces in one action — no diff, no multi-step. */}
          <div className={styles['replace']}>
            {fileChip}
            <Button
              emphasis="Tertiary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<UploadOutlineIcon />} />}
              onClick={onImport}
            >
              Add new file
            </Button>
          </div>
        </>
      ) : (
        !error && (
          <>
            <p className={styles['lead']}>
              No options yet. Import a hierarchy from a file, or add options one at
              a time.
            </p>

            <div className={styles['dropzone']}>
              <Icon size="24" glyph={<UploadOutlineIcon />} />
              <p className={styles['dropzone__title']}>Import options from a file</p>
              <p className={styles['dropzone__hint']}>
                Drag an edge-list file here, or choose one.
              </p>
              <div className={styles['dropzone__file']}>{fileChip}</div>
              <div className={styles['dropzone__actions']}>
                <Button
                  emphasis="Primary"
                  size="Small"
                  leadingIcon={
                    <Icon size="16" glyph={<UploadOutlineIcon />} />
                  }
                  onClick={onImport}
                >
                  Import
                </Button>
              </div>
              <p className={styles['dropzone__demo']}>
                Swap the file in the demo bar above to try a clean file vs. one
                with problems.
              </p>
            </div>

            <div className={styles['manual']}>
              <span className={styles['manual__or']}>or add manually</span>
              <input
                className={styles['manual__input']}
                placeholder="Add a top-level option…"
                aria-label="Add a top-level option"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === 'Tab') && manual.trim()) {
                    e.preventDefault();
                    commitManual();
                  }
                }}
                onBlur={commitManual}
              />
            </div>
          </>
        )
      )}
    </div>
  );
}
