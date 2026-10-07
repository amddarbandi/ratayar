import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TermsService } from './terms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('terms')
@Controller('terms')
export class TermsController {
  constructor(private readonly terms: TermsService) {}

  @Get()
  getTerms() {
    return this.terms.getTerms();
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  acceptTerms(@Req() req: any, @Body('version') version: string) {
    return this.terms.acceptTerms(req.user.userId, version);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  checkTerms(@Req() req: any) {
    return this.terms.checkTerms(req.user.userId);
  }
}
