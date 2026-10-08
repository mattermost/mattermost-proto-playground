// [AI DRAFT] The "Direct Messages" (+) modal.
//
// Compass has no Direct Messages / multiselect dialog, so this composes one from
// Modal, Chip, SearchInput, MenuItem and UserAvatar. Shipped strings:
// more_direct_channels.title, multiselect.placeholder, multiselect.go,
// multiselect.numPeopleRemaining, more_direct_channels.new_convo_note.
//
// A person whom the acting user can't start with stays listed and selectable.
// Once selected, "Go" is aria-disabled (still focusable) and the neutral reason
// appears inline, linked through aria-describedby.
import { useId, useState } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { ErrorMessage } from '@mattermost/compass-ui/components/error-message';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { Modal } from '@mattermost/compass-ui/components/modal';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { canStartWith } from '../conversations';
import { PEOPLE, VIEWER, personById } from '../dmgmData';
import type { DirectionId } from '../dmgmScenes';
import type { SessionContext } from '../policyModel';
import { DENIED_COPY } from '../copy';
import styles from './DirectMessagesModal.module.scss';

const MAX_MEMBERS = 7;

export interface DirectMessagesModalProps {
  direction: DirectionId;
  ctx: SessionContext;
  initialSelected: string[];
  onClose: () => void;
  onGo: (ids: string[]) => void;
}

export default function DirectMessagesModal({
  ctx,
  initialSelected,
  onClose,
  onGo,
}: DirectMessagesModalProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [query, setQuery] = useState('');
  const reasonId = useId();

  const people = PEOPLE.filter(
    (p) => p.kind === 'user' && p.id !== VIEWER.id && !selected.includes(p.id),
  ).filter((p) => {
    const q = query.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.username.includes(q);
  });

  const chosen = selected.map(personById);
  const blocked = chosen.length > 0 && !canStartWith(chosen, ctx);
  const remaining = MAX_MEMBERS - selected.length;

  return (
    <Modal
      size="medium"
      title="Direct Messages"
      onClose={onClose}
      bodyPadding="none"
      footerDivider={false}
      footer={null}
    >
      <div className={styles['dm-modal']}>
        <div className={styles['dm-modal__bar']}>
          <div className={styles['dm-modal__field']}>
            {chosen.map((p) => (
              <Chip
                key={p.id}
                size="small"
                leadingAvatar={
                  p.avatarSrc ? { src: p.avatarSrc, alt: p.name } : undefined
                }
                onRemove={() =>
                  setSelected((s) => s.filter((id) => id !== p.id))
                }
              >
                {p.name}
              </Chip>
            ))}
            <SearchInput
              className={styles['dm-modal__search']}
              size="small"
              placeholder="Search for people"
              aria-label="Search for people"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button
            emphasis="primary"
            className={
              blocked || chosen.length === 0
                ? styles['dm-modal__go--blocked']
                : undefined
            }
            aria-disabled={blocked || chosen.length === 0 ? true : undefined}
            aria-describedby={blocked ? reasonId : undefined}
            onClick={() => {
              if (!blocked && chosen.length > 0) onGo(selected);
            }}
          >
            Go
          </Button>
        </div>

        {blocked ? (
          // Compass ErrorMessage (inline line under the field, role="alert").
          <div id={reasonId} className={styles['dm-modal__reason']}>
            <ErrorMessage
              message={DENIED_COPY[chosen.length > 1 ? 'start-gm' : 'start-dm']}
            />
          </div>
        ) : null}

        <p className={styles['dm-modal__hint']}>
          Use ↑↓ to browse, ↵ to select. You can add {remaining} more{' '}
          {remaining === 1 ? 'person' : 'people'}.
        </p>
        {chosen.length > 1 ? (
          <p className={styles['dm-modal__hint']}>
            This will start a new conversation. If you&apos;re adding a lot of
            people, consider creating a private channel instead.
          </p>
        ) : null}

        <div
          className={styles['dm-modal__list']}
          role="listbox"
          aria-label="People"
        >
          {people.map((p) => (
            <MenuItem
              key={p.id}
              role="option"
              aria-selected={false}
              label={p.name}
              secondaryLabel={`@${p.username} · ${p.title}`}
              leadingVisual={
                <UserAvatar size="32" src={p.avatarSrc} alt={p.name} />
              }
              onClick={() => setSelected((s) => [...s, p.id])}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}
