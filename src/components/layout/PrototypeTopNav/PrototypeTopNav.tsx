import { Link } from 'react-router-dom';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import ThemeSwitcherControl from '@/components/layout/ThemeSwitcherControl/ThemeSwitcherControl';
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
        <h1 className={styles['prototype-top-nav__title']}>{title}</h1>
      </div>

      <div className={styles['prototype-top-nav__center']}>{centerSlot}</div>

      <div className={styles['prototype-top-nav__end']}>
        <ThemeSwitcherControl />
      </div>
    </header>
  );
}
