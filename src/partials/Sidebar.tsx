import { CSSProperties, Key, ReactNode } from 'react';
import { Link } from 'react-router';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';

import { AppDispatch, RootState } from '@stores/index';
import { toggleSidebar } from '@stores/sidebarSlice';
import { useDispatch, useSelector } from 'react-redux';

import { IconContext } from 'react-icons';
import { AiOutlineHome } from 'react-icons/ai';
import { BsCalendar2Check, BsCalendar2Week } from 'react-icons/bs';
import { CiBoxes } from 'react-icons/ci';
import { FaHistory, FaMoneyCheckAlt, FaRegCalendarAlt } from 'react-icons/fa';
import { FaBriefcase, FaPrint } from 'react-icons/fa6';
import { FiUsers } from 'react-icons/fi';
import {
  IoCalendarNumberOutline,
  IoCheckboxOutline,
  IoHomeOutline,
} from 'react-icons/io5';

import logo from '@assets/images/logo/logoAsset.svg';

const { Sider: Side } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: ReactNode,
  key: Key,
  icon?: ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem(
    <Link to={'/'}>
      <span className="capitalize">Trang chủ</span>
    </Link>,
    'dashboard',
    <IoHomeOutline />
  ),
  getItem(
    <Link to="/about">
      <span className="capitalize">about</span>
    </Link>,
    'about',
    <AiOutlineHome />
  ),
  getItem(<span className="capitalize">Nhân sự</span>, 'HR', <FiUsers />, [
    getItem(
      <Link to={'/admin/employees'}>
        <span className="capitalize">Nhân viên</span>
      </Link>,
      'employees'
    ),
    getItem(
      <Link to={'/admin/roles'}>
        <span className="capitalize">Chức vụ</span>
      </Link>,
      'role'
    ),
  ]),
  getItem(
    <Link to={'/'}>
      <span className="capitalize">Sản Phẩm</span>
    </Link>,
    'product',
    <CiBoxes />
  ),
  getItem(
    <span className="capitalize">Kế hoạch</span>,
    'plan',
    <BsCalendar2Week />,
    [
      getItem(
        <Link to={'/'}>
          <span className="capitalize">Kế hoạch sản xuất</span>
        </Link>,
        'plan-production'
      ),
      getItem(
        <Link to={'/'}>
          <span className="capitalize">Kế hoạch nguyên liệu</span>
        </Link>,
        'plan-material'
      ),
    ]
  ),
  getItem(
    <Link to={'/'}>
      <span className="capitalize">Lịch hoạt động / ngày</span>
    </Link>,
    ' activity-schedule',
    <IoCalendarNumberOutline />
  ),
  getItem(<span className="capitalize">Tạo Tem</span>, 'stamp', <FaPrint />, [
    getItem(
      <Link to={'/'}>
        <span className="capitalize">Tem Thùng</span>
      </Link>,
      'box-stamp'
    ),
    getItem(
      <Link to={'/'}>
        <span className="capitalize">Tem Bịch</span>
      </Link>,
      'bag-stamp'
    ),
    getItem(
      <Link to={'/'}>
        <span className="capitalize">Lịch Sử In Tem</span>
      </Link>,
      'history-stamp'
    ),
    getItem(
      <Link to={'/'}>
        <span className="capitalize">Yêu Cầu In Tem</span>
      </Link>,
      'request-stamp'
    ),
  ]),
  getItem(
    <span className="capitalize">Chấm Công</span>,
    'attendance',
    <BsCalendar2Check />,
    [
      getItem(
        <Link to={'/'}>
          <span className="capitalize">Lịch Sử Chấm Công</span>
        </Link>,
        'history-attendance'
      ),
      getItem(
        <Link to={'/'}>
          <span className="capitalize">Bảng Tính Công</span>
        </Link>,
        'attendance-sheet'
      ),
    ]
  ),
  getItem(
    <Link to={'/'}>
      <span className="capitalize">Kiểm tra PO</span>
    </Link>,
    'check-po',
    <IoCheckboxOutline />
  ),
  getItem(
    <Link to={'/'}>
      <span className="capitalize">Lịch làm việc</span>
    </Link>,
    'schedule',
    <FaRegCalendarAlt />
  ),
  getItem(
    <Link to={'/'}>
      <span className="capitalize">Danh mục lịch làm việc</span>
    </Link>,
    ' schedule-category',
    <FaBriefcase />
  ),
  getItem(
    <Link to={'/'}>
      <span className="capitalize">Bảng lương</span>
    </Link>,
    ' salary',
    <FaMoneyCheckAlt />
  ),
  {
    type: 'divider',
  },
  getItem(
    <Link to={'/'}>
      <span className="capitalize">Lịch sử</span>
    </Link>,
    'history',
    <FaHistory />
  ),
];

function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const { isExpanded, isMobile } = useSelector(
    (state: RootState) => state.sidebar
  );
  const { theme } = useSelector((state: RootState) => state.theme);

  const sideStyle: CSSProperties = {};
  if (isMobile) {
    sideStyle.position = 'absolute';
    sideStyle.zIndex = 1;
    sideStyle.height = '100vh';
  }
  return (
    <>
      <Side
        style={{ ...sideStyle }}
        width={256}
        theme={theme}
        breakpoint="md"
        collapsedWidth="0"
        collapsed={!isExpanded}
        onCollapse={() => dispatch(toggleSidebar())}
      >
        <div className="flex items-center justify-center p-4">
          <Link to="/">
            <img
              className="w-full"
              src={logo}
              alt="Logo"
              // height={"40px"}
            />
          </Link>
        </div>
        <IconContext.Provider value={{ size: '1rem' }}>
          <Menu
            theme={theme}
            defaultSelectedKeys={['dashboard']}
            mode="inline"
            // className='w-[256px]'
            items={items}
          />
        </IconContext.Provider>
      </Side>
    </>
  );
}

export default Sidebar;
