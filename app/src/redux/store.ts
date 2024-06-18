import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/AuthSlice';
import { thingReducer } from './thing/ThingStack';
import { profileReducer } from './profile/ProfileStack';

export const store = configureStore({
  reducer: {
    authReducer,
    thingReducer,
    profileReducer
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
