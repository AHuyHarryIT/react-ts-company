import { Link, LinkProps } from '@tanstack/react-router';
import React from 'react';
import { motion } from 'framer-motion';

export interface WidgetProps {
  title: string;
  value?: string;
  icon: React.ReactNode;
  navLink?: LinkProps['to'];
  onClick?: () => void;
  index?: number;
  isLoading?: boolean;
}

const DashboardWidget: React.FC<WidgetProps> = ({
  title,
  value,
  icon,
  navLink,
  onClick,
  isLoading = false
}: WidgetProps) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        ease: 'easeOut'
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className="group relative h-full"
    >
      <div className="relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all duration-300 lg:hover:border-blue-200 lg:hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:border-gray-700 dark:bg-gray-800 dark:lg:hover:border-gray-600 dark:lg:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
        {/* Glow effect background on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100 dark:from-white/5" />

        {/* Icon */}
        <motion.div
          className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 transition-colors duration-300 lg:group-hover:bg-blue-100/50 dark:bg-gray-700 dark:lg:group-hover:bg-gray-600"
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-2xl text-black transition-colors duration-300 lg:group-hover:text-blue-600 dark:text-gray-300 dark:lg:group-hover:text-blue-400">
            {icon}
          </span>
        </motion.div>

        {/* Title */}
        <p className="relative z-10 text-sm leading-snug font-semibold text-black dark:text-gray-300">
          {title}
        </p>

        {/* Value or Skeleton */}
        {/* Value */}
        {(value !== undefined || isLoading) && (
          <div className="relative z-10 flex h-8 items-center justify-center">
            {isLoading ? (
              <span className="animate-pulse text-xl font-bold text-gray-300 dark:text-gray-500">
                ...
              </span>
            ) : (
              <span className="text-2xl font-bold tracking-tight text-gray-900 drop-shadow-sm transition-transform duration-300 lg:group-hover:scale-105 dark:text-white">
                {value}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );

  if (navLink)
    return (
      <Link to={navLink} className="block h-full no-underline">
        {content}
      </Link>
    );
  if (onClick)
    return (
      <div className="h-full cursor-pointer" onClick={onClick}>
        {content}
      </div>
    );
  return content;
};

export default DashboardWidget;
