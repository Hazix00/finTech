import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AidRequest } from './aid-request.entity';
import { AidRequestsService } from './aid-requests.service';
import { CreateAidRequestDto } from './dto/create-aid-request.dto';
import { ListAidRequestsQueryDto } from './dto/list-aid-requests-query.dto';
import { UpdateAidRequestStatusDto } from './dto/update-aid-request-status.dto';

@ApiTags('aid-requests')
@Controller('aid-requests')
export class AidRequestsController {
  constructor(private readonly aidRequestsService: AidRequestsService) {}

  @Post()
  create(@Body() dto: CreateAidRequestDto): Promise<AidRequest> {
    return this.aidRequestsService.create(dto);
  }

  @Get()
  list(@Query() query: ListAidRequestsQueryDto): Promise<{
    items: AidRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.aidRequestsService.list(query);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAidRequestStatusDto,
  ): Promise<AidRequest> {
    return this.aidRequestsService.updateStatus(id, dto);
  }
}
