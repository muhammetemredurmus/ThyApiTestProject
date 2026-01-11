/**
 * API Log Repository Module
 * 
 * DESIGN PATTERN: Repository Pattern
 * 
 * Purpose: Abstracts and encapsulates all database operations for API logging.
 * Provides a clean interface between the domain layer and data access layer.
 * 
 * Implementation:
 * - Uses Singleton Pattern: DatabaseService.getInstance() for connection
 * - Separates SQL queries from business logic
 * - Provides CRUD operations for API logs
 * 
 * Benefits:
 * - Single point of database access for API logs
 * - Easy to test with mock database
 * - Clean separation of concerns
 * - Centralized query management
 * 
 * Database Schema:
 * - api_test.api_requests: Stores request data
 * - api_test.api_responses: Stores response data (linked to requests)
 * 
 * Usage:
 *   const repository = new ApiLogRepository();
 *   const requestId = await repository.logRequest(request);
 *   await repository.logResponse({ requestId, ...responseData });
 */
import { DatabaseService } from '../services/database.service';
import { ApiRequest, ApiResponseLog } from '../types';

export class ApiLogRepository {
  // Singleton Pattern: Uses DatabaseService singleton
  private dbService: DatabaseService;

  /**
   * Initialize repository with database service
   * 
   * Singleton Pattern: Gets DatabaseService instance
   */
  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  /**
   * Repository Method: Log API request to database
   * 
   * Inserts request data into api_requests table
   * 
   * @param request - API request data
   * @returns Generated request ID
   */
  async logRequest(request: ApiRequest): Promise<number> {
    const query = `
      INSERT INTO api_test.api_requests (endpoint, method, headers, body)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    // Convert objects to JSON for JSONB columns
    const headersJson = request.headers ? JSON.stringify(request.headers) : null;
    const bodyJson = request.body ? JSON.stringify(request.body) : null;

    const result = await this.dbService.query(query, [
      request.endpoint,
      request.method,
      headersJson,
      bodyJson,
    ]);

    return result.rows[0].id;
  }

  /**
   * Repository Method: Log API response to database
   * 
   * Inserts response data linked to request via foreign key
   * 
   * @param response - API response data with requestId
   * @returns Generated response ID
   */
  async logResponse(response: ApiResponseLog): Promise<number> {
    const query = `
      INSERT INTO api_test.api_responses (request_id, status_code, headers, body, response_time_ms)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;

    // Convert objects to JSON for JSONB columns
    const headersJson = response.headers ? JSON.stringify(response.headers) : null;
    const bodyJson = response.body ? JSON.stringify(response.body) : null;

    const result = await this.dbService.query(query, [
      response.requestId,
      response.statusCode,
      headersJson,
      bodyJson,
      response.responseTimeMs,
    ]);

    return result.rows[0].id;
  }

  /**
   * Repository Method: Get all API requests
   * 
   * Retrieves all logged requests ordered by timestamp
   * 
   * @returns Array of request records
   */
  async getAllRequests(): Promise<any[]> {
    const query = `
      SELECT * FROM api_test.api_requests
      ORDER BY timestamp DESC;
    `;
    const result = await this.dbService.query(query);
    return result.rows;
  }

  /**
   * Repository Method: Get all API responses
   * 
   * Retrieves all logged responses ordered by timestamp
   * 
   * @returns Array of response records
   */
  async getAllResponses(): Promise<any[]> {
    const query = `
      SELECT * FROM api_test.api_responses
      ORDER BY timestamp DESC;
    `;
    const result = await this.dbService.query(query);
    return result.rows;
  }

  /**
   * Repository Method: Get request with its response
   * 
   * Joins request and response tables for complete log
   * 
   * @param requestId - ID of the request to retrieve
   * @returns Combined request and response data
   */
  async getRequestWithResponse(requestId: number): Promise<any> {
    const query = `
      SELECT 
        r.*,
        res.status_code,
        res.headers as response_headers,
        res.body as response_body,
        res.response_time_ms,
        res.timestamp as response_timestamp
      FROM api_test.api_requests r
      LEFT JOIN api_test.api_responses res ON r.id = res.request_id
      WHERE r.id = $1;
    `;
    const result = await this.dbService.query(query, [requestId]);
    return result.rows[0];
  }

  /**
   * Repository Method: Get requests by endpoint
   * 
   * Filter requests by endpoint pattern
   * 
   * @param endpoint - Endpoint pattern to search
   * @returns Array of matching request records
   */
  async getRequestsByEndpoint(endpoint: string): Promise<any[]> {
    const query = `
      SELECT * FROM api_test.api_requests
      WHERE endpoint LIKE $1
      ORDER BY timestamp DESC;
    `;
    const result = await this.dbService.query(query, [`%${endpoint}%`]);
    return result.rows;
  }

  /**
   * Repository Method: Get requests by HTTP method
   * 
   * Filter requests by HTTP method
   * 
   * @param method - HTTP method (GET, POST, etc.)
   * @returns Array of matching request records
   */
  async getRequestsByMethod(method: string): Promise<any[]> {
    const query = `
      SELECT * FROM api_test.api_requests
      WHERE method = $1
      ORDER BY timestamp DESC;
    `;
    const result = await this.dbService.query(query, [method]);
    return result.rows;
  }

  /**
   * Repository Method: Get failed responses
   * 
   * Retrieves responses with error status codes (>= 400)
   * 
   * @returns Array of failed response records
   */
  async getFailedResponses(): Promise<any[]> {
    const query = `
      SELECT 
        r.endpoint,
        r.method,
        res.*
      FROM api_test.api_responses res
      JOIN api_test.api_requests r ON r.id = res.request_id
      WHERE res.status_code >= 400
      ORDER BY res.timestamp DESC;
    `;
    const result = await this.dbService.query(query);
    return result.rows;
  }
}
