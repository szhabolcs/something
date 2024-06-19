import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';
import ApiService, { ApiError, ApiResponse } from '../../services/ApiService';

export type ProfileDTO = ApiResponse<typeof api.client.user.me.profile.$get, 200>;

type InitialState = {
  profile: ProfileDTO | undefined;
  loading: boolean;
  error: ApiError | undefined;
};

const initialState: InitialState = {
  profile: undefined,
  loading: true,
  error: undefined
};

const api = new ApiService();

export const getProfileData = createAsyncThunk('profile/getProfileData', async (_, { rejectWithValue }) => {
  const response = await api.call(api.client.user.me.profile.$get, {});
  if (response.ok) {
    const data = await response.json();
    return data;
  }

  return rejectWithValue({});
});

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // getProfileData
    builder.addCase(getProfileData.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getProfileData.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    });
    builder.addCase(getProfileData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as any;
    });
  }
});

export const profileReducer = profileSlice.reducer;
export const profileSelector = (state: RootState) => state.profileReducer;
