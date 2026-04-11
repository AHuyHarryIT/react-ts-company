import { MenuItem } from '@/types/menuItem';
import logo from '@assets/images/logo/logoAsset.svg';
import { toggleSidebar, uiStore } from '@stores/uiStore';
import { Link, useLocation } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarMenuProps {
  items: MenuItem[];
  headerSlot?: React.ReactNode;
}

// ── Extract the actual link path from a MenuItem ──
function extractPath(item: MenuItem): string | undefined {
  if (!item || typeof item !== 'object') return undefined;
  // 1. Check key
  const key = 'key' in item ? String(item.key) : undefined;
  if (key && key.startsWith('/')) return key;
  // 2. Check label for <Link to="...">
  if ('label' in item && React.isValidElement(item.label)) {
    const props = item.label.props as { to?: string };
    if (props.to && typeof props.to === 'string') return props.to;
  }
  return undefined;
}

// ── Extract label text from a MenuItem ──
function extractLabel(item: MenuItem): React.ReactNode {
  if (!item || typeof item !== 'object') return null;
  if ('label' in item) {
    const label = item.label;
    // If label is a Link element, extract its text
    if (React.isValidElement(label)) {
      const children = (
        label as React.ReactElement<{ children?: React.ReactNode }>
      ).props.children;
      if (React.isValidElement(children)) {
        return (children as React.ReactElement<{ children?: React.ReactNode }>)
          .props.children;
      }
      return children;
    }
    return label;
  }
  return null;
}

// ── Extract icon from a MenuItem ──
function extractIcon(item: MenuItem): React.ReactNode {
  if (!item || typeof item !== 'object') return null;
  if ('icon' in item) return item.icon as React.ReactNode;
  return null;
}

// ── Single Menu Item ──
function SidebarItem({
  item,
  isActive,
  isCollapsed,
  onClick
}: {
  item: MenuItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}) {
  const path = extractPath(item);
  const label = extractLabel(item);
  const icon = extractIcon(item);

  const content = (
    <motion.div
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`group mx-2.5 my-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ease-out ${
        isActive
          ? 'bg-blue-50/60 font-semibold text-black dark:bg-blue-900/20 dark:text-white'
          : 'font-medium text-black hover:bg-gray-50 hover:text-black active:scale-[0.98] dark:text-gray-200 dark:hover:bg-white/5 dark:hover:text-white'
      }`}
    >
      {icon && (
        <motion.span
          whileHover={{ rotate: isActive ? 0 : [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.4 }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xl transition-colors duration-200 ${
            isActive
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-gray-200'
          } ${isCollapsed ? '!mx-auto !h-9 !w-9' : ''}`}
        >
          {icon}
        </motion.span>
      )}
      {!isCollapsed && (
        <span className="truncate text-[13.5px] capitalize">{label}</span>
      )}
    </motion.div>
  );

  if (path) {
    return (
      <Link to={path} onClick={onClick} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
}

// ── Submenu Item (with children) ──
function SidebarSubmenu({
  item,
  pathname,
  isCollapsed,
  isOpen,
  isMobile,
  onToggle,
  onClick
}: {
  item: MenuItem & { children?: MenuItem[] };
  pathname: string;
  isCollapsed: boolean;
  isOpen: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onClick?: () => void;
}) {
  const label = extractLabel(item);
  const icon = extractIcon(item);
  const children = ('children' in item ? item.children : []) as MenuItem[];
  const hoverTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Check if any child is active
  const hasActiveChild = children.some((child) => {
    const childPath = extractPath(child);
    return childPath && pathname.startsWith(childPath);
  });

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (!isOpen) {
      hoverTimerRef.current = setTimeout(() => {
        onToggle();
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (isOpen) {
      hoverTimerRef.current = setTimeout(() => {
        onToggle();
      }, 200);
    }
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Parent button */}
      <motion.button
        whileHover={isMobile ? {} : { scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        className={`group mx-2.5 my-0.5 flex w-[calc(100%-20px)] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ease-out ${
          hasActiveChild
            ? 'bg-blue-50/40 font-semibold text-black dark:bg-blue-900/15 dark:text-white'
            : 'font-medium text-black hover:bg-gray-50 hover:text-black active:scale-[0.98] dark:text-gray-200 dark:hover:bg-white/5 dark:hover:text-white'
        }`}
      >
        {icon && (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xl transition-colors duration-200 ${
              hasActiveChild
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-gray-200'
            } ${isCollapsed ? '!mx-auto !h-9 !w-9' : ''}`}
          >
            {icon}
          </span>
        )}
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate text-[13.5px] capitalize">
              {label}
            </span>
            <FaChevronDown
              className={`text-[9px] text-gray-400 transition-transform duration-300 ease-out dark:text-gray-600 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </motion.button>

      {/* Children */}
      <AnimatePresence initial={false}>
        {!isCollapsed && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="ml-5 border-l border-gray-100 py-1 dark:border-gray-700/50">
              {children.map((child) => {
                const childPath = extractPath(child);
                const childLabel = extractLabel(child);
                const childIcon = extractIcon(child);
                const isChildActive = childPath
                  ? pathname.startsWith(childPath)
                  : false;

                return (
                  <Link
                    key={String(
                      child && typeof child === 'object' && 'key' in child
                        ? child.key
                        : Math.random()
                    )}
                    to={(childPath || '/') as string}
                    onClick={onClick}
                    className="block no-underline"
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`mx-2 my-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all duration-200 ease-out ${
                        isChildActive
                          ? 'bg-blue-50/50 font-semibold text-black dark:bg-blue-900/15 dark:text-white'
                          : 'font-medium text-black hover:bg-gray-50 hover:text-black active:scale-[0.98] dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'
                      }`}
                    >
                      {childIcon && (
                        <span className="text-[13px]">{childIcon}</span>
                      )}
                      <span className="truncate text-[12.5px] capitalize">
                        {childLabel}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main SidebarMenu Component ──
export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  items,
  headerSlot
}) => {
  const { pathname } = useLocation();
  const { isMobile, isSidebarClose } = useStore(uiStore);

  const [openKey, setOpenKey] = React.useState<string | null>(null);

  const handleToggle = (key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  const handleClick = () => {
    setOpenKey(null);
    if (isMobile) toggleSidebar();
  };

  return (
    <>
      {/* ── Logo ───────────────────────────────────────── */}
      <div>
        <div
          className={`flex items-center justify-center ${isSidebarClose ? 'p-3' : 'px-5 py-6'}`}
        >
          <Link
            to="/"
            onClick={() => {
              if (isMobile) toggleSidebar();
            }}
          >
            <motion.img
              src={logo}
              alt="Logo"
              initial={{ scale: 0.8, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, rotate: [-2, 2, -2, 0] }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`drop-shadow-sm transition-all duration-300 ${isSidebarClose ? 'h-[52px]' : 'h-[88px]'}`}
            />
          </Link>
        </div>
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent dark:via-gray-700/60" />
      </div>

      {/* ── Header Slot (profile card on mobile) ── */}
      {headerSlot}
      {headerSlot && (
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200/80 to-transparent dark:via-gray-700/60" />
      )}

      {/* ── Menu Items ─────────────────────────────────── */}
      <nav className="py-3">
        {items.map((item) => {
          if (!item || typeof item !== 'object') return null;

          const key = 'key' in item ? String(item.key) : '';
          const hasChildren =
            'children' in item &&
            Array.isArray(item.children) &&
            item.children.length > 0;

          if (hasChildren) {
            return (
              <SidebarSubmenu
                key={key}
                item={item as MenuItem & { children?: MenuItem[] }}
                pathname={pathname}
                isCollapsed={isSidebarClose}
                isOpen={openKey === key}
                isMobile={isMobile}
                onToggle={() => handleToggle(key)}
                onClick={handleClick}
              />
            );
          }

          const path = extractPath(item);
          const isActive = path ? pathname === path : false;

          return (
            <SidebarItem
              key={key}
              item={item}
              isActive={isActive}
              isCollapsed={isSidebarClose}
              onClick={handleClick}
            />
          );
        })}
      </nav>
    </>
  );
};
