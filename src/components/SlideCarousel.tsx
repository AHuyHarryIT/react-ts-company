import { ImageType } from '@/types/files/imageType';
import { Carousel, Image } from 'antd';
import React from 'react';

const carouselStyle: React.CSSProperties = {
  // height: '20rem',
  textAlign: 'center',
  alignContent: 'center',
  background: '#364d79'
};

interface SlideCarouselProps {
  images: ImageType[];
}

export const SlideCarousel: React.FC<SlideCarouselProps> = ({ images }) => {
  return (
    <div className="mb-6">
      <Carousel arrows autoplay={{ dotDuration: true }}>
        {images.length === 0 && (
          <div key={'temp-carousel'}>
            <Image
              width={'100%'}
              src="https://placehold.co/500x200/f0f0f0/0016a2/?text=VVP"
              alt={`Slide n`}
              style={{ ...carouselStyle, objectFit: 'fill' }}
              preview={false}
            />
          </div>
        )}
        {images.map((image, index) => (
          <div key={index}>
            <Image
              width={'100%'}
              src={`/storage/${image.path}`}
              alt={`Slide ${index + 1}`}
              style={{ ...carouselStyle, objectFit: 'fill' }}
              preview={false}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};
