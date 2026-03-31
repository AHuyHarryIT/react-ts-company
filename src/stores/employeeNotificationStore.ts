import { Store } from '@tanstack/react-store';

export type EmployeeNotificationItem = {
  id: string; // unique key: `salary-{id}` or `schedule-{id}`
  type: 'salary' | 'schedule';
  title: string;
  message: string;
  admin_name: string;
  created_at: string;
  read: boolean;
};

type EmployeeNotificationState = {
  items: EmployeeNotificationItem[];
};

const initialState: EmployeeNotificationState = {
  items: JSON.parse(localStorage.getItem('employee_notifications') || '[]')
};

export const employeeNotificationStore = new Store<EmployeeNotificationState>(
  initialState
);

// Persist to localStorage
employeeNotificationStore.subscribe((state) => {
  localStorage.setItem(
    'employee_notifications',
    JSON.stringify(state.currentVal.items)
  );
});

export const addEmployeeNotification = (
  item: Omit<EmployeeNotificationItem, 'read'>
) => {
  employeeNotificationStore.setState((prev) => {
    // Don't duplicate
    if (prev.items.some((n) => n.id === item.id)) return prev;
    return { ...prev, items: [{ ...item, read: false }, ...prev.items] };
  });
};

export const markEmployeeNotificationRead = (id: string) => {
  employeeNotificationStore.setState((prev) => ({
    ...prev,
    items: prev.items.map((n) => (n.id === id ? { ...n, read: true } : n))
  }));
};

export const markAllEmployeeNotificationsRead = () => {
  employeeNotificationStore.setState((prev) => ({
    ...prev,
    items: prev.items.map((n) => ({ ...n, read: true }))
  }));
};

export const removeEmployeeNotification = (id: string) => {
  employeeNotificationStore.setState((prev) => ({
    ...prev,
    items: prev.items.filter((n) => n.id !== id)
  }));
};

export const clearEmployeeNotifications = () => {
  employeeNotificationStore.setState((prev) => ({ ...prev, items: [] }));
};
