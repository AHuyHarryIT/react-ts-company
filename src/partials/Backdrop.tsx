import React from 'react';

import { uiStore } from '@stores/uiStore';
import { useStore } from '@tanstack/react-store';

const Backdrop: React.FC = () => {
  const { isMobile } = useStore(uiStore);

  if (!isMobile) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-40 bg-gray-900 lg:hidden" />
  );
};

export default Backdrop;
