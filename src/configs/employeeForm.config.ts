import { useCrudList } from '@/hooks/useCrudList';
import { employeeCreateSchema } from '@/schema/employeeSchema.schema';
import { GenderEnumOptions } from '@/schema/genderEnum.schema';
import { MaritalStatusEnumOptions } from '@/schema/maritalStatusEnum.schema';
import { roleService } from '@services/RoleService';
import { fetchWorkScheduleCategories } from '@services/WorkScheduleCategoryService';
import { useQuery } from '@tanstack/react-query';
import { zodToFieldsWithOverride } from '@utils/zodToFieldsWithOverride ';

export const useEmployeeFields = () => {
  const { data: roleData } = useCrudList({
    service: roleService,
    queryKey: 'roles',
    initialFilters: {
      limit: 0,
      sort: 'role_name'
    }
  });

  const { data: workScheduleCategoriesData } = useQuery({
    queryKey: ['calenders'],
    queryFn: () => fetchWorkScheduleCategories({ limit: 0 })
  });

  return zodToFieldsWithOverride(employeeCreateSchema, {
    name: {
      label: 'Họ và tên',
      index: 1
    },
    phone: {
      label: 'Số điện thoại',
      index: 2,
      rules: [
        {
          required: true,
          message: 'Vui lòng nhập số điện thoại'
        },
        {
          pattern: /^\d{10}$/,
          message: 'Số điện thoại không hợp lệ'
        }
      ]
    },
    id: {
      label: 'Mã nhân viên',
      index: 3
    },
    email: {
      label: 'Email',
      type: 'email'
    },
    CCCD: {
      label: 'CCCD',
      type: 'text',
      rules: [
        {
          required: true,
          message: 'Vui lòng nhập số CCCD'
        },
        {
          pattern: /^\d{12}$/,
          message: 'Số CCCD không hợp lệ'
        }
      ]
    },
    address: {
      label: 'Địa chỉ'
    },
    home_town: {
      label: 'Quê quán'
    },
    birthday: {
      label: 'Ngày sinh',
      type: 'date'
    },
    gender: {
      label: 'Giới tính',
      options: GenderEnumOptions
    },
    marital_status: {
      label: 'Tình trạng hôn nhân',
      options: MaritalStatusEnumOptions
    },
    company: {
      label: 'Công ty',
      type: 'select',
      options: [
        {
          label: 'Vinh Vinh Phát',
          value: 'vvp'
        },
        {
          label: 'A7A',
          value: 'a7a'
        }
      ]
    },
    date_joining: {
      label: 'Ngày vào làm',
      type: 'date'
    },
    role_id: {
      label: 'Chức vụ',
      type: 'select',
      options: roleData.map((role) => {
        return {
          label: role.role_name,
          value: role.id
        };
      })
    },
    calendar_category_id: {
      label: 'Danh mục lịch làm việc',
      type: 'select',
      options: workScheduleCategoriesData?.workScheduleCategories.map(
        (category) => {
          return {
            label: category.name,
            value: category.id
          };
        }
      )
    },
    photo: {
      label: 'Ảnh đại diện',
      type: 'image',
      required: true
    },
    card_photo: {
      label: 'Ảnh thẻ',
      type: 'image',
      required: true
    }
  });
};
