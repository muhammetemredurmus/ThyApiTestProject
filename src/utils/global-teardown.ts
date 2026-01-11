/**
 * Global teardown for Playwright tests
 * Note: Database cleanup is handled per-test or via fixtures
 */
async function globalTeardown() {
  console.log('Global teardown: Test environment cleaned up');
  // Database cleanup is handled by test fixtures if used
}

export default globalTeardown;

