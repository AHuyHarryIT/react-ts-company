import type { MenuItem } from '@/types/menuItem';
import { DefaultIcon } from '@/types/menuItem';
import logo from '@assets/images/logo/logoAsset.svg';
import { Permission } from '@/types/permissionType';
import { IconEdit, IconLogOut, IconShield } from '@components/icons';
import { useAuth } from '@hooks/useAuth';
import { authLogout } from '@services/AuthService';
import { toggleSidebar, uiStore } from '@stores/uiStore';
import { Link, useNavigate } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { Drawer, Layout, message } from 'antd';
import React, { useMemo, useState } from 'react';
import type { IconType } from 'react-icons';
import * as FaIcons from 'react-icons/fa';
import { SidebarMenu } from './SidebarMenu';
import { HiOutlineHome } from 'react-icons/hi';
import { FaChevronDown, FaCommentDots } from 'react-icons/fa';
import FeedbackDrawer from '@components/feedback/FeedbackDrawer';

const { Sider } = Layout;

// ── Mobile Menu Item Component ──────────────────────────────
// Unified icon style — matches sidebar slate theme
const ICON_STYLE = {
  bg: 'bg-slate-100',
  text: 'text-slate-600',
  darkBg: 'dark:bg-slate-800/40',
  darkText: 'dark:text-slate-400'
};

// ── Dynamic size calculation based on item count ──
function lerp(min: number, max: number, t: number) {
  return Math.round(min + (max - min) * t);
}

function calcSidebarSizes(itemCount: number) {
  // t = 1.0 when few items (≤4), t = 0.0 when many items (≥16)
  const t = Math.max(0, Math.min(1, (16 - itemCount) / 12));
  return {
    logo: lerp(56, 80, t),
    avatar: lerp(32, 40, t),
    icon: lerp(28, 36, t),
    fontSize: lerp(13, 15, t),
    itemPy: lerp(5, 10, t),
    itemGap: lerp(8, 12, t),
    itemPx: lerp(10, 14, t),
    childIcon: lerp(18, 24, t),
    childFont: lerp(12, 14, t),
    childPy: lerp(4, 8, t),
    childGap: lerp(6, 10, t),
    profilePy: lerp(6, 10, t),
    profilePx: lerp(10, 14, t),
    sectionPy: lerp(6, 12, t),
    sectionPx: lerp(8, 12, t),
    logoutPy: lerp(6, 12, t)
  };
}

type SidebarSizes = ReturnType<typeof calcSidebarSizes>;

function MobileMenuItem({
  permission,
  onNavigate,
  renderIcon,
  isExpanded,
  onToggle,
  sizes
}: {
  permission: Permission;
  onNavigate: () => void;
  renderIcon: (icon?: string | IconType) => React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  sizes: SidebarSizes;
}) {
  const hasChildren = permission.sidebar_items?.length > 0;
  const linkStyle = { color: 'inherit', textDecoration: 'none' } as const;
  const color = ICON_STYLE;

  const itemStyle: React.CSSProperties = {
    gap: sizes.itemGap,
    paddingTop: sizes.itemPy,
    paddingBottom: sizes.itemPy,
    paddingLeft: sizes.itemPx,
    paddingRight: sizes.itemPx,
    fontSize: sizes.fontSize
  };
  const iconStyle: React.CSSProperties = {
    width: sizes.icon,
    height: sizes.icon,
    minWidth: sizes.icon,
    fontSize: sizes.icon * 0.4
  };
  const childItemStyle: React.CSSProperties = {
    gap: sizes.childGap,
    paddingTop: sizes.childPy,
    paddingBottom: sizes.childPy,
    paddingLeft: sizes.itemPx - 2,
    paddingRight: sizes.itemPx - 2,
    fontSize: sizes.childFont
  };
  const childIconStyle: React.CSSProperties = {
    width: sizes.childIcon,
    height: sizes.childIcon,
    minWidth: sizes.childIcon,
    fontSize: sizes.childIcon * 0.45
  };
  const childHeight = sizes.childPy * 2 + sizes.childIcon;

  if (!hasChildren) {
    return (
      <Link
        to={(permission.url || '/') as string}
        onClick={onNavigate}
        style={{ ...linkStyle, ...itemStyle }}
        className="flex items-center rounded-xl font-medium capitalize transition-all duration-300 ease-out active:scale-[0.97] active:bg-blue-50/60 dark:active:bg-white/5"
      >
        <span
          style={iconStyle}
          className={`flex items-center justify-center rounded-lg ${color.bg} ${color.text} ${color.darkBg} ${color.darkText} transition-colors duration-300`}
        >
          {renderIcon(permission.icon)}
        </span>
        <span>{permission.name}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={onToggle}
        style={itemStyle}
        className="flex w-full items-center rounded-xl font-medium capitalize transition-all duration-300 ease-out active:scale-[0.97] active:bg-blue-50/60 dark:active:bg-white/5"
      >
        <span
          style={iconStyle}
          className={`flex items-center justify-center rounded-lg ${color.bg} ${color.text} ${color.darkBg} ${color.darkText} transition-colors duration-300`}
        >
          {renderIcon(permission.icon)}
        </span>
        <span className="flex-1 text-left">{permission.name}</span>
        <FaChevronDown
          className={`text-[10px] text-gray-400 transition-transform duration-300 ease-out ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: isExpanded
            ? `${permission.sidebar_items.length * childHeight + 8}px`
            : '0px',
          opacity: isExpanded ? 1 : 0
        }}
      >
        <div style={{ marginLeft: sizes.icon + sizes.itemGap }}>
          {permission.sidebar_items.map((item) => (
            <Link
              key={item.key}
              to={(item.url || '/') as string}
              onClick={onNavigate}
              style={{ ...linkStyle, ...childItemStyle }}
              className="flex items-center rounded-lg text-gray-500 capitalize transition-all duration-300 ease-out active:scale-[0.97] active:bg-blue-50/60 dark:text-gray-400 dark:active:bg-white/5"
            >
              <span
                style={childIconStyle}
                className={`flex items-center justify-center rounded ${color.text} ${color.darkText} transition-colors duration-300`}
              >
                {renderIcon(item.icon)}
              </span>
              <span className="font-normal">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const { isSidebarClose, theme, isMobile } = useStore(uiStore);
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const permissions = useMemo(() => user?.permissions ?? [], [user]);

  // 🔧 mapper: từ string FA class → react-icons component
  const mapFaClassToIconType = (faClass?: string): IconType | null => {
    if (!faClass) return null;

    const parts = faClass.split(/\s+/).filter(Boolean);
    const raw = parts.find(
      (p) => p.startsWith('fa-') && !/^fa[brlsd]?$/i.test(p)
    );
    if (!raw) return null;

    const base = raw.replace(/^fa-/, '');

    const toPascal = (s: string) =>
      s
        .split('-')
        .map((t) => (t ? t[0].toUpperCase() + t.slice(1) : ''))
        .join('');

    const candidates: string[] = [];
    candidates.push('Fa' + toPascal(base));

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

    for (const name of candidates) {
      const IconComp = (FaIcons as Record<string, IconType>)[name];
      if (IconComp) return IconComp;
    }

    return null;
  };

  const dashboardItems: MenuItem[] = [
    {
      key: '/',
      label: (
        <Link to={'/'}>
          <span className="capitalize">Trang chủ</span>
        </Link>
      ),
      icon: <HiOutlineHome />
    }
  ];

  // Supervisor-specific menu items
  const supervisorItems: MenuItem[] = useMemo(() => {
    return [];
  }, []);

  const items: MenuItem[] = useMemo(() => {
    const renderSidebarIcon = (icon?: string | IconType) => {
      if (typeof icon !== 'string' && icon) {
        const IconComp = icon as IconType;
        return <IconComp className="text-xl" />;
      }

      if (typeof icon === 'string') {
        const Mapped = mapFaClassToIconType(icon);
        if (Mapped) return <Mapped className="text-xl" />;
        return <i className={`${icon} text-xl`} />;
      }

      return <DefaultIcon className="text-xl" />;
    };

    const renderPermissionIcon = (perm: Permission) => {
      if (perm.icon) return renderSidebarIcon(perm.icon);

      const first = perm.sidebar_items?.[0];
      if (first?.icon) return renderSidebarIcon(first.icon);

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
                <Link to={(item.url || '/') as string}>
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
            <Link to={(perm.url || '/') as string}>
              <span className="capitalize">{perm.name}</span>
            </Link>
          ),
          icon: renderPermissionIcon(perm)
        };
      });
  }, [permissions]);

  // ── Mobile-specific data ──
  const renderSidebarIconMobile = (
    icon?: string | IconType
  ): React.ReactNode => {
    if (!icon) return <DefaultIcon className="text-sm" />;
    if (typeof icon !== 'string') {
      const IconComp = icon as IconType;
      return <IconComp className="text-sm" />;
    }
    const Mapped = mapFaClassToIconType(icon);
    if (Mapped) return <Mapped className="text-sm" />;
    return <i className={`${icon} text-sm`} />;
  };

  const mobileMenuItems = useMemo(() => {
    return permissions
      .filter((p) => ['sidebar', 'both'].includes(p.display_area))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [permissions]);

  const isSuperAdmin = (user?.role.name || '')
    .toLocaleLowerCase()
    .includes('super admin');
  const roleName = (user?.role.name || '').toLocaleLowerCase();
  const isAdmin = roleName.includes('admin');
  // +1 for Dashboard, +2 for admin tools if super admin
  const totalItemCount = mobileMenuItems.length + 1 + (isSuperAdmin ? 2 : 0);
  const sizes = useMemo(
    () => calcSidebarSizes(totalItemCount),
    [totalItemCount]
  );

  const [expandedKey, setExpandedKey] = useState<string | null>(null);

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
      <SidebarMenu items={[...dashboardItems, ...supervisorItems, ...items]} />

      {/* ── Admin Tools ──────────────────────────────────── */}
      {(user?.role.name || '').toLocaleLowerCase().includes('super admin') && (
        <div className="mx-3 my-2 space-y-2">
          <div className="mx-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
          <div className="mb-1 px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
            {!isSidebarClose && 'Quản trị hệ thống'}
          </div>
          <Link to="/admin/rbac" className="block">
            <button className="flex w-full items-center gap-2.5 rounded-xl border border-blue-100/60 bg-blue-50/80 px-3 py-2.5 text-sm font-medium text-blue-700 transition-all duration-300 ease-out hover:translate-x-0.5 hover:bg-blue-100/80 hover:shadow-sm active:scale-[0.97] dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40">
              <IconShield className="flex-shrink-0 text-base" />
              {!isSidebarClose && <span>Phân quyền</span>}
            </button>
          </Link>
          <Link to="/admin/edit-layout" className="block">
            <button className="flex w-full items-center gap-2.5 rounded-xl border border-purple-100/60 bg-purple-50/80 px-3 py-2.5 text-sm font-medium text-purple-700 transition-all duration-300 ease-out hover:translate-x-0.5 hover:bg-purple-100/80 hover:shadow-sm active:scale-[0.97] dark:border-purple-800/50 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40">
              <IconEdit className="flex-shrink-0 text-base" />
              {!isSidebarClose && <span>Chỉnh giao diện</span>}
            </button>
          </Link>
        </div>
      )}
    </>
  );

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      message.loading({
        content: 'Đang đăng xuất...',
        key: 'logout',
        duration: 0.5
      });

      await authLogout();

      message.success({
        content: 'Đăng xuất thành công!',
        key: 'logout',
        duration: 1
      });

      navigate({ to: '/login', replace: true });
    } catch (error) {
      console.error('Logout error:', error);
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

  // ── Logout Button (desktop) ──
  const logoutButton = (
    <div className={`${isMobile ? '' : 'p-3'}`}>
      <div className="mx-1 mb-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
      {!isAdmin && (
        <button
          onClick={() => setFeedbackOpen(true)}
          className="mb-2 flex w-full items-center justify-center gap-2.5 rounded-xl border border-violet-100/60 bg-violet-50/80 px-3 py-2.5 text-sm font-medium text-violet-700 transition-all duration-300 ease-out hover:bg-violet-100/80 hover:shadow-sm active:scale-[0.97] dark:border-violet-800/50 dark:bg-violet-900/20 dark:text-violet-300 dark:hover:bg-violet-900/40"
        >
          <FaCommentDots className="flex-shrink-0 text-base" />
          {!isSidebarClose && <span>Góp ý</span>}
        </button>
      )}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-red-100/60 bg-red-50/80 px-3 py-2.5 text-sm font-medium text-red-600 transition-all duration-300 ease-out hover:bg-red-100/80 hover:shadow-sm active:scale-[0.97] disabled:opacity-50 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
      >
        <IconLogOut className="flex-shrink-0 text-base" />
        {!isSidebarClose && (
          <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
        )}
      </button>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          closable={false}
          width={300}
          placement="left"
          onClose={toggleSidebar}
          open={!isSidebarClose}
          styles={{
            body: { padding: 0 },
            wrapper: { boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }
          }}
        >
          <div className="flex h-full flex-col bg-white dark:bg-gray-900">
            {/* ── Logo ── */}
            <div
              className="flex justify-center px-4"
              style={{
                paddingTop: sizes.sectionPy * 0.5,
                paddingBottom: sizes.sectionPy * 0.25
              }}
            >
              <img src={logo} alt="Logo" style={{ height: sizes.logo }} />
            </div>
            {/* ── Profile Card ── */}
            <div
              style={{
                padding: `${sizes.profilePy * 0.5}px ${sizes.profilePx}px`
              }}
            >
              <div
                className="flex items-center rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10"
                style={{
                  gap: sizes.itemGap,
                  padding: `${sizes.profilePy}px ${sizes.profilePx}px`
                }}
              >
                <div
                  className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
                  style={{
                    width: sizes.avatar,
                    height: sizes.avatar,
                    minWidth: sizes.avatar
                  }}
                >
                  {user?.image_url ? (
                    <img
                      src={user.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center font-bold text-blue-600 dark:text-blue-400"
                      style={{ fontSize: sizes.avatar * 0.35 }}
                    >
                      {user?.name?.replace(/[()]/g, '').charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate font-semibold text-gray-800 dark:text-white"
                    style={{ fontSize: sizes.fontSize }}
                  >
                    {user?.name?.replace(/[()]/g, '').trim() || 'Người dùng'}
                  </p>
                  <p
                    className="truncate text-gray-500 dark:text-gray-400"
                    style={{ fontSize: sizes.fontSize - 2 }}
                  >
                    {user?.role?.name || 'Nhân viên'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />

            {/* ── Menu Items ── */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ padding: `${sizes.sectionPy}px ${sizes.sectionPx}px` }}
            >
              {/* Dashboard */}
              <Link
                to="/"
                onClick={toggleSidebar}
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  gap: sizes.itemGap,
                  paddingTop: sizes.itemPy,
                  paddingBottom: sizes.itemPy,
                  paddingLeft: sizes.itemPx,
                  paddingRight: sizes.itemPx,
                  fontSize: sizes.fontSize
                }}
                className="flex items-center rounded-xl font-medium transition-all duration-300 ease-out active:scale-[0.97] active:bg-blue-50/60 dark:active:bg-white/5"
              >
                <span
                  className="flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors duration-300 dark:bg-slate-700/40 dark:text-slate-300"
                  style={{
                    width: sizes.icon,
                    height: sizes.icon,
                    minWidth: sizes.icon,
                    fontSize: sizes.icon * 0.4
                  }}
                >
                  <HiOutlineHome />
                </span>
                <span>Trang chủ</span>
              </Link>

              <div className="mx-3 my-1 h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent dark:via-gray-700/60" />

              {/* Permission Items */}
              {mobileMenuItems.map((perm) => (
                <MobileMenuItem
                  key={perm.key}
                  permission={perm}
                  onNavigate={() => {
                    setExpandedKey(null);
                    toggleSidebar();
                  }}
                  renderIcon={renderSidebarIconMobile}
                  isExpanded={expandedKey === perm.key}
                  onToggle={() =>
                    setExpandedKey(expandedKey === perm.key ? null : perm.key)
                  }
                  sizes={sizes}
                />
              ))}

              {/* ── Admin Tools ── */}
              {isSuperAdmin && (
                <>
                  <div className="mx-3 my-1 h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent dark:via-gray-700/60" />
                  <p
                    className="font-bold tracking-widest text-gray-400 uppercase"
                    style={{
                      fontSize: sizes.fontSize - 5,
                      paddingLeft: sizes.itemPx,
                      marginBottom: sizes.itemPy * 0.5
                    }}
                  >
                    Quản trị
                  </p>
                  <Link
                    to="/admin/rbac"
                    onClick={toggleSidebar}
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      gap: sizes.itemGap,
                      paddingTop: sizes.itemPy,
                      paddingBottom: sizes.itemPy,
                      paddingLeft: sizes.itemPx,
                      paddingRight: sizes.itemPx,
                      fontSize: sizes.fontSize
                    }}
                    className="flex items-center rounded-xl font-medium transition-all duration-300 ease-out active:scale-[0.97] active:bg-blue-50/60 dark:active:bg-white/5"
                  >
                    <span
                      className="flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors duration-300 dark:bg-slate-700/40 dark:text-slate-300"
                      style={{
                        width: sizes.icon,
                        height: sizes.icon,
                        minWidth: sizes.icon,
                        fontSize: sizes.icon * 0.4
                      }}
                    >
                      <IconShield />
                    </span>
                    <span>Phân quyền</span>
                  </Link>
                  <Link
                    to="/admin/edit-layout"
                    onClick={toggleSidebar}
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      gap: sizes.itemGap,
                      paddingTop: sizes.itemPy,
                      paddingBottom: sizes.itemPy,
                      paddingLeft: sizes.itemPx,
                      paddingRight: sizes.itemPx,
                      fontSize: sizes.fontSize
                    }}
                    className="flex items-center rounded-xl font-medium transition-all duration-300 ease-out active:scale-[0.97] active:bg-purple-50/60 dark:active:bg-white/5"
                  >
                    <span
                      className="flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors duration-300 dark:bg-slate-700/40 dark:text-slate-300"
                      style={{
                        width: sizes.icon,
                        height: sizes.icon,
                        minWidth: sizes.icon,
                        fontSize: sizes.icon * 0.4
                      }}
                    >
                      <IconEdit />
                    </span>
                    <span>Chỉnh giao diện</span>
                  </Link>
                </>
              )}
            </div>

            {/* ── Góp ý + Logout (pinned bottom) ── */}
            <div
              style={{ padding: `${sizes.logoutPy}px ${sizes.sectionPx}px` }}
            >
              <div className="mx-1 mb-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
              {!isAdmin && (
                <button
                  onClick={() => {
                    toggleSidebar();
                    setFeedbackOpen(true);
                  }}
                  style={{
                    paddingTop: sizes.logoutPy,
                    paddingBottom: sizes.logoutPy,
                    fontSize: sizes.fontSize
                  }}
                  className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-50/80 font-medium text-violet-700 transition-all duration-300 ease-out active:scale-[0.97] active:bg-violet-100/80 dark:bg-violet-900/15 dark:text-violet-400 dark:active:bg-violet-900/30"
                >
                  <FaCommentDots className="text-base" />
                  <span>Góp ý</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                style={{
                  paddingTop: sizes.logoutPy,
                  paddingBottom: sizes.logoutPy,
                  fontSize: sizes.fontSize
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50/80 font-medium text-red-600 transition-all duration-300 ease-out active:scale-[0.97] active:bg-red-100/80 disabled:opacity-50 dark:bg-red-900/15 dark:text-red-400 dark:active:bg-red-900/30"
              >
                <IconLogOut className="text-base" />
                <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
              </button>
            </div>
          </div>
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
            {logoutButton}
          </div>
        </Sider>
      )}
      <FeedbackDrawer
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  );
}

export default Sidebar;
