import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------

export interface PurchaseReportItem {
    _id: string;
    productId: {
        _id: string;
        productName: string;
        unit: string;
        taxableValue: number;
        perUnitRate: number;
        categoryId?: { categoryName: string };
        vendorsId?: { vendor_name: string };
    };
    rcvdPurchaseQty: number;
    sendToStoreQty: number;
    currentPurchaseQty: number;
    createdAt: string;
}

export interface StockReportItem {
    productId: string;
    productName: string;
    unit: string;
    category: string;
    storeQty: number;
    kitchenQty: number;
    totalQty: number;
    stockAlert: number;
    status: string;
}

export interface ConsumptionReportItem {
    _id: string;
    productId: {
        _id: string;
        productName: string;
        unit: string;
        categoryId?: { categoryName: string };
    };
    openingStock: number;
    rcvdKitchenQty: number;
    transfersToUsage: number;
    transfersToWastage: number;
    closingStock: number;
    createdAt: string;
}

interface ReportState {
    loading: boolean;
    error: string | null;
    purchaseReport: PurchaseReportItem[];
    stockReport: StockReportItem[];
    consumptionReport: ConsumptionReportItem[];
    total: number;
}

const initialState: ReportState = {
    loading: false,
    error: null,
    purchaseReport: [],
    stockReport: [],
    consumptionReport: [],
    total: 0,
};

// ---------------- Thunks ----------------

export const getPurchaseReportThunk = createAsyncThunk<
    { data: PurchaseReportItem[]; total: number },
    { fromDate?: string; toDate?: string; vendorId?: string; productId?: string; categoryId?: string; page?: number; limit?: number },
    { rejectValue: { message: string } }
>(
    'report/getPurchaseReport',
    async (params, thunkAPI) => {
        try {
            const { fromDate = '', toDate = '', vendorId = 'all', productId = 'all', categoryId = '', page = 1, limit = 100 } = params;
            let url = `${API_ENDPOINTS.GET_PURCHASE_REPORT}?page=${page}&limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`;

            if (vendorId !== 'all') url += `&vendorId=${vendorId}`;
            if (productId !== 'all') url += `&productId=${productId}`;
            if (categoryId && categoryId !== 'all') url += `&categoryId=${categoryId}`;

            const response = await apiCaller({ url, method: 'GET' });

            if (response.status === 200) {
                return response.data as { data: PurchaseReportItem[]; total: number };
            }

            return thunkAPI.rejectWithValue({
                message: (response.data as { message?: string })?.message || 'Failed to fetch purchase report',
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || 'Error fetching purchase report',
            });
        }
    }
);

export const getStockReportThunk = createAsyncThunk<
    { data: StockReportItem[] },
    { categoryId?: string; productId?: string; stockStatus?: string },
    { rejectValue: { message: string } }
>(
    'report/getStockReport',
    async (params, thunkAPI) => {
        try {
            const { categoryId = 'all', productId = 'all', stockStatus = 'all' } = params;
            let url = `${API_ENDPOINTS.GET_STOCK_REPORT}?`;

            if (categoryId !== 'all') url += `categoryId=${categoryId}&`;
            if (productId !== 'all') url += `productId=${productId}&`;
            if (stockStatus !== 'all') url += `stockStatus=${stockStatus}`;

            const response = await apiCaller({ url, method: 'GET' });

            if (response.status === 200) {
                return response.data as { data: StockReportItem[] };
            }

            return thunkAPI.rejectWithValue({
                message: (response.data as { message?: string })?.message || 'Failed to fetch stock report',
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || 'Error fetching stock report',
            });
        }
    }
);

export const getConsumptionReportThunk = createAsyncThunk<
    { data: ConsumptionReportItem[]; total: number },
    { fromDate?: string; toDate?: string; productId?: string; categoryId?: string },
    { rejectValue: { message: string } }
>(
    'report/getConsumptionReport',
    async (params, thunkAPI) => {
        try {
            const { fromDate = '', toDate = '', productId = 'all', categoryId = 'all' } = params;
            let url = `${API_ENDPOINTS.GET_CONSUMPTION_REPORT}?fromDate=${fromDate}&toDate=${toDate}`;

            if (productId !== 'all') url += `&productId=${productId}`;
            if (categoryId !== 'all') url += `&categoryId=${categoryId}`;

            const response = await apiCaller({ url, method: 'GET' });

            if (response.status === 200) {
                return response.data as { data: ConsumptionReportItem[]; total: number };
            }

            return thunkAPI.rejectWithValue({
                message: (response.data as { message?: string })?.message || 'Failed to fetch consumption report',
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || 'Error fetching consumption report',
            });
        }
    }
);

// ---------------- Slice ----------------

const reportSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        clearReportData: (state) => {
            state.purchaseReport = [];
            state.stockReport = [];
            state.consumptionReport = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Purchase Report
            .addCase(getPurchaseReportThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPurchaseReportThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.purchaseReport = action.payload.data;
                state.total = action.payload.total;
            })
            .addCase(getPurchaseReportThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as { message: string })?.message || 'Error';
            })
            // Stock Report
            .addCase(getStockReportThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getStockReportThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.stockReport = action.payload.data;
            })
            .addCase(getStockReportThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as { message: string })?.message || 'Error';
            })
            // Consumption Report
            .addCase(getConsumptionReportThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getConsumptionReportThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.consumptionReport = action.payload.data;
            })
            .addCase(getConsumptionReportThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as { message: string })?.message || 'Error';
            });
    },
});

// ---------------- Selectors ----------------

export const selectReportState = (state: RootState) => state.reports;
export const selectPurchaseReport = (state: RootState) => state.reports.purchaseReport;
export const selectStockReport = (state: RootState) => state.reports.stockReport;
export const selectConsumptionReport = (state: RootState) => state.reports.consumptionReport;
export const selectReportLoading = (state: RootState) => state.reports.loading;

// ---------------- Exports ----------------

export const { clearReportData } = reportSlice.actions;
export default reportSlice.reducer;
