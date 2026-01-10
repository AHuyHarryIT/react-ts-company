import { IconDelete } from '@components/icons';
import { useStampNotification } from '@hooks/useStampNotification';
import { Link } from '@tanstack/react-router';
import { Button, Dropdown, List, MenuProps, Badge } from 'antd';
import { FaRegBell } from 'react-icons/fa';
import { useMemo } from 'react';

type MenuItem = Required<MenuProps>['items'][number];

// Helper function to convert stamp numbers to range format
function formatStampRanges(stamps: number[]): string {
  if (stamps.length === 0) return '';

  const sorted = [...stamps].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(', ');
}

// Helper function to parse binStart (can be comma-separated or single number)
function parseStampNumbers(
  binStart: string | number,
  binCount: number
): number[] {
  const binStartStr = String(binStart);

  if (binStartStr.includes(',')) {
    // Parse comma-separated values
    return binStartStr
      .split(',')
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n));
  } else {
    // Generate range from binStart to binStart + binCount - 1
    const start = parseInt(binStartStr);
    return Array.from({ length: binCount }, (_, i) => start + i);
  }
}

type GroupedNotification = {
  employee_id: string;
  employee_name: string;
  product_id: string;
  product_name: string;
  date: string;
  shift: number;
  stampRanges: string;
  recordIds: string[];
  latestTime: string;
};

export default function NotificationDropdown() {
  const { items: stampItems, handleClearNotifications } =
    useStampNotification();

  // Group notifications by employee + product + date + shift
  const groupedNotifications = useMemo(() => {
    const groups = new Map<string, GroupedNotification>();

    stampItems.forEach((item) => {
      if (!item.meta) return;

      const key = `${item.meta.employee_id}-${item.meta.product_id}-${item.meta.date}-${item.meta.shift}`;

      const stamps = parseStampNumbers(item.meta.binStart, item.meta.binCount);

      if (groups.has(key)) {
        const group = groups.get(key)!;

        // Parse existing ranges back to numbers
        const allStamps: number[] = [];
        group.stampRanges.split(',').forEach((range) => {
          const trimmed = range.trim();
          if (trimmed.includes('-')) {
            const [start, end] = trimmed.split('-').map((n) => parseInt(n));
            for (let i = start; i <= end; i++) {
              allStamps.push(i);
            }
          } else {
            allStamps.push(parseInt(trimmed));
          }
        });

        // Merge stamps and format
        const mergedStamps = [...new Set([...allStamps, ...stamps])];
        group.stampRanges = formatStampRanges(mergedStamps);
        group.recordIds.push(item.recordId);

        // Update latest time
        if (item.sent_at && item.sent_at > group.latestTime) {
          group.latestTime = item.sent_at;
        }
      } else {
        groups.set(key, {
          employee_id: item.meta.employee_id,
          employee_name: item.meta.employee?.name || 'Unknown',
          product_id: item.meta.product_id,
          product_name: item.meta.product?.name || 'Unknown',
          date: String(item.meta.date),
          shift: item.meta.shift,
          stampRanges: formatStampRanges(stamps),
          recordIds: [item.recordId],
          latestTime: item.sent_at || new Date().toISOString()
        });
      }
    });

    // Sort by latest time descending
    return Array.from(groups.values()).sort(
      (a, b) =>
        new Date(b.latestTime).getTime() - new Date(a.latestTime).getTime()
    );
  }, [stampItems]);

  const items: MenuItem[] = [
    {
      type: 'item',
      key: 'user',
      label: (
        <div className="block font-medium text-gray-800 dark:text-gray-400">
          Thông báo
        </div>
      ),
      disabled: true,
      style: { cursor: 'default' }
    },
    {
      type: 'divider'
    },
    {
      type: 'item' as const,
      key: `stamp-notification`,
      label: (
        <>
          {groupedNotifications.length > 0 && (
            <Button
              icon={<IconDelete size={16} />}
              variant="solid"
              color="danger"
              className="mb-2"
              onClick={handleClearNotifications}
            >
              Xóa tất cả
            </Button>
          )}
          <div className="max-h-96 max-w-xs overflow-y-auto">
            <List
              dataSource={groupedNotifications}
              renderItem={(n, index) => (
                <List.Item key={`noti-group-${index}`}>
                  <Link
                    to="/stamps/history"
                    search={{ highlightId: n.recordIds[0] }}
                  >
                    <div>
                      <span className="text-theme-sm block font-medium text-gray-800 dark:text-gray-400">
                        Yêu cầu in tem
                      </span>
                      <span className="text-theme-xs mt-0.5 block text-gray-500 dark:text-gray-400">
                        <strong>{n.employee_name}</strong> gửi yêu cầu sản phẩm{' '}
                        <strong>{n.product_name}</strong> (Ca {n.shift}) - Tem
                        số: <strong>{n.stampRanges}</strong>
                      </span>
                    </div>
                  </Link>
                </List.Item>
              )}
            />
          </div>
        </>
      )
    }
  ];

  return (
    <div>
      <Dropdown
        menu={{
          items
        }}
        trigger={['click']}
        arrow
      >
        <Badge count={stampItems.length} size="small" offset={[-2, 2]}>
          <button className="hover:text-dark-900 relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
            <FaRegBell className="text-xl" />
          </button>
        </Badge>
      </Dropdown>
    </div>
  );
}
