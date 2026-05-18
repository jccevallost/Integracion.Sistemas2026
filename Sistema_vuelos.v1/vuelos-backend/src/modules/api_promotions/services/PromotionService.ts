// application/services/PromotionService.ts
import { IPromotionService } from '../interfaces/IPromotionService.js';
import { IPromotionRepository } from '../interfaces/IPromotionRepository.js';
import { Promotion } from '../entities/Promotion.js';
import { NotFoundException, ValidationException } from '../../../shared/exceptions/BusinessException.js';

export class PromotionService implements IPromotionService {
  constructor(private readonly promotionRepository: IPromotionRepository) {}

  async listAll() {
    const result = await this.promotionRepository.findAll();
    return result.data;
  }

  async validate(code: string, amount: number) {
    const raw = await this.promotionRepository.findByCode(code);
    if (!raw || !raw.isActive) {
      throw new ValidationException('Código promocional inválido o inactivo');
    }

    const promo = new Promotion(
      raw.id, raw.code, raw.discountType as any,
      Number(raw.discountValue), raw.isActive,
    );

    const discountAmount = promo.calculateDiscount(amount);
    return {
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      finalAmount: amount - discountAmount,
    };
  }

  async create(data: any) {
    return this.promotionRepository.create(data);
  }

  async update(id: string, data: any) {
    const existing = await this.promotionRepository.findById(id);
    if (!existing) throw new NotFoundException('Promoción', id);
    return this.promotionRepository.update(id, data);
  }

  async remove(id: string) {
    const existing = await this.promotionRepository.findById(id);
    if (!existing) throw new NotFoundException('Promoción', id);
    await this.promotionRepository.delete(id);
  }

  async findByCode(code: string): Promise<any | null> {
    return this.promotionRepository.findByCode(code);
  }

  async incrementUsage(id: string): Promise<void> {
    const existing = await this.promotionRepository.findById(id);
    if (!existing) throw new NotFoundException('Promoción', id);
    await this.promotionRepository.incrementUsage(id);
  }

  async decrementUsage(id: string): Promise<void> {
    const existing = await this.promotionRepository.findById(id);
    if (!existing) throw new NotFoundException('Promoción', id);
    await this.promotionRepository.decrementUsage(id);
  }
}
