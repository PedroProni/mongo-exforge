import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateBucketCommand, DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { StoragePort } from '@domain/ports/storage.port';
import { DownloadLinkInput } from '@domain/types/download-link-input.type';
import { S3Config } from '@domain/types/s3-config.type';
import { UploadInput } from '@domain/types/upload-input.type';

const MULTIPART_PART_SIZE = 8 * 1024 * 1024;
const MULTIPART_QUEUE_SIZE = 2;

@Injectable()
export class S3StorageAdapter implements StoragePort, OnModuleInit {
  private readonly logger = new Logger(S3StorageAdapter.name);
  private readonly config: S3Config;
  private readonly client: S3Client;
  private readonly presignClient: S3Client;

  constructor(envConfigService: EnvConfigService) {
    this.config = envConfigService.getS3Config();
    const credentials = { accessKeyId: this.config.access_key_id, secretAccessKey: this.config.secret_access_key };
    this.client = new S3Client({ endpoint: this.config.endpoint, region: this.config.region, forcePathStyle: this.config.force_path_style, credentials });
    this.presignClient = new S3Client({ endpoint: this.config.public_endpoint, region: this.config.region, forcePathStyle: this.config.force_path_style, credentials });
  }

  async onModuleInit(): Promise<void> {
    if (!this.config.auto_create_bucket) return;
    try {
      await this.ping();
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.config.bucket }));
      this.logger.log(`Created bucket ${this.config.bucket}`);
    }
  }

  async upload(input: UploadInput): Promise<void> {
    const upload = new Upload({
      client: this.client,
      params: { Bucket: this.config.bucket, Key: input.key, Body: input.body, ContentType: input.content_type },
      partSize: MULTIPART_PART_SIZE,
      queueSize: MULTIPART_QUEUE_SIZE,
      leavePartsOnError: false,
    });
    input.body.once('error', () => void upload.abort());
    await upload.done();
  }

  createDownloadUrl(input: DownloadLinkInput): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.config.bucket, Key: input.key, ResponseContentDisposition: `attachment; filename="${input.filename}"` });
    return getSignedUrl(this.presignClient, command, { expiresIn: input.ttl_seconds });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
  }

  async ping(): Promise<void> {
    await this.client.send(new HeadBucketCommand({ Bucket: this.config.bucket }));
  }
}
