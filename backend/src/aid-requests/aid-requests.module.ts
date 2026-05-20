import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AidRequest } from './aid-request.entity';
import { AidRequestsController } from './aid-requests.controller';
import { AidRequestsService } from './aid-requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([AidRequest])],
  controllers: [AidRequestsController],
  providers: [AidRequestsService],
})
export class AidRequestsModule {}
