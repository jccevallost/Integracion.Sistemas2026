// application/dtos/BoardingPassDto.ts
export interface CreateBoardingPassDto {
  passengerId: string;
  segmentId: string;
  boardingCode: string;
  gate?: string | null;
  boardingGroup?: string | null;
  checkInAt?: string | null;
  status?: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'BOARDED' | 'NO_SHOW';
}

export interface UpdateBoardingPassDto {
  gate?: string | null;
  boardingGroup?: string | null;
  checkInAt?: string | null;
  status?: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'BOARDED' | 'NO_SHOW';
}

export interface BoardingPassResponseDto {
  id: string;
  passengerId: string;
  segmentId: string;
  boardingCode: string;
  gate: string | null;
  boardingGroup: string | null;
  checkInAt: string | null;
  status: string;
  passenger?: { id: string; firstName: string; lastName: string; documentNumber: string };
  segment?: { id: string; segmentNumber: string };
}
