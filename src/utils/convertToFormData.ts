import dayjs from 'dayjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const convertToFormData = (values: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) {
      formData.append(key, '');
    } else if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (value?.fileList?.length) {
      formData.append(key, value.fileList[0].originFileObj);
    } else if (dayjs.isDayjs(value)) {
      formData.append(key, value.format('YYYY-MM-DD'));
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};
