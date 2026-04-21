// domain/interfaces/repositories/IBaseRepository.ts
// Contrato genérico que todos los repositorios implementan

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IBaseRepository<T> {
  findAll(page?: number, limit?: number): Promise<PagedResult<T>>;
  findById(id: string): Promise<T | null>;
  create(data: unknown): Promise<T>;
  update(id: string, data: unknown): Promise<T>;
  delete(id: string): Promise<void>;
}
