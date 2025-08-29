import { Outlet } from '@tanstack/react-router';
import { ConfigProvider, Layout, theme as antTheme, message } from 'antd';
import { useEffect } from 'react';

import BirthdayModal from '@components/BirthdayModal';
import CleaningDutyModal from '@components/CleaningDuty/CleaningDutyModal';
import MarqueeAlert from '@components/MarqueeText';
import { NotificationRequestModal } from '@components/common/NotificationRequestModal';
import { useBirthdayNotification } from '@hooks/useBirthdayNotification';
import { useCleaningDutyNotification } from '@hooks/useCleaningDutyNotification';
import { useNotificationRequest } from '@hooks/useAdminNotificationRequest';
import AppFooter from '@partials/Footer';
import Header from '@partials/Header';
import Sidebar from '@partials/Sidebar';
import { fetchNotifications } from '@services/NotificationService';
import { updateScreenSize } from '@stores/uiStore';
import { useQuery } from '@tanstack/react-query';
import { Route } from '@routes/__root';

const { Content } = Layout;

function AppLayout() {
  useEffect(() => {
    window.addEventListener('resize', updateScreenSize);
    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  const {
    token: { colorBgContainer, borderRadiusLG }
  } = antTheme.useToken();

  // Get authenticated user context
  const { authenticated } = Route.useRouteContext();
  const { user } = authenticated;

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => {
      return fetchNotifications({ 'filter[is_show]': 1 });
    }
  });

  // Use cleaning duty notification hook
  const {
    modalOpen,
    currentDuties: currentDuty,
    handleClose,
    handleDontShowAgain
  } = useCleaningDutyNotification();

  // Use birthday notification hook
  const {
    shouldShow: showBirthdayModal,
    todayBirthdays,
    markAsShown: markBirthdayAsShown
  } = useBirthdayNotification();

  // Use admin notification request hook
  const {
    shouldShowModal: showNotificationModal,
    hideModal: hideNotificationModal,
    requestPermission,
    isLoading: notificationLoading
  } = useNotificationRequest(user, true);

  const handleAllowNotifications = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      message.success('Đã bật thông báo thành công!');
    } else if (result === 'denied') {
      message.warning('Quyền thông báo đã bị từ chối');
    }
  };

  const messages =
    notifications?.data.map((notification) => notification.message) || [];
  return (
    <>
      <ConfigProvider>
        <Layout
          style={{
            minHeight: '100vh',
            background: colorBgContainer,
            borderRadius: borderRadiusLG
          }}
          hasSider
        >
          <Sidebar />
          <Layout>
            <Header />
            <Content
              style={{ overflow: 'initial' }}
              className="p-4 dark:bg-gray-900"
            >
              {messages.length > 0 && (
                <div className="mb-4">
                  <MarqueeAlert messages={messages} />
                </div>
              )}
              <Outlet />
            </Content>
            <AppFooter />
          </Layout>
        </Layout>
      </ConfigProvider>

      {/* Cleaning Duty Modal */}
      {(currentDuty ?? []).length > 0 && (
        <CleaningDutyModal
          open={modalOpen}
          onClose={handleClose}
          duties={currentDuty ?? []}
          onDontShowAgain={handleDontShowAgain}
        />
      )}

      {/* Birthday Modal - Show when there are birthdays today and hasn't been shown yet */}
      {showBirthdayModal && todayBirthdays.length > 0 && (
        <BirthdayModal
          open={showBirthdayModal}
          employees={todayBirthdays.map((employee) => employee.name)}
          companyName="Công Ty Vinh Vinh Phát"
          onClose={markBirthdayAsShown}
          autoCloseMs={10000} // 10 seconds auto close
        />
      )}

      {/* Admin Notification Request Modal */}
      {showNotificationModal && (
        <NotificationRequestModal
          open={showNotificationModal}
          onAllow={handleAllowNotifications}
          onDeny={hideNotificationModal}
          loading={notificationLoading}
        />
      )}
    </>
  );
}

export default AppLayout;
