import { Link, LinkProps } from '@tanstack/react-router';
import { Button } from 'antd';
import { motion } from 'framer-motion';

import { FaArrowLeft } from 'react-icons/fa6';

const BackButton: React.FC<LinkProps> = ({ ...props }) => {
  return (
    <>
      <Link to={props.to || '..'} className="mb-4 inline-block">
        <motion.div
          whileHover={{ x: -4, scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
          <Button icon={<FaArrowLeft />}>Quay lại</Button>
        </motion.div>
      </Link>
    </>
  );
};

export default BackButton;
