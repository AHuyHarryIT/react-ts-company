import { Link, LinkProps } from '@tanstack/react-router';
import React from 'react';
export interface WidgetProps {
  title: string;
  value?: string;
  icon: React.ReactNode;
  navLink?: LinkProps['to'];
  onClick?: () => void;
}

const DashboardWidget: React.FC<WidgetProps> = ({
  title,
  value,
  icon,
  navLink,
  onClick
}: WidgetProps) => {
  const content = (
    <div className="h-full rounded-xl border border-gray-100 bg-white p-4 shadow-sm active:scale-[0.98] active:bg-gray-50 md:p-5 dark:border-gray-700 dark:bg-gray-800 dark:active:bg-gray-700">
      <div className="flex h-full flex-col items-center justify-between gap-3 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/40">
          <span className="text-xl text-slate-600 dark:text-slate-400">
            {icon}
          </span>
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </div>
        {value && (
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </h4>
        )}
      </div>
    </div>
  );

  if (navLink) return <Link to={navLink}>{content}</Link>;
  if (onClick)
    return (
      <div className="cursor-pointer" onClick={onClick}>
        {content}
      </div>
    );
  return content;
};

export default DashboardWidget;
