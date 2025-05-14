import { ThemeToggleButton } from '@components/common/ThemeToggleButton';
import NotificationDropdown from '@components/header/NotificationDropdown';
import UserDropdown from '@components/header/UserDropdown';
import { IconContext } from 'react-icons';

const Header = () => {
  return (
    <IconContext.Provider value={{ size: '1.25rem' }}>
      <header className="flex w-full border-gray-200 bg-white px-3 py-2 lg:border-b lg:px-6 dark:border-gray-800 dark:bg-gray-900">
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
