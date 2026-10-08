import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MinioService.name);

  // 🔒 کلاینت داخلی — برای upload/delete (سریع، localhost)
  public client: Minio.Client;

  // 🌐 کلاینت عمومی — برای presigned URLs (دامنه واقعی)
  public publicClient: Minio.Client;

  private readonly bucket = 'documents';

  constructor(private readonly config: ConfigService) {
    // Internal client
    this.client = new Minio.Client({
      endPoint: this.config.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: this.config.get<number>('MINIO_PORT', 9000),
      useSSL: this.config.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get<string>('MINIO_ROOT_USER'),
      secretKey: this.config.get<string>('MINIO_ROOT_PASSWORD'),
    });

    // Public client — uses public domain for presigned URLs
    const publicEndpoint = this.config.get<string>('MINIO_PUBLIC_ENDPOINT', 'zarvan.hitanetwork.com');
    const publicPort = this.config.get<number>('MINIO_PUBLIC_PORT', 443);
    const publicSSL = this.config.get<string>('MINIO_PUBLIC_USE_SSL', 'true') === 'true';

    this.publicClient = new Minio.Client({
      endPoint: publicEndpoint,
      port: publicPort,
      useSSL: publicSSL,
      accessKey: this.config.get<string>('MINIO_ROOT_USER'),
      secretKey: this.config.get<string>('MINIO_ROOT_PASSWORD'),
      pathStyle: true, // ← مهم: path-style URLs
    });

    this.logger.log(`📡 MinIO internal: ${this.config.get('MINIO_ENDPOINT')}:${this.config.get('MINIO_PORT')}`);
    this.logger.log(`🌐 MinIO public: ${publicEndpoint}:${publicPort} (SSL: ${publicSSL})`);
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
        this.logger.log(`✅ Bucket "${this.bucket}" created`);
      } else {
        this.logger.log(`✅ MinIO connected, bucket "${this.bucket}" exists`);
      }
    } catch (error) {
      this.logger.error('❌ Failed to connect to MinIO', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('🔌 MinIO connection closed');
  }

  // ============================================
  // Internal operations (localhost)
  // ============================================
  async uploadFile(
    key: string,
    buffer: Buffer,
    mimeType: string,
    size: number,
  ): Promise<{ etag: string; versionId: string | null }> {
    const result = await this.client.putObject(
      this.bucket,
      key,
      buffer,
      size,
      { 'Content-Type': mimeType },
    );
    this.logger.log(`✅ File uploaded: ${key} (${size} bytes)`);
    return {
      etag: result.etag,
      versionId: result.versionId || null,
    };
  }

  async getFile(key: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, key);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
    this.logger.log(`🗑️ File deleted: ${key}`);
  }

  // ============================================
  // Public operations (presigned URLs with public domain)
  // ============================================
  async getPresignedUrl(key: string, expirySeconds = 3600): Promise<string> {
    // 🔥 از publicClient استفاده می‌کنیم تا URL با دامنه عمومی امضا شود
    return this.publicClient.presignedGetObject(
      this.bucket,
      key,
      expirySeconds,
    );
  }

  async getPresignedUrlWithHeaders(
    key: string,
    expirySeconds = 3600,
    headers: Record<string, string> = {},
  ): Promise<string> {
    return this.publicClient.presignedGetObject(
      this.bucket,
      key,
      expirySeconds,
      headers,
    );
  }

  async getPresignedUploadUrl(key: string, expirySeconds = 3600): Promise<string> {
    return this.publicClient.presignedPutObject(
      this.bucket,
      key,
      expirySeconds,
    );
  }

  async getObjectStream(storageKey: string): Promise<any> {
    return await this.client.getObject(this.bucket, storageKey);
  }

  async removeFile(storageKey: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, storageKey);
      this.logger.log(`MinIO removed: ${storageKey}`);
    } catch (e: any) {
      this.logger.error(`MinIO remove failed for ${storageKey}: ${e.message}`);
    }
  }
}
