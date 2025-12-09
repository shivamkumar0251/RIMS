import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------
export interface Product {
  _id: string;
  productName?: string;
  [key: string]: any;
}

interface ProductState {
  loading: boolean;
  error: string | null;
  products: Product[];
  allProductsData: GetProductsResponse | null;
}

// ---------------- BULK UPLOAD PRODUCT via EXCEL ----------------
export interface BulkProductExcelResponse {
  success: boolean;
  inserted: number;
  failed: number;
  errors?: { row: number; message: string }[];
  data: Product[];
}

// GET products
interface GetProductsResponse {
  success: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  count: number;
  data: Product[];
}

// ---------------- Initial State ----------------
const initialState: ProductState = {
  loading: false,
  error: null,
  products: [],
  allProductsData: null,
};

// ---------------- Thunks ----------------
export const getProducts = createAsyncThunk<
  GetProductsResponse,
  { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string },
  { rejectValue: { message: string } }
>(
  'product/getProducts',
  async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '' }, thunkAPI) => {
    try {
      const url = `${API_ENDPOINTS.GET_PRODUCTS}?search=${search}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

      const response = await apiCaller({ url, method: 'GET' });

      if (response.status === 200) {
        const body = response.data as GetProductsResponse;
        return body;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Failed to fetch products',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Error fetching products',
      });
    }
  }
);

// ADD PRODUCT
export const addProduct = createAsyncThunk<
  Product,
  Partial<Product>,
  { rejectValue: { message: string } }
>(
  'product/addProduct',
  async (productData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_PRODUCTS,
        method: 'POST',
        data: productData,
      });

      if (response.status === 201) {
        return response?.data as Product;
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Add product failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// ADD BULK-EXCEL
export const addProductBulkExcel = createAsyncThunk<
  BulkProductExcelResponse,
  FormData,
  { rejectValue: { message: string } }
>(
  'product/addProductBulkExcel',
  async (formData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.ADD_BULK_EXCEL_PRODUCTS,
        method: 'POST',
        data: formData,
      });

      if (response.status === 201 || response.status === 200) {
        return response.data as BulkProductExcelResponse;
      }

      return thunkAPI.rejectWithValue({
        message:
          (response.data as { message?: string })?.message ||
          'Bulk product upload failed',
      });

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error in bulk upload',
      });
    }
  }
);

// UPDATE PRODUCT
export const updateProduct = createAsyncThunk<
  Product,
  { productId: string; productData: Partial<Product> },
  { rejectValue: { message: string } }
>(
  'product/updateProduct',
  async ({ productId, productData }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.UPDATE_PRODUCTS(productId),
        method: 'PUT',
        data: productData,
      });

      if (response.status === 200) {
        return response.data as Product;
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

// BULK UPDATE PRODUCTS
export const bulkUpdateProducts = createAsyncThunk<
  { updated: number },
  FormData,
  { rejectValue: { message: string } }
>(
  'product/bulkUpdateProducts',
  async (formData, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.BULK_UPDATE_PRODUCTS,
        method: 'PUT',
        data: formData,
      });

      if (response.status === 200) {
        return response.data as { updated: number };
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Bulk update failed',
      });
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return thunkAPI.rejectWithValue({
        message: err.response?.data?.message || 'Server error',
      });
    }
  }
);

// DELETE PRODUCT
export const deleteProduct = createAsyncThunk<
  { productId: string },
  string,
  { rejectValue: { message: string } }
>(
  'product/deleteProduct',
  async (productId, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.DELETE_PRODUCTS(productId),
        method: 'DELETE',
      });

      if (response.status === 200) {
        return { productId };
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

// BULK DELETE PRODUCTS
export const bulkDeleteProducts = createAsyncThunk<
  { deletedIds: string[] },
  { ids: string[] },
  { rejectValue: { message: string } }
>(
  'product/bulkDeleteProducts',
  async ({ ids }, thunkAPI) => {
    try {
      const response = await apiCaller({
        url: API_ENDPOINTS.BULK_DELETE_PRODUCTS,
        method: 'DELETE',
        data: { ids },
      });

      if (response.status === 200) {
        return { deletedIds: ids };
      }

      return thunkAPI.rejectWithValue({
        message: (response.data as { message?: string })?.message || 'Bulk delete failed',
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
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.allProductsData = action.payload;
        state.products = action.payload.data;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error';
      })

      // ADD
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Add product failed';
      })
      .addCase(addProductBulkExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductBulkExcel.fulfilled, (state, action) => {
        state.loading = false;

        // Merge uploaded products into existing list
        if (action.payload?.data?.length) {
          state.products = [...state.products, ...action.payload.data];
        }
      })
      .addCase(addProductBulkExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Bulk upload failed';
      })

      // UPDATE
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.map((product) =>
          product._id === action.payload._id ? action.payload : product
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Update product failed';
      })

      // BULK UPDATE
      .addCase(bulkUpdateProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateProducts.fulfilled, (state) => {
        state.loading = false;
        // Note: You may need to refetch products after bulk update
      })
      .addCase(bulkUpdateProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Bulk update failed';
      })

      // DELETE
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (product) => product._id !== action.payload.productId
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Delete product failed';
      })

      // BULK DELETE
      .addCase(bulkDeleteProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkDeleteProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (product) => !action.payload.deletedIds.includes(product._id)
        );
      })
      .addCase(bulkDeleteProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Bulk delete failed';
      });
  },
});

// ---------------- Selectors ----------------
export const selectProductState = (state: RootState) => state.product;
export const selectProducts = (state: RootState) => state.product.products;
export const selectProductLoading = (state: RootState) => state.product.loading;
export const selectAllProductsData = (state: RootState) => state.product.allProductsData;

// ---------------- Exports ----------------
export default productSlice.reducer;

