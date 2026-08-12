import Icon from '@/components/ui/Icon/Icon';
import type { AttrType } from '@/pages/AttributeManagementHub/hubData';
import { mvpAttrTypeIcon } from './mvpAttrTypeIcons';
import styles from './MvpAttrTypeLabel.module.scss';

export interface MvpAttrTypeLabelProps {
  type: AttrType;
  /** Optional display override (e.g. Classification lists as "Hierarchical"). */
  label?: string;
  className?: string;
}

export default function MvpAttrTypeLabel({
  type,
  label,
  className,
}: MvpAttrTypeLabelProps) {
  return (
    <span className={[styles['label'], className].filter(Boolean).join(' ')}>
      <Icon size="16" glyph={mvpAttrTypeIcon(type)} />
      <span>{label ?? type}</span>
    </span>
  );
}
