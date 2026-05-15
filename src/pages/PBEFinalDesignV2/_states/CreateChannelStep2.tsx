import { useState } from 'react';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import Select from '@/components/ui/Select/Select';
import Radio from '@/components/ui/Radio/Radio';
import Switch from '@/components/ui/Switch/Switch';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import PaginationDots from '@/components/ui/PaginationDots/PaginationDots';
import ConsolePropertyTable from '@/components/ui/ConsolePropertyTable/ConsolePropertyTable';
import ConsolePropertyRow from '@/components/ui/ConsolePropertyRow/ConsolePropertyRow';
import styles from './CreateChannelStep2.module.scss';

export interface CreateChannelStep2Props {
  /** Called when the modal is dismissed. */
  onCancel: () => void;
  /** Called when "Previous" is clicked. */
  onBack: () => void;
  /** Called when "Create Channel" is clicked. */
  onCreate: () => void;
}

/**
 * State 8 — Create Channel Step 2 (Classification + Membership Rules).
 *
 * Implements **variant B** from the plan (Figma node `4301:25684`, canonical)
 * — two collapsible sections gated by Switch toggles:
 *
 *   1. Channel classification — when ON, exposes Classification level Select
 *      (with color swatch leading icon), Banner text TextInput (with eye
 *      trailing icon), and two Radio options for placement.
 *   2. Membership Rules — when ON, exposes a `ConsolePropertyTable` with two
 *      pre-seeded ABAC rule rows (Location, Clearance), a "Select attribute"
 *      add affordance, and an auto-add Checkbox.
 *
 * Footer: `PaginationDots` (step 2 active) + Previous + Create Channel.
 *
 * Figma node `4301:25684` was inaccessible during port; structure follows
 * the plan's section-by-section description with dest semantic tokens.
 */
export default function CreateChannelStep2({
  onCancel,
  onBack,
  onCreate,
}: CreateChannelStep2Props) {
  const [classificationOn, setClassificationOn] = useState(true);
  const [membershipOn, setMembershipOn] = useState(true);
  const [bannerPlacement, setBannerPlacement] = useState<'header' | 'banner'>(
    'banner',
  );

  return (
    <div className={styles['create-channel-step2']}>
      <div className={styles['create-channel-step2__overlay']}>
        <div className={styles['create-channel-step2__dialog']}>
          <Modal
            size="Small"
            title="Create a new channel"
            subtitle="Program Alpha Planning"
            onClose={onCancel}
        footer={
          <div className={styles['create-channel-step2__footer']}>
            <PaginationDots pages={2} activePage={2} />
            <div className={styles['create-channel-step2__actions']}>
              <Button
                emphasis="Tertiary"
                leadingIcon={<Icon size="16" glyph={<ChevronLeftIcon />} />}
                onClick={onBack}
              >
                Previous
              </Button>
              <Button
                emphasis="Primary"
                leadingIcon={<Icon size="16" glyph={<ShieldOutlineIcon />} />}
                onClick={onCreate}
              >
                Create Channel
              </Button>
            </div>
          </div>
        }
      >
        <div className={styles['create-channel-step2__body']}>
          {/* Classification section */}
          <section className={styles['create-channel-step2__section']}>
            <div className={styles['create-channel-step2__section-head']}>
              <div className={styles['create-channel-step2__section-text']}>
                <h3 className={styles['create-channel-step2__section-title']}>
                  Classification
                </h3>
                <p className={styles['create-channel-step2__section-help']}>
                  When enabled, classification markings will appear for this
                  channel.
                </p>
              </div>
              <Switch
                checked={classificationOn}
                onChange={(e) => setClassificationOn(e.target.checked)}
                aria-label="Toggle classification"
              />
            </div>

            {classificationOn && (
              <div className={styles['create-channel-step2__section-content']}>
                <Select
                  label="Classification level"
                  defaultValue="confidential"
                  leadingIcon={
                    <span
                      className={
                        styles['create-channel-step2__color-swatch']
                      }
                      aria-hidden
                    />
                  }
                >
                  <option value="unclassified">UNCLASSIFIED</option>
                  <option value="cui">CUI</option>
                  <option value="confidential">CONFIDENTIAL</option>
                  <option value="secret">SECRET</option>
                  <option value="top-secret">TOP SECRET</option>
                  <option value="ts-sci">TOP SECRET // SCI</option>
                </Select>

                <TextInput
                  label="Banner text"
                  defaultValue="OPERATION DELTA — SECRET//NOFORN"
                  trailingIcon={
                    <Icon size="16" glyph={<EyeOutlineIcon />} />
                  }
                />

                <div
                  className={
                    styles['create-channel-step2__radio-group']
                  }
                  role="radiogroup"
                  aria-label="Banner placement"
                >
                  <Radio
                    name="banner-placement"
                    checked={bannerPlacement === 'header'}
                    onChange={() => setBannerPlacement('header')}
                  >
                    Channel Header Label
                  </Radio>
                  <Radio
                    name="banner-placement"
                    checked={bannerPlacement === 'banner'}
                    onChange={() => setBannerPlacement('banner')}
                  >
                    Channel Banner
                  </Radio>
                </div>
              </div>
            )}
          </section>

          <div
            className={styles['create-channel-step2__divider']}
            role="separator"
          />

          {/* Membership Rules section */}
          <section className={styles['create-channel-step2__section']}>
            <div className={styles['create-channel-step2__section-head']}>
              <div className={styles['create-channel-step2__section-text']}>
                <h3 className={styles['create-channel-step2__section-title']}>
                  Membership Rules
                </h3>
                <p className={styles['create-channel-step2__section-help']}>
                  Select user attributes and values as rules to restrict
                  channel membership.
                </p>
              </div>
              <Switch
                checked={membershipOn}
                onChange={(e) => setMembershipOn(e.target.checked)}
                aria-label="Toggle membership rules"
              />
            </div>

            {membershipOn && (
              <div className={styles['create-channel-step2__section-content']}>
                <ConsolePropertyTable
                  sections={[
                    {
                      columns: [
                        { key: 'attribute', label: 'Attribute' },
                        { key: 'operator', label: 'Operator', width: 120 },
                        { key: 'values', label: 'Values' },
                      ],
                      rows: (
                        <>
                          <ConsolePropertyRow
                            title="Location"
                            typeLabel="is"
                            value={
                              <span
                                className={
                                  styles['create-channel-step2__rule-value']
                                }
                              >
                                Northern Command
                              </span>
                            }
                            trailingAction={
                              <IconButton
                                size="X-Small"
                                destructive
                                aria-label="Remove rule"
                                icon={
                                  <Icon
                                    size="16"
                                    glyph={<TrashCanOutlineIcon />}
                                  />
                                }
                              />
                            }
                          />
                          <ConsolePropertyRow
                            title="Clearance"
                            typeLabel="is"
                            value={
                              <span
                                className={
                                  styles['create-channel-step2__rule-value']
                                }
                              >
                                Confidential
                              </span>
                            }
                            trailingAction={
                              <IconButton
                                size="X-Small"
                                destructive
                                aria-label="Remove rule"
                                icon={
                                  <Icon
                                    size="16"
                                    glyph={<TrashCanOutlineIcon />}
                                  />
                                }
                              />
                            }
                          />
                        </>
                      ),
                    },
                  ]}
                  addLabel="Select attribute"
                />

                <Checkbox defaultChecked>
                  <span
                    className={styles['create-channel-step2__checkbox-label']}
                  >
                    Auto-add members based on access rules
                  </span>
                </Checkbox>
                <p
                  className={
                    styles['create-channel-step2__checkbox-help']
                  }
                >
                  When enabled, members who match all rules above are added to
                  this channel automatically.
                </p>
              </div>
            )}
          </section>
        </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
