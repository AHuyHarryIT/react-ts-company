import { createRouter, RouterProvider } from '@tanstack/react-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import NotFound from '@pages/NotFound';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    user: null,
    authenticated: undefined!,
  },
  defaultNotFoundComponent: () => {
    return <NotFound />;
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const authenticated = localStorage.getItem('isAuthenticated') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <>
      <RouterProvider router={router} context={{ user, authenticated }} />
    </>
  );
}

export default App;

// import { useMemo } from 'react';
// import { useSelector } from 'react-redux';
// // import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import { RootState } from './stores';

// import AuthRedirect from '@components/AuthRedirect';
// import ProtectedRoute from '@components/ProtectedRoute';
// import RoleProtectedRoute from '@components/RoleProtectedRoute';
// import AppLayout from '@layouts/AppLayout';
// import AuthLayout from '@layouts/AuthLayout';
// import { PageLayout } from '@layouts/PageLayout';
// import Login from '@pages/auth/Login';
// import Blank from '@pages/Blank';
// import Dashboard from '@pages/Dashboard';
// import Employees from '@pages/Employees';
// import { AddEmployee } from '@pages/Employees/Add';
// import NotFound from '@pages/NotFound';
// import { Roles } from '@pages/Roles';
// import { WorkScheduleCategories } from '@pages/WorkScheduleCategories';
// import { WorkSchedules } from '@pages/WorkSchedules';
// import { SalaryTable } from '@pages/Salaries';

// function App() {
//   const { themeMode } = useSelector((state: RootState) => state.theme);

//   useMemo(() => {
//     document.documentElement.classList.toggle('dark', themeMode === 'dark');
//     document.documentElement.setAttribute('data-theme', themeMode);
//   }, [themeMode]);

//   return (
//     <>
//       <BrowserRouter>
//         <Routes>
//           {/* public routes */}
//           <Route element={<AuthRedirect />}>
//             <Route element={<AuthLayout />}>
//               <Route path="/login" element={<Login />} />
//             </Route>
//           </Route>

//           {/* private routes */}
//           <Route path="/" element={<AppLayout />}>
//             <Route element={<ProtectedRoute />}>
//               <Route index element={<Dashboard />} />
//               <Route path="about" element={<>About</>} />
//             </Route>
//             <Route
//               path="admin"
//               element={<RoleProtectedRoute allowedRoles={['admin']} />}
//             >
//               <Route
//                 path="employees"
//                 element={<PageLayout title="Nhân viên" metaTitle="Nhân viên" />}
//               >
//                 <Route index element={<Employees />} />
//                 <Route path="add" element={<AddEmployee />} />
//                 <Route path="view/:id" element={<>View emp</>} />
//                 <Route path="edit/:id" element={<>Edit emp</>} />
//               </Route>

//               <Route
//                 path="roles"
//                 element={<PageLayout title="Chức vụ" metaTitle="Chức vụ" />}
//               >
//                 <Route index element={<Roles />} />
//               </Route>

//               <Route
//                 path="products"
//                 element={<PageLayout title="Sản phẩm" metaTitle="Sản phẩm" />}
//               >
//                 <Route index element={<>Products</>} />
//               </Route>

//               {/* Plans */}
//               <Route path="plans">
//                 <Route
//                   path="production"
//                   element={
//                     <PageLayout
//                       title="Kế hoạch sản xuất"
//                       metaTitle="Kế hoạch sản xuất"
//                     />
//                   }
//                 >
//                   <Route index element={<>Plan production</>} />
//                 </Route>

//                 <Route
//                   path="material"
//                   element={
//                     <PageLayout
//                       title="Kế hoạch nguyên liệu"
//                       metaTitle="Kế hoạch nguyên liệu"
//                     />
//                   }
//                 >
//                   <Route index element={<>Plan material</>} />
//                 </Route>
//               </Route>

//               {/* Stamps */}
//               <Route path="stamps">
//                 <Route
//                   path="box"
//                   element={
//                     <PageLayout
//                       title="Tao tem thùng"
//                       metaTitle="Tao tem thùng"
//                     />
//                   }
//                 >
//                   <Route index element={<>Box stamp</>} />
//                 </Route>

//                 <Route
//                   path="bag"
//                   element={
//                     <PageLayout title="Tao tem bịch" metaTitle="Tao tem bịch" />
//                   }
//                 >
//                   <Route index element={<>Bag stamp</>} />
//                 </Route>

//                 <Route
//                   path="history"
//                   element={
//                     <PageLayout
//                       title="Lịch sử in tem"
//                       metaTitle="Lịch sử in tem"
//                     />
//                   }
//                 >
//                   <Route index element={<>Stamp history</>} />
//                 </Route>
//                 <Route
//                   path="request"
//                   element={
//                     <PageLayout
//                       title="Yêu cầu in tem"
//                       metaTitle="Yêu cầu in tem"
//                     />
//                   }
//                 >
//                   <Route index element={<>Request stamp</>} />
//                 </Route>
//               </Route>

//               {/* Attendance */}
//               <Route path="attendances">
//                 <Route
//                   path="history"
//                   element={
//                     <PageLayout
//                       title="Lịch sử chấm công"
//                       metaTitle="Lịch sử chấm công"
//                     />
//                   }
//                 >
//                   <Route index element={<>Attendance history</>} />
//                 </Route>

//                 <Route
//                   path="sheet"
//                   element={
//                     <PageLayout
//                       title="Bảng tính công"
//                       metaTitle="Bảng tính công"
//                     />
//                   }
//                 >
//                   <Route index element={<>Attendance sheet</>} />
//                 </Route>
//               </Route>

//               {/* Check PO */}
//               <Route
//                 path="check-po"
//                 element={
//                   <PageLayout title="Kiểm tra PO" metaTitle="Kiểm tra PO" />
//                 }
//               >
//                 <Route index element={<>Check PO</>} />
//               </Route>

//               {/* Work schedule */}
//               <Route
//                 path="work-schedule"
//                 element={
//                   <PageLayout title="Lịch làm việc" metaTitle="Lịch làm việc" />
//                 }
//               >
//                 <Route index element={<WorkSchedules />} />
//                 <Route path="detail/:id" element={<>Detail</>} />
//               </Route>

//               {/* Work schedule categories */}
//               <Route
//                 path="work-schedule-categories"
//                 element={
//                   <PageLayout
//                     title="Danh mục lịch làm việc"
//                     metaTitle="Danh mục lịch làm việc"
//                   />
//                 }
//               >
//                 <Route index element={<WorkScheduleCategories />} />
//               </Route>

//               {/* Salary */}
//               <Route
//                 path="salary"
//                 element={
//                   <PageLayout title="Bảng lương" metaTitle="Bảng lương" />
//                 }
//               >
//                 <Route index element={<SalaryTable />} />
//               </Route>

//               {/* Schedule */}
//               <Route
//                 path="activity-schedule"
//                 element={
//                   <PageLayout
//                     title="Lịch hoạt động / ngày"
//                     metaTitle="Lịch hoạt động / ngày"
//                   />
//                 }
//               >
//                 <Route index element={<>Activity schedule</>} />
//               </Route>

//               {/* Activity history */}
//               <Route
//                 path="activity-history"
//                 element={
//                   <PageLayout
//                     title="Lịch sử hoạt động"
//                     metaTitle="Lịch sử hoạt động"
//                   />
//                 }
//               >
//                 <Route index element={<>Activity history</>} />
//               </Route>
//             </Route>

//             <Route path="blank" element={<Blank />} />
//             <Route
//               path="unauthorized"
//               element={
//                 <>
//                   <h1>Unauthorized</h1>
//                 </>
//               }
//             />
//           </Route>

//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>
//     </>
//   );
// }

// export default App;
