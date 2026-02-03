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
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
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
        console.error("[ApiClient] Request error:", processedError);
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
    return response.data;
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.clientInstance.get<T>(endpoint, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
