import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import apiCaller from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { RootState } from '../store/store';

// ---------------- Types ----------------

export interface DashboardKPI {
    storeItems: number;
    kitchenItems: number;
    lowAlerts: number;
    usageToday: number;
    wastageToday: number;
}

export interface DailyStats {
    receivedProducts: number;
    issuedQty: number;
    consumedQty: number;
}

export interface CriticalItem {
    _id: string;
    productId: {
        _id: string;
        productName: string;
        packSize: string;
        unit: string;
        stockAlert?: number;
    };
    location: string;
    closingStock: number;
    unit: string;
}

export interface ActivityFeedItem {
    type: 'STORE' | 'ISSUE' | 'CONSUME';
    item: string;
    date: string;
    qty: number;
    user: string;
}

export interface TrendItem {
    day: string;
    usage: number;
    wastage: number;
}

export interface DashboardData {
    kpi: DashboardKPI;
    dailyStats: DailyStats;
    criticalItems: CriticalItem[];
    activityFeed: ActivityFeedItem[];
    trends: TrendItem[];
}

export interface DashboardState {
    loading: boolean;
    error: string | null;
    data: DashboardData | null;
}

const initialState: DashboardState = {
    loading: false,
    error: null,
    data: null,
};

// ---------------- Thunks ----------------

export const getDashboardStats = createAsyncThunk<
    DashboardData,
    void,
    { rejectValue: { message: string } }
>(
    'dashboard/getStats',
    async (_, thunkAPI) => {
        try {
            const response = await apiCaller({
                url: API_ENDPOINTS.GET_DASHBOARD_STATS,
                method: 'GET'
            });

            if (response.status === 200) {
                return (response.data as { data: DashboardData }).data;
            }

            return thunkAPI.rejectWithValue({
                message: 'Failed to fetch dashboard stats',
            });
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return thunkAPI.rejectWithValue({
                message: err.response?.data?.message || 'Error fetching dashboard stats',
            });
        }
    }
);

// ---------------- Slice ----------------

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(getDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Error';
            });
    },
});

// ---------------- Selectors ----------------
export const selectDashboardState = (state: RootState) => state.dashboard;
export const selectDashboardData = (state: RootState) => state.dashboard.data;
export const selectDashboardLoading = (state: RootState) => state.dashboard.loading;

export default dashboardSlice.reducer;
