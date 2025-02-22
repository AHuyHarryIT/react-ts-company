// import { AppDispatch, RootState } from '@stores/index';
// import { useDispatch, useSelector } from 'react-redux';

import { ThemeToggleButton } from '@components/common/ThemeToggleButton';
import NotificationDropdown from '@components/header/NotificationDropdown';
import UserDropdown from '@components/header/UserDropdown';
import { Link } from 'react-router-dom';
import { IconContext } from 'react-icons';

const Header = () => {
  // const dispatch = useDispatch<AppDispatch>();
  // const { isExpanded, isHovered, isMobile } = useSelector(
  //   (state: RootState) => state.sidebar
  // );

  return (
    <IconContext.Provider value={{ size: '1.25rem' }}>
      <header className="flex w-full border-gray-200 bg-white px-3 py-2 lg:border-b lg:px-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center">
          <Link to="/">
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                height={40}
              />
            </>
          </Link>
        </div>
        <div className="flex w-full items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>
          <UserDropdown />
        </div>
      </header>
    </IconContext.Provider>
  );
};

export default Header;
