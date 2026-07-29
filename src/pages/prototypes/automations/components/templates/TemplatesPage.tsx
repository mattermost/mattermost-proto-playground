import { Scrollbar } from '@mattermost/compass-ui';
import type { ComponentType, SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertIllustration from '@/assets/illustrations/alert.svg?react';
import EmployeeOnboardingIllustration from '@/assets/illustrations/employee-onboarding.svg?react';
import LockedMessagesIllustration from '@/assets/illustrations/locked-messages.svg?react';
import PublicChannelIllustration from '@/assets/illustrations/public-channel-intro.svg?react';
import ScheduledIllustration from '@/assets/illustrations/scheduled-empty.svg?react';
import TownSquareIllustration from '@/assets/illustrations/town-square-channel-intro.svg?react';
import { useAutomations } from '../../context/AutomationsContext';
import styles from './TemplatesPage.module.scss';

const BASE = '/prototypes/automations';

type Illustration = ComponentType<SVGProps<SVGSVGElement>>;

const TEMPLATE_ILLUSTRATIONS: Record<string, Illustration> = {
  'tpl-welcome': EmployeeOnboardingIllustration,
  'tpl-keyword': AlertIllustration,
  'tpl-standup': ScheduledIllustration,
  'tpl-banned': LockedMessagesIllustration,
  'tpl-announce': PublicChannelIllustration,
  'tpl-channel-welcome': TownSquareIllustration,
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { templates, createFromTemplateId, recordRecent } = useAutomations();

  const applyTemplate = (templateId: string) => {
    const id = createFromTemplateId(templateId);
    if (!id) return;
    recordRecent(id);
    navigate(`${BASE}/${id}/editor`);
  };

  return (
    <div className={styles.templates}>
      <div>
        <h1 className={styles.templates__title}>Start from a template</h1>
        <p className={styles.templates__subtitle}>
          Templates are imported as disabled drafts you can review and customize
          before enabling.
        </p>
      </div>
      <div className={styles.templates__body}>
        <Scrollbar style={{ height: '100%' }}>
          <div className={styles.templates__grid}>
            {templates.map((t) => {
              const Illustration = TEMPLATE_ILLUSTRATIONS[t.id];
              return (
                <button
                  key={t.id}
                  type="button"
                  className={styles.templates__card}
                  onClick={() => applyTemplate(t.id)}
                >
                  <div className={styles.templates__copy}>
                    <p className={styles.templates__category}>{t.category}</p>
                    <h2 className={styles.templates__name}>{t.name}</h2>
                    <p className={styles.templates__desc}>{t.description}</p>
                    <span className={styles.templates__cta}>Use template</span>
                  </div>
                  {Illustration ? (
                    <div className={styles.templates__art} aria-hidden>
                      <Illustration className={styles.templates__illustration} />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}
