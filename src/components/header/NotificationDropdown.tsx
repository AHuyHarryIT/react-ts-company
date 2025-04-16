import { Dropdown, MenuProps } from 'antd';
import React, { Key, ReactNode } from 'react';
import { FaRegBell } from 'react-icons/fa';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: ReactNode,
  key: Key,
  icon?: ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem(<>GG</>, 'noti-1'),
  getItem(<>GG</>, 'noti-1'),
  getItem(<>GG</>, 'noti-1'),
  getItem(<>GG</>, 'noti-1'),
];

export default function NotificationDropdown() {
  return (
    <Dropdown menu={{ items }} trigger={['click']} arrow>
      <button className="hover:text-dark-900 relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
        <FaRegBell className="text-xl" />
      </button>
    </Dropdown>
  );
}
