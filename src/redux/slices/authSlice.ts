import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store'; // Adjust path based on your store file
import type { AxiosError } from 'axios';

// --------- Types ---------
interface User {
  id: number | string;
  role: string;
  name?: string;
  email?: string;
  // add other user fields here
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
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
}

// --------- Initial State ---------
const initialState: AuthState = {
  loading: false,
  error: null,
  message: '',
  status: null,
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  expiresIn: null,
};

// --------- Thunks ---------
export const login = createAsyncThunk<
  { token: string; id: User['id']; expiresIn: number; user: User },
  LoginPayload,
  { rejectValue: { message: string } }
>('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    const response = await apiCaller({
      url: API_ENDPOINTS.login,
      method: 'POST',
      data: { email, password },
    });

    if (response.status === 200) {
      const { token, user, expiresIn } = response.data as LoginResponse;

      const id = user.id;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', id.toString());

      // const userDetailsResponse = await thunkAPI.dispatch(
      //   fetchUserById(id)
      // ).unwrap();

      return { token, id, expiresIn, user };
    } else {
      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Login Error',
      });
    }
  } catch (error: unknown) {
    const err = error as AxiosError<{ message: string }>;
    return thunkAPI.rejectWithValue({
      message: err.response?.data?.message || 'Login Error',
    });
  }
});

// export const fetchUserById = createAsyncThunk<User, User['id']>(
//   'auth/fetchUserById',
//   async (userId) => {
//     try {
//       const response = await apiCaller({
//         url: `${API_ENDPOINTS.GET_USER_BY_ID}/${userId}`,
//         method: 'GET',
//       });
//       if (response.status === 200) {
//         return response.data as User;
//       } else {
//         throw new Error('Error fetching user details');
//       }
//     } catch (error) {
//       console.error('Error fetching user by ID:', error);
//       throw error;
//     }
//   }
// );

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
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      const expirationTime = new Date().getTime() + 30 * 60 * 1000;
      localStorage.setItem('token', action.payload);
      localStorage.setItem('tokenExpiry', expirationTime.toString());
    },
    clearToken: (state) => {
      localStorage.removeItem('userDetails');
      localStorage.removeItem('userId');
      localStorage.removeItem('persist:root');
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

// --------- Selectors ---------
export const getToken = (state: RootState) => state.auth.token;

// --------- Exports ---------
export const { setAuthenticated, setUser, setToken, clearToken } =
  authSlice.actions;

export default authSlice.reducer;
