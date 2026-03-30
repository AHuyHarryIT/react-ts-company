import { Card, Skeleton } from 'antd';

interface PageSkeletonProps {
  /** Số dòng skeleton hiển thị */
  rows?: number;
  /** Hiện avatar placeholder */
  avatar?: boolean;
  /** Hiện title placeholder */
  title?: boolean;
  /** Số card skeleton */
  cards?: number;
}

/**
 * Skeleton loading component nhất quán cho toàn app.
 * Dùng để hiển thị khi data đang load lần đầu (chưa có cache).
 */
export default function PageSkeleton({
  rows = 5,
  avatar = false,
  title = true,
  cards = 1
}: PageSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i} className="!rounded-xl">
          <Skeleton active avatar={avatar} title={title} paragraph={{ rows }} />
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton cho Table - hiển thị dạng bảng giả
 */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {/* Header row */}
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map((col) => (
          <Skeleton.Button
            key={col}
            active
            size="small"
            style={{ width: `${15 + col * 3}%`, height: 20 }}
            block
          />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {[1, 2, 3, 4, 5].map((col) => (
            <Skeleton.Input
              key={col}
              active
              size="small"
              style={{ width: `${15 + col * 3}%`, height: 16 }}
              block
            />
          ))}
        </div>
      ))}
    </div>
  );
}
