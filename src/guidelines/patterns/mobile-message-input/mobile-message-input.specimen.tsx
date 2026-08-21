import { useState, type ReactNode} from 'react';
import { MobileMessageInput } from '@mattermost/compass-proto';
import { type MobileMessageAttachment } from '@mattermost/compass-proto';
import sampleImage from '@/assets/images/sample-image.jpg';
import styles from './mobile-message-input.specimen.module.scss';

function Stage({
  label,
  children,
  tall,
}: {
  label: string;
  children: ReactNode;
  tall?: boolean;
}) {
  return (
    <div className={styles['mmi-specimen__stage']}>
      <p className={styles['mmi-specimen__label']}>{label}</p>
      <div
        className={[
          styles['mmi-specimen__frame'],
          tall && styles['mmi-specimen__frame--tall'],
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </div>
  );
}

function InteractiveRoot() {
  const [value, setValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [attachments, setAttachments] = useState<MobileMessageAttachment[]>(
    [],
  );

  return (
    <MobileMessageInput
      variant='Root'
      placeholder='Write to UX Design…'
      value={value}
      onChange={setValue}
      expanded={expanded}
      onExpandedChange={setExpanded}
      attachments={attachments}
      onRemoveAttachment={(id: string) =>
        setAttachments((prev) => prev.filter((item) => item.id !== id))
      }
      onPlusClick={() =>
        setAttachments((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}`,
            src: sampleImage,
            alt: 'Sample attachment',
          },
        ])
      }
      onSend={() => {
        setValue('');
        setAttachments([]);
        setExpanded(false);
      }}
    />
  );
}

export default function MobileMessageInputLibrary() {
  const [replyValue, setReplyValue] = useState('Typing a reply');
  const [focusedValue, setFocusedValue] = useState('Typing a message');
  const [expandedValue, setExpandedValue] = useState('Typing a message');
  const [attachmentValue, setAttachmentValue] = useState(
    'Sharing a screenshot',
  );
  const [expanded, setExpanded] = useState(true);
  const [staticAttachments, setStaticAttachments] = useState<
    MobileMessageAttachment[]
  >([
    {
      id: '1',
      src: sampleImage,
      alt: 'Screenshot',
    },
  ]);

  return (
    <div className={styles['mmi-specimen']}>
      <Stage label='Root — unfocused'>
        <MobileMessageInput
          variant='Root'
          placeholder='Write to UX Design…'
        />
      </Stage>

      <Stage label='Root — focused (placeholder)'>
        <MobileMessageInput
          variant='Root'
          placeholder='Write to UX Design…'
          defaultFocused
        />
      </Stage>

      <Stage label='Root — focused with value (send)'>
        <MobileMessageInput
          variant='Root'
          placeholder='Write to UX Design…'
          value={focusedValue}
          onChange={setFocusedValue}
          defaultFocused
        />
      </Stage>

      <Stage label='Reply — focused'>
        <MobileMessageInput
          variant='Reply'
          value={replyValue}
          onChange={setReplyValue}
          defaultFocused
        />
      </Stage>

      <Stage label='Root — expanded' tall>
        <MobileMessageInput
          variant='Root'
          placeholder='Write to UX Design…'
          value={expandedValue}
          onChange={setExpandedValue}
          expanded={expanded}
          onExpandedChange={setExpanded}
          defaultFocused
        />
      </Stage>

      <Stage label='Root — with attachments'>
        <MobileMessageInput
          variant='Root'
          placeholder='Write to UX Design…'
          value={attachmentValue}
          onChange={setAttachmentValue}
          defaultFocused
          attachments={staticAttachments}
          onRemoveAttachment={(id: string) =>
            setStaticAttachments((prev) =>
              prev.filter((item) => item.id !== id),
            )
          }
        />
      </Stage>

      <Stage label='Interactive (tap + to attach)' tall>
        <InteractiveRoot />
      </Stage>
    </div>
  );
}
