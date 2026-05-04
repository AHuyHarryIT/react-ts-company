import { Outlet } from '@tanstack/react-router';
import {
  LIST_CONTAINER_VARIANTS,
  SECTION_ITEM_VARIANTS,
  SURFACE_TRANSITION
} from '@constants/motion';
import { motion, useReducedMotion } from 'framer-motion';

interface PageLayoutProps {
  title: string;
}

export const PageLayout = ({ title }: PageLayoutProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : LIST_CONTAINER_VARIANTS}
      initial="initial"
      animate="animate"
    >
      <motion.div
        variants={
          shouldReduceMotion
            ? {
                initial: { opacity: 0 },
                animate: { opacity: 1 }
              }
            : SECTION_ITEM_VARIANTS
        }
        transition={shouldReduceMotion ? { duration: 0 } : SURFACE_TRANSITION}
        className="mb-6 flex flex-wrap items-center justify-between gap-3"
      >
        <h2
          className="text-xl font-semibold text-gray-800 dark:text-white/90"
          x-text="pageName"
        >
          {title}
        </h2>
      </motion.div>
      <motion.div
        variants={
          shouldReduceMotion
            ? {
                initial: { opacity: 0 },
                animate: { opacity: 1 }
              }
            : SECTION_ITEM_VARIANTS
        }
        transition={shouldReduceMotion ? { duration: 0 } : SURFACE_TRANSITION}
      >
        <Outlet />
      </motion.div>
    </motion.div>
  );
};
