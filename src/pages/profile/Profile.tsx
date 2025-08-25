import BackButton from '@components/common/BackButton';
import { ChangePassword } from './ChangePassword';
import { ChangeInfo } from './ChangeInfo';
import { Avatar, Card } from 'antd';
import { useAuth } from '@hooks/useAuth';
import { convertImageName2Url } from '@utils/convertImageName2Url';

export const Profile = () => {
  const { user } = useAuth();
  return (
    <>
      <BackButton to="/" />
      <div className="mb-4 text-center">
        <Card>
          <Avatar
            src={convertImageName2Url(user?.image_url || '')}
            alt="Profile"
            size={100}
          />
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
