import { IFlightsServiceClient, PromotionData } from './FlightsServiceClient.js';
import { IFlightClassRepository }               from '../../modules/api_flight_classes/interfaces/IFlightClassRepository.js';
import { IPromotionRepository }                  from '../../modules/api_promotions/interfaces/IPromotionRepository.js';
import { FlightClass }                           from '../../modules/api_flight_classes/entities/FlightClass.js';

/**
 * In-process adapter for monolith deployments.
 * Implements IFlightsServiceClient using repositories directly instead of HTTP.
 */
export class LocalFlightsServiceAdapter implements IFlightsServiceClient {
  constructor(
    private readonly flightClassRepo: IFlightClassRepository,
    private readonly promotionRepo: IPromotionRepository,
  ) {}

  async findFlightClassById(id: string): Promise<FlightClass | null> {
    return this.flightClassRepo.findById(id);
  }

  async decrementSeats(flightClassId: string, count: number): Promise<void> {
    const success = await this.flightClassRepo.decrementSeatsAtomic(flightClassId, count);
    if (!success) throw new Error('NO_AVAILABILITY');
  }

  async incrementSeats(flightClassId: string, count: number): Promise<void> {
    await this.flightClassRepo.incrementSeats(flightClassId, count);
  }

  async findPromotionByCode(code: string): Promise<PromotionData | null> {
    const promo = await this.promotionRepo.findByCode(code);
    if (!promo) return null;
    return {
      id:            promo.id,
      code:          promo.code,
      discountType:  promo.discountType as 'PERCENTAGE' | 'FIXED_AMOUNT',
      discountValue: Number(promo.discountValue),
      isActive:      promo.isActive,
      maxUsages:     promo.maxUsages ?? null,
      currentUsages: promo.currentUsages,
    };
  }

  async incrementPromotionUsage(promotionId: string): Promise<void> {
    await this.promotionRepo.incrementUsage(promotionId);
  }

  async decrementPromotionUsage(promotionId: string): Promise<void> {
    await this.promotionRepo.decrementUsage(promotionId);
  }
}
