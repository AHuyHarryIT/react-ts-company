import { vi, en } from './validationMessages';

type SupportedLang = 'vi' | 'en';

const languages = {
  vi,
  en
};

export function mapErrorCodesToMessages(
  errors: Record<string, string[]>,
  lang: SupportedLang = 'vi'
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const dictionary = languages[lang];

  for (const field in errors) {
    const codes = errors[field];
    result[field] = codes.map(
      (code) =>
        dictionary[code as keyof typeof dictionary] || dictionary['INVALID']
    );
  }

  return result;
}
