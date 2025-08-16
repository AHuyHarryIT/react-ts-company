import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Pusher logs for dev:
Pusher.logToConsole = (import.meta.env.VITE_PUSHER_LOG as boolean) ?? false;

// @ts-expect-error - make Pusher available to Echo at runtime
window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_KEY as string,
  cluster: import.meta.env.VITE_PUSHER_CLUSTER as string,
  forceTLS: true,
  enabledTransports: ['ws', 'wss']
});
