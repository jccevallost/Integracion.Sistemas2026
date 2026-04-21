// domain/entities/Payment.ts
export class Payment {
  constructor(
    public readonly id: string,
    public reservationId: string,
    public amount: number,
    public provider: string,
    public transactionId: string,
    public status: string,
    public readonly createdAt: Date,
  ) {}
}
