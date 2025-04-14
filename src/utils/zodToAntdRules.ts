import { FieldConfig } from '@/types/form';
import { Rule } from 'antd/es/form';
import { ZodObject, ZodRawShape } from 'zod';

interface zodToAntdRulesProps {
  schema: ZodObject<ZodRawShape>;
  fields: FieldConfig[];
}

export function zodToAntdRules({ schema, fields = [] }: zodToAntdRulesProps) {
  const shape = schema.shape;
  const rules: Record<string, Rule[]> = {};

  for (const key in shape) {
    const field = shape[key];
    const fieldLabel = fields.find((f) => f.name === key)?.label || key;

    const validations: Rule[] = [];

    const checkRequired = field.isOptional?.() !== true;
    if (checkRequired) {
      validations.push({
        required: true,
        message: field.description || `Vui lòng nhập ${fieldLabel}`
      });
    }

    // Add custom logic here if needed (e.g. min, max, email)
    // Example: ZodString with min
    const def = field._def;
    if (def.typeName === 'ZodString') {
      if (def.checks) {
        def.checks.forEach(
          (check: { kind: string; value?: number; message?: string }) => {
            if (check.kind === 'min') {
              validations.push({
                min: check.value,
                message:
                  check.message ||
                  `${fieldLabel} phải có ít nhất ${check.value} ký tự`
              });
            }
            if (check.kind === 'max') {
              validations.push({
                max: check.value,
                message:
                  check.message ||
                  `${fieldLabel} không được vượt quá ${check.value} ký tự`
              });
            }
            if (check.kind === 'email') {
              validations.push({
                type: 'email',
                message: check.message || `Email không hợp lệ`
              });
            }
          }
        );
      }
    }
    // Example: ZodNumber with min and max
    if (def.typeName === 'ZodNumber') {
      if (def.checks) {
        def.checks.forEach(
          (check: { kind: string; value?: number; message?: string }) => {
            if (check.kind === 'min') {
              validations.push({
                min: check.value,
                message:
                  check.message || `${fieldLabel} phải lớn hơn ${check.value}`
              });
            }
            if (check.kind === 'max') {
              validations.push({
                max: check.value,
                message:
                  check.message ||
                  `${fieldLabel} không được lớn hơn ${check.value}`
              });
            }
          }
        );
      }
    }

    rules[key] = validations;
  }

  return rules;
}
