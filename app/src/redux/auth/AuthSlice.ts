import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService, { ApiError } from '../../services/ApiService';

type User = {
  accessToken: string;
  username: string;
  badges?: {
    icon: string;
    name: string;
    description: string;
  }[];
  levels?: {
    currentLevel: {
      level: string;
      minThreshold: number;
    };
    nextLevel: {
      level: string;
      minThreshold: number;
    };
  };
};

interface AuthState {
  user: User | null;
  loading: boolean;
  error: ApiError | undefined;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: undefined
};

const api = new ApiService();

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('username');
  return;
});

export const loginSilently = createAsyncThunk('auth/loginSilently', async (pushToken: string | undefined) => {
  console.log(`[auth/loginSilently] pushToken: %o`, pushToken);
  await api.call(api.client.auth.silent.$post, { json: { pushToken } });

  const accessToken = await AsyncStorage.getItem('accessToken');
  const username = await AsyncStorage.getItem('username');

  if (accessToken && username) {
    return { accessToken, username };
  }

  return null;
});

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { username: string; password: string }, { rejectWithValue }) => {
    console.log(`[auth/login] Data: %o`, payload);

    const response = await api.call(api.client.auth.login.$post, { json: payload });

    if (response.ok) {
      const data = await response.json();
      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      await AsyncStorage.setItem('username', payload.username);
      await AsyncStorage.setItem('allowNotifications', 'true');

      return { accessToken: data.accessToken, username: payload.username };
    }
    if (response.status === 400) {
      const error = await response.json();
      return rejectWithValue(error);
    }

    return rejectWithValue({});
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: { username: string; password: string }, { rejectWithValue }) => {
    console.log(`[auth/register] Data: %o`, payload);

    const response = await api.call(api.client.auth.register.$post, { json: payload });

    if (response.ok) {
      const data = await response.json();
      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      await AsyncStorage.setItem('username', payload.username);
      await AsyncStorage.setItem('allowNotifications', 'true');

      return { accessToken: data.accessToken, username: payload.username };
    }
    if (response.status === 400) {
      const error = await response.json();
      return rejectWithValue(error);
    }

    return rejectWithValue({});
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // loginSilently
    builder.addCase(loginSilently.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loginSilently.fulfilled, (state, action) => {
      state.loading = false;
      if (!action.payload) {
        return;
      }
      state.user = {
        accessToken: action.payload.accessToken,
        username: action.payload.username
      };
    });
    builder.addCase(loginSilently.rejected, (state) => {
      state.loading = false;
    });

    // login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = {
        accessToken: action.payload.accessToken,
        username: action.payload.username
      };
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as any;
    });

    // register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = {
        accessToken: action.payload.accessToken,
        username: action.payload.username
      };
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as any;
    });

    // logout
    builder.addCase(logout.pending, (state) => {
      state.loading = false;
      state.user = null;
    });
  }
});

export default authSlice.reducer;
export const authSelector = (state: RootState) => state.authReducer;
