import { FileType, getBase64 } from '@utils/fileType';
import { Image, Upload, UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import React, { useEffect, useState } from 'react';
import { AiOutlineUpload } from 'react-icons/ai';

interface UploadImageProps extends UploadProps {
  imageList?: () => UploadFile[];
}

export const UploadImage: React.FC<UploadImageProps> = ({
  imageList,
  ...restProps
}) => {
  const [images, setImages] = React.useState<UploadFile[]>(imageList || []);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    const list = imageList?.();
    // console.log('imageList', list);
    if ((list ?? []).length > 0) {
      // console.log('setImages', list);
      setImages(list ?? []);
    }
  }, [setImages, imageList]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setIsPreviewOpen(true);
  };

  const imageProp: UploadProps = {
    ...restProps,
    listType: 'picture-card',
    fileList: images,
    accept: '.jpg,.jpeg,.png',
    maxCount: restProps?.maxCount,
    onChange: (info) => {
      setImages(info.fileList);
      restProps.onChange?.(info);
    },
    onPreview: (file) => {
      handlePreview(file);
      restProps.onPreview?.(file);
    }
  };

  return (
    <>
      <ImgCrop>
        <Upload {...imageProp}>
          {images.length < (restProps?.maxCount || Infinity) && (
            <div>
              <AiOutlineUpload size={24} />
            </div>
          )}
        </Upload>
      </ImgCrop>
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
    </>
  );
};
