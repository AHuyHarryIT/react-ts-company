import '@ant-design/v5-patch-for-react-19';
// import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';

dayjs.locale('vi');

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
