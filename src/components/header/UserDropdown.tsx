import { Link, useNavigate } from '@tanstack/react-router';
import { Avatar, Dropdown, MenuProps } from 'antd';

import { authLogout } from '@services/AuthService';
import { authStore } from '@stores/authStore';

import { IconLogOut } from '@components/icons';
import { useStore } from '@tanstack/react-store';
import { FaUser, FaUserCircle } from 'react-icons/fa';
import { GoGear } from 'react-icons/go';
import { IoInformationCircleOutline } from 'react-icons/io5';

type MenuItem = Required<MenuProps>['items'][number];

export default function UserDropdown() {
  const navigate = useNavigate();
  const { user } = useStore(authStore);

  const handleLogout = async () => {
    await authLogout();
    navigate({ to: '/login' });
  };

  const items: MenuItem[] = [
    {
      type: 'item',
      key: 'user',
      label: (
        <div>
          <span className="text-theme-sm block font-medium text-gray-800 dark:text-gray-400">
            {user?.name || '<User Name>'}
          </span>
          <span className="text-theme-xs mt-0.5 block text-gray-500 dark:text-gray-400">
            {user?.role?.name || '<Role Name>'}
          </span>
        </div>
      ),
      disabled: true,
      style: { cursor: 'default' }
    },
    {
      key: 'profile',
      label: <Link to={'/'}>Profile</Link>,
      icon: <FaUserCircle />
    },
    {
      key: 'setting',
      label: <Link to={'/'}>Setting</Link>,
      icon: <GoGear />
    },
    {
      key: 'support',
      label: <Link to={'/'}>Support</Link>,
      icon: <IoInformationCircleOutline />
    },
    { type: 'divider' },
    {
      key: 'log-out',
      label: 'Log out',
      icon: <IconLogOut />,
      onClick: handleLogout
    }
  ];

  return (
    <>
      <Dropdown menu={{ items }} trigger={['click']} arrow>
        <button className="cursor-pointer">
          <Avatar src={user?.image_url} size={40} icon={<FaUser />} />
        </button>
      </Dropdown>
    </>
  );
}
