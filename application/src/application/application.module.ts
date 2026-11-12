import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { QueueModule } from '@infrastructure/queue/queue.module';
import { StorageModule } from '@infrastructure/storage/storage.module';
import { EncryptionService } from '@application/services/encryption.service';
import { ExportStreamService } from '@application/services/export-stream.service';
import { CleanupExpiredExportsUseCase } from '@application/use-cases/job/cleanup-expired-exports.use-case';
import { CreateJobUseCase } from '@application/use-cases/job/create-job.use-case';
import { CreateConnectionUseCase } from '@application/use-cases/connection/create-connection.use-case';
import { DeleteConnectionUseCase } from '@application/use-cases/connection/delete-connection.use-case';
import { InspectConnectionUseCase } from '@application/use-cases/connection/inspect-connection.use-case';
import { ListConnectionsUseCase } from '@application/use-cases/connection/list-connections.use-case';
import { RerunJobUseCase } from '@application/use-cases/job/rerun-job.use-case';
import { GetDashboardUseCase } from '@application/use-cases/dashboard/get-dashboard.use-case';
import { PreviewSourceUseCase } from '@application/use-cases/mongo/preview-source.use-case';
import { CreateTemplateUseCase } from '@application/use-cases/template/create-template.use-case';
import { CreateTemplateFromJobUseCase } from '@application/use-cases/template/create-template-from-job.use-case';
import { DeleteTemplateUseCase } from '@application/use-cases/template/delete-template.use-case';
import { ListTemplatesUseCase } from '@application/use-cases/template/list-templates.use-case';
import { RenameTemplateUseCase } from '@application/use-cases/template/rename-template.use-case';
import { RunTemplateUseCase } from '@application/use-cases/template/run-template.use-case';
import { JobInputResolverService } from '@application/services/job-input-resolver.service';
import { SourceGroupService } from '@application/services/source-group.service';
import { StoredInputService } from '@application/services/stored-input.service';
import { DeleteJobUseCase } from '@application/use-cases/job/delete-job.use-case';
import { ChangePasswordUseCase } from '@application/use-cases/user/change-password.use-case';
import { DownloadJobUseCase } from '@application/use-cases/job/download-job.use-case';
import { FindJobUseCase } from '@application/use-cases/job/find-job.use-case';
import { FindJobsUseCase } from '@application/use-cases/job/find-jobs.use-case';
import { RunExportUseCase } from '@application/use-cases/job/run-export.use-case';
import { InspectSourcesUseCase } from '@application/use-cases/mongo/inspect-sources.use-case';
import { CreateUserUseCase } from '@application/use-cases/user/create-user.use-case';
import { DeleteMeUseCase } from '@application/use-cases/user/delete-me.use-case';
import { GetMeUseCase } from '@application/use-cases/user/get-me.use-case';
import { LoginUserUseCase } from '@application/use-cases/user/login-user.use-case';
import { UpdateMeUseCase } from '@application/use-cases/user/update-me.use-case';

const use_cases = [
  CreateJobUseCase,
  FindJobsUseCase,
  FindJobUseCase,
  DownloadJobUseCase,
  DeleteJobUseCase,
  RerunJobUseCase,
  GetDashboardUseCase,
  PreviewSourceUseCase,
  CreateTemplateUseCase,
  CreateTemplateFromJobUseCase,
  DeleteTemplateUseCase,
  ListTemplatesUseCase,
  RenameTemplateUseCase,
  RunTemplateUseCase,
  CreateConnectionUseCase,
  ListConnectionsUseCase,
  DeleteConnectionUseCase,
  InspectConnectionUseCase,
  ChangePasswordUseCase,
  RunExportUseCase,
  CleanupExpiredExportsUseCase,
  InspectSourcesUseCase,
  CreateUserUseCase,
  LoginUserUseCase,
  GetMeUseCase,
  UpdateMeUseCase,
  DeleteMeUseCase,
];

@Module({
  imports: [DatabaseModule, QueueModule, StorageModule],
  providers: [...use_cases, EncryptionService, ExportStreamService, JobInputResolverService, SourceGroupService, StoredInputService],
  exports: [...use_cases],
})
export class ApplicationModule {}
