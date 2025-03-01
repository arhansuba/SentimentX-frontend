import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Default API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.sentinel.multiversx.com';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Api class provides a base client for all API services in the application
 */
export class Api {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle specific error cases
        if (error.response) {
          // Server responded with a status code outside the 2xx range
          if (error.response.status === 401) {
            // Unauthorized - clear auth token and redirect to login
            this.clearAuthToken();
            window.location.href = '/unlock';
          } else if (error.response.status === 403) {
            // Forbidden - user doesn't have permission
            console.error('Permission denied:', error.response.data.message || 'You do not have permission to access this resource');
          } else if (error.response.status === 429) {
            // Rate limited
            console.error('Rate limited. Please try again later.');
          }
        } else if (error.request) {
          // Request was made but no response received (network error)
          console.error('Network error. Please check your connection.');
        } else {
          // Error in setting up the request
          console.error('Error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set auth token for protected API calls
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('sentinel_auth_token', token);
  }

  /**
   * Clear auth token
   */
  public clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('sentinel_auth_token');
  }

  /**
   * Restore auth token from local storage
   */
  public restoreAuthToken(): boolean {
    const token = localStorage.getItem('sentinel_auth_token');
    if (token) {
      this.authToken = token;
      return true;
    }
    return false;
  }

  /**
   * GET request wrapper
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  /**
   * POST request wrapper
   */
  public async post<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  /**
   * PUT request wrapper
   */
  public async put<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  /**
   * DELETE request wrapper
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  /**
   * PATCH request wrapper
   */
  public async patch<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }
}

// Create a default instance
const api = new Api();

// Try to restore auth token on initialization
api.restoreAuthToken();

export default api;