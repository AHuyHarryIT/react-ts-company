import '@ant-design/v5-patch-for-react-19';
import { persistor, store } from '@stores/index';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import App from './App.tsx';
import './index.css';
import { loadAndInitializeTheme } from '@utils/initial.ts';
import { PersistGate } from 'redux-persist/integration/react';

loadAndInitializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
