import { MenuProps } from 'antd';
import type { IconType } from 'react-icons';
import { FaCircle } from 'react-icons/fa';

// ----- Types -----

export interface SidebarItem {
  id: number;
  permission_id: number;
  key: string;
  title: string;
  icon?: string | IconType;
  url?: string;
}

export type MenuItem = Required<MenuProps>['items'][number];

// ----- Icon mặc định -----
export const DefaultIcon = FaCircle;
