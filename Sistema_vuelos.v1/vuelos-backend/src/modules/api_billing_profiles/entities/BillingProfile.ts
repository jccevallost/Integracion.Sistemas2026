// domain/entities/BillingProfile.ts
export class BillingProfile {
  constructor(
    public readonly id: string,
    public userId: string,
    public taxId: string,
    public businessName: string,
    public email: string | null,
    public address: string,
    public cityId: string,
    public isDefault: boolean,
  ) {}
}
