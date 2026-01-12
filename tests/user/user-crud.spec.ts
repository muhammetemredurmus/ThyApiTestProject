/**
 * User CRUD Operations Test Suite
 * 
 * Design Patterns Used:
 * - Factory Pattern: UserFactory for test data generation
 * - Builder Pattern: UserBuilder for fluent user object construction
 * - Singleton Pattern: Config (via apiClientWithDb fixture)
 * - Repository Pattern: ApiLogRepository for database logging (via apiClientWithDb)
 */
import { test, expect } from '../../src/fixtures/test.fixture';
import { UserFactory } from '../../src/factories/user.factory';
import { UserBuilder } from '../../src/builders/user.builder';
import { ValidationUtil } from '../../src/utils/validation.util';
import { User, UsersListResponse } from '../../src/types';

test.describe('User CRUD Operations', () => {
  
  test('@smoke @regression - Should get list of users with pagination', async ({ apiClientWithDb }) => {
    // Singleton Pattern: apiClientWithDb uses Config.getInstance() internally
    // Repository Pattern: All requests are logged via ApiLogRepository
    const response = await apiClientWithDb.get('/users', {
      params: { limit: '10', skip: '0' },
    });

    expect(response.status()).toBe(200);
    const data: UsersListResponse = await response.json();

    expect(data.users).toBeDefined();
    expect(Array.isArray(data.users)).toBe(true);
    expect(data.total).toBeGreaterThan(0);
    expect(data.skip).toBe(0);
    expect(data.limit).toBe(10);
    expect(data.users.length).toBeLessThanOrEqual(10);

    // Validate pagination using ValidationUtil
    ValidationUtil.validatePaginationResponse(data);
  });

  test('@regression - Should get list of users with different pagination parameters', async ({ apiClientWithDb }) => {
    // Singleton Pattern: Config singleton provides API base URL
    // Repository Pattern: Request/Response logged to database
    const response = await apiClientWithDb.get('/users', {
      params: { limit: '5', skip: '10' },
    });

    expect(response.status()).toBe(200);
    const data: UsersListResponse = await response.json();

    expect(data.limit).toBe(5);
    expect(data.skip).toBe(10);
    expect(data.users.length).toBeLessThanOrEqual(5);
  });

  test('@smoke @regression - Should get a single user by ID', async ({ apiClientWithDb }) => {
    // Singleton Pattern: DatabaseService.getInstance() manages DB connection
    // Repository Pattern: API call logged via ApiLogRepository
    const userId = 1;
    const response = await apiClientWithDb.get(`/users/${userId}`);

    expect(response.status()).toBe(200);
    const user: User = await response.json();

    expect(user.id).toBe(userId);
    ValidationUtil.validateUser(user);
  });

  test('@regression - Should get different users by ID', async ({ apiClientWithDb }) => {
    // Singleton Pattern: Single Config instance used across all requests
    // Repository Pattern: Each request logged separately in database
    const userIds = [2, 3, 5];
    
    for (const userId of userIds) {
      const response = await apiClientWithDb.get(`/users/${userId}`);
      expect(response.status()).toBe(200);
      const user: User = await response.json();
      expect(user.id).toBe(userId);
      ValidationUtil.validateUser(user);
    }
  });

  test('@smoke @regression - Should create a new user', async ({ apiClientWithDb }) => {
    // Factory Pattern: UserFactory.createRandomUser() generates test data
    // Singleton Pattern: Config provides API configuration
    // Repository Pattern: Request and response logged to PostgreSQL
    const newUser = UserFactory.createRandomUser();
    
    const response = await apiClientWithDb.post('/users/add', {
      data: newUser,
    });

    expect([200, 201]).toContain(response.status());
    const createdUser: User = await response.json();

    expect(createdUser.id).toBeDefined();
    expect(createdUser.firstName).toBe(newUser.firstName);
    expect(createdUser.lastName).toBe(newUser.lastName);
    expect(createdUser.email).toBe(newUser.email);
    expect(createdUser.username).toBe(newUser.username);
    ValidationUtil.validateUser(createdUser);
  });

  test('@regression - Should create a user with custom data', async ({ apiClientWithDb }) => {
    // Factory Pattern: UserFactory.createUser() with custom overrides
    // Singleton Pattern: Config.getInstance() for API settings
    // Repository Pattern: ApiLogRepository logs all API interactions
    const customUser = UserFactory.createUser({
      firstName: 'CustomFirst',
      lastName: 'CustomLast',
      age: 35,
      email: 'custom@factory.com',
    });

    const response = await apiClientWithDb.post('/users/add', {
      data: customUser,
    });

    expect([200, 201]).toContain(response.status());
    const createdUser: User = await response.json();

    expect(createdUser.firstName).toBe('CustomFirst');
    expect(createdUser.lastName).toBe('CustomLast');
    expect(createdUser.age).toBe(35);
    expect(createdUser.email).toBe('custom@factory.com');
  });

  test('@regression - Should create a minimal user', async ({ apiClientWithDb }) => {
    // Factory Pattern: UserFactory.createMinimalUser() for minimal valid data
    // Builder Pattern: Internally uses UserBuilder.buildMinimal()
    // Repository Pattern: Database logging enabled
    const minimalUser = UserFactory.createMinimalUser();

    const response = await apiClientWithDb.post('/users/add', {
      data: minimalUser,
    });

    expect([200, 201]).toContain(response.status());
    const createdUser: User = await response.json();

    expect(createdUser.id).toBeDefined();
    expect(createdUser.firstName).toBe(minimalUser.firstName);
    expect(createdUser.lastName).toBe(minimalUser.lastName);
  });

  test('@regression - Should create multiple users', async ({ apiClientWithDb }) => {
    // Factory Pattern: UserFactory.createUsers() for batch creation
    // Singleton Pattern: Single database connection reused
    // Repository Pattern: All requests logged with timestamps
    const users = UserFactory.createUsers(3);

    for (const user of users) {
      const response = await apiClientWithDb.post('/users/add', {
        data: user,
      });

      expect([200, 201]).toContain(response.status());
      const createdUser: User = await response.json();
      expect(createdUser.id).toBeDefined();
    }
  });

  test('@regression - Should update a user using PUT', async ({ apiClientWithDb }) => {
    // Builder Pattern: UserBuilder for constructing update data
    // Factory Pattern: Base user from factory, then modified
    // Singleton Pattern: Config singleton for API base URL
    // Repository Pattern: Both GET and PUT requests logged
    
    // First, get an existing user
    const getResponse = await apiClientWithDb.get('/users/1');
    const existingUser: User = await getResponse.json();

    // Builder Pattern: Construct updated user data
    const updatedData = new UserBuilder()
      .withId(existingUser.id!)
      .withFirstName('Updated')
      .withLastName('User')
      .withAge(35)
      .withEmail(existingUser.email)
      .withPhone(existingUser.phone)
      .withUsername(existingUser.username)
      .build();

    const response = await apiClientWithDb.put(`/users/${existingUser.id}`, {
      data: updatedData,
    });

    expect(response.status()).toBe(200);
    const updatedUser: User = await response.json();

    expect(updatedUser.id).toBe(existingUser.id);
    expect(updatedUser.firstName).toBe('Updated');
    expect(updatedUser.lastName).toBe('User');
    expect(updatedUser.age).toBe(35);
  });

  test('@regression - Should partially update a user using PATCH', async ({ apiClientWithDb }) => {
    // Singleton Pattern: DatabaseService singleton manages connection pool
    // Repository Pattern: PATCH request logged with partial body
    
    // First, get an existing user
    const getResponse = await apiClientWithDb.get('/users/2');
    const existingUser: User = await getResponse.json();

    // Partially update the user
    const partialUpdate = {
      firstName: 'Patched',
      age: 40,
    };

    const response = await apiClientWithDb.patch(`/users/${existingUser.id}`, {
      data: partialUpdate,
    });

    expect(response.status()).toBe(200);
    const updatedUser: User = await response.json();

    expect(updatedUser.id).toBe(existingUser.id);
    expect(updatedUser.firstName).toBe('Patched');
    expect(updatedUser.age).toBe(40);
    // Other fields should remain unchanged
    expect(updatedUser.lastName).toBe(existingUser.lastName);
    expect(updatedUser.email).toBe(existingUser.email);
  });

  test('@smoke @regression - Should delete a user', async ({ apiClientWithDb }) => {
    // Singleton Pattern: Config provides base URL configuration
    // Repository Pattern: DELETE request and response logged
    const userId = 1;

    const response = await apiClientWithDb.delete(`/users/${userId}`);

    expect(response.status()).toBe(200);
    const deletedUser: User = await response.json();

    expect(deletedUser.id).toBe(userId);
    expect(deletedUser.isDeleted).toBe(true);
  });

  test('@regression - Should handle pagination edge cases', async ({ apiClientWithDb }) => {
    // Singleton Pattern: Single API client instance per test
    // Repository Pattern: Multiple requests logged for analysis
    
    // Test with small limit
    const response1 = await apiClientWithDb.get('/users', {
      params: { limit: '1', skip: '0' },
    });
    expect(response1.status()).toBe(200);
    const data1: UsersListResponse = await response1.json();
    expect(data1.limit).toBe(1);
    expect(data1.users.length).toBeLessThanOrEqual(1);

    // Test with large skip value
    const response2 = await apiClientWithDb.get('/users', {
      params: { limit: '10', skip: '100' },
    });
    expect(response2.status()).toBe(200);
    const data2: UsersListResponse = await response2.json();
    expect(data2.skip).toBe(100);
  });

  test('@smoke @regression - Should verify user data integrity after creation', async ({ apiClientWithDb }) => {
    // Builder Pattern: UserBuilder with fluent API for complete user creation
    // Factory Pattern: UserFactory internally uses Builder
    // Singleton Pattern: Config provides API credentials
    // Repository Pattern: Full request/response cycle logged
    
    const user = new UserBuilder()
      .withFirstName('Integrity')
      .withLastName('Test')
      .withAge(28)
      .withEmail('integrity@test.com')
      .withPhone('+1-555-9999')
      .withUsername('integritytest')
      .withPassword('securepass123')
      .withBirthDate('1995-06-15')
      .build();

    const response = await apiClientWithDb.post('/users/add', {
      data: user,
    });

    expect([200, 201]).toContain(response.status());
    const createdUser: User = await response.json();

    // Verify all fields
    expect(createdUser.firstName).toBe('Integrity');
    expect(createdUser.lastName).toBe('Test');
    expect(createdUser.age).toBe(28);
    expect(createdUser.email).toBe('integrity@test.com');
    expect(createdUser.username).toBe('integritytest');
    ValidationUtil.validateUser(createdUser);
  });
});
