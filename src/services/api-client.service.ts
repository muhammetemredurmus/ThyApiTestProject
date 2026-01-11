/**
 * API Client Service Module
 * 
 * DESIGN PATTERNS USED:
 * - Singleton Pattern: Uses Config.getInstance() for API configuration
 * - Repository Pattern: Uses ApiLogRepository for database logging
 * 
 * Purpose: Provides a unified API client with automatic request/response logging.
 * All API interactions are intercepted and logged to PostgreSQL for analysis.
 * 
 * Features:
 * - GET, POST, PUT, PATCH, DELETE methods
 * - Automatic request/response logging via Repository Pattern
 * - Response time measurement
 * - Error handling and logging
 * 
 * Usage:
 *   const client = new ApiClientService(request, true);
 *   const response = await client.get('/users');
 */
import { APIRequestContext, APIResponse } from '@playwright/test';
import { Config } from '../config/config';
import { ApiLogRepository } from '../repositories/api-log.repository';
import { DatabaseService } from './database.service';
import { ApiRequest, ApiResponseLog } from '../types';

export class ApiClientService {
  private apiContext: APIRequestContext;
  private config: Config;
  
  // Repository Pattern: Repository for database operations
  private logRepository: ApiLogRepository | null = null;
  
  private baseUrl: string;
  private enableDbLogging: boolean = false;

  /**
   * Create API Client Service
   * 
   * @param apiContext - Playwright APIRequestContext
   * @param enableDbLogging - Enable database logging via Repository Pattern
   */
  constructor(apiContext: APIRequestContext, enableDbLogging: boolean = false) {
    this.apiContext = apiContext;
    
    // Singleton Pattern: Get configuration from Config singleton
    this.config = Config.getInstance();
    this.baseUrl = this.config.getApiConfig().baseUrl;
    this.enableDbLogging = enableDbLogging;
    
    // Repository Pattern: Initialize repository if DB logging is enabled
    // Uses Singleton Pattern: DatabaseService.getInstance()
    if (enableDbLogging && DatabaseService.getInstance().isInitialized()) {
      this.logRepository = new ApiLogRepository();
    }
  }

  /**
   * Make GET request
   * 
   * Repository Pattern: Logs request and response to database
   */
  async get(
    endpoint: string,
    options: { headers?: Record<string, string>; params?: Record<string, string> } = {}
  ): Promise<APIResponse> {
    const url = this.buildUrl(endpoint, options.params);
    const startTime = Date.now();

    // Repository Pattern: Create and log request
    const request: ApiRequest = {
      endpoint: url,
      method: 'GET',
      headers: options.headers || {},
    };
    let requestId: number | null = null;
    if (this.logRepository) {
      requestId = await this.logRepository.logRequest(request);
    }

    try {
      const response = await this.apiContext.get(url, {
        headers: options.headers,
      });

      // Repository Pattern: Log response
      if (requestId !== null) {
        await this.logResponse(requestId, response, startTime);
      }

      return response;
    } catch (error) {
      // Repository Pattern: Log error response
      if (requestId !== null) {
        await this.logErrorResponse(requestId, error, startTime);
      }
      throw error;
    }
  }

  /**
   * Make POST request
   * 
   * Repository Pattern: Logs request body and response to database
   */
  async post(
    endpoint: string,
    options: {
      data?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    const startTime = Date.now();

    // Repository Pattern: Create and log request with body
    const request: ApiRequest = {
      endpoint: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.data,
    };
    let requestId: number | null = null;
    if (this.logRepository) {
      requestId = await this.logRepository.logRequest(request);
    }

    try {
      const response = await this.apiContext.post(url, {
        data: options.data,
        headers: request.headers,
      });

      // Repository Pattern: Log response
      if (requestId !== null) {
        await this.logResponse(requestId, response, startTime);
      }

      return response;
    } catch (error) {
      // Repository Pattern: Log error response
      if (requestId !== null) {
        await this.logErrorResponse(requestId, error, startTime);
      }
      throw error;
    }
  }

  /**
   * Make PUT request
   * 
   * Repository Pattern: Logs full update request to database
   */
  async put(
    endpoint: string,
    options: {
      data?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    const startTime = Date.now();

    // Repository Pattern: Create and log request
    const request: ApiRequest = {
      endpoint: url,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.data,
    };
    let requestId: number | null = null;
    if (this.logRepository) {
      requestId = await this.logRepository.logRequest(request);
    }

    try {
      const response = await this.apiContext.put(url, {
        data: options.data,
        headers: request.headers,
      });

      // Repository Pattern: Log response
      if (requestId !== null) {
        await this.logResponse(requestId, response, startTime);
      }

      return response;
    } catch (error) {
      // Repository Pattern: Log error response
      if (requestId !== null) {
        await this.logErrorResponse(requestId, error, startTime);
      }
      throw error;
    }
  }

  /**
   * Make PATCH request
   * 
   * Repository Pattern: Logs partial update request to database
   */
  async patch(
    endpoint: string,
    options: {
      data?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    const startTime = Date.now();

    // Repository Pattern: Create and log request
    const request: ApiRequest = {
      endpoint: url,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.data,
    };
    let requestId: number | null = null;
    if (this.logRepository) {
      requestId = await this.logRepository.logRequest(request);
    }

    try {
      const response = await this.apiContext.patch(url, {
        data: options.data,
        headers: request.headers,
      });

      // Repository Pattern: Log response
      if (requestId !== null) {
        await this.logResponse(requestId, response, startTime);
      }

      return response;
    } catch (error) {
      // Repository Pattern: Log error response
      if (requestId !== null) {
        await this.logErrorResponse(requestId, error, startTime);
      }
      throw error;
    }
  }

  /**
   * Make DELETE request
   * 
   * Repository Pattern: Logs delete request to database
   */
  async delete(
    endpoint: string,
    options: { headers?: Record<string, string> } = {}
  ): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    const startTime = Date.now();

    // Repository Pattern: Create and log request
    const request: ApiRequest = {
      endpoint: url,
      method: 'DELETE',
      headers: options.headers || {},
    };
    let requestId: number | null = null;
    if (this.logRepository) {
      requestId = await this.logRepository.logRequest(request);
    }

    try {
      const response = await this.apiContext.delete(url, {
        headers: options.headers,
      });

      // Repository Pattern: Log response
      if (requestId !== null) {
        await this.logResponse(requestId, response, startTime);
      }

      return response;
    } catch (error) {
      // Repository Pattern: Log error response
      if (requestId !== null) {
        await this.logErrorResponse(requestId, error, startTime);
      }
      throw error;
    }
  }

  /**
   * Build full URL with query parameters
   * 
   * Singleton Pattern: Uses baseUrl from Config singleton
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    let url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Log successful response to database
   * 
   * Repository Pattern: Uses ApiLogRepository for database operations
   */
  private async logResponse(
    requestId: number,
    response: APIResponse,
    startTime: number
  ): Promise<void> {
    if (!this.logRepository) {
      return;
    }

    const responseTime = Date.now() - startTime;
    let responseBody: any = null;
    let responseHeaders: Record<string, string> = {};

    try {
      responseBody = await response.json();
    } catch {
      try {
        responseBody = await response.text();
      } catch {
        // Response body might be empty
      }
    }

    try {
      responseHeaders = response.headers();
    } catch {
      // Headers might not be available
    }

    // Repository Pattern: Log response via repository
    const responseLog: ApiResponseLog = {
      requestId,
      statusCode: response.status(),
      headers: responseHeaders,
      body: responseBody,
      responseTimeMs: responseTime,
    };

    await this.logRepository.logResponse(responseLog);
  }

  /**
   * Log error response to database
   * 
   * Repository Pattern: Logs errors for debugging and analysis
   */
  private async logErrorResponse(
    requestId: number,
    error: any,
    startTime: number
  ): Promise<void> {
    if (!this.logRepository) {
      return;
    }

    const responseTime = Date.now() - startTime;

    // Repository Pattern: Log error response
    const responseLog: ApiResponseLog = {
      requestId,
      statusCode: error.status || 500,
      headers: {},
      body: { error: error.message || 'Unknown error' },
      responseTimeMs: responseTime,
    };

    try {
      await this.logRepository.logResponse(responseLog);
    } catch (logError) {
      console.error('Failed to log error response:', logError);
    }
  }
}
