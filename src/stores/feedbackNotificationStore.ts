import { Store } from '@tanstack/react-store';

export type FeedbackNotificationItem = {
  id: number;
  subject: string;
  status: 'resolved' | 'rejected';
  admin_reply: string;
  replied_at: string;
  read: boolean;
};

type FeedbackNotificationState = {
  items: FeedbackNotificationItem[];
};

const initialState: FeedbackNotificationState = {
  items: JSON.parse(localStorage.getItem('feedback_notifications') || '[]')
};

export const feedbackNotificationStore = new Store<FeedbackNotificationState>(
  initialState
);

// Persist to localStorage
feedbackNotificationStore.subscribe((state) => {
  localStorage.setItem(
    'feedback_notifications',
    JSON.stringify(state.currentVal.items)
  );
});

export const addFeedbackNotification = (
  item: Omit<FeedbackNotificationItem, 'read'>
) => {
  feedbackNotificationStore.setState((prev) => {
    // Don't duplicate
    if (prev.items.some((n) => n.id === item.id)) return prev;
    return { ...prev, items: [{ ...item, read: false }, ...prev.items] };
  });
};

export const markFeedbackNotificationRead = (id: number) => {
  feedbackNotificationStore.setState((prev) => ({
    ...prev,
    items: prev.items.map((n) => (n.id === id ? { ...n, read: true } : n))
  }));
};

export const markAllFeedbackNotificationsRead = () => {
  feedbackNotificationStore.setState((prev) => ({
    ...prev,
    items: prev.items.map((n) => ({ ...n, read: true }))
  }));
};

export const removeFeedbackNotification = (id: number) => {
  feedbackNotificationStore.setState((prev) => ({
    ...prev,
    items: prev.items.filter((n) => n.id !== id)
  }));
};

export const clearFeedbackNotifications = () => {
  feedbackNotificationStore.setState((prev) => ({ ...prev, items: [] }));
};
