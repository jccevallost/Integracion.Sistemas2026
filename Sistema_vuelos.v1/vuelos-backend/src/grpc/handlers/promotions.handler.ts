import type { PromotionService } from '../../modules/api_promotions/services/PromotionService.js';
import { verifyServiceToken } from '../auth-helper.js';
import { toGrpcError } from '../error-mapper.js';

export function createPromotionHandlers(promotionService: PromotionService) {
  return {
    async ValidatePromotion(call: any, callback: any) {
      try {
        await verifyServiceToken(call.metadata);
        const { code, amount } = call.request;
        const result = await promotionService.validate(code, amount ?? 0);
        callback(null, {
          success: true,
          valid: result.valid,
          code: result.code,
          discount_type: result.discountType,
          discount_value: Number(result.discountValue),
          discount_amount: Number(result.discountAmount),
          final_amount: Number(result.finalAmount),
        });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },
  };
}
