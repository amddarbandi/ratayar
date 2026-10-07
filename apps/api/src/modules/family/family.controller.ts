import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('family')
@Controller('family')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateFamilyDto) {
    return this.familyService.createFamily(req.user.userId, dto);
  }

  @Get('me')
  getMy(@Req() req: any) {
    return this.familyService.getMyFamily(req.user.userId);
  }

  @Get('tree')
  getTree(@Req() req: any) {
    return this.familyService.getTree(req.user.userId);
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    return this.familyService.getFamilyWithMembers(req.user.userId, id);
  }

  @Post('invite')
  invite(@Req() req: any, @Body() dto: InviteMemberDto) {
    return this.familyService.inviteMember(req.user.userId, dto);
  }

  @Post('accept/:code')
  @HttpCode(HttpStatus.OK)
  accept(@Req() req: any, @Param('code') code: string) {
    return this.familyService.acceptInvite(req.user.userId, code);
  }

  @Patch('members/:id')
  updateMember(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.familyService.updateMember(req.user.userId, id, dto);
  }

  @Delete('members/:id')
  @HttpCode(HttpStatus.OK)
  removeMember(@Req() req: any, @Param('id') id: string) {
    return this.familyService.removeMember(req.user.userId, id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  delete(@Req() req: any) {
    return this.familyService.deleteFamily(req.user.userId);
  }
}
