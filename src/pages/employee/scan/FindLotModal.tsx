import { fetchStorage, StorageParams } from '@services/ScanService';
import { useMutation } from '@tanstack/react-query';
import { Button, Form, FormProps, Input, Modal, Select, Tag } from 'antd';
import React, { useState } from 'react';

interface FindLotModalProps {
  productOptions?: { label: string; value: string }[];
}

interface FormType {
  lot_product_id: string;
  lot: string;
}

export const FindLotModal: React.FC<FindLotModalProps> = ({
  productOptions
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const { data, mutate, isPending } = useMutation({
    mutationKey: ['storage'],
    mutationFn: async (params: StorageParams) => {
      const response = await fetchStorage(params);
      return response;
    }
  });

  const missingData = data?.lotModalData;
  const rate =
    (missingData?.expected ?? 0) > 0
      ? ((missingData?.actual ?? 0) / (missingData?.expected ?? 1)) * 100
      : 0;

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const formProps: FormProps = {
    layout: 'vertical',

    onFinish: (values) => {
      mutate({ ...values });
    }
  };

  return (
    <>
      <Button onClick={handleOpen} variant="solid" color="blue">
        Tìm thùng bị sót
      </Button>

      <Modal
        title="Tìm thùng bị sót"
        open={open}
        onCancel={handleClose}
        footer={null}
        loading={isPending}
        width={800}
      >
        <div className="space-y-6">
          <Form<FormType> {...formProps}>
            <Form.Item<FormType>
              name="lot_product_id"
              label="Sản phẩm"
              rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
            >
              <Select
                placeholder="Chọn sản phẩm để kiểm LOT"
                options={productOptions}
                allowClear
                showSearch
              />
            </Form.Item>
            <Form.Item<FormType>
              name="lot"
              label="Mã LOT"
              rules={[{ required: true, message: 'Vui lòng nhập mã LOT' }]}
            >
              <Input placeholder="VD: 05062025-2-013" allowClear />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Tìm kiếm
              </Button>
            </Form.Item>
          </Form>
          {missingData && (
            <>
              <div className="grid grid-cols-1 border border-gray-300 p-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="uppercase">Thông tin LOT</div>
                  <div>
                    Mã Lot:{' '}
                    <span className="font-semibold text-red-600">
                      {missingData?.code}
                    </span>
                  </div>
                  <div>
                    Sản phẩm: <span>{missingData?.product}</span>
                  </div>
                  <div>
                    Ngày sản xuất: <span>{missingData?.date}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="uppercase">Thống kê</div>
                  <div>
                    Yêu cầu:{' '}
                    <Tag color="blue-inverse">
                      {missingData?.expected} THÙNG
                    </Tag>
                  </div>
                  <div>
                    Đã nhập:{' '}
                    <Tag color="cyan-inverse">{missingData?.actual} THÙNG</Tag>
                  </div>
                  <div>
                    Tỷ lệ:{' '}
                    <Tag color={rate == 100 ? 'green-inverse' : 'gold-inverse'}>
                      {rate.toFixed(0)}%
                    </Tag>
                  </div>
                </div>
              </div>
              {rate == 100 ? (
                <div className="rounded-lg bg-green-400 p-4">
                  <strong>Hoàn thành</strong>
                  <div>đã nhập đủ số lượng thùng yêu cầu</div>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg bg-amber-400 p-4">
                  <div className="font-bold">
                    Còn thiếu {missingData?.missing} thùng
                  </div>
                  <div className="font-bold">Danh sách thùng còn thiếu:</div>
                  <ul className="flex flex-wrap gap-2">
                    {missingData?.missingLots.map((lot, index) => (
                      <li key={index}>
                        <Tag>
                          <strong>{lot}</strong>
                        </Tag>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
