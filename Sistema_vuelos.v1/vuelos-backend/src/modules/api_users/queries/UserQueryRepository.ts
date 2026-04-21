// infrastructure/queries/UserQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class UserQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getDashboardStats() {
    const [totalUsers, activeUsers, adminUsers, customerUsers] = await Promise.all([
      this.db.user.count(),
      this.db.user.count({ where: { isActive: true } }),
      this.db.user.count({ where: { role: 'ADMIN' } }),
      this.db.user.count({ where: { role: 'CUSTOMER' } }),
    ]);
    return { totalUsers, activeUsers, adminUsers, customerUsers };
  }

  async searchUsers(query: string) {
    return this.db.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { firstLastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true, email: true, firstName: true,
        firstLastName: true, role: true, isActive: true,
      },
      take: 20,
    });
  }
}
