/**
 * DPC V2 A1 — PermissionSchemeEntry (v2.3 advisory rewrite).
 *
 * VP-1 resolved: NO new permission entry ships in v2. Approve / decline of
 * pending join requests is routed through the existing "Manage Channel
 * Members" permission under "Manage Private Channels". This component
 * stays in the System Admin persona's screen stack as a v2 advisory so
 * the surface is not empty.
 *
 * Prior content (the System Scheme / Team Override Scheme radio mockups
 * for a new "Manage join requests for this channel" entry) is removed.
 * If reviewers need to see what was deprecated, the v1 file in the spec
 * deprecated-explorations §16 documents the rationale.
 */
import SectionNotice from '@/components/ui/SectionNotice/SectionNotice';
import ScreenCanvas from '../_components/ScreenCanvas';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './PermissionSchemeEntry.module.scss';

export interface PermissionSchemeEntryProps {
  store: A1V2StoreApi;
}

export default function PermissionSchemeEntry(
  props: PermissionSchemeEntryProps,
) {
  void props;
  return (
    <ScreenCanvas
      eyebrow="VP-1 advisory · §5.7"
      title="Permission Scheme — v2 simplification"
      subtitle='No new permission entry in v2. Approve/decline of pending join requests routes through the existing "Manage Channel Members" permission.'
      canvas={
        <section
          className={styles['v2-perm-scheme']}
          aria-label="Permission Scheme advisory"
        >
          <div className={styles['v2-perm-scheme__console-bar']}>
            <span className={styles['v2-perm-scheme__console-label']}>
              User Management → Permissions → Channel Permissions → Manage
              Private Channels → Manage Channel Members
            </span>
          </div>

          <div className={styles['v2-perm-scheme__row']}>
            <div className={styles['v2-perm-scheme__row-main']}>
              <div className={styles['v2-perm-scheme__row-label']}>
                Manage Channel Members
              </div>
              <div className={styles['v2-perm-scheme__row-desc']}>
                Add, remove, and approve / decline join requests on
                Discoverable Private Channels.
              </div>
            </div>
            <div className={styles['v2-perm-scheme__row-value']}>
              <span className={styles['v2-perm-scheme__row-current']}>
                Channel Admins
              </span>
              <span className={styles['v2-perm-scheme__row-aside']}>
                System Scheme default
              </span>
            </div>
          </div>

          <SectionNotice
            type="Info"
            title="v2 simplification (VP-1)"
            description={
              <>
                No new permission entry in v2. Approve / decline of pending
                join requests is routed through the existing &ldquo;Manage
                Channel Members&rdquo; permission. This screen is retained
                for historical reference; the prior &ldquo;Manage join
                requests for this channel&rdquo; entry has been dropped per
                spec §5.7.
              </>
            }
          />
        </section>
      }
      reviewSummary='Per VP-1, no DPC-specific permission entry ships in v2. The existing "Manage Channel Members" permission under "Manage Private Channels" is reused — System Scheme + Team Override Scheme machinery preserved by reuse, no new audit-event class, no per-channel override in v1 (deferred).'
      reviewItems={[
        {
          heading: 'Why v2 dropped the new entry',
          body: (
            <p>
              The original PRD (FR-22) proposed a new permission row,
              <code> &ldquo;Manage join requests for this channel&rdquo;</code>,
              at System Scheme + Team Override Scheme scope. PM resolved
              this in chat as <code>VP-1 flipped</code>: the underlying
              capability (configurable approver set, audit on broadening) is
              already provided by the existing
              <code> &ldquo;Manage Channel Members&rdquo;</code> permission,
              and reusing it avoids per-channel audit volume.
            </p>
          ),
        },
        {
          heading: 'Permission row is read-only in this advisory',
          body: (
            <p>
              The row above is a screenshot-style mock to anchor where the
              existing permission lives. The radio interactions from the v1
              draft have been removed since there is nothing new to
              configure.
            </p>
          ),
        },
      ]}
    />
  );
}
