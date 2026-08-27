import type { CSSProperties } from 'react';
import tagOutlineSrc from '@/assets/icons/tag-outline.png';

/** Tag-outline glyph from design; masked PNG tracks currentColor like compass icons. */
export default function TagOutlineIcon({
  size,
  color,
  style,
  ...rest
}: {
  size?: string | number;
  color?: string;
  style?: CSSProperties;
}) {
  const dimension = size ?? '1em';

  return (
    <span
      aria-hidden
      style={{
        display: 'block',
        width: '22px',
        height: dimension,
        top: '55%',
        transform: 'translate(-50%, -55%)',
        backgroundColor: color ?? 'currentColor',
        maskImage: `url(${tagOutlineSrc})`,
        WebkitMaskImage: `url(${tagOutlineSrc})`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: '76%',
        WebkitMaskSize: '76%',
        ...style,
      }}
      {...rest}
    />
  );
}
