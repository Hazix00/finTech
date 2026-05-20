import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { AidRequestStatus } from '../aid-request.entity';

export class ListAidRequestsQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'beneficiaryId must be a valid UUID v4.' })
  beneficiaryId?: string;

  @ApiPropertyOptional({ enum: AidRequestStatus })
  @IsOptional()
  @IsEnum(AidRequestStatus, { message: 'status must be one of PENDING, UNDER_REVIEW, APPROVED or REJECTED.' })
  status?: AidRequestStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer.' })
  @Min(1, { message: 'page must be greater than or equal to 1.' })
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer.' })
  @Min(1, { message: 'limit must be greater than or equal to 1.' })
  @Max(100, { message: 'limit must be lower than or equal to 100.' })
  limit?: number = 10;
}
