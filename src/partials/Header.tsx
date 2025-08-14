import { Button } from 'antd';
import { IconContext } from 'react-icons';

// import { ThemeToggleButton } from '@components/common/ThemeToggleButton';
import NotificationDropdown from '@components/header/NotificationDropdown';
import UserDropdown from '@components/header/UserDropdown';
import { toggleSidebar, uiStore } from '@stores/uiStore';
import { useStore } from '@tanstack/react-store';
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from 'react-icons/ai';

const Header = () => {
  const { isSidebarClose } = useStore(uiStore);

  return (
    <IconContext.Provider value={{ size: '1.25rem' }}>
      <header className="sticky top-0 z-10 flex w-full border-gray-200 bg-white px-3 py-2 lg:border-b lg:px-6 dark:border-gray-800 dark:bg-gray-900">
        <div>
          <Button
            type="text"
            icon={
              isSidebarClose ? <AiOutlineMenuUnfold /> : <AiOutlineMenuFold />
            }
            onClick={toggleSidebar}
            style={{
              fontSize: '16px',
              width: 40,
              height: 40
            }}
          />
        </div>
        <div className="flex w-full items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            {/* <ThemeToggleButton /> */}
            <NotificationDropdown />
          </div>
          <UserDropdown />
        </div>
      </header>
    </IconContext.Provider>
  );
};

export default Header;
