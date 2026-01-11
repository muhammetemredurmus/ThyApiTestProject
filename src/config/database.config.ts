import { DatabaseConfig } from '../types';
import { Config } from './config';

export function getDatabaseConfig(): DatabaseConfig {
  return Config.getInstance().getDatabaseConfig();
}







