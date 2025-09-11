import ComponentCard from '@components/common/ComponentCard';
import { changeAvatar } from '@services/ProfileService';
import { authStore, updateUserImage } from '@stores/authStore';
import { useMutation } from '@tanstack/react-query';
import { Avatar, Button, message, Typography, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { useState, useCallback } from 'react';
import { FaImage, FaUser } from 'react-icons/fa';

const { Text } = Typography;

interface ChangeAvatarResponse {
  message: string;
  data: {
    id: string;
    photo: string;
  };
}

interface ChangeAvatarProps {
  onSuccess?: () => void;
  showCard?: boolean;
}

export const ChangeAvatar = ({
  onSuccess,
  showCard = true
}: ChangeAvatarProps) => {
  const { user } = authStore.state;
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isCropCancelled, setIsCropCancelled] = useState<boolean>(false);

  const { mutate: updateAvatar, isPending } = useMutation({
    mutationKey: ['changeAvatar'],
    mutationFn: changeAvatar,
    onMutate: () => {
      message.loading({
        content: 'Đang cập nhật ảnh đại diện...',
        key: 'changeAvatar'
      });
    },
    onSuccess: (response: unknown) => {
      const typedResponse = response as ChangeAvatarResponse;
      message.success({
        content: 'Cập nhật ảnh đại diện thành công',
        key: 'changeAvatar',
        duration: 2
      });

      // Update user in store with new avatar URL
      if (user && typedResponse.data?.photo) {
        const baseStorageUrl =
          import.meta.env.VITE_STORAGE_URL ||
          `${import.meta.env.VITE_BASE_API_URL}/storage`;
        const imageUrl = `${baseStorageUrl}/${typedResponse.data.photo}`;
        updateUserImage(imageUrl);
      }

      // Clear preview and file list
      setPreviewImage(null);
      setFileList([]);

      // Call parent onSuccess callback if provided
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Avatar update error:', error);
      message.error({
        content: 'Cập nhật ảnh đại diện thất bại',
        key: 'changeAvatar',
        duration: 2
      });
    }
  });

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/jpg';
    if (!isJpgOrPng) {
      message.error('Chỉ có thể upload file JPG/PNG!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
      return false;
    }

    return true; // Allow upload to proceed to cropping
  };

  const handleChange = useCallback(
    (info: { fileList: UploadFile[] }) => {
      // Check if crop was cancelled
      if (isCropCancelled) {
        setIsCropCancelled(false); // Reset flag
        return; // Don't process the change
      }

      setFileList(info.fileList);

      // Create preview from the latest file
      if (info.fileList.length > 0) {
        const latestFile = info.fileList[info.fileList.length - 1];
        if (latestFile.originFileObj) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviewImage(e.target?.result as string);
          };
          reader.readAsDataURL(latestFile.originFileObj);
        }
      } else {
        setPreviewImage(null);
      }
    },
    [isCropCancelled]
  );

  const handleUpload = () => {
    if (fileList.length > 0 && fileList[0].originFileObj) {
      updateAvatar(fileList[0].originFileObj);
    }
  };

  const handleRemove = () => {
    setPreviewImage(null);
    setFileList([]);
  };

  const currentImageUrl = previewImage || user?.image_url;

  const avatarEditor = (
    <div className="space-y-6 text-center">
      {/* Current Avatar Display */}
      <div className="flex justify-center">
        <div className="relative">
          <Avatar
            src={currentImageUrl}
            alt="Profile"
            size={140}
            icon={<FaUser />}
            className="border-4 border-white shadow-xl"
          />
          {previewImage && (
            <div className="absolute top-2 left-2 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white shadow-md">
              Xem trước
            </div>
          )}
        </div>
      </div>

      {/* Avatar Actions - Facebook Style */}
      <div className="space-y-3">
        <Text className="mb-4 block text-gray-600">
          Cập nhật ảnh đại diện của bạn
        </Text>

        {/* Upload Photo Button - Only show when no preview image */}
        {!previewImage && (
          <ImgCrop
            rotationSlider
            showReset
            aspect={1}
            cropShape="round"
            modalTitle="Cắt ảnh đại diện"
            modalOk="Lưu"
            modalCancel="Hủy"
            resetText="Đặt lại"
            quality={0.9}
            onModalCancel={() => {
              setIsCropCancelled(true);
            }}
            onModalOk={() => {
              setIsCropCancelled(false);
            }}
          >
            <Upload
              accept="image/jpeg,image/png,image/jpg"
              beforeUpload={beforeUpload}
              onChange={handleChange}
              fileList={fileList}
              disabled={isPending}
              showUploadList={false}
              className="block"
              customRequest={({ onSuccess }) => {
                setTimeout(() => {
                  onSuccess?.('ok');
                }, 0);
              }}
            >
              <Button
                size="large"
                type="primary"
                className="flex h-12 w-full items-center justify-center gap-2 text-base font-medium"
                disabled={isPending}
              >
                <FaImage />
                Chọn ảnh
              </Button>
            </Upload>
          </ImgCrop>
        )}

        {/* Action Buttons - Show only when image is selected */}
        {fileList.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex gap-3">
              <Button
                type="primary"
                size="large"
                onClick={handleUpload}
                loading={isPending}
                disabled={fileList.length === 0}
                className="h-12 flex-1 text-base font-medium"
              >
                {isPending ? 'Đang cập nhật...' : 'Lưu ảnh đại diện'}
              </Button>
              <Button
                size="large"
                onClick={handleRemove}
                disabled={isPending}
                className="h-12 px-6"
              >
                Hủy
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return showCard ? (
    <ComponentCard title="Ảnh đại diện">{avatarEditor}</ComponentCard>
  ) : (
    avatarEditor
  );
};
