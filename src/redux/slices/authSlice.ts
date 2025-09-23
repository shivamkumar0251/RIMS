import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store'; // Adjust path based on your store file
import type { AxiosError } from 'axios';
import { deleteCookie, getCookie, setCookie } from '../../utils/cookieUtils';

// --------- Types ---------
interface User {
  id: number | string;
  role: string;
  name?: string;
  email?: string;
  // add other user fields here
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
interface TokenPayload {
  token: string;
  expiresIn: number; // in seconds
}

// Define login input payload
interface LoginPayload {
  email: string;
  password: string;
}

// Define login response
interface LoginResponse {
  token: string;
  expiresIn: number; // in seconds
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
};

// Thunk
export const login = createAsyncThunk<
  { token: string; id: string; expiresIn: number; user: LoginResponse['user'] }, // return type
  LoginPayload, // input type
  { rejectValue: { message: string } } // thunkAPI reject type
>(
  'auth/login',
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.login,
        method: 'POST',
        data: { email, password },
      });

      if (response.status === 200) {
        const { token, user, expiresIn } = response.data as LoginResponse;
        const id = user.id;

        // Set cookies
        setCookie("token", token, expiresIn);
        setCookie("userId", id.toString(), expiresIn);


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
  }
);


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
    setToken: (state, action: PayloadAction<TokenPayload>) => {
      const { token, expiresIn } = action.payload;
      // Update state
      state.token = token;
      state.expiresIn = expiresIn;
      setCookie("token", token, expiresIn);
    },
    clearToken: (state) => {
      deleteCookie('userId')
      deleteCookie('token')
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
