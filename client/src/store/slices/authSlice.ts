import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/services';

interface User {
  username: string;
  role: string;
  email: string;
  avatar: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: (() => {
    const token = localStorage.getItem('emp_access_token');
    if (!token) return null;
    return {
      username: localStorage.getItem('emp_username') || 'John Doe',
      role: localStorage.getItem('emp_role') || 'Lead Developer',
      email: localStorage.getItem('emp_email') || 'john@enterprise.com',
      avatar: localStorage.getItem('emp_avatar') || 'JD',
    };
  })(),
  accessToken: localStorage.getItem('emp_access_token'),
  refreshToken: localStorage.getItem('emp_refresh_token'),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (
    payload: { username: string; password: string; serverOnline: boolean },
    { rejectWithValue }
  ) => {
    const { username, password } = payload;
    try {
      // Connect to the real NestJS backend API
      const response = await api.auth.login({ username, password });
      return response; // Expects { accessToken, refreshToken, user: { username, role, email, avatar } }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        return rejectWithValue(err.response.data.message);
      }
      return rejectWithValue('Network error or invalid credentials');
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  'auth/refreshUserToken',
  async (token: string, { rejectWithValue }) => {
    try {
      const data = await api.auth.refresh(token);
      return data; // { accessToken, refreshToken }
    } catch {
      return rejectWithValue('Token rotation failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      localStorage.removeItem('emp_access_token');
      localStorage.removeItem('emp_refresh_token');
      localStorage.removeItem('emp_username');
      localStorage.removeItem('emp_role');
      localStorage.removeItem('emp_email');
      localStorage.removeItem('emp_avatar');
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
    },
    syncProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('emp_username', state.user.username);
        localStorage.setItem('emp_role', state.user.role);
        localStorage.setItem('emp_email', state.user.email);
        localStorage.setItem('emp_avatar', state.user.avatar);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        
        localStorage.setItem('emp_access_token', action.payload.accessToken);
        localStorage.setItem('emp_refresh_token', action.payload.refreshToken);
        localStorage.setItem('emp_username', action.payload.user.username);
        localStorage.setItem('emp_role', action.payload.user.role);
        localStorage.setItem('emp_email', action.payload.user.email);
        localStorage.setItem('emp_avatar', action.payload.user.avatar);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // refreshUserToken
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('emp_access_token', action.payload.accessToken);
        localStorage.setItem('emp_refresh_token', action.payload.refreshToken);
      })
      .addCase(refreshUserToken.rejected, (state) => {
        // Force logout on rotation fail
        localStorage.removeItem('emp_access_token');
        localStorage.removeItem('emp_refresh_token');
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const { logoutUser, syncProfile } = authSlice.actions;
export default authSlice.reducer;
