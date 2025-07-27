import { ShiftEnumOptions } from '@constants/shift.enum';
import { useCrudList } from '@hooks/useCrudList';
import { dailyScheduleUpdateSchema } from '@schemas/dailyScheduleSchema.schema';
import { productService } from '@services/ProductService';
import { zodToFieldsWithOverride } from '@utils/zodToFieldsWithOverride ';

export const useDailyScheduleUpdateFields = () => {
  const { data: productsData } = useCrudList({
    service: productService,
    queryKey: 'products',
    initialFilters: {
      limit: 0
    }
  });

  const productOptions = productsData?.map((product) => ({
    label: `${product.name} - ${product.code}`,
    value: product.id
  }));

  return zodToFieldsWithOverride(dailyScheduleUpdateSchema, {
    product_id: {
      label: 'Sản phẩm',
      type: 'select',
      required: true,
      placeholder: 'Chọn sản phẩm',
      options: productOptions
    },
    employee_id: {
      hidden: true,
      label: 'Mã nhân viên'
    },
    shift: {
      disabled: true,
      label: 'Ca làm việc',
      type: 'select',
      options: ShiftEnumOptions
    },
    status: {
      disabled: true,
      label: 'Trạng thái',
      type: 'select',
      options: [
        {
          label: '100%',
          value: '1'
        },
        {
          label: '200%',
          value: '2'
        },
        {
          label: 'Hàng lỗi',
          value: '6'
        }
      ]
    },
    date: {
      hidden: true
    },
    id: {
      hidden: true
    }
  });
};
