/**
 * Validation Utility Module
 * 
 * DESIGN PATTERN: Utility/Helper Pattern
 * 
 * Purpose: Provides reusable validation functions for API response testing.
 * Centralizes validation logic to avoid code duplication across tests.
 * 
 * Features:
 * - Status code validation
 * - Required field validation
 * - Type checking
 * - Array response validation
 * - Pagination validation
 * - User object validation
 * 
 * Usage:
 *   ValidationUtil.validateStatusCode(response.status(), 200);
 *   ValidationUtil.validateUser(userData);
 *   ValidationUtil.validatePaginationResponse(listResponse);
 */
export class ValidationUtil {
  
  /**
   * Validate HTTP status code
   * 
   * @param actual - Actual status code from response
   * @param expected - Expected status code
   * @throws Error if status codes don't match
   */
  static validateStatusCode(actual: number, expected: number): void {
    if (actual !== expected) {
      throw new Error(`Expected status code ${expected}, but got ${actual}`);
    }
  }

  /**
   * Validate object has required fields
   * 
   * Checks that all specified fields exist and are not null/undefined
   * 
   * @param obj - Object to validate
   * @param requiredFields - Array of required field names
   * @throws Error with list of missing fields
   */
  static validateRequiredFields(obj: any, requiredFields: string[]): void {
    const missingFields: string[] = [];
    for (const field of requiredFields) {
      if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
        missingFields.push(field);
      }
    }
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Validate field data type
   * 
   * @param value - Value to check
   * @param expectedType - Expected JavaScript type
   * @param fieldName - Field name for error message
   * @throws Error if type doesn't match
   */
  static validateType(value: any, expectedType: string, fieldName: string): void {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new Error(
        `Field '${fieldName}' expected type '${expectedType}', but got '${actualType}'`
      );
    }
  }

  /**
   * Validate array response structure
   * 
   * Ensures response is an array and optionally validates first item fields
   * 
   * @param response - Response to validate
   * @param expectedFields - Optional fields to check in array items
   * @throws Error if not an array
   */
  static validateArrayResponse(response: any, expectedFields?: string[]): void {
    if (!Array.isArray(response)) {
      throw new Error('Expected array response, but got non-array');
    }

    if (expectedFields && response.length > 0) {
      const firstItem = response[0];
      this.validateRequiredFields(firstItem, expectedFields);
    }
  }

  /**
   * Validate pagination response structure
   * 
   * Validates DummyJSON pagination format with users, total, skip, limit
   * 
   * @param response - Pagination response to validate
   * @throws Error if structure is invalid
   */
  static validatePaginationResponse(response: any): void {
    const requiredFields = ['users', 'total', 'skip', 'limit'];
    this.validateRequiredFields(response, requiredFields);

    if (!Array.isArray(response.users)) {
      throw new Error('Expected users to be an array');
    }

    if (typeof response.total !== 'number') {
      throw new Error('Expected total to be a number');
    }

    if (typeof response.skip !== 'number') {
      throw new Error('Expected skip to be a number');
    }

    if (typeof response.limit !== 'number') {
      throw new Error('Expected limit to be a number');
    }
  }

  /**
   * Validate user object structure
   * 
   * Validates required user fields and their types
   * Used across all user-related tests
   * 
   * @param user - User object to validate
   * @throws Error if validation fails
   */
  static validateUser(user: any): void {
    const requiredFields = ['id', 'firstName', 'lastName', 'email', 'username'];
    this.validateRequiredFields(user, requiredFields);

    this.validateType(user.id, 'number', 'id');
    this.validateType(user.firstName, 'string', 'firstName');
    this.validateType(user.lastName, 'string', 'lastName');
    this.validateType(user.email, 'string', 'email');
    this.validateType(user.username, 'string', 'username');
  }

  /**
   * Validate email format
   * 
   * Basic email format validation
   * 
   * @param email - Email to validate
   * @returns true if valid email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate positive number
   * 
   * @param value - Value to check
   * @param fieldName - Field name for error message
   * @throws Error if not a positive number
   */
  static validatePositiveNumber(value: any, fieldName: string): void {
    if (typeof value !== 'number' || value < 0) {
      throw new Error(`Field '${fieldName}' must be a positive number`);
    }
  }
}
