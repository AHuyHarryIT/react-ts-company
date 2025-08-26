import BackButton from '@components/common/BackButton';
import { useAuth } from '@hooks/useAuth';
import { Avatar, Card } from 'antd';
import { ChangeInfo } from './ChangeInfo';
import { ChangePassword } from './ChangePassword';

export const Profile = () => {
  const { user } = useAuth();
  return (
    <>
      <BackButton to="/" />
      <div className="mb-4 text-center">
        <Card>
          <Avatar src={user?.image_url} alt="Profile" size={100} />
          <div>
            <span className="text-lg font-semibold">{user?.name}</span>-{' '}
            <span>{user?.id}</span>
          </div>
          <div>
            <span className="font-semibold">Chức vụ: </span>
            <span>{user?.role.name}</span>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChangeInfo />
        <ChangePassword />
      </div>
    </>
  );
};
