// domain/entities/Promotion.ts
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export class Promotion {
  constructor(
    public readonly id: string,
    public code: string,
    public discountType: DiscountType,
    public discountValue: number,
    public isActive: boolean,
    public maxUsages: number | null = null,
    public currentUsages: number = 0,
  ) {}

  applyDiscount(amount: number): number {
    if (!this.isActive) return amount;
    const discount =
      this.discountType === 'PERCENTAGE'
        ? amount * (this.discountValue / 100)
        : this.discountValue;
    return Math.max(0, amount - Math.min(discount, amount));
  }

  calculateDiscount(amount: number): number {
    if (!this.isActive) return 0;
    const discount =
      this.discountType === 'PERCENTAGE'
        ? amount * (this.discountValue / 100)
        : this.discountValue;
    return Math.min(discount, amount);
  }
}
