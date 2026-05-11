import type { BoardingPassService } from '../../modules/api_boarding_passes/services/BoardingPassService.js';
import { verifyServiceToken } from '../auth-helper.js';
import { toGrpcError } from '../error-mapper.js';
import { randomBytes } from 'crypto';

export function createCheckInHandlers(boardingPassService: BoardingPassService) {
  return {
    async CheckIn(call: any, callback: any) {
      try {
        await verifyServiceToken(call.metadata);
        const { passenger_id, segment_id } = call.request;
        const boardingPass = await boardingPassService.create({
          passengerId: passenger_id,
          segmentId: segment_id,
          boardingCode: randomBytes(6).toString('hex').toUpperCase(),
          status: 'CHECKED_IN',
          checkInAt: new Date(),
        });
        callback(null, { success: true, boarding_pass: mapBoardingPass(boardingPass) });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },

    async GetBoardingPassByPassenger(call: any, callback: any) {
      try {
        await verifyServiceToken(call.metadata);
        const result = await boardingPassService.findByPassenger(call.request.passenger_id);
        const passes = Array.isArray(result) ? result : (result ? [result] : []);
        callback(null, {
          success: true,
          boarding_passes: passes.map(mapBoardingPass),
        });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },
  };
}

function mapBoardingPass(bp: any) {
  return {
    id: bp.id ?? '',
    passenger_id: bp.passengerId ?? '',
    segment_id: bp.segmentId ?? '',
    boarding_code: bp.boardingCode ?? '',
    gate: bp.gate ?? '',
    boarding_group: bp.boardingGroup ?? '',
    check_in_at: bp.checkInAt ? String(bp.checkInAt) : '',
    status: bp.status ?? '',
  };
}
