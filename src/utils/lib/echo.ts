import Echo from 'laravel-echo';
import type { Broadcaster } from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Echo: Echo<keyof Broadcaster>;
    Pusher: typeof Pusher;
  }
}

// Pusher logs for dev:
// Pusher.logToConsole = false;

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_KEY as string,
  cluster: import.meta.env.VITE_PUSHER_CLUSTER as string,
  forceTLS: true,
  enabledTransports: ['ws', 'wss']
});

window.Echo = echo;
