import { useEffect } from 'react';
import { useStore } from '@tanstack/react-store';
import { message } from 'antd';

import { authStore, clearAuth } from '@stores/authStore';
import { echo } from '@utils/lib/echo';

type AuthSessionRevokedPayload = {
  session_id?: string | null;
  message?: string;
  code?: string;
};

const DEFAULT_MESSAGE = 'Tài khoản của bạn đã được đăng nhập ở nơi khác.';

export function useForcedLogoutNotification() {
  const { authChannelName, sessionId } = useStore(authStore);

  useEffect(() => {
    if (!authChannelName || !sessionId) return;

    const eventName = '.auth.session-revoked';
    const channel = echo.private(authChannelName);

    const handler = (payload: AuthSessionRevokedPayload) => {
      const incomingSessionId = payload.session_id
        ? String(payload.session_id)
        : null;

      if (!incomingSessionId || incomingSessionId === sessionId) {
        return;
      }

      const logoutMessage = payload.message || DEFAULT_MESSAGE;
      sessionStorage.setItem('auth_logout_message', logoutMessage);
      clearAuth();
      message.warning(logoutMessage);
      window.location.replace('/login');
    };

    channel.listen(eventName, handler);

    return () => {
      channel.stopListening(eventName, handler);
      echo.leave(authChannelName);
    };
  }, [authChannelName, sessionId]);
}
