import type { MenuItem } from '@/types/menuItem';
import {
  DefaultIcon,
  permissionIconMap,
  permissionPathMap
} from '@/types/menuItem';
import { Permission } from '@/types/permissionType';
import { IconEdit, IconLogOut } from '@components/icons';
import { useAuth } from '@hooks/useAuth';
import { authLogout } from '@services/AuthService';
import { toggleSidebar, uiStore } from '@stores/uiStore';
import { Link, useNavigate } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { Button, Drawer, Layout } from 'antd';
import { useMemo } from 'react';
import type { IconType } from 'react-icons';
import * as FaIcons from 'react-icons/fa';
import { SidebarMenu } from './SidebarMenu';
import { HiOutlineHome } from 'react-icons/hi';

const { Sider } = Layout;

function Sidebar() {
  const navigate = useNavigate();
  const { isSidebarClose, theme, isMobile } = useStore(uiStore);
  const { user } = useAuth();

  const permissions = useMemo(() => user?.permissions ?? [], [user]);

  // 🔧 mapper: từ string FA class → react-icons component
  // 🔧 mapper: chuyển class FA ("fas fa-xxx fa-lg") → IconType (react-icons/fa) với heuristics
  const mapFaClassToIconType = (faClass?: string): IconType | null => {
    if (!faClass) return null;

    // Lấy token chính "fa-xxx" từ chuỗi: "fas fa-xxx fa-lg"
    const parts = faClass.split(/\s+/).filter(Boolean);
    const raw = parts.find(
      (p) => p.startsWith('fa-') && !/^fa[brlsd]?$/i.test(p)
    ); // bỏ fas/far/fal/fab/fad
    if (!raw) return null;

    // Chuẩn hoá base name: "fa-sheet-plastic" → "sheet-plastic"
    const base = raw.replace(/^fa-/, '');

    // Helper
    const toPascal = (s: string) =>
      s
        .split('-')
        .map((t) => (t ? t[0].toUpperCase() + t.slice(1) : ''))
        .join('');

    // Tạo danh sách candidate theo nhiều biến thể/heuristics để tăng khả năng khớp FA5
    const candidates: string[] = [];

    // 1) tên gốc
    candidates.push('Fa' + toPascal(base));

    // 2) một số heuristic phổ biến FA6 → FA5
    //   - trash-can → trash
    //   - user-group → users
    //   - arrows-rotate → sync
    //   - right-left → exchangeAlt
    //   - circle-check → checkCircle
    //   - circle-xmark → timesCircle
    //   - circle-info → infoCircle
    //   - sheet-plastic → file-invoice / file-alt (ưu tiên invoice)
    //   - file-lines → file-alt
    //   - calendar-days → calendarAlt
    //   - arrow-rotate-right → redo
    //   - arrow-rotate-left → undo
    const rules: Array<(s: string) => string | null> = [
      (s) => s.replace('trash-can', 'trash'),
      (s) => s.replace('user-group', 'users'),
      (s) => s.replace('arrows-rotate', 'sync'),
      (s) => s.replace('right-left', 'exchange-alt'),
      (s) => s.replace('circle-check', 'check-circle'),
      (s) => s.replace('circle-xmark', 'times-circle'),
      (s) => s.replace('circle-info', 'info-circle'),
      (s) => (s.includes('sheet-plastic') ? 'file-invoice' : s),
      (s) => (s.includes('sheet-plastic') ? 'file-alt' : s),
      (s) => s.replace('file-lines', 'file-alt'),
      (s) => s.replace('calendar-days', 'calendar-alt'),
      (s) => s.replace('arrow-rotate-right', 'redo'),
      (s) => s.replace('arrow-rotate-left', 'undo')
    ];

    rules.forEach((transform) => {
      const t = transform(base);
      if (t && t !== base) {
        candidates.push('Fa' + toPascal(t));
      }
    });

    // 3) thêm biến thể bỏ hậu tố thường gặp: '-alt', '-o', '-solid', '-regular'
    if (/-alt$/.test(base)) {
      candidates.push('Fa' + toPascal(base.replace(/-alt$/, '')));
    }
    if (/-o$/.test(base)) {
      candidates.push('Fa' + toPascal(base.replace(/-o$/, '')));
    }
    ['-solid', '-regular', '-light', '-thin', '-duotone'].forEach((suf) => {
      if (base.endsWith(suf))
        candidates.push('Fa' + toPascal(base.replace(suf, '')));
    });

    // 4) thử map các ứng viên vào react-icons
    for (const name of candidates) {
      const IconComp = (FaIcons as Record<string, IconType>)[name];
      if (IconComp) return IconComp;
    }

    return null;
  };

  const dashboardItems: MenuItem[] = [
    {
      key: 'dashboard',
      label: (
        <Link to={'/'}>
          <span className="capitalize">Trang chủ</span>
        </Link>
      ),
      icon: <HiOutlineHome />
    }
  ];

  const items: MenuItem[] = useMemo(() => {
    const renderSidebarIcon = (icon?: string | IconType) => {
      // 1. Nếu backend trả sẵn IconType
      if (typeof icon !== 'string' && icon) {
        const IconComp = icon as IconType;
        return <IconComp className="text-xl" />;
      }

      // 2. Nếu backend trả string fa-class → map sang react-icons
      if (typeof icon === 'string') {
        const Mapped = mapFaClassToIconType(icon);
        if (Mapped) return <Mapped className="text-xl" />;
        return <i className={`${icon} text-xl`} />;
      }

      // 3. fallback
      return <DefaultIcon className="text-xl" />;
    };

    const renderPermissionIcon = (perm: Permission) => {
      const IconComp = permissionIconMap[perm.key];
      if (IconComp) return <IconComp className="text-xl" />;

      const first = perm.sidebar_items?.[0];
      if (first) return renderSidebarIcon(first.icon);

      return <DefaultIcon className="text-xl" />;
    };

    return permissions
      .filter((p) => ['sidebar', 'both'].includes(p.display_area))
      .map((perm) => {
        if (perm.sidebar_items?.length > 0) {
          return {
            key: perm.key,
            label: <span className="capitalize">{perm.name}</span>,
            icon: renderPermissionIcon(perm),
            children: perm.sidebar_items.map((item) => ({
              key: item.key,
              label: (
                <Link to={permissionPathMap[item.key] || '/'}>
                  <span className="capitalize">{item.title}</span>
                </Link>
              ),
              icon: renderSidebarIcon(item.icon)
            }))
          };
        }

        return {
          key: perm.key,
          label: (
            <Link to={permissionPathMap[perm.key] || '/'}>
              <span className="capitalize">{perm.name}</span>
            </Link>
          ),
          icon: renderPermissionIcon(perm)
        };
      });
  }, [permissions]);

  const sidebarStyle: React.CSSProperties = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'none'
  };

  const sidebarContent = (
    <>
      <SidebarMenu items={[...dashboardItems, ...items]} />
      {(user?.role.name || '').toLocaleLowerCase().includes('super admin') && (
        <Link to="/admin/edit-layout">
          <Button className="w-full" icon={<IconEdit />}>
            {!isSidebarClose && 'Chỉnh giao diện'}
          </Button>
        </Link>
      )}
    </>
  );

  const handleLogout = async () => {
    await authLogout();
    navigate({ to: '/login' });
  };
  return (
    <>
      {isMobile ? (
        <Drawer
          closable={false}
          width={256}
          placement="left"
          onClose={toggleSidebar}
          open={!isSidebarClose}
          styles={{ body: { padding: 0 }, footer: { padding: 0 } }}
          footer={
            <Button
              className="w-full"
              size="large"
              icon={<IconLogOut />}
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          }
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Sider
          style={sidebarStyle}
          width={256}
          theme={theme}
          trigger={null}
          breakpoint="md"
          collapsible
          collapsed={isSidebarClose}
          onCollapse={toggleSidebar}
        >
          <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div style={{ flex: 1, minHeight: 0 }}>{sidebarContent}</div>
            <div>
              <Button
                className="w-full"
                size="large"
                icon={<IconLogOut />}
                onClick={handleLogout}
                children={!isSidebarClose && 'Đăng xuất'}
              />
            </div>
          </div>
        </Sider>
      )}
    </>
  );
}

export default Sidebar;
