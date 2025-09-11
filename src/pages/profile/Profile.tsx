import BackButton from '@components/common/BackButton';
import { useAuth } from '@hooks/useAuth';
import { Avatar, Card, Modal } from 'antd';
import { FaUser, FaEdit } from 'react-icons/fa';
import { ChangeAvatar } from './ChangeAvatar';
import { ChangeInfo } from './ChangeInfo';
import { ChangePassword } from './ChangePassword';
import { useState } from 'react';

export const Profile = () => {
  const { user } = useAuth();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const showAvatarModal = () => {
    setIsAvatarModalOpen(true);
  };

  const handleAvatarModalClose = () => {
    setIsAvatarModalOpen(false);
  };

  return (
    <>
      <BackButton to="/" />
      <div className="mb-4 text-center">
        <Card>
          <div className="relative inline-block">
            <Avatar
              src={user?.image_url}
              alt="Profile"
              size={100}
              icon={<FaUser />}
              className="cursor-pointer border-2 border-gray-100 transition-all duration-200 hover:shadow-lg"
              onClick={showAvatarModal}
            />
            <div
              className="absolute -right-1 -bottom-1 cursor-pointer rounded-full border-2 border-white bg-blue-500 p-2 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-blue-600"
              onClick={showAvatarModal}
              title="Chỉnh sửa ảnh đại diện"
            >
              <FaEdit size={12} />
            </div>
          </div>
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

      {/* Avatar Edit Modal */}
      <Modal
        title="Cập nhật ảnh đại diện"
        open={isAvatarModalOpen}
        onCancel={handleAvatarModalClose}
        footer={null}
        width={480}
        centered
        className="avatar-edit-modal"
      >
        <ChangeAvatar onSuccess={handleAvatarModalClose} showCard={false} />
      </Modal>
    </>
  );
};
