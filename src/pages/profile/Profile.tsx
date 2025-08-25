import BackButton from '@components/common/BackButton';
import { ChangePassword } from './ChangePassword';
import { ChangeInfo } from './ChangeInfo';
import { Avatar, Card } from 'antd';

export const Profile = () => {
  return (
    <>
      <BackButton to="/" />
      <div className="mb-4 text-center">
        <Card>
          <Avatar
            src={'https://placehold.co/100x100'}
            alt="Profile"
            size={100}
          />
          <div>
            <span className="text-lg font-semibold">{'Nguyễn Văn A'}</span>-{' '}
            <span>{'emp code'}</span>
          </div>
          <div>
            <span className="font-semibold">Chức vụ: </span>
            <span>{'Quản lý'}</span>
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
