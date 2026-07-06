export type Classification = 'unclass' | 'cui' | 'secret' | 'ts';

export type Product = 'channels' | 'pages' | 'agents' | 'playbooks';

export type ResourceKind = 'hub' | 'channel' | 'dm' | 'page' | 'agent' | 'playbook' | 'run';

export interface ResourceTab {
  id: string;
  kind: ResourceKind;
  label: string;
  classification: Classification;
  product?: Product;
  /** e.g. "Pages › Daily Stand…" — shown as prefix breadcrumb */
  productBreadcrumb?: string;
  pinned?: boolean;
}

export const CLASSIFICATION_META: Record<
  Classification,
  { label: string; abbrev: string; color: string; rgb: string }
> = {
  unclass: {
    label: 'UNCLASSIFIED',
    abbrev: 'U',
    color: '#1e7a52',
    rgb: '30, 122, 82',
  },
  cui: {
    label: 'CONTROLLED UNCLASSIFIED',
    abbrev: 'CUI',
    color: '#d18914',
    rgb: '209, 137, 20',
  },
  secret: {
    label: 'SECRET',
    abbrev: 'S',
    color: '#d24b4e',
    rgb: '210, 75, 78',
  },
  ts: {
    label: 'TOP SECRET',
    abbrev: 'TS',
    color: '#8a3a3c',
    rgb: '138, 58, 60',
  },
};

export const PRODUCT_META: Record<Product, { label: string; icon: string }> = {
  channels: { label: 'Channels', icon: 'message-text-outline' },
  pages: { label: 'Pages', icon: 'file-document-outline' },
  agents: { label: 'Agents', icon: 'creation' },
  playbooks: { label: 'Playbooks', icon: 'clipboard-check-outline' },
};
