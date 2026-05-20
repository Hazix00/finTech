import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { AidCategory } from '../aid-request.entity';

const MAX_ALLOWED_AMOUNT_EUR = 5000;

export class CreateAidRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'beneficiaryId must be a valid UUID v4.' })
  beneficiaryId!: string;

  @ApiProperty({ enum: AidCategory })
  @IsEnum(AidCategory, { message: 'category must be one of HOUSING, FOOD, HEALTH, ENERGY or OTHER.' })
  category!: AidCategory;

  @ApiProperty({ example: 150.0, minimum: 0.01, maximum: MAX_ALLOWED_AMOUNT_EUR })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'amount must be a valid number (EUR).' })
  @Min(0.01, { message: 'amount must be strictly positive.' })
  @Max(MAX_ALLOWED_AMOUNT_EUR, { message: `amount must be lower than or equal to ${MAX_ALLOWED_AMOUNT_EUR} EUR.` })
  amount!: number;

  @ApiProperty({ example: 'Temporary support needed for rent.' })
  @IsString({ message: 'description must be a string.' })
  @IsNotEmpty({ message: 'description cannot be empty.' })
  @MaxLength(2000, { message: 'description must be at most 2000 characters long.' })
  description!: string;
}
