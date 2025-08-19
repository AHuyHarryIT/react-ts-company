import { MenuItem } from '@/types/menuItem';
import logo from '@assets/images/logo/logoAsset.svg';
import { toggleSidebar, uiStore } from '@stores/uiStore';
import { Link, useLocation } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { Image, Menu } from 'antd';
import React from 'react';
import { IconContext } from 'react-icons';

interface SidebarMenuProps {
  items: MenuItem[];
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ items }) => {
  const { pathname } = useLocation();
  const { theme, isMobile } = useStore(uiStore);

  return (
    <>
      <div className="flex items-center justify-center p-4">
        <Link
          to="/"
          onClick={() => {
            if (isMobile) {
              toggleSidebar();
            }
          }}
        >
          <Image className="w-full" src={logo} alt="Logo" preview={false} />
        </Link>
      </div>
      <IconContext.Provider value={{ size: '1.25rem' }}>
        <Menu
          theme={theme}
          mode="inline"
          items={items}
          defaultSelectedKeys={['/']}
          selectedKeys={[pathname]}
          onClick={() => {
            if (isMobile) {
              toggleSidebar();
            }
          }}
        />
      </IconContext.Provider>
    </>
  );
};
