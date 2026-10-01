import { useState, type ReactNode } from 'react';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CloseIcon from '@mattermost/compass-icons/components/close';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import EqualIcon from '@mattermost/compass-icons/components/equal';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import TextShortIcon from '@mattermost/compass-icons/components/text-short';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import AcvcScreenNav from '../components/AcvcScreenNav';
import AcvcStage from '../components/AcvcStage';
import {
  ARCHIVE_TAB,
  CHANNEL_ACTIONS,
  CHANNEL_NAME,
  CHANNEL_POLICY_COPY as C,
  CHANNEL_ROLE_OPTIONS,
  CHANNEL_RULES,
  RULE_CONDITIONS,
  SELECTED_CHANNEL_ROLE,
  SELF_EXCLUSION,
  SETTINGS_TABS,
} from '../channelPolicyData';
import styles from './ChannelAuthoringScene.module.scss';

const SCREENS = [
  { id: 'list', label: 'Rules list' },
  { id: 'editor', label: 'Rule editor' },
  { id: 'blocked', label: 'Self-inclusion block' },
] as const;

type ScreenId = (typeof SCREENS)[number]['id'];

const TAB_ICONS: Record<string, ReactNode> = {
  info: <InformationOutlineIcon />,
  configuration: <CogOutlineIcon />,
  membership: <ShieldOutlineIcon />,
  permissions: <LockOutlineIcon />,
  actions: <LightningBoltOutlineIcon />,
};

/** The Channel Settings modal chrome: title bar plus the left-hand tab rail. */
function SettingsFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles['chan']}>
      <header className={styles['chan__head']}>
        <h1 className={styles['chan__title']}>Channel Settings</h1>
        <span className={styles['chan__sep']} />
        <span className={styles['chan__channel']}>{CHANNEL_NAME}</span>
        <IconButton
          className={styles['chan__close']}
          size="small"
          icon={<Icon glyph={<CloseIcon />} size="20" />}
          aria-label="Close"
        />
      </header>

      <div className={styles['chan__body']}>
        <nav className={styles['chan__nav']} aria-label="Channel settings">
          {SETTINGS_TABS.map((tab) => (
            <span
              key={tab.id}
              aria-current={tab.id === 'permissions' ? 'page' : undefined}
              className={[
                styles['chan__nav-item'],
                tab.id === 'permissions' ? styles['chan__nav-item--active'] : '',
              ]
                .join(' ')
                .trim()}
            >
              <Icon glyph={TAB_ICONS[tab.id]} size="16" />
              {tab.label}
            </span>
          ))}
          <span className={styles['chan__nav-divider']} />
          <span className={styles['chan__nav-item']}>
            <Icon glyph={<ArchiveOutlineIcon />} size="16" />
            {ARCHIVE_TAB.label}
          </span>
        </nav>

        <div className={styles['chan__content']}>{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rules list                                                          */
/* ------------------------------------------------------------------ */

function RulesList() {
  return (
    <>
      <div className={styles['chan__section-head']}>
        <h2 className={styles['chan__section-title']}>{C.sectionTitle}</h2>
        <Button emphasis="primary">+ {C.addRule}</Button>
      </div>

      <div className={styles['chan__search']}>
        <SearchInput aria-label={C.searchPlaceholder} />
      </div>

      <table className={styles['chan__table']}>
        <thead>
          <tr>
            <th>{C.columnName}</th>
            <th>{C.columnPermissions}</th>
            <th className={styles['chan__cell-actions']} />
          </tr>
        </thead>
        <tbody>
          {CHANNEL_RULES.map((rule) => (
            <tr key={rule.name}>
              <td className={styles['chan__rule-name']}>{rule.name}</td>
              <td className={styles['chan__muted']}>
                {rule.permissions} {rule.permissions === 1 ? 'permission' : 'permissions'}
              </td>
              <td className={styles['chan__cell-actions']}>
                <IconButton
                  size="small"
                  icon={<Icon glyph={<DotsHorizontalIcon />} size="16" />}
                  aria-label="Rule actions"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles['chan__pagination']}>
        <span className={styles['chan__muted']}>{C.paginationRange}</span>
        <IconButton
          size="small"
          disabled
          icon={<Icon glyph={<ChevronLeftIcon />} size="16" />}
          aria-label="Previous page"
        />
        <IconButton
          size="small"
          disabled
          icon={<Icon glyph={<ChevronRightIcon />} size="16" />}
          aria-label="Next page"
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Rule editor                                                         */
/* ------------------------------------------------------------------ */

function RuleEditor({ blocked = false }: { blocked?: boolean }) {
  return (
    <>
      <div className={styles['chan__editor-head']}>
        <IconButton
          size="small"
          icon={<Icon glyph={<ArrowLeftIcon />} size="20" />}
          aria-label={C.back}
        />
        <h2 className={styles['chan__section-title']}>{C.editTitle}</h2>
      </div>

      {blocked ? (
        <div className={styles['chan__error']} role="alert">
          <Icon glyph={<AlertOutlineIcon />} size="20" />
          <div>
            <p className={styles['chan__error-title']}>{SELF_EXCLUSION.title}</p>
            <p className={styles['chan__error-body']}>{SELF_EXCLUSION.message}</p>
            <ul className={styles['chan__checks']}>
              {SELF_EXCLUSION.checks.map((check) => (
                <li
                  key={check.label}
                  className={[
                    styles['chan__check'],
                    check.pass ? styles['chan__check--pass'] : styles['chan__check--fail'],
                  ].join(' ')}
                >
                  <Icon glyph={check.pass ? <CheckIcon /> : <CloseIcon />} size="12" />
                  <span className={styles['chan__check-label']}>{check.label}</span>
                  <span className={styles['chan__check-value']}>{check.attribute}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className={styles['chan__field']}>
        <TextInput label={C.fieldName} defaultValue="Watchfloor viewing restriction" />
      </div>

      <hr className={styles['chan__rule']} />

      <section className={styles['chan__block']}>
        <h3 className={styles['chan__block-title']}>{C.fieldRole}</h3>
        <p className={styles['chan__block-hint']}>{C.roleHint}</p>
        <button type="button" className={styles['chan__select']} aria-haspopup="listbox">
          <span>{SELECTED_CHANNEL_ROLE}</span>
          <Icon glyph={<ChevronDownIcon />} size="20" />
        </button>
        <p className={styles['chan__role-note']}>
          {
            CHANNEL_ROLE_OPTIONS.find((r) => r.value === SELECTED_CHANNEL_ROLE)
              ?.description
          }
        </p>
      </section>

      <section className={styles['chan__block']}>
        <div className={styles['chan__block-head']}>
          <div>
            <h3 className={styles['chan__block-title']}>{C.fieldExpression}</h3>
            <p className={styles['chan__block-hint']}>
              Define rules based on user attributes and values
            </p>
          </div>
          <div className={styles['chan__modes']}>
            <span className={[styles['chan__mode'], styles['chan__mode--active']].join(' ')}>
              Simple
            </span>
            <span className={styles['chan__mode']}>Advanced</span>
          </div>
        </div>

        <div className={styles['chan__table-wrap']}>
          <table className={styles['chan__table']}>
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Operator</th>
                <th>Values</th>
                <th className={styles['chan__cell-actions']} />
              </tr>
            </thead>
            <tbody>
              {RULE_CONDITIONS.map((row) => (
                <tr key={row.attribute}>
                  <td>
                    <span className={styles['chan__cell-icon']}>
                      <Icon glyph={<TextShortIcon />} size="16" />
                      {row.attribute}
                    </span>
                  </td>
                  <td className={styles['chan__muted']}>
                    <span className={styles['chan__cell-icon']}>
                      <Icon glyph={<EqualIcon />} size="16" />
                      {row.operator}
                    </span>
                  </td>
                  <td>{row.value}</td>
                  <td className={styles['chan__cell-actions']}>
                    <IconButton
                      size="small"
                      destructive
                      icon={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
                      aria-label={`Remove ${row.attribute} condition`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles['chan__table-foot']}>
            <Button emphasis="tertiary" size="small">
              + Select user attribute
            </Button>
          </div>
        </div>
      </section>

      <section className={styles['chan__block']}>
        <h3 className={styles['chan__block-title']}>{C.fieldActions}</h3>
        <p className={styles['chan__block-hint']}>{C.actionsHint}</p>

        <div className={styles['chan__table-wrap']}>
          <table className={styles['chan__table']}>
            <thead>
              <tr>
                <th>{C.actionsColumn}</th>
                <th>Description</th>
                <th className={styles['chan__cell-actions']} />
              </tr>
            </thead>
            <tbody>
              {CHANNEL_ACTIONS.map((action) => (
                <tr key={action.name}>
                  <td className={styles['chan__rule-name']}>{action.name}</td>
                  <td className={styles['chan__muted']}>{action.description}</td>
                  <td className={styles['chan__cell-actions']}>
                    <IconButton
                      size="small"
                      destructive
                      icon={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
                      aria-label={`Remove ${action.name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles['chan__table-foot']}>
            <Button emphasis="tertiary" size="small">
              + {C.actionsAdd}
            </Button>
          </div>
        </div>

        <p className={styles['chan__or-hint']}>{C.orHint}</p>
      </section>

      <div className={styles['chan__footer']}>
        <Button emphasis="tertiary">{C.cancel}</Button>
        <Button emphasis="primary" disabled={blocked}>
          {C.save}
        </Button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

const COPY: Record<ScreenId, { title: string; note: ReactNode }> = {
  list: {
    title: 'Channel Settings → Permissions Policy — the rules list',
    note: (
      <>
        The channel-scoped equivalent of the System Console policy list, reached by a channel admin
        from inside the channel itself. Entirely inherited chrome — Read Channels and Write to Channels
        change nothing here except that a rule can now carry either, which shows up only in the
        permissions count. The observer-posting rule is the maintenance / mission case: Read stays
        at implicit allow, Write to Channels is granted only to participants.
      </>
    ),
  },
  editor: {
    title: 'Rule editor — Read Channels and Write to Channels alongside the file actions',
    note: (
      <>
        Same shape as the system-scope editor, with channel-scoped roles (Channel admin / Channel
        member / Channel guest) and channel-scoped action descriptions. Write to Channels is a separate
        row; it does not imply Read Channels, and a grant to post is refused if Read is denied.{' '}
        Channel rules OR together, but{' '}
        <strong>a system-level policy can still deny what this rule allows</strong> — so a channel
        admin cannot un-hide a channel the system policy hides, and cannot restore posting the
        system policy has taken away.
      </>
    ),
  },
  blocked: {
    title: 'Self-inclusion check — save is blocked, not warned',
    note: (
      <>
        The trap this surface has and System Console does not: Channel Settings is reached from
        inside the channel, so an admin who hides it from themselves cannot get back in to undo it.
        Save is therefore <strong>blocked</strong>, matching the shipped membership-policy
        self-exclusion check rather than a dismissable warning. Because Read Channels is evaluated
        per session, the check has to test the author&rsquo;s{' '}
        <strong>current session</strong> as well as their stored attributes — which is why the
        Network row fails here while Clearance passes.
      </>
    ),
  },
};

export default function ChannelAuthoringScene() {
  const [screen, setScreen] = useState<ScreenId>('editor');

  return (
    <div className={styles['chan-scene']}>
      <AcvcScreenNav
        screens={SCREENS}
        activeId={screen}
        onChange={(id) => setScreen(id as ScreenId)}
        ariaLabel="Channel authoring screen"
      />
      <AcvcStage variant="console" title={COPY[screen].title} note={COPY[screen].note}>
        <SettingsFrame>
          {screen === 'list' ? <RulesList /> : <RuleEditor blocked={screen === 'blocked'} />}
        </SettingsFrame>
      </AcvcStage>
    </div>
  );
}
