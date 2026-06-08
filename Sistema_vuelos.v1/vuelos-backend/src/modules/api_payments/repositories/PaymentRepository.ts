// infrastructure/repositories/PaymentRepository.ts
import type { PrismaClient } from '@prisma/client';
import { IPaymentRepository } from '../interfaces/IPaymentRepository.js';
import { Payment } from '../entities/Payment.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = {
  reservation: {
    select: { id: true, reservationCode: true, totalAmount: true, status: true },
  },
};

export class PaymentRepository implements IPaymentRepository {
  constructor(
    private readonly db: PrismaClient,
    private readonly options: { includeReservation?: boolean } = {},
  ) {}

  private relationInclude() {
    return this.options.includeReservation === false ? undefined : include;
  }

  async findAll(page = 1, limit = 100): Promise<PagedResult<Payment>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.payment.findMany({ skip, take: limit, include: this.relationInclude(), orderBy: { createdAt: 'desc' } }),
      this.db.payment.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<Payment | null> {
    return this.db.payment.findUnique({ where: { id }, include: this.relationInclude() }) as any;
  }

  async findByReservation(reservationId: string): Promise<any[]> {
    return this.db.payment.findMany({ where: { reservationId }, include: this.relationInclude(), orderBy: { createdAt: 'desc' } });
  }

  async findByTransaction(transactionId: string): Promise<Payment | null> {
    return this.db.payment.findFirst({ where: { transactionId }, include: this.relationInclude() }) as any;
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.payment.findMany({ include: this.relationInclude(), orderBy: { createdAt: 'desc' } });
  }

  async create(data: any): Promise<Payment> {
    return this.db.payment.create({ data, include: this.relationInclude() }) as any;
  }

  async update(id: string, data: any): Promise<Payment> {
    return this.db.payment.update({ where: { id }, data, include: this.relationInclude() }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.payment.delete({ where: { id } });
  }
}
