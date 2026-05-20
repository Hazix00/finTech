import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AidRequestStatus } from '../aid-request.entity';

export class UpdateAidRequestStatusDto {
  @ApiProperty({ enum: AidRequestStatus })
  @IsEnum(AidRequestStatus, {
    message: 'status must be one of PENDING, UNDER_REVIEW, APPROVED or REJECTED.',
  })
  status!: AidRequestStatus;
}
