/**
 * Configuración centralizada del cliente HTTP para la aplicación.
 * Encapsula toda la configuración de Axios y proporciona una instancia preconfigurada.
 */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import type { ApiError } from "@/types/api";

class ApiClient {
  private readonly clientInstance: AxiosInstance;

  constructor() {
    this.clientInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
      timeout: 15000, // 15 segundos timeout por defecto
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupResponseInterceptors();
  }

  /**
   * Configura interceptores para manejar errores de forma consistente.
   */
  private setupResponseInterceptors(): void {
    this.clientInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const processedError: ApiError = {
          message: error.message || "Error de conexión",
          code: error.code,
          details: error.response?.data,
        };
        console.error("[ApiClient] Error en petición:", processedError);
        return Promise.reject(processedError);
      },
    );
  }

  /**
   * Ejecuta una petición POST con tipado seguro.
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.clientInstance.post<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Ejecuta una petición GET con tipado seguro.
   */
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.clientInstance.get<T>(endpoint, config);
    return response.data;
  }

  // Podrían añadirse más métodos (put, delete, etc.) siguiendo el mismo patrón
}

// Exportar una única instancia singleton para toda la aplicación
export const apiClient = new ApiClient();
