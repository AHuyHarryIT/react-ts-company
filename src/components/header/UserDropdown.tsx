import { Link, useNavigate } from '@tanstack/react-router';
import { Avatar, Dropdown, MenuProps } from 'antd';

import { authLogout } from '@services/AuthService';
import { authStore } from '@stores/authStore';

import { IconLogOut } from '@components/icons';
import { useStore } from '@tanstack/react-store';
import { FaUser, FaUserCircle } from 'react-icons/fa';

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
          <span className="text-theme-xs mt-0.5 block text-center text-gray-500 dark:text-gray-400">
            {user?.role?.name || '<Role Name>'}
          </span>
        </div>
      ),
      disabled: true,
      style: { cursor: 'default' }
    },
    {
      key: 'profile',
      label: <Link to={'/'}>Hồ Sơ</Link>,
      icon: <FaUserCircle />
    },
    { type: 'divider' },
    {
      key: 'log-out',
      label: 'Đăng Xuất',
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
