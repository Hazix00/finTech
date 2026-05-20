import { AidRequestStatus } from '../models/aid-request.model';
import { getAllowedStatusTransitions } from './request-status.util';

describe('getAllowedStatusTransitions', () => {
  it('returns transitions for PENDING', () => {
    expect(getAllowedStatusTransitions(AidRequestStatus.PENDING)).toEqual([
      AidRequestStatus.UNDER_REVIEW,
      AidRequestStatus.REJECTED,
    ]);
  });

  it('returns no transitions for APPROVED', () => {
    expect(getAllowedStatusTransitions(AidRequestStatus.APPROVED)).toEqual([]);
  });
});
