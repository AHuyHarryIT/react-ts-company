import { IconDelete } from '@components/icons';
import { useStampNotification } from '@hooks/useStampNotification';
import { Link } from '@tanstack/react-router';
import { Button, Dropdown, List, MenuProps, Badge } from 'antd';
import { FaRegBell } from 'react-icons/fa';

type MenuItem = Required<MenuProps>['items'][number];

export default function NotificationDropdown() {
  const { items: stampItems, handleClearNotifications } =
    useStampNotification();

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
          {stampItems.length > 0 && (
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
              dataSource={stampItems}
              renderItem={(n, index) => (
                <List.Item key={`noti-${index}-${n.recordId ?? index}`}>
                  <Link
                    to="/stamps/history"
                    search={{ highlightId: n.recordId }}
                  >
                    <div>
                      <span className="text-theme-sm block font-medium text-gray-800 dark:text-gray-400">
                        Yêu cầu in tem
                      </span>
                      <span className="text-theme-xs mt-0.5 block text-gray-500 dark:text-gray-400">
                        Có yêu cầu in tem mới cho sản phẩm{' '}
                        <strong>{n.meta?.product?.name}</strong> từ nhân viên{' '}
                        <strong>{n.meta?.employee?.name}</strong>
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
