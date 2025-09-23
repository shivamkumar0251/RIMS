import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { AxiosError } from 'axios';

// ---------- Types ----------
interface User {
  id: string | number;
  name?: string;
  email?: string;
  role?: string;
  // add more fields based on your backend response
}

interface UserDetailsResponse {
  user: User;
  // add other API response fields if needed
}

interface UserDetailsState {
  loading: boolean;
  error: string | null;
  userDetails: UserDetailsResponse | null;
  user: User | null;
}

// ---------- Initial State ----------
const initialState: UserDetailsState = {
  loading: false,
  error: null,
  userDetails: null,
  user: null,
};

// ---------- Async Thunk ----------
export const fetchUserDetails = createAsyncThunk<
  UserDetailsResponse, // return type when resolved
  void, // argument type (no params)
  { rejectValue: { message: string } } // reject type
>('userDetails/fetchUserDetails', async (_, thunkAPI) => {
  const id = localStorage.getItem('userId');
  try {
    const response = await apiCaller({
      url: `${API_ENDPOINTS.GET_USER_BY_ID}/${id}`,
      method: 'GET',
    });

    if (response.status === 200) {
      return response.data as UserDetailsResponse;
    } else {
      return thunkAPI.rejectWithValue({
        message: 'Error fetching user details',
      });
    }
  } catch (error: unknown) {
    const err = error as AxiosError<{ message: string }>;
    console.error('Error fetching user details:', err.message);
    return thunkAPI.rejectWithValue({
      message: err.response?.data?.message || 'Error fetching user details',
    });
  }
});

// ---------- Slice ----------
const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {
    clearUserDetails: (state) => {
      state.userDetails = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload;
        state.user = action.payload.user;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? action.payload.message : 'Unknown error';
      });
  },
});

// ---------- Exports ----------
export const { clearUserDetails } = userDetailsSlice.actions;
export default userDetailsSlice.reducer;
