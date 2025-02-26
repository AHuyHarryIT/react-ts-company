import GridShape from '@components/common/GridShape';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <>
      {' '}
      <div className="relative z-1 flex h-screen w-full overflow-hidden bg-white px-4 py-6 sm:p-0 dark:bg-gray-900">
        <div className="flex flex-1 flex-col rounded-2xl p-6 sm:rounded-none sm:border-0 sm:p-8">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <Outlet />
          </div>
        </div>
        <div className="relative z-1 hidden flex-1 items-center justify-center bg-blue-950 p-8 lg:flex dark:bg-white/5">
          {/* <!-- ===== Common Grid Shape Start ===== --> */}
          <GridShape />
          <div className="flex max-w-xs flex-col items-center">
            <p className="text-center text-gray-200 dark:text-white/60">
              VINH VINH PHAT ONE MEMBER CO.LTD
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
