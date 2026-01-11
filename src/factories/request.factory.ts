/**
 * Request Factory Module
 * 
 * DESIGN PATTERN: Factory Pattern
 * 
 * Purpose: Encapsulates the creation of API request objects.
 * Provides standardized request structures for different HTTP methods.
 * 
 * Implementation:
 * - Static factory methods for each HTTP method
 * - Automatic header management
 * - Authentication token injection
 * 
 * Benefits:
 * - Consistent request structure
 * - Reduced boilerplate in tests
 * - Easy to add new request types
 * - Centralized header management
 * 
 * Usage:
 *   const getRequest = RequestFactory.createGetRequest('/users');
 *   const postRequest = RequestFactory.createPostRequest('/users/add', userData);
 *   const authRequest = RequestFactory.createAuthenticatedRequest('GET', '/users', token);
 */
import { ApiRequest } from '../types';

export class RequestFactory {
  
  /**
   * Factory Method: Create a GET request object
   * 
   * @param endpoint - API endpoint
   * @param headers - Optional custom headers
   * @returns ApiRequest object for GET
   */
  static createGetRequest(endpoint: string, headers?: Record<string, string>): ApiRequest {
    return {
      endpoint,
      method: 'GET',
      headers: headers || {},
    };
  }

  /**
   * Factory Method: Create a POST request object
   * 
   * Automatically adds Content-Type header
   * 
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Optional custom headers
   * @returns ApiRequest object for POST
   */
  static createPostRequest(
    endpoint: string,
    body: any,
    headers?: Record<string, string>
  ): ApiRequest {
    return {
      endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body,
    };
  }

  /**
   * Factory Method: Create a PUT request object
   * 
   * For full resource updates
   * 
   * @param endpoint - API endpoint
   * @param body - Request body
   * @param headers - Optional custom headers
   * @returns ApiRequest object for PUT
   */
  static createPutRequest(
    endpoint: string,
    body: any,
    headers?: Record<string, string>
  ): ApiRequest {
    return {
      endpoint,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body,
    };
  }

  /**
   * Factory Method: Create a PATCH request object
   * 
   * For partial resource updates
   * 
   * @param endpoint - API endpoint
   * @param body - Partial request body
   * @param headers - Optional custom headers
   * @returns ApiRequest object for PATCH
   */
  static createPatchRequest(
    endpoint: string,
    body: any,
    headers?: Record<string, string>
  ): ApiRequest {
    return {
      endpoint,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body,
    };
  }

  /**
   * Factory Method: Create a DELETE request object
   * 
   * @param endpoint - API endpoint
   * @param headers - Optional custom headers
   * @returns ApiRequest object for DELETE
   */
  static createDeleteRequest(endpoint: string, headers?: Record<string, string>): ApiRequest {
    return {
      endpoint,
      method: 'DELETE',
      headers: headers || {},
    };
  }

  /**
   * Factory Method: Create an authenticated request object
   * 
   * Adds Bearer token to Authorization header
   * 
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param token - Authentication token
   * @param body - Optional request body
   * @returns ApiRequest object with authentication
   */
  static createAuthenticatedRequest(
    method: string,
    endpoint: string,
    token: string,
    body?: any
  ): ApiRequest {
    return {
      endpoint,
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
    };
  }
}
