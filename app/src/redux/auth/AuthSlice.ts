import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import RespositoryService from "../../services/RespositoryService";
import { RootState } from "../store";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  token: string;
  username: string;
  badges?: {
    icon: string;
    name: string;
    description: string;
  }[],
  levels?: {
    currentLevel: {
      level: string;
      minThreshold: number;
    },
    nextLevel: {
      level: string;
      minThreshold: number;
    }
  }
};

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | undefined;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: undefined,
};

export const logout = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("username");
  return;
});

export const loginSilently = createAsyncThunk(
  "auth/loginSilently",
  async () => {
    const testToken = await AsyncStorage.getItem("token");

    if (testToken) {
      return {
        token: testToken,
        username: await AsyncStorage.getItem("username") || "",
      };
    }

    return null;
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (data: { username: string; password: string }) => {
    const repositoryService = new RespositoryService();
    const response = await repositoryService.authRespoitory.login<{
      token: string;
      user: { username: string };
    }>(data);

    if (response) {
      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem("username", response.user.username);
    }

    return response;
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (data: { username: string; password: string }) => {
    const repositoryService = new RespositoryService();
    const response = await repositoryService.authRespoitory.register(data);

    if (response) {
      return true;
    }

    return false;
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loginSilently.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      loginSilently.fulfilled,
      (
        state,
        action: PayloadAction<{
          token: string;
          username: string;
        } | null>
      ) => {
        state.loading = false;
        if (action.payload === null) {
          return;
        }
        state.user = {
          token: action.payload.token,
          username: action.payload.username,
        };
      }
    );
    builder.addCase(loginSilently.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(login.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      login.fulfilled,
      (
        state,
        action: PayloadAction<{ token: string; user: { username: string } }>
      ) => {
        // TODO: change secret to my own secret
        state.loading = false;
        state.user = {
          token: action.payload.token,
          username: action.payload.user.username,
        };
      }
    );
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    builder.addCase(register.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(register.fulfilled, (state, _) => {
      state.loading = false;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    builder.addCase(logout.pending, (state) => {
      state.loading = false;
      state.user = null;
    });
  },
});

export default authSlice.reducer;
export const authSelector = (state: RootState) => state.authReducer;
