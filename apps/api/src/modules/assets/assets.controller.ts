import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('assets')
@Controller('assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateAssetDto) {
    return this.assetsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.assetsService.findAll(req.user.userId, { type, status });
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.assetsService.getStats(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.assetsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.assetsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.assetsService.remove(req.user.userId, id);
  }
}
