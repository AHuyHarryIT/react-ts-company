import { Link } from '@tanstack/react-router';
import { Button } from 'antd';

import { FaArrowLeft } from 'react-icons/fa6';

const BackButton = () => {
  return (
    <>
      <Link to="..">
        <Button className="mb-4" icon={<FaArrowLeft />}>
          Quay lại
        </Button>
      </Link>
    </>
  );
};

export default BackButton;
