import { Icon } from '@mattermost/compass-ui';
import { useId, useState, type ReactNode } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import styles from './SettingsDisclosureCard.module.scss';

export interface SettingsDisclosureCardProps {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  defaultExpanded?: boolean;
  /** Marker when nested in AutomationFormEditor (tight follow-on to sectioned rows). */
  formSection?: boolean;
  /** Extra class on the expanded body inner wrapper. */
  bodyClassName?: string;
}

/** Bordered accordion used for Advanced / Tools override sections. */
export default function SettingsDisclosureCard({
  title,
  hint,
  children,
  className = '',
  defaultExpanded = false,
  formSection = false,
  bodyClassName = '',
}: SettingsDisclosureCardProps) {
  const panelId = useId().replace(/\W/g, '');
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section
      className={[styles['disclosure'], className].filter(Boolean).join(' ')}
      {...(formSection ? { 'data-form-section': true } : {})}
    >
      <button
        type="button"
        className={styles['disclosure__trigger']}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className={styles['disclosure__trigger-copy']}>
          <span className={styles['disclosure__trigger-label']}>{title}</span>
          {hint ? (
            <span className={styles['disclosure__trigger-hint']}>{hint}</span>
          ) : null}
        </span>
        <span
          className={[
            styles['disclosure__chevron'],
            expanded ? styles['disclosure__chevron--open'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden
        >
          <Icon size="16" glyph={<ChevronDownIcon />} />
        </span>
      </button>

      <div
        className={[
          styles['disclosure__collapse'],
          expanded ? styles['disclosure__collapse--expanded'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden={!expanded}
      >
        <div
          className={[styles['disclosure__collapse-inner'], bodyClassName]
            .filter(Boolean)
            .join(' ')}
          id={panelId}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
