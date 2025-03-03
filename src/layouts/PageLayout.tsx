import { headTitle } from '@utils/headMeta';
import { Outlet } from 'react-router-dom';

interface PageLayoutProps {
  title: string;
  metaTitle: string;
}

export const PageLayout = ({ title, metaTitle }: PageLayoutProps) => {
  headTitle(metaTitle);
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
