// domain/entities/ServiceCatalog.ts
export class ServiceCatalog {
  constructor(
    public readonly id: string,
    public name: string,
    public code: string,
    public category: string,
    public description: string | null,
  ) {}
}
