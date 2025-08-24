import axiosPrivate from '@/api/axiosInstance';
import { PaginatedResponse } from '@/types/responseTypes';
import { ScheduleDetailType } from '@/types/scheduleDetailType';
import { CleaningDuty } from '@components/CleaningDuty/CleaningDutyModal';
import dayjs from 'dayjs';

// API endpoint for fetching employee schedule details
const EMP_SCHEDULE_DETAIL_ENDPOINT = '/api/employee/schedules';

// Fetch today's cleaning duties for the current user
export const fetchTodaysCleaningDuties = async (): Promise<
  CleaningDuty[] | null
> => {
  const today = dayjs().format('YYYY-MM-DD');
  const after2Days = dayjs().add(2, 'day').format('YYYY-MM-DD');

  const response = await axiosPrivate.get<
    ScheduleDetailType,
    PaginatedResponse<ScheduleDetailType>
  >(`${EMP_SCHEDULE_DETAIL_ENDPOINT}/details`, {
    params: {
      include: ['employees'],
      'filter[date_between]': `${today},${after2Days}`,
      sort: 'date'
    }
  });

  if (response.data && response.data.length > 0) {
    const duties = response.data.filter((item) => {
      return (
        item.is_eat_room ||
        item.is_wc_trash ||
        item.is_wc_clean_women ||
        item.is_wc_clean_men
      );
    });
    return duties
      .map((duty) => {
        const date = dayjs(duty.date);

        if (duty.is_eat_room) {
          return {
            id: `eat-room-${duty.date}`,
            type: 'eat-room',
            date: date
          };
        }

        if (duty.is_wc_trash) {
          return {
            id: `trash-${duty.date}`,
            type: 'trash',
            date: date
          };
        }

        if (duty.is_wc_clean_women) {
          return {
            id: `female-wc-${duty.date}`,
            type: 'female-wc',
            date: date
          };
        }

        if (duty.is_wc_clean_men) {
          return {
            id: `male-wc-${duty.date}`,
            type: 'male-wc',
            date: date
          };
        }

        return undefined;
      })
      .filter(Boolean) as CleaningDuty[];
  }
  return null;
};

// Check if cleaning duty notification should be shown
export const shouldShowCleaningDutyNotification = (): boolean => {
  const hideUntil = localStorage.getItem('hideCleaningDutyNotification');
  if (!hideUntil) return true;

  const hideDate = dayjs(hideUntil);
  const today = dayjs();

  // Show notification if the hide date has passed (new day)
  return today.isAfter(hideDate, 'day');
};

// Set to hide cleaning duty notification for today
export const hideCleaningDutyNotificationForToday = (): void => {
  const today = dayjs().format('YYYY-MM-DD');
  localStorage.setItem('hideCleaningDutyNotification', today);
};
