import { Module } from '@nestjs/common';
import { IUserRepository } from './core/ports/user.repository';
import { DrizzleUserRepository } from './infra/database/drizzle-user.repository';
import { DatabaseModule } from '@infra/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: IUserRepository,
      useClass: DrizzleUserRepository,
    },
  ],
  exports: [IUserRepository],
})
export class UsersModule {}
