import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '@stores/authSlice';
import employeesReducer from '@stores/employeeSlice';
import sidebarReducer from '@stores/sidebarSlice';
import themeReducer from '@stores/themeSlice';
import rolesReducer from '@stores/roleSlice';
import salaryTableReducer from '@stores/salarySlice';
import { persistReducer, persistStore } from 'redux-persist';
import localStorage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage: localStorage,
  whitelist: ['auth', 'sidebar', 'theme']
};

const rootReducer = combineReducers({
  auth: authReducer,
  sidebar: sidebarReducer,
  theme: themeReducer,
  employees: employeesReducer,
  roles: rolesReducer,
  salaryTable: salaryTableReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // serializableCheck: {
      //   ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Ignore non-serializable warnings
      // },
      serializableCheck: false
    })
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
