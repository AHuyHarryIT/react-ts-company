import { ProductType } from '@/types/productType';
import { Shift } from '@/types/shift';
import { IconPrint } from '@components/icons';
import { PrintBagStamp } from '@components/print/PrintBagStamp';
import { PrintBoxStamp } from '@components/print/PrintBoxStamp';
import { Button, Modal } from 'antd';
import React, { useState } from 'react';
import type { Dayjs } from 'dayjs';
import { EmployeeType } from '@/types/employeeType';

interface PrintStampBoxModalProps {
  product: ProductType;
  startStamp: string | number;
  totalStamp: number;
  shift: Shift;
  date: Dayjs;
  type: 'box' | 'bag' | 'Tem Thùng' | 'Tem Bịch';
  employee_id: EmployeeType['id'];
  stamp_id: string;
}

export const PrintStampModal: React.FC<PrintStampBoxModalProps> = ({
  product,
  startStamp,
  totalStamp,
  shift,
  date,
  type,
  employee_id,
  stamp_id
}) => {
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="solid"
        color="blue"
        icon={<IconPrint />}
        children="IN"
        onClick={showModal}
      />
      <Modal
        title="Xem trước khi in"
        width={1000}
        open={open}
        onCancel={handleCancel}
        footer={null}
      >
        {(type === 'box' || type === 'Tem Thùng') && (
          <PrintBoxStamp
            product={product}
            startStamp={startStamp}
            totalStamp={totalStamp}
            shift={shift}
            date={date}
            employee_id={employee_id}
            stamp_id={stamp_id}
          />
        )}
        {(type === 'bag' || type === 'Tem Bịch') && (
          <PrintBagStamp
            product={product}
            startStamp={startStamp}
            totalStamp={totalStamp}
            shift={shift}
            date={date}
            employee_id={employee_id}
            stamp_id={stamp_id}
          />
        )}
      </Modal>
    </>
  );
};
