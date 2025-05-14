import { FieldConfig } from '@/types/form';
import { Rule } from 'antd/es/form';
import { ZodObject, ZodRawShape, ZodTypeAny } from 'zod';

interface zodToAntdRulesProps {
  schema: ZodObject<ZodRawShape>;
  fields: FieldConfig[];
}

export function zodToAntdRules({ schema, fields = [] }: zodToAntdRulesProps) {
  const shape = schema.shape;
  const rules: Record<string, Rule[]> = {};

  const zodString = (field: ZodTypeAny, fieldLabel: string) => {
    const def = field._def;
    const validations: Rule[] = [];

    if (def.typeName === 'ZodString') {
      if (def.checks) {
        def.checks.forEach(
          (check: { kind: string; value?: number; message?: string }) => {
            switch (check.kind) {
              case 'min':
                validations.push({
                  min: check.value,
                  message:
                    check.message ||
                    `${fieldLabel} phải có ít nhất ${check.value} ký tự`
                });
                break;
              case 'max':
                validations.push({
                  max: check.value,
                  message:
                    check.message ||
                    `${fieldLabel} không được vượt quá ${check.value} ký tự`
                });
                break;
              case 'email':
                validations.push({
                  type: 'email',
                  message: check.message || `${fieldLabel} không hợp lệ` // Email không hợp lệ
                });
                break;
              case 'url':
                validations.push({
                  type: 'url',
                  message: check.message || `${fieldLabel} không hợp lệ`
                });
                break;
            }
          }
        );
      }

      return validations;
    }
  };

  const zodNumber = (field: ZodTypeAny, fieldLabel: string) => {
    const def = field._def;
    const validations: Rule[] = [];
    if (def.typeName === 'ZodNumber') {
      if (def.checks) {
        def.checks.forEach(
          (check: { kind: string; value?: number; message?: string }) => {
            switch (check.kind) {
              case 'min':
                validations.push({
                  min: check.value,
                  message:
                    check.message || `${fieldLabel} phải lớn hơn ${check.value}`
                });
                break;
              case 'max':
                validations.push({
                  max: check.value,
                  message:
                    check.message ||
                    `${fieldLabel} không được lớn hơn ${check.value}`
                });
                break;
              case 'int':
                validations.push({
                  type: 'integer',
                  message: check.message || `${fieldLabel} phải là số nguyên`
                });
                break;
            }
          }
        );
      }
      return validations;
    }
  };

  const getInnerType = (field: ZodTypeAny) => {
    const def = field._def;
    // unwrap layers: optional, nullable, default, effects
    if (
      def.typeName === 'ZodOptional' ||
      def.typeName === 'ZodNullable' ||
      def.typeName === 'ZodDefault' ||
      def.typeName === 'ZodEffects'
    ) {
      return getInnerType(def.innerType || def.schema); // `innerType` or `schema` for different Zod types
    }
    return field;
  };

  for (const key in shape) {
    const field = shape[key];
    const fieldLabel = fields.find((f) => f.name === key)?.label || key;
    const fieldType = fields.find((f) => f.name === key)?.type || 'text';

    const validations: Rule[] = [];

    const checkRequired = field.isOptional?.() !== true;
    if (checkRequired) {
      validations.push({
        required: true,
        message:
          field.description ||
          `Vui lòng ${['select', 'image', 'file'].includes(fieldType) ? 'chọn' : 'nhập'} ${fieldLabel}`
      });
    }

    const unwrappedField = getInnerType(field);

    // Add custom logic here if needed (e.g. min, max, email, optional, etc.)
    const zodStringValidations = zodString(unwrappedField, fieldLabel);
    if (zodStringValidations) {
      validations.push(...zodStringValidations);
    }

    const zodNumberValidations = zodNumber(unwrappedField, fieldLabel);
    if (zodNumberValidations) {
      validations.push(...zodNumberValidations);
    }

    rules[key] = validations;
  }

  return rules;
}
