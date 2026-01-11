/**
 * Database Utility Module
 * 
 * DESIGN PATTERN: Utility/Helper Pattern
 * 
 * Purpose: Provides database schema and table management utilities.
 * Handles automatic creation of database objects if they don't exist.
 * 
 * Features:
 * - Schema existence check and creation
 * - Table existence check and creation
 * - Full database initialization
 * 
 * Schema Design:
 * - Schema: api_test
 * - Table: api_requests (stores API request data)
 * - Table: api_responses (stores API response data with FK to requests)
 * 
 * Usage:
 *   const client = await dbService.getClient();
 *   await DatabaseUtil.initializeDatabase(client);
 */
import { Pool, PoolClient } from 'pg';

export class DatabaseUtil {
  
  /**
   * Ensure schema exists, create if not
   * 
   * Checks information_schema for schema existence
   * Creates schema with IF NOT EXISTS for safety
   * 
   * @param client - Database client
   * @param schemaName - Schema name to ensure
   */
  static async ensureSchema(client: PoolClient, schemaName: string): Promise<void> {
    const checkSchemaQuery = `
      SELECT EXISTS(
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = $1
      );
    `;
    const result = await client.query(checkSchemaQuery, [schemaName]);
    const exists = result.rows[0].exists;

    if (!exists) {
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
      console.log(`Schema '${schemaName}' created successfully`);
    } else {
      console.log(`Schema '${schemaName}' already exists`);
    }
  }

  /**
   * Ensure table exists, create if not
   * 
   * Checks information_schema for table existence
   * Executes provided CREATE TABLE query if not exists
   * 
   * @param client - Database client
   * @param schemaName - Schema containing the table
   * @param tableName - Table name to ensure
   * @param createTableQuery - CREATE TABLE SQL query
   */
  static async ensureTable(
    client: PoolClient, 
    schemaName: string, 
    tableName: string, 
    createTableQuery: string
  ): Promise<void> {
    const checkTableQuery = `
      SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = $2
      );
    `;
    const result = await client.query(checkTableQuery, [schemaName, tableName]);
    const exists = result.rows[0].exists;

    if (!exists) {
      await client.query(createTableQuery);
      console.log(`Table '${schemaName}.${tableName}' created successfully`);
    } else {
      console.log(`Table '${schemaName}.${tableName}' already exists`);
    }
  }

  /**
   * Initialize complete database schema and tables
   * 
   * Creates:
   * - api_test schema
   * - api_test.api_requests table (stores request data)
   * - api_test.api_responses table (stores response data)
   * 
   * Table Structure:
   * 
   * api_requests:
   * - id: SERIAL PRIMARY KEY
   * - endpoint: VARCHAR(500) - API endpoint URL
   * - method: VARCHAR(10) - HTTP method
   * - headers: JSONB - Request headers
   * - body: JSONB - Request body
   * - timestamp: TIMESTAMP - Request time
   * 
   * api_responses:
   * - id: SERIAL PRIMARY KEY
   * - request_id: INTEGER FK - Links to api_requests
   * - status_code: INTEGER - HTTP status code
   * - headers: JSONB - Response headers
   * - body: JSONB - Response body
   * - response_time_ms: INTEGER - Response time in milliseconds
   * - timestamp: TIMESTAMP - Response time
   * 
   * @param client - Database client
   */
  static async initializeDatabase(client: PoolClient): Promise<void> {
    const schemaName = 'api_test';

    // Create schema if not exists
    await this.ensureSchema(client, schemaName);

    // Create api_requests table
    const createRequestsTableQuery = `
      CREATE TABLE IF NOT EXISTS ${schemaName}.api_requests (
        id SERIAL PRIMARY KEY,
        endpoint VARCHAR(500) NOT NULL,
        method VARCHAR(10) NOT NULL,
        headers JSONB,
        body JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.ensureTable(client, schemaName, 'api_requests', createRequestsTableQuery);

    // Create api_responses table with foreign key
    const createResponsesTableQuery = `
      CREATE TABLE IF NOT EXISTS ${schemaName}.api_responses (
        id SERIAL PRIMARY KEY,
        request_id INTEGER REFERENCES ${schemaName}.api_requests(id) ON DELETE CASCADE,
        status_code INTEGER NOT NULL,
        headers JSONB,
        body JSONB,
        response_time_ms INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.ensureTable(client, schemaName, 'api_responses', createResponsesTableQuery);

    console.log('Database initialization completed');
  }
}
