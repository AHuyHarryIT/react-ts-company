import { Link, LinkProps } from '@tanstack/react-router';
import { Button } from 'antd';

import { FaArrowLeft } from 'react-icons/fa6';

const BackButton: React.FC<LinkProps> = ({ ...props }) => {
  return (
    <>
      <Link to={props.to || '..'}>
        <Button className="mb-4" icon={<FaArrowLeft />}>
          Quay lại
        </Button>
      </Link>
    </>
  );
};

export default BackButton;
