// application/services/AuthService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IAuthService, LoginDto, RegisterDto, AuthResponseDto, UpdateProfileDto, ChangePasswordDto } from '../interfaces/IAuthService.js';
import { IUserRepository } from '../interfaces/IUserRepository.js';
import { ValidationException, ConflictException, NotFoundException } from '../../../shared/exceptions/BusinessException.js';
import { getJwtSecret, getJwtSignOptions } from '../../../shared/security/jwt.config.js';

export class AuthService implements IAuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  private generateToken(payload: { id: string; email: string; role: string; tokenVersion: number }): string {
    return jwt.sign(payload, getJwtSecret(), {
      ...getJwtSignOptions(process.env.JWT_EXPIRES_IN ?? '2h'),
      subject: payload.id,
    });
  }

  private sanitize(user: any): AuthResponseDto['user'] {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      firstLastName: user.firstLastName,
      role: user.role,
      phone: user.phone ?? null,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    if (!dto.email || !dto.password) {
      throw new ValidationException('email y password son requeridos');
    }

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new ValidationException('Credenciales inválidas');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new ValidationException('Credenciales inválidas');
    }

    const token = this.generateToken({ id: user.id, email: user.email, role: user.role, tokenVersion: (user as any).tokenVersion ?? 0 });
    return { user: this.sanitize(user), token };
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    if (!dto.email || !dto.password || !dto.firstName || !dto.firstLastName) {
      throw new ValidationException('email, password, firstName y firstLastName son requeridos');
    }

    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('El email ya está registrado');

    // cityId es requerido en la BD. Si no se proporciona se busca la primera ciudad disponible.
    let resolvedCityId = dto.cityId;
    if (!resolvedCityId) {
      const cities = await this.userRepository.findFirstCity();
      resolvedCityId = (cities as any)?.id;
    }
    if (!resolvedCityId) {
      throw new ValidationException('No hay ciudades disponibles. Contacte al administrador.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      secondName: dto.secondName ?? null,
      firstLastName: dto.firstLastName,
      secondLastName: dto.secondLastName ?? null,
      mainAddress: dto.mainAddress ?? '',
      cityId: resolvedCityId,
      phone: dto.phone ?? null,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
      role: 'CUSTOMER',
    });

    const token = this.generateToken({ id: (user as any).id, email: (user as any).email, role: (user as any).role, tokenVersion: 0 });
    return { user: this.sanitize(user), token };
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario', userId);
    return this.sanitize(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<any> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario', userId);
    return this.userRepository.update(userId, {
      ...(dto.firstName        !== undefined && { firstName:        dto.firstName }),
      ...(dto.secondName       !== undefined && { secondName:       dto.secondName }),
      ...(dto.firstLastName    !== undefined && { firstLastName:    dto.firstLastName }),
      ...(dto.secondLastName   !== undefined && { secondLastName:   dto.secondLastName }),
      ...(dto.mainAddress      !== undefined && { mainAddress:      dto.mainAddress }),
      ...(dto.secondaryAddress !== undefined && { secondaryAddress: dto.secondaryAddress }),
      ...(dto.phone            !== undefined && { phone:            dto.phone }),
      ...(dto.birthDate        !== undefined && { birthDate:        dto.birthDate ? new Date(dto.birthDate) : null }),
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    if (!dto.currentPassword || !dto.newPassword) {
      throw new ValidationException('currentPassword y newPassword son requeridos');
    }
    if (dto.newPassword.length < 6) {
      throw new ValidationException('La nueva contraseña debe tener al menos 6 caracteres');
    }
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario', userId);

    const isValid = await bcrypt.compare(dto.currentPassword, (user as any).passwordHash);
    if (!isValid) throw new ValidationException('Contraseña actual incorrecta');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(userId, { passwordHash, tokenVersion: { increment: 1 } });
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { tokenVersion: { increment: 1 } });
  }
}
