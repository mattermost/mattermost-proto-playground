import { useState } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { Tabs } from '@mattermost/compass-ui/components/tabs';
import {
  DEFAULT_SHARE_SOURCE,
  SHARE_SOURCES,
  type ShareKind,
  type ShareSource,
} from '../../videoCallsData';
import styles from './ScreenSharePicker.module.scss';

export interface ScreenSharePickerProps {
  onShare: (source: ShareSource, opts: { audio: boolean }) => void;
  onCancel: () => void;
}

const TABS: { key: ShareKind; label: string }[] = [
  { key: 'screen', label: 'Entire screen' },
  { key: 'window', label: 'Window' },
  { key: 'tab', label: 'Tab' },
];

/**
 * Pick what to share before anything is captured, the way browsers and call
 * apps do: a source type, a preview of each source, one selected by default so
 * sharing is a single click, and an opt-in for audio (not offered for a single
 * window, which can't carry it). Presentational; the host owns the overlay and
 * what happens on Share.
 */
export default function ScreenSharePicker({
  onShare,
  onCancel,
}: ScreenSharePickerProps) {
  const [kind, setKind] = useState<ShareKind>(DEFAULT_SHARE_SOURCE.kind);
  const [selectedId, setSelectedId] = useState(DEFAULT_SHARE_SOURCE.id);
  const [audio, setAudio] = useState(false);

  const sources = SHARE_SOURCES.filter((s) => s.kind === kind);
  const selected = SHARE_SOURCES.find((s) => s.id === selectedId);
  const audioAvailable = kind !== 'window';

  const changeKind = (next: string) => {
    const k = next as ShareKind;
    setKind(k);
    // Keep a valid selection: the first source of the new type.
    const first = SHARE_SOURCES.find((s) => s.kind === k);
    if (first) setSelectedId(first.id);
  };

  return (
    <Modal
      size="small"
      title="Share your screen"
      subtitle="Choose what to share with everyone in the call."
      onClose={onCancel}
      headerSlot={
        <Tabs
          appearance="underlined"
          activeKey={kind}
          onChange={changeKind}
          tabs={TABS}
        />
      }
      footerLeading={
        <Checkbox
          checked={audioAvailable && audio}
          disabled={!audioAvailable}
          onChange={(e) => setAudio(e.target.checked)}
        >
          {audioAvailable
            ? 'Also share audio'
            : 'Audio is not available for a window'}
        </Checkbox>
      }
      footer={
        <>
          <Button emphasis="tertiary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            emphasis="primary"
            disabled={!selected}
            onClick={() =>
              selected && onShare(selected, { audio: audioAvailable && audio })
            }
          >
            Share
          </Button>
        </>
      }
    >
      <div
        className={styles['screen-share-picker__grid']}
        role="radiogroup"
        aria-label="Sources"
      >
        {sources.map((source) => {
          const isSelected = source.id === selectedId;
          return (
            <button
              key={source.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={[
                styles['screen-share-picker__source'],
                isSelected && styles['screen-share-picker__source--selected'],
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setSelectedId(source.id)}
              onDoubleClick={() =>
                onShare(source, { audio: audioAvailable && audio })
              }
            >
              <span
                className={styles['screen-share-picker__thumb']}
                aria-hidden
              >
                <span className={styles['screen-share-picker__bar']} />
                <span className={styles['screen-share-picker__line']} />
                <span className={styles['screen-share-picker__line--short']} />
              </span>
              <span className={styles['screen-share-picker__label']}>
                {source.label}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
