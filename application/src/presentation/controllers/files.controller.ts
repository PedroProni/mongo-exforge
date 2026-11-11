import { Controller, Get, Inject, NotFoundException, Param, StreamableFile } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from '@infrastructure/auth/decorators/public.decorator';
import { LocalStorageAdapter } from '@infrastructure/storage/local-storage.adapter';
import { LOCAL_FILES_ROUTE } from '@domain/constants/local-storage.constant';
import { EXPORT_CONTENT_TYPES } from '@domain/constants/export.constant';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { StoragePort } from '@domain/ports/storage.port';
import { STORAGE_INJECT_TOKEN } from '@domain/constants/inject.constant';

@ApiExcludeController()
@Controller(LOCAL_FILES_ROUTE)
export class FilesController {
  constructor(@Inject(STORAGE_INJECT_TOKEN) private readonly storage: StoragePort) {}

  @Public()
  @Get(':token')
  async download(@Param('token') token: string): Promise<StreamableFile> {
    if (!(this.storage instanceof LocalStorageAdapter)) throw new NotFoundException();
    const file = await this.storage.open(token);
    if (!file) throw new NotFoundException();
    const format = file.key.split('.').pop() as ExportFormat;
    return new StreamableFile(file.stream, { type: EXPORT_CONTENT_TYPES[format] ?? 'application/octet-stream', length: file.size, disposition: `attachment; filename="${file.filename}"` });
  }
}
