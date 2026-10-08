import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('receipt', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @Req() req: any,
    @UploadedFile() receipt: Express.Multer.File,
    @Body('planId') planId: string,
    @Body('months') months?: string,
    @Body('trackingCode') trackingCode?: string,
  ) {
    if (!planId) throw new BadRequestException('planId الزامی است');
    return this.payments.create(
      req.user.userId,
      receipt,
      planId,
      months ? parseInt(months, 10) : 1,
      trackingCode,
    );
  }

  @Get('me')
  listMine(@Req() req: any) {
    return this.payments.listMine(req.user.userId);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  listAll(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.payments.listAll({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('admin/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  approve(
    @Req() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('adminNote') adminNote?: string,
  ) {
    return this.payments.approve(req.user.userId, id, adminNote);
  }

  @Post('admin/:id/reject')
  @UseGuards(RolesGuard)
  @Roles('admin')
  reject(
    @Req() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('adminNote') adminNote?: string,
  ) {
    return this.payments.reject(req.user.userId, id, adminNote);
  }
}
