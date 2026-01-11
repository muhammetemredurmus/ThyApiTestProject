/**
 * Authentication & Authorization Test Suite
 * 
 * Design Patterns Used:
 * - Singleton Pattern: Config singleton for credentials, AuthService for token management
 * - Factory Pattern: RequestFactory for creating authenticated requests (via AuthService)
 * - Repository Pattern: ApiLogRepository logs all auth requests (when using apiClientWithDb)
 */
import { test, expect } from '../../src/fixtures/test.fixture';
import { ValidationUtil } from '../../src/utils/validation.util';
import { Config } from '../../src/config/config';

test.describe('Authentication & Authorization', () => {

  test('@smoke @regression - Should successfully login with valid credentials', async ({ authService }) => {
    // Singleton Pattern: authService internally uses Config.getInstance() for credentials
    // Config singleton provides api.username and api.password
    const loginResponse = await authService.login();

    expect(loginResponse).toBeDefined();
    expect(loginResponse.id).toBeDefined();
    expect(loginResponse.username).toBe('emilys');
    expect(loginResponse.email).toBeDefined();
    expect(loginResponse.firstName).toBeDefined();
    expect(loginResponse.lastName).toBeDefined();
    expect(loginResponse.accessToken).toBeDefined();
    expect(typeof loginResponse.accessToken).toBe('string');
    expect(loginResponse.accessToken.length).toBeGreaterThan(0);
  });

  test('@regression - Should get authentication token after login', async ({ authService }) => {
    // Singleton Pattern: AuthService manages single token state
    // Token is stored in authService instance
    await authService.clearToken();
    const loginResponse = await authService.login();

    const token = authService.getToken();
    expect(token).toBeDefined();
    expect(token).toBe(loginResponse.accessToken);
  });

  test('@regression - Should include token in authorization header', async ({ authService }) => {
    // Singleton Pattern: Config provides API configuration
    // AuthService generates proper Bearer token header
    await authService.login();
    const authHeader = authService.getAuthHeader();

    expect(authHeader).toBeDefined();
    expect(authHeader.Authorization).toBeDefined();
    expect(authHeader.Authorization).toContain('Bearer');
  });

  test('@regression - Should login with explicit credentials from Config', async ({ authService }) => {
    // Singleton Pattern: Config.getInstance() retrieves stored credentials
    // Demonstrates explicit use of Singleton pattern
    const config = Config.getInstance();
    const apiConfig = config.getApiConfig();

    const loginResponse = await authService.login(apiConfig.username, apiConfig.password);

    expect(loginResponse.username).toBe(apiConfig.username);
    expect(loginResponse.accessToken).toBeDefined();
  });

  test('@regression - Should fail login with invalid username', async ({ authService }) => {
    // Singleton Pattern: AuthService handles token state management
    // Failed login should not store token
    const invalidUsername = 'invaliduser';
    const password = 'emilyspass';

    try {
      await authService.login(invalidUsername, password);
      const token = authService.getToken();
      expect(token).toBeFalsy();
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  test('@regression - Should fail login with invalid password', async ({ authService }) => {
    // Singleton Pattern: Config provides valid username for testing
    // AuthService instance maintains its own token state
    const username = 'emilys';
    const invalidPassword = 'wrongpassword';

    try {
      await authService.login(username, invalidPassword);
      const token = authService.getToken();
      expect(token).toBeFalsy();
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  test('@regression - Should fail login with empty credentials', async ({ authService }) => {
    // Singleton Pattern: AuthService singleton-like behavior within test
    // Empty credentials should not result in valid token
    try {
      await authService.login('', '');
      const token = authService.getToken();
      expect(token).toBeFalsy();
    } catch (error: any) {
      expect(error.message).toBeDefined();
    }
  });

  test('@regression - Should validate login response structure', async ({ authService }) => {
    // Singleton Pattern: AuthService uses Config singleton for default credentials
    // ValidationUtil provides reusable validation methods
    const loginResponse = await authService.login();

    // Validate required fields
    const requiredFields = ['id', 'username', 'email', 'firstName', 'lastName', 'accessToken'];
    ValidationUtil.validateRequiredFields(loginResponse, requiredFields);

    // Validate data types
    ValidationUtil.validateType(loginResponse.id, 'number', 'id');
    ValidationUtil.validateType(loginResponse.username, 'string', 'username');
    ValidationUtil.validateType(loginResponse.email, 'string', 'email');
    ValidationUtil.validateType(loginResponse.accessToken, 'string', 'accessToken');
  });

  test('@regression - Should clear token when requested', async ({ authService }) => {
    // Singleton Pattern: AuthService manages token lifecycle
    // clearToken() resets internal state
    await authService.login();
    expect(authService.getToken()).toBeDefined();

    authService.clearToken();
    expect(authService.getToken()).toBeNull();
  });

  test('@regression - Should set token manually', async ({ authService }) => {
    // Singleton Pattern: AuthService allows manual token injection
    // Useful for testing with pre-generated tokens
    const testToken = 'test-token-12345';
    authService.setToken(testToken);

    expect(authService.getToken()).toBe(testToken);
    const authHeader = authService.getAuthHeader();
    expect(authHeader.Authorization).toBe(`Bearer ${testToken}`);
  });

  test('@regression - Should handle multiple login attempts', async ({ authService }) => {
    // Singleton Pattern: AuthService maintains latest token
    // Each login updates the internal token state
    
    // First login
    const loginResponse1 = await authService.login();
    const token1 = authService.getToken();

    // Second login should update token
    const loginResponse2 = await authService.login();
    const token2 = authService.getToken();

    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(loginResponse2.accessToken).toBeDefined();
  });

  test('@regression - Should use consistent configuration across multiple calls', async ({ authService }) => {
    // Singleton Pattern: Config.getInstance() returns same instance
    // Same Config instance used across entire test suite
    const config1 = Config.getInstance();
    const config2 = Config.getInstance();

    // Verify same instance (Singleton Pattern ensures single instance)
    expect(config1).toBe(config2);
    expect(config1.getApiConfig().baseUrl).toBe('https://dummyjson.com');

    // Verify login works with singleton config
    const loginResponse = await authService.login();
    expect(loginResponse.accessToken).toBeDefined();
  });

  test('@regression - Should validate refreshToken in login response', async ({ authService }) => {
    // Singleton Pattern: AuthService uses Config for credentials
    // Response includes both accessToken and refreshToken
    const loginResponse = await authService.login();

    expect(loginResponse.accessToken).toBeDefined();
    expect(loginResponse.refreshToken).toBeDefined();
    expect(typeof loginResponse.refreshToken).toBe('string');
    expect(loginResponse.refreshToken.length).toBeGreaterThan(0);
  });
});
