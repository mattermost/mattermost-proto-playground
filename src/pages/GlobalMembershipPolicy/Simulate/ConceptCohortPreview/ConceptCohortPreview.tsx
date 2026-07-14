/**
 * GMP Simulate — CONCEPT B · Live Inline Cohort Preview.
 *
 * Distinct mental model: the subject is the ATTRIBUTE EXPRESSION / cohort it
 * defines — not a channel, not a person. The output is a LIVE, bucketed count
 * shown inline in the requirement-authoring row (e.g. "~20–50 users match")
 * that updates as the admin edits the expression. No modal, no picker, no
 * explicit "Run" — the feedback is ambient, the earliest signal in the funnel.
 *
 * This is a small mock requirement-builder (NOT the real LongForm editor) so the
 * inline-badge interaction can be isolated for review.
 *
 * Over-clearance handling: user-attribute side only, coarse buckets, entitlement-
 * scoped. Channel-variable rows preview the user-side population only; an
 * unentitled attribute renders "count unavailable" rather than a number.
 *
 * OD-1 [VERIFY WITH SECURITY]: whether a bucketed workspace cohort count is safe
 * to expose in an IL5 tenant gates whether this concept ships at all.
 *
 * Deep-links: ?state=idle|debouncing|populated|suppressed|broad|narrow|
 * variable|error, ?policy=<id>.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';

import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import Icon from '@/components/ui/Icon/Icon';
import Select from '@/components/ui/Select/Select';
import Spinner from '@/components/ui/Spinner/Spinner';
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';

import avatarLeonard from '@/assets/avatars/Leonard Riley.png';

import {
  SIMULATE_ADMIN,
  USER_ATTRS,
  OPERATORS,
  LITERALS,
  cohortPreview,
  COHORT_AUDIT_NOTE,
  COHORT_VARIABLE_ROW_NOTE,
  policyById,
  type AttrKind,
  type CohortPreview,
} from '@/pages/GlobalMembershipPolicy/gmpData';
import { GMP_ROUTES, GMP_SIDEBAR_CATEGORIES } from '@/pages/GlobalMembershipPolicy/gmpConsole';

import styles from './ConceptCohortPreview.module.scss';

type ScreenState =
  | 'idle'
  | 'debouncing'
  | 'populated'
  | 'suppressed'
  | 'broad'
  | 'narrow'
  | 'variable'
  | 'error';

const VALID_STATES: ScreenState[] = [
  'idle',
  'debouncing',
  'populated',
  'suppressed',
  'broad',
  'narrow',
  'variable',
  'error',
];

function readParams() {
  return typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
}

interface RowDraft {
  userAttrId: string | null;
  operatorId: string | null;
  value: string | null;
  /** Variable-mode row: compares to a channel attribute (user-side count only). */
  variable: boolean;
  /** Entitlement toggle — a suppressed row for an attribute the admin can't preview. */
  entitled: boolean;
}

/** Seed a row to match a deep-linked state. */
function seedRow(state: ScreenState): RowDraft {
  switch (state) {
    case 'populated':
      return { userAttrId: 'clearance', operatorId: 'at-least', value: 'Secret', variable: false, entitled: true };
    case 'broad':
      return { userAttrId: 'clearance', operatorId: 'at-least', value: 'Unclassified', variable: false, entitled: true };
    case 'narrow':
      return { userAttrId: 'nationality', operatorId: 'is', value: 'AUS', variable: false, entitled: true };
    case 'suppressed':
      return { userAttrId: 'department', operatorId: 'is', value: 'Intelligence', variable: false, entitled: false };
    case 'variable':
      return { userAttrId: 'clearance', operatorId: 'at-least', value: '__channel__', variable: true, entitled: true };
    case 'debouncing':
      return { userAttrId: 'clearance', operatorId: 'at-least', value: 'Top Secret', variable: false, entitled: true };
    default:
      return { userAttrId: null, operatorId: null, value: null, variable: false, entitled: true };
  }
}

/** The live inline badge — the load-bearing element of this concept. */
function CohortBadge({
  preview,
  debouncing,
  variable,
}: {
  preview: CohortPreview;
  debouncing: boolean;
  variable: boolean;
}) {
  if (debouncing) {
    return (
      <span
        className={[styles['cohort__badge'], styles['cohort__badge--debouncing']]
          .filter(Boolean)
          .join(' ')}
      >
        <Spinner size={12} />
        <span>counting…</span>
      </span>
    );
  }

  if (preview.label === '') return null;

  const toneClass =
    preview.tone === 'broad'
      ? styles['cohort__badge--broad']
      : preview.tone === 'narrow'
        ? styles['cohort__badge--narrow']
        : preview.tone === 'suppressed'
          ? styles['cohort__badge--suppressed']
          : styles['cohort__badge--neutral'];

  return (
    <span
      className={[styles['cohort__badge'], toneClass].filter(Boolean).join(' ')}
      title={variable ? COHORT_VARIABLE_ROW_NOTE : preview.hint}
    >
      {preview.tone === 'suppressed' ? (
        <Icon size="12" glyph={<ShieldOutlineIcon />} />
      ) : (
        <Icon size="12" glyph={<AccountMultipleOutlineIcon />} />
      )}
      <span>{preview.label}</span>
    </span>
  );
}

export default function ConceptCohortPreview() {
  const navigate = useNavigate();
  const params = readParams();

  const stateParam = params.get('state') as ScreenState | null;
  const initialState: ScreenState =
    stateParam && VALID_STATES.includes(stateParam) ? stateParam : 'idle';

  const policyParam = params.get('policy');
  const policyName = policyById(policyParam ?? '')?.name ?? 'DS Program';

  const [row, setRow] = useState<RowDraft>(seedRow(initialState));
  const [debouncing, setDebouncing] = useState(initialState === 'debouncing');
  const [errored] = useState(initialState === 'error');
  const [active, setActive] = useState('membership-policies');
  const debounceRef = useRef<number | null>(null);

  const attr = USER_ATTRS.find((a) => a.id === row.userAttrId) ?? null;
  const kind: AttrKind = attr?.kind ?? 'ranked';
  const operators = OPERATORS[kind];
  const literals = row.userAttrId ? (LITERALS[row.userAttrId] ?? []) : [];

  // Live, debounced cohort preview — the ambient signal.
  const preview = useMemo<CohortPreview>(() => {
    if (errored) return { label: '', tone: 'neutral', hint: '' };
    if (row.variable) {
      // Variable-mode: user-side population only, at-least Secret baseline.
      return cohortPreview('clearance', 'at-least', 'Secret', row.entitled);
    }
    return cohortPreview(row.userAttrId, row.operatorId, row.value, row.entitled);
  }, [row, errored]);

  const handleSidebarClick = (itemId: string) => {
    setActive(itemId);
    if (itemId === 'membership-policies') navigate(GMP_ROUTES.list);
  };

  // Any edit triggers a brief debounce pulse before the badge settles.
  const pulse = () => {
    setDebouncing(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setDebouncing(false), 450);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const patch = (next: Partial<RowDraft>) => {
    setRow((r) => ({ ...r, ...next }));
    pulse();
  };

  return (
    <div className={styles['cohort']}>
      <ConsoleSidebar
        avatarSrc={avatarLeonard}
        avatarAlt={SIMULATE_ADMIN.name}
        username={SIMULATE_ADMIN.username}
        categories={GMP_SIDEBAR_CATEGORIES}
        activeItemId={active}
        onItemClick={handleSidebarClick}
      />

      <div className={styles['cohort__center']}>
        <ConsolePageHeader
          title={`New membership policy — ${policyName}`}
          subtitle="As you write each requirement, see roughly how many members match — before you save"
          backButton
          onBack={() => navigate(GMP_ROUTES.editor)}
        />

        <div className={styles['cohort__scroll']}>
          <div className={styles['cohort__page']}>
            <div className={styles['cohort__section']}>
              <span className={styles['cohort__section-title']}>Membership requirements</span>
              <span className={styles['cohort__section-sub']}>
                Set the attribute conditions a member must meet. The count next to each row is an
                approximate, bucketed preview of the matching population.
              </span>

              {errored ? null : (
                <div className={styles['cohort__row']}>
                  <span className={styles['cohort__row-lead']}>Member</span>

                  <Select
                    size="Small"
                    width="fit"
                    value={row.userAttrId ?? ''}
                    onChange={(e) => {
                      const id = e.currentTarget.value || null;
                      const nextKind = USER_ATTRS.find((a) => a.id === id)?.kind ?? 'ranked';
                      patch({
                        userAttrId: id,
                        operatorId: OPERATORS[nextKind][0]?.id ?? null,
                        value: null,
                        variable: false,
                        entitled: id !== 'department',
                      });
                    }}
                  >
                    <option value="">Choose attribute…</option>
                    {USER_ATTRS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    size="Small"
                    width="fit"
                    value={row.operatorId ?? ''}
                    disabled={!row.userAttrId}
                    onChange={(e) => patch({ operatorId: e.currentTarget.value || null })}
                  >
                    {operators.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.label}
                      </option>
                    ))}
                  </Select>

                  {row.variable ? (
                    <span className={styles['cohort__variable']}>Channel: Classification</span>
                  ) : (
                    <Select
                      size="Small"
                      width="fit"
                      value={row.value ?? ''}
                      disabled={!row.userAttrId}
                      onChange={(e) => patch({ value: e.currentTarget.value || null })}
                    >
                      <option value="">Choose value…</option>
                      {literals.map((lit) => (
                        <option key={lit.id} value={lit.label}>
                          {lit.label}
                        </option>
                      ))}
                    </Select>
                  )}

                  {/* The live inline cohort badge */}
                  <CohortBadge
                    preview={preview}
                    debouncing={debouncing}
                    variable={row.variable}
                  />
                </div>
              )}

              {errored && (
                <div className={styles['cohort__row']}>
                  <span className={styles['cohort__row-lead']}>Member</span>
                  <Select size="Small" width="fit" value="clearance" readOnly>
                    <option value="clearance">User: Clearance</option>
                  </Select>
                  <Select size="Small" width="fit" value="at-least" readOnly>
                    <option value="at-least">is at least</option>
                  </Select>
                  <Select size="Small" width="fit" value="Secret" readOnly>
                    <option value="Secret">Secret</option>
                  </Select>
                  <span
                    className={[styles['cohort__badge'], styles['cohort__badge--error']]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <Icon size="12" glyph={<AlertOutlineIcon />} />
                    <span>count unavailable — service offline</span>
                  </span>
                </div>
              )}

              <button type="button" className={styles['cohort__add']}>
                <Icon size="16" glyph={<PlusIcon />} />
                Add requirement
              </button>

              {row.variable && (
                <div className={styles['cohort__note']}>
                  <Icon size="16" glyph={<InformationOutlineIcon />} />
                  <span>{COHORT_VARIABLE_ROW_NOTE}</span>
                </div>
              )}

              {preview.tone === 'suppressed' && !errored && (
                <SectionNotice
                  type="Warning"
                  icon={<Icon size="20" glyph={<ShieldOutlineIcon />} />}
                  title="Preview unavailable for this attribute"
                  description="You aren’t entitled to preview the matching population for this attribute. Choose an attribute you own, or save and run a full simulation."
                />
              )}

              {preview.tone === 'broad' && !errored && (
                <SectionNotice
                  type="Warning"
                  icon={<Icon size="20" glyph={<AlertOutlineIcon />} />}
                  title="This requirement matches a very broad population"
                  description="A requirement this broad may not narrow membership meaningfully. Consider tightening the operator or value before you save."
                />
              )}

              {preview.tone === 'narrow' && !errored && (
                <SectionNotice
                  type="Info"
                  icon={<Icon size="20" glyph={<InformationOutlineIcon />} />}
                  title="This requirement may match no one"
                  description="No members appear to hold this value. Saving would remove nearly everyone from in-scope private channels. Double-check the value."
                />
              )}
            </div>

            <div className={styles['cohort__audit']}>
              <Icon size="12" glyph={<InformationOutlineIcon />} />
              <span>{COHORT_AUDIT_NOTE}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
