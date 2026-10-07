import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

// ============================================
// LATEST TERMS VERSION
// آپدیت این مقدار، کاربران را مجبور به پذیرش مجدد می‌کند
// ============================================
export const CURRENT_TERMS_VERSION = '1.0';

export const TERMS_TEXT = `قرارداد کاربری پلتفرم راتایار

با استفاده از پلتفرم راتایار، شما به عنوان کاربر، متعهد می‌شوید که:

۱. مسئولیت کامل محتوای آپلودشده (تصاویر، اسناد، فایل‌ها) به عهده شماست.

۲. آپلود هرگونه محتوای مستهجن، غیراخلاقی، غیرقانونی، توهین‌آمیز یا ناقض حقوق دیگران اکیداً ممنوع است.

۳. حق کپی‌رایت و مالکیت معنوی تمام فایل‌های آپلودشده متعلق به شما یا دارای مجوز قانونی است.

۴. پلتفرم راتایار تنها یک بستر ذخیره‌سازی است و هیچ‌گونه مسئولیتی در قبال محتوای آپلودشده توسط کاربران ندارد.

۵. در صورت تخلف از این قوانین، پلتفرم حق حذف حساب کاربری و گزارش به مراجع قانونی را دارد.

۶. تمام اطلاعات شما به صورت رمزنگاری‌شده ذخیره می‌شود و دسترسی اشخاص ثالث به آن ممنوع است.

۷. مسئولیت هرگونه سوءاستفاده از اطلاعات توسط خود کاربر بر عهده اوست.

۸. راتایار حق تغییر این قوانین را در هر زمان محفوظ می‌دارد و کاربران موظف به پذیرش نسخه جدید هستند.

با امضای الکترونیکی این قرارداد، شما تمامی شرایط فوق را پذیرفته‌اید.`;

@Injectable()
export class TermsService {
  private readonly logger = new Logger(TermsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getTerms() {
    return {
      version: CURRENT_TERMS_VERSION,
      text: TERMS_TEXT,
    };
  }

  async acceptTerms(userId: string, version: string) {
    if (version !== CURRENT_TERMS_VERSION) {
      throw new BadRequestException('نسخه قرارداد نامعتبر است');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        termsAcceptedAt: new Date(),
        termsVersion: version,
      },
    });

    this.logger.log(`✅ Terms accepted by ${userId} (v${version})`);
    return { success: true, version };
  }

  async checkTerms(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { termsAcceptedAt: true, termsVersion: true },
    });

    return {
      accepted: !!user?.termsAcceptedAt,
      acceptedAt: user?.termsAcceptedAt,
      acceptedVersion: user?.termsVersion,
      currentVersion: CURRENT_TERMS_VERSION,
      needsUpdate: user?.termsVersion !== CURRENT_TERMS_VERSION,
    };
  }
}
