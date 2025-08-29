import { Link, useNavigate } from '@tanstack/react-router';
import { Avatar, Dropdown, MenuProps, message } from 'antd';
import { useState } from 'react';

import { authLogout } from '@services/AuthService';
import { authStore } from '@stores/authStore';

import { IconLogOut } from '@components/icons';
import { useStore } from '@tanstack/react-store';
import { FaUser, FaUserCircle } from 'react-icons/fa';

type MenuItem = Required<MenuProps>['items'][number];

export default function UserDropdown() {
  const navigate = useNavigate();
  const { user } = useStore(authStore);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double-click

    setIsLoggingOut(true);

    try {
      // Show immediate feedback
      message.loading({
        content: 'Đang đăng xuất...',
        key: 'logout',
        duration: 0.5
      });

      // Perform logout (now non-blocking)
      await authLogout();

      // Show success message briefly
      message.success({
        content: 'Đăng xuất thành công!',
        key: 'logout',
        duration: 1
      });

      // Navigate immediately after clearing auth
      navigate({ to: '/login', replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if error, still navigate to login
      message.error({
        content: 'Đã đăng xuất',
        key: 'logout',
        duration: 1
      });
      navigate({ to: '/login', replace: true });
    } finally {
      setIsLoggingOut(false);
    }
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
      label: <Link to={'/profile'}>Hồ Sơ</Link>,
      icon: <FaUserCircle />
    },
    { type: 'divider' },
    {
      key: 'log-out',
      label: isLoggingOut ? 'Đang đăng xuất...' : 'Đăng Xuất',
      icon: <IconLogOut />,
      onClick: handleLogout,
      disabled: isLoggingOut
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
