import type { ReactNode} from 'react';
import {Icon } from '@mattermost/compass-ui';
import { MobileMenuItem } from '@mattermost/compass-proto';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import LogoutVariantIcon from '@mattermost/compass-icons/components/logout-variant';
import styles from './mobile-menu-item.specimen.module.scss';

function Stage({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles['mmi-item-specimen__stage']}>
      <p className={styles['mmi-item-specimen__label']}>{label}</p>
      <div className={styles['mmi-item-specimen__frame']}>{children}</div>
    </div>
  );
}

export default function MobileMenuItemLibrary() {
  return (
    <div className={styles['mmi-item-specimen']}>
      <Stage label='Default — none / stacked / inline'>
        <MobileMenuItem label='Menu Item Label' />
        <MobileMenuItem
          label='Menu Item Label'
          secondaryLabel='Secondary label'
        />
        <MobileMenuItem
          label='Menu Item Label'
          secondaryLabel='Secondary label'
          secondaryLabelPosition='Inline'
        />
      </Stage>

      <Stage label='Active — none / stacked / inline'>
        <MobileMenuItem label='Menu Item Label' active />
        <MobileMenuItem
          label='Menu Item Label'
          secondaryLabel='Secondary label'
          active
        />
        <MobileMenuItem
          label='Menu Item Label'
          secondaryLabel='Secondary label'
          secondaryLabelPosition='Inline'
          active
        />
      </Stage>

      <Stage label='Destructive — default / active'>
        <MobileMenuItem label='Menu Item Label' destructive />
        <MobileMenuItem
          label='Menu Item Label'
          secondaryLabel='Secondary label'
          destructive
        />
        <MobileMenuItem
          label='Menu Item Label'
          secondaryLabel='Secondary label'
          secondaryLabelPosition='Inline'
          destructive
        />
        <MobileMenuItem label='Menu Item Label' destructive active />
        <MobileMenuItem
          label='Menu Item Label'
          secondaryLabel='Secondary label'
          destructive
          active
        />
        <MobileMenuItem
          label='Menu Item Label'
          secondaryLabel='Secondary label'
          secondaryLabelPosition='Inline'
          destructive
          active
        />
      </Stage>

      <Stage label='Trailing, tag, divider'>
        <MobileMenuItem label='Selected option' trailingElement />
        <MobileMenuItem
          label='What’s new'
          tag
          trailingElement
          trailingVisual={<Icon glyph={<CheckIcon />} size='20' />}
        />
        <MobileMenuItem
          label='Profile'
          leadingVisual={<Icon glyph={<AccountOutlineIcon />} size='20' />}
          divider
        />
        <MobileMenuItem
          label='Sign out'
          destructive
          leadingVisual={<Icon glyph={<LogoutVariantIcon />} size='20' />}
        />
      </Stage>

      <Stage label='Disabled'>
        <MobileMenuItem label='Menu Item Label' disabled />
        <MobileMenuItem label='Destructive' destructive disabled />
      </Stage>
    </div>
  );
}
