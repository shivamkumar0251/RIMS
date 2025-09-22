import axios from 'axios';
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  Method,
  InternalAxiosRequestConfig,
} from 'axios';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({});

const authUrls: string[] = ['user/login', 'user/forgotPassword'];

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const accessToken = localStorage.getItem('token');

    if (accessToken && config.url && !authUrls.includes(config.url)) {
      // Ensure headers exist
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (config.headers) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error('Error in API call:', error);

    if (error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      window.location.href = '/';
    }

    return Promise.reject(error.response?.data ?? error);
  },
);

// API caller params
interface ApiCallerParams {
  url: string;
  params?: Record<string, unknown>;
  data?: unknown;
  method?: Method;
}

// Generic API caller
async function apiCaller<T = unknown>({
  url,
  params,
  data = null,
  method = 'GET',
}: ApiCallerParams): Promise<AxiosResponse<T>> {
  return axiosInstance({
    method,
    url,
    data,
    params,
  });
}

export default apiCaller;
