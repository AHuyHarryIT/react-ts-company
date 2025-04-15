import {
  EmployeeCreateType,
  EmployeeType,
  EmployeeUpdateType
} from '@/types/employeeType';
import { CrudService } from '@utils/crudService';

const ENDPOINT = '/api/employees';

export const employeeService = new CrudService<
  EmployeeType,
  EmployeeCreateType,
  EmployeeUpdateType
>(ENDPOINT);
