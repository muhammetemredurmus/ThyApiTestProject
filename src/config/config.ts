/**
 * Configuration Management Module
 * 
 * DESIGN PATTERN: Singleton Pattern
 * 
 * Purpose: Ensures only one instance of configuration exists throughout the application.
 * This prevents multiple reads of the config file and ensures consistent settings.
 * 
 * Implementation:
 * - Private constructor prevents direct instantiation
 * - Static getInstance() method returns the single instance
 * - Configuration is loaded once and cached
 * 
 * Benefits:
 * - Memory efficiency (single instance)
 * - Consistent configuration across all modules
 * - Environment variable override support for CI/CD pipelines
 * 
 * Usage:
 *   const config = Config.getInstance();
 *   const apiConfig = config.getApiConfig();
 */
import * as fs from 'fs';
import * as path from 'path';
import { AppConfig } from '../types';

export class Config {
  // Singleton Pattern: Private static instance
  private static instance: Config;
  
  // Cached configuration
  private config: AppConfig;

  /**
   * Singleton Pattern: Private constructor
   * Prevents direct instantiation with 'new Config()'
   */
  private constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Singleton Pattern: Static getInstance method
   * Creates instance on first call, returns existing instance on subsequent calls
   * 
   * @returns The single Config instance
   */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Load configuration from properties file
   * Environment variables override file values for CI/CD flexibility
   */
  private loadConfig(): AppConfig {
    const propertiesPath = path.join(process.cwd(), 'config', 'application.properties');
    const properties: Record<string, string> = {};

    // Read properties file
    if (fs.existsSync(propertiesPath)) {
      const content = fs.readFileSync(propertiesPath, 'utf-8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            properties[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
    }

    // Environment variables override properties file (for pipeline support)
    const dbHost = process.env.DB_HOST || properties['db.host'] || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || properties['db.port'] || '5432', 10);
    const dbName = process.env.DB_NAME || properties['db.name'] || 'testdb';
    const dbUser = process.env.DB_USER || properties['db.user'] || 'testuser';
    const dbPassword = process.env.DB_PASSWORD || properties['db.password'] || 'testpass';

    const apiBaseUrl = process.env.API_BASE_URL || properties['api.base.url'] || 'https://dummyjson.com';
    const apiUsername = properties['api.username'] || 'emilys';
    const apiPassword = properties['api.password'] || 'emilyspass';

    const testTimeout = parseInt(properties['test.timeout'] || '30000', 10);
    const testRetries = parseInt(properties['test.retries'] || '2', 10);

    return {
      api: {
        baseUrl: apiBaseUrl,
        username: apiUsername,
        password: apiPassword,
      },
      database: {
        host: dbHost,
        port: dbPort,
        database: dbName,
        user: dbUser,
        password: dbPassword,
      },
      test: {
        timeout: testTimeout,
        retries: testRetries,
      },
    };
  }

  /**
   * Get complete configuration
   */
  public getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Get API configuration
   */
  public getApiConfig() {
    return this.config.api;
  }

  /**
   * Get database configuration
   */
  public getDatabaseConfig() {
    return this.config.database;
  }

  /**
   * Get test configuration
   */
  public getTestConfig() {
    return this.config.test;
  }
}
