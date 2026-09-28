import { Link } from 'react-router-dom';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import DockLeftIcon from '@mattermost/compass-icons/components/dock-left';
import ThemeSwitcherControl from '@/components/layout/ThemeSwitcherControl/ThemeSwitcherControl';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import { usePrototypesNav } from '@/contexts/PrototypesNavContext';
import type { ReactNode } from 'react';
import styles from './PrototypeTopNav.module.scss';

export interface PrototypeTopNavProps {
  title: string;
  centerSlot?: ReactNode;
}

export default function PrototypeTopNav({
  title,
  centerSlot,
}: PrototypeTopNavProps) {
  const { open, toggle } = usePrototypesNav();

  return (
    <header className={styles['prototype-top-nav']}>
      <div className={styles['prototype-top-nav__start']}>
        <Link
          to="/prototypes"
          className={styles['prototype-top-nav__back']}
          aria-label="Back to prototypes list"
        >
          <ArrowLeftIcon size={20} aria-hidden />
        </Link>
        <IconButton
          size="Small"
          aria-label={
            open ? 'Collapse prototypes sidebar' : 'Expand prototypes sidebar'
          }
          aria-controls="prototypes-tree-panel"
          aria-expanded={open}
          icon={<Icon size="16" glyph={<DockLeftIcon />} />}
          onClick={toggle}
        />
        <h1 className={styles['prototype-top-nav__title']}>{title}</h1>
      </div>

      <div className={styles['prototype-top-nav__center']}>{centerSlot}</div>

      <div className={styles['prototype-top-nav__end']}>
        <ThemeSwitcherControl />
      </div>
    </header>
  );
}
