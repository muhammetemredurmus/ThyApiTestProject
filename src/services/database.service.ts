/**
 * Database Service Module
 * 
 * DESIGN PATTERN: Singleton Pattern
 * 
 * Purpose: Manages a single PostgreSQL connection pool across the application.
 * Uses TestContainers to automatically spin up a PostgreSQL container for testing.
 * 
 * Implementation:
 * - Private constructor prevents direct instantiation
 * - Static getInstance() method returns the single instance
 * - Connection pool is shared across all database operations
 * - Container lifecycle is managed automatically
 * 
 * Benefits:
 * - Single connection pool for efficiency
 * - Automatic container management with TestContainers
 * - Clean setup/teardown lifecycle
 * 
 * Usage:
 *   const dbService = DatabaseService.getInstance();
 *   await dbService.initialize(true);
 *   await dbService.query('SELECT * FROM users');
 *   await dbService.close();
 */
import { Pool, PoolClient } from 'pg';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Config } from '../config/config';
import { DatabaseUtil } from '../utils/database.util';
import { DatabaseConfig } from '../types';

export class DatabaseService {
  // Singleton Pattern: Private static instance
  private static instance: DatabaseService;
  
  // Database connection pool
  private pool: Pool | null = null;
  
  // TestContainers container reference
  private container: StartedPostgreSqlContainer | null = null;
  
  // Flag to track container mode
  private isTestContainerMode: boolean = false;

  /**
   * Singleton Pattern: Private constructor
   * Prevents direct instantiation with 'new DatabaseService()'
   */
  private constructor() {}

  /**
   * Singleton Pattern: Static getInstance method
   * Creates instance on first call, returns existing instance on subsequent calls
   * 
   * @returns The single DatabaseService instance
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database connection
   * Uses TestContainers if in test environment, otherwise uses Config singleton
   * 
   * @param useTestContainer - Whether to use TestContainers (default: true)
   */
  public async initialize(useTestContainer: boolean = true): Promise<void> {
    if (this.pool) {
      console.log('Database connection already initialized');
      return;
    }

    if (useTestContainer && process.env.NODE_ENV !== 'production') {
      await this.initializeTestContainer();
    } else {
      await this.initializeFromConfig();
    }

    // Initialize schema and tables automatically
    const client = await this.pool!.connect();
    try {
      await DatabaseUtil.initializeDatabase(client);
    } finally {
      client.release();
    }
  }

  /**
   * Initialize PostgreSQL using TestContainers
   * Automatically starts a containerized PostgreSQL instance
   */
  private async initializeTestContainer(): Promise<void> {
    console.log('Starting PostgreSQL container with TestContainers...');
    this.container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('testdb')
      .withUsername('testuser')
      .withPassword('testpass')
      .start();

    this.pool = new Pool({
      host: this.container.getHost(),
      port: this.container.getPort(),
      database: this.container.getDatabase(),
      user: this.container.getUsername(),
      password: this.container.getPassword(),
    });

    this.isTestContainerMode = true;
    console.log('PostgreSQL container started successfully');
  }

  /**
   * Initialize database from Config singleton
   * Uses Singleton Pattern to get configuration
   */
  private async initializeFromConfig(): Promise<void> {
    // Singleton Pattern: Get configuration from Config singleton
    const config = Config.getInstance().getDatabaseConfig();
    console.log('Connecting to PostgreSQL from configuration...');

    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    try {
      await this.pool.query('SELECT NOW()');
      console.log('PostgreSQL connection established successfully');
    } catch (error) {
      console.error('Failed to connect to PostgreSQL:', error);
      throw error;
    }
  }

  /**
   * Get database connection pool
   * @throws Error if database not initialized
   */
  public getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  /**
   * Get a client from the connection pool
   */
  public async getClient(): Promise<PoolClient> {
    return this.getPool().connect();
  }

  /**
   * Execute a query using the connection pool
   */
  public async query(text: string, params?: any[]): Promise<any> {
    return this.getPool().query(text, params);
  }

  /**
   * Close database connection and stop container
   * Proper cleanup for test lifecycle
   */
  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Database connection pool closed');
    }

    if (this.container) {
      await this.container.stop();
      this.container = null;
      console.log('PostgreSQL container stopped');
    }
  }

  /**
   * Check if database is initialized
   */
  public isInitialized(): boolean {
    return this.pool !== null;
  }
}
