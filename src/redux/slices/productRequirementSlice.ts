import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface ProductRequirement {
  _id: string;
  productId: string;
  productName?: string;
  quantity: number;
  notes?: string;
  createdAt?: string;
  [key: string]: any;
}

interface ProductRequirementState {
  loading: boolean;
  error: string | null;
  requirements: ProductRequirement[];
  allRequirementsData: GetProductRequirementsResponse | null;
}

// GET product requirements
interface GetProductRequirementsResponse {
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  count: number;
  data: ProductRequirement[];
}

// ---------------- Initial State ----------------
const initialState: ProductRequirementState = {
  loading: false,
  error: null,
  requirements: [],
  allRequirementsData: null,
};

// ---------------- Thunks ----------------
export const getProductRequirements = createAsyncThunk<
  GetProductRequirementsResponse,
  { page?: number; limit?: number },
  { rejectValue: { message: string } }
>(
  'productRequirement/getProductRequirements',
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_PRODUCT_REQUIREMENTS}?page=${page}&limit=${limit}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetProductRequirementsResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch product requirements',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching product requirements',
      });
    }
  }
);

// ADD PRODUCT REQUIREMENT
export const addProductRequirement = createAsyncThunk<
  ProductRequirement,
  { productId: string; quantity: number; notes?: string },
  { rejectValue: { message: string } }
>(
  'productRequirement/addProductRequirement',
  async ({ productId, quantity, notes }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_PRODUCT_REQUIREMENT,
        method: 'POST',
        data: { productId, quantity, notes },
      });

      if (response.status === 201) {
        return response?.data as ProductRequirement;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Add product requirement failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// UPDATE PRODUCT REQUIREMENT
export const updateProductRequirement = createAsyncThunk<
  ProductRequirement,
  { requirementId: string; quantity?: number; notes?: string },
  { rejectValue: { message: string } }
>(
  'productRequirement/updateProductRequirement',
  async ({ requirementId, quantity, notes }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_PRODUCT_REQUIREMENT(requirementId),
        method: 'PUT',
        data: { quantity, notes },
      });

      if (response.status === 200) {
        return response.data as ProductRequirement;
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

// DELETE PRODUCT REQUIREMENT
export const deleteProductRequirement = createAsyncThunk<
  { requirementId: string },
  string,
  { rejectValue: { message: string } }
>(
  'productRequirement/deleteProductRequirement',
  async (requirementId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.DELETE_PRODUCT_REQUIREMENT(requirementId),
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { requirementId };
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

// ---------------- Slice ----------------
const productRequirementSlice = createSlice({
  name: 'productRequirements',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getProductRequirements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductRequirements.fulfilled, (state, action) => {
        state.loading = false;
        state.allRequirementsData = action.payload;
        state.requirements = action.payload.data;
      })
      .addCase(getProductRequirements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // ADD
      .addCase(addProductRequirement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductRequirement.fulfilled, (state, action) => {
        state.loading = false;
        state.requirements.push(action.payload);
      })
      .addCase(addProductRequirement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add product requirement failed';
      })

      // UPDATE
      .addCase(updateProductRequirement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductRequirement.fulfilled, (state, action) => {
        state.loading = false;
        state.requirements = state.requirements.map((requirement) =>
          requirement._id === action.payload._id ? action.payload : requirement
        );
      })
      .addCase(updateProductRequirement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update product requirement failed';
      })

      // DELETE
      .addCase(deleteProductRequirement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductRequirement.fulfilled, (state, action) => {
        state.loading = false;
        state.requirements = state.requirements.filter(
          (requirement) => requirement._id !== action.payload.requirementId
        );
      })
      .addCase(deleteProductRequirement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete product requirement failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectProductRequirementState = (state: RootState) => state.productRequirement;
export const selectProductRequirements = (state: RootState) => state.productRequirement.requirements;
export const selectProductRequirementLoading = (state: RootState) => state.productRequirement.loading;
export const selectAllProductRequirementsData = (state: RootState) => state.productRequirement.allRequirementsData;

// ---------------- Exports ----------------
export default productRequirementSlice.reducer;

