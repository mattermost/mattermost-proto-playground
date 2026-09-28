import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Button from '@/components/ui/Button/Button';
import ErrorMessage from '@/components/ui/ErrorMessage/ErrorMessage';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import Select from '@/components/ui/Select/Select';
import TextInput from '@/components/ui/TextInput/TextInput';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import botDefaultIcon from '../assets/bot_default_icon.png';
import IntegrationsBotShell from './IntegrationsBotShell';
import styles from './BotAccountScene.module.scss';

type BotAttributeOption = {
  id: string;
  label: string;
  values: string[];
  required?: boolean;
};

const BOT_ATTRIBUTES: BotAttributeOption[] = [
  {
    id: 'clearance',
    label: 'Clearance',
    values: ['Unclassified', 'Confidential', 'Secret', 'Top Secret'],
    required: true,
  },
  {
    id: 'program',
    label: 'Program',
    values: ['Dragon Spacecraft', 'Watch Floor', 'Delta Ops'],
  },
  {
    id: 'caveat',
    label: 'Caveat',
    values: ['NOFORN', 'REL TO USA, GBR', 'ORCON'],
  },
];

type AssignedValue = {
  attributeId: string;
  value: string;
};

type ListedBot = {
  id: string;
  username: string;
  displayName: string;
  description: string;
  avatarSrc?: string;
  avatarTone?: string;
  managedBy?: string;
  attributes: AssignedValue[];
};

const SEED_BOTS: ListedBot[] = [
  {
    id: 'clearance-gate',
    username: 'clearance.gate',
    displayName: 'Clearance Gate',
    description: 'Enforces file download rules for classified channels',
    avatarSrc: botDefaultIcon,
    attributes: [
      { attributeId: 'clearance', value: 'Secret' },
      { attributeId: 'program', value: 'Dragon Spacecraft' },
      { attributeId: 'caveat', value: 'NOFORN' },
    ],
  },
  {
    id: 'watch-floor',
    username: 'watch.floor',
    displayName: 'Watch Floor Reporter',
    description: 'Posts shift summaries and incident digests to the watch floor',
    avatarTone: '#1c58d9',
    attributes: [{ attributeId: 'clearance', value: 'Confidential' }],
  },
  {
    id: 'delta-ops',
    username: 'delta.ops',
    displayName: 'Delta Ops Assist',
    description: 'Automation helper for Delta Ops program channels',
    avatarTone: '#3db887',
    attributes: [
      { attributeId: 'clearance', value: 'Top Secret' },
      { attributeId: 'program', value: 'Delta Ops' },
    ],
  },
];

function initialAssigned(): AssignedValue[] {
  return BOT_ATTRIBUTES.filter((attr) => attr.required).map((attr) => ({
    attributeId: attr.id,
    value: '',
  }));
}

function attributeLabel(id: string): string {
  return BOT_ATTRIBUTES.find((item) => item.id === id)?.label ?? id;
}

function formatAttributeSummary(attributes: AssignedValue[]): string {
  if (attributes.length === 0) return 'No attributes set';
  return attributes
    .map((row) => `${attributeLabel(row.attributeId)}: ${row.value}`)
    .join(' · ');
}

/**
 * Integrations → Bot Accounts: list of bots, then Add with required attributes.
 */
export default function BotAccountScene() {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [bots, setBots] = useState<ListedBot[]>(SEED_BOTS);
  const [query, setQuery] = useState('');

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('member');
  const [assigned, setAssigned] = useState<AssignedValue[]>(initialAssigned);
  const [showErrors, setShowErrors] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  useOutsideClose(pickerRef, pickerOpen, () => setPickerOpen(false));

  const usernameMissing = !username.trim();
  const displayNameMissing = !displayName.trim();

  const requiredUnset = useMemo(
    () =>
      assigned.filter((row) => {
        const attr = BOT_ATTRIBUTES.find((item) => item.id === row.attributeId);
        return attr?.required && !row.value.trim();
      }),
    [assigned],
  );

  const formInvalid =
    usernameMissing || displayNameMissing || requiredUnset.length > 0;

  const unused = BOT_ATTRIBUTES.filter(
    (attr) => !assigned.some((row) => row.attributeId === attr.id),
  );

  const filteredBots = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bots;
    return bots.filter((bot) => {
      const haystack = [
        bot.displayName,
        bot.username,
        bot.description,
        formatAttributeSummary(bot.attributes),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [bots, query]);

  const resetCreateForm = () => {
    setUsername('');
    setDisplayName('');
    setDescription('');
    setRole('member');
    setAssigned(initialAssigned());
    setShowErrors(false);
    setPickerOpen(false);
  };

  const openAdd = () => {
    resetCreateForm();
    setView('add');
  };

  const backToList = () => {
    resetCreateForm();
    setView('list');
  };

  const setValue = (attributeId: string, value: string) => {
    setAssigned((rows) =>
      rows.map((row) =>
        row.attributeId === attributeId ? { ...row, value } : row,
      ),
    );
  };

  const removeValue = (attributeId: string) => {
    const attr = BOT_ATTRIBUTES.find((item) => item.id === attributeId);
    if (attr?.required) return;
    setAssigned((rows) => rows.filter((row) => row.attributeId !== attributeId));
  };

  const addAttribute = (attributeId: string) => {
    const attr = BOT_ATTRIBUTES.find((item) => item.id === attributeId);
    if (!attr) return;
    setAssigned((rows) => [
      ...rows,
      { attributeId, value: attr.values[0] ?? '' },
    ]);
    setPickerOpen(false);
  };

  const handleCreate = () => {
    if (formInvalid) {
      setShowErrors(true);
      return;
    }
    const handle = username.trim().replace(/^@/, '');
    const name = displayName.trim();
    setBots((current) => [
      {
        id: `bot-${Date.now()}`,
        username: handle,
        displayName: name,
        description: description.trim() || 'Custom bot account',
        avatarSrc: botDefaultIcon,
        attributes: assigned.filter((row) => row.value.trim()),
      },
      ...current,
    ]);
    resetCreateForm();
    setView('list');
  };

  if (view === 'list') {
    return (
      <IntegrationsBotShell
        view="list"
        headerAction={
          <Button emphasis="Primary" onClick={openAdd}>
            Add Bot Account
          </Button>
        }
      >
        <div className={styles['bot-list']}>
          <div className={styles['bot-list__toolbar']}>
            <div className={styles['bot-list__search']}>
              <Icon
                size="16"
                glyph={<MagnifyIcon />}
                className={styles['bot-list__search-icon']}
              />
              <input
                className={styles['bot-list__search-input']}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                placeholder="Search Bot Accounts"
                aria-label="Search Bot Accounts"
              />
            </div>
          </div>

          <p className={styles['bot-list__intro']}>
            Use Bot Accounts to integrate with Mattermost through plugins or the
            API. Bot accounts are available to everyone on your server. Enable
            bot account creation in the{' '}
            <a href="#system-console" className={styles['bot-list__link']}>
              System Console
            </a>
            .
          </p>

          <ul className={styles['bot-list__rows']}>
            {filteredBots.map((bot) => (
              <li key={bot.id} className={styles['bot-list__row']}>
                {bot.avatarSrc ? (
                  <img
                    className={styles['bot-list__avatar']}
                    src={bot.avatarSrc}
                    alt=""
                  />
                ) : (
                  <span
                    className={styles['bot-list__avatar']}
                    style={
                      bot.avatarTone
                        ? { backgroundColor: bot.avatarTone }
                        : undefined
                    }
                    aria-hidden
                  >
                    {bot.displayName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className={styles['bot-list__body']}>
                  <div className={styles['bot-list__title']}>
                    <span className={styles['bot-list__name']}>
                      {bot.displayName}
                    </span>
                    <span className={styles['bot-list__username']}>
                      (@{bot.username})
                    </span>
                  </div>
                  <p className={styles['bot-list__desc']}>{bot.description}</p>
                  <p className={styles['bot-list__attrs']}>
                    {formatAttributeSummary(bot.attributes)}
                  </p>
                  {bot.managedBy && (
                    <p className={styles['bot-list__managed']}>
                      Managed by {bot.managedBy}
                    </p>
                  )}
                </div>
              </li>
            ))}
            {filteredBots.length === 0 && (
              <li className={styles['bot-list__empty']}>
                No bot accounts match “{query.trim()}”.
              </li>
            )}
          </ul>
        </div>
      </IntegrationsBotShell>
    );
  }

  return (
    <IntegrationsBotShell view="add" onBackToList={backToList}>
      <div className={styles['bot-edit']}>
        <div className={styles['bot-edit__field']}>
          <label className={styles['bot-edit__label']} htmlFor="bot-username">
            Username
            <span className={styles['bot-edit__req']} aria-hidden>
              {' '}
              *
            </span>
          </label>
          <div className={styles['bot-edit__control']}>
            <TextInput
              id="bot-username"
              value={username}
              invalid={showErrors && usernameMissing}
              aria-required
              aria-describedby={
                showErrors && usernameMissing ? 'bot-username-error' : undefined
              }
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUsername(e.currentTarget.value)
              }
            />
            {showErrors && usernameMissing ? (
              <div id="bot-username-error">
                <ErrorMessage message="Username is required" />
              </div>
            ) : (
              <p className={styles['bot-edit__help']}>
                You can use lowercase letters, numbers, periods, dashes, and
                underscores.
              </p>
            )}
          </div>
        </div>

        <div className={styles['bot-edit__field']}>
          <span className={styles['bot-edit__label']}>Bot Icon</span>
          <div className={styles['bot-edit__control']}>
            <div className={styles['bot-edit__icon-block']}>
              <img
                className={styles['bot-edit__avatar']}
                src={botDefaultIcon}
                alt=""
              />
              <Button emphasis="Primary" size="Small">
                Upload Image
              </Button>
            </div>
          </div>
        </div>

        <div className={styles['bot-edit__field']}>
          <label className={styles['bot-edit__label']} htmlFor="bot-display-name">
            Display Name
            <span className={styles['bot-edit__req']} aria-hidden>
              {' '}
              *
            </span>
          </label>
          <div className={styles['bot-edit__control']}>
            <TextInput
              id="bot-display-name"
              value={displayName}
              invalid={showErrors && displayNameMissing}
              aria-required
              aria-describedby={
                showErrors && displayNameMissing
                  ? 'bot-display-name-error'
                  : undefined
              }
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDisplayName(e.currentTarget.value)
              }
            />
            {showErrors && displayNameMissing ? (
              <div id="bot-display-name-error">
                <ErrorMessage message="Display Name is required" />
              </div>
            ) : (
              <p className={styles['bot-edit__help']}>
                You can choose to display your bot&apos;s full name rather than
                its username.
              </p>
            )}
          </div>
        </div>

        <div className={styles['bot-edit__field']}>
          <label className={styles['bot-edit__label']} htmlFor="bot-description">
            Description
          </label>
          <div className={styles['bot-edit__control']}>
            <TextInput
              id="bot-description"
              value={description}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDescription(e.currentTarget.value)
              }
            />
            <p className={styles['bot-edit__help']}>
              (Optional) Let others know what this bot does.
            </p>
          </div>
        </div>

        <div className={styles['bot-edit__field']}>
          <label className={styles['bot-edit__label']} htmlFor="bot-role">
            Role
          </label>
          <div className={styles['bot-edit__control']}>
            <Select
              id="bot-role"
              value={role}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setRole(e.target.value)
              }
            >
              <option value="member">Member</option>
              <option value="system_admin">System Admin</option>
            </Select>
            <p className={styles['bot-edit__help']}>
              Choose what role the bot should have.
            </p>
          </div>
        </div>

        <div
          className={[
            styles['bot-edit__field'],
            styles['bot-edit__field--attrs'],
          ].join(' ')}
        >
          <span className={styles['bot-edit__label']}>Attributes</span>
          <div className={styles['bot-edit__control']}>
            <p className={styles['bot-edit__attrs-sub']}>
              Configure attributes and values for this bot
              <span className={styles['bot-edit__attrs-req']}>
                {' '}
                · Required attributes must be set
              </span>
            </p>

            <ul className={styles['bot-edit__attrs']}>
              {assigned.map((row) => {
                const attr = BOT_ATTRIBUTES.find(
                  (item) => item.id === row.attributeId,
                );
                if (!attr) return null;
                const missing =
                  showErrors && attr.required && !row.value.trim();
                const errorId = `bot-attr-error-${attr.id}`;
                return (
                  <li key={row.attributeId} className={styles['bot-edit__attr']}>
                    <span className={styles['bot-edit__attr-name']}>
                      {attr.label}
                      {attr.required && (
                        <span className={styles['bot-edit__req']} aria-hidden>
                          {' '}
                          *
                        </span>
                      )}
                    </span>
                    <div className={styles['bot-edit__attr-row']}>
                      <Select
                        value={row.value}
                        invalid={missing}
                        aria-label={attr.label}
                        aria-required={attr.required || undefined}
                        aria-describedby={missing ? errorId : undefined}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          setValue(row.attributeId, e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Select a value
                        </option>
                        {attr.values.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </Select>
                      {!attr.required && (
                        <IconButton
                          size="Small"
                          aria-label={`Remove ${attr.label}`}
                          icon={
                            <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                          }
                          onClick={() => removeValue(row.attributeId)}
                        />
                      )}
                    </div>
                    {missing && (
                      <div
                        id={errorId}
                        className={styles['bot-edit__attr-error']}
                      >
                        <ErrorMessage message={`${attr.label} is required`} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className={styles['bot-edit__add']} ref={pickerRef}>
              <Button
                emphasis="Tertiary"
                size="Small"
                trailingIcon={<Icon size="16" glyph={<ChevronDownIcon />} />}
                disabled={unused.length === 0}
                aria-expanded={pickerOpen}
                aria-haspopup="menu"
                onClick={() => setPickerOpen((open) => !open)}
              >
                Add attribute
              </Button>
              {pickerOpen && unused.length > 0 && (
                <div className={styles['bot-edit__menu']}>
                  <PopoverMenu aria-label="Add attribute">
                    {unused.map((attr) => (
                      <MenuItem
                        key={attr.id}
                        label={attr.label}
                        leadingElement={false}
                        onClick={() => addAttribute(attr.id)}
                      />
                    ))}
                  </PopoverMenu>
                </div>
              )}
            </div>
            <p className={styles['bot-edit__help']}>
              Clearance is required because Attribute Management marks it
              Required on Bots. Optional attributes can be added anytime.
            </p>
          </div>
        </div>

        <div className={styles['bot-edit__footer']}>
          <p className={styles['bot-edit__footer-text']}>
            Select additional permissions for the account.{' '}
            <a href="#roles" className={styles['bot-edit__link']}>
              Read more about roles and permissions.
            </a>
          </p>
          <div className={styles['bot-edit__actions']}>
            <Button emphasis="Tertiary" onClick={backToList}>
              Cancel
            </Button>
            <Button emphasis="Primary" onClick={handleCreate}>
              Create Bot Account
            </Button>
          </div>
        </div>
      </div>
    </IntegrationsBotShell>
  );
}
