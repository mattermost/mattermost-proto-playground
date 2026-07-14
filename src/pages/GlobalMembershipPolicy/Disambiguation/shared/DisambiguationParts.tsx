/**
 * Two-uses disambiguation — SHARED building blocks reused across the three
 * option scenes (O2 role framing, O4 split card, O6 tabbed revamp).
 *
 * These wrap the locked GMP data model + the committed ValuePicker (imported
 * READ-ONLY from LongForm/) so every option renders the same DS Program /
 * Dragon Spacecraft seed content with identical row grammar. Nothing here forks
 * or edits a committed scene — ValuePicker is imported by reference only.
 *
 * The one thing these parts add on top of the committed editor is the AXIS
 * ROLE MARKER: a person glyph on requirement rows ("member" side) and a
 * channels glyph on scope rows ("channel" side), plus a "Channel:" prefix that
 * stays anchored on any channel-attribute variable used inside a requirement.
 * That is the whole point of the disambiguation effort.
 */

import { useRef, useState } from 'react';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CheckAllIcon from '@mattermost/compass-icons/components/check-all';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';

import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import Switch from '@/components/ui/Switch/Switch';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useOutsideClose } from '@/hooks/useOutsideClose';

import ValuePicker from '@/pages/GlobalMembershipPolicy/LongForm/ValuePicker';
import {
  OPERATORS,
  USER_ATTRS,
  CHANNEL_VARIABLES,
  TERMS,
  userAttr,
  channelVar,
  type Requirement,
  type ChannelCondition,
  type ManualChannel,
  type ReqValue,
} from '@/pages/GlobalMembershipPolicy/gmpData';

import styles from './DisambiguationParts.module.scss';

const MULTI_OPERATORS = new Set(['is-one-of', 'includes-any']);

/** Person glyph = the "member" axis. Anchored on every requirement row. */
export function MemberGlyph({ size = '16' as const }: { size?: '12' | '16' }) {
  return (
    <span className={styles['axis-glyph']} data-axis="members" aria-hidden>
      <Icon size={size} glyph={<AccountOutlineIcon />} />
    </span>
  );
}

/** Channels glyph = the "channel" axis. Anchored on scope rows + the header. */
export function ChannelGlyph({ size = '16' as const }: { size?: '12' | '16' }) {
  return (
    <span className={styles['axis-glyph']} data-axis="channels" aria-hidden>
      <Icon size={size} glyph={<PoundIcon />} />
    </span>
  );
}

// ─── Requirement row (member axis) ───────────────────────────────────────────

export function RequirementRow({
  req,
  showAxisMarker = true,
  onChange,
  onRemove,
}: {
  req: Requirement;
  /** When false, the leading member marker is hidden (e.g. inside a Members-only tab). */
  showAxisMarker?: boolean;
  onChange: (next: Partial<Requirement>) => void;
  onRemove: () => void;
}) {
  const attr = userAttr(req.userAttrId);
  const kind = attr?.kind ?? 'ranked';
  const operators = OPERATORS[kind];
  const multi = MULTI_OPERATORS.has(req.operatorId);

  const changeUserAttr = (id: string) => {
    const next = userAttr(id);
    if (!next) return;
    onChange({
      userAttrId: id,
      operatorId: OPERATORS[next.kind][0].id,
      value: { mode: 'literal', labels: [] },
    });
  };

  const changeOperator = (operatorId: string) => {
    const nextMulti = MULTI_OPERATORS.has(operatorId);
    let value: ReqValue = req.value;
    if (!nextMulti && req.value.mode === 'literal' && req.value.labels.length > 1) {
      value = { mode: 'literal', labels: req.value.labels.slice(0, 1) };
    }
    onChange({ operatorId, value });
  };

  return (
    <div
      className={styles['row']}
      data-axis="members"
      data-marker={showAxisMarker ? 'on' : 'off'}
    >
      {showAxisMarker && (
        <span className={styles['row__marker']} aria-label="Member requirement">
          <MemberGlyph />
        </span>
      )}
      <div className={styles['row__cell']}>
        <select
          className={styles['row__select']}
          value={req.userAttrId}
          aria-label="User attribute"
          onChange={(e) => changeUserAttr(e.target.value)}
        >
          {USER_ATTRS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles['row__cell']}>
        <select
          className={styles['row__select']}
          value={req.operatorId}
          aria-label="Operator"
          onChange={(e) => changeOperator(e.target.value)}
        >
          {operators.map((op) => (
            <option key={op.id} value={op.id}>
              {op.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles['row__cell']}>
        <ValuePicker
          literalKey={req.userAttrId}
          kind={kind}
          value={req.value}
          multi={multi}
          onChange={(value) => onChange({ value })}
        />
      </div>
      <div className={styles['row__actions']}>
        <RowMenu label="Remove requirement" onRemove={onRemove} />
      </div>
    </div>
  );
}

// ─── Channel condition row (channel axis) ────────────────────────────────────

export function ChannelConditionRow({
  cond,
  showAxisMarker = true,
  onChange,
  onRemove,
}: {
  cond: ChannelCondition;
  showAxisMarker?: boolean;
  onChange: (next: Partial<ChannelCondition>) => void;
  onRemove: () => void;
}) {
  const attr = channelVar(cond.channelAttrId);
  const kind = attr?.kind ?? 'select';
  const operators = OPERATORS[kind];
  const literalKey = attr?.id.replace('ch-', '') ?? '';
  const multi = MULTI_OPERATORS.has(cond.operatorId);

  const changeAttr = (id: string) => {
    const next = channelVar(id);
    if (!next) return;
    onChange({
      channelAttrId: id,
      operatorId: OPERATORS[next.kind][0].id,
      labels: [],
    });
  };

  const value: ReqValue = { mode: 'literal', labels: cond.labels };
  const handleValue = (next: ReqValue) => {
    onChange({ labels: next.mode === 'literal' ? next.labels : [] });
  };

  return (
    <div
      className={styles['row']}
      data-axis="channels"
      data-marker={showAxisMarker ? 'on' : 'off'}
    >
      {showAxisMarker && (
        <span className={styles['row__marker']} aria-label="Channel condition">
          <ChannelGlyph />
        </span>
      )}
      <div className={styles['row__cell']}>
        <select
          className={styles['row__select']}
          value={cond.channelAttrId}
          aria-label="Channel attribute"
          onChange={(e) => changeAttr(e.target.value)}
        >
          {CHANNEL_VARIABLES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label.replace('Channel: ', '')}
            </option>
          ))}
        </select>
      </div>
      <div className={styles['row__cell']}>
        <select
          className={styles['row__select']}
          value={cond.operatorId}
          aria-label="Operator"
          onChange={(e) => onChange({ operatorId: e.target.value })}
        >
          {operators.map((op) => (
            <option key={op.id} value={op.id}>
              {op.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles['row__cell']}>
        <ValuePicker
          literalKey={literalKey}
          kind={kind}
          value={value}
          multi={multi}
          hideVariables
          onChange={handleValue}
        />
      </div>
      <div className={styles['row__actions']}>
        <RowMenu label="Remove condition" onRemove={onRemove} />
      </div>
    </div>
  );
}

// ─── Row overflow menu ───────────────────────────────────────────────────────

function RowMenu({ label, onRemove }: { label: string; onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  return (
    <div className={styles['row-menu']} ref={open ? ref : undefined}>
      <IconButton
        size="X-Small"
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={open}
        icon={<Icon size="16" glyph={<DotsVerticalIcon />} />}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div className={styles['row-menu__pop']}>
          <PopoverMenu aria-label="Row actions">
            <MenuItem
              label={label}
              destructive
              leadingVisual={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
              onClick={() => {
                setOpen(false);
                onRemove();
              }}
            />
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}

// ─── Match-mode (All / Any) menu ─────────────────────────────────────────────

export function AllRequiredMenu({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  return (
    <div className={styles['allreq']} ref={open ? ref : undefined}>
      <button
        type="button"
        className={styles['allreq__trigger']}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {value ? TERMS.allRequired : TERMS.anyMatch}
        <Icon size="12" glyph={<ChevronDownIcon />} />
      </button>
      {open && (
        <div className={styles['allreq__pop']}>
          <PopoverMenu aria-label="Match mode">
            <MenuItem
              label={TERMS.allRequired}
              secondaryLabel="A user must satisfy every row"
              secondaryLabelPosition="Below"
              leadingVisual={<Icon size="16" glyph={<CheckAllIcon />} />}
              active={value}
              trailingElement={value}
              onClick={() => {
                onChange(true);
                setOpen(false);
              }}
            />
            <MenuItem
              label={TERMS.anyMatch}
              secondaryLabel="A user must satisfy at least one row"
              secondaryLabelPosition="Below"
              leadingVisual={<Icon size="16" glyph={<CheckCircleOutlineIcon />} />}
              active={!value}
              trailingElement={!value}
              onClick={() => {
                onChange(false);
                setOpen(false);
              }}
            />
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}

// ─── Manual channel table (channel axis) ─────────────────────────────────────

export function ManualChannelTable({
  channels,
  onToggleAutoAdd,
  onRemove,
}: {
  channels: ManualChannel[];
  onToggleAutoAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={styles['manual']}>
      <div className={styles['manual__toolbar']}>
        <div className={styles['manual__search']}>
          <SearchInput size="Small" placeholder="Search" aria-label="Search channels" />
        </div>
        <button type="button" className={styles['manual__filters']}>
          <Icon size="16" glyph={<FilterVariantIcon />} />
          Filters
        </button>
        <div className={styles['manual__add']}>
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          >
            Add channels
          </Button>
        </div>
      </div>

      {channels.length === 0 ? (
        <div className={styles['empty']}>
          <p className={styles['empty__title']}>No channels selected yet.</p>
          <p className={styles['empty__body']}>
            Add channels to apply this policy to a specific set.
          </p>
        </div>
      ) : (
        <>
          <div className={styles['ctable']}>
            <div className={[styles['ctable__row'], styles['ctable__head']].join(' ')}>
              <span>Name</span>
              <span>Team</span>
              <span className={styles['ctable__autoadd-head']}>
                Auto-add members
                <span className={styles['ctable__info']} aria-hidden>
                  <Icon size="12" glyph={<InformationOutlineIcon />} />
                </span>
              </span>
              <span />
            </div>
            {channels.map((c) => (
              <div key={c.id} className={styles['ctable__row']}>
                <span className={styles['ctable__name']}>
                  {c.private && (
                    <span className={styles['ctable__lock']} aria-label="Private">
                      <Icon size="12" glyph={<LockOutlineIcon />} />
                    </span>
                  )}
                  {c.name}
                </span>
                <span className={styles['ctable__team']}>{c.team}</span>
                <span className={styles['ctable__autoadd']}>
                  <Switch
                    size="Small"
                    checked={c.autoAdd}
                    onChange={() => onToggleAutoAdd(c.id)}
                  />
                  <span className={styles['ctable__autoadd-state']}>
                    {c.autoAdd ? 'On' : 'Off'}
                  </span>
                </span>
                <button
                  type="button"
                  className={styles['ctable__remove']}
                  onClick={() => onRemove(c.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className={styles['ctable__footer']}>
            <span className={styles['ctable__pagination']}>
              1–{channels.length} of {channels.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
