import {
  Injectable, NotFoundException, ForbiddenException,
  ConflictException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class FamilyService {
  private readonly logger = new Logger(FamilyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ============================================
  // Create Family
  // ============================================
  async createFamily(userId: string, dto: CreateFamilyDto) {
    // Check if user already owns a family
    const existing = await this.prisma.family.findFirst({
      where: { ownerId: userId, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('شما قبلاً یک خانواده ساخته‌اید');
    }

    const family = await this.prisma.family.create({
      data: {
        name: dto.name,
        ownerId: userId,
        plan: dto.plan || 'free',
        maxMembers: dto.plan === 'family' ? 6 : dto.plan === 'business' ? 10 : 2,
      },
    });

    // Add owner as member
    await this.prisma.familyMember.create({
      data: {
        familyId: family.id,
        userId,
        role: 'owner',
        relation: 'self',
      },
    });

    this.logger.log(`✅ Family created: ${family.name}`);
    return this.getFamilyWithMembers(userId, family.id);
  }

  // ============================================
  // Get My Family
  // ============================================
  async getMyFamily(userId: string) {
    const member = await this.prisma.familyMember.findFirst({
      where: { userId },
      include: { family: true },
    });

    if (!member || member.family.deletedAt) {
      return null;
    }

    return this.getFamilyWithMembers(userId, member.familyId);
  }

  // ============================================
  // Get Family With Members
  // ============================================
  async getFamilyWithMembers(userId: string, familyId: string) {
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                fullName: true,
                birthDate: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!family || family.deletedAt) {
      throw new NotFoundException('خانواده یافت نشد');
    }

    // Check access
    const isMember = family.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('شما عضو این خانواده نیستید');
    }

    return family;
  }

  // ============================================
  // Invite Member
  // ============================================
  async inviteMember(userId: string, dto: InviteMemberDto) {
    const family = await this.prisma.family.findFirst({
      where: { ownerId: userId, deletedAt: null },
    });

    if (!family) {
      // Check if user is admin of a family
      const membership = await this.prisma.familyMember.findFirst({
        where: { userId, role: 'admin' },
        include: { family: true },
      });
      if (!membership) {
        throw new ForbiddenException('فقط مالک یا مدیر می‌تواند دعوت کند');
      }
      return this.doInvite(membership.familyId, userId, dto);
    }

    return this.doInvite(family.id, userId, dto);
  }

  private async doInvite(familyId: string, inviterId: string, dto: InviteMemberDto) {
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      include: { members: true },
    });

    if (!family) throw new NotFoundException('خانواده یافت نشد');

    // Check member limit
    if (family.members.length >= family.maxMembers) {
      throw new BadRequestException('ظرفیت خانواده پر است. ارتقا دهید');
    }

    // Check if user is already a member
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existingUser) {
      const alreadyMember = family.members.some((m) => m.userId === existingUser.id);
      if (alreadyMember) {
        throw new ConflictException('این کاربر قبلاً عضو خانواده است');
      }
    }

    // Generate unique invite code
    const code = this.generateInviteCode();

    // Store invite in Redis (7 days)
    const inviteData = {
      code,
      familyId,
      inviterId,
      phone: dto.phone,
      role: dto.role || 'member',
      relation: dto.relation,
      createdAt: new Date().toISOString(),
    };

    await this.redis.set(
      `invite:${code}`,
      JSON.stringify(inviteData),
      7 * 24 * 60 * 60,
    );

    // Also store by phone for quick lookup
    await this.redis.set(
      `invite:phone:${dto.phone}`,
      code,
      7 * 24 * 60 * 60,
    );

    this.logger.log(`✅ Invite created: ${code} for ${dto.phone}`);

    return {
      success: true,
      code,
      message: 'دعوت‌نامه ساخته شد',
      expiresIn: '7 روز',
      inviteLink: `https://zarvan.hitanetwork.com/join/${code}`,
    };
  }

  // ============================================
  // Accept Invite
  // ============================================
  async acceptInvite(userId: string, code: string) {
    const inviteJson = await this.redis.get(`invite:${code}`);

    if (!inviteJson) {
      throw new NotFoundException('دعوت‌نامه یافت نشد یا منقضی شده');
    }

    const invite = JSON.parse(inviteJson);

    // Check if user already member
    const existing = await this.prisma.familyMember.findFirst({
      where: { userId, familyId: invite.familyId },
    });

    if (existing) {
      throw new ConflictException('شما قبلاً عضو این خانواده هستید');
    }

    // Check member limit
    const memberCount = await this.prisma.familyMember.count({
      where: { familyId: invite.familyId },
    });

    const family = await this.prisma.family.findUnique({
      where: { id: invite.familyId },
    });

    if (!family) throw new NotFoundException('خانواده یافت نشد');

    if (memberCount >= family.maxMembers) {
      throw new BadRequestException('ظرفیت خانواده پر است');
    }

    // Add as member
    await this.prisma.familyMember.create({
      data: {
        familyId: invite.familyId,
        userId,
        role: invite.role,
        relation: invite.relation,
      },
    });

    // Delete invite
    await this.redis.del(`invite:${code}`);
    await this.redis.del(`invite:phone:${invite.phone}`);

    this.logger.log(`✅ User ${userId} joined family ${invite.familyId}`);

    return {
      success: true,
      message: 'با موفقیت به خانواده پیوستید',
      familyId: invite.familyId,
    };
  }

  // ============================================
  // Remove Member
  // ============================================
  async removeMember(userId: string, memberId: string) {
    // Check if user is owner
    const family = await this.prisma.family.findFirst({
      where: { ownerId: userId, deletedAt: null },
    });

    if (!family) {
      throw new ForbiddenException('فقط مالک می‌تواند عضو حذف کند');
    }

    const member = await this.prisma.familyMember.findFirst({
      where: { id: memberId, familyId: family.id },
    });

    if (!member) {
      throw new NotFoundException('عضو یافت نشد');
    }

    if (member.userId === userId) {
      throw new BadRequestException('مالک نمی‌تواند خودش را حذف کند');
    }

    await this.prisma.familyMember.delete({ where: { id: memberId } });

    this.logger.log(`✅ Member removed: ${memberId}`);

    return { success: true, message: 'عضو حذف شد' };
  }

  // ============================================
  // Update Member
  // ============================================
  async updateMember(userId: string, memberId: string, dto: UpdateMemberDto) {
    const family = await this.prisma.family.findFirst({
      where: { ownerId: userId, deletedAt: null },
    });

    if (!family) {
      throw new ForbiddenException('فقط مالک می‌تواند نقش عضو را تغییر دهد');
    }

    const member = await this.prisma.familyMember.findFirst({
      where: { id: memberId, familyId: family.id },
    });

    if (!member) throw new NotFoundException('عضو یافت نشد');

    const updated = await this.prisma.familyMember.update({
      where: { id: memberId },
      data: dto,
    });

    return updated;
  }

  // ============================================
  // Delete Family
  // ============================================
  async deleteFamily(userId: string) {
    const family = await this.prisma.family.findFirst({
      where: { ownerId: userId, deletedAt: null },
    });

    if (!family) throw new NotFoundException('خانواده یافت نشد');

    await this.prisma.family.update({
      where: { id: family.id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'خانواده حذف شد' };
  }


  // ============================================
  // Get Family Tree (for visualization)
  // ============================================
  async getTree(userId: string) {
    const member = await this.prisma.familyMember.findFirst({
      where: { userId },
      include: { family: true },
    });

    if (!member || member.family.deletedAt) {
      throw new NotFoundException('خانواده یافت نشد');
    }

    const family = await this.prisma.family.findUnique({
      where: { id: member.familyId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                fullName: true,
                birthDate: true,
              },
            },
          },
        },
      },
    });

    if (!family) throw new NotFoundException('خانواده یافت نشد');

    // Build tree structure
    const members = family.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user?.fullName || 'کاربر',
      phone: m.user?.phone,
      birthDate: m.user?.birthDate,
      role: m.role,
      relation: m.relation,
      joinedAt: m.joinedAt,
      isOwner: m.userId === family.ownerId,
    }));

    // Organize by relation
    const owner = members.find((m) => m.isOwner);
    const spouse = members.find((m) => m.relation === 'spouse');
    const children = members.filter((m) => m.relation === 'child');
    const parents = members.filter((m) => m.relation === 'parent');
    const siblings = members.filter((m) => m.relation === 'sibling');
    const others = members.filter(
      (m) =>
        !m.isOwner &&
        m.relation !== 'spouse' &&
        m.relation !== 'child' &&
        m.relation !== 'parent' &&
        m.relation !== 'sibling',
    );

    return {
      familyId: family.id,
      familyName: family.name,
      owner,
      spouse: spouse || null,
      children,
      parents,
      siblings,
      others,
      totalMembers: members.length,
      maxMembers: family.maxMembers,
    };
  }

  // ============================================
  // Helper: Generate Invite Code
  // ============================================
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'RTY-';
    const bytes = randomBytes(8);
    for (let i = 0; i < 8; i++) {
      code += chars[bytes[i] % chars.length];
      if (i === 3) code += '-';
    }
    return code;
  }
}
