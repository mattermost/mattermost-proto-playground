import type { ReactNode } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import { ViewGridGlyph, ViewSpeakerGlyph } from '../ViewGlyphs';
import styles from './ViewToggle.module.scss';

export type ViewToggleValue = 'speaker' | 'grid';

export interface ViewToggleLabels {
  /** Trigger text. */
  trigger?: string;
  /** Trigger accessible name. */
  triggerAria?: string;
  /** Menu accessible name. */
  menu?: string;
  speaker?: string;
  grid?: string;
}

export interface ViewToggleProps {
  view: ViewToggleValue;
  onChange: (view: ViewToggleValue) => void;
  /** Host-owned menu state. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels?: ViewToggleLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<ViewToggleLabels> = {
  trigger: 'View',
  triggerAria: 'Change call layout',
  menu: 'Call layout',
  speaker: 'Speaker',
  grid: 'Grid',
};

/**
 * Header "View" button with a small layout menu (speaker / grid). The button
 * glyph reflects the selected view. The host owns
 * `open`, outside-click and Escape; the menu is anchored under the trigger.
 */
export function ViewToggle({
  view,
  onChange,
  open,
  onOpenChange,
  labels,
  className,
}: ViewToggleProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const options: { id: ViewToggleValue; label: string; glyph: ReactNode }[] = [
    { id: 'speaker', label: l.speaker, glyph: <ViewSpeakerGlyph /> },
    { id: 'grid', label: l.grid, glyph: <ViewGridGlyph /> },
  ];

  return (
    <div
      className={[styles['view-toggle'], className].filter(Boolean).join(' ')}
    >
      <Button
        emphasis="tertiary"
        appearance="inverted"
        size="small"
        leadingIcon={
          <Icon
            size="16"
            glyph={view === 'grid' ? <ViewGridGlyph /> : <ViewSpeakerGlyph />}
          />
        }
        aria-label={l.triggerAria}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        {l.trigger}
      </Button>
      <div className={styles['view-toggle__menu']}>
        <PopoverMenu open={open} role="menu" aria-label={l.menu}>
          {options.map((o) => (
            <MenuItem
              key={o.id}
              role="menuitemradio"
              aria-checked={view === o.id}
              label={o.label}
              leadingVisual={<Icon size="16" glyph={o.glyph} />}
              trailingElement={view === o.id}
              trailingVisual={<Icon size="16" glyph={<CheckIcon />} />}
              onClick={() => {
                onChange(o.id);
                onOpenChange(false);
              }}
            />
          ))}
        </PopoverMenu>
      </div>
    </div>
  );
}
