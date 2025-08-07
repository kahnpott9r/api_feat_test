import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UserRolesService } from './user_roles.service';
import { CreateUserRoleDto } from './dto/create-user_role.dto';
import { UpdateUserRoleDto } from './dto/update-user_role.dto';
import { ROLE, UserRole } from './entities/user_role.entity';
import MultiTenantGuard, {
  SECURITY,
  SECURITY_KEY,
} from 'src/auth/guards/multi-tenant.guard';
import { isAdmin } from '../Utils/utils';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

@ApiBearerAuth()
@ApiTags('User Roles')
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @UseGuards(
    MultiTenantGuard(Tenant, SECURITY.CHECK_BODY, SECURITY_KEY.TENANT_ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  create(@Body() createUserRoleDto: CreateUserRoleDto, @GetUser() user: User) {
    if (createUserRoleDto.role == ROLE.ADMIN && !isAdmin(user.user_roles)) {
      throw new ForbiddenException('You can not create user with this role');
    }

    return this.userRolesService.create(createUserRoleDto);
  }

  @Get(':id')
  @UseGuards(
    MultiTenantGuard(UserRole, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
      ROLE.USER,
    ]),
  )
  findOne(@Param('id') id: string) {
    return this.userRolesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(
    MultiTenantGuard(UserRole, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userRolesService.update(+id, updateUserRoleDto);
  }

  @Delete(':id')
  @UseGuards(
    MultiTenantGuard(UserRole, SECURITY.CHECK_PARAM, SECURITY_KEY.ID, [
      ROLE.ADMIN,
      ROLE.MANAGER,
    ]),
  )
  async remove(@Param('id') id: string, @GetUser() user: User) {
    const userRole = await this.userRolesService.findOne(+id);
    if (userRole.role == ROLE.ADMIN && !isAdmin(user.user_roles)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return this.userRolesService.remove(+id);
  }
}
