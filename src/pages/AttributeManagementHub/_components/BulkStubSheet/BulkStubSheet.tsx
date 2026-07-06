import CloseIcon from '@mattermost/compass-icons/components/close';
import ImportIcon from '@mattermost/compass-icons/components/import';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import styles from './BulkStubSheet.module.scss';

export interface BulkStubSheetProps {
  attributeName: string;
  onClose: () => void;
}

/**
 * Bulk management — stub. Surfaces the entry points only; the full flows are
 * deferred. Right-anchored side sheet.
 */
export default function BulkStubSheet({
  attributeName,
  onClose,
}: BulkStubSheetProps) {
  return (
    <div
      className={styles['bulk']}
      role="dialog"
      aria-modal="true"
      aria-label="Bulk manage values"
    >
      <button
        type="button"
        className={styles['bulk__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['bulk__panel']}>
        <header className={styles['bulk__header']}>
          <div className={styles['bulk__title-block']}>
            <h2 className={styles['bulk__title']}>Bulk manage values</h2>
            <p className={styles['bulk__subtitle']}>{attributeName}</p>
          </div>
          <IconButton
            aria-label="Close"
            icon={<Icon size="20" glyph={<CloseIcon />} />}
            onClick={onClose}
          />
        </header>
        <div className={styles['bulk__body']}>
          <SectionNotice
            type="Info"
            title="Bulk tools are coming soon"
            description="Start from one of the entry points below. The full import and assignment flows are not yet built."
          />
          <div className={styles['bulk__entries']}>
            <MenuItem
              label="Import values"
              secondaryLabel="Upload a CSV to add or update the value list"
              secondaryLabelPosition="Below"
              leadingVisual={<Icon size="16" glyph={<ImportIcon />} />}
            />
            <MenuItem
              label="Assign to many users"
              secondaryLabel="Set this attribute on a selected set of users"
              secondaryLabelPosition="Below"
              leadingVisual={
                <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
