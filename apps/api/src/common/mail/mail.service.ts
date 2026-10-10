import { Injectable, Logger } from '@nestjs/common';
import { PlatformSettingsService } from '../settings/settings.service';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  fromName: string;
}

const FALLBACK_SMTP: SmtpConfig = {
  host: '',
  port: 587,
  secure: false,
  user: '',
  pass: '',
  from: '',
  fromName: 'راتایار',
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly settings: PlatformSettingsService) {}

  private async getSmtpConfig(): Promise<SmtpConfig> {
    const cfg = await this.settings.get<SmtpConfig>('smtp_config', FALLBACK_SMTP);
    return { ...FALLBACK_SMTP, ...cfg };
  }

  async isConfigured(): Promise<boolean> {
    const cfg = await this.getSmtpConfig();
    return !!(cfg.host && cfg.port && cfg.user && cfg.pass && cfg.from);
  }

  async isEnabled(): Promise<boolean> {
    return this.settings.get<boolean>('email_verification_enabled', false);
  }

  /**
   * Send an email using the SMTP config stored in PlatformSetting.
   * Returns { ok: true } on success, { ok: false, error } on failure.
   */
  async send(to: string, subject: string, html: string, text?: string) {
    const cfg = await this.getSmtpConfig();
    if (!cfg.host || !cfg.user || !cfg.pass || !cfg.from) {
      this.logger.warn('SMTP not configured — email skipped');
      return { ok: false, error: 'SMTP_NOT_CONFIGURED' };
    }

    try {
      // dynamic import so we don't crash if nodemailer is missing
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        auth: { user: cfg.user, pass: cfg.pass },
      });

      const info = await transporter.sendMail({
        from: `"${cfg.fromName}" <${cfg.from}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ' '),
      });

      this.logger.log(`✅ Email sent to ${to}: ${info.messageId}`);
      return { ok: true, messageId: info.messageId };
    } catch (e: any) {
      this.logger.error(`Email send failed to ${to}: ${e.message}`);
      return { ok: false, error: e.message };
    }
  }

  /**
   * Verify SMTP config by attempting a connection.
   */
  async verifyConfig(): Promise<{ ok: boolean; error?: string }> {
    const cfg = await this.getSmtpConfig();
    if (!cfg.host || !cfg.user || !cfg.pass) {
      return { ok: false, error: 'SMTP_NOT_CONFIGURED' };
    }
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        auth: { user: cfg.user, pass: cfg.pass },
      });
      await transporter.verify();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }
}
