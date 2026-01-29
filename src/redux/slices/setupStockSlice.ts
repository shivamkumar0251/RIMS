import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';
import type { ProductInterface } from './productSlice';

// ---------------- Types ----------------

export interface SetupStockPostData {
    productId: string;
    qty: number;
    expiryDate?: string;
    type?: string;
}

export interface SetupStock {
    _id: string;
    franchiseId: string;
    productId: ProductInterface;
    openingStock: number;
    rcvdQty: number;
    closingStock: number;
    expiryDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}
// GET setup stocks
interface GetSetupStocksResponse {
    success: boolean;
    data: SetupStock[];
    pagination: PaginationInfo;
}

// ---------------- Initial State ----------------
interface SetupStockState {
    loading: boolean;
    error: string | null;
    setupStocks: SetupStock[];
    allSetupStocksData: GetSetupStocksResponse | null;
}
const initialState: SetupStockState = {
    loading: false,
    error: null,
    setupStocks: [],
    allSetupStocksData: null,
};

// ---------------- Thunks ----------------
export const getSetupStocks = createAsyncThunk<
    GetSetupStocksResponse,
    { search?: string; page?: number; limit?: number; fromDate?: string; toDate?: string, categoryId?: string, vendorId?: string, companyId?: string, },
    { rejectValue: { message: string } }
>(
    'setupStock/getSetupStocks',
    async ({ search = '', page = 1, limit = 5, fromDate = '', toDate = '', categoryId = '', vendorId = '', companyId = '', }, thunkAPI) => {
        try {
            const url = `${API_ENDPOINTS.GET_SETUP_STOCK}?search=${search}&categoryId=${categoryId}&vendorId=${vendorId}&companyId=${companyId}&page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

            const response = await apiCaller({ url, method: 'GET' });

            if (response.status === 200) {
                const body = response.data as GetSetupStocksResponse;
                return body;
            }

            return thunkAPI.rejectWithValue({
                message: (response.data as { message?: string })?.message || 'Failed to fetch setup stocks',
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || 'Error fetching setup stocks',
            });
        }
    }
);

// ADD SETUP STOCK
export const addSetupStock = createAsyncThunk<
    SetupStock,
    SetupStockPostData[],
    { rejectValue: { message: string } }
>(
    'setupStock/addSetupStock',
    async (setupStockData, thunkAPI) => {
        try {
            const response = await apiCaller({
                url: API_ENDPOINTS.ADD_BULK_SETUP_STOCK,
                method: 'POST',
                data: setupStockData,
            });

            if (response.status === 201 || response.status === 200) {
                return response?.data as SetupStock;
            }

            return thunkAPI.rejectWithValue({
                message: (response.data as { message?: string })?.message || 'Add setup stock failed',
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || 'Server error',
            });
        }
    }
);

// UPDATE SETUP STOCK
export const updateSetupStock = createAsyncThunk<
    SetupStock,
    { setupStockId: string; setupStockData: Partial<SetupStock> },
    { rejectValue: { message: string } }
>(
    'setupStock/updateSetupStock',
    async ({ setupStockId, setupStockData }, thunkAPI) => {
        try {
            const response = await apiCaller({
                url: API_ENDPOINTS.UPDATE_SETUP_STOCK(setupStockId),
                method: 'PUT',
                data: setupStockData,
            });

            if (response.status === 200) {
                const responseData = response.data as any;
                return (responseData.data || responseData) as SetupStock;
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

// DELETE SETUP STOCK
export const deleteSetupStock = createAsyncThunk<
    { setupStockId: string },
    string,
    { rejectValue: { message: string } }
>(
    'setupStock/deleteSetupStock',
    async (setupStockId, thunkAPI) => {
        try {
            const response = await apiCaller({
                url: API_ENDPOINTS.DELETE_SETUP_STOCK(setupStockId),
                method: 'DELETE',
            });

            if (response.status === 200) {
                return { setupStockId };
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
const setupStockSlice = createSlice({
    name: 'setupStocks',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // GET
            .addCase(getSetupStocks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSetupStocks.fulfilled, (state, action) => {
                state.loading = false;
                state.allSetupStocksData = action.payload;
                state.setupStocks = action.payload.data;
            })
            .addCase(getSetupStocks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Error';
            })

            // ADD
            .addCase(addSetupStock.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addSetupStock.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(addSetupStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Add setup stock failed';
            })

            // UPDATE
            .addCase(updateSetupStock.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSetupStock.fulfilled, (state, action) => {
                state.loading = false;
                state.setupStocks = state.setupStocks.map((setupStock) =>
                    setupStock._id === action.payload._id ? { ...setupStock, ...action.payload } : setupStock
                );
            })
            .addCase(updateSetupStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Update setup stock failed';
            })

            // DELETE
            .addCase(deleteSetupStock.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSetupStock.fulfilled, (state, action) => {
                state.loading = false;
                state.setupStocks = state.setupStocks.filter(
                    (setupStock) => setupStock._id !== action.payload.setupStockId
                );
            })
            .addCase(deleteSetupStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Delete setup stock failed';
            });
    },
});

// ---------------- Selectors ----------------
export const selectSetupStockState = (state: RootState) => state.setupStock;
export const selectSetupStocks = (state: RootState) => state.setupStock.setupStocks;
export const selectSetupStockLoading = (state: RootState) => state.setupStock.loading;
export const selectAllSetupStocksData = (state: RootState) => state.setupStock.allSetupStocksData;

// ---------------- Exports ----------------
export default setupStockSlice.reducer;
