import { Fragment, useEffect, useRef } from 'react';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Message, layoutStyles } from '@mattermost/compass-proto';
import { ROSTER } from '../videoCallsData';
import type { SamplePost } from './chatSamplesData';
import ChannelCallPost from './ChannelCallCard';

const byId = (id: string) => ROSTER.find((p) => p.id === id) ?? ROSTER[0];

/**
 * Message list anchored to the bottom of the channel (newest messages sit just
 * above the composer, older ones scroll up). Posts are grouped under date
 * separators; the call post slots in where `callPostAfter` says, or at the end
 * when `callPostAtEnd` is set.
 */
export default function ChatThread({
  posts,
  callPostAtEnd = false,
  allowedAuthors,
}: {
  posts: SamplePost[];
  callPostAtEnd?: boolean;
  /** Only show posts from these people (e.g. who is in a group DM). */
  allowedAuthors?: readonly string[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Open at the newest message and stay there as the list grows (a call post
  // appearing, the call card changing state), unless the reader scrolled up.
  useEffect(() => {
    const scroller = rootRef.current?.querySelector<HTMLElement>(
      '.simplebar-content-wrapper',
    );
    const list = listRef.current;
    if (!scroller || !list) return;
    let pinned = true;
    const toBottom = () => {
      scroller.scrollTop = scroller.scrollHeight;
    };
    const onScroll = () => {
      pinned =
        scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 80;
    };
    toBottom();
    scroller.addEventListener('scroll', onScroll);
    const ro = new ResizeObserver(() => {
      if (pinned) toBottom();
    });
    ro.observe(list);
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, []);

  const shown = allowedAuthors
    ? posts.filter((p) => allowedAuthors.includes(p.authorId))
    : posts;
  return (
    <div ref={rootRef} className={layoutStyles['channel-shell__messages']}>
      <Scrollbar>
        <div
          ref={listRef}
          className={layoutStyles['channel-shell__messages-list']}
        >
          {shown.map((post, i) => {
            const author = byId(post.authorId);
            const paragraphs = Array.isArray(post.text)
              ? post.text
              : [post.text];
            return (
              <Fragment key={`${post.day}-${post.time}-${i}`}>
                {(i === 0 || shown[i - 1].day !== post.day) && (
                  <MessageSeparator type="date" label={post.day} />
                )}
                <Message
                  avatarSrc={author.avatarSrc}
                  avatarAlt={author.name}
                  username={author.name}
                  timestamp={post.time}
                >
                  {paragraphs.map((t, j) => (
                    <p
                      key={j}
                      className={layoutStyles['channel-shell__post-text']}
                    >
                      {t}
                    </p>
                  ))}
                </Message>
                {post.callPostAfter && <ChannelCallPost />}
              </Fragment>
            );
          })}
          {callPostAtEnd && <ChannelCallPost />}
        </div>
      </Scrollbar>
    </div>
  );
}
