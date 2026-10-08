import {
  Controller, Get, Post, Delete, Param, UseGuards, Req,
  Query, UploadedFile, UseInterceptors, HttpCode, HttpStatus,
  Body, BadRequestException, Res, ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 },
  }))
  upload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
    @Body('name') name?: string,
    @Body('expiresAt') expiresAt?: string,
  ) {
    if (!type) throw new BadRequestException('نوع سند الزامی است');
    return this.documents.upload(req.user.userId, file, type, name, expiresAt);
  }

  @Get()
  findAll(@Req() req: any, @Query('type') type?: string) {
    return this.documents.findAll(req.user.userId, { type });
  }

  @Get('stats')
  getStats(@Req() req: any) {
    return this.documents.getStats(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.documents.findOne(req.user.userId, id);
  }

  @Get(':id/stream')
  async stream(@Req() req: any, @Param('id', new ParseUUIDPipe()) id: string, @Res() res: any) {
    const file = await this.documents.stream(req.user.userId, id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.size);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(file.name)}"`,
    );
    file.stream.pipe(res);
  }

  @Get(':id/download')
  getDownloadUrl(
    @Req() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('inline') inline?: string,
  ) {
    return this.documents.getDownloadUrl(req.user.userId, id, inline === 'true');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Req() req: any, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.documents.remove(req.user.userId, id);
  }
}
