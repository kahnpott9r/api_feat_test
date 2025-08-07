import { Module } from '@nestjs/common';

import { UserRolesService } from './user_roles.service';
import { UserRolesController } from './user_roles.controller';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { UserRole } from './entities/user_role.entity';

@Module({
  controllers: [UserRolesController],
  providers: [UserRolesService],
  imports: [TypeOrmModule.forFeature([UserRole, Tenant, User])],
})
export class UserRolesModule {}
