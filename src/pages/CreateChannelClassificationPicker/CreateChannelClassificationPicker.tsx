import { useRef, useState } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CheckIcon from '@mattermost/compass-icons/components/check';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  CLASSIFICATION_PICKER,
  RELEASABILITY_OPTIONS,
  type PickerNode,
} from './ccData';
import styles from './CreateChannelClassificationPicker.module.scss';

type ScreenState =
  | 'default'
  | 'populated'
  | 'loading'
  | 'error'
  | 'disabled'
  | 'empty';

const VALID_STATES: ScreenState[] = [
  'default',
  'populated',
  'loading',
  'error',
  'disabled',
  'empty',
];

export default function CreateChannelClassificationPicker() {
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const stateParam = params.get('state') as ScreenState | null;
  const state: ScreenState =
    stateParam && VALID_STATES.includes(stateParam) ? stateParam : 'default';

  const disabled = state === 'disabled';
  const loading = state === 'loading';
  const error = state === 'error';

  const [channelType, setChannelType] = useState<'public' | 'private'>(
    'public',
  );
  const [name, setName] = useState(
    state === 'populated' || state === 'error' || state === 'disabled'
      ? 'Operation Aurora'
      : '',
  );
  const [purpose, setPurpose] = useState('');
  const [classification, setClassification] = useState<string | null>(
    state === 'populated' || state === 'disabled'
      ? 'Unclassified — TLP-AMBER'
      : state === 'error'
        ? 'Protected B'
        : null,
  );
  const [releasability, setReleasability] = useState<string[]>(
    state === 'populated' ? ['REL TO GBR', 'REL TO CAN'] : [],
  );

  const url = name
    ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : '';

  return (
    <div className={styles['scene']}>
      <div className={styles['scene__backdrop']} aria-hidden>
        <div className={styles['scene__team-rail']}>
          <span className={styles['scene__team']}>DR</span>
          <span className={styles['scene__team scene__team--muted']}>To</span>
          <span className={styles['scene__team scene__team--muted']}>Ac</span>
        </div>
        <div className={styles['scene__channel-rail']}>
          <span className={styles['scene__rail-title']}>Channels</span>
          {[
            'General Updates',
            'Internal Records',
            'Field Ops',
            'Restricted HQ',
            'Operation Aurora',
            'SecOps',
            'Compliance',
          ].map((c) => (
            <span key={c} className={styles['scene__rail-item']}>
              <Icon size="12" glyph={<LockOutlineIcon />} />
              {c}
            </span>
          ))}
        </div>
        <div className={styles['scene__main']} />
      </div>

      <div className={styles['scene__scrim']}>
        <Modal
          size="Small"
          title="Create a new channel"
          onClose={() => undefined}
          footer={
            <div className={styles['modal-footer']}>
              <Button emphasis="Tertiary">Cancel</Button>
              <Button emphasis="Primary" disabled={disabled || !name}>
                Save
              </Button>
            </div>
          }
        >
          <div
            className={[
              styles['form'],
              disabled ? styles['form--disabled'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {/* Public / Private */}
            <div className={styles['form__type']}>
              <button
                type="button"
                className={[
                  styles['form__type-card'],
                  channelType === 'public'
                    ? styles['form__type-card--active']
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={disabled}
                onClick={() => setChannelType('public')}
              >
                <span className={styles['form__type-icon']}>
                  <Icon size="20" glyph={<GlobeIcon />} />
                </span>
                <span className={styles['form__type-text']}>
                  <span className={styles['form__type-title']}>
                    Public Channel
                  </span>
                  <span className={styles['form__type-sub']}>
                    Anyone can join
                  </span>
                </span>
                {channelType === 'public' && (
                  <span className={styles['form__type-check']}>
                    <Icon size="16" glyph={<CheckIcon />} />
                  </span>
                )}
              </button>
              <button
                type="button"
                className={[
                  styles['form__type-card'],
                  channelType === 'private'
                    ? styles['form__type-card--active']
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={disabled}
                onClick={() => setChannelType('private')}
              >
                <span className={styles['form__type-icon']}>
                  <Icon size="20" glyph={<LockOutlineIcon />} />
                </span>
                <span className={styles['form__type-text']}>
                  <span className={styles['form__type-title']}>
                    Private Channel
                  </span>
                  <span className={styles['form__type-sub']}>
                    Only invited members
                  </span>
                </span>
                {channelType === 'private' && (
                  <span className={styles['form__type-check']}>
                    <Icon size="16" glyph={<CheckIcon />} />
                  </span>
                )}
              </button>
            </div>

            {/* Name */}
            <div className={styles['form__field']}>
              <input
                className={[
                  styles['form__input'],
                  error && !name ? styles['form__input--error'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                placeholder="Channel name"
                value={name}
                disabled={disabled}
                onChange={(e) => setName(e.target.value)}
              />
              <p className={styles['form__url']}>URL: {url || '—'}</p>
            </div>

            {/* Purpose */}
            <div className={styles['form__field']}>
              <textarea
                className={styles['form__textarea']}
                placeholder="Purpose (optional)"
                value={purpose}
                disabled={disabled}
                rows={2}
                onChange={(e) => setPurpose(e.target.value)}
              />
              <p className={styles['form__help']}>
                Describe how this channel should be used
              </p>
            </div>

            {/* Channel attributes */}
            <div className={styles['form__attrs']}>
              <h3 className={styles['form__attrs-title']}>Channel attributes</h3>
              <p className={styles['form__attrs-help']}>
                When selected, attribute values will appear for this channel in
                the header and the info panel
              </p>

              {loading ? (
                <div className={styles['form__attrs-loading']}>
                  <Spinner size={16} />
                  <span>Loading available attribute values…</span>
                </div>
              ) : (
                <div className={styles['form__attrs-rows']}>
                  {/* Classification — cascading hierarchical picker */}
                  <div className={styles['form__attr-row']}>
                    <span className={styles['form__attr-label']}>
                      <Icon size="12" glyph={<EyeOutlineIcon />} />
                      Classification
                    </span>
                    <ClassificationField
                      value={classification}
                      disabled={disabled}
                      invalid={error && classification === 'Protected B'}
                      onChange={setClassification}
                    />
                  </div>

                  {error && classification === 'Protected B' && (
                    <p className={styles['form__attr-error']}>
                      <Icon size="12" glyph={<AlertCircleOutlineIcon />} />
                      Protected B is above your clearance. Choose a value at or
                      below your own Clearance.
                    </p>
                  )}

                  {/* Releasability — separate multiselect field */}
                  <div className={styles['form__attr-row']}>
                    <span className={styles['form__attr-label']}>
                      <Icon size="12" glyph={<EyeOutlineIcon />} />
                      Releasability
                    </span>
                    <ReleasabilityField
                      value={releasability}
                      disabled={disabled}
                      onChange={setReleasability}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

// ─── Cascading Classification picker ────────────────────────────────────────

function ClassificationField({
  value,
  disabled,
  invalid,
  onChange,
}: {
  value: string | null;
  disabled: boolean;
  invalid: boolean;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => {
    setOpen(false);
    setSubmenu(null);
  });

  const choose = (node: PickerNode) => {
    if (!node.selectable || !node.allowedForUser) return;
    onChange(node.selectionLabel ?? node.label);
    setOpen(false);
    setSubmenu(null);
  };

  return (
    <div className={styles['picker']} ref={open ? ref : undefined}>
      <button
        type="button"
        className={[
          styles['picker__trigger'],
          invalid ? styles['picker__trigger--error'] : '',
          !value ? styles['picker__trigger--empty'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{value ?? 'Select classification'}</span>
        <Icon size="12" glyph={<ChevronDownIcon />} />
      </button>

      {open && (
        <div className={styles['picker__menu']} role="menu">
          {CLASSIFICATION_PICKER.map((node) => {
            const hasChildren = !!node.children?.length;
            const isSub = submenu === node.id;
            const selected =
              value != null && value === (node.selectionLabel ?? node.label);
            return (
              <div key={node.id} className={styles['picker__item-wrap']}>
                <button
                  type="button"
                  role="menuitem"
                  className={[
                    styles['picker__item'],
                    !node.allowedForUser && !hasChildren
                      ? styles['picker__item--disabled']
                      : '',
                    selected ? styles['picker__item--selected'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={!hasChildren && !node.allowedForUser}
                  onClick={() => {
                    if (hasChildren) {
                      setSubmenu((s) => (s === node.id ? null : node.id));
                    } else {
                      choose(node);
                    }
                  }}
                  onMouseEnter={() =>
                    hasChildren ? setSubmenu(node.id) : setSubmenu(null)
                  }
                >
                  <span className={styles['picker__item-label']}>
                    {node.label}
                    {!node.allowedForUser && !hasChildren && (
                      <span className={styles['picker__item-note']}>
                        above your clearance
                      </span>
                    )}
                  </span>
                  {hasChildren && (
                    <Icon size="16" glyph={<ChevronRightIcon />} />
                  )}
                  {selected && !hasChildren && (
                    <Icon size="16" glyph={<CheckIcon />} />
                  )}
                </button>

                {hasChildren && isSub && (
                  <div className={styles['picker__submenu']} role="menu">
                    {node.children!.map((child) => {
                      const childSelected =
                        value != null &&
                        value === (child.selectionLabel ?? child.label);
                      return (
                        <button
                          key={child.id}
                          type="button"
                          role="menuitem"
                          className={[
                            styles['picker__item'],
                            !child.allowedForUser
                              ? styles['picker__item--disabled']
                              : '',
                            childSelected
                              ? styles['picker__item--selected']
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          disabled={!child.allowedForUser}
                          onClick={() => choose(child)}
                        >
                          <span className={styles['picker__item-label']}>
                            {child.label}
                          </span>
                          {childSelected && (
                            <Icon size="16" glyph={<CheckIcon />} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Releasability multiselect ──────────────────────────────────────────────

function ReleasabilityField({
  value,
  disabled,
  onChange,
}: {
  value: string[];
  disabled: boolean;
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  const toggle = (label: string) => {
    onChange(
      value.includes(label)
        ? value.filter((v) => v !== label)
        : [...value, label],
    );
  };

  return (
    <div className={styles['picker']} ref={open ? ref : undefined}>
      <button
        type="button"
        className={[
          styles['picker__trigger'],
          value.length === 0 ? styles['picker__trigger--empty'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        {value.length === 0 ? (
          <span>Select releasability</span>
        ) : (
          <span className={styles['picker__chips']}>
            {value.map((v) => (
              <Chip key={v} size="Small" tone="neutral">
                {v}
              </Chip>
            ))}
          </span>
        )}
        <Icon size="12" glyph={<ChevronDownIcon />} />
      </button>

      {open && (
        <div className={styles['picker__menu']} role="menu">
          {RELEASABILITY_OPTIONS.map((opt) => {
            const checked = value.includes(opt.label);
            return (
              <button
                key={opt.id}
                type="button"
                role="menuitemcheckbox"
                aria-checked={checked}
                className={[
                  styles['picker__item'],
                  checked ? styles['picker__item--selected'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => toggle(opt.label)}
              >
                <span className={styles['picker__item-label']}>
                  {opt.label}
                </span>
                {checked && <Icon size="16" glyph={<CheckIcon />} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
