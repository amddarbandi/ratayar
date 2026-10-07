import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ObligationsService } from './obligations.service';
import { CreateObligationDto } from './dto/create-obligation.dto';
import { UpdateObligationDto } from './dto/update-obligation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('obligations')
@Controller('obligations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ObligationsController {
  constructor(private readonly obligationsService: ObligationsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateObligationDto) {
    return this.obligationsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    return this.obligationsService.findAll(req.user.userId, { status, category });
  }

  @Get('today')
  getToday(@Req() req: any) {
    return this.obligationsService.getToday(req.user.userId);
  }

  @Get('upcoming')
  getUpcoming(@Req() req: any, @Query('days') days?: string) {
    return this.obligationsService.getUpcoming(req.user.userId, days ? parseInt(days) : 30);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.obligationsService.getStats(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.obligationsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateObligationDto) {
    return this.obligationsService.update(req.user.userId, id, dto);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  complete(@Req() req: any, @Param('id') id: string) {
    return this.obligationsService.complete(req.user.userId, id);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.obligationsService.remove(req.user.userId, id);
  }
}
