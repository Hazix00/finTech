import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AidCategory {
  HOUSING = 'HOUSING',
  FOOD = 'FOOD',
  HEALTH = 'HEALTH',
  ENERGY = 'ENERGY',
  OTHER = 'OTHER',
}

export enum AidRequestStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('aid_requests')
export class AidRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  beneficiaryId!: string;

  @Column({ type: 'enum', enum: AidCategory })
  category!: AidCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: AidRequestStatus, default: AidRequestStatus.PENDING })
  status!: AidRequestStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
