import {Provider} from 'react-redux';
import {configureStore, combineReducers} from '@reduxjs/toolkit';
import productSlice from './slices/productSlice';
import healthCheckReducer from './slices/healthCheckSlice';
import fieldReduce from './slices/fieldSlice';
import deviceReduce from './slices/deviceSlice';
import notificationReducer from './slices/notificationSlice'
const rootReducer = combineReducers({
  product: productSlice,
  healthCheck: healthCheckReducer,
  field: fieldReduce,
  device: deviceReduce,
  notification: notificationReducer
});

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: {warnAfter: 128},
      serializableCheck: {warnAfter: 128},
    }),
});

export function AppProvider({children}) {
  return <Provider store={store}>{children}</Provider>;
}
