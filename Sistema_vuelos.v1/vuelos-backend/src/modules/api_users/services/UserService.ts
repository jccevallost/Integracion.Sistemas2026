// application/services/UserService.ts
import { IUserService } from '../interfaces/IUserService.js';
import { IUserRepository } from '../interfaces/IUserRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async listAll() {
    return this.userRepository.findAllWithRelations();
  }

  async getById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario', id);
    return user;
  }

  async update(id: string, data: any) {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new NotFoundException('Usuario', id);
    return this.userRepository.update(id, data);
  }

  async remove(id: string) {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new NotFoundException('Usuario', id);
    await this.userRepository.delete(id);
  }
}
