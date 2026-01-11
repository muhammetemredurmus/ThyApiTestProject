import { ApiResponse, UsersListResponse, LoginResponse } from '../types';

export class ApiResponseModel<T> implements ApiResponse<T> {
  data?: T;
  message?: string;
  status?: number;

  constructor(data?: T, message?: string, status?: number) {
    this.data = data;
    this.message = message;
    this.status = status;
  }
}

export class UsersListResponseModel implements UsersListResponse {
  users: any[];
  total: number;
  skip: number;
  limit: number;

  constructor(data: UsersListResponse) {
    this.users = data.users;
    this.total = data.total;
    this.skip = data.skip;
    this.limit = data.limit;
  }
}

export class LoginResponseModel implements LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;

  constructor(data: LoginResponse) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.gender = data.gender;
    this.image = data.image;
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
  }
}


