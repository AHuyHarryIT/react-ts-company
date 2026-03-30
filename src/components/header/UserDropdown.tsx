import { Link, useNavigate } from '@tanstack/react-router';
import { Avatar, message } from 'antd';
import { useRef, useState, useEffect } from 'react';

import { authLogout } from '@services/AuthService';
import { authStore } from '@stores/authStore';

import { IconLogOut } from '@components/icons';
import { useStore } from '@tanstack/react-store';
import { FaUser, FaUserCircle, FaFileAlt } from 'react-icons/fa';

export default function UserDropdown() {
  const navigate = useNavigate();
  const { user } = useStore(authStore);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
      message.error({ content: 'Đã đăng xuất', key: 'logout', duration: 1 });
      navigate({ to: '/login', replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const roleName = user?.role?.name?.toLowerCase() || '';
  const isAdminRole = ['super admin', 'admin', 'co admin'].includes(roleName);
  const firstName = (user?.name?.split(' ').pop() || 'User').replace(
    /[()]/g,
    ''
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="cursor-pointer rounded-full ring-2 ring-transparent transition-all duration-300 hover:shadow-md hover:ring-blue-200 active:scale-95 dark:hover:ring-blue-700"
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar src={user?.image_url} size={40} icon={<FaUser />} />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          style={{ animation: 'slideDown 0.2s ease-out' }}
        >
          {/* ── User Info ── */}
          <div className="flex items-center gap-2.5 px-4 py-3">
            <Avatar src={user?.image_url} size={32} icon={<FaUser />} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800 dark:text-white">
                {firstName}
              </p>
              <p className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                {user?.role?.name || 'Nhân viên'}
              </p>
            </div>
          </div>

          <div className="mx-3 h-px bg-gray-100 dark:bg-gray-700" />

          {/* ── Menu ── */}
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
            >
              <FaUserCircle className="text-sm text-gray-400" />
              <span>Hồ sơ</span>
            </Link>

            {!isAdminRole && (
              <Link
                to="/employee/request-forms"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
              >
                <FaFileAlt className="text-sm text-gray-400" />
                <span>Đơn yêu cầu</span>
              </Link>
            )}
          </div>

          <div className="mx-3 h-px bg-gray-100 dark:bg-gray-700" />

          {/* ── Logout ── */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
            >
              <IconLogOut className="text-sm text-gray-400" />
              <span>{isLoggingOut ? 'Đang xuất...' : 'Đăng xuất'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Animation Keyframes ── */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
