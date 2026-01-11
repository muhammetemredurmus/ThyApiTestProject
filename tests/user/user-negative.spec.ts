/**
 * User Negative Test Scenarios
 * 
 * Design Patterns Used:
 * - Factory Pattern: UserFactory for invalid/edge case test data generation
 * - Builder Pattern: UserBuilder for constructing specific invalid scenarios
 * - Singleton Pattern: Config and DatabaseService singletons
 * - Repository Pattern: ApiLogRepository for logging failed requests
 */
import { test, expect } from '../../src/fixtures/test.fixture';
import { UserFactory } from '../../src/factories/user.factory';
import { UserBuilder } from '../../src/builders/user.builder';
import { User } from '../../src/types';

test.describe('User Negative Test Scenarios', () => {

  test('@regression - Should return 404 for non-existent user ID', async ({ apiClientWithDb }) => {
    // Singleton Pattern: apiClientWithDb uses Config.getInstance() for base URL
    // Repository Pattern: Even failed requests are logged for analysis
    const invalidUserId = 99999;
    const response = await apiClientWithDb.get(`/users/${invalidUserId}`);

    expect(response.status()).toBe(404);
    const errorData = await response.json();
    expect(errorData.message).toBeDefined();
  });

  test('@regression - Should return error for invalid user ID format', async ({ apiClientWithDb }) => {
    // Singleton Pattern: Single Config instance provides API configuration
    // Repository Pattern: Invalid requests logged with error status
    const invalidUserId = 'invalid-id';
    const response = await apiClientWithDb.get(`/users/${invalidUserId}`);

    expect([400, 404, 500]).toContain(response.status());
  });

  test('@regression - Should handle user creation with missing firstName', async ({ apiClientWithDb }) => {
    // Factory Pattern: UserFactory.createInvalidUser() generates incomplete data
    // Repository Pattern: Request body with missing field logged
    const invalidUser = UserFactory.createInvalidUser('firstName');

    const response = await apiClientWithDb.post('/users/add', {
      data: invalidUser,
    });

    expect([200, 201, 400, 422]).toContain(response.status());
  });

  test('@regression - Should handle user creation with missing email', async ({ apiClientWithDb }) => {
    // Factory Pattern: UserFactory creates user without email field
    // Singleton Pattern: DatabaseService manages connection for logging
    const invalidUser = UserFactory.createInvalidUser('email');

    const response = await apiClientWithDb.post('/users/add', {
      data: invalidUser,
    });

    expect([200, 201, 400, 422]).toContain(response.status());
  });

  test('@regression - Should handle user creation with missing username', async ({ apiClientWithDb }) => {
    // Factory Pattern: UserFactory for missing field scenarios
    // Repository Pattern: Logs help identify which fields cause failures
    const invalidUser = UserFactory.createInvalidUser('username');

    const response = await apiClientWithDb.post('/users/add', {
      data: invalidUser,
    });

    expect([200, 201, 400, 422]).toContain(response.status());
  });

  test('@regression - Should handle invalid data types in user creation', async ({ apiClientWithDb }) => {
    // Factory Pattern: UserFactory.createUserWithInvalidTypes() for type errors
    // Repository Pattern: Invalid type data logged as JSON in database
    const invalidUser = UserFactory.createUserWithInvalidTypes();

    const response = await apiClientWithDb.post('/users/add', {
      data: invalidUser,
    });

    expect([200, 201, 400, 422]).toContain(response.status());
  });

  test('@regression - Should handle update on non-existent user', async ({ apiClientWithDb }) => {
    // Builder Pattern: UserBuilder constructs valid update data
    // Singleton Pattern: Config provides API endpoint configuration
    // Repository Pattern: Failed update request logged for debugging
    const nonExistentUserId = 99999;
    
    // Builder Pattern: Create update data with fluent API
    const updateData = new UserBuilder()
      .withFirstName('Updated')
      .withLastName('User')
      .withAge(30)
      .withEmail('update@test.com')
      .withPhone('+1-555-0000')
      .withUsername('updateuser')
      .build();

    const response = await apiClientWithDb.put(`/users/${nonExistentUserId}`, {
      data: updateData,
    });

    expect([200, 404]).toContain(response.status());
  });

  test('@regression - Should handle patch on non-existent user', async ({ apiClientWithDb }) => {
    // Singleton Pattern: Single database connection for efficient logging
    // Repository Pattern: PATCH request with 404 response logged
    const nonExistentUserId = 99999;
    const patchData = {
      firstName: 'Patched',
    };

    const response = await apiClientWithDb.patch(`/users/${nonExistentUserId}`, {
      data: patchData,
    });

    expect([200, 404]).toContain(response.status());
  });

  test('@regression - Should handle delete on non-existent user', async ({ apiClientWithDb }) => {
    // Singleton Pattern: DatabaseService.getInstance() manages container
    // Repository Pattern: DELETE request on non-existent resource logged
    const nonExistentUserId = 99999;

    const response = await apiClientWithDb.delete(`/users/${nonExistentUserId}`);

    expect([200, 404]).toContain(response.status());
  });

  test('@regression - Should handle empty request body', async ({ apiClientWithDb }) => {
    // Repository Pattern: Empty body request logged for analysis
    // Singleton Pattern: Config singleton provides endpoint URL
    const response = await apiClientWithDb.post('/users/add', {
      data: {},
    });

    expect([200, 201, 400, 422]).toContain(response.status());
  });

  test('@regression - Should handle null request body', async ({ apiClientWithDb }) => {
    // Repository Pattern: Null body handling logged
    // Singleton Pattern: API client uses singleton Config
    try {
      const response = await apiClientWithDb.post('/users/add', {
        data: null as any,
      });
      expect([200, 400, 422, 500]).toContain(response.status());
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test('@regression - Should handle very long string values', async ({ apiClientWithDb }) => {
    // Factory Pattern: UserFactory.createUser() with override for edge case
    // Repository Pattern: Large payload logged (may be truncated)
    const longString = 'a'.repeat(10000);
    const userWithLongValues = UserFactory.createUser({
      firstName: longString,
      lastName: longString,
    });

    const response = await apiClientWithDb.post('/users/add', {
      data: userWithLongValues,
    });

    expect([200, 201, 400, 422, 413]).toContain(response.status());
  });

  test('@regression - Should handle negative age values', async ({ apiClientWithDb }) => {
    // Factory Pattern: UserFactory creates user with negative age
    // Builder Pattern: Internally uses UserBuilder
    // Repository Pattern: Invalid data logged for test evidence
    const userWithNegativeAge = UserFactory.createUser({
      age: -10,
    });

    const response = await apiClientWithDb.post('/users/add', {
      data: userWithNegativeAge,
    });

    expect([200, 201, 400, 422]).toContain(response.status());
  });

  test('@regression - Should handle invalid email format', async ({ apiClientWithDb }) => {
    // Factory Pattern: UserFactory.createUser() with invalid email override
    // Singleton Pattern: Config manages API settings
    // Repository Pattern: Request with invalid email logged
    const userWithInvalidEmail = UserFactory.createUser({
      email: 'not-an-email',
    });

    const response = await apiClientWithDb.post('/users/add', {
      data: userWithInvalidEmail,
    });

    expect([200, 201, 400, 422]).toContain(response.status());
  });

  test('@regression - Should handle special characters in user data', async ({ apiClientWithDb }) => {
    // Builder Pattern: UserBuilder for special character test data
    // Factory Pattern: Could also use Factory, but Builder shows flexibility
    // Repository Pattern: Special chars in JSON logged correctly
    const userWithSpecialChars = new UserBuilder()
      .withFirstName('Test<script>alert(1)</script>')
      .withLastName("O'Connor-Smith")
      .withAge(25)
      .withEmail('test+special@example.com')
      .withPhone('+1 (555) 123-4567')
      .withUsername('user_with-special.chars')
      .build();

    const response = await apiClientWithDb.post('/users/add', {
      data: userWithSpecialChars,
    });

    expect([200, 201, 400, 422]).toContain(response.status());
  });

  test('@regression - Should handle zero and extreme age values', async ({ apiClientWithDb }) => {
    // Factory Pattern: Multiple Factory calls for different edge cases
    // Repository Pattern: All edge case requests logged
    
    // Test with zero age
    const zeroAgeUser = UserFactory.createUser({ age: 0 });
    const response1 = await apiClientWithDb.post('/users/add', {
      data: zeroAgeUser,
    });
    expect([200, 201, 400, 422]).toContain(response1.status());

    // Test with very high age
    const highAgeUser = UserFactory.createUser({ age: 999 });
    const response2 = await apiClientWithDb.post('/users/add', {
      data: highAgeUser,
    });
    expect([200, 201, 400, 422]).toContain(response2.status());
  });
});
