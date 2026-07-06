import type { ReactNode } from 'react';
import { useId } from 'react';
import IconButton from '@/components/IconButton/IconButton';
import Icon from '@/components/Icon/Icon';
import Scrollbar from '@/components/Scrollbar/Scrollbar';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import { toKebab } from '@/utils/string';
import styles from './Modal.module.scss';

export type ModalSize = 'Small' | 'Medium' | 'Large';

export interface ModalProps {
  /** Width variant. Figma: Size — Small 600px, Medium 704px, Large 832px. */
  size?: ModalSize;
  /** Modal heading text. Always visible. */
  title: ReactNode;
  /** Optional secondary line below the title. */
  subtitle?: ReactNode;
  /** Tab navigation rendered below the title instead of a subtitle. */
  headerTabs?: ReactNode;
  /** Full-width row below the title row, still inside the header (e.g. a tab bar). */
  headerBottom?: ReactNode;
  /** When true, shows a back-arrow button before the title. */
  showBackButton?: boolean;
  /** Called when the back button is clicked. */
  onBack?: () => void;
  /** Called when the × close button is clicked. */
  onClose?: () => void;
  /** Optional trailing control rendered before the close button (e.g. a switch). */
  headerActions?: ReactNode;
  /** Show divider between header and body. Figma: Divider = On. Default: true. */
  headerDivider?: boolean;
  /** Body content. */
  children: ReactNode;
  /** Optional class merged onto the scrolling body inner wrapper (e.g. to reduce padding). */
  bodyClassName?: string;
  /** Footer slot — typically a group of Buttons, right-aligned by default. */
  footer?: ReactNode;
  /** Show divider between body and footer. Figma: Divider = On. Default: true. */
  footerDivider?: boolean;
}

export default function Modal({
  size = 'Small',
  title,
  subtitle,
  headerTabs,
  headerBottom,
  showBackButton = false,
  onBack,
  onClose,
  headerActions,
  headerDivider = true,
  children,
  bodyClassName,
  footer,
  footerDivider = true,
}: ModalProps) {
  const titleId = useId();
  const sizeClass = styles[`modal--size-${toKebab(size)}`];

  const headerMain = (
    <>
      <div className={styles['modal__header-inner']}>
        {showBackButton && (
          <IconButton
            aria-label="Go back"
            icon={<Icon glyph={<ArrowLeftIcon />} size="20" />}
            onClick={onBack}
          />
        )}
        <div className={styles['modal__title-group']}>
          <h2 id={titleId} className={styles['modal__title']}>
            {title}
          </h2>
          {headerTabs != null
            ? headerTabs
            : subtitle && (
                <p className={styles['modal__subtitle']}>{subtitle}</p>
              )}
        </div>
      </div>
      <div className={styles['modal__header-trailing']}>
        {headerActions != null ? (
          <div className={styles['modal__header-actions']}>{headerActions}</div>
        ) : null}
        <IconButton
          aria-label="Close"
          className={styles['modal__close']}
          icon={<Icon glyph={<CloseIcon />} size="20" />}
          onClick={onClose}
        />
      </div>
    </>
  );

  return (
    <div
      className={[styles.modal, sizeClass].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={[
          styles['modal__header'],
          headerTabs != null && styles['modal__header--has-tabs'],
          headerBottom != null && styles['modal__header--with-bottom'],
          !headerDivider && styles['modal__header--no-divider'],
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {headerBottom != null ? (
          <>
            <div className={styles['modal__header-row']}>{headerMain}</div>
            <div className={styles['modal__header-bottom']}>{headerBottom}</div>
          </>
        ) : (
          headerMain
        )}
      </div>

      <div className={styles['modal__body']}>
        <Scrollbar>
          <div
            className={[styles['modal__body-inner'], bodyClassName]
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </div>
        </Scrollbar>
      </div>

      {footer && (
        <div
          className={[
            styles['modal__footer'],
            !footerDivider && styles['modal__footer--no-divider'],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
