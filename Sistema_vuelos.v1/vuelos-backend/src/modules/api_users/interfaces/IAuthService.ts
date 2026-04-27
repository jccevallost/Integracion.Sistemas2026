// domain/interfaces/services/IAuthService.ts
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  firstLastName: string;
  secondName?: string;
  secondLastName?: string;
  mainAddress?: string;
  cityId?: string;
  phone?: string;
  birthDate?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  secondName?: string;
  firstLastName?: string;
  secondLastName?: string;
  mainAddress?: string;
  secondaryAddress?: string;
  phone?: string;
  birthDate?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    firstName: string;
    firstLastName: string;
    role: string;
    phone: string | null;
  };
  token: string;
}

export interface IAuthService {
  login(dto: LoginDto): Promise<AuthResponseDto>;
  register(dto: RegisterDto): Promise<AuthResponseDto>;
  getProfile(userId: string): Promise<any>;
  updateProfile(userId: string, dto: UpdateProfileDto): Promise<any>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
  logout(userId: string): Promise<void>;
}
