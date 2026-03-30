import { SidebarItem } from './menuItem';

export type Permission = {
  id: number;
  key: string;
  name: string;
  icon?: string;
  url?: string | null;
  sort_order: number;
  type: 'admin' | 'employee' | 'both';
  display_area: string;
  pivot?: {
    role_id: number;
    permission_id: number;
  };
  sidebar_items: SidebarItem[];
};
