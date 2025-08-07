import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { S3Service } from 'src/Utils/S3Service.service';
import { UserRole } from 'src/user_roles/entities/user_role.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, Tenant])],
  providers: [UsersService, S3Service],
  controllers: [UsersController],
})
export class UsersModule {}
