import { useSyncExternalStore } from 'react';

export type PayslipAccent = 'blue' | 'emerald' | 'slate' | 'rose';

export interface PayslipTemplate {
  title: string;
  accent: PayslipAccent;
  compact: boolean;
  sections: {
    header: boolean;
    employeeInfo: boolean;
    attendanceComparison: boolean;
    income: boolean;
    deductions: boolean;
    companyCost: boolean;
    netPay: boolean;
    notes: boolean;
  };
}

const STORAGE_KEY = 'salary_payslip_template_v1';
const CHANGE_EVENT = 'salary-payslip-template-change';

export const defaultPayslipTemplate: PayslipTemplate = {
  title: 'Thông tin bảng lương',
  accent: 'blue',
  compact: false,
  sections: {
    header: true,
    employeeInfo: true,
    attendanceComparison: true,
    income: true,
    deductions: true,
    companyCost: true,
    netPay: true,
    notes: true
  }
};

const isBrowser = () => typeof window !== 'undefined';

export const getPayslipTemplate = (): PayslipTemplate => {
  if (!isBrowser()) return defaultPayslipTemplate;

  try {
    const rawTemplate = window.localStorage.getItem(STORAGE_KEY);
    if (!rawTemplate) return defaultPayslipTemplate;

    const parsedTemplate = JSON.parse(rawTemplate) as Partial<PayslipTemplate>;

    return {
      ...defaultPayslipTemplate,
      ...parsedTemplate,
      sections: {
        ...defaultPayslipTemplate.sections,
        ...parsedTemplate.sections
      }
    };
  } catch {
    return defaultPayslipTemplate;
  }
};

const emitTemplateChange = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const savePayslipTemplate = (template: PayslipTemplate) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
  emitTemplateChange();
};

export const resetPayslipTemplate = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  emitTemplateChange();
};

export const usePayslipTemplate = () =>
  useSyncExternalStore(
    (callback) => {
      if (!isBrowser()) return () => undefined;

      window.addEventListener(CHANGE_EVENT, callback);
      window.addEventListener('storage', callback);

      return () => {
        window.removeEventListener(CHANGE_EVENT, callback);
        window.removeEventListener('storage', callback);
      };
    },
    getPayslipTemplate,
    () => defaultPayslipTemplate
  );
