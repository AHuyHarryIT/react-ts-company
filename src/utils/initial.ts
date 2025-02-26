import { store } from '@stores/index';
import { initializeTheme } from '@stores/themeSlice';

export const loadAndInitializeTheme = () => {
  // console.log("theme initialized");
  store.dispatch(initializeTheme());
};
