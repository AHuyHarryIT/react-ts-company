import axiosPrivate from '@/api/axiosInstance';
import { workLegends } from '@/configs/legend/workLegends.config';
import { PaginatedResponse } from '@/types/responseTypes';
import { ScheduleDetailType } from '@/types/scheduleDetailType';
import BackButton from '@components/common/BackButton';
import ComponentCard from '@components/common/ComponentCard';
import { Route } from '@routes/_authenticated/employee/schedules/$id';
import { useQuery } from '@tanstack/react-query';
import { List, Tag } from 'antd';
// Reusable section for WC and eat room schedules

import dayjs from 'dayjs';
import { ScheduleWcListSection } from './SchemaListSection';

export const ScheduleDetail = () => {
  const { id: scheduleId } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['empScheduleDetail', scheduleId],
    queryFn: async () => {
      const response = await axiosPrivate.get<
        ScheduleDetailType,
        PaginatedResponse<ScheduleDetailType>
      >(`/api/employee/schedules/${scheduleId}`, { params: { limit: 0 } });
      return response;
    }
  });

  return (
    <>
      <BackButton to="/employee/schedules" />
      <ComponentCard title={'Lịch làm việc'}>
        <section>
          <List
            header={<strong>Chú thích</strong>}
            bordered
            dataSource={Object.values(workLegends)}
            className="max-w-3xs"
            renderItem={(item) => (
              <List.Item>
                <div className="flex content-center">
                  <div className="w-12">{item.icon}</div>
                  <div>{item.label}</div>
                </div>
              </List.Item>
            )}
          />
        </section>
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <List
              header={<strong>Chi tiết lịch làm việc</strong>}
              bordered
              dataSource={data?.data}
              loading={isLoading}
              renderItem={(item) => {
                const date = dayjs(item.date).format('DD-MM-YYYY');
                const day = dayjs(item.date).format('dd');
                const isWeekend =
                  dayjs(item.date).day() === 0 || dayjs(item.date).day() === 6;

                return (
                  <List.Item
                    key={`hnhc_${item.date}-${item.employee_id}-${item.schedule_id}-${item.hnhc}`}
                    className={`${isWeekend ? 'bg-gray-400 dark:bg-gray-100' : 'bg-white dark:bg-gray-500'}`}
                  >
                    <List.Item.Meta
                      title={
                        <div
                          className={`${isWeekend ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}
                        >
                          <Tag
                            children={day}
                            color={`${isWeekend ? '#000000' : 'default'}`}
                          />
                          {date}
                        </div>
                      }
                    />
                    {item.hnhc !== null && workLegends[item.hnhc]?.icon
                      ? workLegends[item.hnhc].icon
                      : item.hnhc}
                  </List.Item>
                );
              }}
            />
          </div>
          <section className="space-y-6">
            <div>
              <ScheduleWcListSection
                header={<strong>Lịch trực phòng ăn</strong>}
                dataSource={data?.data.filter((item) => item.is_eat_room) ?? []}
                loading={isLoading}
              />
            </div>
            <div>
              <ScheduleWcListSection
                header={<strong>Lịch đổ rác WC</strong>}
                dataSource={data?.data.filter((item) => item.is_wc_trash) ?? []}
                loading={isLoading}
              />
            </div>
            <div>
              <ScheduleWcListSection
                header={<strong>Lịch trực WC nữ</strong>}
                dataSource={
                  data?.data.filter((item) => item.is_wc_clean_women) ?? []
                }
                loading={isLoading}
              />
            </div>
            <div>
              <ScheduleWcListSection
                header={<strong>Lịch trực WC nam</strong>}
                dataSource={
                  data?.data.filter((item) => item.is_wc_clean_men) ?? []
                }
                loading={isLoading}
              />
            </div>
          </section>
        </section>
      </ComponentCard>
    </>
  );
};
