import { ProductCompanyEnumOptions as ProductCompanyEnumOptions } from '@schemas/product/productCompanyEnum.enum';
import { ProductModelEnumOptions } from '@schemas/product/productModelEnum.enum';
import { ProductModelSizeEnumOptions } from '@schemas/product/productModelSizeEnum.enum';
import {
  productCreateSchema,
  productUpdateSchema
} from '@schemas/product/productSchema.schema';
import { zodToFieldsWithOverride } from '@utils/zodToFieldsWithOverride ';

export const productCreateFields = zodToFieldsWithOverride(
  productCreateSchema,
  {
    code: {
      label: 'Mã linh kiện',
      type: 'text',
      index: 1
    },
    name: {
      label: 'Tên linh kiện',
      type: 'text',
      index: 2
    },
    stockQuanMOQ: {
      label: 'Sản lượng (MOQ)',
      type: 'number',
      index: 3
    },
    stockQuan: {
      label: 'Số lượng tồn đầu kỳ',
      type: 'number',
      index: 4
    },
    moldSize: {
      label: 'Kích thước khuôn',
      type: 'select',
      options: ProductModelSizeEnumOptions,
      index: 5
    },
    CAV: {
      label: 'Số CAV (cái/shot)',
      type: 'number',
      index: 6
    },
    cycle: {
      label: 'Chu kỳ (s/shot)',
      type: 'number',
      index: 7
    },
    stockQuan200: {
      label: 'Số lượng tồn đầu kỳ (hàng 200%)',
      type: 'number',
      index: 8
    },
    binCode: {
      label: 'Mã thùng',
      type: 'select',
      options: ProductModelEnumOptions,
      index: 9
    },
    quanEntityBin: {
      label: 'Số lượng con/thùng',
      type: 'number',
      index: 10
    },
    material: {
      label: 'Vật liệu',
      type: 'text',
      index: 11
    },
    color: {
      label: 'Màu sắc',
      type: 'text',
      index: 12
    },
    quantity_per_package: {
      label: 'Số lượng/gói',
      type: 'number',
      index: 13
    },
    companies: {
      label: 'Công ty',
      type: 'select-multiple',
      options: ProductCompanyEnumOptions,
      index: 14
    }
  }
);

export const productUpdateFields = zodToFieldsWithOverride(
  productUpdateSchema,
  {
    code: {
      label: 'Mã linh kiện',
      type: 'text',
      index: 1
    },
    name: {
      label: 'Tên linh kiện',
      type: 'text',
      index: 2
    },
    moldSize: {
      label: 'Kích thước khuôn',
      type: 'select',
      options: ProductModelSizeEnumOptions,
      index: 3
    },
    CAV: {
      label: 'Số CAV (cái/shot)',
      type: 'number',
      index: 4
    },
    cycle: {
      label: 'Chu kỳ (s/shot)',
      type: 'number',
      index: 5
    },
    binCode: {
      label: 'Mã thùng',
      type: 'select',
      options: ProductModelEnumOptions,
      index: 6
    },
    quanEntityBin: {
      label: 'Số lượng con/thùng',
      type: 'number',
      index: 7
    },
    material: {
      label: 'Vật liệu',
      type: 'text',
      index: 8
    },
    color: {
      label: 'Màu sắc',
      type: 'text',
      index: 9
    },
    quantity_per_package: {
      label: 'Số lượng/gói',
      type: 'number',
      index: 10
    },
    companies: {
      label: 'Công ty',
      type: 'select-multiple',
      options: ProductCompanyEnumOptions,
      index: 11
    }
  }
);
