import { StampNotificationPayload } from '@hooks/useStampNotification';
import { Store } from '@tanstack/react-store';

type StampNotificationState = {
  stamp_notification: StampNotificationPayload[];
};

const initialState: StampNotificationState = {
  stamp_notification: JSON.parse(
    localStorage.getItem('stamp_notification') || '[]'
  )
};

export const stampNotificationStore = new Store<StampNotificationState>(
  initialState
);

stampNotificationStore.subscribe((state) => {
  localStorage.setItem(
    'stamp_notification',
    JSON.stringify(state.currentVal.stamp_notification)
  );
});

export const setStampNotifications = (
  notifications: StampNotificationPayload
) => {
  stampNotificationStore.setState((prevState) => {
    const updatedNotifications = [
      notifications,
      ...prevState.stamp_notification
    ];
    return { ...prevState, stamp_notification: updatedNotifications };
  });
};

export const clearStampNotifications = () => {
  stampNotificationStore.setState((prevState) => {
    return { ...prevState, stamp_notification: [] };
  });
};
