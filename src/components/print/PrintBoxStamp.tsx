import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Image, message } from 'antd';
import type { Dayjs } from 'dayjs';
import { useCallback, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';

import { ProductType } from '@/types/productType';
import { saveStamp } from '@services/StampService';
import { Shift } from '@/types/shift';
import logo from '@assets/images/logo/vvp02.png';
import { EmployeeType } from '@/types/employeeType';
import '@assets/css/barcode-1.css';
import { useStampNotification } from '@hooks/useStampNotification';

interface PrintBoxStampProps {
  product: ProductType;
  startStamp: string | number;
  totalStamp: number;
  date: Dayjs;
  shift: Shift;
  employee_id?: EmployeeType['id'];
  stamp_id?: string;
}

export const PrintBoxStamp = ({
  product,
  startStamp,
  totalStamp,
  date,
  shift,
  employee_id,
  stamp_id
}: PrintBoxStampProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: contentRef });
  const stampList = (startStamp as string).split(',');
  const queryClient = useQueryClient();
  const { handleRemoveNotification } = useStampNotification();

  const { mutate } = useMutation({
    mutationKey: ['savePrintLog'],
    mutationFn: saveStamp,
    onSuccess: () => {
      message.success('Print log saved successfully');
      queryClient.invalidateQueries();
      if (stamp_id) handleRemoveNotification(stamp_id);
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
      date: date.format('YYYY-MM-DD'),
      shift,
      binCount: totalStamp,
      binStart: stampList.slice(0, totalStamp).join(','),
      type: 'box',
      employee_id: employee_id,
      stamp_id: stamp_id
    });
  }, [
    stampList,
    date,
    handlePrint,
    mutate,
    product,
    shift,
    totalStamp,
    employee_id,
    stamp_id
  ]);

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
      <Button color="default" variant="solid" onClick={handleSavePrintLog}>
        Print
      </Button>
      <div ref={contentRef} className="print:m-0 print:p-0 print:shadow-none">
        {product &&
          Array.from(
            {
              length: Math.ceil(
                (stampList.length > 1
                  ? stampList.slice(0, totalStamp).length
                  : totalStamp) / 6
              )
            },
            (_, pageIndex) => (
              <div
                key={`page-${pageIndex}`}
                className="grid grid-cols-3 grid-rows-2 place-items-center gap-4 not-print:mb-8 not-print:border not-print:border-green-500 print:h-screen print:w-full print:break-after-page"
              >
                {Array.from(
                  {
                    length: Math.min(
                      6,
                      (stampList.length > 1
                        ? stampList.slice(0, totalStamp).length
                        : totalStamp) -
                        pageIndex * 6
                    )
                  },
                  (_, itemIndex) => {
                    const globalIndex = pageIndex * 6 + itemIndex;
                    return (
                      <div
                        key={`${globalIndex}-${product.code}`}
                        className="h-[500] w-auto max-w-[470px] break-inside-avoid-page text-[7px] not-print:flex not-print:justify-center print:flex print:h-auto print:w-auto print:max-w-none print:items-center print:justify-center"
                      >
                        <table
                          className={`table border border-black text-center ${product.FAVV ? 'text-[8.3px]' : 'text-[10px]'}`}
                        >
                          <tbody>
                            <tr>
                              <td>
                                <Image
                                  src={logo}
                                  alt="logo"
                                  width={90}
                                  preview={false}
                                  title="VINH VINH PHAT ONE MEMBER CO.LTD"
                                />
                              </td>
                              <td colSpan={5}>
                                <div className="w-auto text-left text-[6px] break-words whitespace-normal">
                                  VINH VINH PHAT ONE MEMBER CO., LTD
                                  <br />
                                  Address : 359 Ap Chien Luoc Street, Warter 2,
                                  Binh Hung Hoa Ward, Ho Chi Minh City
                                  <br />
                                  Factory : No. 2861, National Highway 1, Hamlet
                                  3, Binh Chanh Commune, Ho Chi Minh City
                                  <br />
                                  Tel: 0283.620.4978 Fax: 0283.620.4978
                                  <br />
                                  Made in Viet Nam
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-start">
                                Tên sản phẩm
                                <br />
                                品名
                              </td>
                              <td colSpan={2}>
                                <p
                                  className={`${product.name.length < 10 ? 'text-sm' : 'text-[12.5px]'} font-bold`}
                                >
                                  {product.name}
                                </p>
                              </td>
                              <td>CODE</td>
                              <td colSpan={2}>
                                <p className="text-sm font-bold">
                                  {product.code}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-start">
                                Nguyên liệu
                                <br />
                                原材料
                              </td>
                              <td colSpan={2} className="text-sm">
                                <p> {product.material}</p>
                              </td>
                              <td>
                                Màu sắc
                                <br />色
                              </td>
                              <td colSpan={2} className="text-sm">
                                <p> {product.color}</p>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-start">
                                Số lượng
                                <br />
                                数量
                              </td>
                              <td colSpan={5}>
                                <p className="text-sm font-bold">
                                  {product.quanEntityBin}PCS
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-start">
                                Lotno
                                <br />
                                ロット No
                              </td>
                              <td colSpan={5} className="text-sm font-bold">
                                <div className="flex items-center justify-between">
                                  <p>A</p>
                                  <p>-</p>
                                  <p>{date.format('DDMMYYYY')}</p>
                                  <p>-</p>
                                  <p>{shift}</p>
                                  <p>-</p>
                                  <p>
                                    {(() => {
                                      let stampNumber;
                                      if (stampList.length > 1) {
                                        stampNumber = stampList[globalIndex];
                                      } else {
                                        // Convert sequential to alternating pattern: 1,2,3,4,5,6 -> 1,3,5,2,4,6
                                        const totalStampsInPage = Math.min(
                                          6,
                                          totalStamp -
                                            Math.floor(globalIndex / 6) * 6
                                        );
                                        const positionInPage = globalIndex % 6;
                                        const baseStamp =
                                          Math.floor(globalIndex / 6) * 6 +
                                          parseInt(startStamp as string);

                                        if (
                                          positionInPage <
                                          Math.ceil(totalStampsInPage / 2)
                                        ) {
                                          // Odd positions: 1st, 3rd, 5th (positions 0, 2, 4)
                                          stampNumber =
                                            baseStamp + positionInPage * 2;
                                        } else {
                                          // Even positions: 2nd, 4th, 6th (positions 1, 3, 5)
                                          stampNumber =
                                            baseStamp +
                                            (positionInPage -
                                              Math.ceil(
                                                totalStampsInPage / 2
                                              )) *
                                              2 +
                                            1;
                                        }
                                      }
                                      return stampNumber
                                        .toString()
                                        .padStart(3, '0');
                                    })()}
                                  </p>
                                </div>
                              </td>
                            </tr>
                            {product.FAVV == true && (
                              <tr>
                                <td className="text-start">
                                  Mã vạch
                                  <br />
                                  バーコード
                                </td>
                                <td colSpan={5}>
                                  <div className="flex items-center justify-center">
                                    <Barcode
                                      className="max-w-[235px]"
                                      width={2}
                                      height={25}
                                      format="CODE128"
                                      displayValue={false}
                                      margin={1}
                                      value={`${product.id}a${date.format('DDMMYYYY')}${shift}${(() => {
                                        let stampNumber;
                                        if (stampList.length > 1) {
                                          stampNumber = stampList[globalIndex];
                                        } else {
                                          // Convert sequential to alternating pattern: 1,2,3,4,5,6 -> 1,3,5,2,4,6
                                          const totalStampsInPage = Math.min(
                                            6,
                                            totalStamp -
                                              Math.floor(globalIndex / 6) * 6
                                          );
                                          const positionInPage =
                                            globalIndex % 6;
                                          const baseStamp =
                                            Math.floor(globalIndex / 6) * 6 +
                                            parseInt(startStamp as string);

                                          if (
                                            positionInPage <
                                            Math.ceil(totalStampsInPage / 2)
                                          ) {
                                            // Odd positions: 1st, 3rd, 5th (positions 0, 2, 4)
                                            stampNumber =
                                              baseStamp + positionInPage * 2;
                                          } else {
                                            // Even positions: 2nd, 4th, 6th (positions 1, 3, 5)
                                            stampNumber =
                                              baseStamp +
                                              (positionInPage -
                                                Math.ceil(
                                                  totalStampsInPage / 2
                                                )) *
                                                2 +
                                              1;
                                          }
                                        }
                                        return stampNumber
                                          .toString()
                                          .padStart(3, '0');
                                      })()}`}
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
                            <tr>
                              <td className="text-start">
                                Kiểm tra
                                <br />
                                検査
                              </td>
                              <td colSpan={3}>
                                Kiểm tra 200%
                                <br />
                                檢查(200%)
                              </td>
                              <td colSpan={2}>
                                Kiểm tra (Xuất hàng)
                                <br />
                                検査 (出荷)
                              </td>
                            </tr>
                            <tr>
                              <td className="h-20 text-start">
                                Mộc
                                <br />
                                合格印
                              </td>
                              <td colSpan={3}></td>
                              <td colSpan={2} rowSpan={2}>
                                <div className="mx-auto h-14 w-8 border print:text-black"></div>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-start">
                                Người kiểm
                                <br />
                                検査
                              </td>
                              <td colSpan={3}></td>
                            </tr>
                            <tr>
                              <td className="text-start">(Thời gian) 時間</td>
                              <td colSpan={5}>
                                {date.format('DD/MM/YYYY')}{' '}
                                {shift == 1 ? '07:30' : '19:30'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                )}
              </div>
            )
          )}
      </div>
      <Button color="default" variant="solid" onClick={handlePrint}>
        Print
      </Button>
    </>
  );
};
