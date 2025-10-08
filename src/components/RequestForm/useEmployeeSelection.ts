/**
 * useEmployeeSelection Hook
 * Hook để sử dụng EmployeeSelectionContext
 */

import { useContext } from 'react';
import { EmployeeSelectionContext } from './employeeSelection.context';

export const useEmployeeSelection = () => {
  const context = useContext(EmployeeSelectionContext);
  if (context === undefined) {
    throw new Error(
      'useEmployeeSelection must be used within an EmployeeSelectionProvider'
    );
  }
  return context;
};
