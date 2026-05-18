import { Module } from '@nestjs/common';
import { IUserRepository } from './core/ports/user.repository';
import { DrizzleUserRepository } from './infra/database/drizzle-user.repository';
import { DatabaseModule } from '@infra/database/database.module';
import { StudentsController } from './api/controllers/students.controller';
import { TeachersController } from './api/controllers/teachers.controller';
import { CreateUserService } from './core/services/create-user.service';
import { GetUserService } from './core/services/get-user.service';
import { ListUsersService } from './core/services/list-users.service';
import { UpdateUserService } from './core/services/update-user.service';
import { DeleteUserService } from './core/services/delete-user.service';
import { IPasswordService } from '@modules/auth/core/ports/password.service';
import { BcryptPasswordService } from '@modules/auth/infra/adapters/bcrypt-password.service';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [StudentsController, TeachersController],
  providers: [
    CreateUserService,
    GetUserService,
    ListUsersService,
    UpdateUserService,
    DeleteUserService,
    RolesGuard,
    {
      provide: IUserRepository,
      useClass: DrizzleUserRepository,
    },
    {
      provide: IPasswordService,
      useClass: BcryptPasswordService,
    },
  ],
  exports: [IUserRepository],
})
export class UsersModule {}
