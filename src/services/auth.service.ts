/**
 * Authentication Service Module
 * 
 * DESIGN PATTERNS USED:
 * - Singleton Pattern: Uses Config.getInstance() for credentials
 * - Factory Pattern: Could be extended to use RequestFactory for login requests
 * 
 * Purpose: Handles authentication operations including login, token management,
 * and authorization header generation.
 * 
 * Token Management:
 * - Stores accessToken after successful login
 * - Provides Bearer token header for authenticated requests
 * - Supports manual token injection for testing
 * 
 * Usage:
 *   const authService = new AuthService(request);
 *   await authService.login();
 *   const header = authService.getAuthHeader();
 */
import { APIRequestContext } from '@playwright/test';
import { Config } from '../config/config';
import { LoginResponse } from '../types';

export class AuthService {
  private apiContext: APIRequestContext;
  
  // Token storage for authenticated requests
  private token: string | null = null;

  constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
  }

  /**
   * Login and get authentication token
   * 
   * Singleton Pattern: Uses Config.getInstance() to get default credentials
   * 
   * @param username - Optional username (defaults to config value)
   * @param password - Optional password (defaults to config value)
   * @returns Login response with accessToken and refreshToken
   */
  async login(username?: string, password?: string): Promise<LoginResponse> {
    // Singleton Pattern: Get credentials from Config singleton
    const config = Config.getInstance().getApiConfig();
    const loginData = {
      username: username || config.username,
      password: password || config.password,
    };

    const response = await this.apiContext.post('/auth/login', {
      data: loginData,
    });

    if (!response.ok()) {
      throw new Error(`Login failed with status ${response.status()}`);
    }

    const loginResponse: LoginResponse = await response.json();
    this.token = loginResponse.accessToken;
    return loginResponse;
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Set authentication token manually
   * Useful for testing with pre-generated tokens
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Get authorization header for authenticated requests
   * Returns empty object if no token is available
   */
  getAuthHeader(): Record<string, string> {
    if (!this.token) {
      return {};
    }
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }
}
