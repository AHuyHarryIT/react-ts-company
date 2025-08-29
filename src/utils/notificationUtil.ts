export const handleNotification = () => {
  // Kiểm tra quyền hiện tại trước khi yêu cầu
  if (Notification.permission === 'granted') {
    new Notification('Thông báo', {
      body: 'Bạn có một thông báo mới!',
      data: { type: 'stamp' },
      icon: '/logo.svg'
    });
  } else if (Notification.permission === 'default') {
    // Chỉ yêu cầu quyền nếu chưa được hỏi trước đó
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification('Thông báo', {
          body: 'Bạn có một thông báo mới!',
          data: { type: 'stamp' },
          icon: '/logo.svg'
        });
      }
    });
  }
  // Nếu permission === 'denied', không làm gì cả
};

// Utility function để gửi thông báo với nội dung tùy chỉnh
export const sendNotification = (
  title: string,
  options?: NotificationOptions
) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/logo.svg',
      ...options
    });
  }
  return null;
};

// Utility function để kiểm tra hỗ trợ thông báo
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

// Utility function để kiểm tra trạng thái quyền
export const getNotificationPermission = (): NotificationPermission => {
  return isNotificationSupported() ? Notification.permission : 'denied';
};
