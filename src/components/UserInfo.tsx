import { Route } from '@routes/__root';

export const UserInfo = () => {
  const { authenticated } = Route.useRouteContext();

  const { user } = authenticated;
  return (
    <div className="rounded border border-gray-300 p-4">
      <div>
        <strong>Tên nhân viên: </strong>
        {user?.name}
      </div>
      <div>
        <strong>Mã nhân viên: </strong>
        {user?.id}
      </div>
      <div>
        <strong>Bộ phận: </strong>
        {user?.role.name}
      </div>
    </div>
  );
};
