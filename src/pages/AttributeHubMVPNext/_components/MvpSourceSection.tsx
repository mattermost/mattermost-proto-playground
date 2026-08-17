import { useRef, useState } from 'react';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import {
  isSourceOwned,
  type HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import {
  isExternallyLinked,
  linkedMappings,
  linkSourceTitle,
  remainingLinkTargets,
  type LinkableSource,
} from './mvpTerms';
import MvpLinkSourceModal from './MvpLinkSourceModal';
import styles from './MvpSourceSection.module.scss';

export interface MvpSourceSectionProps {
  attribute: HubAttribute;
  onLink: (system: LinkableSource, mapped: string) => void;
  onUnlink: (system: LinkableSource) => void;
}

interface LinkDraft {
  system: LinkableSource;
  mapped: string;
}

/**
 * LDAP / SAML field mapping for locally-managed attributes.
 * Source-owned attributes (UAS / plugins) use MvpManagedSourceBar instead.
 */
export default function MvpSourceSection({
  attribute,
  onLink,
  onUnlink,
}: MvpSourceSectionProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState<LinkDraft | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  if (isSourceOwned(attribute)) {
    return null;
  }

  const links = linkedMappings(attribute);
  const remaining = remainingLinkTargets(attribute);
  const linked = isExternallyLinked(attribute);
  const nextTarget = remaining.length === 1 ? remaining[0] : undefined;

  const openLink = (system: LinkableSource, mapped = '') => {
    setMenuOpen(false);
    setDraft({ system, mapped });
  };

  const handleSave = (mapped: string) => {
    if (!draft) return;
    onLink(draft.system, mapped);
    setDraft(null);
  };

  return (
    <div
      className={[
        styles['source'],
        linked ? styles['source--linked'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {linked ? (
        <>
          <div className={styles['source__row']}>
            <p className={styles['source__lead']}>Synced with</p>
            <ul className={styles['source__chips']}>
            {links.map((link) => (
              <li key={link.system} className={styles['source__chip']}>
                <button
                  type="button"
                  className={styles['source__chip-main']}
                  aria-label={`Edit ${linkSourceTitle(link.system)} link`}
                  title={`Edit ${linkSourceTitle(link.system)} mapping`}
                  onClick={() => openLink(link.system, link.mapped)}
                >
                  <Icon size="12" glyph={<SyncIcon />} />
                  <span className={styles['source__chip-text']}>
                    {linkSourceTitle(link.system)}:{' '}
                    <span className={styles['source__chip-mapped']}>
                      {link.mapped}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  className={styles['source__chip-remove']}
                  aria-label={`Remove ${linkSourceTitle(link.system)} link`}
                  onClick={() => onUnlink(link.system)}
                >
                  <Icon size="12" glyph={<CloseIcon />} />
                </button>
              </li>
            ))}
            </ul>
          </div>
          {nextTarget && (
            <Button
              className={styles['source__also']}
              emphasis="Quaternary"
              size="Small"
              leadingIcon={<Icon size="16" glyph={<SyncIcon />} />}
              aria-label={`Link to ${nextTarget.title}`}
              onClick={() => openLink(nextTarget.system)}
            >
              Link to external source
            </Button>
          )}
        </>
      ) : (
        <div ref={triggerRef} className={styles['source__trigger']}>
          <Button
            className={styles['source__connect']}
            emphasis="Quaternary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<SyncIcon />} />}
            trailingIcon={<Icon size="16" glyph={<ChevronDownIcon />} />}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            Link to external source
          </Button>
          <FixedPopoverMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            anchorRef={triggerRef}
            align="start"
          >
            <PopoverMenu aria-label="Link to external source">
              {remaining.map((opt) => (
                <MenuItem
                  key={opt.system}
                  leadingElement={false}
                  label={opt.title}
                  secondaryLabel={opt.description}
                  secondaryLabelPosition="Below"
                  onClick={() => openLink(opt.system)}
                />
              ))}
            </PopoverMenu>
          </FixedPopoverMenu>
        </div>
      )}

      {draft && (
        <MvpLinkSourceModal
          system={draft.system}
          initialMapped={draft.mapped}
          currentType={attribute.type}
          onClose={() => setDraft(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
