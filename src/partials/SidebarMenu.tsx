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

  const [openKeys, setOpenKeys] = React.useState<string[]>([]);

  // wrap the label for items with children to attach onMouseEnter for opening submenu
  const hoverItems = React.useMemo<MenuItem[]>(() => {
    if (isMobile) return items;

    // Recursive: pass the "path" of parent keys to open the correct branch
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

          // Hover over parent title -> open the entire path (parent...-> current)
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

          // Recursive for children, update parentPath
          return {
            ...it,
            label: wrappedParentLabel,
            children: wrap(it.children, [...parentPath, keyStr]) as MenuItem[] // [ ]: MenuItem[]
          };
        }

        // Regular item -> keep unchanged
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
          items={hoverItems}
          defaultSelectedKeys={['/']}
          selectedKeys={[pathname]}
          openKeys={isMobile ? undefined : openKeys}
          onOpenChange={isMobile ? undefined : (keys) => setOpenKeys(keys)}
          onClick={handleClick}
          // Only close when the mouse leaves the entire Menu
          onMouseLeave={() => {
            if (!isMobile) setOpenKeys([]);
          }}
          className="[&_.ant-menu-submenu]:group [&_.ant-menu-item]:mx-2 [&_.ant-menu-item]:my-1.5 [&_.ant-menu-item]:rounded-lg [&_.ant-menu-item]:transition-all [&_.ant-menu-item]:duration-300 [&_.ant-menu-item]:ease-out [&_.ant-menu-item_svg]:transition-all [&_.ant-menu-item_svg]:duration-300 [&_.ant-menu-item-selected]:scale-[1.02] [&_.ant-menu-item-selected]:bg-blue-50/80 [&_.ant-menu-item-selected]:font-medium [&_.ant-menu-item-selected]:shadow-lg dark:[&_.ant-menu-item-selected]:bg-blue-500/20 [&_.ant-menu-item-selected_.ant-menu-title-content]:text-blue-600 dark:[&_.ant-menu-item-selected_.ant-menu-title-content]:text-blue-400 [&_.ant-menu-item:focus-visible]:ring-2 [&_.ant-menu-item:focus-visible]:ring-blue-500 [&_.ant-menu-item:focus-visible]:ring-offset-2 [&_.ant-menu-item:focus-visible]:outline-none [&_.ant-menu-item:hover]:translate-x-1 [&_.ant-menu-item:hover]:scale-[1.02] [&_.ant-menu-item:hover]:bg-black/5 [&_.ant-menu-item:hover]:shadow-md dark:[&_.ant-menu-item:hover]:bg-white/10 [&_.ant-menu-item:hover_.ant-menu-title-content]:translate-x-1 [&_.ant-menu-item:hover_.ant-menu-title-content]:text-blue-600 dark:[&_.ant-menu-item:hover_.ant-menu-title-content]:text-blue-400 [&_.ant-menu-item:hover_svg]:scale-125 [&_.ant-menu-item:hover_svg]:rotate-3 [&_.ant-menu-sub]:bg-transparent [&_.ant-menu-sub]:transition-opacity [&_.ant-menu-sub]:duration-300 [&_.ant-menu-sub_.ant-menu-item]:ml-4 [&_.ant-menu-sub_.ant-menu-item]:opacity-90 [&_.ant-menu-sub_.ant-menu-item:hover]:opacity-100 [&_.ant-menu-submenu-arrow]:transition-transform [&_.ant-menu-submenu-arrow]:duration-300 [&_.ant-menu-submenu-open_.ant-menu-submenu-arrow]:rotate-90 [&_.ant-menu-submenu-title]:mx-2 [&_.ant-menu-submenu-title]:my-1.5 [&_.ant-menu-submenu-title]:rounded-lg [&_.ant-menu-submenu-title]:transition-all [&_.ant-menu-submenu-title]:duration-300 [&_.ant-menu-submenu-title]:ease-out [&_.ant-menu-submenu-title_svg]:transition-all [&_.ant-menu-submenu-title_svg]:duration-300 [&_.ant-menu-submenu-title:hover]:translate-x-1 [&_.ant-menu-submenu-title:hover]:scale-[1.02] [&_.ant-menu-submenu-title:hover]:bg-black/5 [&_.ant-menu-submenu-title:hover]:shadow-md dark:[&_.ant-menu-submenu-title:hover]:bg-white/10 [&_.ant-menu-submenu-title:hover_.ant-menu-title-content]:translate-x-1 [&_.ant-menu-submenu-title:hover_.ant-menu-title-content]:text-blue-600 dark:[&_.ant-menu-submenu-title:hover_.ant-menu-title-content]:text-blue-400 [&_.ant-menu-submenu-title:hover_svg]:scale-125 [&_.ant-menu-submenu-title:hover_svg]:rotate-3 [&_.ant-menu-submenu:hover_.ant-menu-sub]:opacity-100"
        />
      </IconContext.Provider>
    </>
  );
};
