import { Tag } from 'antd';

export const workLegends = {
  N: {
    label: 'Ca ngày',
    icon: (
      <Tag className="!m-0 font-bold" color="blue-inverse">
        N
      </Tag>
    )
  },
  NN: {
    label: 'Nghỉ nửa ngày',
    icon: (
      <Tag className="!m-0 font-bold" color="red-inverse">
        NN
      </Tag>
    )
  },
  D: {
    label: 'Ca đêm',
    icon: (
      <Tag className="!m-0 font-bold" color="#000">
        D
      </Tag>
    )
  },
  X: {
    label: 'Nghỉ',
    icon: (
      <Tag className="!m-0 font-bold" color="red-inverse">
        X
      </Tag>
    )
  },
  TC: {
    label: 'Tăng cường đêm',
    icon: (
      <Tag className="!m-0 font-bold" color="red-inverse">
        TC
      </Tag>
    )
  },
  LN: {
    label: 'Làm thêm ca ngày',
    icon: (
      <Tag className="!m-0 font-bold" color="red-inverse">
        LN
      </Tag>
    )
  },
  VS: {
    label: 'Vệ sinh',
    icon: (
      <Tag className="!m-0 font-bold" color="yellow-inverse">
        <span className="text-black">VS</span>
      </Tag>
    )
  }
};
