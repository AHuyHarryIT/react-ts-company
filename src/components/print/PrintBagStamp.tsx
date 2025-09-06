import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, message } from 'antd';
import type { Dayjs } from 'dayjs';
import { useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import { ProductType } from '@/types/productType';
import { Shift } from '@/types/shift';
import { saveStamp } from '@services/StampService';
import { EmployeeType } from '@/types/employeeType';
import { useStampNotification } from '@hooks/useStampNotification';
import { usePrintShortcut } from '@hooks/usePrintShortcut';

interface PrintBagStampProps {
  product: ProductType;
  startStamp: string | number;
  totalStamp: number;
  date: Dayjs;
  shift: Shift;
  employee_id?: EmployeeType['id'];
  stamp_id?: string;
}

export const PrintBagStamp = ({
  product,
  startStamp,
  totalStamp,
  date,
  shift,
  employee_id,
  stamp_id
}: PrintBagStampProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: contentRef });
  const stampList = (startStamp as string).split(',');
  const queryClient = useQueryClient();
  const { handleRemoveNotification } = useStampNotification();

  const { mutate } = useMutation({
    mutationKey: ['savePrintLog'],
    mutationFn: saveStamp,
    onSuccess: () => {
      message.success('In thành công');
      queryClient.invalidateQueries();
      if (stamp_id) handleRemoveNotification(stamp_id);
    },
    onError: () => {
      console.error('Error saving print log');
      message.error('Lỗi khi lưu nhật ký in');
    }
  });

  const handleSavePrintLog = useCallback(() => {
    handlePrint();
    mutate({
      productId: product.id,
      date: date.format('YYYY-MM-DD'),
      shift,
      binCount: totalStamp,
      binStart: stampList.slice(0, totalStamp).join(','),
      type: 'bag',
      employee_id: employee_id,
      stamp_id: stamp_id
    });
  }, [
    handlePrint,
    mutate,
    product.id,
    date,
    shift,
    totalStamp,
    stampList,
    employee_id,
    stamp_id
  ]);

  // Use the custom hook for print shortcut
  usePrintShortcut(handleSavePrintLog);

  return (
    <>
      <style>
        {`
          .bag-print-container td {
            border: 1px solid #232d42 !important;
            padding: 2px !important;
          }
          .bag-print-container table {
            border-collapse: collapse !important;
          }
          @media print {
            .bag-print-container {
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
            }
            @page {
              size: A4 portrait !important;
              margin: 0 !important;
            }
          }
        `}
      </style>
      <div className="mb-4">
        <Button color="default" variant="solid" onClick={handleSavePrintLog}>
          Print
        </Button>
      </div>
      <div
        ref={contentRef}
        className="bag-print-container print:m-0 print:p-0 print:shadow-none"
      >
        {product &&
          Array.from(
            {
              length:
                stampList.length > 1
                  ? stampList.slice(0, totalStamp).length
                  : totalStamp
            },
            () => product
          )
            .reduce(
              (
                pages: { item: ProductType; index: number }[][],
                item,
                index
              ) => {
                const pageIndex = Math.floor(index / 8);
                if (!pages[pageIndex]) {
                  pages[pageIndex] = [];
                }
                pages[pageIndex].push({ item, index });
                return pages;
              },
              []
            )
            .map((page, pageIndex) => (
              <div
                key={`page-${pageIndex}`}
                className="print-grid print:page-break-after-always mr-2 grid grid-cols-2 grid-rows-4 gap-4 not-print:mb-8 not-print:max-w-7xl not-print:grid-cols-1 not-print:border not-print:border-green-400 not-print:p-4 not-print:lg:grid-cols-2 print:min-h-screen"
              >
                {page.map(({ item, index }) => (
                  <div
                    key={`${index}-${item.code}`}
                    className="stamp-item w-auto break-inside-avoid-page not-print:flex not-print:justify-center"
                  >
                    <table className="text-center">
                      <colgroup>
                        <col className="w-[80px]" />
                        <col className="w-[120px]" />
                        <col className="w-[120px]" />
                        <col className="w-[120px]" />
                        <col className="w-[120px]" />
                      </colgroup>
                      <tbody>
                        <tr>
                          <td className="text-start text-[7.2px]">
                            Tên sản phẩm
                            <br />
                            品名
                          </td>
                          <td colSpan={2} className="text-sm font-bold">
                            {item.name}
                          </td>
                          <td>CODE</td>
                          <td className="text-sm font-bold">{item.code}</td>
                        </tr>
                        <tr>
                          <td className="text-start text-[7.2px]">
                            Nguyên liệu
                            <br />
                            原材料
                          </td>
                          <td colSpan={2} className="text-sm">
                            {product.material}
                          </td>
                          <td className="text-[7.2px]">
                            Màu sắc
                            <br />色
                          </td>
                          <td className="text-sm">{product.color}</td>
                        </tr>
                        <tr>
                          <td className="text-start text-[7.2px]">
                            Số lượng
                            <br />
                            数量
                          </td>
                          <td colSpan={4} className="text-sm font-bold">
                            {item.quantity_per_package} PCS
                          </td>
                        </tr>
                        <tr>
                          <td className="text-start text-[7.2px]">
                            Lotno
                            <br />
                            ロット No
                          </td>
                          <td colSpan={4} className="text-sm font-bold">
                            <div className="mx-6 flex items-center justify-between">
                              <p>A</p>
                              <p>-</p>
                              <p>{date.format('DDMMYYYY')}</p>
                              <p>-</p>
                              <p>{shift}</p>
                              <p>-</p>
                              <p>
                                {(stampList.length > 1
                                  ? stampList[index]
                                  : index + parseInt(startStamp as string)
                                )
                                  .toString()
                                  .padStart(3, '0')}
                              </p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-start text-[7.2px]">
                            Kiểm tra
                            <br />
                            検査
                          </td>
                          <td colSpan={2} className="text-[7.2px]">
                            Kiểm tra 100%
                            <br />
                            檢查(100%)
                          </td>
                          <td colSpan={2} className="text-[7.2px]">
                            Kiểm tra 200%
                            <br />
                            檢查(200%)
                          </td>
                        </tr>
                        <tr className="h-18">
                          <td className="text-start text-[7.2px]">
                            Mộc
                            <br />
                            合格印
                          </td>
                          <td colSpan={2}></td>
                          <td colSpan={2}></td>
                        </tr>
                        <tr>
                          <td className="text-start text-[7.2px]">
                            Người kiểm
                            <br />
                            検査
                          </td>
                          <td colSpan={2}></td>
                          <td colSpan={2}></td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-center text-[7.2px]">
                            Thời gian 時間
                          </td>
                          <td colSpan={2} className="text-[7.2px]">
                            {date.format('DD/MM/YYYY')}{' '}
                            {shift == 1 ? '07:30' : '19:30'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ))}
      </div>
    </>
  );
};
