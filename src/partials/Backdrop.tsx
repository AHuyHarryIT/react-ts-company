import { AppDispatch, RootState } from '@stores/index';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { toggleMobileSidebar } from '@stores/sidebarSlice';

const Backdrop: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isMobileOpen = useSelector(
    (state: RootState) => state.sidebar.isMobileOpen
  );

  if (!isMobileOpen) return null;

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-40 bg-gray-900 lg:hidden"
      onClick={() => dispatch(toggleMobileSidebar())}
    />
  );
};

export default Backdrop;
