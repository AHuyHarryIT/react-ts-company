import { roleCreateSchema } from '@/schema/roleSchema.schema';
import { zodToFieldsWithOverride } from '@utils/zodToFieldsWithOverride ';

export const roleFields = zodToFieldsWithOverride(roleCreateSchema, {
  role_name: {
    label: 'Tên chức vụ',
    type: 'text'
  }
});
