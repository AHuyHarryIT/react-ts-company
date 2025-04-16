import { Avatar, Dropdown, MenuProps } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { authLogout } from '@services/AuthService';
import { logout } from '@stores/authSlice';
import { AppDispatch, RootState } from '@stores/index';

import { FaUser, FaUserCircle } from 'react-icons/fa';
import { GoGear } from 'react-icons/go';
import { IoIosLogOut } from 'react-icons/io';
import { IoInformationCircleOutline } from 'react-icons/io5';

type MenuItem = Required<MenuProps>['items'][number];

export default function UserDropdown() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const handleLogout = async () => {
    await authLogout();
    dispatch(logout());
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
      style: { cursor: 'default' },
    },
    {
      key: 'profile',
      label: <Link to={'/'}>Profile</Link>,
      icon: <FaUserCircle />,
    },
    {
      key: 'setting',
      label: <Link to={'/'}>Setting</Link>,
      icon: <GoGear />,
    },
    {
      key: 'support',
      label: <Link to={'/'}>Support</Link>,
      icon: <IoInformationCircleOutline />,
    },
    { type: 'divider' },
    {
      key: 'log-out',
      label: 'Log out',
      icon: <IoIosLogOut />,
      onClick: handleLogout,
    },
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
