import PlusIcon from '@mattermost/compass-icons/components/plus';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import ConfigCard from '../_components/ConfigCard';
import { singleConfig } from '../shared/fixtures';
import styles from './ConfigurationsTab.module.scss';

export interface ConfigurationsTabProps {
  /** When true, render a green test result block inside the card. */
  showTestResult?: boolean;
  /** Called when the user clicks "Add Configuration". */
  onAddConfig: () => void;
  /** Called when the user clicks "Edit" on the configuration card. */
  onEditConfig: () => void;
  /** Called when the user clicks "Test" on the configuration card. */
  onTestConfig: () => void;
}

/**
 * Configurations tab body (States 2 and 6). State 2 = baseline,
 * State 6 = `showTestResult` true → inline green success panel inside
 * the config card.
 */
export default function ConfigurationsTab({
  showTestResult,
  onAddConfig,
  onEditConfig,
  onTestConfig,
}: ConfigurationsTabProps) {
  return (
    <div className={styles['configurations-tab']}>
      <div className={styles['configurations-tab__toolbar']}>
        <div className={styles['configurations-tab__search']}>
          <SearchInput size="Small" placeholder="Search configurations..." />
        </div>
        <Button
          size="Small"
          emphasis="Primary"
          leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
          onClick={onAddConfig}
        >
          Add Configuration
        </Button>
      </div>

      <ConfigCard
        name={singleConfig.name}
        status="Connected"
        rows={[
          { label: 'Key Manager', value: 'PKCS#11' },
          { label: 'Token Label', value: singleConfig.tokenLabel },
          { label: 'KEK Label', value: singleConfig.kekLabel },
          {
            label: 'Lease Duration',
            value: `${singleConfig.leaseDuration} min`,
          },
          { label: 'Channels', value: singleConfig.channelCount },
        ]}
        showTestResult={showTestResult}
        testResultLabel="Configuration test successful"
        testResultDetails={[
          'Key Manager authenticated · Slot accessible · PIN valid · KEK found',
          'Last tested: just now',
        ]}
        onEdit={onEditConfig}
        onTest={onTestConfig}
      />

      <div className={styles['configurations-tab__footer-note']}>
        <InformationOutlineIcon size={14} aria-hidden />
        <span>
          Key Managers used within each configuration are configured and
          managed via environment variables by the System Administrator
        </span>
      </div>
    </div>
  );
}
