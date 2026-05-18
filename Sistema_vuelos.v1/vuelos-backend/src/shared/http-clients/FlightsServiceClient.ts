import { FlightClass } from '../../modules/api_flight_classes/entities/FlightClass.js';

export interface PromotionData {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  isActive: boolean;
  maxUsages: number | null;
  currentUsages: number;
}

export interface IFlightsServiceClient {
  findFlightClassById(id: string): Promise<FlightClass | null>;
  decrementSeats(flightClassId: string, count: number): Promise<void>;
  incrementSeats(flightClassId: string, count: number): Promise<void>;
  findPromotionByCode(code: string): Promise<PromotionData | null>;
  incrementPromotionUsage(promotionId: string): Promise<void>;
  decrementPromotionUsage(promotionId: string): Promise<void>;
}

export class FlightsServiceClient implements IFlightsServiceClient {
  private readonly baseUrl: string;
  private readonly internalKey: string;

  constructor() {
    this.baseUrl    = (process.env.FLIGHTS_SERVICE_URL ?? 'http://localhost:3003').replace(/\/$/, '');
    this.internalKey = process.env.INTERNAL_API_KEY ?? '';
  }

  private get internalHeaders(): Record<string, string> {
    return {
      'Content-Type':       'application/json',
      'x-internal-api-key': this.internalKey,
    };
  }

  async findFlightClassById(id: string): Promise<FlightClass | null> {
    const res = await fetch(`${this.baseUrl}/api/v1/flight-classes/${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`[flights-client] findFlightClassById ${res.status}`);
    const body = (await res.json()) as any;
    const d = body.data;
    return new FlightClass(d.id, d.flightId, d.cabinClass, d.availableSeats, Number(d.basePrice));
  }

  async decrementSeats(flightClassId: string, count: number): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/internal/flight-classes/${encodeURIComponent(flightClassId)}/decrement-seats`,
      { method: 'PATCH', headers: this.internalHeaders, body: JSON.stringify({ count }) },
    );
    if (res.status === 409) throw new Error('NO_AVAILABILITY');
    if (!res.ok) throw new Error(`[flights-client] decrementSeats ${res.status}`);
  }

  async incrementSeats(flightClassId: string, count: number): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/internal/flight-classes/${encodeURIComponent(flightClassId)}/increment-seats`,
      { method: 'PATCH', headers: this.internalHeaders, body: JSON.stringify({ count }) },
    );
    if (!res.ok) {
      console.error(`[flights-client] incrementSeats failed: ${res.status} — seats may be inconsistent`);
    }
  }

  async findPromotionByCode(code: string): Promise<PromotionData | null> {
    const res = await fetch(
      `${this.baseUrl}/internal/promotions/by-code/${encodeURIComponent(code)}`,
      { headers: this.internalHeaders },
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`[flights-client] findPromotionByCode ${res.status}`);
    const body = (await res.json()) as any;
    return body.data as PromotionData;
  }

  async incrementPromotionUsage(promotionId: string): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/internal/promotions/${encodeURIComponent(promotionId)}/increment-usage`,
      { method: 'PATCH', headers: this.internalHeaders },
    );
    if (!res.ok) {
      console.error(`[flights-client] incrementPromotionUsage failed: ${res.status} — usage count may be inconsistent`);
    }
  }

  async decrementPromotionUsage(promotionId: string): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/internal/promotions/${encodeURIComponent(promotionId)}/decrement-usage`,
      { method: 'PATCH', headers: this.internalHeaders },
    );
    if (!res.ok) {
      console.error(`[flights-client] decrementPromotionUsage failed: ${res.status} — usage count may be inconsistent`);
    }
  }
}
