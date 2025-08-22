import { ImageType } from '@/types/files/imageType';
import ComponentCard from '@components/common/ComponentCard';
import { SlideCarousel } from '@components/SlideCarousel';
import { deleteImage, fetchImages, uploadImage } from '@services/UploadService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileType, getBase64 } from '@utils/fileType';
import { Image, message, Spin, Upload, UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import React, { useEffect, useState } from 'react';
import { AiOutlineUpload } from 'react-icons/ai';

export const SlideShow = () => {
  const [images, setImages] = React.useState<UploadFile[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setIsPreviewOpen(true);
  };

  const queryClient = useQueryClient();

  const { mutate: upload } = useMutation({
    mutationKey: ['uploadImage'],
    mutationFn: (formData: FormData) => uploadImage(formData),
    onMutate: () => {
      message.loading({
        content: 'Đang tải lên...',
        key: 'upload'
      });
    },
    onError: () => {
      message.error({
        content: 'Tải lên thất bại',
        key: 'upload'
      });
    },
    onSuccess: () => {
      message.success({
        content: 'Tải lên thành công',
        key: 'upload'
      });
      queryClient.invalidateQueries();
    }
  });

  const { mutate: deleteImg } = useMutation({
    mutationKey: ['deleteImage'],
    mutationFn: (id: string) => deleteImage(id),
    onMutate: () => {
      message.loading({
        content: 'Đang xóa...',
        key: 'delete'
      });
    },
    onError: () => {
      message.error({
        content: 'Xóa thất bại',
        key: 'delete'
      });
      queryClient.invalidateQueries();
    },
    onSuccess: () => {
      message.success({
        content: 'Xóa thành công',
        key: 'delete'
      });
      queryClient.invalidateQueries();
    }
  });

  const uploadProp: UploadProps = {
    listType: 'picture-card',
    fileList: images,
    accept: '.jpg,.jpeg,.png',
    customRequest: ({ file, onSuccess, onError }) => {
      const formData = new FormData();
      formData.append('image', file as File);
      upload(formData);
      if (onError) {
        onError(new Error('Upload failed'));
      }
      if (onSuccess) {
        onSuccess(file);
      }
    },
    onRemove: (file) => {
      deleteImg(file.uid);
    },
    onDownload: (file) => {
      console.log('Downloading file:', file);
      // Implement download logic here
    },
    onChange: (info) => {
      setImages(info.fileList);
    },
    onPreview: (file) => {
      handlePreview(file);
    },
    type: 'drag'
  };

  const { data: imageList, isLoading } = useQuery({
    queryKey: ['images'],
    queryFn: () =>
      fetchImages({
        limit: 0
      })
  });

  useEffect(() => {
    if (imageList?.data) {
      setImages(
        imageList.data.map((item: ImageType) => ({
          uid: item.id,
          name: item.title || `image-${item.id}`,
          status: 'done',
          url: `/storage/${item.path}` // replace 'path' with the correct property for image URL in your ImageType
        }))
      );
    }
  }, [imageList]);
  return (
    <ComponentCard title="Chỉnh sửa Slide show">
      <SlideCarousel images={imageList?.data || []} />
      <Spin spinning={isLoading}>
        <ImgCrop aspect={5 / 2}>
          <Upload {...uploadProp}>
            <div className="py-5">
              <div className="flex justify-center">
                <AiOutlineUpload size={24} />
              </div>
              <p>Nhấn hoặc kéo ảnh vào khu vực này để tải lên</p>
            </div>
          </Upload>
        </ImgCrop>
      </Spin>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: isPreviewOpen,
            onVisibleChange: (visible) => setIsPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage('')
          }}
          src={previewImage}
        />
      )}
    </ComponentCard>
  );
};
