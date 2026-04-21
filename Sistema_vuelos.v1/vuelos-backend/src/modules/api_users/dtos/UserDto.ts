// application/dtos/UserDto.ts
export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  secondName?: string;
  firstLastName?: string;
  secondLastName?: string;
  mainAddress?: string;
  secondaryAddress?: string;
  cityId?: string;
  phone?: string;
  birthDate?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  secondName: string | null;
  firstLastName: string;
  secondLastName: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  city?: any;
}
