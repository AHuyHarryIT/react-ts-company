import { Link, useLocation } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import type { MenuProps } from 'antd';
import { Drawer, Image, Layout, Menu } from 'antd';

import { toggleSidebar, uiStore } from '@stores/uiStore';

import { IconContext } from 'react-icons';
import { BsCalendar2Check } from 'react-icons/bs';
// import { BsCalendar2Week } from 'react-icons/bs';
import { CiBoxes } from 'react-icons/ci';
import { FaMoneyCheckAlt, FaRegCalendarAlt } from 'react-icons/fa';
import { FaBriefcase, FaEnvelopesBulk, FaPrint } from 'react-icons/fa6';
import { FiUsers } from 'react-icons/fi';
import { IoCalendarNumberOutline, IoHomeOutline } from 'react-icons/io5';

import logo from '@assets/images/logo/logoAsset.svg';
import { useAuth } from '@hooks/useAuth';
import { isAdmin } from '@utils/authUtil';
import { IconHistory } from '@components/icons';

const { Sider: Side } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const adminItems: MenuItem[] = [
  {
    key: '/admin',
    label: (
      <Link to={'/admin'}>
        <span className="capitalize">Trang chủ</span>
      </Link>
    ),
    icon: <IoHomeOutline />
  },
  // {
  //   key: '/admin/about',
  //   label: (
  //     <Link to={'/admin/about'}>
  //       <span className="capitalize">about</span>
  //     </Link>
  //   ),
  //   icon: <AiOutlineHome />
  // },
  {
    key: 'HR',
    label: <span className="capitalize">Nhân sự</span>,
    icon: <FiUsers />,
    children: [
      {
        key: '/admin/employees',
        label: (
          <Link to={'/admin/employees'}>
            <span className="capitalize">Nhân viên</span>
          </Link>
        )
      },
      {
        key: '/admin/roles',
        label: (
          <Link to={'/admin/roles'}>
            <span className="capitalize">Chức vụ</span>
          </Link>
        )
      }
    ]
  },
  {
    key: '/admin/products',
    label: (
      <Link to={'/admin/products'}>
        <span className="capitalize">Sản Phẩm</span>
      </Link>
    ),
    icon: <CiBoxes />
  },
  // {
  //   key: '/admin/plans',
  //   label: <span className="capitalize">Kế hoạch</span>,
  //   icon: <BsCalendar2Week />,
  //   children: [
  //     {
  //       key: '/admin/plans/production',
  //       label: (
  //         <Link to={'/admin/plans/production'}>
  //           <span className="capitalize">Kế hoạch sản xuất</span>
  //         </Link>
  //       )
  //     },
  //     {
  //       key: '/admin/plans/material',
  //       label: (
  //         <Link to={'/admin/plans/material'}>
  //           <span className="capitalize">Kế hoạch nguyên liệu</span>
  //         </Link>
  //       )
  //     }
  //   ]
  // },
  {
    key: 'stamp',
    label: <span className="capitalize">Tạo Tem</span>,
    icon: <FaPrint />,
    children: [
      {
        key: '/admin/stamps/box',
        label: (
          <Link to={'/admin/stamps/box'}>
            <span className="capitalize">Tem Thùng</span>
          </Link>
        )
      },
      {
        key: '/admin/stamps/bag',
        label: (
          <Link to={'/admin/stamps/bag'}>
            <span className="capitalize">Tem Bịch</span>
          </Link>
        )
      },
      {
        key: '/admin/stamps/history',
        label: (
          <Link to={'/admin/stamps/history'}>
            <span className="capitalize">Lịch Sử In Tem</span>
          </Link>
        )
      }
    ]
  },
  {
    key: 'attendance',
    label: <span className="capitalize">Chấm Công</span>,
    icon: <BsCalendar2Check />,
    children: [
      {
        key: '/admin/attendances/history',
        label: (
          <Link to={'/admin/attendances/history'}>
            <span className="capitalize">Lịch Sử Chấm Công</span>
          </Link>
        )
      },
      {
        key: '/admin/attendances/record',
        label: (
          <Link to={'/admin/attendances/record'}>
            <span className="capitalize">Bảng Tính Công</span>
          </Link>
        )
      }
    ]
  },
  // {
  //   key: '/admin/check-po',
  //   label: (
  //     <Link to={'/admin/check-po'}>
  //       <span className="capitalize">Kiểm tra PO</span>
  //     </Link>
  //   ),
  //   icon: <IoCheckboxOutline />
  // },
  {
    key: '/admin/work-schedules',
    label: (
      <Link to={'/admin/work-schedules'}>
        <span className="capitalize">Lịch làm việc</span>
      </Link>
    ),
    icon: <FaRegCalendarAlt />
  },
  {
    key: '/admin/work-schedule-categories',
    label: (
      <Link to={'/admin/work-schedule-categories'}>
        <span className="capitalize">Danh mục lịch làm việc</span>
      </Link>
    ),
    icon: <FaBriefcase />
  },
  {
    key: '/admin/salaries',
    label: (
      <Link to={'/admin/salaries'}>
        <span className="capitalize">Bảng lương</span>
      </Link>
    ),
    icon: <FaMoneyCheckAlt />
  },
  {
    key: '/admin/activity-schedule',
    label: (
      <Link to={'/admin/activity-schedule'}>
        <span className="capitalize">Lịch hoạt động / ngày</span>
      </Link>
    ),
    icon: <IoCalendarNumberOutline />
  },
  {
    type: 'divider'
  }
  // {
  //   key: '/admin/activity-history',
  //   label: (
  //     <Link to={'/admin/activity-history'}>
  //       <span className="capitalize">Lịch sử hoạt động</span>
  //     </Link>
  //   ),
  //   icon: <FaHistory />
  // }
];

const employeeItems: MenuItem[] = [
  {
    key: '/employee',
    label: (
      <Link to={'/employee'}>
        <span className="capitalize">Trang chủ</span>
      </Link>
    ),
    icon: <IoHomeOutline />
  },
  {
    key: '/employee/schedules',
    label: (
      <Link to={'/employee/schedules'}>
        <span className="capitalize">Lịch làm việc</span>
      </Link>
    ),
    icon: <FaRegCalendarAlt />
  },
  {
    key: '/employee/salaries',
    label: (
      <Link to={'/employee/salaries'}>
        <span className="capitalize">Bảng lương</span>
      </Link>
    ),
    icon: <FaMoneyCheckAlt />
  },
  {
    key: 'employee/attendance',
    label: <span className="capitalize">Chấm Công</span>,
    icon: <BsCalendar2Check />,
    children: [
      {
        key: '/employee/attendances/history',
        label: (
          <Link to={'/employee/attendances/history'}>
            <span className="capitalize">Lịch Sử Chấm Công</span>
          </Link>
        )
      },
      {
        key: '/employee/attendances/calculate',
        label: (
          <Link to={'/employee/attendances/calculate'}>
            <span className="capitalize">Bảng Tính Công</span>
          </Link>
        )
      }
    ]
  },
  {
    key: '/employee/todo/add-product',
    label: (
      <Link to={'/employee/todo/add-product'}>
        <span className="capitalize">Chọn sản phẩm</span>
      </Link>
    ),
    icon: <CiBoxes />
  },
  {
    key: '/employee/activity-schedule',
    label: (
      <Link to={'/employee/activity-schedule'}>
        <span className="capitalize">Lịch sử hoạt động</span>
      </Link>
    ),
    icon: <IconHistory />
  },
  {
    key: '/employee/stamps/request',
    label: (
      <Link to={'/employee/stamps/request'}>
        <span className="capitalize">Yêu Cầu In Tem</span>
      </Link>
    ),
    icon: <FaEnvelopesBulk />
  }
];

function Sidebar() {
  const { pathname } = useLocation();
  const { isSidebarClose, theme, isMobile } = useStore(uiStore);
  const { user } = useAuth();
  const admin = isAdmin(user?.role?.name || '');

  const sidebarStyle: React.CSSProperties = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'none'
  };

  return (
    <>
      {isMobile ? (
        <Drawer
          closable={false}
          width={256}
          placement="left"
          onClose={toggleSidebar}
          open={!isSidebarClose}
        >
          <div className="flex items-center justify-center p-4">
            <Link
              to="/"
              onClick={() => {
                if (isMobile) {
                  toggleSidebar();
                }
              }}
            >
              <Image className="w-full" src={logo} alt="Logo" preview={false} />
            </Link>
          </div>

          <IconContext.Provider value={{ size: '1.25rem' }}>
            <Menu
              theme={theme}
              mode="inline"
              items={admin ? adminItems : employeeItems}
              defaultSelectedKeys={['/admin']}
              selectedKeys={[pathname]}
              onClick={() => {
                if (isMobile) {
                  toggleSidebar();
                }
              }}
            />
          </IconContext.Provider>
        </Drawer>
      ) : (
        <Side
          style={{ ...sidebarStyle }}
          width={256}
          theme={theme}
          trigger={null}
          breakpoint="md"
          collapsible
          collapsed={isSidebarClose}
          onCollapse={toggleSidebar}
        >
          <div className="flex items-center justify-center p-4">
            <Link
              to="/"
              onClick={() => {
                if (isMobile) {
                  toggleSidebar();
                }
              }}
            >
              <Image className="w-full" src={logo} alt="Logo" preview={false} />
            </Link>
          </div>
          <IconContext.Provider value={{ size: '1.25rem' }}>
            <Menu
              theme={theme}
              mode="inline"
              items={admin ? adminItems : employeeItems}
              defaultSelectedKeys={['/admin']}
              selectedKeys={[pathname]}
              onClick={() => {
                if (isMobile) {
                  toggleSidebar();
                }
              }}
            />
          </IconContext.Provider>
        </Side>
      )}
    </>
  );
}

export default Sidebar;
