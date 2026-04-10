import { Outlet } from '@tanstack/react-router';
import { motion } from 'framer-motion';

interface PageLayoutProps {
  title: string;
}

export const PageLayout = ({ title }: PageLayoutProps) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex flex-wrap items-center justify-between gap-3"
      >
        <h2
          className="text-xl font-semibold text-gray-800 dark:text-white/90"
          x-text="pageName"
        >
          {title}
        </h2>
      </motion.div>
      <Outlet />
    </>
  );
};
