import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async query(
    @Req() req: any,
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.search(
      req.user.userId,
      q || '',
      limit ? parseInt(limit) : 20,
    );
  }
}
