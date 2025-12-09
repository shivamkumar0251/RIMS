import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface Order {
  _id: string;
  [key: string]: any;
}

interface OrderState {
  loading: boolean;
  error: string | null;
  orders: Order[];
  allOrdersData: GetOrdersResponse | null;
}

// GET orders
interface GetOrdersResponse {
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  count: number;
  data: Order[];
}

// ---------------- Initial State ----------------
const initialState: OrderState = {
  loading: false,
  error: null,
  orders: [],
  allOrdersData: null,
};

// ---------------- Thunks ----------------
export const getOrders = createAsyncThunk<
  GetOrdersResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string },
  { rejectValue: { message: string } }
>(
  'order/getOrders',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '' }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_ORDERS_LIST}?search=${search}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetOrdersResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch orders',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching orders',
      });
    }
  }
);

// ADD ORDER
export const addOrder = createAsyncThunk<
  Order,
  Partial<Order>,
  { rejectValue: { message: string } }
>(
  'order/addOrder',
  async (orderData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_ORDERS,
        method: 'POST',
        data: orderData,
      });

      if (response.status === 201) {
        return response?.data as Order;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Add order failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// UPDATE ORDER
export const updateOrder = createAsyncThunk<
  Order,
  { orderId: string; orderData: Partial<Order> },
  { rejectValue: { message: string } }
>(
  'order/updateOrder',
  async ({ orderId, orderData }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_ORDERS(orderId),
        method: 'PUT',
        data: orderData,
      });

      if (response.status === 200) {
        return response.data as Order;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Update failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// DELETE WHOLE ORDER
export const deleteWholeOrder = createAsyncThunk<
  { orderId: string },
  string,
  { rejectValue: { message: string } }
>(
  'order/deleteWholeOrder',
  async (orderId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.DELETE_WHOLE_ORDERS(orderId),
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { orderId };
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Delete failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// DELETE ORDER ITEMS
export const deleteOrderItems = createAsyncThunk<
  { orderId: string },
  string,
  { rejectValue: { message: string } }
>(
  'order/deleteOrderItems',
  async (orderId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.DELETE_ORDERS_ITEMS(orderId),
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { orderId };
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Delete items failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// GET VENDOR ORDERS
export const getVendorOrders = createAsyncThunk<
  GetOrdersResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string },
  { rejectValue: { message: string } }
>(
  'order/getVendorOrders',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '' }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_VENDOR_ORDERS}?search=${search}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetOrdersResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch vendor orders',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching vendor orders',
      });
    }
  }
);

// UPDATE VENDOR TO PURCHASE
export const updateVendorToPurchase = createAsyncThunk<
  Order,
  string,
  { rejectValue: { message: string } }
>(
  'order/updateVendorToPurchase',
  async (orderId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_VENDOR_TO_PURCHASE(orderId),
        method: 'PUT',
      });

      if (response.status === 200) {
        return response.data as Order;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Update to purchase failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// ---------------- Slice ----------------
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrdersData = action.payload;
        state.orders = action.payload.data;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // ADD
      .addCase(addOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(addOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add order failed';
      })

      // UPDATE
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update order failed';
      })

      // DELETE WHOLE ORDER
      .addCase(deleteWholeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWholeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload.orderId
        );
      })
      .addCase(deleteWholeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete order failed';
      })

      // DELETE ORDER ITEMS
      .addCase(deleteOrderItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrderItems.fulfilled, (state, action) => {
        state.loading = false;
        // Update order to reflect deleted items
        const order = state.orders.find((o) => o._id === action.payload.orderId);
        if (order) {
          // You may need to update the order structure based on API response
        }
      })
      .addCase(deleteOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete order items failed';
      })

      // GET VENDOR ORDERS
      .addCase(getVendorOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVendorOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrdersData = action.payload;
        state.orders = action.payload.data;
      })
      .addCase(getVendorOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // UPDATE VENDOR TO PURCHASE
      .addCase(updateVendorToPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendorToPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(updateVendorToPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update to purchase failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectOrderState = (state: RootState) => state.order;
export const selectOrders = (state: RootState) => state.order.orders;
export const selectOrderLoading = (state: RootState) => state.order.loading;
export const selectAllOrdersData = (state: RootState) => state.order.allOrdersData;

// ---------------- Exports ----------------
export default orderSlice.reducer;

