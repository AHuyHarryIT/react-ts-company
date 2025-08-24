import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBirthday } from '@/services/BirthdayService';
import { EmployeeType } from '@/types/employeeType';

const BIRTHDAY_STORAGE_KEY = 'birthday_notification_shown';

export const useBirthdayNotification = () => {
  const [shouldShow, setShouldShow] = useState(false);
  const [todayBirthdays, setTodayBirthdays] = useState<EmployeeType[]>([]);

  // Fetch birthday data
  const {
    data: birthdayEmployees,
    isLoading,
    error
  } = useQuery({
    queryKey: ['birthdays'],
    queryFn: getBirthday,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  useEffect(() => {
    if (!birthdayEmployees || isLoading || error) return;

    const today = new Date();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayMMDD = `${todayMonth}-${todayDay}`;

    // Filter employees with today's birthday
    const todaysBirthdayPeople = birthdayEmployees.filter((employee) => {
      const birthdayDate = new Date(employee.birthday);
      const birthdayMonth = String(birthdayDate.getMonth() + 1).padStart(
        2,
        '0'
      );
      const birthdayDay = String(birthdayDate.getDate()).padStart(2, '0');
      const birthdayMMDD = `${birthdayMonth}-${birthdayDay}`;
      return birthdayMMDD === todayMMDD;
    });

    setTodayBirthdays(todaysBirthdayPeople);

    // Check if we should show the birthday modal
    if (todaysBirthdayPeople.length > 0) {
      const lastShownDate = localStorage.getItem(BIRTHDAY_STORAGE_KEY);
      const currentDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Show only if not shown today
      if (lastShownDate !== currentDate) {
        setShouldShow(true);
      }
    }
  }, [birthdayEmployees, isLoading, error]);

  const markAsShown = () => {
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    localStorage.setItem(BIRTHDAY_STORAGE_KEY, currentDate);
    setShouldShow(false);
  };

  return {
    shouldShow,
    todayBirthdays,
    markAsShown,
    isLoading,
    error
  };
};
