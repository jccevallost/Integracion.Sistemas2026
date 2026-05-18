// domain/interfaces/services/IPromotionService.ts
export interface IPromotionService {
  listAll(): Promise<any[]>;
  validate(code: string, amount: number): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
  /** Returns full promotion record or null. Used by internal inter-service endpoint. */
  findByCode(code: string): Promise<any | null>;
  incrementUsage(id: string): Promise<void>;
  decrementUsage(id: string): Promise<void>;
}
