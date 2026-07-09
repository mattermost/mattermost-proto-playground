import styles from './ChannelClassificationBanner.module.scss';

const LEVEL_BY_ID: Record<string, string> = {
  ts: 'ts',
  s: 's',
  c: 'c',
  cui: 'cui',
  u: 'u',
};

export interface ChannelClassificationBannerProps {
  valueId: string;
  label: string;
  className?: string;
}

export default function ChannelClassificationBanner({
  valueId,
  label,
  className = '',
}: ChannelClassificationBannerProps) {
  const level = LEVEL_BY_ID[valueId] ?? 'u';
  const rootClass = [
    styles['channel-classification-banner'],
    styles[`channel-classification-banner--${level}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} role="status" aria-label={`Classification: ${label}`}>
      <span className={styles['channel-classification-banner__label']}>{label}</span>
    </div>
  );
}
