import { Avatar, Dropdown, MenuProps } from 'antd';
import { Key, ReactNode } from 'react';
import { FaUser, FaUserCircle } from 'react-icons/fa';
import { GoGear } from 'react-icons/go';
import { IoIosLogOut } from 'react-icons/io';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';

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
  {
    type: 'item',
    key: 'user',
    label: (
      <div>
        <span className="text-theme-sm block font-medium text-gray-700 dark:text-gray-400">
          Full name
        </span>
        <span className="text-theme-xs mt-0.5 block text-gray-500 dark:text-gray-400">
          username@gmail.com
        </span>
      </div>
    ),
    disabled: true,
    style: { cursor: 'default' },
  },
  getItem(<Link to={'/'}>Profile</Link>, 'profile', <FaUserCircle />),
  getItem(<Link to={'/'}>Setting</Link>, 'setting', <GoGear />),
  getItem(
    <Link to={'/'}>Support</Link>,
    'Support',
    <IoInformationCircleOutline />
  ),
  { type: 'divider' },
  getItem(<Link to={'/'}>Log out</Link>, 'log-out', <IoIosLogOut />),
];

export default function UserDropdown() {
  return (
    <>
      <Dropdown menu={{ items }} trigger={['click']} arrow>
        <button className="cursor-pointer">
          <Avatar size={40} icon={<FaUser />} />
        </button>
      </Dropdown>
    </>
  );
}
