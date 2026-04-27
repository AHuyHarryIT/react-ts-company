/**
 * useHolidayMode — Hook to detect if we're in the 30/4 – 1/5 holiday period.
 *
 * Automatically activates from April 25 → May 3 (inclusive) every year.
 * Returns:
 *   - isHoliday: whether the current date falls in the holiday window
 *   - daysUntilHoliday: remaining days until April 30 (0 if already past)
 *   - holidayLabel: descriptive label for the holiday
 */

import { useMemo } from 'react';

interface HolidayInfo {
  isHoliday: boolean;
  daysUntilHoliday: number;
  holidayLabel: string;
  holidayPhase: 'before' | 'during' | 'after';
}

export function useHolidayMode(): HolidayInfo {
  return useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-indexed
    const day = now.getDate();

    // Holiday window: April 19 → May 3 (trang trí sớm ~10 ngày trước lễ)
    const startMonth = 4,
      startDay = 19;
    const endMonth = 5,
      endDay = 3;

    const isInRange =
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay);

    // Days until April 30
    const april30 = new Date(year, 3, 30); // month 0-indexed
    const diffMs = april30.getTime() - now.getTime();
    const daysUntil = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    let phase: 'before' | 'during' | 'after' = 'before';
    if (month === 4 && day >= 30) phase = 'during';
    else if (month === 5 && day <= 3) phase = 'during';
    else if (month === 4 && day >= startDay) phase = 'before';
    else phase = 'after';

    return {
      isHoliday: isInRange,
      daysUntilHoliday: daysUntil,
      holidayLabel:
        'Kỷ niệm Ngày Giải phóng miền Nam 30/4 & Quốc tế Lao động 1/5',
      holidayPhase: phase
    };
  }, []);
}
