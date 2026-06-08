// infrastructure/repositories/UserRepository.ts
import type { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../interfaces/IUserRepository.js';
import { User } from '../entities/User.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = { city: { include: { country: true } } };

type UserRepositoryOptions = {
  includeRelations?: boolean;
  cityDb?: PrismaClient;
};

export class UserRepository implements IUserRepository {
  private readonly includeRelations: boolean;
  private readonly cityDb: PrismaClient;

  constructor(private readonly db: PrismaClient, options: UserRepositoryOptions = {}) {
    this.includeRelations = options.includeRelations ?? true;
    this.cityDb = options.cityDb ?? db;
  }

  private relationInclude() {
    return this.includeRelations ? include : undefined;
  }

  async findAll(page = 1, limit = 100): Promise<PagedResult<User>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.user.findMany({ skip, take: limit, include: this.relationInclude(), orderBy: { createdAt: 'desc' } }),
      this.db.user.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id }, include: this.relationInclude() }) as any;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } }) as any;
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.user.findMany({ include: this.relationInclude(), orderBy: { createdAt: 'desc' } });
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
      include: this.relationInclude(),
    }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }

  async findFirstCity(): Promise<{ id: string } | null> {
    return this.cityDb.city.findFirst({ select: { id: true }, orderBy: { name: 'asc' } });
  }
}
