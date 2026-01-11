/**
 * Global setup for Playwright tests
 * Note: Database initialization is handled per-test or via fixtures
 * because Playwright runs global setup in a separate process
 */
async function globalSetup() {
  console.log('Global setup: Test environment initialized');
  // Database will be initialized in test fixtures if needed
  // This is because Playwright global setup runs in a separate process
  // and cannot share state with test workers
}

export default globalSetup;

