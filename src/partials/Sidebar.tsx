import { Link, useLocation } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import type { MenuProps } from 'antd';
import { Image, Layout, Menu } from 'antd';
import { CSSProperties, Key, ReactNode } from 'react';

import { toggleSidebar, uiStore } from '@stores/uiStore';

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
  IoHomeOutline
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
    type
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem(
    <Link to={'/admin'}>
      <span className="capitalize">Trang chủ</span>
    </Link>,
    '/admin',
    <IoHomeOutline />
  ),
  getItem(
    <Link to={'/admin/about'}>
      <span className="capitalize">about</span>
    </Link>,
    '/admin/about',
    <AiOutlineHome />
  ),
  getItem(<span className="capitalize">Nhân sự</span>, 'HR', <FiUsers />, [
    getItem(
      <Link to={'/admin/employees'}>
        <span className="capitalize">Nhân viên</span>
      </Link>,
      '/admin/employees'
    ),
    getItem(
      <Link to={'/admin/roles'}>
        <span className="capitalize">Chức vụ</span>
      </Link>,
      '/admin/roles'
    )
  ]),
  getItem(
    <Link to={'/admin/products'}>
      <span className="capitalize">Sản Phẩm</span>
    </Link>,
    '/admin/products',
    <CiBoxes />
  ),
  getItem(
    <span className="capitalize">Kế hoạch</span>,
    '/admin/plans',
    <BsCalendar2Week />,
    [
      getItem(
        <Link to={'/admin/plans/production'}>
          <span className="capitalize">Kế hoạch sản xuất</span>
        </Link>,
        '/admin/plans/production'
      ),
      getItem(
        <Link to={'/admin/plans/material'}>
          <span className="capitalize">Kế hoạch nguyên liệu</span>
        </Link>,
        '/admin/plans/material'
      )
    ]
  ),

  getItem(<span className="capitalize">Tạo Tem</span>, 'stamp', <FaPrint />, [
    getItem(
      <Link to={'/admin/stamps/box'}>
        <span className="capitalize">Tem Thùng</span>
      </Link>,
      '/admin/stamps/box'
    ),
    getItem(
      <Link to={'/admin/stamps/bag'}>
        <span className="capitalize">Tem Bịch</span>
      </Link>,
      '/admin/stamps/bag'
    ),
    getItem(
      <Link to={'/admin/stamps/history'}>
        <span className="capitalize">Lịch Sử In Tem</span>
      </Link>,
      '/admin/stamps/history'
    ),
    getItem(
      <Link to={'/admin/stamps/request'}>
        <span className="capitalize">Yêu Cầu In Tem</span>
      </Link>,
      '/admin/stamps/request'
    )
  ]),
  getItem(
    <span className="capitalize">Chấm Công</span>,
    'attendance',
    <BsCalendar2Check />,
    [
      getItem(
        <Link to={'/admin/attendances/history'}>
          <span className="capitalize">Lịch Sử Chấm Công</span>
        </Link>,
        '/admin/attendances/history'
      ),
      getItem(
        <Link to={'/admin/attendances/sheet'}>
          <span className="capitalize">Bảng Tính Công</span>
        </Link>,
        '/admin/attendances/sheet'
      )
    ]
  ),
  getItem(
    <Link to={'/admin/check-po'}>
      <span className="capitalize">Kiểm tra PO</span>
    </Link>,
    '/admin/check-po',
    <IoCheckboxOutline />
  ),
  getItem(
    <Link to={'/admin/work-schedules'}>
      <span className="capitalize">Lịch làm việc</span>
    </Link>,
    '/admin/work-schedule',
    <FaRegCalendarAlt />
  ),
  getItem(
    <Link to={'/admin/work-schedule-categories'}>
      <span className="capitalize">Danh mục lịch làm việc</span>
    </Link>,
    '/admin/work-schedule-categories',
    <FaBriefcase />
  ),
  getItem(
    <Link to={'/admin/salaries'}>
      <span className="capitalize">Bảng lương</span>
    </Link>,
    '/admin/salaries',
    <FaMoneyCheckAlt />
  ),
  getItem(
    <Link to={'/admin/activity-schedule'}>
      <span className="capitalize">Lịch hoạt động / ngày</span>
    </Link>,
    '/admin/activity-schedule',
    <IoCalendarNumberOutline />
  ),
  {
    type: 'divider'
  },
  getItem(
    <Link to={'/admin/activity-history'}>
      <span className="capitalize">Lịch sử hoạt động</span>
    </Link>,
    '/admin/activity-history',
    <FaHistory />
  )
];

function Sidebar() {
  const location = useLocation();
  const { isSidebarClose, theme, isMobile } = useStore(uiStore);

  const sideStyle: CSSProperties = {};
  if (isMobile) {
    sideStyle.position = 'absolute';
    sideStyle.height = '100%';
    sideStyle.zIndex = 99999;
  }

  return (
    <>
      <Side
        style={{ ...sideStyle }}
        width={256}
        theme={theme}
        breakpoint="md"
        collapsedWidth="0"
        collapsed={isSidebarClose}
        onCollapse={toggleSidebar}
      >
        <div className="flex items-center justify-center p-4">
          <Link to="/admin">
            <Image className="w-full" src={logo} alt="Logo" preview={false} />
          </Link>
        </div>
        <IconContext.Provider value={{ size: '1.25rem' }}>
          <Menu
            theme={theme}
            mode="inline"
            items={items}
            defaultSelectedKeys={['/admin']}
            selectedKeys={[location.pathname]}
          />
        </IconContext.Provider>
      </Side>
    </>
  );
}

export default Sidebar;
