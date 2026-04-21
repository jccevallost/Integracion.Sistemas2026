// domain/interfaces/repositories/IUserRepository.ts
import { User } from '../entities/User.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findAllWithRelations(): Promise<any[]>;
  findFirstCity(): Promise<{ id: string } | null>;
}
