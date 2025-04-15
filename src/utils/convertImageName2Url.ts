export const convertImageName2Url = (
  imageString: string,
  storage: string = 'employee'
): string => {
  if (imageString.split('/').includes('storage')) {
    return imageString;
  } else {
    return ['/storage', storage, imageString].join('/');
  }
};
