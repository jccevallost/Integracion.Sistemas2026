// domain/entities/User.ts
export type UserRole = 'CUSTOMER' | 'ADMIN';

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public firstName: string,
    public secondName: string | null,
    public firstLastName: string,
    public secondLastName: string | null,
    public mainAddress: string,
    public secondaryAddress: string | null,
    public cityId: string,
    public phone: string | null,
    public birthDate: Date | null,
    public role: UserRole,
    public isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  get fullName(): string {
    return [this.firstName, this.secondName, this.firstLastName, this.secondLastName]
      .filter(Boolean)
      .join(' ');
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }
}
