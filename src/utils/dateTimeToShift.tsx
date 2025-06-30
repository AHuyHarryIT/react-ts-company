import dayjs from 'dayjs';

export const dateTimeToShift = (currentDate: string, shiftDate: string) => {
  const current = dayjs(currentDate, 'DD-MM-YYYY');
  const date = dayjs(shiftDate, 'YYYY-MM-DD HH:mm');

  // shift 1: 07:30(today) - 21:30(today)`
  if (
    date >= current.add(7, 'hour').add(30, 'minute') &&
    date < current.add(21, 'hour').add(30, 'minute')
  ) {
    return 1; // Shift 1
  }

  // shift 2: 21:30(today) - 09:00(next day)
  else if (
    date >= current.add(21, 'hour').add(30, 'minute') &&
    date < current.add(1, 'day').startOf('day').add(9, 'hour')
  ) {
    return 2; // Shift 2
  }
  return 1;
};
