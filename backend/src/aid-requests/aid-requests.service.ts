import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AidRequest, AidRequestStatus } from './aid-request.entity';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { ListAidRequestsQueryDto } from './dto/list-aid-requests-query.dto';
import { UpdateAidRequestStatusDto } from './dto/update-aid-request-status.dto';

const ACTIVE_REQUEST_STATUSES = [AidRequestStatus.PENDING, AidRequestStatus.UNDER_REVIEW];

const ALLOWED_STATUS_TRANSITIONS: Record<AidRequestStatus, AidRequestStatus[]> = {
  [AidRequestStatus.PENDING]: [AidRequestStatus.UNDER_REVIEW, AidRequestStatus.REJECTED],
  [AidRequestStatus.UNDER_REVIEW]: [AidRequestStatus.APPROVED, AidRequestStatus.REJECTED],
  [AidRequestStatus.APPROVED]: [],
  [AidRequestStatus.REJECTED]: [],
};

@Injectable()
export class AidRequestsService {
  constructor(
    @InjectRepository(AidRequest)
    private readonly aidRequestRepository: Repository<AidRequest>,
  ) {}

  async create(dto: CreateAidRequestDto): Promise<AidRequest> {
    const activeRequestsCount = await this.aidRequestRepository.count({
      where: {
        beneficiaryId: dto.beneficiaryId,
        status: In(ACTIVE_REQUEST_STATUSES),
      },
    });
    if (activeRequestsCount >= 2) {
      throw new BadRequestException(
        'A beneficiary cannot have more than 2 active requests (PENDING or UNDER_REVIEW).',
      );
    }

    const aidRequest = this.aidRequestRepository.create({
      ...dto,
      amount: String(dto.amount),
      status: AidRequestStatus.PENDING,
    });

    return this.aidRequestRepository.save(aidRequest);
  }

  async list(query: ListAidRequestsQueryDto): Promise<{
    items: AidRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.aidRequestRepository.createQueryBuilder('aidRequest');

    if (query.beneficiaryId) {
      qb.andWhere('aidRequest.beneficiaryId = :beneficiaryId', {
        beneficiaryId: query.beneficiaryId,
      });
    }

    if (query.status) {
      qb.andWhere('aidRequest.status = :status', {
        status: query.status,
      });
    }

    qb.orderBy('aidRequest.createdAt', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit };
  }

  async updateStatus(id: string, dto: UpdateAidRequestStatusDto): Promise<AidRequest> {
    const aidRequest = await this.aidRequestRepository.findOne({ where: { id } });

    if (!aidRequest) {
      throw new NotFoundException(`Aid request ${id} not found`);
    }

    const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[aidRequest.status];
    if (!allowedNextStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${aidRequest.status} to ${dto.status}.`,
      );
    }

    aidRequest.status = dto.status;

    return this.aidRequestRepository.save(aidRequest);
  }
}
