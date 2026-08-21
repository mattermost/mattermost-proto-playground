export type AdminConsoleSidebarCategoryIconKey =
  | 'billing'
  | 'reporting'
  | 'users'
  | 'environment'
  | 'site'
  | 'authentication'
  | 'plugins'
  | 'integrations'
  | 'compliance'
  | 'experimental';

export interface AdminConsoleSidebarItemModel {
  name: string;
  active?: boolean;
}

export interface AdminConsoleSidebarGroupModel {
  key: string;
  categoryLabel: string;
  categoryIconKey: AdminConsoleSidebarCategoryIconKey;
  /** First section in System Console stays visible at the top while scrolling. */
  stickyCategory?: boolean;
  items: AdminConsoleSidebarItemModel[];
}
