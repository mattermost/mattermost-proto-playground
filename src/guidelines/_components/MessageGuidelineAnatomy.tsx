import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import sampleImage from '@/assets/images/sample-image.jpg';
import { AttachmentCard } from '@mattermost/compass-ui';
import { ImagePreview } from '@mattermost/compass-ui';
import { LinkPreview } from '@mattermost/compass-ui';
import { Message } from '@mattermost/compass-ui';
import { messageStyles } from '@mattermost/compass-ui';
import { MessageReactions } from '@mattermost/compass-ui';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import styles from './MessageGuidelineAnatomy.module.scss';

/**
 * Message pattern — composite anatomy preview on the shared AnatomyStage surface.
 */
export function MessageGuidelineAnatomyStage() {
  return (
    <AnatomyStage
      style={{
        alignItems: 'stretch',
        justifyContent: 'center',
        margin: '0 auto var(--spacing-m)',
      }}
    >
      <div className={styles['message-anatomy']}>
        <Message
          showPinnedSavedIndicators
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
          username="Leonard Riley"
          timestamp="Today at 9:41 AM"
          linkPreview={
            <LinkPreview
              siteName="mattermost.com"
              title="Mattermost: Open source collaboration"
              description="Secure team messaging and workflow orchestration for technical teams."
            />
          }
          imagePreviews={
            <ImagePreview
              src={sampleImage}
              alt="Sample image"
              onCopyLink={() => {}}
              onDownload={() => {}}
              onToggleCollapse={() => {}}
            />
          }
          footer={
            <>
              <AttachmentCard
                fileName="Q2-roadmap-draft.pdf"
                fileMeta="PDF 248KB"
                fileType="pdf"
              />
              <MessageReactions
                reactions={[
                  { emoji: '👍', count: 2, byCurrentUser: true },
                  { emoji: '🎉', count: 1 },
                ]}
                showAddReaction
              />
            </>
          }
        >
          <p className={messageStyles['message__body-text']}>
            Here’s the latest mock for the onboarding flow — feedback welcome before
            we lock copy.
          </p>
        </Message>
      </div>
    </AnatomyStage>
  );
}
