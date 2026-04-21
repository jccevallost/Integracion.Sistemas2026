// domain/entities/Country.ts
export class Country {
  constructor(
    public readonly id: string,
    public name: string,
    public isoCode: string,
    public phoneCode: string | null,
    public currencyCode: string | null,
  ) {}
}
