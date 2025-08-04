import { workLegends } from '@/configs/legend/workLegends.config';
import { ScheduleDetailType } from '@/types/scheduleDetailType';
import { List, ListProps, Tag } from 'antd';
import dayjs from 'dayjs';

export const ScheduleWcListSection = ({
  header,
  dataSource,
  loading
}: ListProps<ScheduleDetailType>) => (
  <List
    header={header}
    bordered
    dataSource={dataSource}
    loading={loading}
    renderItem={(item) => {
      const date = dayjs(item.date).format('DD-MM-YYYY');
      const day = dayjs(item.date).format('dd');
      const isWeekend =
        dayjs(item.date).day() === 0 || dayjs(item.date).day() === 6;
      return (
        <List.Item
          key={`${item}`}
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
          <div>{workLegends['VS'].icon}</div>
        </List.Item>
      );
    }}
  />
);
