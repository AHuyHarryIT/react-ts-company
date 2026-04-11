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
import { motion } from 'framer-motion';

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
  const { data: dashboardResponse, isLoading: isDashboardLoading } = useQuery({
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
      storage_export_product: `Tháng ${new Date().getMonth() + 1}`,
      feed_back: dashboardData.totalFeedback?.toLocaleString() || '0'
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
    isLoading?: boolean;
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
    const EXPECTED_ASYNC_KEYS = [
      'view_total_employees',
      'view_attendance_history',
      'view_attendance_calculation',
      'view_total_positions',
      'view_today_employees',
      'view_total_schedule',
      'view_total_products',
      'view_total_salary',
      'view_total_history',
      'view_request_forms',
      'feed_back',
      'view_po_list',
      'view_labels_to_print',
      'storage_export_product'
    ];

    return homePermissions
      .filter((perm) => !CHART_KEYS.includes(perm.key))
      .map((perm) => {
        const widget: WidgetType = {
          title: capitalizeWords(perm.name),
          icon: renderIcon(perm.icon ?? undefined),
          value: valueMap[perm.key],
          navLink: (perm.url || undefined) as LinkProps['to'] | undefined,
          isLoading:
            admin &&
            isDashboardLoading &&
            !dashboardResponse &&
            EXPECTED_ASYNC_KEYS.includes(perm.key)
        };
        // Special: logout is an action, not navigation
        if (perm.key === 'logout') {
          widget.navLink = undefined;
          widget.onClick = handleLogout;
        }
        return widget;
      });
  }, [homePermissions, valueMap, isDashboardLoading, admin, dashboardResponse]);

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

  // Tính số cột desktop động: chẵn → 2 hàng, lẻ → 3 hàng
  const xlCols = useMemo(() => {
    const count = finalWidgetList.length;
    if (count <= 1) return 1;
    if (count % 2 === 0) return Math.ceil(count / 2);
    return Math.ceil(count / 3);
  }, [finalWidgetList.length]);

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
  const [greeting, setGreeting] = useState<{ text: string; emoji: string }>({
    text: '',
    emoji: '👋'
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock - ticks every second
  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Weather state (declared before greeting effect which depends on it)
  const [weather, setWeather] = useState<{
    temp: string;
    desc: string;
    code: number;
  } | null>(null);

  useEffect(() => {
    const pickGreeting = () => {
      const h = new Date().getHours();
      const wCode = weather?.code;

      // Weather-aware greetings
      const isSunny = wCode !== undefined && wCode <= 1;
      const isCloudy = wCode !== undefined && (wCode === 2 || wCode === 3);
      const isRainy =
        wCode !== undefined &&
        ((wCode >= 51 && wCode <= 65) || (wCode >= 80 && wCode <= 82));
      const isStormy = wCode !== undefined && wCode >= 95;
      const isFoggy = wCode !== undefined && (wCode === 45 || wCode === 48);

      let pool: { text: string; emoji: string }[];

      if (h >= 5 && h < 12) {
        // Morning
        if (isRainy)
          pool = [
            { text: 'Mưa rồi, tập trung làm việc thôi nào', emoji: '🌧️' },
            { text: 'Trời mưa mát mẻ, năng suất hơn nè', emoji: '☔' },
            { text: 'Mưa ngoài kia, bên trong mình cày thôi', emoji: '🌧️' }
          ];
        else if (isStormy)
          pool = [
            { text: 'Giông bão ngoài kia, bên trong vẫn ổn', emoji: '⛈️' },
            { text: 'Trời giông nhưng tinh thần vẫn cao nha', emoji: '⛈️' }
          ];
        else if (isFoggy)
          pool = [
            { text: 'Sương mù nhưng mục tiêu vẫn rõ ràng', emoji: '🌫️' },
            { text: 'Trời mờ nhưng kế hoạch phải sáng', emoji: '🌫️' }
          ];
        else if (isSunny)
          pool = [
            {
              text: 'Trời đẹp, bắt đầu ngày làm việc hiệu quả nào',
              emoji: '☀️'
            },
            {
              text: 'Nắng đẹp, năng lượng đầy, cùng làm việc thôi',
              emoji: '🌤️'
            },
            {
              text: 'Ngày mới tươi sáng, chúc bạn một ngày tốt lành',
              emoji: '☀️'
            }
          ];
        else if (isCloudy)
          pool = [
            { text: 'Trời mát dễ chịu, làm việc năng suất nha', emoji: '⛅' },
            { text: 'Thời tiết lý tưởng để tập trung công việc', emoji: '☁️' }
          ];
        else
          pool = [
            { text: 'Bắt đầu ngày mới đầy năng lượng', emoji: '🌅' },
            { text: 'Sẵn sàng cho một ngày làm việc hiệu quả', emoji: '☀️' },
            { text: 'Chúc bạn một ngày suôn sẻ', emoji: '🌿' },
            { text: 'Ngày mới, cơ hội mới', emoji: '✨' }
          ];
      } else if (h >= 12 && h < 18) {
        // Afternoon
        if (isRainy)
          pool = [
            {
              text: 'Mưa chiều, ngồi trong làm việc hiệu quả luôn',
              emoji: '🌧️'
            },
            { text: 'Chiều mưa mát, hoàn thành nốt công việc nha', emoji: '☔' }
          ];
        else if (isStormy)
          pool = [
            {
              text: 'Trời giông, an toàn trong nhà và hoàn thành việc thôi',
              emoji: '⛈️'
            }
          ];
        else if (isSunny)
          pool = [
            { text: 'Nắng chiều ấm, cố gắng chút nữa nha', emoji: '🌤️' },
            { text: 'Còn vài tiếng nữa, hoàn thành nốt nhé', emoji: '☀️' }
          ];
        else if (isCloudy)
          pool = [
            { text: 'Trời mát, tập trung nốt công việc còn lại', emoji: '⛅' },
            { text: 'Chiều mát mẻ, hoàn thành nốt task nha', emoji: '☁️' }
          ];
        else
          pool = [
            { text: 'Cố lên, sắp xong rồi', emoji: '☀️' },
            { text: 'Buổi chiều năng suất nào', emoji: '🌤️' },
            { text: 'Chúc buổi chiều vui vẻ', emoji: '🌿' },
            { text: 'Bạn đang làm rất tốt rồi', emoji: '✨' }
          ];
      } else if (h >= 18 && h < 22) {
        // Evening
        if (isRainy)
          pool = [
            { text: 'Mưa tối rồi, nghỉ ngơi sau ngày dài nha', emoji: '🌧️' }
          ];
        else
          pool = [
            { text: 'Hết giờ rồi, nghỉ ngơi xứng đáng nha', emoji: '🌙' },
            { text: 'Một ngày làm việc hiệu quả, tuyệt vời', emoji: '🌟' },
            { text: 'Thư giãn sau ngày dài làm việc', emoji: '☕' },
            { text: 'Nghỉ ngơi để mai lại tiếp tục nha', emoji: '🌆' }
          ];
      } else {
        pool = [
          { text: 'Khuya rồi, nghỉ ngơi giữ sức nha', emoji: '🌙' },
          { text: 'Ngủ sớm để mai làm việc hiệu quả', emoji: '🌙' },
          { text: 'Sức khỏe là số 1, nghỉ thôi nào', emoji: '🌜' },
          { text: 'Đừng thức khuya quá, giữ gìn sức khỏe', emoji: '🌙' }
        ];
      }

      const pick = pool[Math.floor(Math.random() * pool.length)];
      setGreeting(pick);
    };

    pickGreeting();
    const timer = setInterval(pickGreeting, 60_000);
    return () => clearInterval(timer);
  }, [weather]);

  // Fetch weather using Open-Meteo (free, no API key, accurate)
  // Uses fixed coordinates (Biên Hòa / HCM) — no geolocation prompt needed
  useEffect(() => {
    // WMO weather code → Vietnamese description
    const weatherDesc: Record<number, string> = {
      0: 'Trời quang',
      1: 'Gần như quang',
      2: 'Có mây rải rác',
      3: 'Nhiều mây',
      45: 'Sương mù',
      48: 'Sương mù đóng băng',
      51: 'Mưa phùn nhẹ',
      53: 'Mưa phùn',
      55: 'Mưa phùn dày',
      61: 'Mưa nhẹ',
      63: 'Mưa vừa',
      65: 'Mưa to',
      71: 'Tuyết nhẹ',
      73: 'Tuyết vừa',
      75: 'Tuyết dày',
      80: 'Mưa rào nhẹ',
      81: 'Mưa rào',
      82: 'Mưa rào to',
      95: 'Giông bão',
      96: 'Giông kèm mưa đá',
      99: 'Giông mưa đá lớn'
    };

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const data = await res.json();
        if (data?.current_weather) {
          const { temperature, weathercode } = data.current_weather;
          setWeather({
            temp: `${Math.round(temperature)}°C`,
            desc: weatherDesc[weathercode] || 'N/A',
            code: weathercode
          });
        }
      } catch {
        // silently ignore
      }
    };

    // Fixed: Biên Hòa / Ho Chi Minh City area — no location sharing required
    fetchWeather(10.82, 106.63);
  }, []);

  // Current date formatted
  const currentDate = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Live clock formatted
  const clockDisplay = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // Weather-based emoji (fallback to time-based if weather not loaded)
  const weatherEmoji = useMemo(() => {
    if (weather) {
      const c = weather.code;
      if (c === 0) return '☀️';
      if (c === 1) return '🌤️';
      if (c === 2) return '⛅';
      if (c === 3) return '☁️';
      if (c === 45 || c === 48) return '🌫️';
      if (c >= 51 && c <= 55) return '🌦️';
      if (c >= 61 && c <= 65) return '🌧️';
      if (c >= 71 && c <= 75) return '❄️';
      if (c >= 80 && c <= 82) return '🌧️';
      if (c >= 95) return '⛈️';
      return '🌤️';
    }
    // Fallback: time-based
    const h = currentTime.getHours();
    if (h >= 5 && h < 8) return '🌅';
    if (h >= 8 && h < 17) return '☀️';
    if (h >= 17 && h < 19) return '🌆';
    if (h >= 19 && h < 22) return '🌙';
    return '🌜';
  }, [weather, currentTime]);

  return (
    <div className="space-y-6">
      {/* ── Slide Carousel ─────────────────────────────────────── */}
      {imageList?.data && imageList.data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="overflow-hidden rounded-2xl shadow-sm transition-shadow duration-300 dark:shadow-none"
        >
          <SlideCarousel images={imageList.data} />
        </motion.div>
      )}

      {/* ── Welcome Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-300 lg:hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-blue-50/50 blur-3xl dark:bg-blue-900/10" />
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-50/50 blur-3xl dark:bg-purple-900/10" />
        <div className="relative z-10">
          {/* Mobile logo */}
          <div className="mb-3 flex justify-center sm:hidden">
            <img src={logo} alt="Logo" className="h-20" />
          </div>

          {/* Main header row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Greeting */}
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-black/60 dark:text-gray-500">
                Xin chào
              </p>
              <h1 className="mt-0.5 text-2xl font-bold text-black sm:text-3xl dark:text-white">
                {user?.name?.replace(/[()]/g, '').split(' ').pop() || 'Bạn'}{' '}
                <span className="inline-block">{greeting.emoji}</span>
              </h1>
              {greeting.text && (
                <p className="mt-1 text-sm font-semibold text-black/50 dark:text-gray-500">
                  {greeting.text}
                </p>
              )}
            </div>

            {/* Right: Live clock + info */}
            <div className="flex flex-col items-center sm:items-end">
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold tracking-wide text-black tabular-nums sm:text-3xl dark:text-white">
                  {clockDisplay}
                </span>
                <span className="text-2xl sm:text-3xl">{weatherEmoji}</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-black/50 dark:text-gray-500">
                {currentDate}
                {weather && ` · ${weather.temp} · ${weather.desc}`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Widget Grid ────────────────────────────────────────── */}
      {finalWidgetList.length > 0 && (
        <div>
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-4 flex items-center gap-2"
          >
            <div className="h-4 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <h2 className="text-xs font-bold tracking-wide text-black/60 uppercase dark:text-gray-500">
              Truy cập nhanh
            </h2>
            <span className="text-xs font-semibold text-black/40 dark:text-gray-600">
              ({finalWidgetList.length})
            </span>
          </motion.div>

          <div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
            style={{ '--xl-cols': xlCols } as React.CSSProperties}
            // xl breakpoint: dynamic columns
            // Tailwind can't do dynamic values, so we use a CSS custom property + arbitrary value
          >
            <style>{`@media (min-width: 1280px) { [style*="--xl-cols"] { grid-template-columns: repeat(var(--xl-cols), minmax(0, 1fr)) !important; } }`}</style>
            {finalWidgetList.map((widget, index) => (
              <div key={`dashboard-widget-${index}`}>
                <DashboardWidget
                  title={widget.title}
                  icon={widget.icon}
                  value={widget.value}
                  navLink={widget.navLink as LinkProps['to']}
                  onClick={widget.onClick}
                  index={index}
                  isLoading={widget.isLoading}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Charts ─────────────────────────────────────────────── */}
      {(showSalaryChart || showProductChart) && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
        >
          {/* Section label */}
          <div className="mb-4 flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <h2 className="text-xs font-bold tracking-wide text-black/60 uppercase dark:text-gray-500">
              Biểu đồ thống kê
            </h2>
          </div>

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
        </motion.div>
      )}

      {/* ── Empty State ────────────────────────────────────────── */}
      {finalWidgetList.length === 0 &&
        !showSalaryChart &&
        !showProductChart && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-gray-100 bg-white p-16 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-700">
              <svg
                className="h-8 w-8 text-gray-300 dark:text-gray-500"
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
            <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-white">
              Chào mừng bạn đến Dashboard
            </h3>
            <p className="mx-auto max-w-sm text-sm text-gray-400 dark:text-gray-500">
              Hệ thống đang chuẩn bị quyền truy cập cho tài khoản của bạn.
            </p>
          </motion.div>
        )}
    </div>
  );
}
