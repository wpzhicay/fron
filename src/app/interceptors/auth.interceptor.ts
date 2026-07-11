import { Injectable } from '@angular/core';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor {
  constructor(private authService: AuthService) {
    this.setupInterceptor();
  }

  private setupInterceptor() {
    // Request interceptor
    axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Token expirado o no válido
          this.authService.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}
