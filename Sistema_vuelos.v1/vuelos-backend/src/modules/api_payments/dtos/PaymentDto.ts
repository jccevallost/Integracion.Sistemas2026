// application/dtos/PaymentDto.ts
export interface CreatePaymentDto {
  reservationId: string;
  amount: number;
  provider: string;
  transactionId: string;
  status?: string;
}

export interface UpdatePaymentDto {
  provider?: string;
  transactionId?: string;
  status?: string;
}

export interface PaymentResponseDto {
  id: string;
  reservationId: string;
  amount: number;
  provider: string;
  transactionId: string;
  status: string;
  createdAt: string;
  reservation?: { id: string; reservationCode: string; totalAmount: number };
}
