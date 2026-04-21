// infrastructure/repositories/UserRepository.ts
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../interfaces/IUserRepository.js';
import { User } from '../entities/User.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = { city: { include: { country: true } } };

export class UserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<User>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.user.findMany({ skip, take: limit, include, orderBy: { createdAt: 'desc' } }),
      this.db.user.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id }, include }) as any;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } }) as any;
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.user.findMany({ include, orderBy: { createdAt: 'desc' } });
  }

  async create(data: any): Promise<User> {
    return this.db.user.create({ data }) as any;
  }

  async update(id: string, data: any): Promise<User> {
    const { birthDate, ...rest } = data;
    return this.db.user.update({
      where: { id },
      data: {
        ...rest,
        ...(birthDate && { birthDate: new Date(birthDate) }),
      },
      include,
    }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }

  async findFirstCity(): Promise<{ id: string } | null> {
    return this.db.city.findFirst({ select: { id: true }, orderBy: { name: 'asc' } });
  }
}
