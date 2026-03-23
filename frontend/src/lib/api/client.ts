import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Axios instance with interceptors for centralized error handling
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor
 * - Add auth token if available (future)
 * - Log requests in development
 */
apiClient.interceptors.request.use(
  (config) => {
    // Future: Add auth token here
    // const token = localStorage.getItem('auth-token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    if (process.env.NODE_ENV === "development") {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * - Handle common errors (401, 500, network)
 * - Show toast notifications
 * - Log errors in development
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Network error (no response)
    if (!error.response) {
      toast.error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle specific status codes
    switch (status) {
      case 401:
        // Unauthorized - redirect to login (future)
        toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        // Future: Redirect to login
        break;

      case 403:
        toast.error("Bạn không có quyền thực hiện hành động này.");
        break;

      case 404:
        toast.error("Không tìm thấy tài nguyên yêu cầu.");
        break;

      case 500:
      case 502:
      case 503:
        toast.error("Lỗi máy chủ. Vui lòng thử lại sau.");
        break;

      default:
        // Try to extract error message from response
        const errorMessage =
          (data as any)?.message ||
          (data as any)?.detail ||
          "Đã xảy ra lỗi không xác định.";
        toast.error(errorMessage);
    }

    // Log error details in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[API Error] ${status}:`, error);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper type for API responses
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  code?: number;
}

/**
 * Helper function for GET requests with better typing
 */
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

/**
 * Helper function for POST requests
 */
export async function post<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

/**
 * Helper function for PUT requests
 */
export async function put<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

/**
 * Helper function for DELETE requests
 */
export async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

export default apiClient;
