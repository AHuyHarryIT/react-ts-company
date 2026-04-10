import React from 'react';
import { motion } from 'framer-motion';
interface ComponentCardProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  desc?: string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = '',
  desc = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`mb-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <h3 className="text-lg font-medium text-gray-800 uppercase sm:text-2xl dark:text-white/90">
          {title}
        </h3>
        {desc && (
          <p className="mt-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            {desc}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
        <div className="space-y-6">{children}</div>
      </div>
    </motion.div>
  );
};

export default ComponentCard;
