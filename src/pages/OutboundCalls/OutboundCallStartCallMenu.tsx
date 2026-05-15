import { Fragment, useRef, useState } from 'react';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import HeadphonesIcon from '@mattermost/compass-icons/components/headphones';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DialpadIcon from '@/components/icons/DialpadIcon';
import OutboundCallIcon from '@/components/icons/OutboundCallIcon';
import Divider from '@/components/ui/Divider/Divider';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { CONFERENCE_BRIDGE } from '@/pages/OutboundCalls/outboundCallData';
import { phoneGlyphFor, phoneLabelText } from '@/pages/OutboundCalls/OutboundCallPhoneGlyphs';
import type { StartCallAction } from '@/types/outboundCall';
import styles from './OutboundCalls.module.scss';

function StartCallMenu({
  actions,
  onSelect,
  audioLabel = 'Start audio call in this channel',
}: {
  actions: StartCallAction[];
  onSelect: (action: StartCallAction) => void;
  audioLabel?: string;
}) {
  return (
    <ul className={styles['start-call-menu']} role="menu" aria-label="Start call options">
      {actions.map((action, i) => {
        let label: string;
        let secondaryLabel: string | undefined;
        let icon: React.ReactNode;
        if (action.type === 'audio') {
          label = audioLabel;
          icon = <Icon glyph={<HeadphonesIcon />} size="16" />;
        } else if (action.type === 'phone') {
          label = `Call ${phoneLabelText(action)}`;
          secondaryLabel = action.number;
          icon = (
            <Icon
              glyph={phoneGlyphFor(action.kind, styles['phone-icon--secure'])}
              size="16"
            />
          );
        } else if (action.type === 'conference') {
          label = 'Call conference bridge';
          secondaryLabel = CONFERENCE_BRIDGE.number;
          icon = <Icon glyph={<OutboundCallIcon />} size="16" />;
        } else {
          label = 'Use dial pad';
          icon = <Icon glyph={<DialpadIcon />} size="16" />;
        }
        const next = actions[i + 1];
        const showDividerAfter = action.type === 'audio' && next && next.type !== 'audio';
        return (
          <Fragment key={action.id}>
            <li className={styles['start-call-menu__item']}>
              <MenuItem
                role="menuitem"
                label={label}
                secondaryLabel={secondaryLabel}
                leadingVisual={icon}
                onClick={() => onSelect(action)}
              />
            </li>
            {showDividerAfter && (
              <li
                className={styles['start-call-menu__divider']}
                role="separator"
                aria-hidden
              >
                <Divider />
              </li>
            )}
          </Fragment>
        );
      })}
    </ul>
  );
}

export function SegmentedCallButton({
  actions,
  onSelect,
  audioLabel,
}: {
  actions: StartCallAction[];
  onSelect: (action: StartCallAction) => void;
  audioLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsideClose(wrapRef, open, () => setOpen(false));

  const toggle = () => setOpen((o) => !o);
  const pick = (action: StartCallAction) => {
    setOpen(false);
    onSelect(action);
  };

  return (
    <div className={styles['seg-call']} ref={wrapRef}>
      <button
        type="button"
        className={styles['seg-call__primary']}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Icon glyph={<PhoneIcon />} size="12" />
        <span>Start call</span>
      </button>
      <span className={styles['seg-call__divider']} aria-hidden />
      <button
        type="button"
        className={styles['seg-call__trigger']}
        onClick={toggle}
        aria-label="Choose call option"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Icon glyph={<ChevronDownIcon />} size="12" />
      </button>
      {open && <StartCallMenu actions={actions} onSelect={pick} audioLabel={audioLabel} />}
    </div>
  );
}

export function PopoverCallButton({
  actions,
  onSelect,
  audioLabel,
}: {
  actions: StartCallAction[];
  onSelect: (action: StartCallAction) => void;
  audioLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsideClose(wrapRef, open, () => setOpen(false));

  const pick = (action: StartCallAction) => {
    setOpen(false);
    onSelect(action);
  };

  return (
    <div className={styles['pop-call']} ref={wrapRef}>
      <button
        type="button"
        className={styles['pop-call__btn']}
        onClick={() => setOpen((o) => !o)}
        aria-label="Call"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Icon glyph={<PhoneIcon />} size="16" />
        <Icon glyph={<ChevronDownIcon />} size="12" />
      </button>
      {open && <StartCallMenu actions={actions} onSelect={pick} audioLabel={audioLabel} />}
    </div>
  );
}
