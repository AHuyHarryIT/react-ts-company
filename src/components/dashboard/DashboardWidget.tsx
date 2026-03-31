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
}

const DashboardWidget: React.FC<WidgetProps> = ({
  title,
  value,
  icon,
  navLink,
  onClick,
  index = 0
}: WidgetProps) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.23, 1, 0.32, 1]
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group h-full"
    >
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
        {/* Icon */}
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 transition-colors duration-200 group-hover:bg-gray-100 dark:bg-gray-700 dark:group-hover:bg-gray-600">
          <span className="text-2xl text-black dark:text-gray-300">{icon}</span>
        </div>

        {/* Title */}
        <p className="text-sm leading-snug font-semibold text-black dark:text-gray-300">
          {title}
        </p>

        {/* Value */}
        {value && (
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value}
          </span>
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
