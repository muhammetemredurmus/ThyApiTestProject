/**
 * User Builder Module
 * 
 * DESIGN PATTERN: Builder Pattern
 * 
 * Purpose: Provides a fluent interface for constructing User objects step by step.
 * Separates complex object construction from its representation.
 * 
 * Implementation:
 * - Fluent method chaining (each method returns 'this')
 * - Separate build methods for different user types
 * - Validation in buildMinimal() to ensure required fields
 * 
 * Benefits:
 * - Readable object construction
 * - Flexible optional parameter handling
 * - Clear separation between required and optional fields
 * - Immutable-like pattern (new object on build)
 * 
 * Usage:
 *   const user = new UserBuilder()
 *     .withFirstName('John')
 *     .withLastName('Doe')
 *     .withEmail('john@example.com')
 *     .withAge(30)
 *     .withPhone('+1-555-0000')
 *     .withUsername('johndoe')
 *     .buildMinimal();
 */
import { User } from '../types';

export class UserBuilder {
  // Internal user object being built
  private user: Partial<User>;

  /**
   * Initialize empty user builder
   */
  constructor() {
    this.user = {};
  }

  /**
   * Builder Method: Set user ID
   * @returns this for method chaining
   */
  withId(id: number): UserBuilder {
    this.user.id = id;
    return this;
  }

  /**
   * Builder Method: Set first name
   * @returns this for method chaining
   */
  withFirstName(firstName: string): UserBuilder {
    this.user.firstName = firstName;
    return this;
  }

  /**
   * Builder Method: Set last name
   * @returns this for method chaining
   */
  withLastName(lastName: string): UserBuilder {
    this.user.lastName = lastName;
    return this;
  }

  /**
   * Builder Method: Set age
   * @returns this for method chaining
   */
  withAge(age: number): UserBuilder {
    this.user.age = age;
    return this;
  }

  /**
   * Builder Method: Set email
   * @returns this for method chaining
   */
  withEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }

  /**
   * Builder Method: Set phone
   * @returns this for method chaining
   */
  withPhone(phone: string): UserBuilder {
    this.user.phone = phone;
    return this;
  }

  /**
   * Builder Method: Set username
   * @returns this for method chaining
   */
  withUsername(username: string): UserBuilder {
    this.user.username = username;
    return this;
  }

  /**
   * Builder Method: Set password
   * @returns this for method chaining
   */
  withPassword(password: string): UserBuilder {
    this.user.password = password;
    return this;
  }

  /**
   * Builder Method: Set birth date
   * @returns this for method chaining
   */
  withBirthDate(birthDate: string): UserBuilder {
    this.user.birthDate = birthDate;
    return this;
  }

  /**
   * Builder Method: Set image URL
   * @returns this for method chaining
   */
  withImage(image: string): UserBuilder {
    this.user.image = image;
    return this;
  }

  /**
   * Builder Method: Set address object
   * @returns this for method chaining
   */
  withAddress(address: User['address']): UserBuilder {
    this.user.address = address;
    return this;
  }

  /**
   * Builder Method: Set company object
   * @returns this for method chaining
   */
  withCompany(company: User['company']): UserBuilder {
    this.user.company = company;
    return this;
  }

  /**
   * Build Method: Create minimal valid user
   * 
   * Validates that all required fields are present
   * @throws Error if required fields are missing
   * @returns Complete User object with required fields
   */
  buildMinimal(): User {
    if (!this.user.firstName) {
      throw new Error('FirstName is required');
    }
    if (!this.user.lastName) {
      throw new Error('LastName is required');
    }
    if (!this.user.email) {
      throw new Error('Email is required');
    }
    if (!this.user.username) {
      throw new Error('Username is required');
    }
    if (this.user.age === undefined) {
      throw new Error('Age is required');
    }
    if (!this.user.phone) {
      throw new Error('Phone is required');
    }

    return this.user as User;
  }

  /**
   * Build Method: Create user without validation
   * 
   * Returns whatever fields have been set
   * @returns Partial or complete User object
   */
  build(): User {
    return this.user as User;
  }

  /**
   * Reset builder to start fresh
   * @returns this for method chaining
   */
  reset(): UserBuilder {
    this.user = {};
    return this;
  }
}
