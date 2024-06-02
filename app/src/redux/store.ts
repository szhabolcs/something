import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/AuthSlice';
import { thingReducer } from './thing/ThingStack';

export const store = configureStore({
  reducer: {
    authReducer,
    thingReducer
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
