import { useCrudList } from '@hooks/useCrudList';
import {
  attendanceCreateSchema,
  attendanceUpdateSchema
} from '@schemas/attendanceSchema.schema';
import { employeeService } from '@services/EmployeeService';
import { zodToFieldsWithOverride } from '@utils/zodToFieldsWithOverride ';

export const useAttendanceCreateFields = () => {
  const { data: employees } = useCrudList({
    service: employeeService,
    queryKey: 'employees',
    initialFilters: {
      limit: 0
    }
  });

  const employeeOptions = employees?.map((employee) => ({
    label: `${employee.code} -${employee.name}`,
    value: employee.code
  }));

  return zodToFieldsWithOverride(attendanceCreateSchema, {
    employee_code: {
      label: 'Nhân viên',
      required: true,
      options: employeeOptions,
      type: 'select',
      placeholder: 'Chọn nhân viên'
    },
    datetime: {
      label: 'Thời gian chấm công',
      required: true,
      type: 'datetime'
    }
  });
};

export const attendanceUpdateFields = zodToFieldsWithOverride(
  attendanceUpdateSchema,
  {
    datetime: {
      label: 'Thời gian chấm công',
      required: true,
      type: 'datetime'
    }
  }
);
