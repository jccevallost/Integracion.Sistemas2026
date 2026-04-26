// application/services/PaymentService.ts
import { randomBytes } from 'crypto';
import type { PrismaClient } from '@prisma/client';
import { IPaymentService } from '../interfaces/IPaymentService.js';
import { IPaymentRepository } from '../interfaces/IPaymentRepository.js';
import { IBillingProfileRepository } from '../../api_billing_profiles/interfaces/IBillingProfileRepository.js';
import { IInvoiceRepository } from '../../api_invoices/interfaces/IInvoiceRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class PaymentService implements IPaymentService {
  constructor(
    private readonly repo: IPaymentRepository,
    private readonly billingProfileRepo: IBillingProfileRepository,
    private readonly invoiceRepo: IInvoiceRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async listAll() { return this.repo.findAllWithRelations(); }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Pago', id);
    return item;
  }

  async findByReservation(reservationId: string) { return this.repo.findByReservation(reservationId); }

  async create(data: any, userId?: string) {
    const payment = await this.repo.create(data);
    if (userId) {
      this.autoGenerateInvoice(payment, userId).catch(err =>
        console.error('[PaymentService] Auto-invoice error:', err),
      );
    }
    return payment;
  }

  private async autoGenerateInvoice(payment: any, userId: string) {
    let billing = await this.billingProfileRepo.findDefaultByUser(userId);

    if (!billing) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) return;
      billing = await this.billingProfileRepo.create({
        userId,
        taxId: '0000000000',
        businessName: `${user.firstName} ${user.firstLastName}`,
        email: user.email,
        address: user.mainAddress,
        cityId: user.cityId,
        isDefault: true,
      });
    }

    if (!billing) return;

    const total    = Number(payment.amount);
    const subtotal = +(total / 1.15).toFixed(2);
    const taxAmount= +(total - subtotal).toFixed(2);
    const now      = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const invoiceNumber = `INV-${datePart}-${randomBytes(4).toString('hex').toUpperCase()}`;

    await this.invoiceRepo.create({
      paymentId:        payment.id,
      billingProfileId: billing.id,
      invoiceNumber,
      subtotal,
      taxAmount,
      total,
    });
  }

  async update(id: string, data: any) {
    await this.getById(id);
    return this.repo.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
