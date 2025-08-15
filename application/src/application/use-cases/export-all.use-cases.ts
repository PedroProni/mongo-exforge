// Job
import { CreateJobUseCase } from '@application/use-cases/job/create-job.use-case';
import { FindJobsUseCase } from '@application/use-cases/job/find-jobs.use.case';

// Mongo
import { SelectURIsUseCase } from '@application/use-cases/mongo/select-uris.use-case';

// Users
import { CreateUserUseCase } from '@application/use-cases/user/create-user.use-case';
import { FindUsersUseCase } from '@application/use-cases/user/find-users.use-case';
import { UpdateUserUseCase } from '@application/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '@application/use-cases/user/delete-user.use-case';
import { LoginUserUseCase } from '@application/use-cases/user/login-user.use-case';

// Adicione os exports necessários dentro deste array
export default [CreateJobUseCase, FindJobsUseCase, SelectURIsUseCase, CreateUserUseCase, FindUsersUseCase, UpdateUserUseCase, DeleteUserUseCase, LoginUserUseCase];
