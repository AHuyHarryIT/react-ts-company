import { useCallback, useEffect, useRef } from 'react';
import { Button, message } from 'antd';
import { useReactToPrint } from 'react-to-print';
import { useMutation } from '@tanstack/react-query';

import { ProductType } from '@/types/productType';
import { saveStamp } from '@services/StampService';
import { Shift } from '@/types/shift';

import '@assets/css/print-bag.css';

interface PrintBagStampProps {
  product: ProductType;
  startStamp: string | number;
  totalStamp: number;
  date: string;
  shift: Shift;
}

export const PrintBagStamp = ({
  product,
  startStamp,
  totalStamp,
  date,
  shift
}: PrintBagStampProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: contentRef });

  const stampList = (startStamp as string).split(',');

  const { mutate } = useMutation({
    mutationKey: ['savePrintLog'],
    mutationFn: saveStamp,
    onSuccess: () => {
      message.success('Print log saved successfully');
    },
    onError: () => {
      console.error('Error saving print log');
      message.error('Error saving print log');
    }
  });

  const handleSavePrintLog = useCallback(() => {
    handlePrint();
    mutate({
      productId: product.id,
      date: date.split('/').reverse().join('-'),
      shift,
      binCount: totalStamp,
      binStart: stampList.slice(0, totalStamp).join(','),
      type: 'bag'
    });
  }, [stampList, date, handlePrint, mutate, product, shift, totalStamp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key == 'p') {
        e.preventDefault();
        handleSavePrintLog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSavePrintLog]);

  return (
    <>
      <Button
        color="default"
        variant="solid"
        size="large"
        onClick={handleSavePrintLog}
      >
        Print
      </Button>
      <div ref={contentRef} className="print:m-0 print:p-0 print:shadow-none">
        <div className="grid grid-cols-2 grid-rows-3 gap-6 not-print:max-w-7xl not-print:grid-cols-1 not-print:border not-print:border-green-400 not-print:p-4 not-print:lg:grid-cols-2">
          {product &&
            Array.from(
              {
                length:
                  stampList.length > 1
                    ? stampList.slice(0, totalStamp).length
                    : totalStamp
              },
              () => product
            ).map((item, index) => (
              <div
                key={`${index}-${item.code}`}
                className="w-auto break-inside-avoid-page not-print:flex not-print:justify-center"
              >
                <table className="table border border-black text-center text-[7px]">
                  <colgroup>
                    <col className="w-[80px]" />
                    <col className="w-[120px]" />
                    <col className="w-[120px]" />
                    <col className="w-[120px]" />
                    <col className="w-[120px]" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td className="text-start">
                        Tên sản phẩm
                        <br />
                        品名
                      </td>
                      <td colSpan={2} className="text-xs font-bold">
                        {item.name}
                      </td>
                      <td>CODE</td>
                      <td className="text-xs font-bold">{item.code}</td>
                    </tr>
                    <tr>
                      <td className="text-start">
                        Nguyên liệu
                        <br />
                        原材料
                      </td>
                      <td colSpan={2} className="text-xs">
                        {product.material}
                      </td>
                      <td>
                        Màu sắc
                        <br />色
                      </td>
                      <td className="text-xs">{product.color}</td>
                    </tr>
                    <tr>
                      <td className="text-start">
                        Số lượng
                        <br />
                        数量
                      </td>
                      <td colSpan={4} className="text-xs font-bold">
                        {item.quantity_per_package} PCS
                      </td>
                    </tr>
                    <tr>
                      <td className="text-start">
                        Lotno
                        <br />
                        ロット No
                      </td>
                      <td colSpan={4} className="text-xs font-bold">
                        <div className="flex items-center justify-between">
                          <p>A</p>
                          <p>-</p>
                          <p>{date.replace(/\//g, '')}</p>
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
                      <td className="text-start">
                        Kiểm tra
                        <br />
                        検査
                      </td>
                      <td colSpan={2}>
                        Kiểm tra 100%
                        <br />
                        檢查(100%)
                      </td>
                      <td colSpan={2}>
                        Kiểm tra 200%
                        <br />
                        檢查(200%)
                      </td>
                    </tr>
                    <tr className="h-16">
                      <td className="text-start">
                        Mộc
                        <br />
                        合格印
                      </td>
                      <td colSpan={2}></td>
                      <td colSpan={2}></td>
                    </tr>
                    <tr>
                      <td className="text-start">
                        Người kiểm
                        <br />
                        検査
                      </td>
                      <td colSpan={2}></td>
                      <td colSpan={2}></td>
                    </tr>
                    <tr>
                      <td className="text-start">
                        Thời gian <br /> 時間
                      </td>
                      <td colSpan={4}>
                        {date} {shift == 1 ? '07:30' : '19:30'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>
      <Button
        color="default"
        variant="solid"
        size="large"
        onClick={handlePrint}
      >
        Print
      </Button>
    </>
  );
};
