/**
 * Array Response Validation Test Suite
 * 
 * Design Patterns Used:
 * - Factory Pattern: UserFactory for expected data comparison
 * - Singleton Pattern: Config and DatabaseService for configuration and logging
 * - Repository Pattern: ApiLogRepository logs all array response requests
 * - Builder Pattern: Available for custom user comparisons
 */
import { test, expect } from '../../src/fixtures/test.fixture';
import { ValidationUtil } from '../../src/utils/validation.util';
import { UsersListResponse, User } from '../../src/types';
import { UserBuilder } from '../../src/builders/user.builder';

test.describe('Array Response Validation', () => {

  test('@smoke @regression - Should validate array response structure from GET /users', async ({ apiClientWithDb }) => {
    // Singleton Pattern: apiClientWithDb uses Config.getInstance() for API URL
    // Repository Pattern: Array response logged to database for analysis
    const response = await apiClientWithDb.get('/users');

    expect(response.status()).toBe(200);
    const data: UsersListResponse = await response.json();

    // Validate pagination structure
    ValidationUtil.validatePaginationResponse(data);

    // Validate users array
    expect(Array.isArray(data.users)).toBe(true);
    expect(data.users.length).toBeGreaterThan(0);
  });

  test('@regression - Should extract and validate specific user from array', async ({ apiClientWithDb }) => {
    // Singleton Pattern: DatabaseService logs this query
    // Repository Pattern: Response with array data logged
    const response = await apiClientWithDb.get('/users', {
      params: { limit: '30' },
    });

    expect(response.status()).toBe(200);
    const data: UsersListResponse = await response.json();

    // Find a specific user (e.g., user with ID 5)
    const targetUserId = 5;
    const targetUser = data.users.find((user: User) => user.id === targetUserId);

    expect(targetUser).toBeDefined();
    if (targetUser) {
      expect(targetUser.id).toBe(targetUserId);
      ValidationUtil.validateUser(targetUser);
    }
  });

  test('@regression - Should validate all users in array have required fields', async ({ apiClientWithDb }) => {
    // Singleton Pattern: Config provides API configuration
    // Repository Pattern: Full users array logged for verification
    const response = await apiClientWithDb.get('/users', {
      params: { limit: '10' },
    });

    expect(response.status()).toBe(200);
    const data: UsersListResponse = await response.json();

    // Validate each user in the array
    for (const user of data.users) {
      ValidationUtil.validateUser(user);
    }
  });

  test('@regression - Should find user by firstName in array', async ({ apiClientWithDb }) => {
    // Singleton Pattern: Single Config instance across all tests
    // Repository Pattern: Search query logged with results
    const response = await apiClientWithDb.get('/users', {
      params: { limit: '100' },
    });

    expect(response.status()).toBe(200);
    const data: UsersListResponse = await response.json();

    // Find user by firstName
    const targetUser = data.users.find((user: User) => user.firstName === 'Emily');

    expect(targetUser).toBeDefined();
    if (targetUser) {
      ValidationUtil.validateUser(targetUser);
    }
  });

  test('@regression - Should validate array response with pagination', async ({ apiClientWithDb }) => {
    // Singleton Pattern: DatabaseService manages PostgreSQL connection
    // Repository Pattern: Paginated request logged with params
    const limit = 5;
    const skip = 0;

    const response = await apiClientWithDb.get('/users', {
      params: { limit: limit.toString(), skip: skip.toString() },
    });

    expect(response.status()).toBe(200);
    const data: UsersListResponse = await response.json();

    expect(data.limit).toBe(limit);
    expect(data.skip).toBe(skip);
    expect(data.users.length).toBeLessThanOrEqual(limit);
    expect(data.total).toBeGreaterThanOrEqual(data.users.length);
  });

  test('@regression - Should validate array response across multiple pages', async ({ apiClientWithDb }) => {
    // Singleton Pattern: Same Config instance for both requests
    // Repository Pattern: Both page requests logged with different skip values
    const page1Response = await apiClientWithDb.get('/users', {
      params: { limit: '5', skip: '0' },
    });
    const page1Data: UsersListResponse = await page1Response.json();

    const page2Response = await apiClientWithDb.get('/users', {
      params: { limit: '5', skip: '5' },
    });
    const page2Data: UsersListResponse = await page2Response.json();

    // Validate both pages
    ValidationUtil.validatePaginationResponse(page1Data);
    ValidationUtil.validatePaginationResponse(page2Data);

    // Ensure different users are returned
    const page1Ids = page1Data.users.map((u: User) => u.id);
    const page2Ids = page2Data.users.map((u: User) => u.id);

    // Check that there's no overlap (assuming unique IDs)
    const overlap = page1Ids.filter((id) => id !== undefined && page2Ids.includes(id));
    expect(overlap.length).toBe(0);
  });

  test('@regression - Should validate array response contains expected user properties', async ({ apiClientWithDb }) => {
    // Singleton Pattern: Config singleton provides consistent settings
    // Repository Pattern: Response logged with full property data
    const response = await apiClientWithDb.get('/users', {
      params: { limit: '1' },
    });

    expect(response.status()).toBe(200);
    const data: UsersListResponse = await response.json();

    if (data.users.length > 0) {
      const user = data.users[0];
      const expectedFields = ['id', 'firstName', 'lastName', 'email', 'username'];

      for (const field of expectedFields) {
        expect(user).toHaveProperty(field);
      }
    }
  });

  test('@regression - Should handle empty array response gracefully', async ({ apiClientWithDb }) => {
    // Singleton Pattern: DatabaseService handles connection management
    // Repository Pattern: Empty result logged for edge case analysis
    // Request with skip value beyond total
    const response = await apiClientWithDb.get('/users', {
      params: { limit: '10', skip: '10000' },
    });

    expect(response.status()).toBe(200);
    const data: UsersListResponse = await response.json();

    expect(data.users).toBeDefined();
    expect(Array.isArray(data.users)).toBe(true);
    expect(data.users.length).toBeGreaterThanOrEqual(0);
  });

  test('@regression - Should validate array response data types', async ({ apiClientWithDb }) => {
    // Singleton Pattern: Config provides type-safe configuration
    // Repository Pattern: Full response with types logged
    const response = await apiClientWithDb.get('/users', {
      params: { limit: '5' },
    });

    expect(response.status()).toBe(200);
    const data: UsersListResponse = await response.json();

    // Validate data types
    expect(typeof data.total).toBe('number');
    expect(typeof data.skip).toBe('number');
    expect(typeof data.limit).toBe('number');
    expect(Array.isArray(data.users)).toBe(true);

    // Validate user data types
    if (data.users.length > 0) {
      const user = data.users[0];
      expect(typeof user.id).toBe('number');
      expect(typeof user.firstName).toBe('string');
      expect(typeof user.lastName).toBe('string');
      expect(typeof user.email).toBe('string');
    }
  });

  test('@regression - Should compare array user structure with expected format', async ({ apiClientWithDb }) => {
    // Builder Pattern: Create expected user structure for comparison
    // Singleton Pattern: Config provides API settings
    // Repository Pattern: Comparison test logged
    
    // Builder Pattern: Define expected user structure
    const expectedUserStructure = new UserBuilder()
      .withFirstName('Test')
      .withLastName('User')
      .withAge(25)
      .withEmail('test@example.com')
      .withPhone('+1-555-0000')
      .withUsername('testuser')
      .build();

    const response = await apiClientWithDb.get('/users', {
      params: { limit: '1' },
    });

    expect(response.status()).toBe(200);
    const data: UsersListResponse = await response.json();

    if (data.users.length > 0) {
      const apiUser = data.users[0];
      
      // Compare that API user has same property keys as expected user structure
      const expectedKeys = Object.keys(expectedUserStructure);
      for (const key of expectedKeys) {
        expect(apiUser).toHaveProperty(key);
      }
    }
  });

  test('@regression - Should filter and validate specific users from array', async ({ apiClientWithDb }) => {
    // Singleton Pattern: Config singleton across test
    // Repository Pattern: Filtered results analysis logged
    const response = await apiClientWithDb.get('/users', {
      params: { limit: '50' },
    });

    expect(response.status()).toBe(200);
    const data: UsersListResponse = await response.json();

    // Filter users with age > 30
    const usersOver30 = data.users.filter((user: User) => user.age && user.age > 30);

    // Validate filtered users
    for (const user of usersOver30) {
      expect(user.age).toBeGreaterThan(30);
      ValidationUtil.validateUser(user);
    }
  });
});
