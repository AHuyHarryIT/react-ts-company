import { useAuthorizedEmployee } from './useAuthorizedEmployee';

/**
 * Hook to fetch employee name by ID
 * This is a simplified wrapper around useAuthorizedEmployee
 * that only returns the employee name
 *
 * @param employeeId - Employee ID to fetch
 * @returns Query result with employee name
 */
export const useEmployeeName = (employeeId: string | undefined) => {
  const { data: employee, ...rest } = useAuthorizedEmployee(employeeId);

  return {
    ...rest,
    data: employee?.name || null
  };
};
