import { useQuery, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/EmployeeService';
import { employeeRequestFormService } from '@/services/RequestFormService';
import { EmployeeType } from '@/types/employeeType';
import { AuthorizableEmployee } from '@/types/requestFormType';
import { authStore } from '@/stores/authStore';

export interface AuthorizedEmployeeInfo {
  id: string;
  name: string;
  employee_code: string;
  gender?: string;
  role_name?: string;
}

// Cache key for all employees list
export const AUTHORIZABLE_EMPLOYEES_CACHE_KEY = ['authorizable-employees'];

/**
 * Hook to prefetch all authorizable employees for faster lookups
 * Call this once when opening the request forms page
 */
export const usePrefetchAuthorizableEmployees = () => {
  const queryClient = useQueryClient();
  const currentUser = authStore.state.user;
  const isAdmin = currentUser?.role?.name?.toLowerCase().includes('admin');

  return () => {
    if (!isAdmin) {
      queryClient.prefetchQuery({
        queryKey: AUTHORIZABLE_EMPLOYEES_CACHE_KEY,
        queryFn: async () => {
          const response =
            await employeeRequestFormService.getAuthorizableEmployees();
          return response.success ? response.data : [];
        },
        staleTime: 30 * 60 * 1000
      });
    }
  };
};

/**
 * Hook to fetch employee information by ID
 *
 * Strategy:
 * - Admin users: Call admin API directly (/api/employees/{id})
 * - Employee users: Use cached list from AUTHORIZABLE_EMPLOYEES_CACHE_KEY
 * - Use placeholder data for immediate display
 * - Fallback to placeholder if API fails
 *
 * @param employeeId - Employee ID to fetch
 * @param placeholderData - Placeholder data to show immediately while fetching
 * @param skipFetch - If true, skip fetching and only use placeholder data
 */
export const useAuthorizedEmployee = (
  employeeId: string | undefined,
  placeholderData?: Partial<AuthorizedEmployeeInfo>,
  skipFetch = false
) => {
  const queryClient = useQueryClient();
  const currentUser = authStore.state.user;
  const isAdmin = currentUser?.role?.name?.toLowerCase().includes('admin');

  return useQuery({
    queryKey: ['employee-info', employeeId],
    queryFn: async (): Promise<AuthorizedEmployeeInfo | null> => {
      if (!employeeId) return null;

      try {
        // Admin users: Call admin API directly
        if (isAdmin) {
          const employee = await employeeService.get<EmployeeType>(employeeId);
          return {
            id: employee.id.toString(),
            name: employee.name,
            employee_code: employee.id.toString(),
            gender: employee.gender,
            role_name: employee.role?.role_name || ''
          };
        }

        // Employee users: Try to get from cache first
        const cachedEmployees = queryClient.getQueryData<
          AuthorizableEmployee[]
        >(AUTHORIZABLE_EMPLOYEES_CACHE_KEY);

        if (cachedEmployees) {
          const employee = cachedEmployees.find(
            (emp) => emp.id.toString() === employeeId
          );
          if (employee) {
            return {
              id: employee.id.toString(),
              name: employee.name,
              employee_code: employee.id.toString(),
              gender: employee.gender,
              role_name: employee.role_name
            };
          }
        }

        // If not in cache, fetch the list
        const response =
          await employeeRequestFormService.getAuthorizableEmployees();
        if (response.success) {
          // Cache the full list for future lookups
          queryClient.setQueryData(
            AUTHORIZABLE_EMPLOYEES_CACHE_KEY,
            response.data
          );

          const employee = response.data.find(
            (emp) => emp.id.toString() === employeeId
          );
          if (employee) {
            return {
              id: employee.id.toString(),
              name: employee.name,
              employee_code: employee.id.toString(),
              gender: employee.gender,
              role_name: employee.role_name
            };
          }
        }

        // If employee not found in list, return placeholder
        return (placeholderData as AuthorizedEmployeeInfo) || null;
      } catch (error) {
        console.error('Failed to fetch employee info:', error);
        return (placeholderData as AuthorizedEmployeeInfo) || null;
      }
    },
    enabled: !!employeeId && !skipFetch, // Only fetch if ID exists and not explicitly skipped
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes (increased from 5 minutes)
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
    placeholderData: placeholderData as AuthorizedEmployeeInfo | undefined
  });
};
