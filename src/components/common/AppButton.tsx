import { Button, ButtonProps } from 'antd';
import React from 'react';

export type AppButtonTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'purple';

interface AppButtonProps extends ButtonProps {
  tone?: AppButtonTone;
}

const toneClassMap: Record<AppButtonTone, string> = {
  neutral: 'header-action-btn--neutral',
  primary: 'header-action-btn--primary',
  success: 'header-action-btn--success',
  info: 'header-action-btn--info',
  warning: 'header-action-btn--warning',
  danger: 'header-action-btn--danger',
  purple: 'header-action-btn--purple'
};

const getAppButtonClassName = (
  tone: AppButtonTone = 'neutral',
  className?: string
) =>
  ['header-action-btn', toneClassMap[tone], className]
    .filter(Boolean)
    .join(' ');

const AppButton: React.FC<AppButtonProps> = ({
  tone = 'neutral',
  className,
  ...props
}) => {
  return (
    <Button {...props} className={getAppButtonClassName(tone, className)} />
  );
};

export default AppButton;
