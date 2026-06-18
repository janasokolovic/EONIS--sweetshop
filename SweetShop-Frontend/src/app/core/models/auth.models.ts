export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
}

export interface AuthResponseDto {
  token: string;
  expiresAt: string;
  user: UserDto;
}