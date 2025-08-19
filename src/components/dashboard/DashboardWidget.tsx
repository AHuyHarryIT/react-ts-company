import { Link, LinkProps } from '@tanstack/react-router';
import React from 'react';
export interface WidgetProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  navLink?: LinkProps['to'];
}

const DashboardWidget: React.FC<WidgetProps> = ({
  title,
  value,
  icon,
  navLink
}: WidgetProps) => {
  const content = (
    <div className="group relative h-full rounded-2xl border border-gray-200/50 bg-white/90 p-5 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-blue-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:p-6 dark:border-gray-800/50 dark:bg-white/[0.03] dark:hover:shadow-[0_8px_30px_rgba(0,122,255,0.1)]">
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="text-center">
          <div className="m-auto flex h-14 w-14 transform-gpu items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-lg dark:from-gray-800 dark:to-gray-900">
            <span className="text-2xl text-gray-700 transition-all duration-500 ease-out group-hover:scale-110 group-hover:text-white dark:text-white/90">
              {icon}
            </span>
          </div>
          <div className="mt-3 text-sm font-medium text-gray-600 transition-all duration-500 ease-out group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400">
            {title}
          </div>
        </div>
        <h4 className="mt-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-center text-3xl font-bold text-transparent transition-all duration-500 ease-out group-hover:from-blue-600 group-hover:to-blue-400 dark:from-white dark:to-gray-200">
          {value}
        </h4>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 opacity-0 mix-blend-overlay transition-all duration-500 ease-out group-hover:opacity-10"></div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 dark:from-white/5"></div>
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-600/0 opacity-0 blur transition-all duration-500 ease-out group-hover:opacity-15"></div>
    </div>
  );

  return navLink ? <Link to={navLink}>{content}</Link> : content;
};

export default DashboardWidget;
