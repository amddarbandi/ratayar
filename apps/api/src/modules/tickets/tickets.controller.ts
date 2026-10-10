import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TicketsService } from './tickets.service';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  // ───────── User endpoints ─────────

  @Post()
  create(
    @Req() req: any,
    @Body('subject') subject: string,
    @Body('category') category: string,
    @Body('priority') priority: string,
    @Body('body') body: string,
  ) {
    if (!subject || !body) {
      throw new BadRequestException('موضوع و متن الزامی است');
    }
    return this.tickets.create(
      req.user.userId,
      subject,
      category || 'other',
      priority || 'normal',
      body,
    );
  }

  @Get('me')
  listMine(@Req() req: any) {
    return this.tickets.listMine(req.user.userId);
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id', new ParseUUIDPipe()) id: string) {
    const isAdmin = req.user.role === 'admin';
    return this.tickets.getOne(req.user.userId, id, isAdmin);
  }

  @Post(':id/messages')
  addMessage(
    @Req() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('body') body: string,
  ) {
    if (!body) throw new BadRequestException('متن پیام الزامی است');
    const isAdmin = req.user.role === 'admin';
    return this.tickets.addMessage(req.user.userId, id, body, isAdmin);
  }

  // ───────── Admin endpoints ─────────

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  adminListAll(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('unassigned') unassigned?: string,
    @Query('limit') limit?: string,
  ) {
    const resolvedAssignedTo =
      assignedTo === 'me' ? req.user.userId : assignedTo || undefined;
    return this.tickets.adminListAll({
      status,
      assignedTo: resolvedAssignedTo,
      unassigned: unassigned === 'true',
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('admin/:id/messages')
  @UseGuards(RolesGuard)
  @Roles('admin')
  adminAddMessage(
    @Req() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('body') body: string,
  ) {
    if (!body) throw new BadRequestException('متن پیام الزامی است');
    return this.tickets.addMessage(req.user.userId, id, body, true);
  }

  @Patch('admin/:id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  adminSetStatus(
    @Req() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('status') status: string,
    @Body('note') note?: string,
  ) {
    if (!status) throw new BadRequestException('وضعیت الزامی است');
    return this.tickets.adminSetStatus(id, status, req.user.userId, note);
  }

  // ═══════════════════════════════════════════
  // Assignment
  // ═══════════════════════════════════════════
  @Get('admin/admins')
  @UseGuards(RolesGuard)
  @Roles('admin')
  adminListAdmins() {
    return this.tickets.adminListAdmins();
  }

  @Patch('admin/:id/assign')
  @UseGuards(RolesGuard)
  @Roles('admin')
  adminAssign(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('assigneeId') assigneeId: string | null,
  ) {
    return this.tickets.adminAssign(id, assigneeId || null);
  }

  // ═══════════════════════════════════════════
  // Macros
  // ═══════════════════════════════════════════
  @Get('admin/macros')
  @UseGuards(RolesGuard)
  @Roles('admin')
  listMacros() {
    return this.tickets.listMacros();
  }

  @Post('admin/macros')
  @UseGuards(RolesGuard)
  @Roles('admin')
  createMacro(
    @Req() req: any,
    @Body('name') name: string,
    @Body('body') body: string,
    @Body('category') category: string,
  ) {
    return this.tickets.createMacro(name, body, category, req.user.userId);
  }

  @Patch('admin/macros/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateMacro(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: { name?: string; body?: string; category?: string },
  ) {
    return this.tickets.updateMacro(id, data);
  }

  @Delete('admin/macros/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  deleteMacro(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tickets.deleteMacro(id);
  }

}
