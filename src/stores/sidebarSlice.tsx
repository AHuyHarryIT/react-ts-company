import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SidebarState = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  isMobile: boolean;
};

const initialState: SidebarState = {
  isExpanded: true,
  isMobileOpen: false,
  isHovered: false,
  activeItem: null,
  openSubmenu: null,
  isMobile: window.innerWidth < 768,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isExpanded = !state.isExpanded;
    },
    toggleMobileSidebar: (state) => {
      state.isMobileOpen = !state.isMobileOpen;
    },
    setIsHovered: (state, action: PayloadAction<boolean>) => {
      state.isHovered = action.payload;
    },
    setActiveItem: (state, action: PayloadAction<string | null>) => {
      state.activeItem = action.payload;
    },
    toggleSubmenu: (state, action: PayloadAction<string>) => {
      state.openSubmenu =
        state.openSubmenu === action.payload ? null : action.payload;
    },
    updateScreenSize: (state) => {
      state.isMobile = window.innerWidth < 768;
      if (!state.isMobile) {
        state.isMobileOpen = false;
      }
    },
  },
});

export const {
  toggleSidebar,
  toggleMobileSidebar,
  setIsHovered,
  setActiveItem,
  toggleSubmenu,
  updateScreenSize,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
