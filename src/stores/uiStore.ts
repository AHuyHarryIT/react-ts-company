import { Store } from '@tanstack/react-store';

type UIState = {
  isSidebarClose: boolean;
  theme: 'light' | 'dark';
  isMobile: boolean;
};

// Load state from localStorage or set default values
const initialState: UIState = {
  isSidebarClose: window.innerWidth < 768,
  theme: localStorage.getItem('theme') === 'dark' ? 'dark' : 'light',
  isMobile: window.innerWidth < 768
};

// Create the store instance
export const uiStore = new Store(initialState);

// Subscribe to state changes to update localStorage
uiStore.subscribe((state) => {
  localStorage.setItem(
    'isSidebarClose',
    JSON.stringify(state.currentVal.isSidebarClose)
  );

  localStorage.setItem('theme', state.currentVal.theme);
  document.documentElement.classList.toggle(
    'dark',
    state.currentVal.theme === 'dark'
  );
  document.documentElement.setAttribute('data-theme', state.currentVal.theme);
});

// Utility functions to update the store state
export const toggleSidebar = () => {
  uiStore.setState((prevState) => {
    const newState = !prevState.isSidebarClose;
    return { ...prevState, isSidebarClose: newState };
  });
};

export const toggleTheme = () => {
  uiStore.setState((prevState) => {
    const newState = prevState.theme === 'light' ? 'dark' : 'light';
    return { ...prevState, theme: newState };
  });
};

export const updateScreenSize = () => {
  uiStore.setState((prevState) => {
    const newState = window.innerWidth < 768;
    return { ...prevState, isMobile: newState };
  });
};
