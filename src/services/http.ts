import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const TOKEN_KEY = 'toonflow_token';

export class HttpClient {
  private instance: AxiosInstance;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    this.instance = axios.create({
      baseURL: 'http://localhost:60000',
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
      return {
        message: (error.response.data as any)?.message || error.message,
        status: error.response.status,
        data: error.response.data,
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

  public get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  public patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }
}

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

export const http = new HttpClient();
