import dayjs from 'dayjs';

// optionally enhance this to handle more complex fields
export function convertDateStringsToDayjs<T extends object>(data: T): T {
  const newData = { ...data };

  for (const key in newData) {
    const value = newData[key];

    if (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}/.test(value) &&
      dayjs(value).isValid()
    ) {
      // Convert string to dayjs only if it's a valid date string
      (newData as Record<string, unknown>)[key] = dayjs(value);
    }
  }

  return newData;
}
