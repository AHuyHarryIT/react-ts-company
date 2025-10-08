/**
 * Employee Selection Context
 * Context để quản lý employee selection trong RequestForm
 */

import React, { createContext, useState, ReactNode } from 'react';
import type { SelectedEmployee } from './employeeSelection.types';

interface EmployeeSelectionContextType {
  selectedEmployee: SelectedEmployee | null;
  setSelectedEmployee: (employee: SelectedEmployee | null) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const EmployeeSelectionContext = createContext<
  EmployeeSelectionContextType | undefined
>(undefined);

interface EmployeeSelectionProviderProps {
  children: ReactNode;
}

export const EmployeeSelectionProvider: React.FC<
  EmployeeSelectionProviderProps
> = ({ children }) => {
  const [selectedEmployee, setSelectedEmployee] =
    useState<SelectedEmployee | null>(null);

  return (
    <EmployeeSelectionContext.Provider
      value={{ selectedEmployee, setSelectedEmployee }}
    >
      {children}
    </EmployeeSelectionContext.Provider>
  );
};
