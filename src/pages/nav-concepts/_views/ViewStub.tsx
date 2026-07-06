/**
 * Shared view stubs — one per Figma screen the user shared.
 *
 * Each stub is a low-fidelity but RECOGNIZABLE rendering of the corresponding
 * Figma view. Prototypes track an `activeView` state and render <ViewStub />
 * in the center pane based on that state. This lets every concept demonstrate
 * how navigation actually leads to each of the 12 destination views.
 */
import type { ReactNode } from 'react';
import { CLASSIFICATION_META, type Classification } from '../_shared/types';
import styles from './ViewStub.module.scss';

export type ViewId =
  | 'hub'
  | 'channel'
  | 'channel-rhs'
  | 'threads'
  | 'dm'
  | 'pages-recents'
  | 'pages-comments'
  | 'page-view'
  | 'agents-explore'
  | 'agents-edit'
  | 'playbooks-runs'
  | 'playbooks-run-detail'
  | 'playbooks-playbook-detail';

export const VIEW_META: Record<
  ViewId,
  { product: string; label: string; figmaRef: string }
> = {
  hub: { product: 'Hub', label: 'Cross-product Hub', figmaRef: '— (new in C02)' },
  channel: { product: 'Channels', label: 'Channel View', figmaRef: 'Figma #1' },
  'channel-rhs': { product: 'Channels', label: 'Channel + RHS open', figmaRef: 'Figma #2' },
  threads: { product: 'Channels', label: 'Threads inbox', figmaRef: 'Figma #3' },
  dm: { product: 'Channels', label: 'Direct Message', figmaRef: 'Figma #4' },
  'pages-recents': { product: 'Pages', label: 'Recents', figmaRef: 'Figma #6' },
  'pages-comments': { product: 'Pages', label: 'Page comments inbox', figmaRef: 'Figma #7' },
  'page-view': { product: 'Pages', label: 'Page viewer', figmaRef: 'Figma #8' },
  'agents-explore': { product: 'Agents', label: 'Explore catalog', figmaRef: 'Figma #9' },
  'agents-edit': { product: 'Agents', label: 'New / Edit agent', figmaRef: 'Figma #10' },
  'playbooks-runs': { product: 'Playbooks', label: 'Runs list', figmaRef: 'Figma #11' },
  'playbooks-run-detail': { product: 'Playbooks', label: 'Run detail', figmaRef: 'Figma #12' },
  'playbooks-playbook-detail': { product: 'Playbooks', label: 'Playbook detail', figmaRef: 'Figma #13' },
};

interface ViewStubProps {
  viewId: ViewId;
  classification?: Classification;
  /** Resource name override (e.g., "v6.4 Server Release" for a specific run). */
  resourceName?: string;
}

export default function ViewStub({ viewId, classification = 'unclass', resourceName }: ViewStubProps) {
  const meta = VIEW_META[viewId];
  const cls = CLASSIFICATION_META[classification];

  return (
    <div className={styles['vs']}>
      <header className={styles['vs__header']}>
        <span className={styles['vs__kicker']}>
          {meta.product} · {meta.figmaRef}
        </span>
        <h2 className={styles['vs__title']}>{resourceName ?? meta.label}</h2>
        <span
          className={styles['vs__cls']}
          style={{
            background: `rgba(${cls.rgb}, 0.16)`,
            color: cls.color,
            border: `1px solid rgba(${cls.rgb}, 0.32)`,
          }}
        >
          {cls.label}
        </span>
      </header>
      <div className={styles['vs__body']}>{renderView(viewId)}</div>
    </div>
  );
}

function renderView(id: ViewId): ReactNode {
  switch (id) {
    case 'hub':
      return <HubViewStub />;
    case 'channel':
      return <ChannelViewStub />;
    case 'channel-rhs':
      return <ChannelRhsViewStub />;
    case 'threads':
      return <ThreadsViewStub />;
    case 'dm':
      return <DmViewStub />;
    case 'pages-recents':
      return <PagesRecentsViewStub />;
    case 'pages-comments':
      return <PagesCommentsViewStub />;
    case 'page-view':
      return <PageViewStub />;
    case 'agents-explore':
      return <AgentsExploreViewStub />;
    case 'agents-edit':
      return <AgentsEditViewStub />;
    case 'playbooks-runs':
      return <PlaybooksRunsViewStub />;
    case 'playbooks-run-detail':
      return <PlaybooksRunDetailViewStub />;
    case 'playbooks-playbook-detail':
      return <PlaybooksPlaybookDetailViewStub />;
  }
}

// ─── Hub ──────────────────────────────────────────────────────────────────

function HubViewStub() {
  return (
    <div className={styles['vs__hub']}>
      <p className={styles['vs__note']}>
        Cross-product activity aggregator. See C02 prototype center for the full Hub
        layout (mentions, due updates, recent items, projects). When opened from
        other concepts, this stub stands in.
      </p>
      <ul className={styles['vs__list']}>
        <li>@Leonard mentioned you in UX Design — Staff <span>3m</span></li>
        <li>Update due in 6 days · v6.4 Server Release <span>12m</span></li>
        <li>New comment on Mission Analysis Wiki <span>24m</span></li>
        <li>3 tasks assigned · v6.4 Server Release <span>1h</span></li>
      </ul>
    </div>
  );
}

// ─── Channels family ──────────────────────────────────────────────────────

function ChannelViewStub() {
  return (
    <div className={styles['vs__chat']}>
      <div className={styles['vs__bookmark-bar']}>
        🔖 Mattermost homepage · Mission Directives · Mattermost docs <span>+</span>
      </div>
      <div className={styles['vs__messages']}>
        <Message author="Michael Whitfield" time="10:43" text="What are we doing for the logging points in our in-app purchases split test?" />
        <Message author="Ronald Richards" time="10:43" text="@Michael @Susan Here's the latest Mobile User Analytics Report I put together" attachment="Mobile User Analytics.pdf · 15KB" />
        <Message author="Leonard Riley" time="10:43" text="@Alex Think we could have the GitLab build pipeline trigger the release pipeline?" />
      </div>
      <div className={styles['vs__compose']}>
        <span>Message UX Design…</span>
      </div>
    </div>
  );
}

function ChannelRhsViewStub() {
  return (
    <div className={styles['vs__split']}>
      <div className={styles['vs__split-left']}>
        <ChannelViewStub />
      </div>
      <aside className={styles['vs__split-right']}>
        <div className={styles['vs__rhs-header']}>Thread <span>Following</span></div>
        <div className={styles['vs__messages']}>
          <Message author="Eric Schneider" time="10:43" text="What are we doing for the logging points in our in-app purchases split test?" />
          <Message author="Veronica Gordon" time="10:43" text="Odio in al rerum vel nulla facilisi velit." />
          <Message author="Chester Newman" time="10:43" text="Re: split test split — let's verify the funnel." />
        </div>
        <div className={styles['vs__compose']}>
          <span>Reply…</span>
        </div>
      </aside>
    </div>
  );
}

function ThreadsViewStub() {
  return (
    <div className={styles['vs__split']}>
      <div className={styles['vs__split-narrow']}>
        <div className={styles['vs__inbox-header']}>
          <span className={styles['vs__inbox-tab']}>All your threads</span>
          <span className={styles['vs__inbox-tab-muted']}>Unreads</span>
        </div>
        <ul className={styles['vs__inbox-list']}>
          {['Leonard Riley · UX Design — replied 3m', 'Pauline Burton · Contributors — 1h', 'Jenny Bilt · Cloud Ops — 2h', 'Martin Newman · Avalanche — 1d', 'Eric Schneider · UX Design — 1d'].map(t => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <div className={styles['vs__split-right']}>
        <div className={styles['vs__rhs-header']}>Selected thread · Following</div>
        <div className={styles['vs__messages']}>
          <Message author="Leonard Riley" time="10:43" text="What are we doing for the logging points?" />
          <Message author="Veronica Gordon" time="10:44" text="Replies stack here, same component as RHS." />
        </div>
      </div>
    </div>
  );
}

function DmViewStub() {
  return (
    <div className={styles['vs__chat']}>
      <div className={styles['vs__dm-header']}>
        <span className={styles['vs__avatar']}>🟢</span>
        <span className={styles['vs__dm-name']}>Alex Tao</span>
        <span className={styles['vs__dm-status']}>● Online</span>
        <span className={styles['vs__dm-action']}>Start a Call</span>
      </div>
      <div className={styles['vs__messages']}>
        <Message author="Leonard Riley" time="10:43" text="Hey — got a sec to chat about the Avalanche release plan?" />
        <Message author="Alex Tao" time="10:44" text="Sure. Pull request is open. Want me to walk through?" />
        <Message author="Leonard Riley" time="10:45" text="Yes. Let me know when you have 15." />
      </div>
      <div className={styles['vs__compose']}>
        <span>Message Alex Tao…</span>
      </div>
    </div>
  );
}

// ─── Pages family ─────────────────────────────────────────────────────────

function PagesRecentsViewStub() {
  return (
    <div>
      <p className={styles['vs__note']}>
        "Recents" destination — thumbnail strip of recent wikis on top, sortable table below.
        New wiki button (top-right) creates a doc.
      </p>
      <div className={styles['vs__thumb-strip']}>
        {['1389 Avalanche Wiki', 'Mission Analysis Wiki', 'Ops Graphics Wiki', '+ New Wiki'].map(t => (
          <div key={t} className={styles['vs__thumb']}>
            <div className={styles['vs__thumb-body']}>{t}</div>
            <div className={styles['vs__thumb-foot']}>Last updated 5m</div>
          </div>
        ))}
      </div>
      <table className={styles['vs__table']}>
        <thead>
          <tr><th>Name</th><th>Channel</th><th>Author</th><th>Status</th><th>Updated</th></tr>
        </thead>
        <tbody>
          {[
            ['1389 Avalanche Wiki', '1389 Project Avalanche', 'Kathryn Murphy', 'In progress', '5m'],
            ['Mission Analysis Wiki', 'POL-9871A5', 'Kathryn Murphy', 'In progress', '5m'],
            ['Ops Graphics Wiki', 'WKI-2290G4', 'Jane Cooper', 'Draft', '5m'],
            ['JTF Areas Wiki', 'DCN-6359F8', 'Darrell Steward', 'Draft', 'Dec 16'],
            ['Risk Mgmt Overview', 'RMG-7421B7', 'Arlene McCoy', 'Complete', 'Dec 16'],
          ].map(row => (
            <tr key={row[0]}>{row.map((c, i) => <td key={i}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PagesCommentsViewStub() {
  return (
    <div className={styles['vs__split']}>
      <div className={styles['vs__split-narrow']}>
        <div className={styles['vs__inbox-header']}>
          <span className={styles['vs__inbox-tab']}>All comments</span>
          <span className={styles['vs__inbox-tab-muted']}>Comments</span>
        </div>
        <ul className={styles['vs__inbox-list']}>
          <li>Leonard Riley · Commented on Overview — 5m</li>
          <li>Pauline Burton · 8 comments — 1h</li>
          <li>Jenny Bilt · 3 comments — 2h</li>
          <li>Martin Newman · 8 comments — 1d</li>
        </ul>
      </div>
      <div className={styles['vs__split-right']}>
        <div className={styles['vs__rhs-header']}>Thread · Following</div>
        <div className={styles['vs__messages']}>
          <Message author="Leonard Riley" time="10:43" text="Commented on Overview" attachment="📄 Flight Team Roster" />
          <Message author="Veronica Gordon" time="10:44" text="Should we add the new ETA to section 4.2?" />
        </div>
      </div>
    </div>
  );
}

function PageViewStub() {
  return (
    <div className={styles['vs__split']}>
      <aside className={styles['vs__sub-lhs']}>
        <div className={styles['vs__sub-lhs-title']}>Pages</div>
        <div className={[styles['vs__sub-lhs-item'], styles['vs__sub-lhs-item--active']].join(' ')}>📄 Untitled page</div>
      </aside>
      <div className={styles['vs__doc']}>
        <header className={styles['vs__doc-header']}>
          <h3>Overview</h3>
          <span className={styles['vs__doc-meta']}>By Leonard Riley · ● In progress · Updated 2m ago · 👥👥 +2</span>
          <span className={styles['vs__doc-actions']}>✏ Edit · ⋯ · ⤢</span>
        </header>
        <div className={styles['vs__doc-body']}>
          <h4>Welcome to the Avalanche Flight Planning Wiki</h4>
          <p>This wiki serves as the central repository of knowledge and information for our flight planning operations.</p>
          <h5>Flight Team Roster</h5>
          <p>A detailed list of all members of our flight planning team, including their roles and responsibilities.</p>
          <h5>Operational Procedures</h5>
          <p>Comprehensive guidelines on the standard operating procedures for flight planning.</p>
          <h5>Communication Protocols</h5>
          <p>Standards and practices for effective communication within the flight planning team.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Agents family ────────────────────────────────────────────────────────

function AgentsExploreViewStub() {
  return (
    <div>
      <p className={styles['vs__note']}>
        Agent catalog — filter tabs (Popular / Coding / Productivity / Writing / Sales / Your agents) above a card grid. Each card lists @handle, description, MCP count, tool count.
      </p>
      <div className={styles['vs__tabs']}>
        <span className={styles['vs__tab-active']}>Popular</span>
        <span>Coding</span>
        <span>Productivity</span>
        <span>Writing</span>
        <span>Sales</span>
        <span>Your agents</span>
        <span className={styles['vs__tabs-spacer']} />
        <span className={styles['vs__tab-button']}>+ Create an agent</span>
      </div>
      <div className={styles['vs__card-grid']}>
        {[
          ['DevOps Agent', '@devops-agent', 'Automates and streamlines the deployment process', '4 MCPs · 16 tools'],
          ['CloudOps Agent', '@cloudops-agent', 'Optimizes cloud deployments and incident response', '8 MCPs · 28 tools'],
          ['Data Insights Agent', '@insights-agent', 'Aggregates and analyzes deployment data', '5 MCPs · 20 tools'],
          ['Project Tracker Agent', '@task-agent', 'Tracks and routes project tasks', '2 MCPs · 7 tools'],
        ].map(([name, handle, desc, meta]) => (
          <div key={name} className={styles['vs__card']}>
            <h4>{name} <span>{handle}</span></h4>
            <p>{desc}</p>
            <div className={styles['vs__card-meta']}>● {meta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentsEditViewStub() {
  return (
    <div className={styles['vs__form']}>
      <p className={styles['vs__note']}>
        Focused-task chrome mode — most nav stripped. Form has tabs (Configuration / Access / MCPs), Cancel/Save footer.
      </p>
      <div className={styles['vs__form-tabs']}>
        <span className={styles['vs__tab-active']}>Configuration</span>
        <span>Access</span>
        <span>MCPs</span>
      </div>
      <FormRow label="Display name" value="e.g. Sales Assistant" />
      <FormRow label="Agent username" value="Agent username" hint="Users will mention this name to interact with the agent." />
      <FormRow label="Bot avatar" value="[ ✨ ] Upload Image" />
      <FormRow label="AI Service" value="Select a service ▾" />
      <FormRow label="Model" value="Leave empty to use service default" />
      <FormRow label="Custom instructions" value="How would you like the agent to respond?" textarea />
      <FormRow label="Knowledge base files" value="📄 Project_Proposal_v2.pdf · 📄 Meeting_Notes_July.txt · 📄 Design_Sprint_Results.pptx" />
      <div className={styles['vs__form-footer']}>
        <button>Cancel</button>
        <button className={styles['vs__form-primary']}>Save</button>
      </div>
    </div>
  );
}

// ─── Playbooks family ─────────────────────────────────────────────────────

function PlaybooksRunsViewStub() {
  return (
    <div>
      <p className={styles['vs__note']}>
        Runs list — sortable table with My runs / Include finished filters. + Start a run button creates a new instance from a playbook template.
      </p>
      <div className={styles['vs__tabs']}>
        <span>☑ My runs only</span>
        <span>☑ Include finished</span>
        <span>Owner ▾</span>
        <span>Playbook ▾</span>
        <span className={styles['vs__tabs-spacer']} />
        <span className={styles['vs__tab-button']}>+ Start a run</span>
      </div>
      <table className={styles['vs__table']}>
        <thead>
          <tr><th>Name</th><th>Playbook</th><th>Status</th><th>Duration</th><th>Owner</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {[
            ['Incident #9462', 'Incident response', 'IN PROGRESS', '2h 35m', 'Devon Lane · 23p', 'Following'],
            ['Cloud server attack', 'Incident response', 'IN PROGRESS', '2h 35m', 'Devon Lane · 23p', 'Following'],
            ['Acme Corp', 'Incident response', 'IN PROGRESS', '2h 35m', 'Devon Lane · 23p', 'Following'],
            ['v6.4 Server Release', 'Release runbook', 'IN PROGRESS', '2h 35m', 'Devon Lane · 23p', 'Follow'],
            ['Some old run', 'Incident response', 'FINISHED', '2h 35m', 'Devon Lane · 23p', 'Following'],
          ].map(row => (
            <tr key={row[0]}>{row.map((c, i) => <td key={i}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlaybooksRunDetailViewStub() {
  return (
    <div className={styles['vs__split']}>
      <div className={styles['vs__split-left']}>
        <header className={styles['vs__run-header']}>
          <h3>v6.4 Server Release ▾</h3>
          <span className={styles['vs__chip']}>● IN PROGRESS</span>
          <span className={styles['vs__run-actions']}>📍 🔗 ℹ</span>
        </header>
        <div className={styles['vs__tabs']}>
          <span className={styles['vs__tab-active']}>Summary</span>
          <span>Retro</span>
          <span>Tasks</span>
        </div>
        <section className={styles['vs__run-section']}>
          <h4>Key dates</h4>
          <ul><li>Self-hosted release: Feb 16</li><li>Cloud release: Feb 3</li><li>Code-freeze: Jan 29</li></ul>
        </section>
        <section className={styles['vs__run-section']}>
          <h4>Resources</h4>
          <ul><li>🔗 Jira dashboard</li><li>🔗 Blog post draft</li></ul>
        </section>
        <div className={styles['vs__run-banner']}>
          ⏰ Update due in 6 days <button className={styles['vs__form-primary']}>Post update</button>
        </div>
        <section className={styles['vs__run-section']}>
          <h4>Tasks · 2 overdue · 3 assigned to you</h4>
          <ul><li>☐ Triage and check for pending tickets · Due tomorrow</li><li>☐ Start drafting changelog · Due tomorrow</li></ul>
        </section>
      </div>
      <aside className={styles['vs__split-right']}>
        <div className={styles['vs__rhs-header']}>Run info</div>
        <dl className={styles['vs__rhs-dl']}>
          <dt>Playbook</dt><dd>Product release</dd>
          <dt>Owner</dt><dd>Leonard Riley</dd>
          <dt>Participants</dt><dd>👥👥👥 +1</dd>
          <dt>Following</dt><dd>[ Follow ]</dd>
          <dt>Channel</dt><dd>v6.4 Server Release ↗</dd>
        </dl>
        <h5 className={styles['vs__rhs-h5']}>Key metrics</h5>
        <dl className={styles['vs__rhs-dl']}>
          <dt>Time to ack</dt><dd>4h 30m</dd>
          <dt>Duration</dt><dd>5d 9h</dd>
        </dl>
        <h5 className={styles['vs__rhs-h5']}>Recent activity</h5>
        <ul className={styles['vs__inbox-list']}>
          <li>🔔 Incident Status Update — 3m</li>
          <li>✓ Task Complete — 24m</li>
          <li>🔔 Incident Status Update — 1h</li>
        </ul>
      </aside>
    </div>
  );
}

function PlaybooksPlaybookDetailViewStub() {
  return (
    <div className={styles['vs__split']}>
      <aside className={styles['vs__sub-lhs']}>
        <div className={styles['vs__sub-lhs-title']}>Outline</div>
        <div className={styles['vs__sub-lhs-item']}>Description</div>
        <div className={[styles['vs__sub-lhs-item'], styles['vs__sub-lhs-item--active']].join(' ')}>Summary</div>
        <div className={styles['vs__sub-lhs-item']}>Status updates</div>
        <div className={styles['vs__sub-lhs-item']}>Checklists</div>
        <div className={styles['vs__sub-lhs-item']}>Retrospective</div>
        <div className={styles['vs__sub-lhs-item']}>Actions</div>
      </aside>
      <div className={styles['vs__doc']}>
        <header className={styles['vs__doc-header']}>
          <h3>Customer onboarding</h3>
          <span className={styles['vs__doc-meta']}>73 followers · 8 owners · ⭐</span>
          <span className={styles['vs__doc-actions']}><button className={styles['vs__form-primary']}>▶ Run</button></span>
        </header>
        <div className={styles['vs__tabs']}>
          <span>Usage</span>
          <span className={styles['vs__tab-active']}>Outline</span>
          <span>Reports</span>
        </div>
        <section className={styles['vs__run-section']}>
          <h4>Summary</h4>
          <ul><li>About — Version 1.20 · Target date TBD</li><li>Resources — Jira filtered view · Blog post draft</li></ul>
        </section>
        <section className={styles['vs__run-section']}>
          <h4>Status updates</h4>
          <ul><li>⏱ Expected every 48 minutes</li><li>💬 Posted to 2 channels</li><li>🌐 1 outgoing webhook</li></ul>
        </section>
        <section className={styles['vs__run-section']}>
          <h4>Checklists</h4>
          <ul>
            <li>▼ Triage</li>
            <li className={styles['vs__indent']}>☐ Acknowledge alert · 🤖 Eng team · 📅 1 day</li>
            <li className={styles['vs__indent']}>☐ Get alert info · 📅 1 day</li>
            <li className={styles['vs__indent']}>☐ Determine priority</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────

function Message({ author, time, text, attachment }: { author: string; time: string; text: string; attachment?: string }) {
  return (
    <div className={styles['vs__message']}>
      <span className={styles['vs__msg-avatar']}>👤</span>
      <div>
        <div className={styles['vs__msg-meta']}>
          <strong>{author}</strong> <span>{time}</span>
        </div>
        <div className={styles['vs__msg-text']}>{text}</div>
        {attachment ? <div className={styles['vs__msg-attach']}>{attachment}</div> : null}
      </div>
    </div>
  );
}

function FormRow({ label, value, hint, textarea }: { label: string; value: string; hint?: string; textarea?: boolean }) {
  return (
    <div className={styles['vs__form-row']}>
      <div className={styles['vs__form-label']}>{label}</div>
      <div className={styles['vs__form-field']}>
        <div className={textarea ? styles['vs__form-textarea'] : styles['vs__form-input']}>{value}</div>
        {hint ? <div className={styles['vs__form-hint']}>{hint}</div> : null}
      </div>
    </div>
  );
}
