import React from 'react';
export interface WidgetProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const DashboardWidget: React.FC<WidgetProps> = ({
  title,
  value,
  icon,
}: WidgetProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
            <span className="text-2xl text-gray-800 dark:text-white/90">
              {icon}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {title}
          </div>
        </div>
        <h4 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
          {value}
        </h4>
      </div>
    </div>
  );
};

export default DashboardWidget;
