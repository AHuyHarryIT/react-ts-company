import { headTitle } from '@utils/headMeta';

export default function Blank() {
  headTitle('Blank Page');
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2
          className="text-xl font-semibold text-gray-800 dark:text-white/90"
          x-text="pageName"
        >
          Blank Page
        </h2>
      </div>
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="text-theme-xl mb-4 font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
            Card Title Here
          </h3>

          <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
            div Start putting content on grids or panels, you can also use
            different combinations of grids.Please check out the dashboard and
            other pages
          </p>
        </div>
      </div>
    </>
  );
}
