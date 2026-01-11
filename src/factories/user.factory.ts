/**
 * User Factory Module
 * 
 * DESIGN PATTERN: Factory Pattern
 * 
 * Purpose: Encapsulates the creation logic of User objects for testing.
 * Provides various factory methods for different test scenarios.
 * 
 * Implementation:
 * - Static factory methods for object creation
 * - Internal counter for unique user generation
 * - Uses Builder Pattern internally for complex objects
 * 
 * Benefits:
 * - Centralized test data generation
 * - Consistent user objects across tests
 * - Easy to create valid, invalid, and edge case users
 * - Reduces code duplication in tests
 * 
 * Usage:
 *   const user = UserFactory.createRandomUser();
 *   const invalidUser = UserFactory.createInvalidUser('email');
 *   const users = UserFactory.createUsers(5);
 */
import { User } from '../types';
import { UserBuilder } from '../builders/user.builder';

export class UserFactory {
  // Counter for generating unique user data
  private static counter = 1;

  /**
   * Factory Method: Generate a random valid user
   * 
   * Builder Pattern: Uses UserBuilder internally for object construction
   * 
   * @returns Complete valid User object
   */
  static createRandomUser(): User {
    const id = this.counter++;
    const timestamp = Date.now();
    
    // Builder Pattern: Fluent API for user construction
    return new UserBuilder()
      .withFirstName(`Test${id}`)
      .withLastName(`User${id}`)
      .withAge(25 + (id % 50))
      .withEmail(`testuser${id}@example.com`)
      .withPhone(`+1-555-${String(1000 + id).slice(-4)}`)
      .withUsername(`testuser${id}`)
      .withPassword(`password${id}`)
      .withBirthDate(`1990-01-${String(1 + (id % 28)).padStart(2, '0')}`)
      .build();
  }

  /**
   * Factory Method: Generate a user with custom properties
   * 
   * Creates a base user then applies overrides
   * 
   * @param overrides - Partial user properties to override
   * @returns User with applied overrides
   */
  static createUser(overrides: Partial<User> = {}): User {
    const baseUser = this.createRandomUser();
    return { ...baseUser, ...overrides };
  }

  /**
   * Factory Method: Generate a minimal valid user
   * 
   * Builder Pattern: Uses UserBuilder.buildMinimal()
   * 
   * @returns User with only required fields
   */
  static createMinimalUser(): User {
    const id = this.counter++;
    
    // Builder Pattern: Build minimal valid user
    return new UserBuilder()
      .withFirstName(`Min${id}`)
      .withLastName(`User${id}`)
      .withAge(30)
      .withEmail(`minuser${id}@example.com`)
      .withPhone(`+1-555-0000`)
      .withUsername(`minuser${id}`)
      .buildMinimal();
  }

  /**
   * Factory Method: Generate an invalid user for negative testing
   * 
   * Removes specified field to test validation
   * 
   * @param missingField - Field to remove from user
   * @returns Partial user with missing field
   */
  static createInvalidUser(missingField?: string): Partial<User> {
    const id = this.counter++;
    const user: Partial<User> = {
      firstName: `Invalid${id}`,
      lastName: `User${id}`,
      age: 30,
      email: `invalid${id}@example.com`,
      phone: `+1-555-0000`,
      username: `invalid${id}`,
    };

    // Remove specified field for validation testing
    if (missingField) {
      delete (user as any)[missingField];
    }

    return user;
  }

  /**
   * Factory Method: Generate a user with invalid data types
   * 
   * For testing type validation and error handling
   * 
   * @returns User-like object with wrong data types
   */
  static createUserWithInvalidTypes(): any {
    return {
      firstName: 123,           // Should be string
      lastName: true,           // Should be string
      age: 'thirty',            // Should be number
      email: 456,               // Should be string
      phone: null,              // Should be string
      username: [],             // Should be string
    };
  }

  /**
   * Factory Method: Generate multiple users
   * 
   * Batch creation for testing lists and pagination
   * 
   * @param count - Number of users to create
   * @returns Array of valid users
   */
  static createUsers(count: number): User[] {
    return Array.from({ length: count }, () => this.createRandomUser());
  }

  /**
   * Reset counter for test isolation
   * 
   * Useful when tests need predictable user IDs
   */
  static resetCounter(): void {
    this.counter = 1;
  }
}
