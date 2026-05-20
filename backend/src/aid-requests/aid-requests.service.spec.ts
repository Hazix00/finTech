import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AidCategory, AidRequest, AidRequestStatus } from './aid-request.entity';
import { AidRequestsService } from './aid-requests.service';

type MockRepository = Pick<
  Repository<AidRequest>,
  'create' | 'save' | 'count' | 'findOne'
>;

const buildAidRequest = (status: AidRequestStatus): AidRequest => ({
  id: 'e1f4ef2b-bae6-4c66-a510-d4a49731e10f',
  beneficiaryId: '11111111-1111-4111-8111-111111111111',
  category: AidCategory.FOOD,
  amount: '120.00',
  description: 'Need help with groceries.',
  status,
  createdAt: new Date('2026-05-20T10:00:00.000Z'),
  updatedAt: new Date('2026-05-20T10:00:00.000Z'),
});

describe('AidRequestsService', () => {
  let service: AidRequestsService;
  let repository: jest.Mocked<MockRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      findOne: jest.fn(),
    };

    service = new AidRequestsService(repository as unknown as Repository<AidRequest>);
  });

  it('rejects creation when beneficiary already has 2 active requests', async () => {
    repository.count.mockResolvedValue(2);

    await expect(
      service.create({
        beneficiaryId: '11111111-1111-4111-8111-111111111111',
        category: AidCategory.HOUSING,
        amount: 400,
        description: 'Need rent support.',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows valid transition PENDING -> UNDER_REVIEW', async () => {
    const pendingRequest = buildAidRequest(AidRequestStatus.PENDING);
    const updatedRequest = { ...pendingRequest, status: AidRequestStatus.UNDER_REVIEW };

    repository.findOne.mockResolvedValue(pendingRequest);
    repository.save.mockResolvedValue(updatedRequest);

    const result = await service.updateStatus(pendingRequest.id, {
      status: AidRequestStatus.UNDER_REVIEW,
    });

    expect(result.status).toBe(AidRequestStatus.UNDER_REVIEW);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: AidRequestStatus.UNDER_REVIEW }),
    );
  });

  it('rejects invalid transition PENDING -> APPROVED', async () => {
    repository.findOne.mockResolvedValue(buildAidRequest(AidRequestStatus.PENDING));

    await expect(
      service.updateStatus('e1f4ef2b-bae6-4c66-a510-d4a49731e10f', {
        status: AidRequestStatus.APPROVED,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found when request does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.updateStatus('missing-id', {
        status: AidRequestStatus.REJECTED,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
