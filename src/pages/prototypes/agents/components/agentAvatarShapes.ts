import type { AgentColor, AgentShape } from '../agentsData';

/**
 * Unit-space SVG paths (viewBox 0 0 1 1) for non-sphere agent shapes.
 * Soft corner radii (noticeably rounder than the original Figma export).
 * Shield: heater outline with larger top fillets.
 */
export const AGENT_AVATAR_SHAPE_PATHS: Record<
  Exclude<AgentShape, 'sphere'>,
  string
> = {
  pyramid:
    'M0.43495 0.12090C0.47088 0.05729 0.52912 0.05729 0.56505 0.12090L0.96407 0.82753C1.00000 0.89114 0.96990 0.94271 0.89684 0.94271L0.10316 0.94271C0.03010 0.94271 0.00000 0.89114 0.03593 0.82753Z',
  cube: 'M0 0.18000C0 0.08059 0.08059 0 0.18000 0H0.82000C0.91941 0 1 0.08059 1 0.18000V0.82000C1 0.91941 0.91941 1 0.82000 1H0.18000C0.08059 1 0 0.91941 0 0.82000V0.18000Z',
  pentagon:
    'M0.39423 0.06691C0.45264 0.02448 0.54736 0.02448 0.60577 0.06691L0.91232 0.28964C0.97073 0.33207 1.00000 0.42215 0.97769 0.49082L0.86059 0.85118C0.83828 0.91985 0.76166 0.97552 0.68945 0.97552L0.31055 0.97552C0.23834 0.97552 0.16172 0.91985 0.13941 0.85118L0.02231 0.49082C0.00000 0.42215 0.02927 0.33207 0.08768 0.28964Z',
  hexagon:
    'M0.39981 0.03195C0.45514 0.00000 0.54486 0.00000 0.60019 0.03195L0.85524 0.17920C0.91058 0.21116 0.95544 0.28885 0.95544 0.35275L0.95544 0.64725C0.95544 0.71115 0.91058 0.78884 0.85524 0.82080L0.60019 0.96805C0.54486 1.00000 0.45514 1.00000 0.39981 0.96805L0.14476 0.82080C0.08942 0.78884 0.04456 0.71115 0.04456 0.64725L0.04456 0.35275C0.04456 0.28885 0.08942 0.21116 0.14476 0.17920Z',
  diamond:
    'M0.39983 0.05531C0.45515 0.00000 0.54485 0.00000 0.60017 0.05531L0.94469 0.39983C1.00000 0.45515 1.00000 0.54485 0.94469 0.60017L0.60017 0.94469C0.54485 1.00000 0.45515 1.00000 0.39983 0.94469L0.05531 0.60017C0.00000 0.54485 0.00000 0.45515 0.05531 0.39983Z',
  octagon:
    'M0.41420 0.01963C0.46159 0.00000 0.53841 0.00000 0.58580 0.01963L0.77900 0.09966C0.82640 0.11929 0.88071 0.17360 0.90034 0.22100L0.98037 0.41420C1.00000 0.46159 1.00000 0.53841 0.98037 0.58580L0.90034 0.77900C0.88071 0.82640 0.82640 0.88071 0.77900 0.90034L0.58580 0.98037C0.53841 1.00000 0.46159 1.00000 0.41420 0.98037L0.22100 0.90034C0.17360 0.88071 0.11929 0.82640 0.09966 0.77900L0.01963 0.58580C0.00000 0.53841 0.00000 0.46159 0.01963 0.41420L0.09966 0.22100C0.11929 0.17360 0.17360 0.11929 0.22100 0.09966Z',
  shield:
    'M0.86000 0.00250L0.14000 0.00250C0.05600 0.00250 0.00000 0.05450 0.00000 0.13250L0.00000 0.46250C0.00000 0.62250 0.30000 0.86250 0.44000 0.97250C0.47000 0.99750 0.53000 0.99750 0.56000 0.97250C0.70000 0.86250 1.00000 0.62250 1.00000 0.46250L1.00000 0.13250C1.00000 0.05450 0.94400 0.00250 0.86000 0.00250Z',
};

/** Resolved hex stops for SVG chip avatars (mirrors AGENT_COLOR_STOPS tokens). */
const AGENT_CHIP_COLOR_HEX: Record<
  AgentColor,
  { highlight: string; mid: string; edge: string }
> = {
  yellow: { highlight: '#ffc847', mid: '#f5ab00', edge: '#f5ab00' },
  orange: { highlight: '#ec8832', mid: '#e07315', edge: '#ec8832' },
  red: { highlight: '#da6c6e', mid: '#c43133', edge: '#d24b4e' },
  purple: { highlight: '#6167bd', mid: '#3c4290', edge: '#484fad' },
  sky: { highlight: '#81a3ef', mid: '#5d89ea', edge: '#81a3ef' },
  blue: { highlight: '#386fe5', mid: '#1c58d9', edge: '#386fe5' },
  cyan: { highlight: '#1adbdb', mid: '#119292', edge: '#15b7b7' },
  green: { highlight: '#75d1ac', mid: '#339970', edge: '#3db887' },
};

const maskUrlCache = new Map<string, string>();
const chipSrcCache = new Map<string, string>();

/** CSS mask-image value that scales the unit path to any avatar size. */
export function agentAvatarShapeMask(shape: AgentShape): string | undefined {
  if (shape === 'sphere') return undefined;
  const path = AGENT_AVATAR_SHAPE_PATHS[shape];
  let url = maskUrlCache.get(path);
  if (!url) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none"><path d="${path}" fill="#000"/></svg>`;
    url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    maskUrlCache.set(path, url);
  }
  return url;
}

/**
 * Combobox chips only accept `leadingAvatar: { src, alt }` (UserAvatar).
 * `leadingVisual` is forwarded as Chip `leadingIcon` → Icon, which cannot
 * render AgentAvatar. Build a matching SVG data URL for geometric agents,
 * including static eye dots (no pointer tracking in chip images).
 * NewAgentGroupChatModal CSS clears UserAvatar's circle crop so silhouettes show.
 */
export function agentAvatarChipSrc(
  shape: AgentShape,
  color: AgentColor,
): string {
  const key = `${shape}:${color}:eyes`;
  const cached = chipSrcCache.get(key);
  if (cached) return cached;

  const stops = AGENT_CHIP_COLOR_HEX[color];
  const grad = `<radialGradient id="g" cx="66.67%" cy="27.08%" r="77.5%"><stop offset="0%" stop-color="${stops.highlight}"/><stop offset="74.52%" stop-color="${stops.mid}"/><stop offset="98.08%" stop-color="${stops.edge}"/></radialGradient>`;
  const body =
    shape === 'sphere'
      ? `<circle cx="0.5" cy="0.5" r="0.5" fill="url(#g)"/>`
      : `<path d="${AGENT_AVATAR_SHAPE_PATHS[shape]}" fill="url(#g)"/>`;
  // Static pupils — match AgentAvatar: 12% diameter, 18% flex gap between
  // (centers at 35% / 65%, not 18% center-to-center).
  const eyes =
    '<circle cx="0.35" cy="0.5" r="0.06" fill="rgba(255,255,255,0.92)"/><circle cx="0.65" cy="0.5" r="0.06" fill="rgba(255,255,255,0.92)"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1">${grad}${body}${eyes}</svg>`;
  const src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  chipSrcCache.set(key, src);
  return src;
}
