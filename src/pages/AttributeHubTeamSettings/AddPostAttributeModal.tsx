import { useMemo, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import Modal from '@/components/ui/Modal/Modal';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
  PopoverMenuScroll,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import {
  buildPostAttributeMenuSections,
  filterPostAttributeMenuItems,
  postAttributeIcon,
} from './postAttributeAddMenu';
import {
  isPostAttributeLocked,
  postBinding,
  postScopedAttributes,
} from './postViewData';
import styles from './AddPostAttributeModal.module.scss';

export interface AddPostAttributeModalProps {
  attachedIds: string[];
  onClose: () => void;
  onPickAttribute: (attributeId: string) => void;
  onCreateNew?: () => void;
  attributes?: HubAttribute[];
}

/**
 * Modal to attach a catalog post attribute to a message (from the message
 * overflow “Add attribute” action).
 */
export default function AddPostAttributeModal({
  attachedIds,
  onClose,
  onPickAttribute,
  onCreateNew,
  attributes = postScopedAttributes(),
}: AddPostAttributeModalProps) {
  const [query, setQuery] = useState('');
  const attached = useMemo(() => new Set(attachedIds), [attachedIds]);

  const { configured, inherited } = useMemo(
    () => buildPostAttributeMenuSections(attributes),
    [attributes],
  );

  const configuredVisible = useMemo(
    () =>
      filterPostAttributeMenuItems(configured, query).filter(
        (item) => !attached.has(item.id),
      ),
    [configured, query, attached],
  );

  const inheritedVisible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return inherited.filter((item) => {
      if (attached.has(item.id)) return false;
      if (!normalized) return true;
      return item.label.toLowerCase().includes(normalized);
    });
  }, [inherited, query, attached]);

  const pick = (attributeId: string) => {
    onPickAttribute(attributeId);
    onClose();
  };

  return (
    <div className={styles['add-modal']} role="presentation">
      <button
        type="button"
        className={styles['add-modal__scrim']}
        aria-label="Close"
        onClick={onClose}
      />
      <div className={styles['add-modal__dialog']}>
        <Modal
          title="Add attribute"
          subtitle="Choose an attribute to attach to this post."
          onClose={onClose}
          size="Small"
          footer={
            onCreateNew ? (
              <Button
                emphasis="Tertiary"
                leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                onClick={() => {
                  onClose();
                  onCreateNew();
                }}
              >
                Create new attribute
              </Button>
            ) : undefined
          }
        >
          <div className={styles['add-modal__body']}>
            <SearchInput
              placeholder="Search attributes"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search attributes"
            />
            <PopoverMenu
              variant="child"
              className={styles['add-modal__menu']}
              aria-label="Available attributes"
            >
              <PopoverMenuScroll maxHeight={320}>
                {configuredVisible.length > 0 && (
                  <PopoverMenuGroup>
                    <PopoverMenuGroupTitle>Configured</PopoverMenuGroupTitle>
                    {configuredVisible.map((item) => (
                      <MenuItem
                        key={item.id}
                        label={item.label}
                        leadingVisual={item.icon}
                        onClick={() => pick(item.id)}
                      />
                    ))}
                  </PopoverMenuGroup>
                )}
                {configuredVisible.length > 0 &&
                  inheritedVisible.length > 0 && <PopoverMenuDivider />}
                {inheritedVisible.length > 0 && (
                  <PopoverMenuGroup>
                    <PopoverMenuGroupTitle>Inherited</PopoverMenuGroupTitle>
                    {inheritedVisible.map((item) => {
                      const attribute = attributes.find(
                        (entry) => entry.id === item.id,
                      );
                      const binding = attribute
                        ? postBinding(attribute)
                        : undefined;
                      const locked =
                        attribute && binding
                          ? isPostAttributeLocked(attribute, binding)
                          : false;
                      return (
                        <MenuItem
                          key={item.id}
                          label={item.label}
                          leadingVisual={
                            attribute
                              ? postAttributeIcon(attribute)
                              : item.icon
                          }
                          secondaryLabel={item.valueLabel}
                          secondaryLabelPosition="Inline"
                          trailingElement={
                            attribute?.id === 'classification' || locked
                          }
                          trailingVisual={
                            attribute?.id === 'classification' ? (
                              <ClassificationPill
                                valueId={item.valueId}
                                label={item.valueLabel}
                                locked
                              />
                            ) : undefined
                          }
                          disabled={locked}
                          onClick={() => {
                            if (!locked) pick(item.id);
                          }}
                        />
                      );
                    })}
                  </PopoverMenuGroup>
                )}
                {configuredVisible.length === 0 &&
                  inheritedVisible.length === 0 && (
                    <p className={styles['add-modal__empty']}>
                      No matching attributes.
                    </p>
                  )}
              </PopoverMenuScroll>
            </PopoverMenu>
          </div>
        </Modal>
      </div>
    </div>
  );
}
