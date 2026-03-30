import { MenuItem } from '@/types/menuItem';
import logo from '@assets/images/logo/logoAsset.svg';
import { toggleSidebar, uiStore } from '@stores/uiStore';
import { Link, useLocation } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { ConfigProvider, Image, Menu } from 'antd';
import React from 'react';
import { IconContext } from 'react-icons';

interface SidebarMenuProps {
  items: MenuItem[];
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ items }) => {
  const { pathname } = useLocation();
  const { theme, isMobile, isSidebarClose } = useStore(uiStore);

  const [openKeys, setOpenKeys] = React.useState<string[]>([]);

  // wrap the label for items with children to attach onMouseEnter for opening submenu
  const hoverItems = React.useMemo<MenuItem[]>(() => {
    if (isMobile) return items;

    const wrap = (
      list?: MenuItem[],
      parentPath: string[] = []
    ): MenuItem[] | undefined => {
      if (!list) return list;

      return list.map((it) => {
        if (!it) return it;

        const hasChildren =
          'children' in it && it.children && it.children.length > 0;
        const keyStr =
          typeof it.key === 'string' ? (it.key as string) : undefined;

        if (hasChildren && keyStr) {
          const originalLabel = it.label as React.ReactNode;

          const wrappedParentLabel = (
            <div
              onMouseEnter={() => {
                setOpenKeys([...parentPath, keyStr]);
              }}
              className="relative flex items-center"
            >
              {originalLabel}
            </div>
          );

          return {
            ...it,
            label: wrappedParentLabel,
            children: wrap(it.children, [...parentPath, keyStr]) as MenuItem[]
          };
        }

        return it;
      });
    };

    return (wrap(items) || []) as MenuItem[];
  }, [items, isMobile]);

  const handleClick = () => {
    if (isMobile) toggleSidebar();
  };

  return (
    <>
      {/* ── Logo Area ─────────────────────────────────────── */}
      <div>
        <div
          className={`flex items-center justify-center ${isSidebarClose ? 'p-3' : 'p-5'}`}
        >
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
        {/* Separator */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
      </div>

      {/* ── Menu ──────────────────────────────────────────── */}
      <div className="py-2">
        <IconContext.Provider value={{ size: '1.25rem' }}>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#475569' // slate-600
              },
              components: {
                Menu: {
                  itemSelectedBg: 'transparent',
                  itemSelectedColor: '#334155', // slate-700
                  itemHoverBg: 'transparent',
                  itemHoverColor: '#475569', // slate-600
                  itemActiveBg: 'transparent',
                  subMenuItemBg: 'transparent',
                  itemBg: 'transparent',
                  iconSize: 20
                }
              }
            }}
          >
            <Menu
              theme={theme}
              mode="inline"
              items={hoverItems}
              defaultSelectedKeys={['/']}
              selectedKeys={[pathname]}
              openKeys={isMobile ? undefined : openKeys}
              onOpenChange={isMobile ? undefined : (keys) => setOpenKeys(keys)}
              onClick={handleClick}
              onMouseLeave={() => {
                if (!isMobile) setOpenKeys([]);
              }}
              className="!border-none [&_.ant-menu-item]:mx-2.5 [&_.ant-menu-item]:my-[3px] [&_.ant-menu-item]:rounded-xl [&_.ant-menu-item]:transition-all [&_.ant-menu-item]:duration-300 [&_.ant-menu-item]:ease-out [&_.ant-menu-item_.ant-menu-item-icon]:transition-colors [&_.ant-menu-item_.ant-menu-item-icon]:duration-300 [&_.ant-menu-item-selected]:bg-gradient-to-r [&_.ant-menu-item-selected]:from-slate-100 [&_.ant-menu-item-selected]:to-slate-100/40 [&_.ant-menu-item-selected]:font-semibold [&_.ant-menu-item-selected]:shadow-sm [&_.ant-menu-item-selected]:shadow-slate-200/50 dark:[&_.ant-menu-item-selected]:from-slate-500/15 dark:[&_.ant-menu-item-selected]:to-slate-500/5 dark:[&_.ant-menu-item-selected]:shadow-slate-500/10 [&_.ant-menu-item-selected_.ant-menu-item-icon]:text-slate-600 dark:[&_.ant-menu-item-selected_.ant-menu-item-icon]:text-slate-300 [&_.ant-menu-item-selected_.ant-menu-title-content]:text-slate-700 dark:[&_.ant-menu-item-selected_.ant-menu-title-content]:text-slate-300 [&_.ant-menu-item:active]:scale-[0.98] [&_.ant-menu-item:active]:bg-slate-100 dark:[&_.ant-menu-item:active]:bg-white/10 [&_.ant-menu-item:hover]:translate-x-0.5 [&_.ant-menu-item:hover]:bg-slate-50 [&_.ant-menu-item:hover]:shadow-sm dark:[&_.ant-menu-item:hover]:bg-white/5 [&_.ant-menu-item:hover_.ant-menu-item-icon]:text-slate-600 dark:[&_.ant-menu-item:hover_.ant-menu-item-icon]:text-slate-300 [&_.ant-menu-sub]:bg-transparent [&_.ant-menu-sub_.ant-menu-item]:ml-3 [&_.ant-menu-sub_.ant-menu-item]:text-[13px] [&_.ant-menu-sub_.ant-menu-item]:opacity-80 [&_.ant-menu-sub_.ant-menu-item:hover]:opacity-100 [&_.ant-menu-submenu-arrow]:transition-transform [&_.ant-menu-submenu-arrow]:duration-300 [&_.ant-menu-submenu-arrow]:ease-out [&_.ant-menu-submenu-title]:mx-2.5 [&_.ant-menu-submenu-title]:my-[3px] [&_.ant-menu-submenu-title]:rounded-xl [&_.ant-menu-submenu-title]:transition-all [&_.ant-menu-submenu-title]:duration-300 [&_.ant-menu-submenu-title]:ease-out [&_.ant-menu-submenu-title_.ant-menu-item-icon]:transition-colors [&_.ant-menu-submenu-title_.ant-menu-item-icon]:duration-300 [&_.ant-menu-submenu-title:active]:scale-[0.98] [&_.ant-menu-submenu-title:active]:bg-slate-100 dark:[&_.ant-menu-submenu-title:active]:bg-white/10 [&_.ant-menu-submenu-title:hover]:translate-x-0.5 [&_.ant-menu-submenu-title:hover]:bg-slate-50 [&_.ant-menu-submenu-title:hover]:shadow-sm dark:[&_.ant-menu-submenu-title:hover]:bg-white/5 [&_.ant-menu-submenu-title:hover_.ant-menu-item-icon]:text-slate-600 dark:[&_.ant-menu-submenu-title:hover_.ant-menu-item-icon]:text-slate-300"
            />
          </ConfigProvider>
        </IconContext.Provider>
      </div>
    </>
  );
};
