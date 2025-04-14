import { RoleCreateType, RoleType, RoleUpdateType } from '@/types/roleType';
import { CrudService } from '@utils/crudService';

const ENDPOINT = '/api/roles';

export const roleService = new CrudService<
  RoleType,
  RoleCreateType,
  RoleUpdateType
>(ENDPOINT);
