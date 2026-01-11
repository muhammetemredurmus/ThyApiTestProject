export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone: string;
  username: string;
  password?: string;
  birthDate?: string;
  image?: string;
  isDeleted?: boolean;
  deletedOn?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  eyeColor?: string;
  hair?: {
    color: string;
    type: string;
  };
  domain?: string;
  ip?: string;
  address?: {
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    postalCode: string;
    state: string;
  };
  macAddress?: string;
  university?: string;
  bank?: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };
  company?: {
    address: {
      address: string;
      city: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      postalCode: string;
      state: string;
    };
    department: string;
    name: string;
    title: string;
  };
  ein?: string;
  ssn?: string;
  userAgent?: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status?: number;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

export interface ApiRequest {
  endpoint: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface ApiResponseLog {
  requestId: number;
  statusCode: number;
  headers?: Record<string, string>;
  body?: any;
  responseTimeMs: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface AppConfig {
  api: {
    baseUrl: string;
    username: string;
    password: string;
  };
  database: DatabaseConfig;
  test: {
    timeout: number;
    retries: number;
  };
}

