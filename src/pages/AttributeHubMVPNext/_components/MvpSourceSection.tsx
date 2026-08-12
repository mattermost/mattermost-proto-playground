import { useRef, useState } from 'react';
import SyncIcon from '@mattermost/compass-icons/components/sync';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import {
  isSourceOwned,
  type HubAttribute,
  type SourceSystem,
} from '@/pages/AttributeManagementHub/hubData';
import { CONNECT_SOURCE_OPTIONS } from './mvpTerms';
import styles from './MvpSourceSection.module.scss';

export interface MvpSourceSectionProps {
  attribute: HubAttribute;
  /** Demo connect — records the chosen source for the running prototype. */
  onConnect: (system: SourceSystem) => void;
}

/**
 * Connect affordance for manually-managed attributes (LDAP / SAML only).
 * Synced attributes use MvpManagedSourceBar at the top of the Definition panel.
 */
export default function MvpSourceSection({
  attribute,
  onConnect,
}: MvpSourceSectionProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  if (isSourceOwned(attribute)) {
    return null;
  }

  return (
    <div className={styles['source']}>
      <div ref={triggerRef} className={styles['source__trigger']}>
        <Button
          className={styles['source__connect']}
          emphasis="Quaternary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<SyncIcon />} />}
          trailingIcon={<Icon size="16" glyph={<ChevronDownIcon />} />}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          Link to external source
        </Button>
        <FixedPopoverMenu
          open={open}
          onClose={() => setOpen(false)}
          anchorRef={triggerRef}
          align="start"
        >
          <PopoverMenu aria-label="Link to external source">
            {CONNECT_SOURCE_OPTIONS.map((opt) => (
              <MenuItem
                key={opt.system}
                leadingElement={false}
                label={opt.title}
                secondaryLabel={opt.description}
                secondaryLabelPosition="Below"
                onClick={() => {
                  setOpen(false);
                  onConnect(opt.system);
                }}
              />
            ))}
          </PopoverMenu>
        </FixedPopoverMenu>
      </div>
    </div>
  );
}
