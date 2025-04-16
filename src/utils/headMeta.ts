// Desc: set head meta data
export const headTitle = (title: string) => {
  document.title = title;
  return {
    restore: () => {
      document.title = title;
    },
  };
};
