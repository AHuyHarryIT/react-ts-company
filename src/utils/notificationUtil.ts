export const handleNotification = () => {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      new Notification('Thông báo', {
        body: 'Bạn có một thông báo mới!',
        data: { type: 'stamp' },
        icon: '/logo.svg'
      });
    }
  });
};
