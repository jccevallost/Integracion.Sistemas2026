// domain/entities/BoardingPass.ts
export type CheckInStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'BOARDED' | 'NO_SHOW';

export class BoardingPass {
  constructor(
    public readonly id: string,
    public passengerId: string,
    public segmentId: string,
    public boardingCode: string,
    public gate: string | null,
    public boardingGroup: string | null,
    public checkInAt: Date | null,
    public status: CheckInStatus,
  ) {}

  isCheckedIn(): boolean {
    return this.status === 'CHECKED_IN' || this.status === 'BOARDED';
  }
}
