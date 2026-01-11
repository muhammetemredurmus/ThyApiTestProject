import { User } from '../types';

export class UserModel implements User {
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

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }

  toJSON(): Partial<User> {
    const json: any = {};
    if (this.id !== undefined) json.id = this.id;
    if (this.firstName) json.firstName = this.firstName;
    if (this.lastName) json.lastName = this.lastName;
    if (this.age !== undefined) json.age = this.age;
    if (this.email) json.email = this.email;
    if (this.phone) json.phone = this.phone;
    if (this.username) json.username = this.username;
    if (this.password) json.password = this.password;
    if (this.birthDate) json.birthDate = this.birthDate;
    if (this.image) json.image = this.image;
    if (this.bloodGroup) json.bloodGroup = this.bloodGroup;
    if (this.height !== undefined) json.height = this.height;
    if (this.weight !== undefined) json.weight = this.weight;
    if (this.eyeColor) json.eyeColor = this.eyeColor;
    if (this.hair) json.hair = this.hair;
    if (this.domain) json.domain = this.domain;
    if (this.ip) json.ip = this.ip;
    if (this.address) json.address = this.address;
    if (this.macAddress) json.macAddress = this.macAddress;
    if (this.university) json.university = this.university;
    if (this.bank) json.bank = this.bank;
    if (this.company) json.company = this.company;
    if (this.ein) json.ein = this.ein;
    if (this.ssn) json.ssn = this.ssn;
    if (this.userAgent) json.userAgent = this.userAgent;
    return json;
  }
}







