import { STORAGE_URL } from '@/configs/environment.config';

export const convertImageName2Url = (
  imageString: string,
  storage: string = 'employee'
): string => {
  if (imageString.split('/').includes('storage')) {
    return `${STORAGE_URL}/${imageString}`;
  } else {
    return [STORAGE_URL, storage, imageString].join('/');
  }
};
