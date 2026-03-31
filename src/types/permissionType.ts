import { SidebarItem } from './menuItem';

export type Permission = {
  id: number;
  key: string;
  name: string;
  icon?: string | null;
  url?: string | null;
  sort_order: number;
  type: 'admin' | 'employee' | 'both';
  module: string;
  display_area: 'home' | 'sidebar' | 'both';
  pivot?: {
    role_id: number;
    permission_id: number;
  };
  sidebar_items: SidebarItem[];
};
