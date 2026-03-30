import { LinkProps } from '@tanstack/react-router';
import logo from '@assets/images/logo/logoAsset.svg';

import DashboardWidget from '@components/dashboard/DashboardWidget';
import { fetchDashboardData } from '@services/DashboardService';

import { SlideCarousel } from '@components/SlideCarousel';
import { useAuth } from '@hooks/useAuth';
import { getMonthlyQuantities } from '@services/TotalQuantityService';
import { authLogout } from '@services/AuthService';
import { fetchImages } from '@services/UploadService';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { isAdmin } from '@utils/authUtil';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { FaCircle } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { MdApproval } from 'react-icons/md';
import { SUPERVISOR_IDS } from '@/constants/supervisors';
import { ProductChart } from './ProductChart';
import { SalaryChart } from './SalaryChart';

// ─── FA class → react-icons mapper (shared with Sidebar) ─────────────────────

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
  const candidates: string[] = ['Fa' + toPascal(base)];
  const rules: Array<(s: string) => string | null> = [
    (s) => s.replace('trash-can', 'trash'),
    (s) => s.replace('user-group', 'users'),
    (s) => s.replace('arrows-rotate', 'sync'),
    (s) => s.replace('right-left', 'exchange-alt'),
    (s) => s.replace('circle-check', 'check-circle'),
    (s) => s.replace('circle-xmark', 'times-circle'),
    (s) => s.replace('circle-info', 'info-circle'),
    (s) => (s.includes('sheet-plastic') ? 'file-invoice' : s),
    (s) => s.replace('file-lines', 'file-alt'),
    (s) => s.replace('calendar-days', 'calendar-alt'),
    (s) => s.replace('arrow-rotate-right', 'redo'),
    (s) => s.replace('arrow-rotate-left', 'undo')
  ];
  rules.forEach((transform) => {
    const t = transform(base);
    if (t && t !== base) candidates.push('Fa' + toPascal(t));
  });
  if (/-alt$/.test(base))
    candidates.push('Fa' + toPascal(base.replace(/-alt$/, '')));
  if (/-o$/.test(base))
    candidates.push('Fa' + toPascal(base.replace(/-o$/, '')));
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

const renderIcon = (iconClass?: string | IconType): ReactNode => {
  if (!iconClass) return <FaCircle />;
  if (typeof iconClass !== 'string') {
    const IconComp = iconClass as IconType;
    return <IconComp />;
  }
  const Mapped = mapFaClassToIconType(iconClass);
  if (Mapped) return <Mapped />;
  return <i className={iconClass} />;
};

// Keys rendered as chart components, NOT widget cards
const CHART_KEYS = ['view_chart_salary', 'view_chart_product'];

// ─── Capitalize helper ───────────────────────────────────────────────────────

const capitalizeWords = (str: string) =>
  str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const admin = isAdmin(user?.role.name || '');

  const permissions = useMemo(() => user?.permissions ?? [], [user]);

  // Check if current user is a supervisor
  const isSupervisor = useMemo(() => {
    if (!user?.id) return false;
    return (SUPERVISOR_IDS as readonly string[]).includes(user.id.toString());
  }, [user?.id]);

  // ── Dashboard statistics (admin only) ──
  const { data: dashboardResponse } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
    enabled: admin,
    placeholderData: keepPreviousData
  });

  const dashboardData = dashboardResponse?.dashboardData;
  const salaryTableData = dashboardResponse?.salaryTableData ?? [];

  // ── Product chart data (admin only) ──
  const now = new Date();
  const monthParam = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

  const { data: productData } = useQuery({
    queryKey: ['productChartData', monthParam],
    queryFn: () =>
      getMonthlyQuantities({
        month: monthParam,
        status: 1,
        limit: 0,
        include: ['product']
      }),
    enabled: admin,
    placeholderData: keepPreviousData
  });

  // ── Value map: permission key → dashboard statistic value ──
  const valueMap: Record<string, string | undefined> = useMemo(() => {
    if (!dashboardData) return {};
    return {
      view_total_employees:
        dashboardData.totalEmployee?.toLocaleString() || '0',
      view_attendance_history:
        dashboardData.totalRecord?.toLocaleString() || '0',
      view_attendance_calculation:
        dashboardData.totalRecord?.toLocaleString() || '0',
      view_total_positions: dashboardData.totalRole?.toLocaleString() || '0',
      view_today_employees:
        dashboardData.totalCheckEmployee?.toLocaleString() || '0',
      view_total_schedule: dashboardData.totalCalender?.toLocaleString() || '0',
      view_total_products: dashboardData.totalProduct?.toLocaleString() || '0',
      view_total_salary: dashboardData.totalSalary?.toLocaleString() || '0',
      view_total_history: dashboardData.totalHistory?.toLocaleString() || '0',
      view_request_forms:
        dashboardData.totalRequestForms?.toLocaleString() || '0',
      view_po_list: `Tháng ${new Date().getMonth() + 1}`,
      view_labels_to_print: `Tháng ${new Date().getMonth() + 1}`,
      view_export_warehouse: `Tháng ${new Date().getMonth() + 1}`
    };
  }, [dashboardData]);

  // ── Build widget list from RBAC permissions (display_area = home or both) ──
  const homePermissions = useMemo(() => {
    return permissions
      .filter((p) => {
        const area = p.display_area?.toLowerCase();
        return area === 'home' || area === 'both';
      })
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
  }, [permissions]);

  type WidgetType = {
    title: string;
    icon: ReactNode;
    value?: string;
    navLink?: LinkProps['to'];
    onClick?: () => void;
  };

  const handleLogout = async () => {
    try {
      await authLogout();
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const listWidget: WidgetType[] = useMemo(() => {
    return homePermissions
      .filter((perm) => !CHART_KEYS.includes(perm.key))
      .map((perm) => {
        const widget: WidgetType = {
          title: capitalizeWords(perm.name),
          icon: renderIcon(perm.icon),
          value: valueMap[perm.key],
          navLink: (perm.url || undefined) as LinkProps['to'] | undefined
        };
        // Special: logout is an action, not navigation
        if (perm.key === 'logout') {
          widget.navLink = undefined;
          widget.onClick = handleLogout;
        }
        return widget;
      });
  }, [homePermissions, valueMap]);

  // Supervisor widget (hardcoded, no RBAC needed)
  const supervisorWidget: WidgetType | null = useMemo(() => {
    if (!isSupervisor) return null;
    return {
      title: 'Duyệt Đơn Xin Phép',
      icon: <MdApproval />,
      navLink: '/employee/request-forms'
    };
  }, [isSupervisor]);

  const finalWidgetList = useMemo(() => {
    const widgets = [...listWidget];
    if (supervisorWidget) widgets.unshift(supervisorWidget);
    return widgets;
  }, [listWidget, supervisorWidget]);

  // ── Chart visibility (from home permissions) ──
  const showSalaryChart = homePermissions.some(
    (p) => p.key === 'view_chart_salary'
  );
  const showProductChart = homePermissions.some(
    (p) => p.key === 'view_chart_product'
  );
  const chartColSpan =
    showSalaryChart && showProductChart ? 'xl:col-span-6' : 'xl:col-span-12';

  // ── Slide images ──
  const { data: imageList } = useQuery({
    queryKey: ['images'],
    queryFn: () => fetchImages({ limit: 0 }),
    placeholderData: keepPreviousData,
    // Images ít thay đổi, cache lâu hơn
    staleTime: 5 * 60 * 1000
  });

  // ── Dynamic Greeting ──
  const [greeting, setGreeting] = useState('');
  const [weather, setWeather] = useState<{ temp: string; desc: string } | null>(
    null
  );

  useEffect(() => {
    const morningGreetings = [
      'Chào buổi sáng ☀️',
      'Sáng nay tràn đầy năng lượng ☀️',
      'Một ngày mới bắt đầu rồi 🌅',
      'Chúc bạn ngày mới tốt lành ☀️',
      'Sáng nay thật đẹp trời ☀️'
    ];
    const afternoonGreetings = [
      'Chào buổi chiều 🌤️',
      'Buổi chiều vui vẻ nhé 🌤️',
      'Chiều nay làm việc hiệu quả nha 💪',
      'Cố lên, sắp hết giờ rồi 🌤️',
      'Buổi chiều năng động 🌤️'
    ];
    const eveningGreetings = [
      'Chào buổi tối 🌙',
      'Buổi tối thư giãn nhé 🌙',
      'Tối nay nghỉ ngơi sớm nha 🌙',
      'Một ngày dài đã qua 🌆',
      'Chúc buổi tối vui vẻ 🌙'
    ];
    const lateNightGreetings = [
      'Khuya rồi, nghỉ ngơi thôi 🌜',
      'Đêm khuya rồi, giữ sức khỏe nhé 🌜',
      'Làm việc muộn quá rồi 🌜',
      'Khuya lắm rồi, ngủ sớm nha 😴'
    ];

    const pickGreeting = () => {
      const h = new Date().getHours();
      let pool: string[];
      if (h >= 5 && h < 12) pool = morningGreetings;
      else if (h >= 12 && h < 18) pool = afternoonGreetings;
      else if (h >= 18 && h < 22) pool = eveningGreetings;
      else pool = lateNightGreetings;
      setGreeting(pool[Math.floor(Math.random() * pool.length)]);
    };

    pickGreeting();
    const timer = setInterval(pickGreeting, 60_000); // update every minute
    return () => clearInterval(timer);
  }, []);

  // Fetch weather (free, no API key)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://wttr.in/?format=%t|%C&lang=vi');
        const text = await res.text();
        const [temp, desc] = text.split('|').map((s) => s.trim());
        if (temp && desc) setWeather({ temp, desc });
      } catch {
        // silently ignore weather errors
      }
    };
    fetchWeather();
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Slide Carousel ─────────────────────────────────────── */}
      {imageList?.data && imageList.data.length > 0 && (
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <SlideCarousel images={imageList.data} />
        </div>
      )}

      {/* ── Welcome Header ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-5 py-4 dark:border-gray-700 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
        {/* Mobile logo */}
        <div className="mb-3 flex justify-center sm:hidden">
          <img src={logo} alt="Logo" className="h-20" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {greeting || 'Xin chào'}
            </p>
            <h1 className="text-xl font-bold text-gray-800 sm:text-2xl dark:text-white">
              {user?.name?.replace(/[()]/g, '').split(' ').pop() || 'Bạn'} 👋
            </h1>
          </div>
          <div className="mt-2 flex items-center gap-2 sm:mt-0">
            {weather && (
              <span className="rounded-lg border border-gray-200 bg-white/80 px-3 py-1.5 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-300">
                🌡️ {weather.temp} · {weather.desc}
              </span>
            )}
            <span className="rounded-lg border border-gray-200 bg-white/80 px-3 py-1.5 text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-800/80">
              📅{' '}
              {new Date().toLocaleDateString('vi-VN', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Widget Grid ────────────────────────────────────────── */}
      {finalWidgetList.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {finalWidgetList.map((widget, index) => (
            <DashboardWidget
              key={`dashboard-widget-${index}`}
              title={widget.title}
              icon={widget.icon}
              value={widget.value}
              navLink={widget.navLink as LinkProps['to']}
              onClick={widget.onClick}
            />
          ))}
        </div>
      )}

      {/* ── Charts ─────────────────────────────────────────────── */}
      {(showSalaryChart || showProductChart) && (
        <div className="grid grid-cols-12 items-stretch gap-5">
          {showSalaryChart && (
            <div
              className={`col-span-12 ${chartColSpan} [&>div]:h-full [&>div>div.ant-card]:h-full [&>div>div.ant-card>.ant-card-body]:flex [&>div>div.ant-card>.ant-card-body]:flex-col`}
            >
              <SalaryChart data={salaryTableData} />
            </div>
          )}
          {showProductChart && (
            <div
              className={`col-span-12 ${chartColSpan} [&>div]:h-full [&>div>div.ant-card]:h-full [&>div>div.ant-card>.ant-card-body]:flex [&>div>div.ant-card>.ant-card-body]:flex-col`}
            >
              <ProductChart data={productData || []} />
            </div>
          )}
        </div>
      )}

      {/* ── Empty State ────────────────────────────────────────── */}
      {finalWidgetList.length === 0 &&
        !showSalaryChart &&
        !showProductChart && (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <div className="text-gray-400 dark:text-gray-500">
              <svg
                className="mx-auto mb-4 h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Chào mừng bạn đến Dashboard
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Hệ thống đang chuẩn bị quyền truy cập cho tài khoản của bạn.
            </p>
          </div>
        )}
    </div>
  );
}
