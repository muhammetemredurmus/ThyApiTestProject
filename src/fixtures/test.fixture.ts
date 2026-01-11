/**
 * Custom Playwright Test Fixtures
 * 
 * DESIGN PATTERNS USED:
 * - Singleton Pattern: DatabaseService singleton for worker-scoped DB management
 * - Factory Pattern: Creates service instances with proper configuration
 * - Repository Pattern: ApiClientService uses ApiLogRepository internally
 * 
 * Purpose: Extends Playwright's base test with custom fixtures for API testing.
 * Provides pre-configured services that use all design patterns consistently.
 * 
 * Fixtures:
 * - apiClient: Basic API client without DB logging
 * - apiClientWithDb: API client with full database logging
 * - authService: Authentication service with token management
 * - dbService: Worker-scoped database service (shared across tests)
 * 
 * Usage:
 *   test('my test', async ({ apiClientWithDb, authService }) => {
 *     // Use fixtures directly - all patterns applied automatically
 *   });
 */
import { test as base, APIRequestContext } from '@playwright/test';
import { ApiClientService } from '../services/api-client.service';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';

/**
 * Test-scoped fixtures interface
 */
export interface TestFixtures {
  apiClient: ApiClientService;
  authService: AuthService;
  apiClientWithDb: ApiClientService;
}

/**
 * Worker-scoped fixtures interface
 */
export interface WorkerFixtures {
  dbService: DatabaseService;
}

/**
 * Extended test with custom fixtures
 * 
 * All fixtures are pre-configured with design patterns:
 * - Singleton: Config and DatabaseService
 * - Factory: UserFactory and RequestFactory available in tests
 * - Builder: UserBuilder available in tests
 * - Repository: ApiLogRepository used by apiClientWithDb
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  
  /**
   * API Client Fixture (without DB logging)
   * 
   * Singleton Pattern: Uses Config.getInstance() internally
   * 
   * Use for simple tests that don't need request logging
   */
  apiClient: async ({ request }, use) => {
    // Factory-like creation: Service instance with configuration
    const client = new ApiClientService(request, false);
    await use(client);
  },

  /**
   * Auth Service Fixture
   * 
   * Singleton Pattern: Uses Config.getInstance() for credentials
   * 
   * Provides login, token management, and auth header generation
   */
  authService: async ({ request }, use) => {
    // Singleton Pattern: AuthService uses Config singleton internally
    const service = new AuthService(request);
    await use(service);
  },

  /**
   * API Client Fixture (with DB logging)
   * 
   * Design Patterns Used:
   * - Singleton Pattern: DatabaseService.getInstance() for connection
   * - Repository Pattern: ApiLogRepository for database operations
   * - Factory Pattern: Creates configured service instance
   * 
   * Use for tests that need full request/response logging
   */
  apiClientWithDb: async ({ request }, use) => {
    // Singleton Pattern: Get database service instance
    const dbService = DatabaseService.getInstance();
    
    if (!dbService.isInitialized()) {
      try {
        // Initialize database with TestContainers
        await dbService.initialize(true);
      } catch (error) {
        console.warn('DB initialization failed, running without DB logging:', error);
        // Factory Pattern: Fall back to non-DB client
        const client = new ApiClientService(request, false);
        await use(client);
        return;
      }
    }
    
    // Factory Pattern: Create client with DB logging enabled
    // Repository Pattern: Client will use ApiLogRepository internally
    const client = new ApiClientService(request, true);
    await use(client);
  },

  /**
   * Database Service Fixture (Worker-scoped)
   * 
   * Singleton Pattern: DatabaseService singleton shared across all tests in worker
   * 
   * Worker scope ensures:
   * - Container starts once per worker
   * - Connection pool shared efficiently
   * - Proper cleanup after all tests
   */
  dbService: [async ({}, use) => {
    // Singleton Pattern: Get single database service instance
    const service = DatabaseService.getInstance();
    
    // Initialize if needed
    if (!service.isInitialized()) {
      try {
        await service.initialize(true);
        console.log('Database initialized for worker');
      } catch (error) {
        console.warn('Database initialization failed:', error);
      }
    }
    
    await use(service);
    
    // Cleanup after all tests in this worker complete
    await service.close();
  }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';
