import React from 'react';

import { uiStore } from '@stores/uiStore';
import { useStore } from '@tanstack/react-store';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const Backdrop: React.FC = () => {
  const { isMobile } = useStore(uiStore);
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18 }}
          className="bg-opacity-50 fixed inset-0 z-40 bg-gray-900 lg:hidden"
        />
      )}
    </AnimatePresence>
  );
};

export default Backdrop;
