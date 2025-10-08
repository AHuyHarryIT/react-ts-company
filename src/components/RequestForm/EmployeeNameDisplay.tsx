/**
 * Employee Name Display Component
 * Component hiển thị tên nhân viên từ ID
 */

import React from 'react';
import { useEmployeeName } from '@/hooks/useEmployeeName';

interface EmployeeNameDisplayProps {
  employeeId: string | undefined;
  fallback?: string;
}

export const EmployeeNameDisplay: React.FC<EmployeeNameDisplayProps> = ({
  employeeId,
  fallback = 'Chưa xác định'
}) => {
  const { data: employeeName, isLoading } = useEmployeeName(employeeId);

  if (isLoading) {
    return <span>Đang tải...</span>;
  }

  return <span>{employeeName || fallback}</span>;
};
