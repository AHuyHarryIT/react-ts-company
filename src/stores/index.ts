import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '@stores/authSlice';
import sidebarReducer from '@stores/sidebarSlice';
import themeReducer from '@stores/themeSlice';
import { persistStore } from 'redux-persist';

const rootReducer = combineReducers({
  auth: authReducer,
  sidebar: sidebarReducer,
  theme: themeReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // serializableCheck: {
      //   ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Ignore non-serializable warnings
      // },
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
