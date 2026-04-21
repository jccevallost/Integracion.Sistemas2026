// domain/entities/Aircraft.ts
export class Aircraft {
  constructor(
    public readonly id: string,
    public airlineId: string,
    public modelName: string,
    public registration: string,
    public hasWifi: boolean,
    public hasUsb: boolean,
  ) {}
}
