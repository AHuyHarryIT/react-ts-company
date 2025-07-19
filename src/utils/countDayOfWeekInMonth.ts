import dayjs from 'dayjs';

export const countDayOfWeekInMonth = (
  date: dayjs.ConfigType,
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
) => {
  const days = dayjs(date).daysInMonth();
  const firstSatOffset = dayjs(date).startOf('month').day(dayOfWeek).date();
  return Math.floor((days - firstSatOffset) / 7) + 1;
};
