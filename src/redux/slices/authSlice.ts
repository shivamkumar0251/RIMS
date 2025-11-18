import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';
import { deleteCookie, getCookie, setCookie } from '../../utils/cookieUtils';

// --------- Types ---------
export interface User {
  id: number | string;
  role: string;
  name?: string;
  email?: string;
  // add more fields as needed
}

interface AuthState {
  loading: boolean;
  error: string | null;
  message: string;
  status: number | null;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  expiresIn: number | null;
  usersList: User[];
  selectedUser: User | null;
}

interface TokenPayload {
  token: string;
  expiresIn: number;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// --------- Initial State ---------
const initialState: AuthState = {
  loading: false,
  error: null,
  message: '',
  status: null,
  user: null,
  token: getCookie('token') || null,
  isAuthenticated: !!getCookie('token'),
  expiresIn: null,
  usersList: [],
  selectedUser: null,
};

// --------- Async Thunks ---------

// ---- Login ----
export const login = createAsyncThunk<
  { token: string; id: string; expiresIn: number; user: LoginResponse['user'] },
  LoginPayload,
  { rejectValue: { message: string } }
>(
  'auth/login',
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.LOGIN_API,
        method: 'POST',
        data: { email, password },
      });

      if (response.status === 200) {
        const { token, user, expiresIn } = response.data as LoginResponse;
        const id = user.id;

        // Save tokens in cookies
        setCookie('token', token, expiresIn);
        setCookie('userId', id.toString(), expiresIn);

        return { token, id, expiresIn, user };
      } else {
        return thunkAPI.rejectWithValue({
          message: (response.data as { message?: string })?.message || 'Login error',
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Login error',
      });
    }
  }
);

// ---- Logout ----
export const logout = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: { message: string } }
>(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.logout,
        method: 'POST',
      });

      if (response.status === 200) {
        deleteCookie('token');
        deleteCookie('userId');
        return { message: (response.data as { message?: string })?.message || 'Logout successful' };
      } else {
        return thunkAPI.rejectWithValue({
          message: (response.data as { message?: string })?.message || 'Logout failed',
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Logout error',
      });
    }
  }
);

// ---- Get Users List or Single User ----
export const getUsersList = createAsyncThunk<
  User[] | User,
  string | undefined, // userId (optional)
  { rejectValue: { message: string } }
>(
  'auth/getUsersList',
  async (userId, thunkAPI) => {
    try {
      const url = userId
        ? `${API_ENDPOINTS.GET_USERS_LIST}?userId=${userId}`
        : `${API_ENDPOINTS.GET_USERS_LIST}`;

      const response = await apiCaller({
        url,
        method: 'GET'
      });

      if (response.status === 200) {
        return response.data as User[] | User;
      } else {
        return thunkAPI.rejectWithValue({
          message: (response.data as { message?: string })?.message || 'Failed to fetch users',
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error while fetching users',
      });
    }
  }
);

// --------- Slice ---------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<TokenPayload>) => {
      const { token, expiresIn } = action.payload;
      state.token = token;
      state.expiresIn = expiresIn;
      setCookie('token', token, expiresIn);
    },
    clearToken: (state) => {
      deleteCookie('userId');
      deleteCookie('token');
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- Login ----
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.expiresIn = action.payload.expiresIn;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload.message : 'Login failed';
      })

      // ---- Logout ----
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.expiresIn = null;
        state.message = action.payload.message;
        state.usersList = [];
        state.selectedUser = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload.message : 'Logout failed';
      })

      // ---- Get Users ----
      .addCase(getUsersList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsersList.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.usersList = action.payload;
          state.selectedUser = null;
        } else {
          state.selectedUser = action.payload;
        }
      })
      .addCase(getUsersList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload.message : 'Failed to fetch users';
      });
  },
});

// --------- Selectors ---------
export const getToken = (state: RootState) => state.auth.token;
export const selectUsersList = (state: RootState) => state.auth;
export const selectSelectedUser = (state: RootState) => state.auth.selectedUser;

// --------- Exports ---------
export const { setAuthenticated, setUser, setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
