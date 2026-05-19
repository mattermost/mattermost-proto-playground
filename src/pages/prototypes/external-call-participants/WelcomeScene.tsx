import { useState } from 'react';
import type { FormEvent } from 'react';
import PhoneInTalkIcon from '@mattermost/compass-icons/components/phone-in-talk';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import welcomeBg from '@/assets/illustrations/call-welcome-bg.svg';
import styles from './WelcomeScene.module.scss';

export interface WelcomeSceneProps {
  channelName: string;
  onJoin: (name: string) => void;
}

export default function WelcomeScene({ channelName, onJoin }: WelcomeSceneProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onJoin(name.trim());
  };

  return (
    <div className={styles.welcome}>
      <div
        className={styles['welcome__texture']}
        style={{ backgroundImage: `url(${welcomeBg})` }}
        aria-hidden
      />
      <div className={styles['welcome__glow']} aria-hidden />
      <form
        className={styles['welcome__card']}
        onSubmit={handleSubmit}
        aria-label={`Join call in ${channelName}`}
      >
        <div className={styles['welcome__icon']}>
          <Icon size="32" glyph={<PhoneInTalkIcon />} />
        </div>

        <div className={styles['welcome__heading']}>
          <h1 className={styles['welcome__title']}>Welcome to the call</h1>
          <p className={styles['welcome__subtitle']}>
            Please enter your name to join the call
          </p>
        </div>

        <div className={styles['welcome__form']}>
          <TextInput
            className={styles['welcome__input']}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            type="submit"
            emphasis="Primary"
            size="Medium"
            trailingIcon={<Icon size="16" glyph={<ArrowRightIcon />} />}
          >
            Join
          </Button>
        </div>

        <p className={styles['welcome__footer']}>
          You&rsquo;ll join as a guest
        </p>
      </form>
    </div>
  );
}
