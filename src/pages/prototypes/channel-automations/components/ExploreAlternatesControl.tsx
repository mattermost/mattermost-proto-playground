import FlaskOutlineIcon from '@mattermost/compass-icons/components/flask-outline';
import Icon from '@/components/ui/Icon/Icon';
import Switch from '@/components/ui/Switch/Switch';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import type {
  HeaderEntryPoint,
  ManagePresentation,
} from '../channelAutomationsScenes';
import styles from './ExploreAlternatesControl.module.scss';

export interface ExploreAlternatesControlProps {
  headerEntryPoint: HeaderEntryPoint;
  onHeaderEntryPointChange: (value: HeaderEntryPoint) => void;
  showAlternates: boolean;
  onShowAlternatesChange: (value: boolean) => void;
  managePresentation: ManagePresentation;
  onManagePresentationChange: (value: ManagePresentation) => void;
}

/**
 * Prototype-only control (not product UI) for comparing the exploration
 * options: the alternate entry points and the management presentation.
 */
export default function ExploreAlternatesControl({
  headerEntryPoint,
  onHeaderEntryPointChange,
  showAlternates,
  onShowAlternatesChange,
  managePresentation,
  onManagePresentationChange,
}: ExploreAlternatesControlProps) {
  return (
    <div
      className={styles['explore']}
      role="region"
      aria-label="Exploration controls"
    >
      <span className={styles['explore__badge']}>
        <Icon size="16" glyph={<FlaskOutlineIcon />} />
        Explore
      </span>

      <SceneSwitcher
        label="Header"
        ariaLabel="Header entry point"
        scenes={[
          { id: 'agents-menu', label: 'Agents menu' },
          { id: 'automations-icon', label: 'Automations icon' },
        ]}
        activeId={headerEntryPoint}
        onChange={(id) => onHeaderEntryPointChange(id as HeaderEntryPoint)}
      />

      <span className={styles['explore__divider']} aria-hidden />

      <Switch
        size="Small"
        checked={showAlternates}
        onChange={(e) => onShowAlternatesChange(e.target.checked)}
      >
        Alternate entry points
      </Switch>

      <span className={styles['explore__divider']} aria-hidden />

      <SceneSwitcher
        label="Manage"
        ariaLabel="Management presentation"
        scenes={[
          { id: 'rhs', label: 'RHS panel' },
          { id: 'modal', label: 'Modal' },
        ]}
        activeId={managePresentation}
        onChange={(id) => onManagePresentationChange(id as ManagePresentation)}
      />
    </div>
  );
}
