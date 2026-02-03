/**
 * HTTP client configuration for infrastructure layer.
 * Encapsulates Axios configuration and provides a preconfigured instance.
 */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type { ApiError } from "@shared/types/api";

class ApiClient {
  private readonly clientInstance: AxiosInstance;

  constructor() {
    this.clientInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "https://php.edtest.mx.devops1.territorio.la/proctoring/dashboard/src",
      timeout: 15000, // 15 seconds default timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupResponseInterceptors();
  }

  private setupResponseInterceptors(): void {
    this.clientInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const processedError: ApiError = {
          message: error.message || "Network error",
          code: error.code,
          details: error.response?.data,
        };
        // Only log errors during non-test modes to avoid noisy test output
        if (import.meta.env.MODE !== "test") {
          console.error("[ApiClient] Request error:", processedError);
        }
        return Promise.reject(processedError);
      },
    );
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.clientInstance.post<T>(endpoint, data, config);
    console.log("API POST Response:", response);
    return response.data.data;
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.clientInstance.get<T>(endpoint, config);
    return response.data.data;
  }
}

export const apiClient = new ApiClient();
