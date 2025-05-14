import { Outlet } from '@tanstack/react-router';

interface PageLayoutProps {
  title: string;
}

export const PageLayout = ({ title }: PageLayoutProps) => {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2
          className="text-xl font-semibold text-gray-800 dark:text-white/90"
          x-text="pageName"
        >
          {title}
        </h2>
      </div>
      <Outlet />
    </>
  );
};
