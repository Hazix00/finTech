import { AidRequestStatus } from '../models/aid-request.model';

const ALLOWED_STATUS_TRANSITIONS: Record<AidRequestStatus, AidRequestStatus[]> = {
  [AidRequestStatus.PENDING]: [AidRequestStatus.UNDER_REVIEW, AidRequestStatus.REJECTED],
  [AidRequestStatus.UNDER_REVIEW]: [AidRequestStatus.APPROVED, AidRequestStatus.REJECTED],
  [AidRequestStatus.APPROVED]: [],
  [AidRequestStatus.REJECTED]: [],
};

export function getAllowedStatusTransitions(status: AidRequestStatus): AidRequestStatus[] {
  return ALLOWED_STATUS_TRANSITIONS[status];
}
