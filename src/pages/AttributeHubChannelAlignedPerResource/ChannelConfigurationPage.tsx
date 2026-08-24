import { useMemo, useState } from 'react';
import ConsoleSidebar from '@/components/ui/ConsoleSidebar/ConsoleSidebar';
import sidebarStyles from '@/components/ui/ConsoleSidebar/ConsoleSidebar.module.scss';
import ConsolePageHeader from '@/components/ui/ConsolePageHeader/ConsolePageHeader';
import AdminPanelFooter from '@/components/ui/AdminPanelFooter/AdminPanelFooter';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import {
  HUB_SIDEBAR_CATEGORIES,
} from '@/pages/AttributeManagementHub/hubSidebar';
import {
  HUB_ATTRIBUTES,
  assignableValuesForResource,
  takesValueList,
  type HubAttribute,
  type ResourceConfig,
} from '@/pages/AttributeManagementHub/hubData';
import styles from './ChannelConfigurationPage.module.scss';

export interface ChannelConfigurationPageProps {
  channelName: string;
  adminName: string;
  onBack: () => void;
}

function channelBinding(attribute: HubAttribute): ResourceConfig | undefined {
  return attribute.appliesTo.find((cfg) => cfg.resource === 'Channels');
}

function initialValues(attributes: HubAttribute[]): Record<string, string> {
  return Object.fromEntries(
    attributes.map((attribute) => {
      const config = channelBinding(attribute);
      const options = config ? assignableValuesForResource(attribute, config) : [];
      return [attribute.id, config?.defaultValueId ?? options[0]?.id ?? ''];
    }),
  );
}

export default function ChannelConfigurationPage({
  channelName,
  adminName,
  onBack,
}: ChannelConfigurationPageProps) {
  const channelAttributes = useMemo(
    () =>
      HUB_ATTRIBUTES.filter((attribute) => {
        const config = channelBinding(attribute);
        return config != null && takesValueList(attribute);
      }).sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const [savedValues, setSavedValues] = useState(() =>
    initialValues(channelAttributes),
  );
  const [channelValues, setChannelValues] = useState(savedValues);

  const dirty =
    JSON.stringify(channelValues) !== JSON.stringify(savedValues);

  return (
    <div className={styles['channel-config']}>
      <ConsoleSidebar
        className={sidebarStyles['console-sidebar--product']}
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="asaad"
        categories={HUB_SIDEBAR_CATEGORIES}
        activeItemId="channels"
      />
      <div className={styles['channel-config__center']}>
        <ConsolePageHeader
          title="Channel Configuration"
          backButton
          onBack={onBack}
        />
        <div className={styles['channel-config__scroll']}>
          <Scrollbars>
            <div className={styles['channel-config__content']}>
              <section className={styles['card']}>
                <div className={styles['card__body']}>
                  <h2 className={styles['card__title']}>Channel Profile</h2>
                  <p className={styles['card__subtitle']}>
                    Summary of the channel, including the channel name.
                  </p>
                  <dl className={styles['profile']}>
                    <div className={styles['profile__row']}>
                      <dt>Name</dt>
                      <dd>{channelName}</dd>
                    </div>
                    <div className={styles['profile__row']}>
                      <dt>Team</dt>
                      <dd>Mattermost</dd>
                    </div>
                    <div className={styles['profile__row']}>
                      <dt>Channel Admin</dt>
                      <dd>{adminName}</dd>
                    </div>
                  </dl>
                  <div className={styles['attributes']}>
                    <h3 className={styles['attributes__title']}>Channel attributes</h3>
                    <div className={styles['attributes__grid']}>
                      {channelAttributes.map((attribute) => {
                        const config = channelBinding(attribute);
                        const options = config
                          ? assignableValuesForResource(attribute, config)
                          : [];
                        return (
                          <label
                            key={attribute.id}
                            className={styles['attributes__field']}
                          >
                            <span className={styles['attributes__label']}>
                              {attribute.name}
                            </span>
                            <Select
                              size="Medium"
                              value={channelValues[attribute.id] ?? ''}
                              onChange={(e) =>
                                setChannelValues((current) => ({
                                  ...current,
                                  [attribute.id]: e.target.value,
                                }))
                              }
                            >
                              {options.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className={styles['card__footer']}>
                  <Button emphasis="Secondary" destructive>
                    Archive Channel
                  </Button>
                </div>
              </section>
            </div>
          </Scrollbars>
        </div>
        <AdminPanelFooter
          saveLabel="Save"
          saveDisabled={!dirty}
          onSave={() => {
            setSavedValues(channelValues);
            onBack();
          }}
          onCancel={onBack}
        />
      </div>
    </div>
  );
}
