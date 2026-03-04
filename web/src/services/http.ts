import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

const TOKEN_KEY = 'toonflow_token';

const resolveApiBaseUrl = (): string => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location.port === '5173') {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:60000`;
  }

  return '';
};

export class HttpClient {
  private instance: AxiosInstance;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    this.instance = axios.create({
      baseURL: resolveApiBaseUrl(),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Retry logic for network errors or 5xx errors
        if (
          config &&
          (!error.response || (error.response.status >= 500 && error.response.status < 600))
        ) {
          config._retryCount = config._retryCount || 0;

          if (config._retryCount < this.maxRetries) {
            config._retryCount += 1;
            await this.delay(this.retryDelay * config._retryCount);
            return this.instance(config);
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private normalizeError(error: AxiosError): ApiError {
    if (error.response) {
      const responseData = error.response.data;
      const message =
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData &&
        typeof (responseData as { message?: unknown }).message === 'string'
          ? (responseData as { message: string }).message
          : error.message;

      return {
        message,
        status: error.response.status,
        data: responseData,
      };
    }
    return {
      message: error.message || 'Network error',
      status: 0,
    };
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  public clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  public get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  public post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  public put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  public delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  public patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }
}

export interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

export const http = new HttpClient();
